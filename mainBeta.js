/* ═══════════════════════════════════════════════════════
   UNDER-PRESSURE · MAIN v5.1
   ─────────────────────────────────────────────────────
   · Sistema de jogador com persistência (localStorage)
   · Pódio global e histórico de jogos
   · Restauração de sessão interrompida
   · Timer opcional por rodada (90s)
   · Glossário com 20 termos de gestão
   · Benchmarks de mercado nos indicadores
   · Memória narrativa (referências a decisões passadas)
   · Painel de recomendações dinâmicas
   · Modo revisão pós-jogo com decisões cruciais
   · Tela de jogo em 3 abas: HISTÓRIA · DESAFIOS · HISTÓRICO
═══════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════
   PERSISTÊNCIA
════════════════════════════════════════════════════ */
const LS = {
  get:    k      => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set:    (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  remove: k      => { try { localStorage.removeItem(k); } catch {} },
};
const SK = {
  PLAYER:"gsp_player", PODIO:"gsp_podio",
  HISTORICO:"gsp_historico", HIST_GUEST:"gsp_historico_guest",
  SESSION:"gsp_session", SETTINGS:"gsp_settings",
  SALA:"gsp_sala",        // { codigo, nome, modoSetor, setorFixo, ... }
  INTROS_USADAS:"gsp_intros_usadas", // { sector: [indices ja jogados], situacoes: [indices usados] }
};

/* ════════════════════════════════════════════════════
   ESTADO LOCAL
════════════════════════════════════════════════════ */
let _player   = null;
let _isAdmin  = false;
let _settings = { timer: false, cloudStatus: false, mostrarStatus: false };
let _setorSelecionado = null;
let _escolhaFeita     = false;
let _feedbackCallback = null;
let _timerInterval    = null;
// _manutencaoInterval → maintenance.js
// _globalPollInterval → maintenance.js
// _guestPollInterval → maintenance.js
let _ultimaMensagemGlobal = '';
let _timerSegs        = 0;
let _bloqueioAte      = 0; // timestamp — bloqueia escolher() durante transições
let _prevIndicators   = {}; // track trends
// BUG #1 FIX: hook called by engine.iniciar() to seed prev state before first render
window._initPrevIndicators = (indicators) => { _prevIndicators = { ...indicators }; };
let _sala             = null; // sala ativa: { codigo, nome, ... } | null

/* ════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════ */
function _setFirebaseStatus(estado, pingMs) {
  // estados: 'connecting' | 'online' | 'offline'
  const statusEl = document.getElementById('firebase-status');
  const dot      = document.getElementById('firebase-status-dot');
  const label    = document.getElementById('firebase-status-label');
  const ping     = document.getElementById('firebase-ping');
  if (!dot || !label) return;

  // SEMPRE atualiza a classe do dot — é a fonte de verdade do estado atual.
  // Sem isso, quando o toggle ativa depois, lê 'connecting' (valor inicial do HTML)
  // em vez do estado real.
  dot.className = 'firebase-dot firebase-dot--' + estado;

  const mostrar = _settings.mostrarStatus === true;

  // OFFLINE: sempre mostra, ignora configuração
  if (estado === 'offline') {
    if (statusEl) statusEl.style.display = '';
    label.textContent = 'Offline';
    label.style.color = '#ef4444';
    if (ping) { ping.style.display = 'none'; ping.textContent = ''; }
    return;
  }

  // ONLINE/CONNECTING: esconde se configuração estiver desativada
  if (!mostrar) {
    if (statusEl) statusEl.style.display = 'none';
    return;
  }

  // Configuração ativa — exibe normalmente
  if (statusEl) statusEl.style.display = '';

  if (estado === 'online') {
    label.textContent = 'Online';
    label.style.color = '#22c55e';
    if (ping) {
      ping.style.display = 'inline';
      ping.textContent   = pingMs != null ? pingMs + 'ms' : '';
      ping.style.color   =
        pingMs == null ? 'var(--t3)' :
        pingMs < 120   ? '#22c55e'   :
        pingMs < 350   ? '#f59e0b'   : '#ef4444';
    }
  } else {
    // connecting
    label.textContent = 'Conectando';
    label.style.color = 'var(--t3)';
    if (ping) { ping.style.display = 'none'; ping.textContent = ''; }
  }
}

// Mede ping via fetch do próprio domínio
async function _medirPing() {
  try {
    const t0 = performance.now();
    await fetch('/version.json?ping=' + Date.now(), { cache: 'no-store', method: 'HEAD' });
    return Math.round(performance.now() - t0);
  } catch { return null; }
}

// Inicia polling do Firebase só após DOM pronto
window.addEventListener('DOMContentLoaded', function _pollFirebase() {
  let tentativas = 0;
  const intervalo = setInterval(async () => {
    tentativas++;
    if (window.GSPSync && window.GSPAuth?.isReady()) {
      clearInterval(intervalo);
      const ms = await _medirPing();
      _setFirebaseStatus('online', ms);
      // Atualiza ping a cada 30s enquanto online
      setInterval(async () => {
        const dot = document.getElementById('firebase-status-dot');
        if (dot?.classList.contains('firebase-dot--online')) {
          const ms2 = await _medirPing();
          _setFirebaseStatus('online', ms2);
        }
      }, 30000);
    } else if (tentativas >= 80) {
      clearInterval(intervalo);
      _setFirebaseStatus('offline');
    }
  }, 100);
});

// Listener global — captura login do Google mesmo após redirect
function _iniciarListenerAuth() {
  if (!window.GSPAuth?.isReady()) return;
  window.GSPAuth.onAuthChange((user) => {
    if (user && !_player) {
      const telaAtual = document.querySelector('.screen.active')?.id;
      if (telaAtual === 'screen-login' || telaAtual === 'screen-auth') {
        mostrarTela('screen-loading');
        _setLoadingMsg('Entrando no painel...', 'Bem-vindo de volta!', 90);
      }
      // IIFE async: onAuthChange nao suporta callback async,
      // mas _loginOk precisa de await para verificar admin antes de checar manutencao
      (async () => { await _loginOk(user); })();
    } else if (user && _player) {
      // Firebase confirmou user — atualiza avatar que pode ter ficado sem foto no boot
      _atualizarHome();
    }
  });
}

function _fecharOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('active');
  el.style.display = 'none';
  el.removeAttribute('data-sector');
  // Só remove overlay-active se nenhum outro overlay continuar aberto
  const algumAberto = Array.from(document.querySelectorAll('.overlay'))
    .some(o => o !== el && o.style.display === 'flex');
  if (!algumAberto) document.body.classList.remove('overlay-active');
}

function _abrirOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.parentElement !== document.body) document.body.appendChild(el);
  document.body.classList.add('overlay-active');
  // Força estilos inline sempre (garante centralização independente do contexto)
  el.style.position = 'fixed';
  el.style.top = '0';
  el.style.left = '0';
  el.style.right = '0';
  el.style.bottom = '0';
  el.style.zIndex = '99999';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.padding = '20px';
  el.style.boxSizing = 'border-box';
  // NÃO definir background aqui — isso sobrescreveria via inline qualquer
  // ajuste feito no CSS (.overlay já define um background quase-opaco).
  // Essa sobrescrita inline (antes fixa em 0.75 de opacidade) era a causa
  // raiz real do conteúdo de baixo (ex: indicadores críticos com glow)
  // continuar visível através do overlay, independente de qualquer
  // mudança no style.css.
  // Força reflow síncrono antes de adicionar a classe .active (usada para
  // a animação do card interno). Mantém consistência com mostrarTela().
  void el.offsetHeight;
  el.classList.add('active');
  // Aplica cor do setor só se estiver numa tela de jogo
  const TELAS_JOGO = ['screen-intro','screen-game','screen-feedback','screen-result'];
  const telaAtiva = document.querySelector('.screen.active');
  const emJogo = telaAtiva && TELAS_JOGO.includes(telaAtiva.id);
  const sector = emJogo ? (document.getElementById('app')?.getAttribute('data-sector') || null) : null;
  if (sector) el.setAttribute('data-sector', sector);
  else el.removeAttribute('data-sector');
}

/* _verificarManutencaoInicial → maintenance.js */

async function _boot() {
  _settings = LS.get(SK.SETTINGS) || { timer: false, cloudStatus: false, mostrarStatus: false };
  // Garante campo legado
  if (_settings.mostrarStatus === undefined) _settings.mostrarStatus = false;
  // Move todos os .overlay para o body para evitar stacking context do #app
  // O overlay-confirmar-saida (z-index:100001) deve vir por último para ficar na frente
  const confirmar = document.getElementById('overlay-confirmar-saida');
  document.querySelectorAll('.overlay').forEach(o => {
    if (o.parentElement !== document.body) {
      document.body.appendChild(o);
      o.style.position = 'fixed';
      o.style.top = '0';
      o.style.left = '0';
      o.style.right = '0';
      o.style.bottom = '0';
      o.style.zIndex = '99999';
      o.style.alignItems = 'center';
      o.style.justifyContent = 'center';
      o.style.padding = '20px';
      o.style.boxSizing = 'border-box';
      o.style.background = 'rgba(0,0,0,0.75)';
    }
    _fecharOverlay(o.id);
  });
  // Garante que confirmar-saida é o último no body (maior prioridade visual)
  if (confirmar && confirmar.parentElement === document.body) {
    document.body.appendChild(confirmar);
  }
  _carregarVersaoAtual(); // carrega versão atual em background

  // Sempre sai da screen-loading imediatamente
  const saved = LS.get(SK.PLAYER);
  if (saved) {
    _player = saved;
    window._player = _player;
    _verificarSessaoSalva();
    _atualizarHome();

    // Mostra a tela de loading com progresso real durante a restauração
    // da sessão, em vez de deixar a tela anterior parada enquanto o boot
    // processa auth/polling/admin silenciosamente por baixo.
    mostrarTela('screen-loading');
    _setLoadingMsg('Restaurando sessão...', `Olá, ${(saved.nome || 'jogador')}!`, 15);

    // Espera o Firebase resolver o auth antes de qualquer chamada ao Firestore
    if (window.GSPAuth) {
      _setLoadingMsg('Verificando login...', 'Conectando com o Firebase', 35);
      let t = 0;
      while (!window.GSPAuth.isReady() && t < 50) {
        await new Promise(r => setTimeout(r, 100));
        t++;
      }
      await window.GSPAuth.waitForAuthReady().catch(() => null);
      // Auth resolvida — re-renderiza avatar agora que currentUser está disponível
      _atualizarHome();
    }

    _setLoadingMsg('Carregando seu painel...', 'Verificando permissões', 60);
    await _atualizarBotaoAdmin(saved.uid); // aguarda verificar admin ANTES do polling
    if (window.ADMIN) {
      // Espera GSPAuth ficar pronto (módulo ES6 carrega depois dos scripts normais)
      let t = 0;
      while (!window.GSPAuth?.isReady() && t < 30) {
        await new Promise(r => setTimeout(r, 100));
        t++;
      }
      const cfg = await window.ADMIN.verificarMensagemGlobal().catch(()=>null);
      if (cfg) _atualizarModoSala(cfg);
    }
    _setLoadingMsg('Quase lá...', 'Sincronizando dados', 85);
    _iniciarPollingGlobal(saved.uid); // inicia polling mesmo em sessão restaurada
    _iniciarInbox(saved.uid); // inicia polling do inbox
    _setLoadingMsg('Pronto!', '', 100);
    const tutorialJaVisto = await _checarTutorialVisto(saved.uid);
    if (!tutorialJaVisto) {
      mostrarTela('screen-tutorial');
    } else {
      mostrarTela('screen-home');
      _verificarSessaoSalva(); // re-verificar após tela estar visível
    }
    _sincronizarFirebaseBackground(saved);
    return;
  }

  // Sem sessão salva — mostra loading enquanto verifica redirect do Google
  const _googlePending = localStorage.getItem('gsp_google_pending') === '1';
  localStorage.removeItem('gsp_google_pending');

  mostrarTela('screen-loading');
  if (_googlePending) {
    _setLoadingMsg('Conectando com Google...', 'Finalizando seu login', 30);
  } else {
    _setLoadingMsg('Iniciando...', 'Preparando o jogo', 10);
  }

  // Escuta o evento de redirect do Google (disparado pelo firebase-config quando getRedirectResult resolve)
  let _redirectPlayer = null;
  const _redirectHandler = (e) => { _redirectPlayer = e.detail; };
  window.addEventListener('gsp-redirect-login', _redirectHandler, { once: true });

  if (window.GSPAuth) {
    if (!_googlePending) _setLoadingMsg('Conectando ao servidor...', 'Aguardando Firebase', 30);
    let t = 0;
    while (!window.GSPAuth.isReady() && t < 30) {
      await new Promise(r => setTimeout(r, 100));
      t++;
    }
    if (window.GSPAuth.isReady()) {
      if (_googlePending) {
        _setLoadingMsg('Verificando conta Google...', 'Quase lá!', 60);
      } else {
        _setLoadingMsg('Verificando sua sessão...', 'Checando login do Google', 60);
      }
      try {
        // Aguarda até 15s pelo resultado (waitForAuthReady OU evento de redirect)
        let fbUser = null;
        const maxTentativas = _googlePending ? 150 : 80;
        for (let i = 0; i < maxTentativas; i++) {
          if (_redirectPlayer) {
            // Evento de redirect chegou — entra direto
            window.removeEventListener('gsp-redirect-login', _redirectHandler);
            _setLoadingMsg('Entrando no painel...', 'Bem-vindo de volta!', 90);
            await _loginOk(_redirectPlayer);
            return;
          }
          fbUser = await window.GSPAuth.waitForAuthReady().catch(() => null);
          if (fbUser) break;
          if (_googlePending && i % 30 === 0 && i > 0) {
            _setLoadingMsg('Conectando com Google...', 'Aguardando resposta...', 60 + i/3);
          }
          await new Promise(r => setTimeout(r, 100));
        }
        if (fbUser) {
          window.removeEventListener('gsp-redirect-login', _redirectHandler);
          const user = {
            uid: fbUser.uid,
            nome: fbUser.displayName || fbUser.email?.split('@')[0] || 'Jogador',
            email: fbUser.email,
            tipo: 'user'
          };
          _setLoadingMsg('Entrando no painel...', 'Bem-vindo de volta!', 90);
          await _loginOk(user);
          return;
        }
      } catch(e) {}
    }
  }

  window.removeEventListener('gsp-redirect-login', _redirectHandler);
  if (_googlePending) {
    _setLoadingMsg('Não foi possível conectar', 'Tente novamente', 100);
    await new Promise(r => setTimeout(r, 1000));
  } else {
    _setLoadingMsg('Pronto!', 'Faça seu login para continuar', 100);
    await new Promise(r => setTimeout(r, 400));
  }
  _iniciarListenerAuth();

  // Manutenção só é verificada APÓS login — não bloqueia a tela inicial
  mostrarTela('screen-login');
}

// Sincroniza sessão Firebase em background sem bloquear a UI
function _sincronizarFirebaseBackground(player) {
  if (!player?.uid || !window.GSPAuth?.isReady() || !window.GSPSync) return;
  Promise.all([
    window.GSPSync.carregarHistorico(player.uid),
    window.GSPSync.carregarPodio(),
    window.GSPSync.carregarSessao(player.uid)
  ]).then(([histFS, podioFS, sessFS]) => {
    if (histFS?.length > 0) LS.set(SK.HISTORICO, histFS.map(h => ({ ...h, ts: h.ts?.toMillis ? h.ts.toMillis() : (h.ts || Date.now()) })));
    // Sempre sincroniza o localStorage com o Firestore — mesmo se vier vazio
    LS.set(SK.PODIO, (podioFS || []).map(p => ({ ...p, ts: p.ts?.toMillis ? p.ts.toMillis() : (p.ts || Date.now()) })));
    if (sessFS) LS.set(SK.SESSION, { ...sessFS, ts: sessFS.ts?.toMillis ? sessFS.ts.toMillis() : Date.now() });
  }).catch(() => {});
}

function _setLoadingMsg(msg, sub, progress) {
  const el = document.getElementById('loading-msg');
  if (el) el.textContent = msg;
  const sub_el = document.getElementById('loading-submsg');
  if (sub_el) sub_el.textContent = sub || '';
  const bar = document.getElementById('loading-bar-fill');
  if (bar && progress !== undefined) bar.style.width = progress + '%';
}

/* ════════════════════════════════════════════════════
   NAVEGAÇÃO
════════════════════════════════════════════════════ */
function mostrarTela(id, goBack) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active", "go-back");
    // Não resetar display aqui: o CSS já define display:none para .screen sem .active.
    // Resetar display causava um frame onde todos os screens ficavam visíveis
    // simultaneamente (flash do sala-mode no fundo ao voltar para home).
    s.style.opacity = '';
    s.style.transition = '';
    s.style.animation = '';
  });
  // Fecha todos os overlays ao navegar
  document.querySelectorAll(".overlay").forEach(o => { _fecharOverlay(o.id); });
  const el = document.getElementById(id);
  if (el) {
    el.classList.add("active");
    el.style.animation = goBack
      ? 'screenBack .3s cubic-bezier(.22,.68,0,1.2)'
      : 'screenIn .3s cubic-bezier(.22,.68,0,1.2)';
    setTimeout(() => { el.style.animation = ''; }, 350);
  }
  // Remove tema de setor em todas as telas fora do jogo
  const TELAS_JOGO = ["screen-intro","screen-game","screen-feedback","screen-result","screen-tutorial"];
  if (!TELAS_JOGO.includes(id)) _aplicarTemaSetor(null);
  window.scrollTo(0, 0);
  // Atualiza botão admin ao entrar na home
  if (id === 'screen-home') {

    // Registra presença no RTDB se jogador autenticado
    if (_player?.uid) _registrarPresencaHome();
    // Exibe mensagem global se houver
    if (window._mensagemGlobal) {
      setTimeout(() => mostrarSucesso(window._mensagemGlobal), 800);
      window._mensagemGlobal = null;
    }
  }
}
function voltar(tela) {
  ['.login-logo-img', '.login-footer', '.login-main', '.login-eyebrow', '.login-rule', '.login-desc'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) { el.style.opacity = ''; el.style.transition = ''; el.style.transform = ''; }
  });
  const authLogoEl = document.querySelector('.auth-logo-img');
  if (authLogoEl) authLogoEl.style.opacity = '';
  mostrarTela(tela, true);
}

/* ════════════════════════════════════════════════════
   LOGIN / IDENTIDADE
════════════════════════════════════════════════════ */

function irComoConvidado() {
  _player = { nome: "Convidado", tipo: "guest" };
  window._player = _player;
  LS.set(SK.PLAYER, _player); // persiste para não perder _player ao recarregar
  _atualizarHome();
  mostrarTela("screen-home");

  // Convidado não tem uid → polling leve só de manutenção
  window.Maintenance.iniciarPollingConvidado();
}

function confirmarNome() {
  const input = document.getElementById("player-name-input");
  const nome  = input?.value.trim();
  if (!nome) { mostrarErroCritico("Digite seu nome para continuar."); return; }
  _player = { nome, tipo: "user" };
  window._player = _player;
  LS.set(SK.PLAYER, _player);
  if (input) input.value = "";
  _restaurarSala();
  _restaurarGrupo();
  _atualizarHome();
  mostrarTela("screen-home");
  _verificarSessaoSalva();
}

function sair() {
  _pararPollingGlobal();
  _pararInbox();
  window.Maintenance.pararPolling();
  window.Maintenance.pararPollingConvidado();

  _removerPresenca();
  LS.remove(SK.PLAYER);
  LS.remove(SK.SESSION);
  LS.remove(SK.HIST_GUEST);
  _player = null;
  window._player = null;
  _isAdmin = false;
  window._isAdmin = false;
  _presencaInicializada = false;
  _aplicarTemaSetor(null);
  const btnInbox = document.getElementById('btn-inbox');
  if (btnInbox) btnInbox.style.display = 'none';
  if (window.GSPAuth?.isReady()) window.GSPAuth.logout().catch(() => {});
  mostrarTela("screen-login");
}

function _atualizarHome() {
  const el = document.getElementById("home-player-name");
  if (el) el.textContent = `OLÁ, ${(_player?.nome || "JOGADOR").toUpperCase()}`;
  const av = document.getElementById("home-avatar-icon");
  if (av) {
    const photoURL = window.GSPAuth?.currentUser?.photoURL;
    const fotoOn = LS.get(SK.SETTINGS)?.fotoPerfil === true;
    if (photoURL && fotoOn) {
      av.innerHTML = `<img src="${photoURL}" alt="foto" draggable="false" oncontextmenu="return false" style="width:100%;height:100%;object-fit:cover;border-radius:50%;-webkit-touch-callout:none;pointer-events:none;">`;
    } else if (_player?.nome) {
      av.textContent = _player.nome.charAt(0).toUpperCase();
    }
  }
  // Botão inbox sempre visível para usuários logados
  const btnInbox = document.getElementById('btn-inbox');
  if (btnInbox) btnInbox.style.display = _player?.uid ? '' : 'none';
}

/* ════════════════════════════════════════════════════
   SESSÃO PERSISTENTE
════════════════════════════════════════════════════ */
function _salvarSessao() {
  const state = BetaState.get();
  if (!state || state.phase === "result") { LS.remove(SK.SESSION); LS.remove('gsp_session_state'); return; }
  LS.set(SK.SESSION, {
    sector: state.sector, companyName: state.companyName,
    currentRound: state.currentRound, totalRounds: state.totalRounds,
    ts: Date.now(),
  });
  // BUG #3 FIX: salvar estado completo para restaurarSessao não recomeçar do zero
  try {
    LS.set('gsp_session_state', {
      sector:          state.sector,
      groupName:       state.groupName  || "",
      companyName:     state.companyName,
      currentRound:    state.currentRound,
      totalRounds:     state.totalRounds,
      introIndex:      state.introIndex,
      indicators:      { ...state.indicators },
      gestor:          { ...state.gestor },
      history:         [...(state.history || [])],
      storyState:      JSON.parse(JSON.stringify(state.storyState || {})),
      activeEvents:    JSON.parse(JSON.stringify(state.activeEvents || [])),
      // FIX: campos que estavam faltando e tornavam o restore incompleto
      situacaoAtual:   state.situacaoAtual  ? JSON.parse(JSON.stringify(state.situacaoAtual))  : null,
      situacaoStatus:  state.situacaoStatus || null,
      stakeholderLog:  JSON.parse(JSON.stringify(state.stakeholderLog || [])),
      // FIX: salvar títulos dos 10 rounds sorteados para restore determinístico
      gameRoundTitles: (state.gameRounds || []).map(r => r.title).filter(Boolean),
      ts: Date.now(),
    });
  } catch(e) { console.warn('_salvarSessao: falha ao salvar estado completo', e); }
}

function _verificarSessaoSalva() {
  const sess   = LS.get(SK.SESSION);
  const banner = document.getElementById("session-restore-banner");
  const texto  = document.getElementById("session-restore-text");
  if (sess && banner && texto && _player) {
    const mins  = Math.round((Date.now() - sess.ts) / 60000);
    const tempo = mins < 60 ? `${mins} min atrás` : `${Math.round(mins/60)}h atrás`;
    texto.textContent = `Jogo em andamento: ${sess.companyName} (${sess.sector}) — Rodada ${sess.currentRound + 1}/${sess.totalRounds} · salvo ${tempo}`;
    banner.style.display = "block";
  } else if (banner) {
    banner.style.display = "none";
  }
}

