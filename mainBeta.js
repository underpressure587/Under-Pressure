/* ═══════════════════════════════════════════════════════
   GESTÃO SOB PRESSÃO · MAIN v5.1
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
};

/* ════════════════════════════════════════════════════
   ESTADO LOCAL
════════════════════════════════════════════════════ */
let _player   = null;
let _isAdmin  = false;
let _settings = { timer: false, cloudStatus: false };
let _setorSelecionado = null;
let _escolhaFeita     = false;
let _feedbackCallback = null;
let _timerInterval    = null;
let _manutencaoInterval = null;
let _globalPollInterval  = null;
let _ultimaMensagemGlobal = '';
let _timerSegs        = 0;
let _bloqueioAte      = 0; // timestamp — bloqueia escolher() durante transições
let _prevIndicators   = {}; // track trends

/* ════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════ */
function _setFirebaseStatus(estado) {
  // estados: 'connecting' | 'online' | 'offline'
  const dot   = document.getElementById('firebase-status-dot');
  const label = document.getElementById('firebase-status-label');
  if (!dot || !label) return;
  dot.className = 'firebase-dot firebase-dot--' + estado;
  const textos = { connecting: 'Conectando', online: 'Online', offline: 'Offline' };
  label.textContent = textos[estado] || estado;
  label.style.color = estado === 'online' ? '#2ecc71' : estado === 'offline' ? '#e74c3c' : 'var(--t3)';
}

// Inicia polling do Firebase só após DOM pronto
window.addEventListener('DOMContentLoaded', function _pollFirebase() {
  let tentativas = 0;
  const intervalo = setInterval(() => {
    tentativas++;
    if (window.GSPSync && window.GSPAuth?.isReady()) {
      clearInterval(intervalo);
      _setFirebaseStatus('online');
    } else if (tentativas >= 80) {
      // Timeout de 6s sem resposta
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
      // Mostra loading breve antes de entrar
      const telaAtual = document.querySelector('.screen.active')?.id;
      if (telaAtual === 'screen-login' || telaAtual === 'screen-auth') {
        mostrarTela('screen-loading');
        _setLoadingMsg('Entrando no painel...', 'Bem-vindo de volta!', 90);
      }
      _loginOk(user);
    }
  });
}


/* ── HELPER: força overlay a cobrir a viewport real ── */
function _abrirOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;
  ['overlay-pause','overlay-tooltip','overlay-glossary','overlay-settings'].forEach(function(oid) {
    if (oid !== id) { var o = document.getElementById(oid); if (o) o.style.display = 'none'; }
  });
  if (el.parentNode !== document.body) document.body.appendChild(el);
  // Alinha com o #app para centralizar corretamente
  const app = document.getElementById('app');
  const rect = app ? app.getBoundingClientRect() : {left:0, top:0, width:window.innerWidth, height:window.innerHeight};
  el.style.position        = 'fixed';
  el.style.left            = rect.left + 'px';
  el.style.top             = rect.top  + 'px';
  el.style.width           = rect.width  + 'px';
  el.style.height          = rect.height + 'px';
  el.style.display         = 'flex';
  el.style.alignItems      = 'center';
  el.style.justifyContent  = 'center';
  el.style.padding         = '20px';
  el.style.boxSizing       = 'border-box';
  el.style.zIndex          = '99999';
}
function _fecharOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