function restaurarSessao() {
  const sess = LS.get(SK.SESSION);
  if (!sess) return;
  const estadoCompleto = LS.get('gsp_session_state');
  if (estadoCompleto && estadoCompleto.sector === sess.sector && estadoCompleto.currentRound > 0) {
    try {
      const state   = BetaState.restore(estadoCompleto);
      const empresa = EMPRESAS[state.sector];
      const introIdx = state.introIndex || 0;
      const todasRounds = empresa?.rounds?.[introIdx] || [];

      // FIX: restaurar os rounds EXATOS usando títulos salvos (determinístico)
      const titulos = estadoCompleto.gameRoundTitles;
      if (titulos && titulos.length > 0) {
        // Reconstrói a lista de rounds na ordem original usando os títulos salvos
        const mapaRounds = {};
        todasRounds.forEach(r => { if (r.title) mapaRounds[r.title] = r; });
        const roundsRestaurados = titulos.map(t => mapaRounds[t]).filter(Boolean);
        state.gameRounds  = roundsRestaurados.length > 0 ? roundsRestaurados : todasRounds;
        state.totalRounds = state.gameRounds.length;
      } else if (todasRounds.length > 0) {
        // Fallback para sessões antigas sem gameRoundTitles: re-sorteia por fase
        const temFase = todasRounds.some(r => r.fase);
        if (temFase) {
          /* BUG E FIX: Fisher-Yates no fallback do restaurarSessao */
          const _fisherYates = (arr) => {
            const a = arr.slice();
            for (let i = a.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
          };
          const _sortearFase = (fase, n) => {
            const pool = todasRounds.filter(r => r.fase === fase);
            return _fisherYates(pool).slice(0, n);
          };
          state.gameRounds  = [..._sortearFase('diagnostico', 3), ..._sortearFase('pressao', 4), ..._sortearFase('decisao', 3)];
          state.totalRounds = state.gameRounds.length;
        } else {
          state.gameRounds  = todasRounds;
          state.totalRounds = todasRounds.length;
        }
      }

      state.companyInfo = COMPANY_INFO[state.sector] || null;
      window._initPrevIndicators?.(state.indicators);
      _aplicarTemaSetor(state.sector);
      _preparaRodada(state);
      mostrarTela("screen-game");
      renderSidebar(state, empresa);
      renderRodada(state);
      _atualizarSessaoAtiva();
      setTimeout(() => mostrarSucesso(`Sessão restaurada: ${state.companyName} · Rodada ${state.currentRound + 1}`), 500);
      return;
    } catch(e) {
      console.warn("restaurarSessao: falha ao restaurar estado completo, reiniciando", e);
    }
  }
  // Fallback: iniciar do começo
  iniciar(sess.sector, _player?.nome || "Jogador", sess.companyName);
  setTimeout(() => mostrarAviso('Sessão reiniciada do início. Progresso anterior não recuperável.'), 500);
}

function descartarSessao() {
  LS.remove(SK.SESSION);
  const banner = document.getElementById("session-restore-banner");
  if (banner) banner.style.display = "none";
}

/* ════════════════════════════════════════════════════
   PÓDIO / HISTÓRICO DE JOGOS
════════════════════════════════════════════════════ */
function _registrarResultado(score, scoreGestor, sector, companyName) {
  const isGuest  = _player?.tipo === 'guest' || !_player?.uid;
  const histKey  = isGuest ? SK.HIST_GUEST : SK.HISTORICO;
  const state    = BetaState.get();
  const entrada  = {
    player: _player?.nome || 'Convidado',
    score, scoreGestor, sector, companyName, ts: Date.now(),
    uid: _player?.uid || null,
    introIndex: state?.introIndex ?? null,  // registra qual história foi jogada
  };

  // Marca intro e situação como usadas para evitar repetição imediata
  _registrarIntroUsada(sector, state?.introIndex ?? null, state?.situacaoAtual ?? null);

  // Salva no histórico local
  const hist = LS.get(histKey) || [];
  hist.unshift(entrada);
  LS.set(histKey, hist.slice(0, 30));

  // Atualiza pódio local — usuários logados deduplicam por uid, convidados sempre adicionam nova entrada
  const podio = LS.get(SK.PODIO) || [];
  if (entrada.uid) {
    const existIdx = podio.findIndex(p => p.uid && p.uid === entrada.uid);
    if (existIdx >= 0) {
      if (entrada.score > podio[existIdx].score) podio[existIdx] = entrada;
    } else {
      podio.push(entrada);
    }
  } else {
    podio.push(entrada);
  }
  podio.sort((a, b) => b.score - a.score);
  LS.set(SK.PODIO, podio.slice(0, 20));

  LS.remove(SK.SESSION);

  // Salva no Firestore com feedback visível
  if (!isGuest && _player?.uid) {
    const _salvarNoFirestore = () => {
      if (!window.GSPSync) { mostrarAviso('⚠️ Firebase indisponível'); return; }
      const _statusEl = () => document.getElementById('result-cloud-status');
      if (_settings.cloudStatus !== false) {
        if (_statusEl()) { _statusEl().style.display = 'block'; _statusEl().textContent = '☁️ Salvando na nuvem...'; }
      }
      Promise.all([
        window.GSPSync.salvarPartida(_player.uid, entrada),
        window.GSPSync.salvarNoPodio(_player.uid, entrada)
      ])
        .then(() => {
          if (_settings.cloudStatus !== false && _statusEl()) _statusEl().textContent = '✅ Salvo na nuvem!';
        })
        .catch(e => {
          console.error('[GSP] Erro ao salvar resultado:', e);
          if (_settings.cloudStatus !== false && _statusEl()) _statusEl().textContent = '❌ Erro: ' + (e?.code || e?.message || 'desconhecido');
        });
    };
    if (window.GSPSync) {
      _salvarNoFirestore();
    } else {
      let t = 0;
      const poll = setInterval(() => {
        t++;
        if (window.GSPSync) { clearInterval(poll); _salvarNoFirestore(); }
        else if (t >= 50) { clearInterval(poll); mostrarAviso('⚠️ Firebase não conectado'); }
      }, 100);
    }
  }
}

/* irParaPodio: definição única e correta abaixo (com data-sector) */

/* ════════════════════════════════════════════════════
   ROTAÇÃO DE HISTÓRIAS — evita repetir intro/situação
════════════════════════════════════════════════════ */

/**
 * Registra qual introIndex e situação foram usados nesta partida.
 * Mantém uma fila circular por setor: quando todos os índices já foram usados,
 * reseta a fila (rotação completa antes de repetir).
 */
function _registrarIntroUsada(sector, introIndex, situacao) {
  if (!sector) return;
  const dados = LS.get(SK.INTROS_USADAS) || {};
  if (!dados[sector]) dados[sector] = [];

  // Adiciona o introIndex à fila do setor (se for válido)
  if (introIndex !== null && introIndex !== undefined) {
    if (!dados[sector].includes(introIndex)) {
      dados[sector].push(introIndex);
    }
  }

  // Registra situação usada (por título, independente de setor)
  if (situacao?.titulo) {
    if (!dados._situacoes) dados._situacoes = [];
    if (!dados._situacoes.includes(situacao.titulo)) {
      dados._situacoes.push(situacao.titulo);
    }
  }

  LS.set(SK.INTROS_USADAS, dados);
}

/**
 * Retorna os introIndexes já usados para um setor.
 * Se todos foram usados, reseta a fila (rotação completa).
 * @param {string} sector
 * @param {number} totalIntros — total de intros disponíveis no setor
 * @returns {number[]} — lista de índices já usados (a excluir do sorteio)
 */
function _getIntrosUsadas(sector, totalIntros) {
  const dados  = LS.get(SK.INTROS_USADAS) || {};
  const usados = dados[sector] || [];

  // Se já jogou todas as histórias do setor, reseta a fila
  if (usados.length >= totalIntros) {
    const novoDados = { ...dados, [sector]: [] };
    LS.set(SK.INTROS_USADAS, novoDados);
    return [];
  }
  return usados;
}

/**
 * Retorna as situações iniciais já usadas (por título).
 * Reseta quando todas foram usadas.
 * @param {number} totalSituacoes
 * @returns {string[]} — títulos das situações já usadas
 */
function _getSituacoesUsadas(totalSituacoes) {
  const dados  = LS.get(SK.INTROS_USADAS) || {};
  const usadas = dados._situacoes || [];

  if (usadas.length >= totalSituacoes) {
    const novoDados = { ...dados, _situacoes: [] };
    LS.set(SK.INTROS_USADAS, novoDados);
    return [];
  }
  return usadas;
}

function irParaHistoricoJogos() {
  mostrarTela("screen-historico-jogos");
  const isGuest = _player?.tipo === "guest" || !_player?.uid;
  const histKey = isGuest ? SK.HIST_GUEST : SK.HISTORICO;
  const lista   = document.getElementById("historico-jogos-lista");
  if (!lista) return;

  // Renderiza imediatamente com dados locais
  _renderHistorico(lista, LS.get(histKey) || [], isGuest);

  // Se logado, sincroniza Firestore em background e re-renderiza se tiver novo
  if (!isGuest && _player?.uid && window.GSPSync) {
    window.GSPSync.carregarHistorico(_player.uid).then(histFS => {
      if (!histFS?.length) return;
      const c = histFS.map(h => ({ ...h, ts: h.ts?.toMillis ? h.ts.toMillis() : (h.ts || Date.now()) }));
      LS.set(SK.HISTORICO, c);
      _renderHistorico(lista, c, false);
    }).catch(() => {});
  }
}

function _renderHistorico(lista, hist, isGuest) {
  const icones = { tecnologia:"🚀", varejo:"🛒", logistica:"🚚", industria:"🏭" };
  const labels = { tecnologia:"Tecnologia", varejo:"Varejo", logistica:"Logística", industria:"Indústria" };

  if (isGuest) {
    lista.innerHTML = `
      <div class="hist-guest-banner">
        <div class="hist-guest-icon">☁️</div>
        <div class="hist-guest-title">Histórico na nuvem</div>
        <div class="hist-guest-desc">Crie uma conta para salvar seu histórico online e acessar em qualquer dispositivo.</div>
        <button class="btn btn-primary hist-guest-btn" onclick="BetaUI.irParaAuth()">Criar conta grátis</button>
      </div>
      ${hist.length ? '<div class="hist-section-label">Sessão atual (local)</div>' + hist.map(p => _histCard(p, icones, labels)).join('') : ''}`;
    return;
  }

  if (!hist.length) {
    lista.innerHTML = `<div class="podio-empty">Nenhuma partida registrada ainda.<br>Complete um mandato para ver seu histórico aqui.</div>`;
    return;
  }

  // Agrupa por setor para estatísticas rápidas
  const totalJogos = hist.length;
  const melhor     = Math.max(...hist.map(h => h.score));
  const media      = Math.round(hist.reduce((a, h) => a + h.score, 0) / totalJogos);

  lista.innerHTML = `
    <div class="hist-stats-row">
      <div class="hist-stat"><span class="hist-stat-val">${totalJogos}</span><span class="hist-stat-label">Partidas</span></div>
      <div class="hist-stat"><span class="hist-stat-val" style="color:var(--s-text)">${melhor}</span><span class="hist-stat-label">Melhor</span></div>
      <div class="hist-stat"><span class="hist-stat-val">${media}</span><span class="hist-stat-label">Média</span></div>
    </div>
    <div class="hist-section-label">Últimas partidas</div>
    ${hist.map(p => _histCard(p, icones, labels)).join('')}`;
}

function _histCard(p, icones, labels) {
  const data    = new Date(p.ts).toLocaleDateString("pt-BR");
  const hora    = new Date(p.ts).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });
  const cor     = p.score >= 70 ? "var(--good)" : p.score >= 45 ? "var(--warn)" : "var(--danger)";
  const badge   = p.score >= 70 ? "hist-badge-great" : p.score >= 45 ? "hist-badge-ok" : "hist-badge-bad";
  const label   = p.score >= 70 ? "Excelente" : p.score >= 45 ? "Regular" : "Crítico";
  return `<div class="hist-card">
    <div class="hist-card-left">
      <div class="hist-card-sector">${icones[p.sector]||"🏢"}</div>
      <div class="hist-card-info">
        <div class="hist-card-company">${p.companyName}</div>
        <div class="hist-card-meta">${labels[p.sector]||p.sector} · ${data} às ${hora}</div>
      </div>
    </div>
    <div class="hist-card-right">
      <div class="hist-card-score" style="color:${cor}">${p.score}</div>
      <div class="hist-badge ${badge}">${label}</div>
      <div class="hist-card-gestor">Gestor: ${p.scoreGestor}</div>
    </div>
  </div>`;
}

/* ════════════════════════════════════════════════════
   SETOR / INÍCIO
════════════════════════════════════════════════════ */
function irParaSetores() {
  // Sincroniza estado do timer ao abrir seleção de setor
  setTimeout(() => {
    const sBtn = document.getElementById('sector-toggle-timer-btn');
    if (sBtn) {
      sBtn.textContent = _settings.timer ? 'ON' : 'OFF';
      sBtn.className = `toggle-btn ${_settings.timer ? 'on' : 'off'}`;
    }
  }, 50);
  // Limpar estado anterior de seleção
  document.querySelectorAll(".sector-card").forEach(b => b.classList.remove("selected"));
  const sh = document.getElementById("sector-hidden");
  const cn = document.getElementById("companyName");
  if (sh) sh.value = "";
  if (cn) cn.value = "";
  _aplicarTemaSetor(null); // reseta tema ao entrar na tela sem setor selecionado
  mostrarTela("screen-sector");
  // Listener para efeito pulsante no botão ao digitar o nome
  const btn = document.getElementById("btn-assumir-mandato");
  if (cn && btn) {
    cn.oninput = () => {
      if (cn.value.trim().length > 0) btn.classList.add("btn-assumir-pronto");
      else btn.classList.remove("btn-assumir-pronto");
    };
  }
}

function _aplicarTemaSetor(sector) {
  const app = document.getElementById('app');
  if (app) {
    if (sector) app.setAttribute('data-sector', sector);
    else app.removeAttribute('data-sector');
  }
}

function selecionarSetor(sector) {
  _setorSelecionado = sector;
  document.querySelectorAll(".sector-card").forEach(b => b.classList.remove("selected"));
  document.querySelector(`[data-sector="${sector}"]`)?.classList.add("selected");
  document.getElementById("sector-hidden").value = sector;
  // Aplica tema do setor no botão e na tela de seleção imediatamente
  const app = document.getElementById('app');
  if (app) app.setAttribute('data-sector', sector);
}

const _NOMES_ALEATORIOS = [
  "Nexora S.A.", "Veltrix Corp", "Aurum Group", "Solera Holding",
  "Kairos Ventures", "Fenix Soluções", "Orbis Gestão", "Zentra S.A.",
  "Caldera Corp", "Lumis Group", "Veritas S.A.", "Ápex Holding",
  "Norax Indústrias", "Solum Gestão", "Acera Corp", "Trivela S.A.",
  "Polaris Group", "Vexor Holding", "Alcora S.A.", "Mantis Corp",
  "Stratum Group", "Fulcrum S.A.", "Helix Ventures", "Crestline Corp"
];

function gerarNomeAleatorio() {
  const el = document.getElementById("companyName");
  if (!el) return;
  // Embaralha e pega um nome diferente do atual
  let nome;
  do {
    nome = _NOMES_ALEATORIOS[Math.floor(Math.random() * _NOMES_ALEATORIOS.length)];
  } while (nome === el.value && _NOMES_ALEATORIOS.length > 1);
  el.value = nome;
  el.classList.remove("input-error-shake");
  // Animação rápida de feedback
  el.style.transition = "border-color .15s";
  el.style.borderColor = "var(--s-primary)";
  setTimeout(() => { el.style.borderColor = ""; }, 400);
}

function lancarJogo() {
  const sector        = document.getElementById("sector-hidden").value;
  const companyNameEl = document.getElementById("companyName");
  const companyName   = companyNameEl.value.trim();
  if (!sector) { mostrarErroCritico("Selecione o tipo de empresa antes de continuar."); return; }
  if (!companyName) {
    companyNameEl.focus();
    companyNameEl.classList.add("input-error-shake");
    setTimeout(() => companyNameEl.classList.remove("input-error-shake"), 600);
    mostrarErroCritico("Digite o nome da empresa antes de continuar.");
    return;
  }
  iniciar(sector, _player?.nome || "Jogador", companyName);
}

/* ════════════════════════════════════════════════════
   INTRO
════════════════════════════════════════════════════ */
let _introCache = null;

function mostrarIntro(state, empresa) {
  _aplicarTemaSetor(state.sector);
  mostrarTela("screen-intro");
  const intro = state.introAtual;
  if (!intro) { comecaJogo(); return; }
  _introCache = { intro, empresa, sector: state.sector, situacao: state.situacaoAtual };
  document.getElementById("intro-badge").textContent     = intro.badge || empresa.nome || state.sector;
  document.getElementById("intro-titulo").textContent    = intro.badge || intro.titulo || "Bem-vindo";
  document.getElementById("intro-subtitulo").textContent = intro.subtitulo || "";
  const secoes = document.getElementById("intro-secoes");
  if (secoes) secoes.innerHTML = (intro.secoes || []).map(s => `
    <div class="intro-secao">
      <div class="intro-secao-header">
        <span class="intro-secao-icone">${s.icone||"📌"}</span>
        <span class="intro-secao-titulo">${s.titulo}</span>
      </div>
      <div class="intro-secao-corpo">${s.corpo}</div>
    </div>`).join("");
  const criseEl = document.getElementById("intro-crise");
  const crise   = state.situacaoAtual;
  if (crise && criseEl) {
    criseEl.style.display = "";
    criseEl.innerHTML = `
      <div class="intro-crise-header">
        <span class="intro-crise-badge">⚠ CRISE ATIVA</span>
        <span class="intro-crise-titulo">${crise.titulo}</span>
      </div>
      <div class="intro-crise-texto">${crise.historia}</div>`;
  } else if (criseEl) { criseEl.style.display = "none"; }
  const preview = document.getElementById("intro-indicators-preview");
  if (preview) {
    preview.innerHTML = Object.entries(state.indicators).map(([k, v]) => {
      const cor = BetaIndicadores.corNivel(v);
      return `<div class="intro-ind-item">
        <span>${BetaIndicadores.LABELS[k]||k}</span>
        <span style="color:${cor};font-weight:700">${v}/20</span>
      </div>`;
    }).join("");
  }
}

function comecaJogo() {
  iniciarRodadas();
  _renderEmpresaTab();
  _iniciarVerificacaoManutencao();
  _atualizarSessaoAtiva(); // registra presença imediatamente ao iniciar o jogo
  _gravarStatsDiario('inicio'); // contabiliza partida iniciada para dashboard
}

// ─── POLLING UNIVERSAL ─────────────────────────────────────────
// Roda sempre que o usuário está logado (home, jogo, perfil, etc.)
// Verifica: ban + manutenção + mensagem global — a cada 20 segundos

let _versaoAtual = null;
let _updateToastVisible = false;

// Carrega a versão atual do bundle ao iniciar
async function _carregarVersaoAtual() {
  try {
    const r = await fetch('/version.json?t=' + Date.now());
    if (!r.ok) return;
    const v = await r.json();
    _versaoAtual = v.hash || null;
    window._versaoAtual = _versaoAtual;
  } catch(e) {}
}

function _mostrarToastAtualizacao(forcado) {
  if (_updateToastVisible && !forcado) return;
  _updateToastVisible = true;
  // Remove toast anterior se existir
  document.getElementById('update-toast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'update-toast';
  toast.className = 'update-toast';
  toast.innerHTML = `
    <span class="update-toast-icon">🔄</span>
    <span>${forcado ? 'Atualização obrigatória disponível' : 'Nova versão disponível'}</span>
    <button class="update-toast-btn" onclick="location.reload()">Atualizar</button>
  `;
  if (!forcado) {
    // Toast discreto — fecha ao clicar fora
    toast.addEventListener('click', (e) => {
      if (!e.target.classList.contains('update-toast-btn')) {
        toast.remove();
        _updateToastVisible = false;
      }
    });
  }
  document.body.appendChild(toast);
}

// ─── STATS DIÁRIO (dashboard admin) ────────────────────────────────────────
// Grava em stats/diario: totalIniciadas e abandonos por rodada
// tipo: 'inicio' | 'abandono'  rodada: índice 0-based (só usado em 'abandono')
async function _gravarStatsDiario(tipo, rodada) {
  if (!_player?.uid || _player?.tipo === 'guest') return;
  try {
    const tok = await window.GSPAuth?.getToken().catch(() => null);
    if (!tok) return;
    const hoje = new Date().toISOString().slice(0, 10);
    const mesAtual = hoje.slice(0, 7); // ex: "2025-01"
    const FS = 'https://firestore.googleapis.com/v1/projects/under-pressure-49320/databases/default/documents';

    // Lê estado atual — guarda o doc para reusar na limpeza de meses
    const getRes = await fetch(`${FS}/stats/diario`, { headers: { Authorization: `Bearer ${tok}` } });
    let doc = {};
    let campos = {};
    if (getRes.ok) {
      doc = await getRes.json();
      const raw = doc.fields?.[hoje]?.stringValue;
      if (raw) try { campos = JSON.parse(raw); } catch(e) {}
    }

    // Atualiza contadores do dia
    if (tipo === 'inicio') {
      campos.totalIniciadas = (campos.totalIniciadas || 0) + 1;
    } else if (tipo === 'abandono' && rodada !== undefined) {
      campos.totalAbandonos = (campos.totalAbandonos || 0) + 1;
      const contadores = campos.contadoresPorRodada || {};
      contadores[rodada] = (contadores[rodada] || 0) + 1;
      campos.contadoresPorRodada = contadores;
      // Recalcula percentuais em relação ao total de partidas iniciadas hoje
      const total = campos.totalIniciadas || 1;
      const abandonoPorRodada = {};
      for (const [r, c] of Object.entries(contadores)) {
        abandonoPorRodada[r] = Math.round((c / total) * 100);
      }
      campos.abandonoPorRodada = abandonoPorRodada;
    }

    // Monta patch: grava dia atual + apaga dias de meses anteriores
    const fieldsParaGravar = { [hoje]: { stringValue: JSON.stringify(campos) } };
    for (const campo of Object.keys(doc.fields || {})) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(campo) && campo.slice(0, 7) !== mesAtual) {
        fieldsParaGravar[campo] = { nullValue: null }; // remove campo do Firestore
      }
    }
    const updateMask = Object.keys(fieldsParaGravar)
      .map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');

    await fetch(`${FS}/stats/diario?${updateMask}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: fieldsParaGravar })
    });
  } catch(e) { /* silencioso — não interrompe o fluxo */ }
}

// _iniciarPollingGlobal → window.Maintenance.iniciarPolling(uid)
function _iniciarPollingGlobal(uid) { window.Maintenance.iniciarPolling(uid); }

// _pararPollingGlobal → window.Maintenance.pararPolling()
function _pararPollingGlobal() { window.Maintenance.pararPolling(); }

function _forcarSaida(msg) {
  _pararPollingGlobal();
  _pararTimer();
  LS.remove(SK.SESSION);
  LS.remove(SK.PLAYER);
  _player = null;
  window._player = null;
  _isAdmin = false;
  window._isAdmin = false;
  _aplicarTemaSetor(null);
  if (window.GSPAuth?.isReady()) window.GSPAuth.logout().catch(() => {});
  mostrarTela('screen-login');
  setTimeout(() => mostrarAviso(msg), 600);
}

// Ativa o overlay-ban completo (ícone, motivo, UID para suporte, contador
// regressivo e botão de ação) em vez do toast genérico de _forcarSaida.
// O card e o CSS já existiam prontos no projeto, mas nunca eram ativados
// de fato — o jogador banido só via um toast de 3s que sumia rápido.
async function _mostrarOverlayBan(uid) {
  // Busca o motivo antes de limpar a sessão, enquanto ainda temos o uid
  let motivo = '';
  try {
    const info = await window.ADMIN?._getBanInfo(uid).catch(() => null);
    motivo = info?.motivoBan || '';
  } catch(e) { /* segue sem motivo */ }

  _pararPollingGlobal();
  _pararTimer();
  LS.remove(SK.SESSION);
  LS.remove(SK.PLAYER);
  _player = null;
  window._player = null;
  _isAdmin = false;
  window._isAdmin = false;
  _aplicarTemaSetor(null);
  if (window.GSPAuth?.isReady()) window.GSPAuth.logout().catch(() => {});
  mostrarTela('screen-login');

  const overlay   = document.getElementById('overlay-ban');
  const motivoBox = document.getElementById('ban-motivo-display');
  const motivoTxt = document.getElementById('ban-motivo-texto');
  const uidDisplay = document.getElementById('ban-uid-display');
  const countdownEl = document.getElementById('ban-countdown');
  const progressBar = document.getElementById('ban-progress-bar');
  if (!overlay) { mostrarAviso('🚫 Sua conta foi suspensa pelo administrador.'); return; }

  if (motivo && motivoBox && motivoTxt) {
    motivoTxt.textContent = motivo;
    motivoBox.style.display = 'block';
  } else if (motivoBox) {
    motivoBox.style.display = 'none';
  }
  if (uidDisplay) uidDisplay.textContent = uid;

  overlay.style.display = 'flex';

  // Contador regressivo de 10s até fechar sozinho (o botão "Ir para o
  // login" já permite fechar antes, via banIrParaLogin()).
  let segundos = 10;
  if (countdownEl) countdownEl.textContent = `Redirecionando em ${segundos}s...`;
  if (progressBar) progressBar.style.width = '100%';
  const intervalo = setInterval(() => {
    segundos--;
    if (countdownEl) countdownEl.textContent = segundos > 0 ? `Redirecionando em ${segundos}s...` : 'Redirecionando...';
    if (progressBar) progressBar.style.width = `${(segundos / 10) * 100}%`;
    if (segundos <= 0) {
      clearInterval(intervalo);
      banIrParaLogin();
    }
  }, 1000);
  overlay.dataset.intervaloId = String(intervalo);
}

function banIrParaLogin() {
  const overlay = document.getElementById('overlay-ban');
  if (overlay) {
    const intervaloId = overlay.dataset.intervaloId;
    if (intervaloId) clearInterval(Number(intervaloId));
    overlay.style.display = 'none';
  }
  mostrarTela('screen-login');
}

// Mantido para não quebrar chamadas de comecaJogo/abandonarJogo
function _iniciarVerificacaoManutencao() { /* substituído pelo polling global */ }
function _pararVerificacaoManutencao()  { /* substituído pelo polling global */ }

function _renderEmpresaTab() {
  const el = document.getElementById("empresa-tab-content");
  if (!el || !_introCache) return;
  const { intro, empresa, sector, situacao } = _introCache;
  const icones = { tecnologia:"🚀", industria:"🏭", logistica:"🚚", varejo:"🛒" };
  let html = `
    <div class="empresa-tab-header">
      <span class="empresa-tab-badge">${icones[sector]||"🏢"} ${empresa.nome || sector}</span>
      <h2 class="empresa-tab-titulo">${intro.titulo || intro.badge || ""}</h2>
      ${intro.subtitulo ? `<p class="empresa-tab-sub">${intro.subtitulo}</p>` : ""}
    </div>`;
  if (intro.secoes?.length) {
    html += intro.secoes.map(s => `
      <div class="empresa-tab-secao">
        <div class="empresa-tab-secao-header">
          <span class="empresa-tab-secao-icone">${s.icone||"📌"}</span>
          <span class="empresa-tab-secao-titulo">${s.titulo}</span>
        </div>
        <div class="empresa-tab-secao-corpo">${s.corpo}</div>
      </div>`).join("");
  }
  if (situacao) {
    html += `
      <div class="empresa-tab-crise">
        <div class="empresa-tab-crise-header">
          <span class="empresa-tab-crise-badge">⚠ CRISE ATIVA</span>
          <span class="empresa-tab-crise-titulo">${situacao.titulo}</span>
        </div>
        <div class="empresa-tab-crise-corpo">${situacao.historia}</div>
      </div>`;
  }
  el.innerHTML = html;
}

/* ════════════════════════════════════════════════════
   BENCHMARKS DE MERCADO
════════════════════════════════════════════════════ */
const BENCHMARKS = {
  varejo:    { financeiro:11,rh:10,clientes:12,processos:10,margem:9,estoque:11,marca:10,digital:9 },
  logistica: { financeiro:11,rh:10,clientes:12,processos:11,sla:12,frota:10,seguranca:11,tecnologia:9 },
  industria: { financeiro:11,rh:10,clientes:11,processos:11,seguranca:10,manutencao:10,qualidade:12,conformidade:11 },
  tecnologia:{ financeiro:11,rh:11,clientes:12,qualidade:11,produtividade:10,reputacao:10,inovacao:9,seguranca:10 },
};

function _bench(sector, key) { return BENCHMARKS[sector]?.[key] ?? null; }

/* ════════════════════════════════════════════════════
   SIDEBAR — INDICADORES + GESTOR
════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════
   ANIMAÇÕES DE INDICADORES
════════════════════════════════════════════════════ */

/**
 * Anima o valor numérico de um indicador de `de` para `ate`,
 * passo a passo, atualizando o elemento DOM no caminho.
 * @param {HTMLElement} el   — elemento com o número
 * @param {number}      de   — valor inicial
 * @param {number}      ate  — valor final
 * @param {number}      dur  — duração total em ms
 */
function _animarContador(el, de, ate, dur = 500) {
  if (!el || de === ate) return;
  const passos   = Math.abs(ate - de);
  const intervMs = Math.max(30, Math.round(dur / passos));
  const direcao  = ate > de ? 1 : -1;
  let atual = de;
  const iv = setInterval(() => {
    atual += direcao;
    el.textContent = atual;
    if (atual === ate) clearInterval(iv);
  }, intervMs);
}

/**
 * Aplica flash de cor + contador animado + barra animada em um card de indicador.
 * @param {string} key   — chave do indicador (ex: 'financeiro')
 * @param {number} prev  — valor anterior
 * @param {number} next  — valor novo
 */
function _animarIndicador(key, prev, next) {
  if (prev === next || prev === undefined) return;
  const row     = document.querySelector(`.game-ind-row[data-ind="${key}"]`);
  const valEl   = row?.querySelector('.game-ind-val');
  const barEl   = row?.querySelector('.game-ind-bar');
  const trendEl = row?.querySelector('.game-ind-trend');
  const nameEl  = row?.querySelector('.game-ind-name');
  const benchEl = row?.querySelector('.game-ind-bench');
  if (!row) return;

  const subiu = next > prev;
  const diff  = Math.abs(next - prev);

  // Cor final calculada a partir do VALOR NOVO (next) — corrige o bug de cor
  // presa no valor antigo (ex: 3/20 deveria ser vermelho crítico, não amarelo)
  const corFinal = BetaIndicadores.corNivel(next);
  const isCriticalNovo = next <= 3;
  const eraCritico      = prev <= 3;

  // Remove classes anteriores para reiniciar animação
  row.classList.remove('ind-flash-up', 'ind-flash-down');
  // Força reflow para reiniciar a animação CSS
  void row.offsetWidth;
  row.classList.add(subiu ? 'ind-flash-up' : 'ind-flash-down');

  // Contador animado no número
  if (valEl) {
    valEl.classList.remove('ind-val-pop');
    void valEl.offsetWidth;
    valEl.classList.add('ind-val-pop');
    _animarContador(valEl, prev, next, 400);
  }

  // Barra: aplica transition e muda o width — o navegador anima a diferença
  if (barEl) {
    const pctTo = `${(next / 20) * 100}%`;
    barEl.style.transition = 'width .5s cubic-bezier(.4,0,.2,1)';
    // Força reflow antes de mudar o width para garantir que a transition pega o estado anterior
    void barEl.offsetWidth;
    barEl.style.width = pctTo;
  }

  // Cor: sincronizada com o fim da animação do número/barra — sem isso,
  // o elemento fica com a cor do NÍVEL ANTIGO até o próximo render completo.
  setTimeout(() => {
    if (valEl) valEl.style.color = corFinal;
    if (barEl) barEl.style.background = corFinal;
    row.style.setProperty('--ind-cor', corFinal);

    // Atualiza/benchVal (cor do número 'x/20' junto ao texto de média)
    if (benchEl) {
      const valSpan = benchEl.querySelector('span[style*="font-weight"]') || benchEl.lastElementChild;
      if (valSpan) valSpan.style.color = corFinal;
    }

    // Aplica/remove estado crítico (borda pulsante, etc.) se o nível mudou
    if (isCriticalNovo && !eraCritico) {
      row.classList.add('critical');
      nameEl?.classList.add('critical-label');
    } else if (!isCriticalNovo && eraCritico) {
      row.classList.remove('critical');
      nameEl?.classList.remove('critical-label');
    }
  }, 400); // mesma duração de _animarContador, mesmo timing da seta

  // Seta de tendência: só aparece QUANDO a animação do número termina,
  // garantindo que ela nunca fica dessincronizada do valor exibido.
  // Depois de 2s visível, desaparece com fade suave.
  if (trendEl) {
    trendEl.textContent = '';
    trendEl.className   = 'game-ind-trend';
    trendEl.style.opacity = '0';
    setTimeout(() => {
      trendEl.textContent  = subiu ? `▲${diff}` : `▼${diff}`;
      trendEl.className    = `game-ind-trend ${subiu ? 'up' : 'down'}`;
      trendEl.style.opacity = '1';

      // Some após 2s, com fade de .3s (definido no CSS .game-ind-trend)
      setTimeout(() => {
        trendEl.style.opacity = '0';
      }, 2000);
    }, 400); // mesma duração de _animarContador
  }
}

function renderSidebar(state, empresa) {
  try {
  // BUG #1 FIX: snapshot _prevIndicators at the START of render so trend arrows
  // reflect the *previous* render's values, not the current one being drawn.
  const snapPrev = { ..._prevIndicators };

  const nameEl = document.getElementById("game-company-name");
  if (nameEl) nameEl.textContent = `${state.companyName} · ${empresa?.nome||""}`;

  // Barra de progresso das rodadas
  const progBar = document.getElementById("game-progress-bar");
  if (progBar) {
    const pct = Math.round(((state.currentRound + 1) / state.totalRounds) * 100);
    progBar.style.width = `${pct}%`;
  }

  const roundBadge = document.getElementById("game-round-badge");
  if (roundBadge) {
    const faseLabel = { diagnostico:"Diagnóstico", pressao:"Pressão", decisao:"Decisão Crítica",
                        fundacao:"Diagnóstico",crescimento:"Crescimento",
                        crise:"⚠ Crise",consolidacao:"Consolidação",expansao:"Expansão" };
    const round = state.gameRounds?.[state.currentRound];
    const fase = round?.fase || state.storyState?.faseEmpresa;
    roundBadge.textContent = `Rod. ${state.currentRound+1}/${state.totalRounds} · ${faseLabel[fase]||""}`;
  }
  const grid = document.getElementById("game-indicators-grid");
  if (grid) {
    // Detectar indicadores críticos para toast
    const newlyCritical = [];

    // Se há valores anteriores (não é a primeira renderização), o HTML nasce
    // com os valores ANTIGOS — para a transição ser visível — e a animação
    // via _animarIndicador() corrige para os valores novos depois.
    const temAnterior = Object.keys(snapPrev).length > 0;

    grid.innerHTML = Object.entries(state.indicators).map(([k, v]) => {
      const vExibir   = temAnterior && snapPrev[k] !== undefined ? snapPrev[k] : v;
      const pct       = (vExibir / 20) * 100;
      const cor       = BetaIndicadores.corNivel(vExibir);
      const label     = BetaIndicadores.LABELS[k] || k;
      const b         = _bench(state.sector, k);
      const prev      = snapPrev[k];

      // IMPORTANTE: a seta de tendência NÃO é inserida aqui no HTML inicial.
      // Ela é injetada via JS em _animarIndicador() (ou imediatamente abaixo,
      // se não há mudança a animar) — assim a seta sempre aparece SINCRONIZADA
      // com o número e a barra já no valor final, nunca antes.

      // Classe crítico se valor final <= 3
      const isCritical = v <= 3;
      if (isCritical && (prev === undefined || prev > 3)) newlyCritical.push(label);
      const rowClass = isCritical ? ' critical' : '';
      const nameClass = isCritical ? ' critical-label' : '';

      // Label already contains emoji prefix (e.g. "💰 Financeiro")
      const labelParts = label.split(" ");
      const indIcon = labelParts[0];
      const indName = labelParts.slice(1).join(" ");
      const benchVal = b ? `<span>Méd: ${b}</span><span style="color:${cor};font-weight:700">${vExibir}/20</span>` : `<span style="color:${cor};font-weight:600">${vExibir}/20</span>`;
      return `<div class="game-ind-row${rowClass}" data-ind="${k}" style="--ind-cor:${cor}" onclick="BetaUI.abrirTooltipIndicador('${k}')">
        <div class="game-ind-top">
          <span class="game-ind-name${nameClass}"><span style="margin-right:4px;font-size:.8rem">${indIcon}</span>${indName}</span>
          <div style="display:flex;align-items:center;gap:3px"><span class="game-ind-trend" data-trend-for="${k}"></span><span class="game-ind-val" style="color:${cor}">${vExibir}</span></div>
        </div>
        <div class="game-ind-track"><div class="game-ind-bar" style="width:${pct}%;background:${cor};transition:none"></div></div>
        <div class="game-ind-bench">${benchVal}</div>
      </div>`;
    }).join("");

    // Para indicadores SEM mudança (prev === v), insere a seta vazia imediatamente
    // (não há nada a animar, então não precisa esperar)
    if (!temAnterior) {
      // Primeira renderização — nenhuma seta, nenhuma comparação possível
    } else {
      Object.entries(state.indicators).forEach(([k, v]) => {
        const prev = snapPrev[k];
        if (prev === undefined || prev === v) {
          // Sem mudança real — não precisa de seta, e o número já está correto
          const trendEl = grid.querySelector(`[data-trend-for="${k}"]`);
          if (trendEl) trendEl.textContent = '';
        }
      });
    }

    // BUG #1 FIX: update _prevIndicators AFTER rendering
    // Anima dos valores antigos (já no DOM) para os valores reais do state.
    const _snapParaAnim = { ...snapPrev };
    if (temAnterior) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          Object.entries(state.indicators).forEach(([k, v], i) => {
            const prev = _snapParaAnim[k];
            if (prev !== undefined && prev !== v) {
              setTimeout(() => _animarIndicador(k, prev, v), i * 60);
            }
          });
        });
      });
    }

    _prevIndicators = { ...state.indicators };

    // Toast para indicadores recém-críticos
    if (newlyCritical.length && state.currentRound > 0) {
      newlyCritical.forEach(label => _mostrarCriticalToast(`⚠ ${label} em nível crítico! Ação urgente necessária.`));
    }
  }
  const strip = document.getElementById("game-gestor-strip");
  if (strip) {
    const g = state.gestor;
    const esgCor = g.esgotamento>=7?"var(--danger)":g.esgotamento>=5?"var(--warn)":"var(--good)";
    const capCor = g.capitalPolitico<=2?"var(--danger)":"var(--purple)";
    const repCor = g.reputacaoInterna<=2?"var(--danger)":"var(--purple)";
    strip.innerHTML = `
      <div class="gestor-pill" onclick="BetaUI.abrirTooltipIndicador('reputacaoInterna')">
        <span class="gestor-pill-label">Reputação ⓘ</span>
        <span class="gestor-pill-val" style="color:${repCor}">${g.reputacaoInterna}/10</span>
      </div>
      <div class="gestor-pill" onclick="BetaUI.abrirTooltipIndicador('capitalPolitico')">
        <span class="gestor-pill-label">Cap. Político ⓘ</span>
        <span class="gestor-pill-val" style="color:${capCor}">${g.capitalPolitico}/10</span>
      </div>
      <div class="gestor-pill" onclick="BetaUI.abrirTooltipIndicador('esgotamento')">
        <span class="gestor-pill-label">Esgotamento ⓘ</span>
        <span class="gestor-pill-val" style="color:${esgCor}">${g.esgotamento}/10</span>
      </div>`;
  }
  _salvarSessao();
  } catch(err) {
    console.error("renderSidebar crash — jogo continua:", err);
    mostrarAviso("Erro ao atualizar a tela. O jogo continua.");
    try { _salvarSessao(); } catch(e) {}
  }
}

/* ════════════════════════════════════════════════════
   RODADA
════════════════════════════════════════════════════ */
/**
 * Animação de abertura: mostra todos os indicadores em 20
 * e conta sequencialmente até os valores reais, revelando o estado inicial da empresa.
 * @param {object} indicators — valores reais dos indicadores
 * @param {number} delayBase  — delay inicial em ms
 */
/**
 * Anima chips de um grid sequencialmente via JS (evita problema de innerHTML + CSS animation).
 * Insere os chips sem classe de animação, depois aplica uma por uma com delay.
 * @param {string}   gridId  — id do elemento container
 * @param {Array}    itens   — [{ html: string, positivo: boolean }]
 */
// Fila de chips pendentes para animar quando o jogador apertar "Próxima Rodada"
let _chipsFila = [];

/**
 * Insere chips no grid de forma estática (visíveis, sem animação).
 * A animação só acontece quando _dispararAnimacaoChips() for chamada
 * (ao apertar o botão Próxima Rodada).
 */
function _animarChips(gridId, itens) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  // Insere chips estáticos e visíveis — jogador lê normalmente
  grid.innerHTML = itens.map(it => it.html).join('');

  // Registra na fila para animar ao apertar Próxima Rodada
  const chips = Array.from(grid.querySelectorAll('.fb-chip'));
  chips.forEach((chip, i) => {
    _chipsFila.push({ chip, index: i, positivo: chip.dataset.positivo === 'true' });
  });
}

/**
 * Chamada ao apertar "Próxima Rodada".
 * Anima todos os chips da fila sequencialmente antes de avançar.
 * Retorna uma Promise que resolve quando todas as animações terminarem.
 */
function _dispararAnimacaoChips() {
  const fila = [..._chipsFila];
  _chipsFila = [];
  if (!fila.length) return Promise.resolve();

  // Esconde todos antes de animar
  fila.forEach(({ chip }) => {
    chip.style.transition = 'none';
    chip.style.opacity    = '0';
    chip.style.transform  = 'translateY(10px) scale(.9)';
  });

  return new Promise(resolve => {
    // rAF duplo: garante que o estado opacity:0 foi pintado
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const duracaoUltimo = (fila.length - 1) * 90 + 220 + 400 + 50;

        fila.forEach(({ chip, index, positivo }) => {
          setTimeout(() => {
            chip.style.transition = 'opacity .22s ease, transform .22s cubic-bezier(.22,.68,0,1.3)';
            chip.style.opacity    = '1';
            chip.style.transform  = 'translateY(0) scale(1)';

            // Pulso de cor após entrar
            setTimeout(() => {
              chip.style.transition += ', box-shadow .3s ease';
              chip.style.boxShadow  = positivo
                ? '0 0 10px rgba(34,197,94,.45)'
                : '0 0 10px rgba(239,68,68,.45)';
              setTimeout(() => {
                chip.style.boxShadow = 'none';
              }, 400);
            }, 220);
          }, index * 90);
        });

        // Resolve após o último chip terminar de pulsar
        setTimeout(resolve, duracaoUltimo);
      });
    });
  });
}

function _animarInicioPartida(indicators, delayBase = 600) {
  const entradas = Object.entries(indicators);

  // Passo 1: força barra em 0% e número em 20 para todos,
  // sem transition para ser instantâneo
  entradas.forEach(([k]) => {
    const row   = document.querySelector(`.game-ind-row[data-ind="${k}"]`);
    const valEl = row?.querySelector('.game-ind-val');
    const barEl = row?.querySelector('.game-ind-bar');
    if (valEl) valEl.textContent = '20';
    if (barEl) {
      barEl.style.transition = 'none';
      barEl.style.width = '100%'; // parte cheio (20/20)
    }
  });

  // Passo 2: para cada indicador, anima sequencialmente do valor 20 ao real
  entradas.forEach(([k, v], i) => {
    setTimeout(() => {
      const row    = document.querySelector(`.game-ind-row[data-ind="${k}"]`);
      const valEl  = row?.querySelector('.game-ind-val');
      const barEl  = row?.querySelector('.game-ind-bar');
      const nameEl = row?.querySelector('.game-ind-name');

      // Restaura transition antes de animar
      if (barEl) barEl.style.transition = 'width .5s cubic-bezier(.4,0,.2,1)';

      const corFinal = BetaIndicadores.corNivel(v); // cor 20 = excelente, sempre OK no início

      if (v === 20) {
        // Sem mudança — só garante número e cor corretos
        if (valEl) { valEl.textContent = '20'; valEl.style.color = corFinal; }
        if (row)   row.style.setProperty('--ind-cor', corFinal);
        return;
      }

      // Flash e contador
      if (row) {
        row.classList.remove('ind-flash-up', 'ind-flash-down');
        void row.offsetWidth;
        row.classList.add('ind-flash-down'); // começa cheio e cai
      }
      if (valEl) {
        valEl.classList.remove('ind-val-pop');
        void valEl.offsetWidth;
        valEl.classList.add('ind-val-pop');
        _animarContador(valEl, 20, v, 450);
      }
      if (barEl) {
        // Anima barra do valor máximo (100%) para o valor real
        barEl.style.width = `${(v / 20) * 100}%`;
      }

      // Cor e estado crítico — sincronizados com o fim da animação (450ms)
      setTimeout(() => {
        if (valEl) valEl.style.color = corFinal;
        if (barEl) barEl.style.background = corFinal;
        if (row)   row.style.setProperty('--ind-cor', corFinal);

        const benchEl = row?.querySelector('.game-ind-bench');
        if (benchEl) {
          const valSpan = benchEl.querySelector('span[style*="font-weight"]') || benchEl.lastElementChild;
          if (valSpan) valSpan.style.color = corFinal;
        }

        if (v <= 3) {
          row?.classList.add('critical');
          nameEl?.classList.add('critical-label');
        }
      }, 450);
    }, delayBase + i * 200);
  });
}

function renderRodada(state, aposTrocaTela) {
  _escolhaFeita = false;
  _bloqueioAte  = Date.now() + 350; // bloqueia toques fantasma pós-transição
  const round = state.gameRounds[state.currentRound];
  if (!round) return;

  const faseLabel = { diagnostico:"Diagnóstico", pressao:"Pressão", decisao:"Decisão Crítica",
                      fundacao:"Diagnóstico",crescimento:"Crescimento",
                      crise:"⚠ Crise",consolidacao:"Consolidação",expansao:"Expansão" };
  const fase = round?.fase || state.storyState?.faseEmpresa;
  document.getElementById("hist-round-badge").textContent =
    `Rodada ${state.currentRound+1} · ${faseLabel[fase]||""}`;
  document.getElementById("hist-round-title").textContent = round.title || "";
  document.getElementById("hist-round-desc").innerHTML = _destacarTermosGlossario(_enriquecerDescricao(round.description||"", state));

  // Evento ativo
  const ev     = state.activeEvents?.find(e => e.expiresAt >= state.currentRound);
  const banner = document.getElementById("hist-event-banner");
  const evTxt  = document.getElementById("hist-event-text");
  if (ev && banner && evTxt) {
    banner.classList.add("visible");
    // Mostra quais indicadores do setor atual são amplificados e efeitos no gestor
    const indAfetados = BetaImprevisto.descricaoIndicadores(ev, state.sector);
    const gestorAf    = BetaImprevisto.descricaoGestor(ev);
    let detalhes = ev.descricao;
    if (indAfetados) detalhes += `<br><span class="ev-detail-ind">📊 Amplifica: ${indAfetados}</span>`;
    if (gestorAf)    detalhes += `<br><span class="ev-detail-gestor">👔 Gestor: ${gestorAf}</span>`;
    evTxt.innerHTML = `<strong>${ev.titulo}</strong> — ${detalhes}`;
  } else if (banner) banner.classList.remove("visible");

  // Choices
  const choices = state.choicesAtivas || round.choices;
  const lista   = document.getElementById("choices-list");
  lista.innerHTML = choices.map((c, i) => {
    const letra = String.fromCharCode(65+i);
    const risco = (c.risco && state.currentRound < 2) ? `<span class="choice-risk risk-${c.risco}">${c.risco.toUpperCase()}</span>` : "";
    return `<button class="choice-card" onclick="BetaUI.escolher(${i})" id="choice-btn-${i}">
      <span class="choice-letter">${letra}</span>
      <span class="choice-text">${_destacarTermosGlossario(c.text)}</span>
      ${risco}
    </button>`;
  }).join("");

  // Histórico + recomendações
  _renderHistoricoTab(state);

  // Timer
  _iniciarTimer();

  // Animação de início: na primeira rodada os indicadores "caem" de 20 até o valor real
  if (state.currentRound === 0) {
    requestAnimationFrame(() => _animarInicioPartida(state.indicators));
  }

  // Sempre começa na aba HISTÓRIA
  mudarTab("historia");
  mostrarTela("screen-game");

  // Se houver callback (chamado por _avancarRodada para renderizar a sidebar
  // SÓ DEPOIS que a tela já estiver visível), executa após o screenIn (~300ms)
  // para o jogador perceber a transição dos indicadores na tela certa.
  if (typeof aposTrocaTela === 'function') {
    setTimeout(aposTrocaTela, 60);
  }
}

/* ── Abas ──────────────────────────────────────────── */
function mudarTab(aba) {
  ["historia","desafios","historico","empresa"].forEach(t => {
    document.getElementById(`tab-${t}`)?.classList.remove("active");
    document.getElementById(`gtab-${t}`)?.classList.remove("active");
  });
  document.getElementById(`tab-${aba}`)?.classList.add("active");
  document.getElementById(`gtab-${aba}`)?.classList.add("active");
}

/* ── Histórico + Recomendações ─────────────────────── */
function _renderHistoricoTab(state) {
  const histEl = document.getElementById("historico-indicadores");
  const recEl  = document.getElementById("recomendacoes-panel");
  if (histEl) {
    const ultimas = state.history?.slice(-6).reverse() || [];
    if (!ultimas.length) {
      histEl.innerHTML = `<span style="color:var(--text-muted);font-size:.78rem;">Tome decisões para ver as mudanças aqui.</span>`;
    } else {
      histEl.innerHTML = ultimas.map(h => {
        const efeitos = Object.entries(h.efeitos||{}).filter(([,v])=>v!==0).slice(0,3)
          .map(([k,v])=>`<span class="efeito-tag ${v>0?'efeito-pos':'efeito-neg'}">${v>0?"+":""}${v} ${BetaIndicadores.LABELS[k]||k}</span>`)
          .join(" ");
        const emo = h.avaliacao==="boa"?"✅":h.avaliacao==="ruim"?"❌":"⚠️";
        return `<div class="historico-item">
          <div class="historico-item-round">${emo} Rod.${h.rodada} — ${h.titulo}</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">${efeitos}</div>
        </div>`;
      }).join("");
    }
  }
  if (recEl) {
    const recs = _gerarRecomendacoes(state);
    recEl.innerHTML = recs.length
      ? recs.map(r=>`<div class="rec-item"><div class="rec-item-title">${r.titulo}</div><div class="rec-item-desc">${r.desc}</div></div>`).join("")
      : `<span style="color:var(--text-muted);font-size:.78rem;">Recomendações aparecem conforme o jogo avança.</span>`;
  }
}

/* ════════════════════════════════════════════════════
   MEMÓRIA NARRATIVA
════════════════════════════════════════════════════ */
// Cache dos termos do glossário ordenados do mais longo para o mais curto
// (evita que um termo curto, ex: "SLA", "roube" a marcação de um termo
// mais longo que o contém, ex: nenhum caso aqui, mas é uma proteção geral).
let _glossarioTermosOrdenados = null;
function _getGlossarioTermosOrdenados() {
  if (!_glossarioTermosOrdenados) {
    _glossarioTermosOrdenados = GLOSSARIO_TERMOS
      .slice()
      .sort((a, b) => b.termo.length - a.termo.length);
  }
  return _glossarioTermosOrdenados;
}

function _escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Detecta termos do Glossário dentro de um texto puro (sem HTML) e os
// envolve em um <span> sublinhado e clicável, que abre a explicação do
// Glossário ao ser tocado. Cada termo só é destacado na primeira
// ocorrência dentro do texto, para não poluir visualmente o conteúdo.
function _destacarTermosGlossario(texto) {
  if (!texto) return texto;
  const termos = _getGlossarioTermosOrdenados();
  // Mapa de posições já ocupadas, para não destacar termos que se sobrepõem
  // (ex: "Capital Político" já marcado não deveria ter "Capital" marcado de novo).
  const ocupado = new Array(texto.length).fill(false);
  const marcacoes = []; // {start, end, termo, def}

  for (const g of termos) {
    // Aceita o termo com variações simples de plural (s no final) e ignora
    // parênteses internos do próprio nome do termo (ex: "Angel (Investidor-Anjo)").
    const nomesBusca = g.termo.split('/').map(s => s.trim().replace(/\s*\(.*?\)\s*/g, ''));
    for (const nome of nomesBusca) {
      if (!nome) continue;
      const pattern = new RegExp(`\\b${_escapeRegex(nome)}s?\\b`, 'i');
      const match = pattern.exec(texto);
      if (!match) continue;
      const start = match.index, end = start + match[0].length;
      let livre = true;
      for (let i = start; i < end; i++) { if (ocupado[i]) { livre = false; break; } }
      if (!livre) continue;
      for (let i = start; i < end; i++) ocupado[i] = true;
      marcacoes.push({ start, end, termo: g.termo, def: g.def });
      break; // já achou esse termo do glossário, não tenta os outros nomesBusca
    }
  }

  if (!marcacoes.length) return _escapeHtml(texto);

  marcacoes.sort((a, b) => a.start - b.start);
  let out = '';
  let cursor = 0;
  for (const m of marcacoes) {
    out += _escapeHtml(texto.slice(cursor, m.start));
    const trecho = _escapeHtml(texto.slice(m.start, m.end));
    const termoAttr = m.termo.replace(/'/g, "\\'");
    out += `<span class="termo-glossario" onclick="event.stopPropagation();BetaUI.abrirTermoGlossario('${termoAttr}')">${trecho}</span>`;
    cursor = m.end;
  }
  out += _escapeHtml(texto.slice(cursor));
  return out;
}

function _escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function abrirTermoGlossario(termo) {
  const item = GLOSSARIO_TERMOS.find(g => g.termo === termo);
  if (!item) return;
  abrirTooltipInfo(item.termo, `<p class="tooltip-body-text">${item.def}</p>`);
}

function _enriquecerDescricao(desc, state) {
  const hist  = state.history || [];
  const flags = state.storyState?.flags || [];
  const g     = state.gestor;
  const refs  = [];
  if (hist.length && state.currentRound > 2) {
    const ultimaRuim = hist.filter(h=>h.avaliacao==="ruim").slice(-1)[0];
    if (ultimaRuim) refs.push(`O impacto de "${ultimaRuim.escolha.slice(0,48)}..." ainda repercute na organização.`);
  }
  if (g.esgotamento >= 7) refs.push("Você sente o peso acumulado das rodadas anteriores.");
  if (flags.includes("lideranca_toxica")) refs.push("A tensão interna criada pelas últimas decisões é perceptível.");
  if (!refs.length) return desc;
  return `[${refs[0]}]\n\n${desc}`;
}

/* ════════════════════════════════════════════════════
   RECOMENDAÇÕES
════════════════════════════════════════════════════ */
function _gerarRecomendacoes(state) {
  const ind  = state.indicators;
  const bench= BENCHMARKS[state.sector] || {};
  const recs = [];
  Object.entries(ind).forEach(([k, v]) => {
    const b = bench[k]; if (!b) return;
    const label = BetaIndicadores.LABELS[k] || k;
    if (v < b-3) recs.push({ titulo:`⚠ ${label} abaixo do mercado`, desc:`${label} (${v}) está ${b-v} pts abaixo da média do setor (${b}).` });
    else if (v > b+3) recs.push({ titulo:`✅ ${label} acima da média`, desc:`${label} (${v}) está ${v-b} pts acima da média do setor (${b}). Mantenha.` });
  });
  const g = state.gestor;
  if (g.esgotamento >= 7) recs.push({ titulo:"🔋 Esgotamento crítico", desc:"Priorize decisões que reduzam pressão e resgatem capital político." });
  if (g.capitalPolitico <= 3) recs.push({ titulo:"🏛 Capital político baixo", desc:"O conselho está desconfiante. Decisões com retorno financeiro ou de clientes recuperam credibilidade." });
  return recs.slice(0, 4);
}

/* ════════════════════════════════════════════════════
   ESCOLHA / TIMER
════════════════════════════════════════════════════ */
function escolher(idx) {
  if (_escolhaFeita) return;
  if (Date.now() < _bloqueioAte) return; // bloqueia toque fantasma pós-transição
  _escolhaFeita = true;
  _pararTimer();

  // Animação: destaca escolha, desabilita opções
  document.querySelectorAll(".choice-card").forEach((b, i) => {
    b.disabled = true;
    if (i === idx) b.classList.add("chosen");
  });

  // Animar barras dos indicadores (feedback visual imediato)
  document.querySelectorAll(".game-ind-bar").forEach(bar => {
    bar.classList.add("deciding");
    setTimeout(() => bar.classList.remove("deciding"), 600);
  });

  // Atualiza sessão ativa no Firestore (Option B — por evento, não heartbeat)
  _atualizarSessaoAtiva();

  // Pequena pausa para a animação ser vista antes de processar
  setTimeout(() => processarEscolha(idx), 180);
}

/* ════════════════════════════════════════════════════
   FEEDBACK DE OMISSÃO — tela diferenciada quando o tempo esgota
════════════════════════════════════════════════════ */
function mostrarFeedbackOmissao({ faseLabel, rodadaTitulo, efeitos, efeitosGestor }, callback) {
  _feedbackCallback = callback;
  mostrarTela('screen-feedback');

  // Badge: vermelho com ícone de relógio
  const badge = document.getElementById('fb-veredito-badge');
  if (badge) { badge.className = 'verdict-badge verdict-ruim'; badge.textContent = '⏰'; }

  const lbl = document.getElementById('fb-veredito-label');
  if (lbl) { lbl.textContent = 'TEMPO ESGOTADO'; lbl.style.color = 'var(--danger)'; }

  const sub = document.getElementById('fb-veredito-sub');
  if (sub) sub.textContent = 'Você não respondeu a tempo';

  // Contexto da rodada
  const escolhaEl = document.getElementById('fb-escolha-texto');
  if (escolhaEl) escolhaEl.textContent = `"${rodadaTitulo}" — ${faseLabel}`;

  // Explicação
  const expEl = document.getElementById('fb-explicacao-texto');
  if (expEl) expEl.textContent =
    'A omissão tem custo. Em gestão, a indecisão raramente é neutra — ela cria vácuos que o mercado, a equipe e os stakeholders preenchem do jeito deles. As consequências abaixo refletem o impacto de não agir a tempo.';

  // Impactos negativos
  const grid = document.getElementById('fb-impactos-grid');
  if (grid) {
    const chips = Object.entries(efeitos)
      .filter(([, v]) => v !== 0)
      .map(([k, v]) => {
        const nome = BetaIndicadores.LABELS[k] || k;
        const cor  = v > 0 ? 'var(--good)' : 'var(--danger)';
        return `<div class="fb-chip"><span class="fb-chip-val" style="color:${cor}">${v > 0 ? '+' : ''}${v}</span><span class="fb-chip-nome">${nome}</span></div>`;
      }).join('');

    // Efeito no gestor
    const gestorChips = Object.entries(efeitosGestor || {})
      .filter(([, v]) => v !== 0)
      .map(([k, v]) => {
        const labels = { capitalPolitico: '👔 Capital Político', esgotamento: '😓 Esgotamento' };
        const nome = labels[k] || k;
        const cor  = v > 0 ? 'var(--danger)' : 'var(--good)'; // esgotamento+ é ruim
        return `<div class="fb-chip"><span class="fb-chip-val" style="color:${cor}">${v > 0 ? '+' : ''}${v}</span><span class="fb-chip-nome">${nome}</span></div>`;
      }).join('');

    grid.innerHTML = chips + gestorChips ||
      '<span style="font-size:.8rem;color:var(--text-muted)">Nenhum impacto mensurável desta vez.</span>';
  }

  // Esconde "melhor alternativa" (não faz sentido em omissão)
  const altEl = document.getElementById('fb-melhor-alt');
  if (altEl) altEl.style.display = 'none';

  // Limpa seções que podem ter conteúdo de partidas/rodadas anteriores
  const histEl  = document.getElementById('fb-historico');
  const histLst = document.getElementById('fb-historico-lista');
  if (histEl)  histEl.style.display  = 'none';
  if (histLst) histLst.innerHTML     = '';

  const gestorSec = document.getElementById('fb-gestor');
  const gestorGrid = document.getElementById('fb-gestor-grid');
  if (gestorSec)  gestorSec.style.display  = 'none';
  if (gestorGrid) gestorGrid.innerHTML     = '';

  const stakeholderEl = document.getElementById('fb-stakeholder');
  if (stakeholderEl) stakeholderEl.style.display = 'none';

  // Mostra banner de omissão
  const omissaoBanner = document.getElementById('fb-omissao-banner');
  if (omissaoBanner) omissaoBanner.style.display = '';
}

let _presencaInicializada = false;

// Registra presença no RTDB quando o jogador está na tela inicial (sem partida ativa)
async function _registrarPresencaHome() {
  try {
    if (!_player?.uid || !window.GSPRtdb) return;
    const { db, ref, set, onDisconnect } = window.GSPRtdb;
    const presRef = ref(db, `presence/${_player.uid}`);

    await set(presRef, {
      nome:        _player.nome || 'Jogador',
      setor:       '',
      rodada:      0,
      companyName: '',
      versao:      _versaoAtual || '',
      ts:          Date.now(),
      status:      'home', // diferencia de quem está em partida
      online:      true,
    });

    if (!_presencaInicializada) {
      onDisconnect(presRef).remove();
      _presencaInicializada = true;
    }
  } catch(e) { /* silencioso */ }
}

// Atualiza presença no Firebase Realtime Database
// Chamada a cada escolha do jogador; onDisconnect garante limpeza automática
async function _atualizarSessaoAtiva() {
  try {
    if (!_player?.uid) return;
    const state = BetaState.get();
    if (!state) return;

    // — RTDB (preferido, tempo real) —
    if (window.GSPRtdb) {
      const { db, ref, set, onDisconnect } = window.GSPRtdb;
      const presRef = ref(db, `presence/${_player.uid}`);

      await set(presRef, {
        nome:        _player.nome || 'Jogador',
        setor:       state.sector || '',
        rodada:      state.currentRound || 0,
        companyName: state.companyName || '',
        versao:      _versaoAtual || '',
        ts:          Date.now(),
        online:      true,
      });

      // Configura remoção automática ao desconectar (só precisa fazer 1x)
      if (!_presencaInicializada) {
        onDisconnect(presRef).remove();
        _presencaInicializada = true;
      }
      return;
    }

    // — Fallback: Firestore REST (caso RTDB não esteja configurado) —
    if (!window.GSPAuth) return;
    const tok = await window.GSPAuth.getToken();
    if (!tok) return;
    const FS = `https://firestore.googleapis.com/v1/projects/under-pressure-49320/databases/default/documents`;
    const fields = {
      nome:        { stringValue: _player.nome || 'Jogador' },
      setor:       { stringValue: state.sector || '' },
      rodada:      { integerValue: String(state.currentRound || 0) },
      companyName: { stringValue: state.companyName || '' },
      versao:      { stringValue: _versaoAtual || '' },
      ts:          { integerValue: String(Date.now()) },
    };
    const mask = Object.keys(fields).map(k => `updateMask.fieldPaths=${k}`).join('&');
    fetch(`${FS}/sessoes/${_player.uid}?${mask}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    }).catch(() => {});
  } catch(e) { /* silencioso */ }
}

// Remove presença do RTDB ao sair/fechar a aba
function _removerPresenca() {
  try {
    if (!_player?.uid || !window.GSPRtdb) return;
    const { db, ref, set } = window.GSPRtdb;
    // Usa sendBeacon para garantir execução no unload
    const presRef = ref(db, `presence/${_player.uid}`);
    set(presRef, null).catch(() => {});
  } catch(e) {}
}
window.addEventListener('beforeunload', _removerPresenca);

function _iniciarTimer() {
  _pararTimer();
  if (!_settings.timer) return;
  _timerSegs = 90;
  const el = document.getElementById("timer-display");
  if (!el) return;
  el.classList.add("active"); el.classList.remove("danger");
  el.textContent = `⏱ ${_timerSegs}s`;
  _timerInterval = setInterval(() => {
    _timerSegs--;
    el.textContent = `⏱ ${_timerSegs}s`;
    if (_timerSegs <= 10) el.classList.add("danger");
    if (_timerSegs <= 0) { _pararTimer(); if (!_escolhaFeita) _escolherPorOmissao(); }
  }, 1000);
}

function _pararTimer() {
  clearInterval(_timerInterval); _timerInterval = null;
  const el = document.getElementById("timer-display");
  if (el) { el.classList.remove("active","danger"); el.textContent = ""; }
}

/* ════════════════════════════════════════════════════
   OMISSÃO — penalidade quando o tempo esgota
════════════════════════════════════════════════════ */

// Tabela de penalidade base por fase (% de queda nos indicadores relevantes)
const _OMISSAO_PENALIDADE = {
  diagnostico: { base: 6,  max: 10 }, // fase inicial — penalidade leve
  pressao:     { base: 10, max: 16 }, // fase do meio — penalidade moderada
  decisao:     { base: 15, max: 22 }, // fase crítica — penalidade severa
};

/**
 * Calcula os efeitos de omissão baseados nos indicadores que o round afeta.
 * Lê os effects de todas as choices e extrai os indicadores negativamente relevantes,
 * aplicando penalidade proporcional à fase da rodada.
 * @param {object} round   — round atual (com .fase e .choices)
 * @param {object} state   — estado do jogo (com .indicators e .currentRound)
 * @returns {{ efeitos: object, indicadoresAfetados: string[], faseLabel: string }}
 */
function _calcularPenalidadeOmissao(round, state) {
  const fase  = round.fase || 'pressao';
  const cfg   = _OMISSAO_PENALIDADE[fase] || _OMISSAO_PENALIDADE.pressao;

  // Coleta todos os indicadores mencionados pelas choices do round
  const frequencia = {}; // indicador → quantas choices o mencionam
  const somaNeg    = {}; // indicador → soma dos valores negativos (para priorizar os mais impactantes)

  (round.choices || []).forEach(c => {
    Object.entries(c.effects || {}).forEach(([k, v]) => {
      if (!frequencia[k]) { frequencia[k] = 0; somaNeg[k] = 0; }
      frequencia[k]++;
      if (v < 0) somaNeg[k] += Math.abs(v);
    });
  });

  // Filtra apenas indicadores que existem no estado atual do jogador
  const candidatos = Object.keys(frequencia).filter(k =>
    state.indicators[k] !== undefined && state.indicators[k] > 0
  );

  // Ordena por relevância: indicadores mais mencionados e com maior impacto negativo
  candidatos.sort((a, b) =>
    (frequencia[b] + somaNeg[b] * 0.5) - (frequencia[a] + somaNeg[a] * 0.5)
  );

  // Seleciona os 2-3 mais relevantes para penalizar
  const qtd      = candidatos.length >= 3 ? 3 : candidatos.length >= 2 ? 2 : 1;
  const alvos    = candidatos.slice(0, qtd);

  // Fallback: se não houver candidatos claros, penaliza financeiro + outro do setor
  if (alvos.length === 0) {
    const fallbacks = Object.keys(state.indicators).filter(k => state.indicators[k] > 0);
    alvos.push(...fallbacks.slice(0, 2));
  }

  // Distribui a penalidade: primeiro alvo leva mais, demais dividem o restante
  const efeitos = {};
  alvos.forEach((k, i) => {
    const fator = i === 0 ? 1.0 : i === 1 ? 0.6 : 0.4;
    // Penalidade é proporcional ao valor atual do indicador (não mata instantaneamente)
    const penalidade = Math.round(cfg.base * fator);
    efeitos[k] = -Math.min(penalidade, cfg.max, state.indicators[k]); // nunca vai abaixo de 0
  });

  const faseLabels = {
    diagnostico: 'Diagnóstico', pressao: 'Pressão', decisao: 'Decisão Crítica',
    fundacao: 'Fundação', crescimento: 'Crescimento', crise: 'Crise',
    consolidacao: 'Consolidação', expansao: 'Expansão',
  };

  return { efeitos, indicadoresAfetados: alvos, faseLabel: faseLabels[fase] || fase };
}

/**
 * Chamada quando o timer chega a zero e o jogador não escolheu.
 * Em vez de sortear uma alternativa, aplica consequências de omissão diretamente.
 */
function _escolherPorOmissao() {
  if (_escolhaFeita) return;
  _escolhaFeita = true;
  _pararTimer();

  const state = BetaState.get();
  if (!state) return;
  const round = state.gameRounds?.[state.currentRound];
  if (!round) return;

  // Pisca o timer no vermelho antes de sumir
  const timerEl = document.getElementById('timer-display');
  if (timerEl) {
    timerEl.textContent = '⏱ 0s';
    timerEl.classList.add('danger', 'active');
    setTimeout(() => timerEl.classList.remove('active', 'danger'), 800);
  }

  // Desabilita todas as choices (sem highlight — nenhuma foi escolhida)
  document.querySelectorAll('.choice-card').forEach(b => {
    b.disabled = true;
    b.style.opacity = '0.35';
  });

  // Calcula penalidade
  const { efeitos, indicadoresAfetados, faseLabel } = _calcularPenalidadeOmissao(round, state);

  // Aplica via engine com flag de omissão
  setTimeout(() => processarOmissao(efeitos, round, faseLabel), 350);
}

/* ════════════════════════════════════════════════════
   FEEDBACK
════════════════════════════════════════════════════ */
function mostrarFeedback(data, callback) {
  _feedbackCallback = callback;
  mostrarTela("screen-feedback");

  // Garante que o banner de omissão não vaze entre rodadas
  const _omBanner = document.getElementById('fb-omissao-banner');
  if (_omBanner) _omBanner.style.display = 'none';

  const corMap   = { boa:"var(--good)", media:"var(--warn)", ruim:"var(--danger)" };
  const iconMap  = { boa:"✅", media:"⚠️", ruim:"❌" };
  const labelMap = { boa:"BOA DECISÃO", media:"DECISÃO COM TRADE-OFFS", ruim:"MÁ DECISÃO" };
  const badgeClass = { boa:"verdict-boa", media:"verdict-media", ruim:"verdict-ruim" };
  const badge = document.getElementById("fb-veredito-badge");
  if (badge) { badge.className=`verdict-badge ${badgeClass[data.avaliacao]||"verdict-media"}`; badge.textContent=iconMap[data.avaliacao]||"⚠️"; }
  const lbl = document.getElementById("fb-veredito-label");
  if (lbl) { lbl.textContent=labelMap[data.avaliacao]||"DECISÃO"; lbl.style.color=corMap[data.avaliacao]; }
  document.getElementById("fb-veredito-sub").textContent   = data.avaliacao==="boa"?"Decisão acertada":data.avaliacao==="ruim"?"Decisão equivocada":"Decisão com trade-offs";
  document.getElementById("fb-escolha-texto").textContent  = data.escolhaTexto||"";
  document.getElementById("fb-explicacao-texto").textContent = data.ensinamento||"";
  // Impactos
  const grid = document.getElementById("fb-impactos-grid");
  if (grid) {
    const chipEfeitos = Object.entries(data.efeitos||{}).filter(([,v])=>v!==0);
    if (chipEfeitos.length) {
      _animarChips('fb-impactos-grid', chipEfeitos.map(([k,v]) => ({
        html: `<div class="fb-chip" data-positivo="${v>0}"><span class="fb-chip-val" style="color:${v>0?'var(--good)':'var(--danger)'}">${v>0?'+':''}${v}</span><span class="fb-chip-nome">${BetaIndicadores.LABELS[k]||k}</span></div>`,
        positivo: v > 0
      })));
    } else {
      grid.innerHTML = `<span style="font-size:.8rem;color:var(--text-muted)">Sem impacto direto.</span>`;
    }
  }
  // Melhor alternativa
  const altEl = document.getElementById("fb-melhor-alt");
  if (altEl) {
    const melhor = data.melhorAlternativa;
    const _scoreFB = efs => Object.values(efs || {}).reduce((s,v) => s+v, 0);
    const melhorEhMelhor = melhor && melhor.text !== data.escolhaTexto
      && _scoreFB(melhor.effects) > _scoreFB(data.efeitos);
    if (melhorEhMelhor) {
      altEl.style.display = "";
      document.getElementById("fb-alt-texto").textContent = melhor.text;
      document.getElementById("fb-alt-ensinamento").textContent = melhor.ensinamento||"";
      const efEl = document.getElementById("fb-alt-efeitos");
      if (efEl) {
        const altChips = Object.entries(melhor.effects||{}).filter(([,v])=>v!==0);
        if (altChips.length) {
          _animarChips('fb-alt-efeitos', altChips.map(([k,v]) => ({
            html: `<div class="fb-chip" data-positivo="${v>0}"><span class="fb-chip-val" style="color:${v>0?'var(--good)':'var(--danger)'};">${v>0?'+':''}${v}</span><span class="fb-chip-nome">${BetaIndicadores.LABELS[k]||k}</span></div>`,
            positivo: v > 0
          })));
        }
      }
    } else { altEl.style.display="none"; }
  }
  // Gestor
  const gestorEl=document.getElementById("fb-gestor"), gestorGrid=document.getElementById("fb-gestor-grid");
  if (gestorEl && gestorGrid) {
    const eg=data.efeitosGestor||{}, temEfeito=Object.values(eg).some(v=>v!==0);
    if (temEfeito) {
      gestorEl.style.display="";
      const labels={reputacaoInterna:"🧑 Reputação",capitalPolitico:"🏛 Cap. Político",esgotamento:"🔋 Esgotamento"};
      const gestorChips = Object.entries(eg).filter(([,v])=>v!==0);
      if (gestorChips.length) {
        _animarChips('fb-gestor-grid', gestorChips.map(([k,v]) => {
          const ruim = k==="esgotamento"?v>0:v<0;
          const cor  = ruim?"var(--danger)":"var(--purple)";
          return {
            html: `<div class="fb-chip" data-positivo="${!ruim}"><span class="fb-chip-val" style="color:${cor}">${v>0?'+':''}${v}</span><span class="fb-chip-nome">${labels[k]||k}</span></div>`,
            positivo: !ruim
          };
        }));
      }
    } else { gestorEl.style.display="none"; }
  }
  // Stakeholder
  const stEl=document.getElementById("fb-stakeholder");
  if (data.stakeholderReacao && stEl) {
    stEl.style.display="";
    document.getElementById("fb-st-icon").textContent=data.stakeholderReacao.icone||"👤";
    document.getElementById("fb-st-nome").textContent=data.stakeholderReacao.nome||"";
    document.getElementById("fb-st-txt").textContent=data.stakeholderReacao.texto||"";
  } else if (stEl) { stEl.style.display="none"; }
  // Evento
  const evEl=document.getElementById("fb-evento"), evTxt=document.getElementById("fb-evento-texto");
  if (data.eventoAtivo && evEl) { evEl.style.display=""; evTxt.textContent=`${data.eventoAtivo.titulo} amplificou os efeitos desta rodada.`; }
  else if (evEl) { evEl.style.display="none"; }
  // Notificações
  const notifEl=document.getElementById("fb-notif"), notifLst=document.getElementById("fb-notif-lista");
  if (notifEl && notifLst) {
    const notifs=[...(data.novasFlags||[]).map(f=>_textoFlag(f)),...(data.novasConquistas||[]).map(c=>`🏆 ${c}`)];
    if (notifs.length) { notifEl.style.display=""; notifLst.innerHTML=notifs.map(n=>`<div class="fb-notif-row">${n}</div>`).join(""); }
    else { notifEl.style.display="none"; }
  }
  // Histórico rápido
  const histEl=document.getElementById("fb-historico"), histLst=document.getElementById("fb-historico-lista");
  if (histEl && histLst && data.historico?.length) {
    histEl.style.display="";
    histLst.innerHTML=data.historico.slice(0,3).map(h=>{
      const emo=h.avaliacao==="boa"?"✅":h.avaliacao==="ruim"?"❌":"⚠️";
      return `<div class="historico-item"><div class="historico-item-round">${emo} Rod.${h.rodada} — ${h.titulo}</div></div>`;
    }).join("");
  } else if (histEl) { histEl.style.display="none"; }
}

function avancar() {
  if (!_feedbackCallback) return;
  const cb = _feedbackCallback;
  _feedbackCallback = null;
  _bloqueioAte = Date.now() + 400; // bloqueia escolher() durante transição

  // Dispara animação dos chips e avança ao terminar
  _dispararAnimacaoChips().then(() => cb());
}

/* ════════════════════════════════════════════════════
   RESULTADO FINAL
════════════════════════════════════════════════════ */
function renderResultado({ motivo, score, scoreGestor, gestor, indicators,
                           history, companyName, empresa, sector, epilogo, decisoesCruciais }) {
  mostrarTela("screen-result");
  _registrarResultado(score, scoreGestor, sector, companyName);
  const titulos={
    fim:           score>=70?"Mandato Concluído com Êxito":score>=45?"Mandato Concluído":"Mandato com Dificuldades",
    gameover:      "Colapso Operacional",
    omissao_gameover: "Paralisia Decisória",
    mandato_conselho: "Encerrado pelo Conselho",
    mandato_burnout:  "Afastamento por Burnout",
  };
  const subs={
    fim:           `Você completou as ${BetaState.get()?.totalRounds||10} rodadas. Veja o balanço do seu mandato.`,
    gameover:      "Um indicador zerou. A empresa entrou em colapso.",
    omissao_gameover: "A recusa em decidir no momento certo destruiu a empresa. Omissão é também uma escolha — e a mais cara de todas.",
    mandato_conselho: "Seu capital político se esgotou e o conselho encerrou seu mandato.",
    mandato_burnout:  "O esgotamento chegou ao limite e você precisou se afastar.",
  };
  const motivoLabels = {
    fim:              "Relatório Final",
    gameover:         "Colapso Operacional",
    omissao_gameover: "Paralisia Decisória",
    mandato_conselho: "Mandato Encerrado pelo Conselho",
    mandato_burnout:  "Afastamento por Burnout",
  };
  document.getElementById("result-motivo-label").textContent = motivoLabels[motivo] || motivo.replace(/_/g," ").toUpperCase();
  document.getElementById("result-title").textContent    = titulos[motivo]||"Mandato Encerrado";
  document.getElementById("result-subtitle").textContent = subs[motivo]||"";

  // Identidade visual por motivo
  document.getElementById("screen-result")?.setAttribute("data-motivo", motivo);
  const motivoEl = document.getElementById("result-motivo-label");
  if (motivoEl) motivoEl.style.color = motivo==="omissao_gameover"?"var(--warn)":motivo==="gameover"?"var(--danger)":motivo==="fim"?"var(--good)":"var(--text-muted)";
  const omBanner = document.getElementById("result-omissao-banner");
  if (omBanner) omBanner.style.display = motivo==="omissao_gameover" ? "" : "none";

  const corEmp=score>=70?"var(--good)":score>=45?"var(--warn)":"var(--danger)";
  const corGes=scoreGestor>=70?"var(--purple)":scoreGestor>=45?"var(--warn)":"var(--danger)";
  const numEl=document.getElementById("result-score-num"), mgEl=document.getElementById("result-manager-num");
  if (numEl){numEl.textContent=score; numEl.style.color=corEmp;}
  if (mgEl) {mgEl.textContent=scoreGestor; mgEl.style.color=corGes;}
  // Epílogo
  const epilogoSec=document.getElementById("result-epilogo-section"), epilogoEl=document.getElementById("result-epilogo");
  if (epilogo && epilogoEl && epilogoSec) {
    epilogoSec.style.display="";
    epilogoEl.innerHTML=`<div class="result-epilogo-titulo">${epilogo.titulo}</div><div class="result-epilogo-desc">${epilogo.descricao}</div>`;
  } else if (epilogoSec) { epilogoSec.style.display="none"; }
  // Indicadores com benchmark
  const indEl=document.getElementById("result-indicators");
  if (indEl) {
    const bench=BENCHMARKS[sector]||{};
    indEl.innerHTML=Object.entries(indicators).map(([k,v])=>{
      const cor=BetaIndicadores.corNivel(v), label=BetaIndicadores.LABELS[k]||k, b=bench[k];
      const diff=b?(v>b?`+${v-b} acima`:v<b?`${v-b} abaixo`:"na média"):"";
      return `<div class="result-ind-card">
        <div class="result-ind-label">${label}</div>
        <div class="result-ind-val" style="color:${cor}">${v}<span style="font-size:.7rem;color:var(--text-muted)">/20</span></div>
        ${diff?`<div class="result-ind-level" style="color:${cor}">${diff}</div>`:""}
      </div>`;
    }).join("");
  }
  // Gestor final
  const gestorGrid=document.getElementById("result-gestor-grid");
  if (gestorGrid) {
    const g=gestor, esgCor=g.esgotamento>=7?"var(--danger)":g.esgotamento>=5?"var(--warn)":"var(--good)";
    gestorGrid.innerHTML=`
      <div class="gestor-item"><div class="gestor-item-val" style="color:var(--purple)">${g.reputacaoInterna}</div><div class="gestor-item-label">Reputação Interna</div></div>
      <div class="gestor-item"><div class="gestor-item-val" style="color:var(--purple)">${g.capitalPolitico}</div><div class="gestor-item-label">Capital Político</div></div>
      <div class="gestor-item"><div class="gestor-item-val" style="color:${esgCor}">${g.esgotamento}</div><div class="gestor-item-label">Esgotamento</div></div>`;
  }
  // Decisões cruciais — modo revisão
  const cruciaisSec=document.getElementById("result-cruciais-section"), cruciaisLst=document.getElementById("result-cruciais-lista");
  if (cruciaisSec && cruciaisLst && decisoesCruciais?.length) {
    cruciaisSec.style.display="";
    cruciaisLst.innerHTML=decisoesCruciais.map(d=>{
      const emo=d.avaliacao==="boa"?"✅":d.avaliacao==="ruim"?"❌":"⚠️";
      const efeitos=Object.entries(d.efeitos||{}).filter(([,v])=>v!==0).map(([k,v])=>{
        const cor=v>0?"var(--good)":"var(--danger)"; const nome=BetaIndicadores.LABELS[k]||k;
        return `<span style="color:${cor};font-size:.65rem;margin-right:8px">${v>0?"+":""}${v} ${nome}</span>`;
      }).join("");
      return `<div class="crucial-item">
        <div class="crucial-round">${emo} Rodada ${d.rodada} — ${d.titulo}</div>
        <div class="crucial-escolha">"${d.escolha ?? '⏰ Omissão — tempo esgotado'}"</div>
        <div style="margin:6px 0">${efeitos}</div>
        ${d.ensinamento?`<div style="font-size:.75rem;color:var(--t2);line-height:1.4;font-style:italic">${d.ensinamento}</div>`:""}
      </div>`;
    }).join("");
  } else if (cruciaisSec) { cruciaisSec.style.display="none"; }
}

/* ════════════════════════════════════════════════════
   GLOSSÁRIO
════════════════════════════════════════════════════ */
const GLOSSARIO_SECOES = [
  { categoria: "Indicadores e Mecânicas do Jogo", termos: [
    { termo:"SLA", def:"Acordo de Nível de Serviço (Service Level Agreement). Define metas de prazo e qualidade entre fornecedor e cliente. Ex: entregar 95% dos pedidos em até 48h." },
    { termo:"NPS", def:"Nota de lealdade dos clientes (Net Promoter Score). Calculado pela pergunta: 'De 0 a 10, quanto você recomendaria esta empresa?' Acima de 70 é excelente." },
    { termo:"Benchmark", def:"Referência média do mercado para um indicador. Exibido abaixo das barras durante o jogo — serve para comparar seu desempenho com o do setor." },
    { termo:"Capital Político", def:"Credibilidade do gestor junto ao conselho e parceiros estratégicos. Cai com decisões precipitadas ou resultados ruins. Sobe com alinhamento e entregas consistentes." },
    { termo:"Esgotamento", def:"Nível de desgaste pessoal do gestor. Ao atingir 10, é necessário se afastar por colapso e o mandato é encerrado antecipadamente." },
    { termo:"Flag", def:"Padrão de comportamento registrado ao longo do mandato. Influencia quais eventos aparecem e o desfecho final. Ex: Liderança Tóxica, Crescimento sem Caixa." },
    { termo:"Imprevisto", def:"Evento inesperado que altera os efeitos das decisões durante aquela rodada. Pode ser positivo ou negativo, e é influenciado pelo estado atual dos indicadores." },
    { termo:"Margem Operacional", def:"Quanto de cada real de receita sobra como lucro operacional. Ex: margem de 8% significa que a empresa lucra R$8 para cada R$100 vendidos." },
    { termo:"Mandato", def:"Uma partida completa do jogo, com 10 rodadas de decisões organizadas em fases que vão evoluindo conforme o desempenho da empresa (Fundação, Crescimento, Crise, Consolidação ou Expansão). O gestor conduz a empresa do início ao fim e recebe uma pontuação pelo resultado." },
    { termo:"Fases da Empresa", def:"Etapa em que a empresa se encontra dentro do mandato: Fundação (início), Crescimento, Crise (quando indicadores-chave estão muito ruins), Consolidação ou Expansão. A fase influencia o tom dos eventos e o peso das decisões." },
    { termo:"Situação Inicial", def:"Evento de abertura do mandato, sorteado entre cenários possíveis (ex: crise herdada, queda de reputação, concorrente agressivo). Já chega aplicando efeitos nos indicadores antes da primeira decisão." },
    { termo:"Boa Decisão / Decisão com Trade-offs / Má Decisão", def:"As três avaliações possíveis para cada escolha do jogador, mostradas na tela de resultado da rodada. 'Boa Decisão' indica acerto claro; 'Decisão com Trade-offs' indica ganhos e perdas simultâneos; 'Má Decisão' indica um custo que supera os benefícios." },
    { termo:"Alternativa Mais Indicada", def:"Quando a escolha do jogador não foi a ideal, o feedback da rodada mostra qual seria a opção mais indicada e o resultado que ela traria, para fins de aprendizado." },
    { termo:"Paralisia Decisória", def:"Forma de game over que ocorre quando o gestor acumula desgaste (Esgotamento) por deixar o timer expirar sem decidir repetidas vezes. Representa o colapso do gestor por excesso de indecisão e encerra o mandato antes do previsto." },
    { termo:"Decisão por Omissão", def:"O que acontece quando o Timer por Rodada está ativado e o tempo se esgota sem o jogador escolher uma opção. O jogo segue automaticamente com um resultado de omissão, diferente de uma escolha ativa, e aumenta o Esgotamento do gestor." },
    { termo:"Timer por Rodada", def:"Configuração opcional (90 segundos por decisão) que adiciona pressão de tempo real a cada rodada. Pode ser ativada ou desativada na tela de criação da empresa." },
    { termo:"Modo Treino", def:"Configuração opcional para jogar sem pontuação valer para o pódio ou histórico — ideal para aprender as mecânicas e testar estratégias sem compromisso com o resultado final." },
    { termo:"Reputação Interna", def:"Como o gestor é visto por dentro da própria empresa (equipe, diretoria, conselho). Diferente da Reputação de Mercado, que é a percepção externa de clientes e do setor." },
    { termo:"Reputação de Mercado", def:"Indicador que mede como a empresa é vista externamente — por clientes, concorrentes e pela imprensa do setor. Cai com crises públicas e sobe com boas entregas visíveis ao mercado." },
    { termo:"Pódio", def:"Ranking dos melhores mandatos já jogados, comparando a pontuação final entre partidas (suas e, quando aplicável, de outros jogadores)." },
  ]},
  { categoria: "Finanças e Investimento", termos: [
    { termo:"ARR", def:"Receita Recorrente Anual (Annual Recurring Revenue). Total de contratos ativos que a empresa recebe por ano. Principal métrica de saúde de empresas SaaS." },
    { termo:"Churn", def:"Taxa de cancelamento de clientes. Churn de 3,8% ao mês significa que 3,8% da base cancela todo mês — o que elimina metade da base em menos de 2 anos." },
    { termo:"CAC", def:"Custo de Aquisição de Cliente. Quanto a empresa gasta em marketing e vendas para conquistar um novo cliente. Quanto menor, melhor." },
    { termo:"Runway", def:"Tempo que a empresa sobrevive com o caixa atual, sem nova receita. Ex: 'temos 8 meses de runway' significa que o dinheiro acaba em 8 meses." },
    { termo:"Break-even", def:"Ponto de equilíbrio: quando receitas e custos se igualam. A empresa deixa de ter prejuízo e começa a lucrar a partir desse ponto." },
    { termo:"Capex", def:"Investimento em bens de capital fixo (Capital Expenditure). Ex: comprar máquinas, construir um galpão, instalar painéis solares. Diferente de custo operacional." },
    { termo:"Hedge Cambial", def:"Instrumento financeiro que trava o custo do dólar, protegendo empresas que têm custos em moeda estrangeira mas receita em reais." },
    { termo:"Payback", def:"Prazo em que um investimento se paga com a economia ou receita gerada. Ex: painéis solares com payback de 4,5 anos se pagam em 4 anos e 6 meses." },
    { termo:"IPO", def:"Abertura de capital na bolsa de valores (Initial Public Offering). A empresa vende ações ao público para captar dinheiro e cresce com capital dos investidores." },
    { termo:"M&A", def:"Fusões e Aquisições (Mergers & Acquisitions). Processo de compra, fusão ou incorporação de uma empresa por outra." },
    { termo:"Due Diligence", def:"Análise detalhada feita antes de uma aquisição ou investimento. Verifica riscos financeiros, jurídicos, trabalhistas e operacionais da empresa-alvo." },
    { termo:"Série A / Série B", def:"Rodadas de investimento numeradas. Série A é a primeira rodada significativa (geralmente R$5M a R$30M). Série B é a seguinte, para escalar o que foi validado." },
    { termo:"Angel (Investidor-Anjo)", def:"Pessoa física que investe capital próprio em startups em estágio inicial, geralmente em troca de uma participação pequena na empresa." },
    { termo:"Venture Capital", def:"Fundo de capital de risco que investe em startups com alto potencial de crescimento. Em troca, recebe participação societária." },
    { termo:"Private Equity", def:"Fundo que investe em empresas maiores e mais maduras (não startups), buscando eficiência operacional e retorno na venda futura." },
    { termo:"Stock Options", def:"Opção de compra de ações da empresa por um preço fixo. Benefício que alinha o interesse do colaborador com o crescimento da empresa a longo prazo." },
    { termo:"Switching Cost", def:"Custo que o cliente teria ao trocar de fornecedor — tempo de integração, retreinamento, risco de falha. Quanto maior, mais difícil é perder o cliente." },
  ]},
  { categoria: "Tecnologia e Produto", termos: [
    { termo:"SaaS", def:"Software como Serviço (Software as a Service). Modelo em que o software é cobrado mensalmente por assinatura, sem instalação local. Ex: Google Drive, Salesforce." },
    { termo:"Dívida Técnica", def:"Atalhos no código que aceleram a entrega hoje, mas criam problemas no futuro. Quanto maior a dívida, mais lento e instável o sistema fica com o tempo." },
    { termo:"Pivot", def:"Mudança radical de direção estratégica ou de modelo de negócio. Ex: uma startup de SaaS que decide virar plataforma de IA generativa." },
    { termo:"Product-Market Fit", def:"Encaixe produto-mercado. O momento em que o produto resolve tão bem um problema real que os clientes o recomendam naturalmente e o churn cai." },
    { termo:"Roadmap", def:"Plano de funcionalidades e melhorias do produto ordenado no tempo. Define o que será desenvolvido e em que sequência." },
    { termo:"ERP", def:"Sistema integrado de gestão empresarial (Enterprise Resource Planning). Centraliza finanças, estoque, RH e produção em um único sistema." },
    { termo:"IoT", def:"Internet das Coisas (Internet of Things). Sensores e equipamentos conectados à internet que enviam dados em tempo real. Ex: sensor de temperatura em câmara fria." },
    { termo:"DPO", def:"Encarregado de Proteção de Dados (Data Protection Officer). Profissional responsável pela conformidade com a LGPD. Nomeação obrigatória para empresas que tratam dados pessoais em escala." },
    { termo:"TMS", def:"Sistema de Gerenciamento de Transporte (Transportation Management System). Controla rotas, rastreamento e custos de frota em operações logísticas." },
    { termo:"Injeção SQL", def:"Tipo de ataque hacker que insere comandos maliciosos em campos de texto para acessar o banco de dados e roubar informações." },
  ]},
  { categoria: "Operações e Logística", termos: [
    { termo:"Lead Time", def:"Tempo total desde o pedido até a entrega ao cliente. Reduzir o lead time é um dos principais objetivos da gestão de operações." },
    { termo:"Kanban", def:"Sistema de produção puxada. Produz apenas o que foi vendido ou consumido, reduzindo estoque intermediário e tempo de entrega." },
    { termo:"Lean Manufacturing", def:"Manufatura enxuta. Filosofia que elimina desperdícios no processo produtivo — tempo ocioso, estoque excessivo, defeitos, movimentação desnecessária." },
    { termo:"Cold Chain", def:"Cadeia do frio. Transporte e armazenagem de produtos que precisam de temperatura controlada, como alimentos perecíveis e medicamentos." },
    { termo:"White Label", def:"Produto fabricado por uma empresa e vendido por outra com a sua própria marca. Ex: supermercado que vende arroz com a marca própria fabricado por terceiro." },
    { termo:"Dark Store", def:"Loja física convertida em mini-centro de distribuição para e-commerce, sem atendimento presencial. Foco em separação e envio rápido de pedidos." },
    { termo:"Click-and-Collect", def:"Modelo onde o cliente compra online e retira na loja física. Elimina o custo de frete e gera tráfego para o ponto físico." },
    { termo:"SKU", def:"Código único de produto (Stock Keeping Unit). Cada variação de produto (tamanho, cor, sabor) tem um SKU diferente para controle de estoque." },
    { termo:"Omnichannel", def:"Estratégia que integra todos os canais de venda e atendimento (loja física, site, app, telefone) em uma experiência única para o cliente." },
  ]},
  { categoria: "RH e Gestão de Pessoas", termos: [
    { termo:"Burnout", def:"Síndrome de esgotamento profissional causada por estresse crônico no trabalho. Pode levar ao afastamento. No jogo, representa colapso do gestor." },
    { termo:"Onboarding", def:"Processo de integração de um novo colaborador ou cliente. Inclui treinamentos, apresentações e adaptação à cultura e ferramentas da empresa." },
    { termo:"Rotatividade (Turnover)", def:"Percentual de funcionários que saem e precisam ser substituídos no ano. Alta rotatividade sinaliza problemas de gestão, cultura ou remuneração." },
  ]},
  { categoria: "Regulatório e Jurídico", termos: [
    { termo:"LGPD", def:"Lei Geral de Proteção de Dados. Regula o uso de dados pessoais no Brasil. Multas podem chegar a 2% do faturamento ou R$50 milhões por infração." },
    { termo:"ANPD", def:"Autoridade Nacional de Proteção de Dados. Órgão do governo que fiscaliza o cumprimento da LGPD e aplica penalidades em caso de violação." },
    { termo:"ISO 9001", def:"Norma internacional de gestão da qualidade. Certifica que a empresa tem processos controlados e rastreáveis. Exigida por grandes clientes industriais." },
    { termo:"ESG", def:"Critérios ambientais, sociais e de governança (Environmental, Social, Governance). Avaliados por investidores e clientes para decidir com quem fazer negócio." },
    { termo:"IFA", def:"Índice de Frequência de Acidentes. Mede o número de acidentes com afastamento por milhão de horas trabalhadas. Benchmark nacional: 8,2." },
    { termo:"EPI", def:"Equipamento de Proteção Individual. Capacete, luva, óculos, bota e outros itens obrigatórios por lei para proteção do trabalhador." },
    { termo:"CIPA", def:"Comissão Interna de Prevenção de Acidentes. Grupo de funcionários e gestores que acompanha as condições de segurança. Obrigatória em empresas com 20+ funcionários." },
    { termo:"CAT", def:"Comunicação de Acidente de Trabalho. Documento obrigatório emitido pelo empregador quando um funcionário sofre acidente ou doença ocupacional." },
    { termo:"MTE", def:"Ministério do Trabalho e Emprego. Órgão federal que fiscaliza as condições de trabalho, pode autuar empresas e interditar operações inseguras." },
  ]},
  { categoria: "Mercado e Estratégia", termos: [
    { termo:"B2B", def:"Business to Business. Empresa que vende para outras empresas (não para o consumidor final). Ex: software de gestão vendido para PMEs." },
    { termo:"B2C", def:"Business to Consumer. Empresa que vende diretamente ao consumidor final. Ex: loja de varejo, aplicativo de delivery." },
    { termo:"PME", def:"Pequena e Média Empresa. No Brasil, classificadas por faturamento anual: pequena até R$4,8M, média até R$300M." },
    { termo:"Pipeline Comercial", def:"Conjunto de oportunidades de venda em andamento. 'Pipeline cheio' significa muitos negócios potenciais sendo negociados." },
    { termo:"Indústria 4.0", def:"Quarta revolução industrial. Integração de automação, robótica, IoT e inteligência artificial nos processos industriais para maior eficiência e rastreabilidade." },
    { termo:"Verticalização", def:"Estratégia de especializar a empresa em um setor ou nicho específico, ao invés de atender mercados variados. Cria diferencial técnico e relacionamentos mais profundos." },
    { termo:"Interdependência", def:"Relação causal entre indicadores. Ex: na logística, frota deteriorada → segurança cai → RH cai → resultado financeiro cai." },
  ]},
];

// Lista plana derivada das seções, mantida para qualquer código legado
// que ainda espere o formato antigo (array simples de {termo, def}).
const GLOSSARIO_TERMOS = GLOSSARIO_SECOES.flatMap(s => s.termos);



let _glossarioAbaAtiva = "todos";

function _renderGlossarioTabs() {
  const tabsEl = document.getElementById("glossary-tabs");
  if (!tabsEl) return;
  const abas = [{ id: "todos", label: "Todos" }]
    .concat(GLOSSARIO_SECOES.map(s => ({ id: s.categoria, label: s.categoria })));
  tabsEl.innerHTML = abas.map(a =>
    `<button class="glossary-tab-btn${a.id === _glossarioAbaAtiva ? " active" : ""}" onclick="BetaUI.selecionarAbaGlossario('${a.id.replace(/'/g, "\\'")}')">${a.label}</button>`
  ).join("");
}