async function _boot() {
  _settings = LS.get(SK.SETTINGS) || { timer: false, cloudStatus: false };
  document.querySelectorAll('.overlay').forEach(o => { _fecharOverlay(o.id); });

  // Sempre sai da screen-loading imediatamente
  const saved = LS.get(SK.PLAYER);
  if (saved) {
    _player = saved;
    _verificarSessaoSalva();
    _atualizarHome();
    _atualizarBotaoAdmin(saved.uid);
    _iniciarPollingGlobal(saved.uid); // inicia polling mesmo em sessão restaurada
    if (!localStorage.getItem('gsp_tutorial_done')) {
      mostrarTela('screen-tutorial');
    } else {
      mostrarTela('screen-home');
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
    s.style.display = '';
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
  const TELAS_JOGO = ["screen-intro","screen-game","screen-feedback","screen-result"];
  if (!TELAS_JOGO.includes(id)) _aplicarTemaSetor(null);
  window.scrollTo(0, 0);
  // Atualiza botão admin ao entrar na home
  if (id === 'screen-home') {
    _mostrarBotaoAdmin();
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
  _atualizarHome();
  mostrarTela("screen-home");
}

function confirmarNome() {
  const input = document.getElementById("player-name-input");
  const nome  = input?.value.trim();
  if (!nome) { mostrarErroCritico("Digite seu nome para continuar."); return; }
  _player = { nome, tipo: "user" };
  LS.set(SK.PLAYER, _player);
  if (input) input.value = "";
  _verificarSessaoSalva();
  _atualizarHome();
  mostrarTela("screen-home");
}

function sair() {
  _pararPollingGlobal();
  LS.remove(SK.PLAYER);
  LS.remove(SK.SESSION);
  _player = null;
  _isAdmin = false;
  if (window.GSPAuth?.isReady()) window.GSPAuth.logout().catch(() => {});
  mostrarTela("screen-login");
}

function _atualizarHome() {
  const el = document.getElementById("home-player-name");
  if (el) el.textContent = `OLÁ, ${(_player?.nome || "JOGADOR").toUpperCase()}`;
  const av = document.getElementById("home-avatar-icon");
  if (av && _player?.nome) av.textContent = _player.nome.charAt(0).toUpperCase();
}

/* ════════════════════════════════════════════════════
   SESSÃO PERSISTENTE
════════════════════════════════════════════════════ */
function _salvarSessao() {
  const state = BetaState.get();
  if (!state || state.phase === "result") { LS.remove(SK.SESSION); return; }
  LS.set(SK.SESSION, {
    sector: state.sector, companyName: state.companyName,
    currentRound: state.currentRound, totalRounds: state.totalRounds,
    ts: Date.now(),
  });
}

function _verificarSessaoSalva() {
  const sess   = LS.get(SK.SESSION);
  const banner = document.getElementById("session-restore-banner");
  const texto  = document.getElementById("session-restore-text");
  if (sess && banner && texto) {
    const mins  = Math.round((Date.now() - sess.ts) / 60000);
    const tempo = mins < 60 ? `${mins} min atrás` : `${Math.round(mins/60)}h atrás`;
    texto.textContent = `Jogo em andamento: ${sess.companyName} (${sess.sector}) — Rodada ${sess.currentRound + 1}/${sess.totalRounds} · salvo ${tempo}`;
    banner.style.display = "";
  } else if (banner) {
    banner.style.display = "none";
  }
}

function restaurarSessao() {
  const sess = LS.get(SK.SESSION);
  if (!sess) return;
  // BUG #12 FIX: verificar se há estado completo salvo
  const estadoCompleto = LS.get('gsp_session_state');
  if (estadoCompleto && estadoCompleto.sector === sess.sector) {
    // Restaurar estado real: setor, rodada e companyName corretos
    iniciar(sess.sector, _player?.nome || "Jogador", sess.companyName);
    // Notificar jogador que começa da rodada onde parou (próxima melhoria: restaurar state completo)
    setTimeout(() => mostrarSucesso(`Sessão restaurada: ${sess.companyName} · Rodada ${sess.currentRound + 1}`), 500);
  } else {
    // Fallback: iniciar do começo, mas avisar jogador
    iniciar(sess.sector, _player?.nome || "Jogador", sess.companyName);
    setTimeout(() => mostrarAviso('Sessão reiniciada do início. Progresso anterior não recuperável.'), 500);
  }
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
  const entrada  = {
    player: _player?.nome || 'Convidado',
    score, scoreGestor, sector, companyName, ts: Date.now(),
    uid: _player?.uid || null,
  };

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
  // Limpar estado anterior de seleção
  document.querySelectorAll(".sector-card").forEach(b => b.classList.remove("selected"));
  const sh = document.getElementById("sector-hidden");
  const cn = document.getElementById("companyName");
  if (sh) sh.value = "";
  if (cn) cn.value = "";
  mostrarTela("screen-sector");
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
  // Tema só é aplicado quando o jogo começa
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
}

// ─── POLLING UNIVERSAL ─────────────────────────────────────────
// Roda sempre que o usuário está logado (home, jogo, perfil, etc.)
// Verifica: ban + manutenção + mensagem global — a cada 20 segundos

function _iniciarPollingGlobal(uid) {
  _pararPollingGlobal(); // limpa qualquer poll anterior
  if (!window.ADMIN || !uid) return;

  const _tick = async () => {
    try {
      // 1. Verifica ban (admin nunca é banido)
      if (!_isAdmin) {
        const banido = await window.ADMIN.verificarBan(uid);
        if (banido) {
          _forcarSaida('🚫 Sua conta foi suspensa pelo administrador.');
          return;
        }
      }

      // 2. Verifica manutenção + mensagem global
      const cfg = await window.ADMIN.verificarMensagemGlobal();

      if (cfg.manutencao && !_isAdmin) {
        _forcarSaida('🔧 Jogo em manutenção. Você será desconectado.');
        return;
      }

      // 3. Mensagem global — mostra só se mudou desde a última vez
      if (cfg.mensagem && cfg.mensagem !== _ultimaMensagemGlobal) {
        _ultimaMensagemGlobal = cfg.mensagem;
        mostrarSucesso(cfg.mensagem);
      }
    } catch(e) { /* ignora erros de rede temporários */ }
  };

  _tick(); // executa imediatamente no login
  _globalPollInterval = setInterval(_tick, 20000);
}

function _pararPollingGlobal() {
  if (_globalPollInterval) { clearInterval(_globalPollInterval); _globalPollInterval = null; }
  if (_manutencaoInterval) { clearInterval(_manutencaoInterval); _manutencaoInterval = null; }
}

function _forcarSaida(msg) {
  _pararPollingGlobal();
  _pararTimer();
  LS.remove(SK.SESSION);
  LS.remove(SK.PLAYER);
  _player = null;
  _isAdmin = false;
  _aplicarTemaSetor(null);
  if (window.GSPAuth?.isReady()) window.GSPAuth.logout().catch(() => {});
  mostrarTela('screen-login');
  setTimeout(() => mostrarAviso(msg), 600);
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
  tecnologia:{ financeiro:11,clima:11,satisfacao:12,qualidade:11,produtividade:10,reputacao:10,inovacao:9,seguranca:10 },
};

function _bench(sector, key) { return BENCHMARKS[sector]?.[key] ?? null; }

/* ════════════════════════════════════════════════════
   SIDEBAR — INDICADORES + GESTOR
════════════════════════════════════════════════════ */
function renderSidebar(state, empresa) {
  try {
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
    const faseLabel = { fundacao:"Diagnóstico",crescimento:"Crescimento",
                        crise:"⚠ Crise",consolidacao:"Consolidação",expansao:"Expansão" };
    const fase = state.storyState?.faseEmpresa;
    roundBadge.textContent = `Rod. ${state.currentRound+1}/${state.totalRounds} · ${faseLabel[fase]||""}`;
  }
  const grid = document.getElementById("game-indicators-grid");
  if (grid) {
    // Detectar indicadores críticos para toast
    const newlyCritical = [];
    grid.innerHTML = Object.entries(state.indicators).map(([k, v]) => {
      const pct      = (v / 20) * 100;
      const cor      = BetaIndicadores.corNivel(v);
      const label    = BetaIndicadores.LABELS[k] || k;
      const b        = _bench(state.sector, k);
      const benchHtml = b ? `<span class="game-ind-bench">Méd: ${b}</span>` : "";

      // Seta de tendência vs rodada anterior
      const prev = _prevIndicators[k];
      let trendHtml = "";
      if (prev !== undefined) {
        const diff = v - prev;
        if      (diff >  0) trendHtml = `<span class="game-ind-trend up">▲${diff}</span>`;
        else if (diff <  0) trendHtml = `<span class="game-ind-trend down">▼${Math.abs(diff)}</span>`;
        else                trendHtml = `<span class="game-ind-trend flat">—</span>`;
      }

      // Classe crítico se valor <= 3
      const isCritical = v <= 3;
      if (isCritical && (prev === undefined || prev > 3)) newlyCritical.push(label);
      const rowClass = isCritical ? ' critical' : '';
      const nameClass = isCritical ? ' critical-label' : '';

      // Label already contains emoji prefix (e.g. "💰 Financeiro")
      // Split into icon + name for better layout
      const labelParts = label.split(" ");
      const indIcon = labelParts[0];
      const indName = labelParts.slice(1).join(" ");
      const benchVal = b ? `<span>Méd: ${b}</span><span style="color:${cor};font-weight:700">${v}/20</span>` : `<span style="color:${cor};font-weight:600">${v}/20</span>`;
      return `<div class="game-ind-row${rowClass}" style="--ind-cor:${cor}" onclick="BetaUI.abrirTooltipIndicador('${k}')">
        <div class="game-ind-top">
          <span class="game-ind-name${nameClass}"><span style="margin-right:4px;font-size:.8rem">${indIcon}</span>${indName}</span>
          <div style="display:flex;align-items:center;gap:3px">${trendHtml}<span class="game-ind-val" style="color:${cor}">${v}</span></div>
        </div>
        <div class="game-ind-track"><div class="game-ind-bar" style="width:${pct}%;background:${cor}"></div></div>
        <div class="game-ind-bench">${benchVal}</div>
      </div>`;
    }).join("");

    // Salvar indicadores atuais para próxima comparação
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
function renderRodada(state) {
  _escolhaFeita = false;
  _bloqueioAte  = Date.now() + 350; // bloqueia toques fantasma pós-transição
  const round = state.gameRounds[state.currentRound];
  if (!round) return;

  const faseLabel = { fundacao:"Diagnóstico",crescimento:"Crescimento",
                      crise:"⚠ Crise",consolidacao:"Consolidação",expansao:"Expansão" };
  const fase = state.storyState?.faseEmpresa;
  document.getElementById("hist-round-badge").textContent =
    `Rodada ${state.currentRound+1} · ${faseLabel[fase]||""}`;
  document.getElementById("hist-round-title").textContent = round.title || "";
  document.getElementById("hist-round-desc").textContent  = _enriquecerDescricao(round.description||"", state);

  // Evento ativo
  const ev     = state.activeEvents?.find(e => e.expiresAt >= state.currentRound);
  const banner = document.getElementById("hist-event-banner");
  const evTxt  = document.getElementById("hist-event-text");
  if (ev && banner && evTxt) { banner.classList.add("visible"); evTxt.textContent = `${ev.titulo} — ${ev.descricao}`; }
  else if (banner) banner.classList.remove("visible");

  // Choices
  const choices = state.choicesAtivas || round.choices;
  const lista   = document.getElementById("choices-list");
  lista.innerHTML = choices.map((c, i) => {
    const letra = String.fromCharCode(65+i);
    const risco = c.risco ? `<span class="choice-risk risk-${c.risco}">${c.risco.toUpperCase()}</span>` : "";
    return `<button class="choice-card" onclick="BetaUI.escolher(${i})" id="choice-btn-${i}">
      <span class="choice-letter">${letra}</span>
      <span class="choice-text">${c.text}</span>
      ${risco}
    </button>`;
  }).join("");

  // Histórico + recomendações
  _renderHistoricoTab(state);

  // Timer
  _iniciarTimer();

  // Sempre começa na aba HISTÓRIA
  mudarTab("historia");
  mostrarTela("screen-game");
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

  // Pequena pausa para a animação ser vista antes de processar
  setTimeout(() => processarEscolha(idx), 180);
}

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
    if (_timerSegs <= 0) { _pararTimer(); if (!_escolhaFeita) escolher(0); }
  }, 1000);
}

function _pararTimer() {
  clearInterval(_timerInterval); _timerInterval = null;
  const el = document.getElementById("timer-display");
  if (el) { el.classList.remove("active","danger"); el.textContent = ""; }
}

/* ════════════════════════════════════════════════════
   FEEDBACK
════════════════════════════════════════════════════ */
function mostrarFeedback(data, callback) {
  _feedbackCallback = callback;
  mostrarTela("screen-feedback");
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
  if (grid) grid.innerHTML = Object.entries(data.efeitos||{}).filter(([,v])=>v!==0).map(([k,v])=>{
    const cor=v>0?"var(--good)":"var(--danger)"; const nome=BetaIndicadores.LABELS[k]||k;
    return `<div class="fb-chip"><span class="fb-chip-val" style="color:${cor}">${v>0?"+":""}${v}</span><span class="fb-chip-nome">${nome}</span></div>`;
  }).join("")||`<span style="font-size:.8rem;color:var(--text-muted)">Sem impacto direto.</span>`;
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
      if (efEl) efEl.innerHTML = Object.entries(melhor.effects||{}).filter(([,v])=>v!==0).map(([k,v])=>{
        const cor=v>0?"var(--good)":"var(--danger)"; const nome=BetaIndicadores.LABELS[k]||k;
        return `<div class="fb-chip"><span class="fb-chip-val" style="color:${cor};font-size:.8rem">${v>0?"+":""}${v}</span><span class="fb-chip-nome">${nome}</span></div>`;
      }).join("");
    } else { altEl.style.display="none"; }
  }
  // Gestor
  const gestorEl=document.getElementById("fb-gestor"), gestorGrid=document.getElementById("fb-gestor-grid");
  if (gestorEl && gestorGrid) {
    const eg=data.efeitosGestor||{}, temEfeito=Object.values(eg).some(v=>v!==0);
    if (temEfeito) {
      gestorEl.style.display="";
      const labels={reputacaoInterna:"🧑 Reputação",capitalPolitico:"🏛 Cap. Político",esgotamento:"🔋 Esgotamento"};
      gestorGrid.innerHTML=Object.entries(eg).filter(([,v])=>v!==0).map(([k,v])=>{
        const ruim=k==="esgotamento"?v>0:v<0; const cor=ruim?"var(--danger)":"var(--purple)";
        return `<div class="fb-chip"><span class="fb-chip-val" style="color:${cor}">${v>0?"+":""}${v}</span><span class="fb-chip-nome">${labels[k]||k}</span></div>`;
      }).join("");
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
  cb();
}

/* ════════════════════════════════════════════════════
   RESULTADO FINAL
════════════════════════════════════════════════════ */
function renderResultado({ motivo, score, scoreGestor, gestor, indicators,
                           history, companyName, empresa, sector, epilogo, decisoesCruciais }) {
  mostrarTela("screen-result");
  _registrarResultado(score, scoreGestor, sector, companyName);
  const titulos={fim:score>=70?"Mandato Concluído com Êxito":score>=45?"Mandato Concluído":"Mandato com Dificuldades",gameover:"Colapso Operacional",mandato_conselho:"Encerrado pelo Conselho",mandato_burnout:"Afastamento por Burnout"};
  const subs={fim:"Você completou as 15 rodadas. Veja o balanço do seu mandato.",gameover:"Um indicador zerou. A empresa entrou em colapso.",mandato_conselho:"Seu capital político se esgotou e o conselho encerrou seu mandato.",mandato_burnout:"O esgotamento chegou ao limite e você precisou se afastar."};
  const motivoLabels = {fim:"Relatório Final",gameover:"Colapso Operacional",
    mandato_conselho:"Mandato Encerrado pelo Conselho",mandato_burnout:"Afastamento por Burnout"};
  document.getElementById("result-motivo-label").textContent = motivoLabels[motivo] || motivo.replace(/_/g," ").toUpperCase();
  document.getElementById("result-title").textContent    = titulos[motivo]||"Mandato Encerrado";
  document.getElementById("result-subtitle").textContent = subs[motivo]||"";
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
        <div class="crucial-escolha">"${d.escolha}"</div>
        <div style="margin:6px 0">${efeitos}</div>
        ${d.ensinamento?`<div style="font-size:.75rem;color:var(--text-muted);line-height:1.4;font-style:italic">${d.ensinamento}</div>`:""}
      </div>`;
    }).join("");
  } else if (cruciaisSec) { cruciaisSec.style.display="none"; }
}

/* ════════════════════════════════════════════════════
   GLOSSÁRIO
════════════════════════════════════════════════════ */
const GLOSSARIO_TERMOS = [
  /* ── Indicadores e Mecânicas do Jogo ── */
  { termo:"SLA", def:"Acordo de Nível de Serviço (Service Level Agreement). Define metas de prazo e qualidade entre fornecedor e cliente. Ex: entregar 95% dos pedidos em até 48h." },
  { termo:"NPS", def:"Nota de lealdade dos clientes (Net Promoter Score). Calculado pela pergunta: 'De 0 a 10, quanto você recomendaria esta empresa?' Acima de 70 é excelente." },
  { termo:"Benchmark", def:"Referência média do mercado para um indicador. Exibido abaixo das barras durante o jogo — serve para comparar seu desempenho com o do setor." },
  { termo:"Capital Político", def:"Credibilidade do gestor junto ao conselho e parceiros estratégicos. Cai com decisões precipitadas ou resultados ruins. Sobe com alinhamento e entregas consistentes." },
  { termo:"Esgotamento", def:"Nível de desgaste pessoal do gestor. Ao atingir 10, é necessário se afastar por colapso e o mandato é encerrado antecipadamente." },
  { termo:"Flag", def:"Padrão de comportamento registrado ao longo do mandato. Influencia quais eventos aparecem e o desfecho final. Ex: Liderança Tóxica, Crescimento sem Caixa." },
  { termo:"Imprevisto", def:"Evento inesperado que altera os efeitos das decisões durante aquela rodada. Pode ser positivo ou negativo, e é influenciado pelo estado atual dos indicadores." },
  { termo:"Margem Operacional", def:"Quanto de cada real de receita sobra como lucro operacional. Ex: margem de 8% significa que a empresa lucra R$8 para cada R$100 vendidos." },
  { termo:"Mandato", def:"Uma partida completa do jogo, com 15 rodadas de decisões. O gestor conduz a empresa do início ao fim e recebe uma pontuação pelo resultado." },

  /* ── Finanças e Investimento ── */
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

  /* ── Tecnologia e Produto ── */
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

  /* ── Operações e Logística ── */
  { termo:"Lead Time", def:"Tempo total desde o pedido até a entrega ao cliente. Reduzir o lead time é um dos principais objetivos da gestão de operações." },
  { termo:"Kanban", def:"Sistema de produção puxada. Produz apenas o que foi vendido ou consumido, reduzindo estoque intermediário e tempo de entrega." },
  { termo:"Lean Manufacturing", def:"Manufatura enxuta. Filosofia que elimina desperdícios no processo produtivo — tempo ocioso, estoque excessivo, defeitos, movimentação desnecessária." },
  { termo:"Cold Chain", def:"Cadeia do frio. Transporte e armazenagem de produtos que precisam de temperatura controlada, como alimentos perecíveis e medicamentos." },
  { termo:"White Label", def:"Produto fabricado por uma empresa e vendido por outra com a sua própria marca. Ex: supermercado que vende arroz com a marca própria fabricado por terceiro." },
  { termo:"Dark Store", def:"Loja física convertida em mini-centro de distribuição para e-commerce, sem atendimento presencial. Foco em separação e envio rápido de pedidos." },
  { termo:"Click-and-Collect", def:"Modelo onde o cliente compra online e retira na loja física. Elimina o custo de frete e gera tráfego para o ponto físico." },
  { termo:"SKU", def:"Código único de produto (Stock Keeping Unit). Cada variação de produto (tamanho, cor, sabor) tem um SKU diferente para controle de estoque." },
  { termo:"Omnichannel", def:"Estratégia que integra todos os canais de venda e atendimento (loja física, site, app, telefone) em uma experiência única para o cliente." },

  /* ── RH e Gestão de Pessoas ── */
  { termo:"Burnout", def:"Síndrome de esgotamento profissional causada por estresse crônico no trabalho. Pode levar ao afastamento. No jogo, representa colapso do gestor." },
  { termo:"Onboarding", def:"Processo de integração de um novo colaborador ou cliente. Inclui treinamentos, apresentações e adaptação à cultura e ferramentas da empresa." },
  { termo:"Rotatividade (Turnover)", def:"Percentual de funcionários que saem e precisam ser substituídos no ano. Alta rotatividade sinaliza problemas de gestão, cultura ou remuneração." },

  /* ── Regulatório e Jurídico ── */
  { termo:"LGPD", def:"Lei Geral de Proteção de Dados. Regula o uso de dados pessoais no Brasil. Multas podem chegar a 2% do faturamento ou R$50 milhões por infração." },
  { termo:"ANPD", def:"Autoridade Nacional de Proteção de Dados. Órgão do governo que fiscaliza o cumprimento da LGPD e aplica penalidades em caso de violação." },
  { termo:"ISO 9001", def:"Norma internacional de gestão da qualidade. Certifica que a empresa tem processos controlados e rastreáveis. Exigida por grandes clientes industriais." },
  { termo:"ESG", def:"Critérios ambientais, sociais e de governança (Environmental, Social, Governance). Avaliados por investidores e clientes para decidir com quem fazer negócio." },
  { termo:"IFA", def:"Índice de Frequência de Acidentes. Mede o número de acidentes com afastamento por milhão de horas trabalhadas. Benchmark nacional: 8,2." },
  { termo:"EPI", def:"Equipamento de Proteção Individual. Capacete, luva, óculos, bota e outros itens obrigatórios por lei para proteção do trabalhador." },
  { termo:"CIPA", def:"Comissão Interna de Prevenção de Acidentes. Grupo de funcionários e gestores que acompanha as condições de segurança. Obrigatória em empresas com 20+ funcionários." },
  { termo:"CAT", def:"Comunicação de Acidente de Trabalho. Documento obrigatório emitido pelo empregador quando um funcionário sofre acidente ou doença ocupacional." },
  { termo:"MTE", def:"Ministério do Trabalho e Emprego. Órgão federal que fiscaliza as condições de trabalho, pode autuar empresas e interditar operações inseguras." },

  /* ── Mercado e Estratégia ── */
  { termo:"B2B", def:"Business to Business. Empresa que vende para outras empresas (não para o consumidor final). Ex: software de gestão vendido para PMEs." },
  { termo:"B2C", def:"Business to Consumer. Empresa que vende diretamente ao consumidor final. Ex: loja de varejo, aplicativo de delivery." },
  { termo:"PME", def:"Pequena e Média Empresa. No Brasil, classificadas por faturamento anual: pequena até R$4,8M, média até R$300M." },
  { termo:"Pipeline Comercial", def:"Conjunto de oportunidades de venda em andamento. 'Pipeline cheio' significa muitos negócios potenciais sendo negociados." },
  { termo:"Indústria 4.0", def:"Quarta revolução industrial. Integração de automação, robótica, IoT e inteligência artificial nos processos industriais para maior eficiência e rastreabilidade." },
  { termo:"Verticalização", def:"Estratégia de especializar a empresa em um setor ou nicho específico, ao invés de atender mercados variados. Cria diferencial técnico e relacionamentos mais profundos." },
  { termo:"Interdependência", def:"Relação causal entre indicadores. Ex: na logística, frota deteriorada → segurança cai → RH cai → resultado financeiro cai." },
];


function openGlossary() {
  const el=document.getElementById("overlay-glossary"), content=document.getElementById("glossary-content");
  _abrirOverlay('overlay-glossary');
  if (content) content.innerHTML=GLOSSARIO_TERMOS.map(g=>
    `<div class="glossary-term"><div class="glossary-term-word">${g.termo}</div><div class="glossary-term-def">${g.def}</div></div>`
  ).join("");
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
function toggleTimerSetting() { _settings.timer=!_settings.timer; LS.set(SK.SETTINGS,_settings); _atualizarToggleTimer(); }
function toggleCloudStatus() {
  _settings.cloudStatus = !_settings.cloudStatus;
  LS.set(SK.SETTINGS, _settings);
  const btn = document.getElementById('toggle-cloud-btn');
  if (btn) { btn.textContent = _settings.cloudStatus ? 'ON' : 'OFF'; btn.className = `toggle-btn ${_settings.cloudStatus ? 'on' : 'off'}`; }
}
function _atualizarToggleTimer() {
  const btn=document.getElementById("toggle-timer-btn"); if(!btn) return;
  btn.textContent=_settings.timer?"ON":"OFF"; btn.className=`toggle-btn ${_settings.timer?"on":"off"}`;
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
  const btn = document.getElementById("settings-fs-btn");
  if (!btn) return;
  const isFs = !!document.fullscreenElement;
  btn.textContent = isFs ? "✕ Sair" : "⛶ Ativar";
}
document.addEventListener("fullscreenchange", _atualizarBotaoFullscreen);

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
  localStorage.setItem('gsp_tutorial_done', '1');
  _verificarSessaoSalva();
  _atualizarHome();
  mostrarTela('screen-home');
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
  const playerSalvo = LS.get(SK.PLAYER);
  if (playerSalvo) _player = playerSalvo;
  const isGuest = _player?.tipo === "guest" || !_player?.uid;

  // Renderiza IMEDIATAMENTE com dados locais
  const hist = LS.get(isGuest ? SK.HIST_GUEST : SK.HISTORICO) || [];
  const nome = _player?.nome || 'Jogador';

  // Avatar
  const av = document.getElementById('perfil-avatar');
  if (av) av.textContent = nome.charAt(0).toUpperCase();
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
  if (_settings.timer && !_escolhaFeita && _timerSegs <= 0) { escolher(0); return; }
  if (_settings.timer && !_escolhaFeita && _timerSegs > 0) {
    const el = document.getElementById('timer-display');
    if (el) { el.classList.add('active'); if (_timerSegs <= 10) el.classList.add('danger'); }
    _timerInterval = setInterval(() => {
      _timerSegs--;
      if (el) el.textContent = `⏱ ${_timerSegs}s`;
      if (_timerSegs <= 10 && el) el.classList.add('danger');
      if (_timerSegs <= 0) { _pararTimer(); if (!_escolhaFeita) escolher(0); }
    }, 1000);
  }
}

function abandonarJogo() {
  _jogoPausado = false;
  const overlay = document.getElementById('overlay-pause');
  _fecharOverlay('overlay-pause');
  _pararTimer();
  _pararVerificacaoManutencao();
  LS.remove(SK.SESSION);
  _aplicarTemaSetor(null);
  mostrarTela('screen-home');
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
  // ── Tecnologia ──
  clima: {
    titulo: '🧑‍💻 Clima Organizacional',
    desc: 'Bem-estar e satisfação dos colaboradores de tecnologia. Essencial para atrair e reter talentos.',
    consequence: '⚠ Clima ruim aumenta turnover em cargos técnicos críticos.',
  },
  satisfacao: {
    titulo: '⭐ Satisfação do Cliente',
    desc: 'Nível de satisfação dos usuários com os produtos e serviços digitais.',
    consequence: '⚠ Insatisfação leva ao churn e prejudica o crescimento.',
  },
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
registrarUI({ mostrarTela, mostrarIntro, renderSidebar, renderRodada, mostrarFeedback, renderResultado: renderResultadoAnimado });


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
  if (inp.type === "password") { inp.type = "text"; btn.textContent = "🙈"; }
  else { inp.type = "password"; btn.textContent = "👁"; }
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
    _loginOk({ nome, email, tipo: "user" });
    return;
  }
  _authSetLoading("login", true);
  try {
    const player = await window.GSPAuth.login({ email, senha });
    _loginOk(player);
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
    _loginOk({ nome, email, tipo: "user" });
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
  LS.set(SK.PLAYER, _player);

  // Verifica se é admin antes de qualquer outra coisa
  await _atualizarBotaoAdmin(player.uid);

  // Verifica manutenção — admin bypassa, usuários comuns são bloqueados
  if (!_isAdmin && window.ADMIN) {
    const cfg = await window.ADMIN.verificarMensagemGlobal().catch(()=>null);
    if (cfg?.manutencao) {
      mostrarTela('screen-login');
      setTimeout(() => mostrarAviso('🔧 Jogo em manutenção. Volte em breve!'), 500);
      return;
    }
    if (cfg?.mensagem) {
      window._mensagemGlobal = cfg.mensagem;
    }
  }

  // Inicia o polling universal (ban + manutenção + mensagem global)
  _iniciarPollingGlobal(player.uid);

  // Entra no painel imediatamente — sem esperar Firestore
  _verificarSessaoSalva();
  _atualizarHome();
  mostrarTela("screen-home");

  // Sincroniza dados em background (não bloqueia a UI)
  _sincronizarFirebaseBackground(player);
}


/* ════════════════════════════════════════════════════
   PAINEL ADMIN
════════════════════════════════════════════════════ */

async function _atualizarBotaoAdmin(uid) {
  if (!uid) return;
  try {
    _isAdmin = await window.ADMIN?.verificarAdmin(uid) || false;
  } catch(e) {
    _isAdmin = false;
  }
  _mostrarBotaoAdmin();
}

function _mostrarBotaoAdmin() {
  const btn = document.getElementById('btn-admin-home');
  if (btn) btn.style.display = _isAdmin ? 'inline-flex' : 'none';
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
  const isAdmin = await window.ADMIN?.verificarAdmin(_player.uid);
  if (isAdmin) {
    mostrarTela('screen-admin');
    window.ADMIN.irParaSecao('visao-geral');
  }
}

window.BetaUI = {
  irParaLogin, irParaAuth, irComoConvidado, confirmarNome, sair,
  authMudarAba, authTogglePass, authLogin, authCadastrar, authGoogle, authRecuperar,
  irParaSetores, irParaPodio, irParaHistoricoJogos,
  irParaPerfil, filtrarPodio, _copiarId,
  restaurarSessao, descartarSessao,
  selecionarSetor, lancarJogo, comecaJogo,
  mudarTab, escolher, avancar, reiniciar,
  openGlossary, closeGlossary, openSettings, closeSettings, toggleTimerSetting, toggleCloudStatus,
  toggleFullscreen, voltar,
  // Novos
  pularTutorial, tutorialStep, irParaSlide,
  pausarJogo, continuarJogo, abandonarJogo,
  abrirTooltipIndicador, closeTooltip,
  toggleModoTreino,
  compartilharResultado,
  irParaAdmin,
};

// Inicializa o jogo — funciona tanto se DOM já carregou quanto se ainda está carregando
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _boot);
  } else {
    _boot();
  }
})();