function selecionarAbaGlossario(abaId) {
  _glossarioAbaAtiva = abaId;
  _renderGlossarioTabs();
  const busca = document.getElementById('glossary-search');
  _renderGlossario(busca ? busca.value : '');
}

function _renderGlossario(filtro) {
  const content = document.getElementById("glossary-content");
  if (!content) return;
  const termoFiltro = (filtro || "").trim().toLowerCase();

  const secoesFiltradas = GLOSSARIO_SECOES
    .filter(secao => _glossarioAbaAtiva === "todos" || secao.categoria === _glossarioAbaAtiva)
    .map(secao => ({
      categoria: secao.categoria,
      termos: termoFiltro
        ? secao.termos.filter(g =>
            g.termo.toLowerCase().includes(termoFiltro) ||
            g.def.toLowerCase().includes(termoFiltro))
        : secao.termos,
    }))
    .filter(secao => secao.termos.length > 0);

  if (secoesFiltradas.length === 0) {
    content.innerHTML = `<div class="glossary-empty">Nenhum termo encontrado para "${filtro}".</div>`;
    return;
  }

  // Na aba "Todos", mostra o título de cada seção para orientação visual.
  // Numa aba específica, omite o título repetido (já está selecionado acima).
  const mostrarTitulo = _glossarioAbaAtiva === "todos";

  content.innerHTML = secoesFiltradas.map(secao => `
    <div class="glossary-section">
      ${mostrarTitulo ? `<div class="glossary-section-title">${secao.categoria}</div>` : ""}
      ${secao.termos.map(g =>
        `<div class="glossary-term"><div class="glossary-term-word">${g.termo}</div><div class="glossary-term-def">${g.def}</div></div>`
      ).join("")}
    </div>
  `).join("");
}

function filtrarGlossario(valor) {
  _renderGlossario(valor);
}

function openGlossary() {
  const el=document.getElementById("overlay-glossary");
  _abrirOverlay('overlay-glossary');
  const busca = document.getElementById('glossary-search');
  if (busca) busca.value = '';
  _glossarioAbaAtiva = "todos";
  _renderGlossarioTabs();
  _renderGlossario('');
}
function closeGlossary() { const el=document.getElementById("overlay-glossary"); _fecharOverlay('overlay-glossary'); }

/* ════════════════════════════════════════════════════
   CONFIGURAÇÕES
════════════════════════════════════════════════════ */
function openSettings() {
  _abrirOverlay('overlay-settings');
  _atualizarToggleTimer();
  const cloudBtn = document.getElementById('toggle-cloud-btn');
  if (cloudBtn) {
    const on = _settings.cloudStatus !== false;
    cloudBtn.textContent = on ? 'ON' : 'OFF';
    cloudBtn.className = `toggle-btn ${on ? 'on' : 'off'}`;
  }
}
function closeSettings() { _fecharOverlay('overlay-settings'); }

function irParaConfig() {
  mostrarTela('screen-config');
  _atualizarTelaConfig();
}

function _atualizarTelaConfig() {
  // Timer
  // Timer agora está na seleção de setor (sector-toggle-timer-btn)
  const sectorTimerBtn = document.getElementById('sector-toggle-timer-btn');
  if (sectorTimerBtn) {
    sectorTimerBtn.textContent = _settings.timer ? 'ON' : 'OFF';
    sectorTimerBtn.className = `toggle-btn ${_settings.timer ? 'on' : 'off'}`;
  }
  // Cloud
  const cloudBtn = document.getElementById('config-toggle-cloud-btn');
  if (cloudBtn) {
    const on = _settings.cloudStatus !== false;
    cloudBtn.textContent = on ? 'ON' : 'OFF';
    cloudBtn.className = `toggle-btn ${on ? 'on' : 'off'}`;
  }
  // Fullscreen
  _atualizarBotaoFullscreen();
  // Status online
  const statusBtn = document.getElementById('config-toggle-status-btn');
  if (statusBtn) {
    const on = _settings.mostrarStatus === true;
    statusBtn.textContent = on ? 'ON' : 'OFF';
    statusBtn.className = `toggle-btn ${on ? 'on' : 'off'}`;
  }
  // Nome atual
  const nomeEl = document.getElementById('config-nome-atual');
  if (nomeEl) nomeEl.textContent = _player?.nome || '—';
  // Foto de perfil — só mostra se logado com Google
  const rowFoto = document.getElementById('config-row-foto');
  if (rowFoto) {
    const isGoogle = _player?.tipo === 'google' || window.GSPAuth?.currentUser?.providerData?.some(p => p.providerId === 'google.com');
    rowFoto.style.display = isGoogle ? 'flex' : 'none';
    if (isGoogle) {
      const fotoOn = _settings.fotoPerfil === true;
      const fotoBtn = document.getElementById('toggle-foto-btn');
      if (fotoBtn) {
        fotoBtn.textContent = fotoOn ? 'ON' : 'OFF';
        fotoBtn.className = `toggle-btn ${fotoOn ? 'on' : 'off'}`;
      }
    }
  }
}

function toggleMostrarStatus() {
  _settings.mostrarStatus = !_settings.mostrarStatus;
  LS.set(SK.SETTINGS, _settings);
  const btn = document.getElementById('config-toggle-status-btn');
  if (btn) {
    btn.textContent = _settings.mostrarStatus ? 'ON' : 'OFF';
    btn.className = `toggle-btn ${_settings.mostrarStatus ? 'on' : 'off'}`;
  }
  // Reaplicar o status atual com a nova configuração
  const dot = document.getElementById('firebase-status-dot');
  const isOnline = dot?.classList.contains('firebase-dot--online');
  const isOffline = dot?.classList.contains('firebase-dot--offline');
  if (isOffline) {
    _setFirebaseStatus('offline');
  } else if (isOnline) {
    // Re-lê o ping exibido atualmente
    const pingEl = document.getElementById('firebase-ping');
    const pingMs = pingEl?.textContent ? parseInt(pingEl.textContent) : null;
    _setFirebaseStatus('online', pingMs);
  } else {
    _setFirebaseStatus('connecting');
  }
}

function toggleTimerSetting() {
  _settings.timer = !_settings.timer;
  LS.set(SK.SETTINGS, _settings);
  _atualizarToggleTimer();
  // Atualiza botão na seleção de setor (novo local)
  const sectorBtn = document.getElementById('sector-toggle-timer-btn');
  if (sectorBtn) {
    sectorBtn.textContent = _settings.timer ? 'ON' : 'OFF';
    sectorBtn.className = `toggle-btn ${_settings.timer ? 'on' : 'off'}`;
  }
}

function toggleCloudStatus() {
  _settings.cloudStatus = !_settings.cloudStatus;
  LS.set(SK.SETTINGS, _settings);
  // Overlay
  const btn = document.getElementById('toggle-cloud-btn');
  if (btn) { btn.textContent = _settings.cloudStatus ? 'ON' : 'OFF'; btn.className = `toggle-btn ${_settings.cloudStatus ? 'on' : 'off'}`; }
  // Tela config
  const configBtn = document.getElementById('config-toggle-cloud-btn');
  if (configBtn) { configBtn.textContent = _settings.cloudStatus ? 'ON' : 'OFF'; configBtn.className = `toggle-btn ${_settings.cloudStatus ? 'on' : 'off'}`; }
}

function toggleFotoPerfil() {
  const fotoOn = _settings.fotoPerfil === true;
  if (!fotoOn) {
    // Vai ativar — pede confirmação
    _abrirOverlay('overlay-confirmar-foto');
  } else {
    // Vai desativar — faz direto
    _settings.fotoPerfil = false;
    LS.set(SK.SETTINGS, _settings);
    const btn = document.getElementById('toggle-foto-btn');
    if (btn) { btn.textContent = 'OFF'; btn.className = 'toggle-btn off'; }
    _atualizarHome();
  }
}

function confirmarFotoPerfil() {
  _fecharOverlay('overlay-confirmar-foto');
  _settings.fotoPerfil = true;
  LS.set(SK.SETTINGS, _settings);
  const btn = document.getElementById('toggle-foto-btn');
  if (btn) { btn.textContent = 'ON'; btn.className = 'toggle-btn on'; }
  _atualizarHome();
}

function cancelarFotoPerfil() {
  _fecharOverlay('overlay-confirmar-foto');
}

function abrirEditarNome() {
  const input = document.getElementById('input-novo-nome');
  if (input) input.value = _player?.nome || '';
  _abrirOverlay('overlay-editar-nome');
  setTimeout(() => input?.focus(), 200);
}

function fecharEditarNome() { _fecharOverlay('overlay-editar-nome'); }

async function salvarNome() {
  const input = document.getElementById('input-novo-nome');
  const novoNome = input?.value?.trim();
  if (!novoNome || novoNome.length < 2) { mostrarAviso('Nome muito curto. Mínimo 2 caracteres.'); return; }
  if (novoNome.length > 30) { mostrarAviso('Nome muito longo. Máximo 30 caracteres.'); return; }
  if (_player) {
    _player.nome = novoNome;
    LS.set(SK.PLAYER, _player);
    window._player = _player;
  }
  fecharEditarNome();
  const nomeEl = document.getElementById('config-nome-atual');
  if (nomeEl) nomeEl.textContent = novoNome;
  // Tenta salvar no Firestore se logado
  if (_player?.uid && window.GSPAuth?.isReady()) {
    try {
      const tok = await window.GSPAuth.getToken();
      const url = `https://firestore.googleapis.com/v1/projects/under-pressure-49320/databases/default/documents/usuarios/${_player.uid}?updateMask.fieldPaths=nome`;
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { nome: { stringValue: novoNome } } })
      });
    } catch(e) { /* silencioso */ }
  }
  mostrarAviso('Nome atualizado!');
}

function _atualizarToggleTimer() {
}

/* ════════════════════════════════════════════════════
   UTILIDADES
════════════════════════════════════════════════════ */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.()
      .then(() => { _atualizarBotaoFullscreen(); })
      .catch(() => mostrarAviso("Tela cheia não disponível neste dispositivo."));
  } else {
    document.exitFullscreen?.();
    _atualizarBotaoFullscreen();
  }
}
function _atualizarBotaoFullscreen() {
  const isFs = !!document.fullscreenElement;
  const label = isFs ? "✕ Sair" : "⛶ Ativar";
  const btn = document.getElementById("settings-fs-btn");
  if (btn) btn.textContent = label;
  const configBtn = document.getElementById("config-fs-btn");
  if (configBtn) configBtn.textContent = label;
}
document.addEventListener("fullscreenchange", _atualizarBotaoFullscreen);

function reverTutorial() {
  // Não remove gsp_tutorial_done — evita que o tutorial reapareça
  // no boot caso o usuário feche o app sem terminar de ver
  _fecharOverlay('overlay-settings');
  // Salva a tela de origem para pularTutorial saber para onde voltar
  const telaAtual = document.querySelector('.screen.active')?.id;
  window._tutorialOrigem = telaAtual || 'screen-home';
  _tutorialStep = 0;
  const slides = document.querySelectorAll('.tutorial-slide');
  const dots   = document.querySelectorAll('.tut-dot');
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  slides[0]?.classList.add('active');
  dots[0]?.classList.add('active');
  const prevBtn = document.getElementById('tut-prev');
  const nextBtn = document.getElementById('tut-next');
  if (prevBtn) prevBtn.style.display = 'none';
  if (nextBtn) nextBtn.textContent = 'Próximo →';
  mostrarTela('screen-tutorial');
}

function reiniciar() { _pararVerificacaoManutencao(); LS.remove(SK.SESSION); _aplicarTemaSetor(null); mostrarTela("screen-home"); }

function _showToast(msg, tipo = "info", duracao = 3200) {
  const container = document.getElementById("toast");
  if (!container) return;
  const div = document.createElement("div");
  div.className = "toast-msg";
  const cores = {
    erro:    { bg:"rgba(231,76,60,.92)",  borda:"rgba(231,76,60,.5)",  icone:"❌" },
    aviso:   { bg:"rgba(243,156,18,.92)", borda:"rgba(243,156,18,.5)", icone:"⚠️" },
    ok:      { bg:"rgba(46,204,113,.92)", borda:"rgba(46,204,113,.5)", icone:"✅" },
    info:    { bg:"var(--bg4)",           borda:"var(--line2)",        icone:"ℹ️" },
    critico: { bg:"rgba(192,57,43,.95)",  borda:"rgba(192,57,43,.6)",  icone:"🚨" },
  };
  const c = cores[tipo] || cores.info;
  div.style.cssText = `background:${c.bg};border-color:${c.borda};`;
  div.textContent = `${c.icone} ${msg}`;
  container.appendChild(div);
  setTimeout(() => {
    div.classList.add("removing");
    setTimeout(() => div.remove(), 220);
  }, duracao);
}

function mostrarErro(msg)           { _showToast(msg, "info",    3200); }
function mostrarSucesso(msg)        { _showToast(msg, "ok",      2800); }
function mostrarAviso(msg)          { _showToast(msg, "aviso",   3200); }
function mostrarErroCritico(msg)    { _showToast(msg, "erro",    3500); }

function _mostrarCriticalToast(msg) { _showToast(msg, "critico", 3500); }

function _textoFlag(flag) {
  const MAPA={
    lideranca_toxica:"⚠️ Liderança Tóxica — padrão de decisões prejudicou o time",
    crescimento_sem_caixa:"⚠️ Decisões ruins drenaram o caixa",
    demissao_em_massa:"⚠️ Ondas de corte afetaram a cultura organizacional",
    rh_negligenciado:"⚠️ RH negligenciado — nenhuma decisão favoreceu o time",
    ignorou_seguranca:"⚠️ Vulnerabilidades de segurança foram ignoradas",
    crescimento_saudavel:"🟢 Sequência de 5 decisões corretas",
    investiu_em_inovacao:"🟢 Cultura de inovação estabelecida",
    gestor_de_crise:"🔥 Empresa recuperada de situação crítica",
    gestor_esgotado:"🔋 Esgotamento em nível crítico",
  };
  return MAPA[flag] || `🔔 ${flag}`;
}

/* ════════════════════════════════════════════════════
   REGISTRO NO ENGINE + BOOT
════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════
   TUTORIAL
════════════════════════════════════════════════════ */
let _tutorialStep = 0;
const _TUTORIAL_TOTAL = 4;

function pularTutorial() {
  localStorage.setItem('gsp_tutorial_done', '1'); // cache local, evita re-checar Firestore na mesma sessão
  if (_player?.uid) _marcarTutorialVistoRemoto(_player.uid); // fonte de verdade real
  // Se veio de dentro do jogo (via reverTutorial), volta pra tela de origem
  const origem = window._tutorialOrigem;
  window._tutorialOrigem = null;
  const TELAS_JOGO = ['screen-game', 'screen-intro', 'screen-feedback', 'screen-result'];
  if (origem && TELAS_JOGO.includes(origem)) {
    mostrarTela(origem);
    return;
  }
  _atualizarHome();
  mostrarTela('screen-home');
  _verificarSessaoSalva();
}

function tutorialStep(dir) {
  const slides = document.querySelectorAll('.tutorial-slide');
  const dots   = document.querySelectorAll('.tut-dot');
  slides[_tutorialStep]?.classList.remove('active');
  dots[_tutorialStep]?.classList.remove('active');
  _tutorialStep = Math.max(0, _tutorialStep + dir);
  if (_tutorialStep >= _TUTORIAL_TOTAL) { pularTutorial(); return; }
  slides[_tutorialStep]?.classList.add('active');
  dots[_tutorialStep]?.classList.add('active');
  const prevBtn = document.getElementById('tut-prev');
  const nextBtn = document.getElementById('tut-next');
  if (prevBtn) prevBtn.style.display = _tutorialStep > 0 ? '' : 'none';
  if (nextBtn) nextBtn.textContent = _tutorialStep === _TUTORIAL_TOTAL - 1 ? 'Começar →' : 'Próximo →';
}

// BUG #7 FIX: dots do tutorial agora são clicáveis
function irParaSlide(step) {
  const slides = document.querySelectorAll('.tutorial-slide');
  const dots   = document.querySelectorAll('.tut-dot');
  slides[_tutorialStep]?.classList.remove('active');
  dots[_tutorialStep]?.classList.remove('active');
  _tutorialStep = Math.max(0, Math.min(step, _TUTORIAL_TOTAL - 1));
  slides[_tutorialStep]?.classList.add('active');
  dots[_tutorialStep]?.classList.add('active');
  const prevBtn = document.getElementById('tut-prev');
  const nextBtn = document.getElementById('tut-next');
  if (prevBtn) prevBtn.style.display = _tutorialStep > 0 ? '' : 'none';
  if (nextBtn) nextBtn.textContent = _tutorialStep === _TUTORIAL_TOTAL - 1 ? 'Começar →' : 'Próximo →';
}

/* ════════════════════════════════════════════════════
   PERFIL DO JOGADOR
════════════════════════════════════════════════════ */
async function irParaPerfil() {
  // Configura hold 3s no avatar para admin
  setTimeout(() => {
    const av = document.getElementById('perfil-avatar');
    if (av && !av._adminListened) {
      av._adminListened = true;
      av.addEventListener('mousedown',  _iniciarHoldAdmin);
      av.addEventListener('touchstart', _iniciarHoldAdmin, { passive: true });
      av.addEventListener('mouseup',    _cancelarHoldAdmin);
      av.addEventListener('mouseleave', _cancelarHoldAdmin);
      av.addEventListener('touchend',   _cancelarHoldAdmin);
    }
  }, 500);
  mostrarTela('screen-perfil');
  _renderizarPerfilMsgs();
  const playerSalvo = LS.get(SK.PLAYER);
  if (playerSalvo) { _player = playerSalvo; window._player = _player; }
  const isGuest = _player?.tipo === "guest" || !_player?.uid;

  // Renderiza IMEDIATAMENTE com dados locais
  const hist = LS.get(isGuest ? SK.HIST_GUEST : SK.HISTORICO) || [];
  const nome = _player?.nome || 'Jogador';

  // Avatar
  const av = document.getElementById('perfil-avatar');
  if (av) {
    const photoURL = window.GSPAuth?.currentUser?.photoURL;
    const fotoOn = LS.get(SK.SETTINGS)?.fotoPerfil === true;
    if (photoURL && fotoOn) {
      av.innerHTML = `<img src="${photoURL}" alt="foto" draggable="false" oncontextmenu="return false" style="width:100%;height:100%;object-fit:cover;border-radius:50%;-webkit-touch-callout:none;pointer-events:none;">`;
    } else {
      av.textContent = nome.charAt(0).toUpperCase();
    }
  }
  const pn = document.getElementById('perfil-nome');
  if (pn) pn.textContent = nome;

  // ID curto + email (só para logados)
  const metaRow = document.getElementById('perfil-meta-row');
  if (metaRow) {
    if (!isGuest && _player?.uid) {
      const idCurto = '#' + _player.uid.substring(0, 8).toUpperCase();
      const email   = _player.email || '';
      metaRow.innerHTML = `
        <div class="perfil-id-badge" onclick="BetaUI._copiarId('${idCurto}')" title="Clique para copiar">${idCurto} <span style="font-size:.65rem;opacity:.6">⎘</span></div>
        ${email ? `<div class="perfil-email">${email}</div>` : ''}`;
    } else {
      metaRow.innerHTML = `<div class="perfil-id-badge" style="opacity:.5">Convidado</div>`;
    }
  }

  // Botão logout visível só para logados
  const logoutBtn = document.getElementById('perfil-logout-btn');
  if (logoutBtn) logoutBtn.style.display = (!isGuest && _player?.uid) ? '' : 'none';

  const total  = hist.length;
  const melhor = total ? Math.max(...hist.map(h => h.score)) : 0;
  const media  = total ? Math.round(hist.reduce((a,h) => a + h.score, 0) / total) : 0;
  const boas   = hist.filter(h => h.score >= 70).length;
  const setorCount = {};
  hist.forEach(h => { setorCount[h.sector] = (setorCount[h.sector] || 0) + 1; });
  const favEntry = Object.entries(setorCount).sort((a,b) => b[1]-a[1])[0];
  const icones = { tecnologia:'🚀', varejo:'🛒', logistica:'🚚', industria:'🏭' };
  const favLabel = favEntry ? `${icones[favEntry[0]]||''} ${favEntry[0]}` : '—';

  const sub = document.getElementById('perfil-subtitulo');
  if (sub) sub.textContent = `${total} mandato${total !== 1 ? 's' : ''} concluído${total !== 1 ? 's' : ''}`;

  const statsEl = document.getElementById('perfil-stats');
  if (statsEl) statsEl.innerHTML = [
    { val: total ? melhor : '—', label: 'Melhor Score' },
    { val: total ? media  : '—', label: 'Score Médio'  },
    { val: boas,                 label: 'Excelentes (70+)' },
    { val: favLabel,             label: 'Setor Favorito' },
  ].map(s => `<div class="perfil-stat">
    <div class="perfil-stat-val">${s.val}</div>
    <div class="perfil-stat-label">${s.label}</div>
  </div>`).join('');

  // Gráfico de evolução (últimas 10 partidas, do mais antigo ao mais recente)
  const grafEl = document.getElementById('perfil-grafico');
  if (grafEl) {
    const ultimas = hist.slice(0, 10).reverse();
    if (ultimas.length < 2) {
      grafEl.innerHTML = `<span style="color:var(--t3);font-size:.78rem">Jogue ao menos 2 partidas para ver a evolução.</span>`;
    } else {
      const max = 100, min = 0;
      const W = 280, H = 80, PAD = 10;
      const pts = ultimas.map((h, i) => {
        const x = PAD + (i / (ultimas.length - 1)) * (W - PAD * 2);
        const y = H - PAD - ((h.score - min) / (max - min)) * (H - PAD * 2);
        return { x, y, score: h.score, sector: h.sector };
      });
      const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
      // Area fill path
      const areaPath = `M${pts[0].x},${H - PAD} ` + pts.map(p => `L${p.x},${p.y}`).join(' ') + ` L${pts[pts.length-1].x},${H-PAD} Z`;
      const dots = pts.map((p, i) => {
        const cor = p.score >= 70 ? '#2ecc71' : p.score >= 45 ? '#f39c12' : '#e74c3c';
        return `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${cor}" stroke="var(--bg2)" stroke-width="1.5">
          <title>${icones[p.sector]||''} ${p.score} pts</title>
        </circle>`;
      }).join('');
      // Y axis labels
      const yLabels = [0,50,100].map(v => {
        const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
        return `<text x="1" y="${y+3}" font-size="7" fill="var(--t3)" font-family="monospace">${v}</text>`;
      }).join('');
      grafEl.innerHTML = `
        <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" style="overflow:visible">
          <defs>
            <linearGradient id="gfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--s-primary)" stop-opacity=".35"/>
              <stop offset="100%" stop-color="var(--s-primary)" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- Grid lines -->
          ${[0,50,100].map(v => {
            const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
            return `<line x1="${PAD}" y1="${y}" x2="${W-PAD}" y2="${y}" stroke="var(--line)" stroke-width="0.5" stroke-dasharray="3,3"/>`;
          }).join('')}
          ${yLabels}
          <!-- Area -->
          <path d="${areaPath}" fill="url(#gfGrad)"/>
          <!-- Line -->
          <polyline points="${polyline}" fill="none" stroke="var(--s-primary)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
          <!-- Dots -->
          ${dots}
        </svg>
        <div class="perfil-grafico-leg">
          <span style="color:#2ecc71">● Excelente</span>
          <span style="color:#f39c12">● Regular</span>
          <span style="color:#e74c3c">● Crítico</span>
        </div>`;
    }
  }

  const conquistas = _calcularConquistas(hist);
  const cqEl = document.getElementById('perfil-conquistas');
  const _prevUnlocked = JSON.parse(sessionStorage.getItem('gsp_prev_unlocked') || '[]');
  if (cqEl) {
    if (isGuest) {
      cqEl.innerHTML = `
        <div class="hist-guest-banner" style="margin:0;grid-column:1/-1">
          <div class="hist-guest-icon">🏆</div>
          <div class="hist-guest-title">Conquistas bloqueadas</div>
          <div class="hist-guest-desc">Crie uma conta para desbloquear conquistas e salvar seu progresso.</div>
          <button class="btn btn-primary hist-guest-btn" onclick="BetaUI.irParaAuth()">Criar conta grátis</button>
        </div>`;
    } else {
      cqEl.innerHTML = conquistas.map(c => `
      <div class="perfil-conquista ${c.unlocked ? 'unlocked' : ''}">
        <div class="perfil-conquista-icon">${c.unlocked ? c.icon : '🔒'}</div>
        <div>
          <div class="perfil-conquista-nome">${c.nome}</div>
          <div class="perfil-conquista-desc">${c.desc}</div>
        </div>
      </div>`).join('');
      const cards = cqEl.querySelectorAll('.perfil-conquista.unlocked');
      conquistas.filter(c => c.unlocked).forEach((c, i) => {
        if (!_prevUnlocked.includes(c.nome)) {
          setTimeout(() => cards[i]?.classList.add('new-unlock'), 200 + i * 120);
          setTimeout(() => cards[i]?.classList.remove('new-unlock'), 1200 + i * 120);
        }
      });
    }
  }
  sessionStorage.setItem('gsp_prev_unlocked', JSON.stringify(conquistas.filter(c => c.unlocked).map(c => c.nome)));

  // Sincroniza Firestore em background — não bloqueia a UI
  if (!isGuest && _player?.uid && window.GSPSync) {
    window.GSPSync.carregarHistorico(_player.uid).then(histFS => {
      if (histFS.length > 0) {
        const c = histFS.map(h => ({ ...h, ts: h.ts?.toMillis ? h.ts.toMillis() : (h.ts || Date.now()) }));
        const localHist = LS.get(SK.HISTORICO) || [];
        // Só re-renderiza se vier dado novo do servidor
        if (c.length !== localHist.length) {
          LS.set(SK.HISTORICO, c);
          // Re-renderiza apenas os stats silenciosamente
          const total2  = c.length;
          const melhor2 = total2 ? Math.max(...c.map(h => h.score)) : 0;
          const media2  = total2 ? Math.round(c.reduce((a,h) => a + h.score, 0) / total2) : 0;
          const boas2   = c.filter(h => h.score >= 70).length;
          const setorCount2 = {};
          c.forEach(h => { setorCount2[h.sector] = (setorCount2[h.sector] || 0) + 1; });
          const favEntry2 = Object.entries(setorCount2).sort((a,b) => b[1]-a[1])[0];
          const icones2 = { tecnologia:'🚀', varejo:'🛒', logistica:'🚚', industria:'🏭' };
          const favLabel2 = favEntry2 ? `${icones2[favEntry2[0]]||''} ${favEntry2[0]}` : '—';
          const subEl = document.getElementById('perfil-subtitulo');
          if (subEl) subEl.textContent = `${total2} mandato${total2 !== 1 ? 's' : ''} concluído${total2 !== 1 ? 's' : ''}`;
          const statsEl2 = document.getElementById('perfil-stats');
          if (statsEl2) statsEl2.innerHTML = [
            { val: total2 ? melhor2 : '—', label: 'Melhor Score' },
            { val: total2 ? media2  : '—', label: 'Score Médio'  },
            { val: boas2,                  label: 'Excelentes (70+)' },
            { val: favLabel2,              label: 'Setor Favorito' },
          ].map(s => `<div class="perfil-stat"><div class="perfil-stat-val">${s.val}</div><div class="perfil-stat-label">${s.label}</div></div>`).join('');
        }
      }
    }).catch(() => {});
  }
}

function _copiarId(id) {
  navigator.clipboard?.writeText(id).then(() => mostrarSucesso(`ID ${id} copiado!`)).catch(() => mostrarAviso('Não foi possível copiar.'));
}

function _calcularConquistas(hist) {
  const total  = hist.length;
  const melhor = total ? Math.max(...hist.map(h => h.score)) : 0;
  return [
    { icon:'🏆', nome:'Primeiro Mandato',    desc:'Complete 1 jogo',              unlocked: total >= 1  },
    { icon:'⭐', nome:'Gestão Excelente',    desc:'Score acima de 70',             unlocked: melhor >= 70 },
    { icon:'🔥', nome:'Veterano',            desc:'5 mandatos concluídos',         unlocked: total >= 5  },
    { icon:'💼', nome:'Executivo Sênior',    desc:'10 mandatos concluídos',        unlocked: total >= 10 },
    { icon:'🚀', nome:'Especialista Tech',   desc:'Vença com Tecnologia (70+)',    unlocked: hist.some(h => h.sector === 'tecnologia' && h.score >= 70) },
    { icon:'🏭', nome:'Rei da Indústria',    desc:'Vença com Indústria (70+)',     unlocked: hist.some(h => h.sector === 'industria'  && h.score >= 70) },
    { icon:'🚚', nome:'Mestre da Logística', desc:'Vença com Logística (70+)',     unlocked: hist.some(h => h.sector === 'logistica'  && h.score >= 70) },
    { icon:'🛒', nome:'Czar do Varejo',      desc:'Vença com Varejo (70+)',        unlocked: hist.some(h => h.sector === 'varejo'     && h.score >= 70) },
    { icon:'🌐', nome:'Gestor Completo',     desc:'Vença nos 4 setores',           unlocked: ['tecnologia','industria','logistica','varejo'].every(s => hist.some(h => h.sector === s && h.score >= 70)) },
    { icon:'💯', nome:'Mandato Perfeito',    desc:'Score 90 ou mais',              unlocked: melhor >= 90 },
  ];
}

/* ════════════════════════════════════════════════════
   PÓDIO — com filtro por setor
════════════════════════════════════════════════════ */
let _podioFiltro = 'all';

function filtrarPodio(setor) {
  // Guest não tem acesso — filtro não deve buscar Firestore
  if (!_player?.uid || _player?.tipo === 'guest') return;

  _podioFiltro = setor;
  document.querySelectorAll('.podio-filter').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === setor)
  );
  const lista = document.getElementById('podio-lista');
  if (!lista) return;

  const isAll = !setor || setor === 'all';

  if (isAll) {
    // "Todos" — usa cache 'all' ou localStorage
    const dados = _podioCache['all'] || LS.get(SK.PODIO) || [];
    _renderPodio(lista, dados, 'all');
    return;
  }

  // Filtro por setor — filtra os dados 'all' já carregados localmente
  const dadosAll = _podioCache['all'] || LS.get(SK.PODIO) || [];
  if (dadosAll.length) {
    // Filtra por setor e reordena pelo melhor score naquele setor
    const filtrados = dadosAll
      .filter(p => p.sector === setor || (p.melhorPorSetor && p.melhorPorSetor[setor]))
      .map(p => {
        const entradaSetor = p.melhorPorSetor?.[setor];
        return {
          ...p,
          score:       entradaSetor?.score       ?? p.score,
          companyName: entradaSetor?.companyName ?? p.companyName,
          sector:      setor,
        };
      })
      .sort((a, b) => b.score - a.score);
    _renderPodio(lista, filtrados, setor);
  }

  // Busca Firestore em background para dados mais precisos do setor
  if (_podioCache[setor]) {
    _renderPodio(lista, _podioCache[setor], setor);
  } else {
    _buscarEAtualizarPodio(lista, setor);
  }
}

// Cache por setor para não rebuscar dados já carregados
let _podioCache = {};

function irParaPodio() {
  mostrarTela('screen-podio');
  _podioFiltro = 'all';
  _podioCache  = {};
  document.querySelectorAll('.podio-filter').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === 'all')
  );
  const lista = document.getElementById('podio-lista');
  if (!lista) return;

  // Convidados não têm acesso ao pódio
  if (!_player?.uid || _player?.tipo === 'guest') {
    lista.innerHTML = `<div class="podio-empty">🔒 Faça login para ver o ranking global.<br><br><button class="btn btn-primary" style="margin:0 auto" onclick="BetaUI.irParaAuth()">Criar conta / Entrar</button></div>`;
    return;
  }

  const local = LS.get(SK.PODIO) || [];
  if (local.length) _renderPodio(lista, local, 'all');

  _buscarEAtualizarPodio(lista, 'all');
}

function _buscarEAtualizarPodio(lista, setor) {
  if (!window.GSPSync) {
    lista.innerHTML = `<div class="podio-empty">⚠️ Firebase não disponível. Verifique sua conexão.</div>`;
    return;
  }

  const msgId = 'podio-sync-msg';
  let syncEl = document.getElementById(msgId);
  if (!syncEl) {
    syncEl = document.createElement('div');
    syncEl.id = msgId; syncEl.className = 'podio-sync';
    syncEl.textContent = '🔄 Atualizando ranking...';
    lista.prepend(syncEl);
  }

  window.GSPSync.carregarPodio(setor).then(podioFS => {
    const syncMsg = document.getElementById(msgId);
    if (syncMsg) syncMsg.remove();
    const c = (podioFS || []).map(p => ({
      ...p, ts: p.ts?.toMillis ? p.ts.toMillis() : (p.ts || Date.now())
    }));
    _podioCache[setor] = c;
    // Sempre atualiza localStorage para espelhar o banco (inclusive quando vazio)
    if (setor === 'all' || !setor) LS.set(SK.PODIO, c);
    if (_podioFiltro === (setor || 'all')) _renderPodio(lista, c, setor);
  }).catch(e => {
    const syncMsg = document.getElementById(msgId);
    if (syncMsg) syncMsg.textContent = '⚠️ Erro ao carregar ranking. Tente novamente.';
    setTimeout(() => document.getElementById(msgId)?.remove(), 3000);
    console.warn('[GSP] _buscarEAtualizarPodio:', e);
  });
}

function _renderPodio(lista, podio, setor) {
  const isAll  = !setor || setor === 'all';
  const icones = { tecnologia:'🚀', varejo:'🛒', logistica:'🚚', industria:'🏭' };

  if (!podio.length) {
    lista.innerHTML = `<div class="podio-empty">Nenhuma partida no ranking ainda.<br>Complete um mandato para aparecer aqui.</div>`;
    return;
  }

  // Score único: melhorScore no modo Todos, score do setor no modo filtrado
  const scoreLabel = isAll ? 'Melhor' : 'Score';
  const getScore   = p => isAll ? (p.melhorScore ?? p.score ?? 0) : (p.score ?? 0);

  const sorted = [...podio].sort((a, b) => getScore(b) - getScore(a));
  const top3   = sorted.slice(0, 3);
  const resto  = sorted.slice(3);

  // Escada: ordem visual = 2º (esquerda) · 1º (centro) · 3º (direita)
  const visualOrder = [
    top3[1] ? { p: top3[1], pos: 2, cls: 'podio-top3-2', rk: 'silver' } : null,
    top3[0] ? { p: top3[0], pos: 1, cls: 'podio-top3-1', rk: 'gold'   } : null,
    top3[2] ? { p: top3[2], pos: 3, cls: 'podio-top3-3', rk: 'bronze' } : null,
  ].filter(Boolean);

  const _card = ({ p, pos, cls, rk }) => {
    const val  = getScore(p);
    const isMe = _player?.uid && p.uid === _player.uid;
    const sub  = isAll
      ? `${p.totalJogos ?? 1} jogo${(p.totalJogos ?? 1) !== 1 ? 's' : ''}`
      : `${icones[p.sector]||'🏢'} ${p.companyName}`;
    return `<div class="podio-top3-card ${cls} ${isMe ? 'podio-top3-me' : ''}" data-sector="${p.sector||''}">
      <div class="podio-top3-player">
        ${isMe ? '<div class="podio-top3-you">Você</div>' : ''}
        <div class="podio-top3-avatar">${(p.player||'?').charAt(0).toUpperCase()}</div>
        <div class="podio-top3-name">${p.player}</div>
        <div class="podio-top3-company">${sub}</div>
        <div class="podio-top3-score">${val}</div>
        <div class="podio-top3-score-label">${scoreLabel}</div>
      </div>
      <div class="podio-top3-step">
        <span class="podio-top3-pos ${rk}">${pos}º</span>
      </div>
    </div>`;
  };

  const top3Html = `
    <div class="podio-top3">${visualOrder.map(_card).join('')}</div>
    <div class="podio-base"></div>`;

  const restoHtml = resto.length ? `
    <div class="hist-section-label">A partir do 4º lugar</div>
    ${resto.map((p, i) => {
      const val  = getScore(p);
      const cor  = val >= 70 ? 'var(--good)' : val >= 45 ? 'var(--warn)' : 'var(--danger)';
      const isMe = _player?.uid && p.uid === _player.uid;
      const sub  = isAll
        ? `${p.totalJogos ?? 1} jogo${(p.totalJogos ?? 1) !== 1 ? 's' : ''}`
        : `${icones[p.sector]||'🏢'} ${p.companyName}`;
      return `<div class="podio-item ${isMe ? 'podio-item-me' : ''}" data-sector="${p.sector||''}">
        <div class="podio-rank">${i + 4}</div>
        <div class="podio-player">
          <div class="podio-player-name">${p.player}${isMe ? ' <span class="podio-you-tag">Você</span>' : ''}</div>
          <div class="podio-player-meta">${sub}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:1px">
          <div class="podio-score" style="color:${cor}">${val}</div>
          <div class="podio-score-sublabel">${scoreLabel}</div>
        </div>
      </div>`;
    }).join('')}` : '';

  lista.innerHTML = top3Html + restoHtml;
}

/* ════════════════════════════════════════════════════
   PAUSA
════════════════════════════════════════════════════ */
let _jogoPausado = false;

function pausarJogo() {
  _jogoPausado = true;
  if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
  const state = BetaState.get();
  const info  = document.getElementById('pause-info');
  if (info && state) {
    const fases = { fundacao:'Diagnóstico', crescimento:'Crescimento', crise:'⚠ Crise', consolidacao:'Consolidação', expansao:'Expansão' };
    const fase  = state.storyState?.faseEmpresa || '';
    info.textContent = `${state.companyName} · ${fases[fase]||fase} · Rodada ${state.currentRound+1}/${state.totalRounds}`;
  }
  const overlay = document.getElementById('overlay-pause');
  _abrirOverlay('overlay-pause');
}

function continuarJogo() {
  _jogoPausado = false;
  const overlay = document.getElementById('overlay-pause');
  _fecharOverlay('overlay-pause');
  // BUG #11 FIX: se timer chegou a 0 durante pausa, forçar escolha imediata
  if (_settings.timer && !_escolhaFeita && _timerSegs <= 0) { _escolherPorOmissao(); return; }
  if (_settings.timer && !_escolhaFeita && _timerSegs > 0) {
    const el = document.getElementById('timer-display');
    if (el) { el.classList.add('active'); if (_timerSegs <= 10) el.classList.add('danger'); }
    _timerInterval = setInterval(() => {
      _timerSegs--;
      if (el) el.textContent = `⏱ ${_timerSegs}s`;
      if (_timerSegs <= 10 && el) el.classList.add('danger');
      if (_timerSegs <= 0) { _pararTimer(); if (!_escolhaFeita) _escolherPorOmissao(); }
    }, 1000);
  }
}

function abandonarJogo() {
  _jogoPausado = false;
  const overlay = document.getElementById('overlay-pause');
  _fecharOverlay('overlay-pause');
  _pararTimer();
  _pararVerificacaoManutencao();
  // Grava rodada de abandono para dashboard antes de limpar sessão
  try {
    const _stateAbandono = BetaState.get();
    if (_stateAbandono?.currentRound !== undefined) {
      _gravarStatsDiario('abandono', _stateAbandono.currentRound);
    }
  } catch(e) {}
  LS.remove(SK.SESSION);
  _aplicarTemaSetor(null);
  mostrarTela('screen-home');
}

/* ════════════════════════════════════════════════════
   CONFIRMAÇÃO DE SAÍDA
════════════════════════════════════════════════════ */
let _saidaTipo = null;

function pedirConfirmacaoSaida(tipo) {
  _saidaTipo = tipo;
  const overlay = document.getElementById('overlay-confirmar-saida');
  const icon    = document.getElementById('confirmar-saida-icon');
  const titulo  = document.getElementById('confirmar-saida-titulo');
  const desc    = document.getElementById('confirmar-saida-desc');
  const btn     = document.getElementById('confirmar-saida-btn');
  if (!overlay) return;

  const configs = {
    conta: {
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
      titulo: 'Sair da conta?',
      desc: 'Você será desconectado. Seu progresso salvo na nuvem não será perdido.',
      btnTxt: 'Sair da conta',
      btnClass: 'confirmar-saida-confirmar--neutro',
    },
    convidado: {
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
      titulo: 'Sair do modo convidado?',
      desc: 'Seu histórico local desta sessão será apagado. Crie uma conta para salvar seu progresso.',
      btnTxt: 'Sair mesmo assim',
      btnClass: 'confirmar-saida-confirmar--warn',
    },
    partida: {
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
      titulo: 'Abandonar o mandato?',
      desc: 'O progresso desta partida será perdido. As rodadas concluídas não serão salvas no seu histórico.',
      btnTxt: 'Abandonar',
      btnClass: 'confirmar-saida-confirmar--danger',
    },
  };

  const cfg = configs[tipo] || configs.conta;
  if (icon)  icon.innerHTML  = cfg.icon;
  if (titulo) titulo.textContent = cfg.titulo;
  if (desc)  desc.textContent  = cfg.desc;
  if (btn) {
    btn.textContent = cfg.btnTxt;
    btn.className   = 'btn confirmar-saida-confirmar ' + cfg.btnClass;
  }

  // Garante que aparece acima de qualquer overlay (z-index 100001 no HTML)
  if (overlay.parentNode !== document.body) document.body.appendChild(overlay);
  overlay.style.display = 'flex';
}

function cancelarSaida() {
  const overlay = document.getElementById('overlay-confirmar-saida');
  if (overlay) overlay.style.display = 'none';
  _saidaTipo = null;
}

function confirmarSaida() {
  const overlay = document.getElementById('overlay-confirmar-saida');
  if (overlay) overlay.style.display = 'none';
  if (_saidaTipo === 'partida') {
    abandonarJogo();
  } else {
    sair();
  }
  _saidaTipo = null;
}

/* ════════════════════════════════════════════════════
   TOOLTIP DE INDICADORES DO GESTOR
════════════════════════════════════════════════════ */
const INDICADOR_INFO = {
  // ── Indicadores do Gestor ──
  reputacaoInterna: {
    titulo: '🧑 Reputação Interna',
    desc: 'Reflete como o time percebe sua liderança. Decisões que prejudicam as pessoas reduzem a reputação; decisões inclusivas e transparentes aumentam.',
    consequence: '⚠ Se chegar a 0, sua autoridade é questionada pelo conselho.',
  },
  capitalPolitico: {
    titulo: '🏛 Capital Político',
    desc: 'Sua credibilidade junto ao conselho e stakeholders externos. É consumido por decisões impopulares e reposicionamentos bruscos.',
    consequence: '⚠ Se chegar a 0, o conselho encerra seu mandato antecipadamente.',
  },
  esgotamento: {
    titulo: '🔋 Esgotamento',
    desc: 'Mede o desgaste acumulado do gestor. Aumenta com crises mal resolvidas e alta pressão de trabalho.',
    consequence: '🔴 Se chegar a 10, você é afastado por burnout e o mandato é encerrado imediatamente.',
  },
  // ── Indicadores da Empresa (comuns) ──
  financeiro: {
    titulo: '💰 Financeiro',
    desc: 'Saúde financeira geral da empresa. Afetado por investimentos, cortes de custo e resultados operacionais.',
    consequence: '⚠ Se chegar a 0, a empresa entra em crise de caixa e o mandato é encerrado.',
  },
  rh: {
    titulo: '👥 RH',
    desc: 'Representa o capital humano e o engajamento dos colaboradores. Impactado por políticas de pessoas e cultura organizacional.',
    consequence: '⚠ Valores críticos geram aumento de turnover e queda de produtividade.',
  },
  clientes: {
    titulo: '⭐ Clientes',
    desc: 'Satisfação e fidelidade da base de clientes. Afetado pela qualidade dos produtos, atendimento e experiência.',
    consequence: '⚠ Valores críticos resultam em perda de receita e dano à reputação.',
  },
  processos: {
    titulo: '⚙️ Processos',
    desc: 'Eficiência operacional interna. Reflete a maturidade dos processos e a capacidade de execução.',
    consequence: '⚠ Processos deficientes aumentam custos e reduzem a qualidade das entregas.',
  },
  // ── Varejo ──
  margem: {
    titulo: '📊 Margem Operacional',
    desc: 'Percentual de lucro sobre as vendas. Impactado por precificação, custos e mix de produtos.',
    consequence: '⚠ Margens negativas comprometem a sustentabilidade financeira.',
  },
  estoque: {
    titulo: '📦 Giro de Estoque',
    desc: 'Velocidade com que os produtos são vendidos. Alto giro indica eficiência; baixo giro gera capital parado.',
    consequence: '⚠ Estoque parado aumenta custos e pode gerar obsolescência.',
  },
  marca: {
    titulo: '🏷️ Força da Marca',
    desc: 'Percepção e reconhecimento da marca no mercado. Construída por consistência, qualidade e comunicação.',
    consequence: '⚠ Marca fraca reduz poder de precificação e atração de clientes.',
  },
  digital: {
    titulo: '🖥️ Canal Digital',
    desc: 'Presença e desempenho nos canais digitais de venda. Cada vez mais essencial para o varejo moderno.',
    consequence: '⚠ Atraso digital cede espaço para concorrentes mais ágeis.',
  },
  // ── Logística ──
  sla: {
    titulo: '⏱️ Cumprimento de SLA',
    desc: 'Taxa de entregas dentro do prazo acordado. Principal métrica de confiabilidade para clientes.',
    consequence: '⚠ SLA baixo gera multas contratuais e perda de contratos.',
  },
  frota: {
    titulo: '🚛 Estado da Frota',
    desc: 'Condição e disponibilidade dos veículos. Frota bem mantida garante operação confiável e segura.',
    consequence: '⚠ Frota degradada aumenta paradas e custos de manutenção emergencial.',
  },
  // ── Indústria ──
  manutencao: {
    titulo: '🔧 Manutenção de Ativos',
    desc: 'Estado de conservação das máquinas e equipamentos produtivos. Manutenção preventiva reduz paradas.',
    consequence: '⚠ Ativos degradados causam paradas de produção e acidentes.',
  },
  qualidade: {
    titulo: '🎯 Controle de Qualidade',
    desc: 'Conformidade dos produtos com os padrões estabelecidos. Medido por taxas de defeito e retrabalho.',
    consequence: '⚠ Qualidade baixa gera devoluções, recalls e perda de clientes.',
  },
  conformidade: {
    titulo: '📋 Conformidade Regulatória',
    desc: 'Aderência às normas e regulações do setor. Envolve licenças, certificações e auditorias.',
    consequence: '⚠ Não conformidade pode resultar em multas, interdições e danos à reputação.',
  },
  // ── Tecnologia (rh/clientes já cobertos pelas entradas padrão acima) ──
  produtividade: {
    titulo: '⚡ Produtividade',
    desc: 'Velocidade e eficiência das entregas de tecnologia. Impactada por dívida técnica, processos e motivação.',
    consequence: '⚠ Baixa produtividade atrasa lançamentos e aumenta custos.',
  },
  reputacao: {
    titulo: '📣 Reputação de Mercado',
    desc: 'Como a empresa é vista no ecossistema de tecnologia por clientes, parceiros e talentos.',
    consequence: '⚠ Reputação negativa dificulta parcerias e contratações.',
  },
  inovacao: {
    titulo: '🔬 Inovação',
    desc: 'Capacidade de desenvolver novos produtos e tecnologias. Motor de crescimento e diferenciação competitiva.',
    consequence: '⚠ Sem inovação a empresa perde relevância para concorrentes mais ágeis.',
  },
  // ── Segurança (compartilhado) ──
  seguranca: {
    titulo: '🦺 Segurança Operacional',
    desc: 'Nível de segurança nas operações. Envolve prevenção de acidentes, normas e cultura de segurança.',
    consequence: '⚠ Incidentes de segurança geram custos humanos, legais e reputacionais graves.',
  },
  tecnologia: {
    titulo: '📡 TMS / Tecnologia',
    desc: 'Uso de sistemas tecnológicos na operação logística. Permite rastreamento, roteirização e controle em tempo real.',
    consequence: '⚠ Tecnologia defasada reduz visibilidade e eficiência da operação.',
  },
};

function abrirTooltipIndicador(key) {
  const info = INDICADOR_INFO[key];
  if (!info) return;
  const state = BetaState.get();
  // Gestor indicators: reputacaoInterna, capitalPolitico, esgotamento (scale 0-10)
  // Empresa indicators: all others (scale 0-20)
  const GESTOR_KEYS = ['reputacaoInterna', 'capitalPolitico', 'esgotamento'];
  const isGestor = GESTOR_KEYS.includes(key);
  const val = isGestor
    ? (state?.gestor?.[key] ?? '—')
    : (state?.indicators?.[key] ?? '—');
  const maxVal = isGestor ? 10 : 20;
  const overlay = document.getElementById('overlay-tooltip');
  const title   = document.getElementById('tooltip-title');
  const body    = document.getElementById('tooltip-body');
  if (!overlay) return;
  if (title) title.textContent = info.titulo;
  if (body) body.innerHTML = `
    <div class="tooltip-val-block">
      <div class="tooltip-val-num" style="color:var(--s-text)">${val}<span style="font-size:.9rem;color:var(--t3)">/${maxVal}</span></div>
      <div class="tooltip-val-label">Valor atual</div>
    </div>
    <p class="tooltip-body-text">${info.desc}</p>
    <div class="tooltip-consequence">${info.consequence}</div>`;
  _abrirOverlay('overlay-tooltip');
}

function closeTooltip() {
  const el = document.getElementById('overlay-tooltip');
  _fecharOverlay('overlay-tooltip');
}

// Tooltip informativo genérico — reaproveita o overlay-tooltip, mas sem
// depender de um indicador do jogo. Usado para explicações de
// configuração (ex: Timer por Rodada, Modo Treino).
function abrirTooltipInfo(titulo, htmlCorpo) {
  const overlay = document.getElementById('overlay-tooltip');
  const title   = document.getElementById('tooltip-title');
  const body    = document.getElementById('tooltip-body');
  if (!overlay) return;
  if (title) title.textContent = titulo;
  if (body) body.innerHTML = htmlCorpo;
  _abrirOverlay('overlay-tooltip');
}

function abrirInfoTimer() {
  abrirTooltipInfo('Timer por Rodada', `
    <p class="tooltip-body-text">Com o timer ativado, você tem <strong>90 segundos</strong> para tomar cada decisão. O tempo aparece na tela durante a rodada e fica vermelho nos últimos segundos.</p>
    <div class="tooltip-consequence">⏰ Se o tempo esgotar sem você escolher uma opção, o jogo segue automaticamente com uma <strong>Decisão por Omissão</strong> — um resultado diferente de uma escolha ativa, geralmente pior, e que aumenta o <strong>Esgotamento</strong> do gestor.</div>
    <p class="tooltip-body-text">Deixar o tempo esgotar repetidas vezes acumula esgotamento até o limite. Se isso acontecer, o gestor entra em <strong>Paralisia Decisória</strong> — um colapso por excesso de indecisão que encerra o mandato antes do previsto.</p>
  `);
}

function abrirInfoModoTreino() {
  abrirTooltipInfo('Modo Treino', `
    <p class="tooltip-body-text">No Modo Treino, você joga normalmente, mas <strong>o resultado não conta</strong> para o pódio nem fica salvo no seu histórico de partidas.</p>
    <div class="tooltip-consequence">🎓 Ideal para aprender as mecânicas, testar decisões diferentes ou simplesmente jogar sem a pressão de manter uma boa pontuação registrada.</div>
  `);
}

/* ════════════════════════════════════════════════════
   MODO TREINO
════════════════════════════════════════════════════ */
let _modoTreino = false;

function toggleModoTreino() {
  _modoTreino = !_modoTreino;
  const btn = document.getElementById('toggle-treino-btn');
  if (btn) { btn.textContent = _modoTreino ? 'ON' : 'OFF'; btn.className = `toggle-btn ${_modoTreino ? 'on' : 'off'}`; }
}

/* ════════════════════════════════════════════════════
   COMPARTILHAR RESULTADO
════════════════════════════════════════════════════ */
function compartilharResultado() {
  const score  = document.getElementById('result-score-num')?.textContent || '—';
  const titulo = document.getElementById('result-title')?.textContent || 'Mandato';
  const state  = BetaState.get();
  const icones = { tecnologia:'🚀', varejo:'🛒', logistica:'🚚', industria:'🏭' };
  const icon   = icones[state?.sector] || '🏢';
  const empresa = state?.companyName || 'Empresa';
  const texto  = `${icon} ${titulo}
📊 Score: ${score}/100
🏢 ${empresa}

Joguei Under Pressure — o simulador de decisões executivas!`;
  if (navigator.share) {
    navigator.share({ title: 'Under Pressure', text: texto }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(texto)
      .then(() => mostrarErro('Resultado copiado para a área de transferência!'))
      .catch(() => mostrarErro('Copie o resultado manualmente.'));
  }
}

/* ════════════════════════════════════════════════════
   ANIMAÇÃO DE SCORE + CONFETTI
════════════════════════════════════════════════════ */
function _animarScore(elId, valorFinal, cor, duracao = 1200) {
  const el = document.getElementById(elId);
  if (!el || isNaN(valorFinal)) return;
  const start = Date.now();
  const tick  = () => {
    const elapsed  = Date.now() - start;
    const progress = Math.min(elapsed / duracao, 1);
    const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(ease * valorFinal);
    el.style.color = cor;
    if (progress < 1) { requestAnimationFrame(tick); }
    else { el.textContent = valorFinal; el.classList.add('animating'); setTimeout(() => el.classList.remove('animating'), 200); }
  };
  requestAnimationFrame(tick);
}

function _lancarConfetti() {
  const screen = document.getElementById('screen-result');
  if (!screen) return;
  const cores = ['#D4A853','#5B8DEF','#1FB885','#E8711A','#E8467A','#ffffff'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `left:${Math.random()*100}%;top:0;position:absolute;background:${cores[Math.floor(Math.random()*cores.length)]};animation-delay:${Math.random()*1.5}s;animation-duration:${1.5+Math.random()}s`;
    screen.appendChild(p);
    setTimeout(() => p.remove(), 4000);
  }
}

/* Wrapper animado para renderResultado */
function renderResultadoAnimado({ motivo, score, scoreGestor, gestor, indicators,
                                   history, companyName, empresa, sector, epilogo, decisoesCruciais }) {
  renderResultado({ motivo, score, scoreGestor, gestor, indicators, history, companyName, empresa, sector, epilogo, decisoesCruciais });
  // Estado visual
  const screen = document.getElementById('screen-result');
  if (screen) {
    screen.classList.remove('state-excelente','state-regular','state-dificil');
    screen.classList.add(score >= 70 ? 'state-excelente' : score >= 45 ? 'state-regular' : 'state-dificil');
  }
  // Animar scores (começa em 0)
  const corEmp = score >= 70 ? 'var(--good)' : score >= 45 ? 'var(--warn)' : 'var(--danger)';
  const corGes = scoreGestor >= 70 ? 'var(--purple)' : scoreGestor >= 45 ? 'var(--warn)' : 'var(--danger)';
  const ne = document.getElementById('result-score-num');
  const mg = document.getElementById('result-manager-num');
  if (ne) { ne.textContent = '0'; ne.style.color = corEmp; }
  if (mg) { mg.textContent = '0'; mg.style.color = corGes; }
  setTimeout(() => {
    _animarScore('result-score-num',   score,       corEmp);
    _animarScore('result-manager-num', scoreGestor, corGes);
  }, 400);
  if (score >= 70) setTimeout(_lancarConfetti, 800);
  // Modo Treino: não salvar
  if (_modoTreino) {
    const ml = document.getElementById('result-motivo-label');
    if (ml) ml.textContent = 'MODO TREINO · Resultado não salvo';
    const podio = LS.get(SK.PODIO) || [];
    if (podio.length) { podio.shift(); LS.set(SK.PODIO, podio); }
    const hh = LS.get(SK.HISTORICO) || [];
    if (hh.length) { hh.shift(); LS.set(SK.HISTORICO, hh); }
  }
}

/* ════════════════════════════════════════════════════
   REGISTRO NO ENGINE + BOOT
════════════════════════════════════════════════════ */
registrarUI({ mostrarTela, mostrarIntro, renderSidebar, renderRodada, mostrarFeedback, mostrarFeedbackOmissao, renderResultado: renderResultadoAnimado });


/* ════════════════════════════════════════════════════
   AUTH FUNCTIONS
════════════════════════════════════════════════════ */
function irParaAuth() {
  mostrarTela('screen-auth');
  authMudarAba('login');
}
function irParaLogin()  { mostrarTela("screen-auth"); authMudarAba("login"); }

function authMudarAba(aba) {
  ["login","cadastro","recuperar"].forEach(a => {
    const f = document.getElementById(`auth-form-${a}`);
    const b = document.getElementById(`tab-${a === "login" ? "login" : "register"}-btn`);
    if (f) f.style.display = "none";
    if (b) b.classList.remove("active");
  });
  const form = document.getElementById(`auth-form-${aba}`);
  if (form) form.style.display = "flex";
  if (aba === "login") document.getElementById("tab-login-btn")?.classList.add("active");
  if (aba === "cadastro") document.getElementById("tab-register-btn")?.classList.add("active");
  ["auth-login-err","auth-reg-err","auth-rec-err","auth-rec-ok"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ""; el.style.display = ""; }
  });
}

function authTogglePass(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  if (inp.type === "password") { inp.type = "text"; btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'; }
  else { inp.type = "password"; btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'; }
}

function _authSetLoading(prefix, on) {
  const btn = document.getElementById(`auth-${prefix}-btn`);
  const lbl = document.getElementById(`auth-${prefix}-label`);
  const spn = document.getElementById(`auth-${prefix}-spinner`);
  if (btn) btn.disabled = on;
  if (lbl) lbl.style.opacity = on ? "0.4" : "1";
  if (spn) spn.style.display = on ? "inline" : "none";
}

function _authShowErr(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = "block"; }
}

function _traduzirErroFirebase(code) {
  const map = {
    "auth/email-already-in-use":    "Este e-mail já está em uso.",
    "auth/invalid-email":           "E-mail inválido.",
    "auth/weak-password":           "A senha deve ter pelo menos 6 caracteres.",
    "auth/user-not-found":          "Usuário não encontrado.",
    "auth/wrong-password":          "Senha incorreta.",
    "auth/invalid-credential":      "E-mail ou senha incorretos.",
    "auth/too-many-requests":       "Muitas tentativas. Tente novamente mais tarde.",
    "auth/network-request-failed":  "Falha de rede. Verifique sua conexão.",
    "auth/popup-closed-by-user":    "Login cancelado.",
    "auth/user-disabled":           "Esta conta foi desativada.",
  };
  return map[code] || "Ocorreu um erro. Tente novamente.";
}

async function authLogin() {
  const email = document.getElementById("auth-login-email")?.value.trim();
  const senha = document.getElementById("auth-login-pass")?.value;
  if (!email) { _authShowErr("auth-login-err", "Digite seu e-mail."); return; }
  if (!senha)  { _authShowErr("auth-login-err", "Digite sua senha."); return; }
  if (!window.GSPAuth?.isReady()) {
    const nome = email.split("@")[0];
    await _loginOk({ nome, email, tipo: "user" });
    return;
  }
  _authSetLoading("login", true);
  try {
    const player = await window.GSPAuth.login({ email, senha });
    await _loginOk(player);
  } catch(e) {
    const msg = _traduzirErroFirebase(e.code);
    _authShowErr("auth-login-err", msg);
    mostrarErroCritico(msg);
  } finally {
    _authSetLoading("login", false);
  }
}

async function authCadastrar() {
  const nome  = document.getElementById("auth-reg-nome")?.value.trim();
  const email = document.getElementById("auth-reg-email")?.value.trim();
  const senha = document.getElementById("auth-reg-pass")?.value;
  if (!nome)  { _authShowErr("auth-reg-err", "Digite seu nome."); return; }
  if (!email) { _authShowErr("auth-reg-err", "Digite seu e-mail."); return; }
  if (!senha || senha.length < 6) { _authShowErr("auth-reg-err", "A senha deve ter ao menos 6 caracteres."); return; }
  if (!window.GSPAuth?.isReady()) {
    await _loginOk({ nome, email, tipo: "user" });
    return;
  }
  _authSetLoading("reg", true);
  try {
    const player = await window.GSPAuth.cadastrar({ nome, email, senha });
    mostrarSucesso("Conta criada com sucesso!");
    await _loginOk(player);
  } catch(e) {
    const msg = _traduzirErroFirebase(e.code);
    _authShowErr("auth-reg-err", msg);
    mostrarErroCritico(msg);
  } finally {
    _authSetLoading("reg", false);
  }
}

async function authGoogle() {
  // Aguarda Firebase ficar pronto (até 3s)
  if (!window.GSPAuth?.isReady()) {
    let t = 0;
    while (!window.GSPAuth?.isReady() && t < 30) {
      await new Promise(r => setTimeout(r, 100));
      t++;
    }
  }
  if (!window.GSPAuth?.isReady()) {
    mostrarErro("Configure o Firebase para usar o login com Google.");
    return;
  }
  try {
    const player = await window.GSPAuth.loginGoogle();

    if (!player) {
      // Popup bloqueado — redirect em andamento, página vai recarregar
      // Mostra login com mensagem para o usuário não ficar perdido
      mostrarTela('screen-auth');
      authMudarAba('login');
      mostrarAviso('Redirecionando para o Google...');
      return;
    }

    mostrarSucesso("Login com Google realizado!");
    await _loginOk(player);
  } catch(e) {
    mostrarTela('screen-auth');
    authMudarAba('login');
    mostrarErroCritico(_traduzirErroFirebase(e.code));
  }
}

async function authRecuperar() {
  const email = document.getElementById("auth-rec-email")?.value.trim();
  if (!email) { _authShowErr("auth-rec-err", "Digite seu e-mail."); return; }
  if (!window.GSPAuth?.isReady()) {
    _authShowErr("auth-rec-err", "Firebase não configurado.");
    return;
  }
  _authSetLoading("rec", true);
  try {
    await window.GSPAuth.recuperarSenha(email);
    const ok = document.getElementById("auth-rec-ok");
    if (ok) { ok.style.display = "block"; ok.textContent = "✅ E-mail enviado! Verifique sua caixa de entrada."; }
    mostrarSucesso("E-mail de recuperação enviado!");
  } catch(e) {
    const msg = _traduzirErroFirebase(e.code);
    _authShowErr("auth-rec-err", msg);
    mostrarErroCritico(msg);
  } finally {
    _authSetLoading("rec", false);
  }
}

async function _loginOk(player) {
  _player = player;
  window._player = _player;
  LS.set(SK.PLAYER, _player);

  // Carrega nome customizado do Firestore antes de qualquer coisa
  // Evita sobrescrever nome editado pelo usuário com o displayName do Google
  if (player.uid && window.GSPSync?.carregarPerfil) {
    try {
      const perfil = await window.GSPSync.carregarPerfil(player.uid);
      if (perfil?.nome && perfil.nome.trim() !== '') {
        _player.nome = perfil.nome;
        window._player = _player;
        LS.set(SK.PLAYER, _player);
      }
    } catch(e) { /* usa nome do Google mesmo */ }
  }

  // Atualizar avatar agora que Firebase Auth está resolvido
  _atualizarHome();
  // Verifica se é admin antes de qualquer outra coisa
  await _atualizarBotaoAdmin(player.uid);

  // Inicia o polling universal (ban + manutenção + mensagem global).
  // await garante que o primeiro _tick (com re-check de admin) termine ANTES de
  // mostrar a tela home — elimina o flash do overlay de manutenção para admins.
  await _iniciarPollingGlobal(player.uid);
  // Inicia inbox em tempo real
  _iniciarInbox(player.uid);

  // Onboarding (tutorial + boas-vindas) — decide via Firestore, não
  // localStorage, para não repetir em outro dispositivo ou após limpar
  // o cache. Mostra progresso porque essa checagem faz 1-2 requisições
  // extras ao Firestore, perceptíveis em conexões mais lentas.
  _setLoadingMsg('Preparando sua conta...', 'Fazendo verificações iniciais', 92);
  const { mostrarTutorial } = await _verificarOnboarding(player.uid, player.nome || 'Gestor');

  // Entra no painel imediatamente — sem esperar Firestore
  _restaurarSala();
  _restaurarGrupo();
  _atualizarHome();
  if (mostrarTutorial) {
    mostrarTela('screen-tutorial');
  } else {
    mostrarTela("screen-home");
    _verificarSessaoSalva();
  }

  // Sincroniza dados em background (não bloqueia a UI)
  _sincronizarFirebaseBackground(player);
}


/* ════════════════════════════════════════════════════
   PAINEL ADMIN
════════════════════════════════════════════════════ */

async function _atualizarBotaoAdmin(uid) {
  if (!uid) return;
  console.log('[AdminCheck] 🔍 Iniciando verificação de admin para uid:', uid, '| timestamp:', Date.now());

  // ── Passo 1: obter token Firebase (necessário para qualquer caminho) ──────
  let _tok = null;
  if (window.GSPAuth?.getToken) {
    console.log('[AdminCheck] 🔑 Aguardando token Firebase...');
    for (let i = 0; i < 20; i++) {
      _tok = await window.GSPAuth.getToken().catch(() => null);
      if (_tok) { console.log('[AdminCheck] ✅ Token obtido na tentativa', i + 1); break; }
      await new Promise(r => setTimeout(r, 500));
    }
  }
  if (!_tok) {
    console.warn('[AdminCheck] ❌ Token não disponível — _isAdmin permanece false.');
    _isAdmin = false; window._isAdmin = false;

 return;
  }

  // ── Passo 2: verificação via window.ADMIN (aguarda até 5s) ───────────────
  if (!window.ADMIN) {
    console.log('[AdminCheck] ⏳ window.ADMIN não disponível — aguardando até 5s...');
    let t = 0;
    while (!window.ADMIN && t < 50) { await new Promise(r => setTimeout(r, 100)); t++; }
    if (window.ADMIN) console.log('[AdminCheck] ✅ window.ADMIN disponível após', t * 100, 'ms');
  }

  if (window.ADMIN) {
    // Caminho normal: usa admin.js com retry para tolerar falhas transitórias
    let resultado;
    for (let tentativa = 1; tentativa <= 5; tentativa++) {
      resultado = await window.ADMIN.verificarAdmin(uid).catch(e => {
        console.warn('[AdminCheck] ⚠️ verificarAdmin tentativa', tentativa, 'exceção:', e?.message);
        return undefined;
      });
      console.log('[AdminCheck] 🔄 tentativa', tentativa, '→', resultado);
      if (resultado === true || resultado === false) break;
      console.warn('[AdminCheck] ⚠️ resultado undefined na tentativa', tentativa, '— aguardando 1s...');
      await new Promise(r => setTimeout(r, 1000));
    }
    _isAdmin = resultado === true;
    window._isAdmin = _isAdmin;
    console.log('[AdminCheck] 🏁 Resultado final (via ADMIN):', resultado, '→ _isAdmin =', _isAdmin);
  } else {
    // ── Passo 3: fallback REST direto — admin.js não carregou ───────────────
    console.warn('[AdminCheck] ⚠️ window.ADMIN indisponível — usando fallback REST direto para verificar admin.');
    const FS = 'https://firestore.googleapis.com/v1/projects/under-pressure-49320/databases/default/documents';
    let resultado = false;
    for (let tentativa = 1; tentativa <= 5; tentativa++) {
      try {
        const r = await fetch(`${FS}/config/admins`, {
          headers: { Authorization: `Bearer ${_tok}` }
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const doc = await r.json();
        const fields = doc?.fields;
        if (!fields) throw new Error('doc.fields indefinido');
        const uids  = (fields.uids?.arrayValue?.values  || []).map(v => v.stringValue);
        const owner = fields.owner?.stringValue || '';
        resultado = uids.includes(uid) || uid === owner;
        console.log('[AdminCheck] ✅ Fallback REST tentativa', tentativa, '| uids:', uids, '| owner:', owner, '| resultado:', resultado);
        break; // sucesso
      } catch(e) {
        console.warn('[AdminCheck] ❌ Fallback REST tentativa', tentativa, 'falhou:', e?.message);
        if (tentativa < 5) await new Promise(r => setTimeout(r, 1000));
      }
    }
    _isAdmin = resultado === true;
    window._isAdmin = _isAdmin;
    console.log('[AdminCheck] 🏁 Resultado final (via REST fallback):', resultado, '→ _isAdmin =', _isAdmin);
  }



  if (_isAdmin) {
    console.log('[AdminCheck] 🛡️ Admin confirmado — escondendo overlay de manutenção se visível.');
    _esconderOverlayManutencao();
  } else {
    console.warn('[AdminCheck] ⚠️ Usuário NÃO reconhecido como admin.');
  }
}


let _adminHoldTimer = null;

function _iniciarHoldAdmin() {
  _adminHoldTimer = setTimeout(() => { irParaAdmin(); }, 3000);
}

function _cancelarHoldAdmin() {
  if (_adminHoldTimer) { clearTimeout(_adminHoldTimer); _adminHoldTimer = null; }
}

async function irParaAdmin() {
  if (!_player?.uid) return;
  // Usa _isAdmin já calculado no boot — evita nova verificação que pode falhar por RTDB vazio
  const isAdmin = _isAdmin || (await window.ADMIN?.verificarAdmin(_player.uid).catch(() => null));
  if (isAdmin) {
    location.href = '/admin/painel-controle.html';
  }
}

/* ════════════════════════════════════════════════════
   SALA — Sprint 1
   Funções de UI para entrar/sair de sala e pódio da sala
════════════════════════════════════════════════════ */

/* ── Helpers de UI ── */
function _setSalaStatus(msg, tipo) {
  // tipo: 'info' | 'erro' | 'ok'
  const el = document.getElementById('sala-status');
  if (!el) return;
  el.textContent = msg;
  el.className = 'sala-status sala-status--' + (tipo || 'info');
  el.style.display = msg ? 'block' : 'none';
}

function _atualizarBadgeSala() {
  const badge = document.getElementById('home-sala-badge');
  if (!badge) return;
  if (_sala) {
    badge.textContent = '🏟️ ' + (_sala.nome || _sala.codigo);
    badge.style.display = 'inline-flex';
  } else {
    badge.style.display = 'none';
  }
}


/* ── Parar polling ── */
function _pararPollingPartida() {
  if (_partidaInterval)    { clearInterval(_partidaInterval);    _partidaInterval = null; }
  if (_heartbeatInterval)  { clearInterval(_heartbeatInterval);  _heartbeatInterval = null; }
}

/* ── Painel anfitrião na sala ── */
async function abrirPainelAnfitriao() {
  if (!_sala || _sala.criadaPor !== _player?.uid) return;
  mostrarTela('screen-painel-anfitriao');
  await _renderPainelAnfitriao();
}

async function _renderPainelAnfitriao() {
  const grupos = await window.GSPSalas.carregarGrupos(_sala.codigo).catch(() => []);
  const sala   = await window.GSPSalas.carregarSala(_sala.codigo).catch(() => _sala);
  const todos  = await window.GSPSalas.verificarTodosGruposConcluiram(_sala.codigo).catch(() => false);

  const el = document.getElementById('painel-anfitriao-body');
  if (!el) return;

  const podioBtn = sala.podioVisivel
    ? `<button class="btn-secondary" disabled>Pódio já revelado</button>`
    : todos
      ? `<button class="btn-primary" onclick="anfitriaoRevelarPodio()">🏆 Revelar Pódio</button>`
      : `<button class="btn-secondary" disabled>Aguardando grupos (${grupos.filter(g=>g.statusCiclo==='concluido').length}/${grupos.length})</button>`;

  el.innerHTML = `
    <div class="painel-anf-section">
      <div class="painel-anf-label">Sala: <strong>${sala.nome || sala.codigo}</strong> · Ciclo ${sala.cicloAtual || 1}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
        ${podioBtn}
        <button class="btn-secondary" onclick="anfitriaoNovoCiclo()">🔄 Novo Ciclo</button>
        <button class="btn-danger" onclick="anfitriaoEncerrarSala()">❌ Encerrar Sala</button>
      </div>
    </div>
    <div class="painel-anf-section">
      <div class="painel-anf-label">Grupos (${grupos.length}/${sala.limiteGrupos || '∞'})</div>
      ${grupos.map(g => `
        <div class="painel-grupo-row" style="border-left:3px solid ${g.cor}">
          <div>
            <span style="color:${g.cor};font-weight:700">${g.nomeGrupo}</span>
            <span style="color:var(--t3);font-size:.75rem"> · ${g.membros?.length||0} membros · ${g.statusCiclo}</span>
          </div>
        </div>`).join('')}
    </div>`;
}

async function anfitriaoRevelarPodio() {
  if (!_sala || !_player?.uid) return;
  try {
    await window.GSPSalas.revelarPodio(_sala.codigo, _player.uid);
    mostrarSucesso('✅ Pódio revelado!');
    await _renderPainelAnfitriao();
  } catch(e) { mostrarAviso('Erro: ' + e.message); }
}

async function anfitriaoNovoCiclo() {
  if (!_sala || !_player?.uid) return;
  if (!confirm('Liberar novo ciclo? Todos os grupos voltarão ao status "aguardando".')) return;
  try {
    await window.GSPSalas.liberarNovoCiclo(_sala.codigo, _player.uid);
    _sala.cicloAtual = (_sala.cicloAtual || 1) + 1;
    LS.set(SK.SALA, _sala);
    mostrarSucesso('✅ Novo ciclo liberado!');
    await _renderPainelAnfitriao();
  } catch(e) { mostrarAviso('Erro: ' + e.message); }
}

async function anfitriaoEncerrarSala() {
  if (!_sala || !_player?.uid) return;
  if (!confirm('Encerrar a sala permanentemente?')) return;
  try {
    await window.GSPSalas.encerrarSala(_sala.codigo, _player.uid);
    sairDaSala();
    mostrarSucesso('Sala encerrada.');
    mostrarTela('screen-home');
  } catch(e) { mostrarAviso('Erro: ' + e.message); }
}


/* ════════════════════════════════════════════════════
   MODO DE JOGO — Solo vs Em Grupo
════════════════════════════════════════════════════ */

// Cache da flag. Atualizado pelo polling global a cada tick.
let _modoSalaAtivo = false;

// Chamado pelo polling global sempre que chega config do Firestore.
// Fonte única de verdade: campo modoSalaAtivo (salvo pelo admin).
function _atualizarModoSala(cfg) {
  _modoSalaAtivo = !!(cfg?.modoSalaAtivo);
}

/* ── Botão "Iniciar Mandato" ── */
async function abrirModalModo() {
  // Modo sala desativado → vai direto para seleção de empresa (modo individual)
  if (!_modoSalaAtivo) {
    irParaSetores();
    return;
  }

  // Modo sala ativado → mostra modal Solo / Em Grupo
  const salaAtual  = SalaMode.getSala();
  const grupoAtual = SalaMode.getGrupo();
  const descEl     = document.getElementById('modo-grupo-desc');
  const avisoEl    = document.getElementById('modo-grupo-aviso');

  if (descEl) {
    if (salaAtual && grupoAtual) {
      descEl.textContent = '🏟️ ' + (salaAtual.nome || salaAtual.codigo) + ' · 👥 ' + grupoAtual.nomeGrupo;
    } else if (salaAtual) {
      descEl.textContent = '🏟️ ' + (salaAtual.nome || salaAtual.codigo) + ' — escolha um grupo';
    } else {
      descEl.textContent = 'Jogue colaborativamente com sua equipe';
    }
  }
  if (avisoEl) avisoEl.style.display = 'none';

  _atualizarBotaoCriarSala();
  const modal = document.getElementById('modal-modo-jogo');
  if (modal) modal.style.display = 'flex';
}

function fecharModalModo() {
  const modal = document.getElementById('modal-modo-jogo');
  if (modal) modal.style.display = 'none';
}

function escolherModoSolo() {
  fecharModalModo();
  irParaSetores();
}

async function escolherModoGrupo() {
  const avisoEl = document.getElementById('modo-grupo-aviso');

  // Fix: usa getters do SalaMode (variáveis locais _sala/_grupoAtual do mainBeta
  // não são preenchidas para jogadores comuns que entram via SalaMode.entrar())
  const _salaAtual  = SalaMode.getSala();
  const _grupoAtual = SalaMode.getGrupo();

  // Não está em sala → abre modal de código
  if (!_salaAtual) {
    fecharModalModo();
    SalaMode.abrirModal();
    return;
  }

  // Está em sala mas não escolheu grupo → vai para tela de grupos
  if (!_grupoAtual) {
    fecharModalModo();
    await SalaMode.irGrupos();
    return;
  }

  // Está em grupo → vai para lobby
  fecharModalModo();
  await SalaMode.irLobby();
}


/* _mostrarOverlayManutencao / _esconderOverlayManutencao / manutencaoSalvarSair → maintenance.js */
function _mostrarOverlayManutencao(msg) { window.Maintenance.mostrarOverlay(msg); }
function _esconderOverlayManutencao()   { window.Maintenance.esconderOverlay(); }
function manutencaoSalvarSair()         { window.Maintenance.salvarSair(); }

/* ════════════════════════════════════════════════════
   CRIAR SALA — só admin
════════════════════════════════════════════════════ */

let _codigoSalaCriada = null;

/* Mostra/esconde botão "Criar Sala" no modal de modo */
function _atualizarBotaoCriarSala() {
  const wrap = document.getElementById('modo-criar-sala-wrap');
  if (wrap) wrap.style.display = _isAdmin ? 'block' : 'none';
}

function abrirModalCriarSala() {
  fecharModalModo();
  const modal = document.getElementById('modal-criar-sala');
  if (!modal) return;
  // Reset form
  const nomeEl = document.getElementById('criar-sala-nome');
  if (nomeEl) nomeEl.value = '';
  document.querySelector('input[name="criar-sala-setor"][value="livre"]').checked = true;
  document.getElementById('criar-sala-setor-fixo-wrap').style.display = 'none';
  document.getElementById('criar-sala-limite-grupos').value = '4';
  document.getElementById('criar-sala-min-membros').value = '2';
  document.getElementById('criar-sala-max-membros').value = '6';
  const statusEl = document.getElementById('criar-sala-status');
  if (statusEl) statusEl.style.display = 'none';
  modal.style.display = 'flex';

  // Toggle setor fixo/livre
  document.querySelectorAll('input[name="criar-sala-setor"]').forEach(r => {
    r.onchange = () => {
      const wrap = document.getElementById('criar-sala-setor-fixo-wrap');
      if (wrap) wrap.style.display = r.value === 'fixo' ? 'block' : 'none';
    };
  });
}

function fecharModalCriarSala() {
  const modal = document.getElementById('modal-criar-sala');
  if (modal) modal.style.display = 'none';
}

async function confirmarCriarSala() {
  const nome         = document.getElementById('criar-sala-nome')?.value.trim();
  const modoSetor    = document.querySelector('input[name="criar-sala-setor"]:checked')?.value || 'livre';
  const setorFixo    = document.getElementById('criar-sala-setor-fixo')?.value || '';
  const limiteGrupos = parseInt(document.getElementById('criar-sala-limite-grupos')?.value) || 4;
  const minMembros   = parseInt(document.getElementById('criar-sala-min-membros')?.value)   || 2;
  const maxMembros   = parseInt(document.getElementById('criar-sala-max-membros')?.value)   || 6;

  const statusEl = document.getElementById('criar-sala-status');
  const _setStatus = (msg, tipo) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = 'sala-status sala-status--' + (tipo || 'info');
    statusEl.style.display = msg ? 'block' : 'none';
  };

  if (!nome) { _setStatus('Digite um nome para a sala.', 'erro'); return; }
  if (!_player?.uid) { _setStatus('Você precisa estar logado.', 'erro'); return; }

  const btn = document.getElementById('btn-confirmar-criar-sala');
  if (btn) { btn.disabled = true; btn.textContent = 'Criando...'; }

  try {
    const result = await window.GSPSalas.criarSala({
      uid: _player.uid,
      nomeSala: nome,
      modoSetor,
      setorFixo: modoSetor === 'fixo' ? setorFixo : '',
      limiteGrupos,
      minMembros,
      maxMembros,
    });

    _codigoSalaCriada = result.codigo;

    // Entra automaticamente na sala criada
    await window.GSPSalas.entrarSala(result.codigo, { uid: _player.uid, nome: _player.nome });
    _sala = { ...result, ativa: true };
    LS.set(SK.SALA, _sala);

    fecharModalCriarSala();

    // Mostra modal com código gerado
    const modalCod = document.getElementById('modal-codigo-gerado');
    const codEl    = document.getElementById('codigo-gerado-valor');
    if (codEl) codEl.textContent = result.codigo;
    if (modalCod) modalCod.style.display = 'flex';

  } catch(e) {
    const msgs = {
      'sem_permissao':      'Apenas admins podem criar salas.',
      'codigo_indisponivel':'Erro ao gerar código. Tente novamente.',
      'sem_auth':           'Você precisa estar logado.',
    };
    _setStatus(msgs[e.message] || 'Erro: ' + e.message, 'erro');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Criar'; }
  }
}

function copiarCodigoSala() {
  if (!_codigoSalaCriada) return;
  navigator.clipboard?.writeText(_codigoSalaCriada)
    .then(() => mostrarSucesso('✅ Código copiado: ' + _codigoSalaCriada))
    .catch(() => mostrarAviso('Código: ' + _codigoSalaCriada));
}

async function irParaSalaAposCriar() {
  const modal = document.getElementById('modal-codigo-gerado');
  if (modal) modal.style.display = 'none';
  await SalaMode.irGrupos();
}


/* ── Gerenciar grupos (anfitrião) ── */
async function abrirGerenciarGrupos() {
  const modal = document.getElementById('modal-gerenciar-grupos');
  if (modal) modal.style.display = 'flex';
  await _renderGerenciarGrupos();
}

function fecharGerenciarGrupos() {
  const modal = document.getElementById('modal-gerenciar-grupos');
  if (modal) modal.style.display = 'none';
}

async function _renderGerenciarGrupos() {
  const body = document.getElementById('gerenciar-grupos-body');
  if (!body) return;
  body.innerHTML = '<div class="podio-loading">Carregando...</div>';

  try {
    const grupos  = await window.GSPSalas.carregarGrupos(_sala.codigo);
    const membros = await window.GSPSalas.carregarMembrosSala(_sala.codigo);

    // Mapa uid → grupo atual
    const uidParaGrupo = {};
    membros.forEach(m => { if (m.grupo) uidParaGrupo[m.uid] = m.grupo; });

    if (!grupos.length) {
      body.innerHTML = '<div class="podio-empty">Nenhum grupo criado ainda.</div>';
      return;
    }

    body.innerHTML = grupos.map(g => {
      const membrosDoGrupo = membros.filter(m => m.grupo === g.nomeGrupo);
      const membrosHtml = membrosDoGrupo.length
        ? membrosDoGrupo.map(m => {
            const isLider = m.uid === g.lider;
            const outrosGrupos = grupos.filter(og => og.nomeGrupo !== g.nomeGrupo);
            const moverOpcoes = outrosGrupos.map(og =>
              `<option value="${og.nomeGrupo}">${og.nomeGrupo}</option>`
            ).join('');
            return `<div class="gerenciar-membro-row">
              <span class="gerenciar-membro-nome">${isLider ? '👑 ' : ''}${m.nome || m.uid}</span>
              <div class="gerenciar-membro-acoes">
                ${outrosGrupos.length ? `
                  <select class="gerenciar-select" id="mover-select-${m.uid}">
                    <option value="">Mover para...</option>
                    ${moverOpcoes}
                  </select>
                  <button class="anf-btn-sm" onclick="BetaUI.moverMembroGrupo('${m.uid}','${g.nomeGrupo}')">Mover</button>
                ` : ''}
                <button class="anf-btn-sm anf-btn-sm--danger" onclick="BetaUI.removerMembroGrupo('${m.uid}','${g.nomeGrupo}')">✕</button>
              </div>
            </div>`;
          }).join('')
        : '<div style="color:var(--t3);font-size:.8rem;padding:6px 0">Nenhum membro</div>';

      return `<div class="gerenciar-grupo-bloco" style="border-left:3px solid ${g.cor}">
        <div class="gerenciar-grupo-header">
          <span style="color:${g.cor};font-weight:700">${g.nomeGrupo}</span>
          <span class="gerenciar-grupo-status">${g.statusCiclo}</span>
        </div>
        ${membrosHtml}
      </div>`;
    }).join('');

  } catch(e) {
    body.innerHTML = '<div class="podio-empty">Erro ao carregar.</div>';
  }
}

async function moverMembroGrupo(uid, grupoAtual) {
  const sel = document.getElementById('mover-select-' + uid);
  const grupoDestino = sel?.value;
  if (!grupoDestino) { mostrarAviso('Selecione o grupo de destino.'); return; }
  try {
    await window.GSPSalas.moverMembro(_sala.codigo, { uid, grupoAtual, grupoDestino });
    mostrarSucesso('✅ Membro movido!');
    await _renderGerenciarGrupos();
    await _carregarListaGrupos();
  } catch(e) { mostrarAviso('Erro: ' + e.message); }
}

async function removerMembroGrupo(uid, nomeGrupo) {
  if (!confirm('Remover este membro do grupo?')) return;
  try {
    // Remove do array membros do grupo
    const grupos = await window.GSPSalas.carregarGrupos(_sala.codigo);
    const grupo  = grupos.find(g => g.nomeGrupo === nomeGrupo);
    if (!grupo) return;
    const novosMembros = (grupo.membros || []).filter(m => m !== uid);
    const token = await window.GSPAuth.getToken();
    const docId = encodeURIComponent(nomeGrupo);
    const url   = window.GSPSalas._url('salas/' + _sala.codigo + '/grupos/' + docId) + '?updateMask.fieldPaths=membros';
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: {
        membros: { arrayValue: { values: novosMembros.map(m => ({ stringValue: m })) } }
      }})
    });
    mostrarSucesso('✅ Membro removido.');
    await _renderGerenciarGrupos();
    await _carregarListaGrupos();
  } catch(e) { mostrarAviso('Erro: ' + e.message); }
}



/* ════════════════════════════════════════════════════
   CAIXA DE ENTRADA (INBOX) — COMUNICADOS DO ADMIN
════════════════════════════════════════════════════ */
let _inboxMensagens   = [];
let _inboxUnsubscribe = null;
const _FS_BASE = `https://firestore.googleapis.com/v1/projects/under-pressure-49320/databases/default/documents`;
const _CAT_ICONS_PLAYER = { geral:'💬', aviso:'📢', conquista:'🎉', alerta:'⚠️' };

function _iniciarInbox(uid) {
  if (!uid) return;
  _pararInbox();
  _buscarMensagens(uid);
  _inboxUnsubscribe = setInterval(() => _buscarMensagens(uid), 5000);
}

function _pararInbox() {
  if (_inboxUnsubscribe) { clearInterval(_inboxUnsubscribe); _inboxUnsubscribe = null; }
}

async function _buscarMensagens(uid) {
  try {
    const tok = await window.GSPAuth?.getToken().catch(() => null);
    if (!tok) return;
    const r = await fetch(`${_FS_BASE}/usuarios/${uid}:runQuery`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'mensagens' }], limit: 100 } })
    });
    if (!r.ok) return;
    const rows = await r.json();
    const data = { documents: rows.map(row => row.document).filter(Boolean) };
    const agora = Date.now();
    const docs = (data.documents || []).map(doc => {
      const f = doc.fields || {};
      const _v = v => {
        if (!v) return null;
        if (v.stringValue  !== undefined) return v.stringValue;
        if (v.integerValue !== undefined) return parseInt(v.integerValue);
        if (v.booleanValue !== undefined) return v.booleanValue;
        return null;
      };
      return {
        id:                doc.name.split('/').pop(),
        texto:             _v(f.texto),
        de:                _v(f.de) || 'admin',
        ts:                _v(f.ts) || 0,
        lida:              _v(f.lida) || false,
        confirmada:        _v(f.confirmada) || false,
        categoria:         _v(f.categoria) || 'geral',
        fixada:            _v(f.fixada) || false,
        exigirConfirmacao: _v(f.exigirConfirmacao) || false,
        expiraEm:          _v(f.expiraEm) || 0,
        broadcast:         _v(f.broadcast) || false,
      };
    }).filter(m => !m.expiraEm || m.expiraEm > agora) // remove expiradas
      .sort((a, b) => {
        if (a.fixada && !b.fixada) return -1;
        if (!a.fixada && b.fixada) return 1;
        return b.ts - a.ts;
      });

    const anterior = _inboxMensagens.filter(m => !m.lida).length;
    _inboxMensagens = docs;
    const atual = docs.filter(m => !m.lida).length;

    // Toast de nova mensagem se chegou algo novo
    if (atual > anterior && anterior >= 0 && document.visibilityState !== undefined) {
      _showToast('📬 Você tem um novo comunicado', 'ok', 4000);
    }

    _atualizarBadgeInbox();
    _renderizarPerfilMsgs(); // atualiza aba no perfil se estiver aberta
  } catch(e) { /* silencioso */ }
}

function _atualizarBadgeInbox() {
  const naoLidas = _inboxMensagens.filter(m => !m.lida).length;
  const btn   = document.getElementById('btn-inbox');
  const badge = document.getElementById('inbox-badge');
  if (!btn) return;
  btn.style.display = ''; // sempre visível quando logado
  if (badge) {
    badge.style.display = naoLidas > 0 ? '' : 'none';
    badge.textContent   = naoLidas > 9 ? '9+' : String(naoLidas);
  }
}

let _inboxAbaAtiva = 'mensagem';

function mudarAbaInbox(aba) {
  _inboxAbaAtiva = aba;
  document.getElementById('inbox-tab-mensagem')?.classList.toggle('active', aba === 'mensagem');
  document.getElementById('inbox-tab-changelog')?.classList.toggle('active', aba === 'changelog');
  document.getElementById('inbox-painel-mensagem')?.classList.toggle('active', aba === 'mensagem');
  document.getElementById('inbox-painel-changelog')?.classList.toggle('active', aba === 'changelog');
  if (aba === 'changelog') _renderChangelog();
}

function _renderInboxMensagens() {
  const lista  = document.getElementById('inbox-lista');
  const subtit = document.getElementById('inbox-subtitulo');
  if (!lista) return;

  const total    = _inboxMensagens.length;
  const naoLidas = _inboxMensagens.filter(m => !m.lida).length;
  if (subtit) subtit.textContent = total === 0 ? 'Nenhum comunicado' : `${naoLidas > 0 ? naoLidas + ' não lido(s) · ' : ''}${total} total`;

  const badgeTab = document.getElementById('inbox-badge-tab');
  if (badgeTab) {
    if (naoLidas > 0) { badgeTab.textContent = naoLidas; badgeTab.style.display = 'inline-flex'; }
    else { badgeTab.style.display = 'none'; }
  }

  if (!total) {
    lista.innerHTML = '<div class="inbox-vazio">Nenhum comunicado recebido.</div>';
    return;
  }

  lista.innerHTML = _inboxMensagens.map(m => {
    const catIcon = _CAT_ICONS_PLAYER[m.categoria] || '💬';
    const data    = m.ts ? new Date(m.ts).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '';
    const fixPin  = m.fixada ? '<span class="inbox-msg-fixada-tag">📌 Fixado</span>' : '';
    const lida_cl = m.lida ? 'lida' : 'nao-lida';
    const fix_cl  = m.fixada ? ' fixada' : '';
    const confirmar_btn = (!m.lida && m.exigirConfirmacao && !m.confirmada)
      ? `<button class="inbox-confirmar-btn" onclick="BetaUI._confirmarLeitura('${m.id}')">✅ Entendido</button>`
      : '';
    const apagar_btn = `<button class="inbox-msg-apagar" onclick="BetaUI._apagarMsg('${m.id}')" title="Apagar">🗑️</button>`;
    // _escapeHtml + white-space:pre-line no CSS preserva as quebras de
    // linha digitadas pelo admin, em vez do texto sair tudo corrido numa
    // única linha (era a reclamação original sobre a formatação).
    const textoSeguro = _escapeHtml(m.texto || '');
    return `
      <div class="inbox-msg-item ${lida_cl}${fix_cl}" id="inbox-item-${m.id}">
        <div class="inbox-msg-top">
          <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap">
            <span class="inbox-msg-cat">${catIcon} ${m.categoria}</span>
            ${fixPin}
          </div>
          <div style="display:flex;align-items:center;gap:4px;flex-shrink:0">
            <span class="inbox-msg-data">${data}</span>
            ${apagar_btn}
          </div>
        </div>
        <div class="inbox-msg-corpo" onclick="BetaUI._lerMensagem('${m.id}')">${textoSeguro}</div>
        ${!m.lida && !m.exigirConfirmacao ? `<div class="inbox-msg-hint">● Não lido — toque para marcar</div>` : ''}
        ${confirmar_btn}
      </div>`;
  }).join('');
}

// Renderiza o changelog publicado pelo admin (documento config/changelog
// no Firestore, mesmo padrão de leitura pública usado em config/admins).
// Se nada foi publicado ainda, mostra um estado vazio em vez de quebrar.
async function _renderChangelog() {
  const wrap = document.getElementById('inbox-changelog-content');
  if (!wrap) return;
  wrap.innerHTML = '<div class="inbox-vazio">Carregando...</div>';
  try {
    let tok = null;
    try { tok = await window.GSPAuth?.getToken?.(); } catch(e) {}
    const r = await fetch(`${_FS_BASE}/config/changelog`, {
      headers: tok ? { Authorization: `Bearer ${tok}` } : {}
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const doc = await r.json();
    const fields = doc?.fields;
    const texto  = fields?.texto?.stringValue || '';
    if (!fields || !texto) {
      wrap.innerHTML = '<div class="inbox-vazio">Nenhuma novidade publicada ainda.</div>';
      return;
    }
    // Expiração automática — definida pelo admin ao publicar (0 = sem expiração).
    // Se já passou, trata como se nada estivesse publicado, sem precisar de
    // uma ação separada do admin para "esconder" o changelog vencido.
    const expiraEmStr = fields.expiraEm?.timestampValue || null;
    if (expiraEmStr && new Date(expiraEmStr).getTime() <= Date.now()) {
      wrap.innerHTML = '<div class="inbox-vazio">Nenhuma novidade publicada ainda.</div>';
      return;
    }
    // O jogador nunca vê o campo "versao" (hash/número técnico de deploy) —
    // só o título editável que o admin escreveu ao publicar. "Novidades"
    // é o fallback caso o admin não tenha preenchido um título.
    const titulo = _escapeHtml(fields.titulo?.stringValue || 'Novidades');
    const tsStr  = fields.ts?.timestampValue || null;
    const data   = tsStr ? new Date(tsStr).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' }) : '';
    const corpo  = _escapeHtml(texto);
    wrap.innerHTML = `
      <div class="inbox-changelog-version">${titulo}</div>
      ${data ? `<div class="inbox-changelog-data">${data}</div>` : ''}
      <div class="inbox-changelog-corpo">${corpo}</div>`;
  } catch (e) {
    wrap.innerHTML = '<div class="inbox-vazio">Nenhuma novidade publicada ainda.</div>';
  }
}

function abrirInbox() {
  mostrarTela('screen-inbox');
  _inboxAbaAtiva = 'mensagem';
  document.getElementById('inbox-tab-mensagem')?.classList.add('active');
  document.getElementById('inbox-tab-changelog')?.classList.remove('active');
  document.getElementById('inbox-painel-mensagem')?.classList.add('active');
  document.getElementById('inbox-painel-changelog')?.classList.remove('active');
  _renderInboxMensagens();
  // Marca simples como lidas ao abrir (não as que exigem confirmação)
  if (_player?.uid) _marcarLidasSimples(_player.uid);
}

function fecharInbox() {
  mostrarTela('screen-home');
  _atualizarBadgeInbox();
}

async function _lerMensagem(msgId) {
  if (!_player?.uid) return;
  const msg = _inboxMensagens.find(m => m.id === msgId);
  if (!msg || msg.lida) return;
  msg.lida = true;
  // Atualiza visual inline
  const item = document.getElementById(`inbox-item-${msgId}`);
  if (item) {
    item.classList.replace('nao-lida', 'lida');
    const hint = item.querySelector('[style*="eab308"]');
    if (hint) hint.remove();
  }
  _atualizarBadgeInbox();
  try {
    const tok = await window.GSPAuth?.getToken().catch(() => null);
    if (!tok) return;
    await fetch(`${_FS_BASE}/usuarios/${_player.uid}/mensagens/${msgId}?updateMask.fieldPaths=lida`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { lida: { booleanValue: true } } })
    });
    // Atualiza lidoPor no log se broadcast
    if (msg.broadcast) _incrementarLidoPor(msgId);
  } catch(e) { /* silencioso */ }
}

async function _confirmarLeitura(msgId) {
  if (!_player?.uid) return;
  const msg = _inboxMensagens.find(m => m.id === msgId);
  if (!msg) return;
  msg.lida = true;
  msg.confirmada = true;
  const item = document.getElementById(`inbox-item-${msgId}`);
  if (item) {
    item.classList.replace('nao-lida', 'lida');
    const btn = item.querySelector('.inbox-confirmar-btn');
    if (btn) btn.remove();
  }
  _atualizarBadgeInbox();
  try {
    const tok = await window.GSPAuth?.getToken().catch(() => null);
    if (!tok) return;
    await fetch(`${_FS_BASE}/usuarios/${_player.uid}/mensagens/${msgId}?updateMask.fieldPaths=lida&updateMask.fieldPaths=confirmada`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { lida: { booleanValue: true }, confirmada: { booleanValue: true } } })
    });
    if (msg.broadcast) _incrementarLidoPor(msgId);
  } catch(e) { /* silencioso */ }
}

async function _apagarMsg(msgId) {
  if (!_player?.uid) return;
  _inboxMensagens = _inboxMensagens.filter(m => m.id !== msgId);
  const item = document.getElementById(`inbox-item-${msgId}`);
  if (item) item.remove();
  _atualizarBadgeInbox();
  try {
    const tok = await window.GSPAuth?.getToken().catch(() => null);
    if (!tok) return;
    await fetch(`${_FS_BASE}/usuarios/${_player.uid}/mensagens/${msgId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${tok}` }
    });
  } catch(e) { /* silencioso */ }
}

async function apagarTodasMsgs() {
  if (!_player?.uid || !_inboxMensagens.length) return;
  const ids = [..._inboxMensagens.map(m => m.id)];
  _inboxMensagens = [];
  fecharInbox();
  _atualizarBadgeInbox();
  try {
    const tok = await window.GSPAuth?.getToken().catch(() => null);
    if (!tok) return;
    for (const id of ids) {
      fetch(`${_FS_BASE}/usuarios/${_player.uid}/mensagens/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${tok}` }
      }).catch(() => {});
    }
  } catch(e) { /* silencioso */ }
}

async function marcarTodasLidas() {
  if (!_player?.uid) return;
  const naoLidas = _inboxMensagens.filter(m => !m.lida);
  naoLidas.forEach(m => { m.lida = true; });
  _atualizarBadgeInbox();
  fecharInbox();
  try {
    const tok = await window.GSPAuth?.getToken().catch(() => null);
    if (!tok) return;
    for (const msg of naoLidas) {
      fetch(`${_FS_BASE}/usuarios/${_player.uid}/mensagens/${msg.id}?updateMask.fieldPaths=lida`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { lida: { booleanValue: true } } })
      }).catch(() => {});
      if (msg.broadcast) _incrementarLidoPor(msg.id);
    }
  } catch(e) { /* silencioso */ }
}

async function _marcarLidasSimples(uid) {
  const simples = _inboxMensagens.filter(m => !m.lida && !m.exigirConfirmacao);
  if (!simples.length) return;
  simples.forEach(m => { m.lida = true; });
  _atualizarBadgeInbox();
  try {
    const tok = await window.GSPAuth?.getToken().catch(() => null);
    if (!tok) return;
    for (const msg of simples) {
      fetch(`${_FS_BASE}/usuarios/${uid}/mensagens/${msg.id}?updateMask.fieldPaths=lida`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { lida: { booleanValue: true } } })
      }).catch(() => {});
      if (msg.broadcast) _incrementarLidoPor(msg.id);
    }
  } catch(e) { /* silencioso */ }
}

async function _incrementarLidoPor(msgId) {
  try {
    const tok = await window.GSPAuth?.getToken().catch(() => null);
    if (!tok) return;
    const r = await fetch(`${_FS_BASE}/mensagens_log/${msgId}`, { headers: { Authorization: `Bearer ${tok}` } });
    if (!r.ok) return;
    const doc = await r.json();
    const atual = parseInt(doc.fields?.lidoPor?.integerValue || '0');
    await fetch(`${_FS_BASE}/mensagens_log/${msgId}?updateMask.fieldPaths=lidoPor`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { lidoPor: { integerValue: String(atual + 1) } } })
    });
  } catch(e) { /* silencioso */ }
}

function _renderizarPerfilMsgs() {
  const lista = document.getElementById('perfil-msgs-lista');
  const titulo = document.getElementById('perfil-msgs-titulo');
  if (!lista) return;
  if (!_inboxMensagens.length) {
    if (titulo) titulo.style.display = 'none';
    lista.innerHTML = '';
    return;
  }
  if (titulo) titulo.style.display = '';
  lista.innerHTML = _inboxMensagens.map(m => {
    const catIcon = _CAT_ICONS_PLAYER[m.categoria] || '💬';
    const data    = m.ts ? new Date(m.ts).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '';
    return `
      <div style="background:var(--bg3);border:1px solid ${m.lida ? 'var(--line2)' : 'rgba(234,179,8,.3)'};border-radius:10px;padding:11px 13px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div style="flex:1">
          <div style="font-size:.7rem;color:var(--t3);margin-bottom:4px">${catIcon} ${m.categoria} · ${data}</div>
          <div style="font-size:.83rem;color:${m.lida ? 'var(--t2)' : 'var(--t1)'};line-height:1.4">${m.texto || ''}</div>
        </div>
        <button onclick="BetaUI._apagarMsg('${m.id}');BetaUI._renderPerfilMsgsPublic()" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:.8rem;flex-shrink:0;padding:2px">🗑️</button>
      </div>`;
  }).join('');
}

// Public wrapper for profile screen delete refresh
function _renderPerfilMsgsPublic() { _renderizarPerfilMsgs(); }

// Leitura simples (sem side-effects) do status do tutorial no Firestore.
// Usado no fluxo de sessão salva, onde não faz sentido reavaliar
// boas-vindas — só precisamos saber se o tutorial já foi visto.
async function _checarTutorialVisto(uid) {
  try {
    const tok = await window.GSPAuth?.getToken().catch(() => null);
    if (!tok) return true; // sem token, assume visto para não travar o boot
    const r = await fetch(`${_FS_BASE}/usuarios/${uid}`, { headers: { Authorization: `Bearer ${tok}` } });
    if (!r.ok) return true;
    const doc = await r.json();
    return doc?.fields?.tutorialVisto?.booleanValue === true;
  } catch(e) { return true; }
}

// Onboarding de novo jogador — unifica duas verificações num único
// documento (usuarios/{uid}), em vez de depender de localStorage
// (gsp_tutorial_done) ou de "checar se já tem mensagem" como proxy.
// Isso garante que tutorial e boas-vindas aparecem exatamente uma vez
// por jogador, mesmo trocando de dispositivo ou limpando o cache/app.
//
// Retorna { mostrarTutorial: boolean } para quem chamou decidir a
// navegação (mostrarTela('screen-tutorial') vs 'screen-home').
async function _verificarOnboarding(uid, nome) {
  let mostrarTutorial = true; // padrão seguro: mostra tutorial se não der pra confirmar
  try {
    const tok = await window.GSPAuth?.getToken().catch(() => null);
    if (!tok) return { mostrarTutorial };

    const headers = { Authorization: `Bearer ${tok}` };
    const r = await fetch(`${_FS_BASE}/usuarios/${uid}`, { headers });
    const doc = r.ok ? await r.json() : null;
    const fields = doc?.fields || {};
    const tutorialVisto      = fields.tutorialVisto?.booleanValue === true;
    const boasVindasRecebida = fields.boasVindasRecebidas?.booleanValue === true;
    mostrarTutorial = !tutorialVisto;

    // Se o tutorial ainda não foi marcado como visto neste documento (ex:
    // jogador que já tinha localStorage de um dispositivo antigo, mas
    // nunca teve o campo no Firestore), a tela de tutorial decide isso
    // sozinha via mostrarTutorial; aqui só cuidamos da marcação em si
    // não ser perdida — quem fecha o tutorial já grava tutorialVisto=true
    // (ver fecharTutorial()).

    if (!boasVindasRecebida) {
      // Busca o texto configurável pelo admin. Se o documento ainda não
      // existir (admin nunca configurou), usa um texto padrão de fallback
      // para não deixar o jogador sem nenhuma mensagem de boas-vindas.
      let texto = `Bem-vindo(a) ao Under Pressure, ${nome}! 🎮 Aqui você vai tomar decisões críticas como CEO e ver os resultados em tempo real. Boa sorte nos mandatos!`;
      try {
        const rMsg = await fetch(`${_FS_BASE}/config/mensagemBoasVindas`, { headers });
        if (rMsg.ok) {
          const docMsg = await rMsg.json();
          const t = docMsg?.fields?.texto?.stringValue;
          if (t) texto = t.replace(/\{nome\}/g, nome);
        }
      } catch(e) { /* usa o fallback */ }

      const msgId = `bv_${Date.now()}`;
      await fetch(`${_FS_BASE}/usuarios/${uid}/mensagens/${msgId}?updateMask.fieldPaths=texto&updateMask.fieldPaths=de&updateMask.fieldPaths=ts&updateMask.fieldPaths=lida&updateMask.fieldPaths=confirmada&updateMask.fieldPaths=categoria&updateMask.fieldPaths=fixada&updateMask.fieldPaths=exigirConfirmacao&updateMask.fieldPaths=expiraEm`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: {
          texto:             { stringValue: texto },
          de:                { stringValue: 'admin' },
          ts:                { integerValue: String(Date.now()) },
          lida:              { booleanValue: false },
          confirmada:        { booleanValue: false },
          categoria:         { stringValue: 'geral' },
          fixada:            { booleanValue: true },
          exigirConfirmacao: { booleanValue: false },
          expiraEm:          { integerValue: String(Date.now() + 90*24*60*60*1000) },
        }})
      });

      // Marca no documento do usuário para nunca mais reenviar, em
      // qualquer dispositivo — isso é o que resolve o problema de
      // reaparecer após trocar de aparelho ou limpar o cache.
      await fetch(`${_FS_BASE}/usuarios/${uid}?updateMask.fieldPaths=boasVindasRecebidas`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { boasVindasRecebidas: { booleanValue: true } } })
      });
    }
  } catch(e) { /* silencioso — onboarding não deve travar o login */ }
  return { mostrarTutorial };
}

// Marca o tutorial como visto no Firestore (documento do usuário), em vez
// de só localStorage. Chamado quando o jogador fecha/completa o tutorial.
async function _marcarTutorialVistoRemoto(uid) {
  if (!uid) return;
  try {
    const tok = await window.GSPAuth?.getToken().catch(() => null);
    if (!tok) return;
    await fetch(`${_FS_BASE}/usuarios/${uid}?updateMask.fieldPaths=tutorialVisto`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { tutorialVisto: { booleanValue: true } } })
    });
  } catch(e) { /* silencioso */ }
}


window.BetaUI = {
  irParaLogin, irParaAuth, irComoConvidado, confirmarNome, sair, banIrParaLogin,
  authMudarAba, authTogglePass, authLogin, authCadastrar, authGoogle, authRecuperar,
  irParaSetores, irParaPodio, irParaHistoricoJogos,
  irParaPerfil, filtrarPodio, _copiarId,
  restaurarSessao, descartarSessao,
  selecionarSetor, lancarJogo, comecaJogo,
  mudarTab, escolher, avancar, reiniciar,
  openGlossary, closeGlossary, filtrarGlossario, selecionarAbaGlossario, openSettings, closeSettings, toggleTimerSetting, toggleCloudStatus, toggleMostrarStatus,
  toggleFullscreen, voltar,
  irParaConfig, toggleFotoPerfil, confirmarFotoPerfil, cancelarFotoPerfil, abrirEditarNome, fecharEditarNome, salvarNome,
  // Novos
  pularTutorial, tutorialStep, irParaSlide, reverTutorial,
  pausarJogo, continuarJogo, abandonarJogo,
  pedirConfirmacaoSaida, cancelarSaida, confirmarSaida,
  abrirTooltipIndicador, closeTooltip, abrirInfoTimer, abrirInfoModoTreino, abrirTermoGlossario,
  toggleModoTreino,
  compartilharResultado,
  irParaAdmin,
  gerarNomeAleatorio,
  // Sala — via SalaMode (sala-mode-new.js)
  abrirModalSala:       () => SalaMode.abrirModal(),
  fecharModalSala:      () => SalaMode.fecharModal(),
  entrarNaSala:         () => SalaMode.entrar(),
  sairDaSala:           () => SalaMode.sair(),
  irParaPodioSala:      () => SalaMode.irPodio(),
  irParaGrupos:         () => SalaMode.irGrupos(),
  abrirModalCriarGrupo: () => SalaMode.abrirCriarGrupo(),
  fecharModalCriarGrupo:() => SalaMode.fecharCriarGrupo(),
  confirmarCriarGrupo:  () => SalaMode.confirmarCriarGrupo(),
  entrarNoGrupo:        (n) => SalaMode.entrarGrupo(n),
  _selecionarCor:       (c) => SalaMode._selecionarCor(c),
  irParaLobby:          () => SalaMode.irLobby(),
  iniciarPartidaGrupo:  () => SalaMode.iniciarPartida(),
  votarOpcao:           (l) => SalaMode.votar(l),
  abrirPainelAnfitriao: () => SalaMode.irPainelAnf(),
  anfitriaoRevelarPodio:() => SalaMode.anfRevelar(),
  anfitriaoNovoCiclo:   () => SalaMode.anfNovoCiclo(),
  anfitriaoEncerrarSala:() => SalaMode.anfEncerrar(),
  // Modo de jogo
  abrirModalModo, fecharModalModo, escolherModoSolo, escolherModoGrupo,
  // Inbox
  abrirInbox, fecharInbox, mudarAbaInbox, marcarTodasLidas, _lerMensagem,
  _confirmarLeitura, _apagarMsg, apagarTodasMsgs, _renderPerfilMsgsPublic,
  // Manutenção
  manutencaoSalvarSair,
  // Criar sala (admin)
  abrirModalCriarSala, fecharModalCriarSala, confirmarCriarSala,
  copiarCodigoSala, irParaSalaAposCriar,
  // Anfitrião inline
  recarregarGrupos:      () => SalaMode.recarregarGrupos(),
  abrirGerenciarGrupos:  () => SalaMode.abrirGerenciar(),
  fecharGerenciarGrupos: () => SalaMode.fecharGerenciar(),
  moverMembroGrupo:      (g,u) => SalaMode._removerGrupo && SalaMode._removerGrupo(g,u),
  removerMembroGrupo:    (g,u) => SalaMode._removerGrupo && SalaMode._removerGrupo(g,u),
};

// Inicializa o jogo
/* ════════════════════════════════════════════════════
   BOTÃO VOLTAR — popstate
════════════════════════════════════════════════════ */
function _telaAtiva() {
  return document.querySelector('.screen.active')?.id || '';
}

function _overlayAberto() {
  const overlays = ['overlay-pause','overlay-tooltip','overlay-glossary','overlay-settings'];
  return overlays.find(id => {
    const el = document.getElementById(id);
    return el && el.style.display !== 'none' && el.style.display !== '';
  }) || null;
}

function _iniciarPopstate() {
  // Garante que há um estado inicial no histórico
  history.replaceState({ gsp: true }, '');
  // Adiciona um segundo estado — assim o primeiro popstate não sai do site
  history.pushState({ gsp: true }, '');

  window.addEventListener('popstate', function() {
    // Repõe o estado para o browser não sair do site
    history.pushState({ gsp: true }, '');

    // 1. Overlay aberto → fecha o overlay
    const overlay = _overlayAberto();
    if (overlay) {
      _fecharOverlay(overlay);
      return;
    }

    const tela = _telaAtiva();

    // 2. Durante o jogo → abre pausa
    if (tela === 'screen-game' || tela === 'screen-intro' || tela === 'screen-feedback') {
      pausarJogo();
      return;
    }

    // 3. Telas que voltam para home
    if (['screen-perfil','screen-podio','screen-historico-jogos','screen-sector','screen-inbox'].includes(tela)) {
      voltar('screen-home');
      return;
    }

    // 4. Seleção de empresa → volta para setor
    if (tela === 'screen-company') {
      voltar('screen-sector');
      return;
    }

    // 5. Auth — cadastro/recuperar → volta para login
    if (tela === 'screen-auth') {
      const abaAtiva = document.getElementById('auth-form-cadastro')?.style.display !== 'none'
        || document.getElementById('auth-form-recuperar')?.style.display !== 'none';
      if (abaAtiva) {
        authMudarAba('login');
      }
      return;
    }

    // 6. Home, login, tutorial → não faz nada
  });
}

document.addEventListener('DOMContentLoaded', function() { _iniciarPopstate(); _boot(); });
