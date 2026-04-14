/* ═══════════════════════════════════════════════════════════════
   UNDER PRESSURE — SALA MODE v2.0
   Substitui as seções de sala em mainBeta.js
   Inserir antes do fechamento do bundle ou como script separado.
═══════════════════════════════════════════════════════════════ */

const SalaMode = (() => {
'use strict';

/* ═══════════════════════════════════════════
   CONSTANTES
═══════════════════════════════════════════ */
const PAPEIS = {
  CEO:  { id:'CEO',  emoji:'👔', nome:'CEO — Diretor Executivo', cor:'#f39c12',
          desc:'Seu voto tem peso de desempate. 1 veto disponível por jogo.',
          insight: null },
  CFO:  { id:'CFO',  emoji:'💰', nome:'CFO — Diretor Financeiro', cor:'#2ecc71',
          desc:'Você antecipa tendências no indicador Financeiro.',
          insight: 'financeiro' },
  COO:  { id:'COO',  emoji:'⚙️', nome:'COO — Diretor de Operações', cor:'#3498db',
          desc:'Você antecipa tendências em Processos / Produtividade.',
          insight: 'processos' },
  CMO:  { id:'CMO',  emoji:'⭐', nome:'CMO — Diretor de Marketing', cor:'#e91e63',
          desc:'Você antecipa tendências em Clientes / Satisfação.',
          insight: 'clientes' },
  CTO:  { id:'CTO',  emoji:'🖥️', nome:'CTO — Diretor de Tecnologia', cor:'#9b59b6',
          desc:'Você antecipa tendências em Inovação / Tecnologia.',
          insight: 'inovacao' },
  CISO: { id:'CISO', emoji:'🦺', nome:'CISO — Diretor de Segurança', cor:'#e74c3c',
          desc:'Você antecipa tendências em Segurança Operacional.',
          insight: 'seguranca' },
};
const PAPEIS_LIST = Object.keys(PAPEIS);

const SINAIS = [
  { id:'risco',    emoji:'🔴', texto:'Risco alto!' },
  { id:'seguro',   emoji:'🛡️', texto:'Jogar seguro' },
  { id:'arriscar', emoji:'🚀', texto:'Arriscar!' },
  { id:'financas', emoji:'💰', texto:'Foco financeiro' },
  { id:'duvida',   emoji:'❓', texto:'Tenho dúvidas' },
  { id:'sei',      emoji:'✅', texto:'Sei o que fazer' },
];

const CONFIANCA = [
  { id:'conservador', emoji:'🛡️', label:'Conservador' },
  { id:'moderado',    emoji:'⚖️', label:'Moderado'    },
  { id:'arrojado',    emoji:'🚀', label:'Arrojado'    },
];

// Duração em segundos de cada fase
const DURACAO = {
  alerta:      4,
  deliberacao: 20,
  votacao:     30,
  revelacao:   5,
  impacto:     4,
  placar:      4,
};

const FASES_SEQUENCIA = ['alerta','deliberacao','votacao','revelacao','impacto','placar'];

const CORES_GRUPO = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c','#3498db','#9b59b6','#e91e63'];

/* ═══════════════════════════════════════════
   ESTADO INTERNO
═══════════════════════════════════════════ */
let _sala           = null; // sala ativa
let _grupoAtual     = null; // grupo do jogador
let _papelMeu       = null; // papel executivo do jogador
let _papeis         = {};   // { uid: idPapel }
let _partidaId      = null;
let _partidaEstado  = null;
let _faseAtual      = 'lobby';
let _pollingInt     = null;
let _heartbeatInt   = null;
let _timerInt       = null;
let _timerInicio    = null;
let _timerDuracao   = 0;
let _meuSinal       = null;
let _meuVoto        = null;  // { letra, confianca }
let _vetoUsado      = false;
let _betaState      = null;  // cópia local do BetaState para o grupo
let _indsAnteriores = null;  // snapshot dos indicadores antes do impacto
let _corSelecionada = CORES_GRUPO[0];
let _scoreAnterior  = 0;    // para calcular tendência no placar

/* ═══════════════════════════════════════════
   HELPERS GLOBAIS
═══════════════════════════════════════════ */
function _getPlayer() { return window._player || null; }
function _GSP() { return window.GSPSalas || null; }
function _mostrarAviso(m) { if (typeof mostrarAviso === 'function') mostrarAviso(m); else alert(m); }
function _mostrarSucesso(m) { if (typeof mostrarSucesso === 'function') mostrarSucesso(m); }
function _mostrarTela(id) { if (typeof mostrarTela === 'function') mostrarTela(id); }
function _LS_get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch(e) { return null; } }
function _LS_set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} }
function _LS_rm(k) { try { localStorage.removeItem(k); } catch(e) {} }

function _setStatus(elId, msg, tipo) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = msg;
  el.className = 'ns-status ns-status--' + (tipo || 'info');
  el.style.display = msg ? 'block' : 'none';
}

function _corNivel(v) {
  if (v <= 4) return 'var(--danger)';
  if (v <= 7) return 'var(--warn,#e67e22)';
  return 'var(--good)';
}

function _calcScore(state) {
  if (!state?.indicators) return 0;
  const vals = Object.values(state.indicators);
  const media = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round((media / 20) * 100);
}

function _svgTimerCircum() { return Math.PI * 2 * 18; } // r=18 → C=113.1

/* ═══════════════════════════════════════════
   RESTAURAR DO LOCALSTORAGE
═══════════════════════════════════════════ */
function restaurar() {
  const sala  = _LS_get('gsp_sala');
  const grupo = _LS_get('gsp_sala_grupo');
  if (sala)  { _sala = sala; _atualizarBadge(); }
  if (grupo) { _grupoAtual = grupo; _atualizarBadge(); }
}

/* ═══════════════════════════════════════════
   BADGE NA HOME
═══════════════════════════════════════════ */
function _atualizarBadge() {
  const badge = document.getElementById('home-sala-badge');
  if (!badge) return;
  if (_sala && _grupoAtual) {
    badge.textContent = '🏟️ ' + (_sala.nome || _sala.codigo) + ' · 👥 ' + _grupoAtual.nomeGrupo;
    badge.style.display = 'inline-flex';
  } else if (_sala) {
    badge.textContent = '🏟️ ' + (_sala.nome || _sala.codigo);
    badge.style.display = 'inline-flex';
  } else {
    badge.style.display = 'none';
  }
}

/* ════════════════════════════════════════
   MODAL DE ENTRADA NA SALA
════════════════════════════════════════ */
function abrirModal() {
  const modal = document.getElementById('modal-sala');
  if (!modal) return;
  modal.style.display = 'flex';
  _setStatus('ns-sala-status', '', 'info');
  const inp = document.getElementById('ns-sala-input');
  if (inp) { inp.value = ''; inp.focus(); }

  const atualDiv = document.getElementById('ns-sala-atual');
  if (atualDiv) {
    if (_sala) {
      atualDiv.innerHTML = `<span>Sala atual: <strong>${_sala.codigo}</strong> — ${_sala.nome || ''}</span>
        <button class="ns-sala-sair-btn" onclick="SalaMode.sair()">Sair</button>`;
      atualDiv.style.display = 'flex';
    } else {
      atualDiv.style.display = 'none';
    }
  }

  const player = _getPlayer();
  const isAdmin = typeof _isAdmin !== 'undefined' && _isAdmin;
  const isAnf   = _sala && (_sala.criadaPor === player?.uid || isAdmin);

  const btnPainel  = document.getElementById('ns-btn-painel');
  const btnGrupos  = document.getElementById('ns-btn-grupos');
  if (btnPainel) btnPainel.style.display = isAnf ? 'block' : 'none';
  if (btnGrupos) btnGrupos.style.display = _sala ? 'block' : 'none';
}

function fecharModal() {
  const modal = document.getElementById('modal-sala');
  if (modal) modal.style.display = 'none';
}

async function entrar() {
  const inp = document.getElementById('ns-sala-input');
  const codigo = (inp?.value || '').trim().toUpperCase();
  if (!codigo) { _setStatus('ns-sala-status', 'Digite o código da sala.', 'erro'); return; }

  const player = _getPlayer();
  if (!player?.uid) { _setStatus('ns-sala-status', 'Você precisa estar logado.', 'erro'); return; }

  const btn = document.getElementById('ns-btn-entrar');
  if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }

  try {
    const gsp = _GSP();
    if (!gsp) throw new Error('Sistema de salas indisponível.');
    const sala = await gsp.carregarSala(codigo);
    await gsp.entrarSala(codigo, { uid: player.uid, nome: player.nome });
    _sala = sala;
    _LS_set('gsp_sala', sala);
    _atualizarBadge();
    fecharModal();
    _mostrarSucesso('✅ Você entrou na sala ' + sala.codigo + '!');
    irGrupos();
  } catch(e) {
    const msgs = {
      'sala_nao_encontrada': 'Sala não encontrada. Verifique o código.',
      'sala_inativa':        'Esta sala está encerrada.',
    };
    _setStatus('ns-sala-status', msgs[e.message] || 'Erro: ' + (e.message || 'desconhecido'), 'erro');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
  }
}

function sair() {
  _sala        = null;
  _grupoAtual  = null;
  _papelMeu    = null;
  _LS_rm('gsp_sala');
  _LS_rm('gsp_sala_grupo');
  _atualizarBadge();
  fecharModal();
  _mostrarSucesso('Você saiu da sala.');
}

/* ════════════════════════════════════════
   SCREEN GRUPOS (WAR ROOM)
════════════════════════════════════════ */
async function irGrupos() {
  if (!_sala) { _mostrarAviso('Você não está em nenhuma sala.'); return; }
  _mostrarTela('screen-grupos');
  const nomEl = document.getElementById('ns-grupos-sala-nome');
  if (nomEl) nomEl.textContent = _sala.nome || _sala.codigo;
  await Promise.all([
    _carregarGrupos(),
    _renderPainelAnf(),
    _carregarPlayersOnline(),
  ]);
}

async function recarregarGrupos() {
  await Promise.all([_carregarGrupos(), _renderPainelAnf(), _carregarPlayersOnline()]);
}

async function _carregarPlayersOnline() {
  const bar = document.getElementById('ns-players-bar');
  const chips = document.getElementById('ns-players-chips');
  if (!bar || !chips) return;
  try {
    const gsp = _GSP();
    if (!gsp?.carregarMembrosSala) { bar.style.display = 'none'; return; }
    const membros = await gsp.carregarMembrosSala(_sala.codigo);
    if (!membros?.length) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex';
    const agora = Date.now();
    chips.innerHTML = membros.slice(0, 12).map(m => {
      const online = m.lastSeen && (agora - m.lastSeen) < 30000;
      return `<div class="ns-player-chip">
        <div class="ns-dot" style="background:${online ? 'var(--good)' : 'var(--t3)'}"></div>
        ${m.nome || m.uid?.slice(0,6)}
      </div>`;
    }).join('');
  } catch(e) { bar.style.display = 'none'; }
}

async function _renderPainelAnf() {
  const player  = _getPlayer();
  const isAdmin = typeof _isAdmin !== 'undefined' && _isAdmin;
  const isAnf   = _sala && (_sala.criadaPor === player?.uid || isAdmin);
  const painel  = document.getElementById('ns-painel-anf');
  if (!painel) return;
  painel.style.display = isAnf ? 'block' : 'none';
  if (!isAnf) return;

  try {
    const gsp    = _GSP();
    const sala   = await gsp.carregarSala(_sala.codigo);
    const grupos = await gsp.carregarGrupos(_sala.codigo);
    const concluidos = grupos.filter(g => g.statusCiclo === 'concluido').length;
    const todos = concluidos >= grupos.length && grupos.length > 0;

    _setText('ns-anf-codigo', sala.codigo || _sala.codigo);
    _setText('ns-anf-ciclo',  sala.cicloAtual || 1);
    _setText('ns-anf-grupos', grupos.length + '/' + (sala.limiteGrupos || '∞'));
    _setText('ns-anf-concluidos', concluidos + '/' + grupos.length);

    const btnRev = document.getElementById('ns-anf-btn-revelar');
    if (btnRev) {
      if (sala.podioVisivel) {
        btnRev.disabled = true;
        btnRev.innerHTML = '<span>✅</span><span>Pódio Revelado</span>';
      } else if (todos) {
        btnRev.disabled = false;
        btnRev.innerHTML = '<span>🏆</span><span>Revelar Pódio</span>';
      } else {
        btnRev.disabled = true;
        btnRev.innerHTML = '<span>⏳</span><span>Aguardando grupos</span>';
      }
    }

    const ps = document.getElementById('ns-anf-podio-status');
    if (ps) {
      ps.textContent = sala.podioVisivel
        ? '✅ Pódio visível para todos'
        : todos ? '🏆 Todos terminaram — revele o pódio!'
        : `⏳ ${concluidos}/${grupos.length} grupos concluíram`;
      ps.className = 'ns-anf-podio-status' + (todos && !sala.podioVisivel ? ' ns-anf-podio-status--pronto' : '');
    }
  } catch(e) { console.warn('[Anf]', e.message); }
}

function _setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }

async function _carregarGrupos() {
  const lista = document.getElementById('ns-grupos-lista');
  if (!lista) return;
  lista.innerHTML = '<div class="podio-loading">Carregando grupos...</div>';

  try {
    const gsp    = _GSP();
    const grupos = await gsp.carregarGrupos(_sala.codigo);
    const player = _getPlayer();
    const podeCriar = grupos.length < (_sala.limiteGrupos || 99);

    let html = podeCriar
      ? `<button class="ns-btn-criar" onclick="SalaMode.abrirCriarGrupo()">＋ Criar novo grupo</button>`
      : `<div class="podio-empty">Limite de ${_sala.limiteGrupos} grupos atingido.</div>`;

    if (!grupos.length) {
      html += '<div class="podio-empty" style="margin-top:14px">Nenhum grupo ainda. Crie o primeiro! 🚀</div>';
    } else {
      html += grupos.map(g => _htmlGrupoCard(g, player)).join('');
    }
    lista.innerHTML = html;
  } catch(e) {
    lista.innerHTML = '<div class="podio-empty">Erro ao carregar grupos.</div>';
  }
}

function _htmlGrupoCard(g, player) {
  const count  = g.membros?.length || 0;
  const cheio  = count >= (_sala.maxMembros || 99);
  const emJogo = g.statusCiclo === 'jogando';
  const euEstou= g.membros?.includes(player?.uid);
  const isLider= g.lider === player?.uid;

  const initial = (g.nomeGrupo || '?').charAt(0).toUpperCase();
  const cor = g.cor || 'var(--acc)';

  let badges = '';
  if (euEstou)  badges += `<span class="ns-badge ns-badge--eu">Você</span>`;
  if (isLider)  badges += `<span class="ns-badge ns-badge--lider">👑 Líder</span>`;
  if (emJogo)   badges += `<span class="ns-badge ns-badge--jogo">🎮 Em jogo</span>`;
  else if (cheio) badges += `<span class="ns-badge ns-badge--cheio">Cheio</span>`;
  else          badges += `<span class="ns-badge ns-badge--ok">${count}/${_sala.maxMembros || '∞'} membros</span>`;

  const canEnter  = !euEstou && !cheio && !emJogo;
  const canLobby  = euEstou;
  const cardClass = euEstou ? 'ns-grupo-card ns-grupo-card--meu' : 'ns-grupo-card';

  return `
    <div class="${cardClass}" style="border-left-color:${cor}">
      <div class="ns-grupo-icon" style="background:${cor}22;color:${cor}">${initial}</div>
      <div class="ns-grupo-info">
        <div class="ns-grupo-nome" style="color:${cor}">${g.nomeGrupo}</div>
        <div class="ns-grupo-sub">👑 ${g.liderNome || 'Líder'}</div>
        <div class="ns-grupo-badges">${badges}</div>
      </div>
      <div class="ns-grupo-actions">
        ${canEnter ? `<button class="ns-btn-entrar-grupo" onclick="SalaMode.entrarGrupo('${g.nomeGrupo}')">Entrar</button>` : ''}
        ${canLobby ? `<button class="ns-btn-lobby" onclick="SalaMode.irLobby()">Lobby →</button>` : ''}
      </div>
    </div>`;
}

/* ════════════════════════════════════════
   CRIAR / ENTRAR EM GRUPO
════════════════════════════════════════ */
function abrirCriarGrupo() {
  const modal = document.getElementById('modal-criar-grupo');
  if (!modal) return;
  modal.style.display = 'flex';
  const inp = document.getElementById('ns-grupo-nome');
  if (inp) inp.value = '';
  _setStatus('ns-criar-status', '', 'info');
  _renderCoresGrupo();
}

function fecharCriarGrupo() {
  const modal = document.getElementById('modal-criar-grupo');
  if (modal) modal.style.display = 'none';
}

function _renderCoresGrupo() {
  const wrap = document.getElementById('ns-grupo-cores');
  if (!wrap) return;
  wrap.innerHTML = CORES_GRUPO.map(c =>
    `<button class="cor-option ${c === _corSelecionada ? 'cor-option--ativa' : ''}"
      style="background:${c}" onclick="SalaMode._selecionarCor('${c}')"></button>`
  ).join('');
}

function _selecionarCor(cor) { _corSelecionada = cor; _renderCoresGrupo(); }

async function confirmarCriarGrupo() {
  const inp  = document.getElementById('ns-grupo-nome');
  const nome = (inp?.value || '').trim();
  if (!nome) { _setStatus('ns-criar-status', 'Digite um nome para o grupo.', 'erro'); return; }
  const player = _getPlayer();
  if (!player?.uid) { _setStatus('ns-criar-status', 'Você precisa estar logado.', 'erro'); return; }

  const btn = document.getElementById('ns-btn-criar-grupo');
  if (btn) { btn.disabled = true; btn.textContent = 'Criando...'; }

  try {
    const gsp   = _GSP();
    const grupo = await gsp.criarGrupo(_sala.codigo, {
      uid: player.uid, nome: player.nome,
      nomeGrupo: nome, cor: _corSelecionada,
    });
    _grupoAtual = { ...grupo, membros: [player.uid] };
    _LS_set('gsp_sala_grupo', _grupoAtual);
    _atualizarBadge();
    fecharCriarGrupo();
    await _carregarGrupos();
    _mostrarSucesso('✅ Grupo "' + nome + '" criado!');
  } catch(e) {
    const msgs = {
      'limite_grupos':  'Limite de grupos atingido.',
      'nome_invalido':  'Nome inválido.',
      'nome_duplicado': 'Já existe um grupo com esse nome.',
      'sala_fechada':   'A sala está fechada para novos grupos.',
    };
    _setStatus('ns-criar-status', msgs[e.message] || 'Erro: ' + e.message, 'erro');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Criar Grupo'; }
  }
}

async function entrarGrupo(nomeGrupo) {
  const player = _getPlayer();
  if (!player?.uid || !_sala) return;
  try {
    const gsp = _GSP();
    await gsp.entrarGrupo(_sala.codigo, { uid: player.uid, nome: player.nome, nomeGrupo });
    const grupos = await gsp.carregarGrupos(_sala.codigo);
    _grupoAtual = grupos.find(g => g.nomeGrupo === nomeGrupo) || null;
    if (_grupoAtual) _LS_set('gsp_sala_grupo', _grupoAtual);
    _atualizarBadge();
    await _carregarGrupos();
    _mostrarSucesso('✅ Você entrou no grupo "' + nomeGrupo + '"!');
  } catch(e) {
    const msgs = {
      'grupo_cheio':        'Este grupo está cheio.',
      'partida_em_curso':   'Partida em andamento — não é possível entrar agora.',
    };
    _mostrarAviso(msgs[e.message] || 'Erro ao entrar no grupo.');
  }
}

/* ════════════════════════════════════════
   LOBBY DO GRUPO
════════════════════════════════════════ */
async function irLobby() {
  if (!_sala || !_grupoAtual) { _mostrarAviso('Entre em um grupo antes.'); return; }

  _mostrarTela('screen-lobby');
  _renderLobby();

  const ciclo  = _sala.cicloAtual || 1;
  _partidaId   = _grupoAtual.nomeGrupo + '_ciclo' + ciclo;

  _pararPolling();
  _pollingInt = setInterval(_tickLobby, 2500);
  _heartbeatInt = setInterval(() => {
    if (_sala && _partidaId && _getPlayer()?.uid)
      _GSP()?.heartbeat?.(_sala.codigo, _partidaId, _getPlayer().uid);
  }, 5000);
  await _tickLobby();
}

function _renderLobby() {
  const player = _getPlayer();
  const cor = _grupoAtual?.cor || 'var(--acc)';

  _setText('ns-lobby-grupo-nome', _grupoAtual?.nomeGrupo || 'Grupo');
  const dotEl = document.getElementById('ns-lobby-grupo-cor-dot');
  if (dotEl) dotEl.style.background = cor;
  _setText('ns-lobby-sala-badge', _sala?.nome || _sala?.codigo || 'Sala');

  // Papel meu
  _renderMeuPapelNoLobby();

  // Setor (modo livre)
  const setorWrap = document.getElementById('ns-lobby-setor-wrap');
  if (setorWrap) setorWrap.style.display = _sala.setorFixo ? 'none' : 'block';

  // Botão iniciar (só líder)
  const isLider = _grupoAtual?.lider === player?.uid;
  const btnIni  = document.getElementById('ns-btn-iniciar');
  const aguardo = document.getElementById('ns-lobby-aguardo');
  if (btnIni)  btnIni.style.display  = isLider ? 'block' : 'none';
  if (aguardo) aguardo.style.display = isLider ? 'none'  : 'block';

  // Info de papéis
  _renderInfoPapeis();
}

function _renderMeuPapelNoLobby() {
  if (!_papelMeu) {
    _setText('ns-papel-icon', '🎲');
    _setText('ns-papel-titulo', 'Aguardando início...');
    _setText('ns-papel-desc', 'Os papéis executivos serão atribuídos ao iniciar a partida.');
    const card = document.getElementById('ns-papel-card');
    if (card) card.style.borderLeftColor = 'var(--line1)';
    return;
  }
  const p = PAPEIS[_papelMeu] || PAPEIS.CEO;
  _setText('ns-papel-icon', p.emoji);
  _setText('ns-papel-titulo', p.nome);
  _setText('ns-papel-desc', p.desc);
  const card = document.getElementById('ns-papel-card');
  if (card) card.style.borderLeftColor = p.cor;
}

function _renderInfoPapeis() {
  const grid = document.getElementById('ns-papeis-grid');
  if (!grid) return;
  grid.innerHTML = PAPEIS_LIST.map(id => {
    const p = PAPEIS[id];
    return `<div class="ns-papel-mini">
      <div class="ns-papel-mini-icon">${p.emoji}</div>
      <div class="ns-papel-mini-info">
        <div class="ns-papel-mini-nome">${id}</div>
        <div class="ns-papel-mini-desc">${p.desc.replace('Você antecipa','Insight:').replace('Seu voto','Voto').replace('.','').split('.')[0]}</div>
      </div>
    </div>`;
  }).join('');
}

async function _tickLobby() {
  if (!_sala || !_partidaId) return;
  try {
    const gsp    = _GSP();
    const estado = await gsp.carregarEstadoPartida(_sala.codigo, _partidaId);
    if (!estado) return;
    _partidaEstado = estado;

    // Renderiza jogadores
    _renderJogadoresLobby(estado);

    // Recupera papeis do estado
    if (estado.papeis) {
      _papeis = estado.papeis;
      const uid = _getPlayer()?.uid;
      if (uid && _papeis[uid]) {
        _papelMeu = _papeis[uid];
        _renderMeuPapelNoLobby();
      }
    }

    // Transição para o jogo se a partida iniciou
    if (estado.status === 'votando' || estado.status === 'em_jogo') {
      _entrarNoJogo(estado);
    }
  } catch(e) { /* ignora rede */ }
}

function _renderJogadoresLobby(estado) {
  const lista = document.getElementById('ns-lobby-jogadores');
  if (!lista) return;
  const agora    = Date.now();
  const online   = estado.online || {};
  const jogadores= estado.jogadores || {};
  const membros  = _grupoAtual?.membros || [];

  lista.innerHTML = membros.map(uid => {
    const nome    = jogadores[uid] || uid;
    const isOnline= online[uid] && (agora - online[uid]) < 15000;
    const isLider = uid === _grupoAtual?.lider;
    const papel   = _papeis[uid];
    const p       = papel ? PAPEIS[papel] : null;
    return `<div class="ns-lobby-player">
      <div class="ns-lobby-player-dot ${isOnline ? '' : 'ns-lobby-player-dot--off'}"></div>
      <div class="ns-lobby-player-nome">${nome}</div>
      ${p ? `<div class="ns-lobby-player-papel ${isLider ? 'ns-lobby-player-papel--lider' : ''}">${p.emoji} ${p.id}</div>` : ''}
      ${isLider ? `<div class="ns-lobby-player-papel ns-lobby-player-papel--lider">👑</div>` : ''}
    </div>`;
  }).join('');
}

/* ════════════════════════════════════════
   INICIAR PARTIDA (líder)
════════════════════════════════════════ */
async function iniciarPartida() {
  if (!_sala || !_grupoAtual || !_partidaId) return;
  if (_grupoAtual.lider !== _getPlayer()?.uid) { _mostrarAviso('Só o líder pode iniciar.'); return; }

  const btn = document.getElementById('ns-btn-iniciar');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Iniciando...'; }

  try {
    // Define setor
    let sector = _sala.setorFixo || _grupoAtual.sector || '';
    if (!sector) {
      const sel = document.getElementById('ns-lobby-setor');
      sector = sel?.value || 'tecnologia';
    }

    // Inicializa BetaState local
    if (typeof iniciar === 'function') {
      await iniciar(sector, _grupoAtual.nomeGrupo, _grupoAtual.nomeGrupo, true);
    }
    _betaState = JSON.parse(JSON.stringify(BetaState.get()));

    // Atribui papéis executivos
    const membros = _grupoAtual.membros || [];
    const papeis  = _atribuirPapeis(membros);
    _papeis = papeis;
    const uid = _getPlayer()?.uid;
    if (uid && papeis[uid]) {
      _papelMeu = papeis[uid];
      _renderMeuPapelNoLobby();
    }

    // Jogadores
    const jogadores = {};
    membros.forEach(u => { jogadores[u] = _betaState.groupName || u; });

    const firstRound = _betaState.gameRounds?.[0] || {};

    // Cria/atualiza doc
    const gsp = _GSP();
    await gsp.criarPartida(_sala.codigo, {
      grupo: _grupoAtual.nomeGrupo, sector,
      totalRodadas: _betaState.totalRounds,
      timerSegundos: DURACAO.votacao,
      ciclo: _sala.cicloAtual || 1,
      jogadores, papeis,
    }).catch(() => {});

    await gsp.iniciarPartida(_sala.codigo, _partidaId, {
      sector,
      indicators:    _betaState.indicators,
      situacaoAtual: firstRound,
      fase:          'alerta',
      faseInicio:    Date.now(),
      faseDuracao:   DURACAO.alerta,
      papeis,
    });

    _entrarNoJogo(await gsp.carregarEstadoPartida(_sala.codigo, _partidaId));
  } catch(e) {
    _mostrarAviso('Erro ao iniciar: ' + e.message);
    if (btn) { btn.disabled = false; btn.textContent = '▶ Iniciar Partida'; }
  }
}

function _atribuirPapeis(membros) {
  const papeis = {};
  if (!membros.length) return papeis;
  const list = [...PAPEIS_LIST];
  // Líder fica com CEO
  const lider = _grupoAtual.lider;
  papeis[lider] = 'CEO';
  const resto = membros.filter(u => u !== lider);
  // Shuffle papeis restantes
  const outros = list.filter(p => p !== 'CEO').sort(() => Math.random() - .5);
  resto.forEach((uid, i) => { papeis[uid] = outros[i % outros.length]; });
  return papeis;
}

/* ════════════════════════════════════════
   ENTRAR NO JOGO + POLLING
════════════════════════════════════════ */
function _entrarNoJogo(estado) {
  _pararPolling();
  _mostrarTela('screen-jogo-grupo');
  _renderEstado(estado);
  _pollingInt = setInterval(_tickJogo, 2000);
  _heartbeatInt = setInterval(() => {
    if (_sala && _partidaId && _getPlayer()?.uid)
      _GSP()?.heartbeat?.(_sala.codigo, _partidaId, _getPlayer().uid);
  }, 5000);
}

async function _tickJogo() {
  if (!_sala || !_partidaId) return;
  try {
    const gsp    = _GSP();
    const estado = await gsp.carregarEstadoPartida(_sala.codigo, _partidaId);
    if (!estado) return;
    const faseAnterior = _partidaEstado?.fase;
    _partidaEstado = estado;
    _renderEstado(estado);

    // Se a fase mudou, re-renderiza completo
    if (estado.fase !== faseAnterior) {
      _renderFase(estado);
    }

    if (estado.status === 'encerrada') {
      _encerrar(estado);
    }
  } catch(e) { /* ignora */ }
}

function _pararPolling() {
  if (_pollingInt)    { clearInterval(_pollingInt);    _pollingInt    = null; }
  if (_heartbeatInt)  { clearInterval(_heartbeatInt);  _heartbeatInt  = null; }
  if (_timerInt)      { clearInterval(_timerInt);      _timerInt      = null; }
}

/* ════════════════════════════════════════
   RENDER PRINCIPAL DO ESTADO
════════════════════════════════════════ */
function _renderEstado(estado) {
  _renderHeader(estado);
  _renderIndicadores(estado);
  _renderAvatares(estado);

  const fase = estado.fase || 'votacao';
  if (fase !== _faseAtual) {
    _faseAtual = fase;
    _renderFase(estado);
    _iniciarTimerFase(estado);
  }
}

function _renderHeader(estado) {
  _setText('jg-rod-atual', (estado.rodadaAtual || 0) + 1);
  _setText('jg-rod-total', estado.totalRodadas || 15);
  _setText('jg-grupo-nome-hd', _grupoAtual?.nomeGrupo || 'Grupo');
  const dot = document.getElementById('jg-grupo-cor-dot');
  if (dot) dot.style.background = _grupoAtual?.cor || 'var(--acc)';
}

function _renderIndicadores(estado) {
  const wrap = document.getElementById('jg-inds');
  if (!wrap || !estado.indicators) return;
  const inds = estado.indicators;
  wrap.innerHTML = Object.entries(inds).map(([k, v]) => {
    const delta = _indsAnteriores ? (v - (_indsAnteriores[k] || v)) : 0;
    const cor   = _corNivel(v);
    const cls   = v <= 4 ? 'jg-ind--critico' : v <= 7 ? 'jg-ind--alerta' : '';
    const labelsMap = (typeof BetaIndicadores !== 'undefined' && BetaIndicadores.LABELS) || {};
    const fullLabel = labelsMap[k] || k;
    // Remove emoji do label
    const label = fullLabel.replace(/^[^\w]+ ?/, '').split(' ').slice(0, 2).join(' ');
    const deltaHtml = delta !== 0
      ? `<div class="jg-ind-delta jg-ind-delta--${delta > 0 ? 'pos' : 'neg'}">${delta > 0 ? '+' : ''}${delta}</div>`
      : `<div class="jg-ind-delta"></div>`;
    return `<div class="jg-ind ${cls}">
      <div class="jg-ind-label">${label}</div>
      <div class="jg-ind-val" style="color:${cor}">${v}</div>
      ${deltaHtml}
    </div>`;
  }).join('');
}

function _renderAvatares(estado) {
  const wrap = document.getElementById('jg-avatares');
  if (!wrap) return;
  const agora    = Date.now();
  const online   = estado.online    || {};
  const jogadores= estado.jogadores || {};
  const votos    = estado.votos     || {};
  const sinais   = estado.sinais    || {};

  wrap.innerHTML = Object.keys(jogadores).map(uid => {
    const nome     = jogadores[uid] || uid;
    const isOnline = online[uid] && (agora - online[uid]) < 15000;
    const votou    = !!votos[uid];
    const sinal    = sinais[uid];
    const papelId  = _papeis[uid];
    const p        = papelId ? PAPEIS[papelId] : null;
    const inicial  = nome.charAt(0).toUpperCase();
    return `<div class="jg-avatar ${isOnline ? 'jg-avatar--online' : ''} ${votou ? 'jg-avatar--votou' : ''}">
      <div class="jg-avatar-wrap">
        <div class="jg-avatar-icon" style="background:${_grupoAtual?.cor || 'var(--bg3)'}22">${inicial}</div>
        <div class="jg-avatar-check">✓</div>
      </div>
      ${sinal ? `<div class="jg-avatar-sinal">${SINAIS.find(s=>s.id===sinal)?.emoji || ''}</div>` : '<div class="jg-avatar-sinal"></div>'}
      <div class="jg-avatar-nome">${nome.split(' ')[0]}</div>
      ${p ? `<div class="jg-avatar-papel-tag">${p.emoji}</div>` : ''}
    </div>`;
  }).join('');
}

/* ════════════════════════════════════════
   RENDER POR FASE
════════════════════════════════════════ */
function _renderFase(estado) {
  const fase  = estado.fase || 'votacao';
  const corpo = document.getElementById('jg-corpo');
  const screen= document.getElementById('screen-jogo-grupo');
  if (!corpo) return;

  // Atualiza badge
  const badgeTexts = {
    alerta:      '🚨 Nova Crise',
    deliberacao: '💬 Deliberação',
    votacao:     '🗳️ Votação',
    revelacao:   '👁️ Revelação',
    impacto:     '⚡ Impacto',
    placar:      '📊 Placar',
  };
  const badge = document.getElementById('jg-fase-badge');
  if (badge) badge.textContent = badgeTexts[fase] || fase;

  // Classe no screen para temas
  if (screen) {
    screen.className = screen.className.replace(/jg-fase--\S+/g, '').trim();
    screen.classList.add('jg-fase--' + fase);
  }

  switch(fase) {
    case 'alerta':      corpo.innerHTML = _htmlFaseAlerta(estado);      break;
    case 'deliberacao': corpo.innerHTML = _htmlFaseDeliberacao(estado);  break;
    case 'votacao':     corpo.innerHTML = _htmlFaseVotacao(estado);      break;
    case 'revelacao':   corpo.innerHTML = _htmlFaseRevelacao(estado);    break;
    case 'impacto':     corpo.innerHTML = _htmlFaseImpacto(estado);      break;
    case 'placar':      corpo.innerHTML = _htmlFasePlacar(estado);       break;
    default:            corpo.innerHTML = _htmlFaseVotacao(estado);
  }

  // Lógica do líder: auto-avança fase quando timer esgota
  _agendarTransicaoFase(estado);
}

/* ── FASE: ALERTA ── */
function _htmlFaseAlerta(estado) {
  const sit = estado.situacaoAtual || {};
  const sev = _calcSeveridade(estado.indicators || {});
  const sevInfo = {
    critico: { emoji: '💀', txt: 'CRÍTICO', cls: 'jg-sev--critico' },
    alto:    { emoji: '🔥', txt: 'ALTO',    cls: 'jg-sev--alto'    },
    medio:   { emoji: '⚠️', txt: 'MÉDIO',   cls: 'jg-sev--medio'   },
    baixo:   { emoji: '📋', txt: 'BAIXO',   cls: 'jg-sev--baixo'   },
  }[sev] || { emoji: '⚠️', txt: 'MÉDIO', cls: 'jg-sev--medio' };

  return `<div class="jg-alerta-wrap">
    <div class="jg-alerta-icon jg-anim-pop">${sevInfo.emoji}</div>
    <div class="jg-alerta-sev ${sevInfo.cls}">SEVERIDADE ${sevInfo.txt}</div>
    <div class="jg-alerta-titulo">${sit.titulo || sit.title || 'Nova Crise'}</div>
    <div class="jg-alerta-desc">${(sit.historia || sit.description || '').slice(0, 120)}${(sit.historia || '').length > 120 ? '...' : ''}</div>
  </div>`;
}

/* ── FASE: DELIBERAÇÃO ── */
function _htmlFaseDeliberacao(estado) {
  const sit     = estado.situacaoAtual || {};
  const choices = sit.choices || sit.opcoes || [];
  const sinaisOthers = estado.sinais || {};
  const player  = _getPlayer();
  const jogadores = estado.jogadores || {};

  // Insight do papel
  const papelId = _papelMeu || (_papeis[player?.uid]);
  const papel = papelId ? PAPEIS[papelId] : null;
  let insightHtml = '';
  if (papel?.insight && estado.indicators) {
    const val = estado.indicators[papel.insight];
    if (val !== undefined) {
      const trend = _calcTendencia(papel.insight, estado);
      const trendTxt = trend > 0 ? `📈 tendência de alta` : trend < 0 ? `📉 tendência de baixa` : `➡️ estável`;
      insightHtml = `<div class="jg-insight-box">
        <div class="jg-insight-icon">${papel.emoji}</div>
        <div class="jg-insight-txt">
          <div class="jg-insight-titulo">${papel.id} — Insight</div>
          ${(typeof BetaIndicadores !== 'undefined' ? BetaIndicadores.LABELS[papel.insight] : papel.insight)}: <strong>${val}</strong> — ${trendTxt}
        </div>
      </div>`;
    }
  }

  // Sinais dos outros
  const outrosSinais = Object.entries(sinaisOthers)
    .filter(([uid]) => uid !== player?.uid && sinaisOthers[uid])
    .map(([uid, sinal]) => {
      const nome  = jogadores[uid] || uid.slice(0,6);
      const sInfo = SINAIS.find(s => s.id === sinal);
      return sInfo ? `<div class="jg-sinal-outro">${sInfo.emoji} <span>${nome.split(' ')[0]}</span></div>` : '';
    }).join('');

  // Opções preview
  const opcoesHtml = choices.map((c, i) => {
    const letra = String.fromCharCode(65 + i);
    return `<div class="jg-opcao-preview">
      <span class="jg-opcao-letra">${letra}</span>
      <span class="jg-opcao-texto">${c.text || c}</span>
    </div>`;
  }).join('');

  // Grid de sinais
  const sinaisHtml = SINAIS.map(s => `
    <button class="jg-sinal-btn ${_meuSinal === s.id ? 'jg-sinal-btn--ativo' : ''}"
      onclick="SalaMode.enviarSinal('${s.id}')">
      <span class="jg-sinal-emoji">${s.emoji}</span>
      <span>${s.texto}</span>
    </button>`).join('');

  return `<div class="jg-delib-wrap">
    <div class="jg-crisis-box">
      <div class="jg-crisis-titulo">${sit.titulo || sit.title || 'Crise'}</div>
      <div class="jg-crisis-desc">${sit.historia || sit.description || ''}</div>
    </div>
    ${insightHtml}
    <div class="jg-opcoes-preview">${opcoesHtml}</div>
    <div class="jg-sinais-label">📡 Sinalizar para o grupo</div>
    <div class="jg-sinais-grid">${sinaisHtml}</div>
    ${outrosSinais ? `<div style="margin-top:8px"><div class="jg-sinais-label">Sinais do grupo</div><div class="jg-sinais-outros">${outrosSinais}</div></div>` : ''}
  </div>`;
}

/* ── FASE: VOTAÇÃO ── */
function _htmlFaseVotacao(estado) {
  const sit    = estado.situacaoAtual || {};
  const choices= sit.choices || sit.opcoes || [];
  const votos  = estado.votos || {};
  const meu    = votos[_getPlayer()?.uid];
  const meuLetra = typeof meu === 'object' ? meu.letra : meu;
  const bloqueado= estado.status === 'revelando';

  const opcoesHtml = choices.map((c, i) => {
    const letra  = String.fromCharCode(65 + i);
    const votado = meuLetra === letra;
    return `<button class="jg-opcao-btn ${votado ? 'jg-opcao-btn--votado' : ''}"
      onclick="SalaMode.votar('${letra}')"
      ${bloqueado ? 'disabled' : ''}>
      <span class="jg-opcao-letra">${letra}</span>
      <span class="jg-opcao-texto">${c.text || c}</span>
    </button>`;
  }).join('');

  const confHtml = CONFIANCA.map(cv => {
    const meuConf = typeof meu === 'object' ? meu.confianca : null;
    const ativo   = meuConf === cv.id;
    return `<button class="jg-conf-btn ${ativo ? 'jg-conf-btn--ativo' : ''}"
      onclick="SalaMode.setConfianca('${cv.id}')">
      <span class="jg-conf-emoji">${cv.emoji}</span>
      <span>${cv.label}</span>
    </button>`;
  }).join('');

  return `<div class="jg-votacao-wrap">
    <div class="jg-crise-mini">
      <div class="jg-crise-mini-titulo">${sit.titulo || sit.title || 'Decisão'}</div>
      <div class="jg-crise-mini-desc">${(sit.historia || sit.description || '').slice(0, 90)}${(sit.historia||'').length > 90 ? '...' : ''}</div>
    </div>
    <div class="jg-opcoes">${opcoesHtml}</div>
    <div class="jg-conf-label">Nível de Confiança na decisão</div>
    <div class="jg-conf-grid">${confHtml}</div>
  </div>`;
}

/* ── FASE: REVELAÇÃO ── */
function _htmlFaseRevelacao(estado) {
  const votos    = estado.votos || {};
  const decisao  = estado.decisaoFinal;
  const sit      = estado.situacaoAtual || {};
  const choices  = sit.choices || sit.opcoes || [];

  // Contagem
  const contagem = {};
  Object.values(votos).forEach(v => {
    const letra = typeof v === 'object' ? v.letra : v;
    if (letra) contagem[letra] = (contagem[letra] || 0) + 1;
  });
  const total = Math.max(1, Object.values(contagem).reduce((a,b) => a+b, 0));

  const opcoes = ['A','B','C','D'].filter((o,i) => i < choices.length);
  const barras = opcoes.map(o => {
    const pct  = Math.round(((contagem[o] || 0) / total) * 100);
    const isWin= o === decisao;
    const choice = choices[o.charCodeAt(0) - 65];
    return `<div class="jg-rev-barra ${isWin ? 'jg-rev-barra--vence' : ''}">
      <span class="jg-rev-letra">${o}</span>
      <div style="flex:1;min-width:0">
        <div class="jg-rev-track"><div class="jg-rev-fill" style="width:${pct}%" data-width="${pct}"></div></div>
        <div style="font-size:.72rem;color:var(--t3);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${choice?.text || choice || ''}</div>
      </div>
      <span class="jg-rev-count">${contagem[o] || 0} voto${(contagem[o]||0) !== 1 ? 's' : ''}</span>
      ${isWin ? '<span class="jg-rev-win-tag">✓</span>' : ''}
    </div>`;
  }).join('');

  const decChoice = decisao ? choices[decisao.charCodeAt(0) - 65] : null;
  const decisaoHtml = decChoice ? `<div class="jg-decisao-box">
    <div class="jg-decisao-label">✅ Decisão Adotada — Opção ${decisao}</div>
    <div class="jg-decisao-txt">${decChoice.text || decChoice}</div>
  </div>` : '';

  return `<div class="jg-revelacao-wrap">
    <div class="jg-rev-titulo">Resultado da Votação</div>
    <div class="jg-rev-barras">${barras}</div>
    ${decisaoHtml}
  </div>`;
}

/* ── FASE: IMPACTO ── */
function _htmlFaseImpacto(estado) {
  const atual = estado.indicators || {};
  const antes = _indsAnteriores || atual;
  const labelsMap = (typeof BetaIndicadores !== 'undefined' && BetaIndicadores.LABELS) || {};

  const linhas = Object.entries(atual).map(([k, v]) => {
    const vAntes = antes[k] ?? v;
    const delta  = v - vAntes;
    const cor    = _corNivel(v);
    const label  = (labelsMap[k] || k).replace(/^[^\w]+ ?/, '');
    const deltaCls = delta > 0 ? 'jg-delta-pos' : delta < 0 ? 'jg-delta-neg' : 'jg-delta-neu';
    const deltaStr = delta > 0 ? '+' + delta : delta === 0 ? '±0' : String(delta);
    return `<div class="jg-impacto-item">
      <div class="jg-impacto-nome">${label}</div>
      <div class="jg-impacto-antes">${vAntes}</div>
      <div class="jg-impacto-arr">→</div>
      <div class="jg-impacto-depois" style="color:${cor}">${v}</div>
      <div class="jg-impacto-delta ${deltaCls}">${deltaStr}</div>
    </div>`;
  }).join('');

  return `<div class="jg-impacto-wrap">
    <div class="jg-impacto-titulo">⚡ Impacto nos Indicadores</div>
    <div class="jg-impacto-grid">${linhas}</div>
  </div>`;
}

/* ── FASE: PLACAR ── */
function _htmlFasePlacar(estado) {
  const grupos = estado.placarGrupos || [];
  const meu    = _grupoAtual?.nomeGrupo;
  const scoreAtual = estado.score || _calcScore(_betaState);

  if (!grupos.length) {
    return `<div class="jg-placar-wrap">
      <div class="jg-placar-titulo">📊 Seu Grupo</div>
      <div class="jg-placar-lista">
        <div class="jg-placar-item jg-placar-item--eu">
          <div class="jg-placar-pos jg-placar-pos--1">—</div>
          <div class="jg-placar-nome">${meu || 'Grupo'}</div>
          <div class="jg-placar-score">${scoreAtual}</div>
        </div>
      </div>
    </div>`;
  }

  const sorted = [...grupos].sort((a, b) => (b.score || 0) - (a.score || 0));
  const medais = ['🥇','🥈','🥉'];
  const itens = sorted.map((g, i) => {
    const isEu = g.nome === meu;
    const delta = (g.score || 0) - (g.scorePrev || g.score || 0);
    const trendCls  = delta > 0 ? 'jg-trend-up' : delta < 0 ? 'jg-trend-down' : 'jg-trend-neu';
    const trendStr  = delta > 0 ? `▲${delta}` : delta < 0 ? `▼${Math.abs(delta)}` : `—`;
    return `<div class="jg-placar-item ${isEu ? 'jg-placar-item--eu' : ''}">
      <div class="jg-placar-pos jg-placar-pos--${i+1}">${medais[i] || (i+1)}</div>
      <div class="jg-placar-nome">${g.nome || 'Grupo'}</div>
      <div class="jg-placar-score">${g.score || 0}</div>
      <div class="jg-placar-trend ${trendCls}">${trendStr}</div>
    </div>`;
  }).join('');

  return `<div class="jg-placar-wrap">
    <div class="jg-placar-titulo">📊 Classificação — Rodada ${(estado.rodadaAtual || 0) + 1}</div>
    <div class="jg-placar-lista">${itens}</div>
  </div>`;
}

/* ════════════════════════════════════════
   TIMER CIRCULAR POR FASE
════════════════════════════════════════ */
function _iniciarTimerFase(estado) {
  if (_timerInt) { clearInterval(_timerInt); _timerInt = null; }
  const fase     = estado.fase || 'votacao';
  const duracao  = estado.faseDuracao || DURACAO[fase] || 30;
  const inicio   = estado.faseInicio  ? new Date(estado.faseInicio).getTime() : Date.now();
  const circum   = _svgTimerCircum();

  const timerNum  = document.getElementById('jg-timer-num');
  const timerRing = document.getElementById('jg-timer-ring');
  const timerWrap = document.getElementById('jg-timer-wrap');

  // Cor do anel por fase
  const corFase = {
    alerta:      '#e74c3c',
    deliberacao: '#f39c12',
    votacao:     '#3498db',
    revelacao:   '#9b59b6',
    impacto:     '#27ae60',
    placar:      '#1abc9c',
  };
  if (timerRing) timerRing.style.stroke = corFase[fase] || 'var(--acc)';

  _timerInt = setInterval(() => {
    const elapsed  = (Date.now() - inicio) / 1000;
    const restante = Math.max(0, Math.ceil(duracao - elapsed));
    const progresso= Math.max(0, 1 - (elapsed / duracao));
    const offset   = circum * (1 - progresso);

    if (timerNum)  timerNum.textContent  = restante > 0 ? restante : '';
    if (timerRing) timerRing.style.strokeDashoffset = offset;
    if (timerWrap) {
      timerWrap.classList.toggle('jg-timer-urgent', restante <= 5 && restante > 0);
    }

    if (restante <= 0) {
      clearInterval(_timerInt); _timerInt = null;
    }
  }, 500);
}

function _agendarTransicaoFase(estado) {
  // Só o líder processa transições
  if (_grupoAtual?.lider !== _getPlayer()?.uid) return;

  const fase    = estado.fase || 'votacao';
  const duracao = estado.faseDuracao || DURACAO[fase] || 30;
  const inicio  = estado.faseInicio ? new Date(estado.faseInicio).getTime() : Date.now();
  const restante= Math.max(0, (inicio + duracao * 1000) - Date.now());

  // Limpa agendamento anterior
  if (window._salaFaseTimeout) clearTimeout(window._salaFaseTimeout);

  window._salaFaseTimeout = setTimeout(() => {
    _transitarFase(estado, fase);
  }, restante + 300); // +300ms de margem
}

async function _transitarFase(estadoAtual, faseAtual) {
  const gsp = _GSP();
  if (!gsp || !_sala || !_partidaId) return;

  const proxIdx = FASES_SEQUENCIA.indexOf(faseAtual) + 1;

  // Última fase do ciclo: placar
  if (faseAtual === 'placar') {
    const rodadaAtual = estadoAtual.rodadaAtual || 0;
    const totalRodadas= estadoAtual.totalRodadas || 15;
    const proxRodada  = rodadaAtual + 1;

    if (proxRodada >= totalRodadas) {
      // Jogo terminou
      const scoreFinal = _calcScore(_betaState);
      await gsp.encerrarPartida(_sala.codigo, _partidaId, {
        grupo:   _grupoAtual.nomeGrupo,
        cor:     _grupoAtual.cor,
        membros: _grupoAtual.membros,
        score:   scoreFinal,
        sector:  estadoAtual.sector,
        ciclo:   _sala.cicloAtual || 1,
      }).catch(e => console.error('[Encerrar]', e));
      return;
    }

    // Próxima rodada: volta para alerta
    const nextState = _betaState;
    const nextRound = nextState?.gameRounds?.[proxRodada] || {};
    _indsAnteriores = { ...(estadoAtual.indicators || {}) };

    await gsp.avancarRodada(_sala.codigo, _partidaId, {
      novaRodada:    proxRodada,
      indicators:    nextState?.indicators || estadoAtual.indicators,
      score:         _calcScore(nextState),
      situacaoAtual: nextRound,
      status:        'votando',
      fase:          'alerta',
      faseInicio:    Date.now(),
      faseDuracao:   DURACAO.alerta,
      votos:         {},
      sinais:        {},
      decisaoFinal:  null,
    }).catch(e => console.error('[AvancarRodada]', e));
    return;
  }

  // Transição normal entre fases
  const proxFase = FASES_SEQUENCIA[proxIdx];
  if (!proxFase) return;

  let extra = {};

  // Na revelação: calcular decisão final antes de avançar
  if (faseAtual === 'votacao') {
    const votos = estadoAtual.votos || {};
    const decisao = _calcDecisao(votos, estadoAtual);
    extra = { decisaoFinal: decisao };
    // Enfileira processamento do efeito da decisão
    _aplicarDecisao(estadoAtual, decisao);
  }

  // No impacto: snapshot dos indicadores antes de revelar no placar
  if (faseAtual === 'revelacao') {
    _indsAnteriores = { ...(estadoAtual.indicators || {}) };
  }

  await gsp.avancarFase?.(_sala.codigo, _partidaId, {
    fase:       proxFase,
    faseInicio: Date.now(),
    faseDuracao:DURACAO[proxFase],
    ...extra,
  }).catch(async () => {
    // Fallback: usa avancarRodada com campo extra
    await gsp.avancarRodada(_sala.codigo, _partidaId, {
      novaRodada:    estadoAtual.rodadaAtual || 0,
      indicators:    estadoAtual.indicators,
      score:         estadoAtual.score || 0,
      situacaoAtual: estadoAtual.situacaoAtual,
      status:        'votando',
      fase:          proxFase,
      faseInicio:    Date.now(),
      faseDuracao:   DURACAO[proxFase],
      ...extra,
    }).catch(e => console.error('[TransitarFase]', e));
  });
}

function _calcDecisao(votos, estado) {
  const contagem = {};
  Object.values(votos).forEach(v => {
    const letra = typeof v === 'object' ? v.letra : v;
    if (letra) contagem[letra] = (contagem[letra] || 0) + 1;
  });
  // Empate: CEO decide
  const sorted = Object.entries(contagem).sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return 'A'; // fallback
  return sorted[0][0];
}

async function _aplicarDecisao(estado, decisao) {
  // Aplica efeitos no BetaState local (só o líder)
  try {
    if (!_betaState) return;
    const idx    = decisao.charCodeAt(0) - 65;
    const round  = _betaState.gameRounds?.[estado.rodadaAtual || 0];
    const choice = round?.choices?.[idx];
    if (!choice) return;
    if (typeof BetaState !== 'undefined') {
      BetaState.applyEffects(choice.effects || {});
      BetaState.nextRound();
      _betaState = JSON.parse(JSON.stringify(BetaState.get()));
    }
    // Atualiza indicators no Firestore para a fase de impacto
    const gsp = _GSP();
    await gsp?.avancarFase?.(_sala.codigo, _partidaId, {
      fase:        'impacto',
      faseInicio:  Date.now() + 5500, // Após revelacao
      faseDuracao: DURACAO.impacto,
      indicators:  _betaState.indicators,
    }).catch(() => {});
  } catch(e) { console.error('[ApliDecisao]', e); }
}

/* ════════════════════════════════════════
   AÇÕES DO JOGADOR
════════════════════════════════════════ */
async function votar(letra) {
  if (!_sala || !_partidaId || !_getPlayer()?.uid) return;
  if (_faseAtual !== 'votacao') return;
  _meuVoto = _meuVoto ? { ..._meuVoto, letra } : { letra, confianca: 'moderado' };
  try {
    const gsp = _GSP();
    // Tenta versão nova com objeto, fallback para string
    await (gsp.registrarVotoCompleto?.(_sala.codigo, _partidaId, _getPlayer().uid, _meuVoto)
      ?? gsp.registrarVoto(_sala.codigo, _partidaId, _getPlayer().uid, letra));
    // Re-renderiza só os botões
    const corpo = document.getElementById('jg-corpo');
    if (corpo && _partidaEstado) corpo.innerHTML = _htmlFaseVotacao({ ..._partidaEstado, votos: { ...(_partidaEstado.votos || {}), [_getPlayer().uid]: _meuVoto } });
  } catch(e) { _mostrarAviso('Erro ao votar.'); }
}

async function setConfianca(nivel) {
  if (_faseAtual !== 'votacao') return;
  _meuVoto = _meuVoto ? { ..._meuVoto, confianca: nivel } : { letra: null, confianca: nivel };
  // Re-renderiza confiança
  const corpo = document.getElementById('jg-corpo');
  if (corpo && _partidaEstado) {
    const fake = { ..._partidaEstado, votos: { ...(_partidaEstado.votos || {}), [_getPlayer()?.uid]: _meuVoto } };
    corpo.innerHTML = _htmlFaseVotacao(fake);
  }
}

async function enviarSinal(sinalId) {
  if (!_sala || !_partidaId) return;
  _meuSinal = sinalId;
  try {
    const gsp = _GSP();
    if (gsp.registrarSinal) {
      await gsp.registrarSinal(_sala.codigo, _partidaId, _getPlayer()?.uid, sinalId);
    }
  } catch(e) { /* silencioso */ }
  // Re-render sinais
  if (_partidaEstado) {
    const fake = { ..._partidaEstado, sinais: { ...(_partidaEstado.sinais || {}), [_getPlayer()?.uid]: sinalId } };
    if (document.getElementById('jg-corpo')) {
      document.getElementById('jg-corpo').innerHTML = _htmlFaseDeliberacao(fake);
    }
  }
}

/* ════════════════════════════════════════
   ENCERRAR JOGO
════════════════════════════════════════ */
function _encerrar(estado) {
  _pararPolling();
  if (window._salaFaseTimeout) clearTimeout(window._salaFaseTimeout);

  const score = estado.score || _calcScore(_betaState);
  _mostrarTela('screen-resultado-grupo');
  _renderResultado(estado, score);
  setTimeout(_verificarEspera, 2000);
}

function _renderResultado(estado, score) {
  const grupo = _grupoAtual?.nomeGrupo || 'Grupo';
  _setText('ns-res-grupo-nome', grupo);
  const scoreEl = document.getElementById('ns-res-score');
  if (scoreEl) {
    scoreEl.textContent = score;
    scoreEl.style.color = score >= 70 ? 'var(--good)' : score >= 45 ? 'var(--warn,#e67e22)' : 'var(--danger)';
  }

  // Indicadores finais
  const indsEl = document.getElementById('ns-res-inds');
  if (indsEl && estado.indicators) {
    const labelsMap = (typeof BetaIndicadores !== 'undefined' && BetaIndicadores.LABELS) || {};
    indsEl.innerHTML = Object.entries(estado.indicators).map(([k, v]) => {
      const cor   = _corNivel(v);
      const pct   = Math.round((v / 20) * 100);
      const label = (labelsMap[k] || k).replace(/^[^\w]+ ?/, '');
      return `<div class="ns-res-ind-row">
        <div class="ns-res-ind-nome">${label}</div>
        <div class="ns-res-ind-track"><div class="ns-res-ind-fill" style="width:${pct}%;background:${cor}"></div></div>
        <div class="ns-res-ind-val" style="color:${cor}">${v}</div>
      </div>`;
    }).join('');
  }

  // Conquistas
  const conquistas = _calcConquistas(estado);
  const conquEl = document.getElementById('ns-res-conquistas');
  if (conquEl) {
    conquEl.innerHTML = conquistas.map(c =>
      `<div class="ns-conquista">${c.emoji} ${c.txt}</div>`
    ).join('');
  }
}

function _calcConquistas(estado) {
  const inds = estado.indicators || {};
  const vals = Object.values(inds);
  const min  = Math.min(...vals);
  const max  = Math.max(...vals);
  const med  = vals.reduce((a,b) => a+b, 0) / (vals.length || 1);
  const conquistas = [];
  if (min >= 8)  conquistas.push({ emoji:'🏅', txt:'Nenhum indicador crítico' });
  if (max >= 16) conquistas.push({ emoji:'⭐', txt:'Indicador excelente' });
  if (med >= 12) conquistas.push({ emoji:'🚀', txt:'Performance acima da média' });
  if (med < 5)   conquistas.push({ emoji:'⚠️', txt:'Situação crítica — precisa melhorar' });
  return conquistas;
}

async function _verificarEspera() {
  const gsp = _GSP();
  if (!_sala || !gsp) return;
  const todos = await gsp.verificarTodosGruposConcluiram?.(_sala.codigo).catch(() => false);
  const aviso = document.getElementById('ns-res-aviso');
  if (aviso) {
    aviso.textContent = todos
      ? '✅ Todos os grupos terminaram! Aguarde o anfitrião revelar o pódio.'
      : '⏳ Aguardando outros grupos...';
  }
}

/* ════════════════════════════════════════
   PÓDIO DA SALA
════════════════════════════════════════ */
async function irPodio() {
  if (!_sala) { _mostrarAviso('Você não está em nenhuma sala.'); return; }
  _mostrarTela('screen-podio-sala');
  _setText('ns-podio-titulo', _sala.nome || _sala.codigo);
  await _carregarPodio();
}

async function _carregarPodio() {
  const lista  = document.getElementById('ns-podio-lista');
  const espera = document.getElementById('ns-podio-espera');
  if (!lista) return;
  lista.innerHTML = '<div class="podio-loading">Carregando...</div>';

  try {
    const gsp  = _GSP();
    const sala = await gsp.carregarSala(_sala.codigo);

    if (!sala.podioVisivel) {
      if (espera) espera.style.display = 'flex';
      lista.innerHTML = '';
      // Tenta novamente em 5s
      setTimeout(_carregarPodio, 5000);
      return;
    }
    if (espera) espera.style.display = 'none';

    const podio = await gsp.carregarPodioSala(_sala.codigo, sala.cicloAtual || 1);
    if (!podio?.length) { lista.innerHTML = '<div class="podio-empty">Nenhum resultado ainda.</div>'; return; }

    const cores = ['#f1c40f','#bdc3c7','#cd7f32'];
    const meu   = _grupoAtual?.nomeGrupo;

    lista.innerHTML = podio.map((g, i) => {
      const cor       = g.cor || cores[i] || 'var(--acc)';
      const scoreCor  = g.score >= 70 ? 'ns-podio-score--high' : g.score >= 45 ? 'ns-podio-score--mid' : 'ns-podio-score--low';
      const isEu      = g.grupo === meu;
      const membros   = Array.isArray(g.membros) ? g.membros.length : 0;
      const medais    = ['🥇','🥈','🥉'];
      return `<div class="ns-podio-card" style="border-left-color:${cor}">
        <div class="ns-podio-pos">${medais[i] || '#' + (i + 1)}</div>
        <div class="ns-podio-info">
          <div class="ns-podio-nome" style="color:${cor}">${g.grupo || 'Grupo'}</div>
          <div class="ns-podio-sub">${membros} membro${membros !== 1 ? 's' : ''} · ${g.sector || ''}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <div class="ns-podio-score ${scoreCor}">${g.score}</div>
          ${isEu ? '<div class="ns-podio-eu-tag">Você</div>' : ''}
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    lista.innerHTML = '<div class="podio-empty">Erro ao carregar pódio.</div>';
  }
}

/* ════════════════════════════════════════
   ANFITRIÃO
════════════════════════════════════════ */
async function anfRevelar() {
  const gsp = _GSP();
  if (!gsp || !_sala) return;
  try {
    await gsp.revelarPodio(_sala.codigo, _getPlayer()?.uid);
    _mostrarSucesso('🏆 Pódio revelado para todos!');
    await _renderPainelAnf();
  } catch(e) { _mostrarAviso('Erro: ' + e.message); }
}

async function anfNovoCiclo() {
  const gsp = _GSP();
  if (!gsp || !_sala) return;
  try {
    await gsp.liberarNovoCiclo(_sala.codigo, _getPlayer()?.uid);
    _mostrarSucesso('🔄 Novo ciclo liberado!');
    await _renderPainelAnf();
  } catch(e) { _mostrarAviso('Erro: ' + e.message); }
}

async function anfEncerrar() {
  if (!confirm('Encerrar a sala? Todos os grupos serão removidos.')) return;
  const gsp = _GSP();
  if (!gsp || !_sala) return;
  try {
    await gsp.encerrarSala?.(_sala.codigo, _getPlayer()?.uid);
    sair();
    _mostrarSucesso('Sala encerrada.');
  } catch(e) { _mostrarAviso('Erro: ' + e.message); }
}

function irPainelAnf() {
  _mostrarTela('screen-painel-anfitriao');
  _renderPainelAnfCompleto();
}

async function _renderPainelAnfCompleto() {
  const body = document.getElementById('ns-painel-anf-body');
  if (!body) return;
  body.innerHTML = '<div class="podio-loading">Carregando...</div>';
  // Reutiliza render do inline
  await _renderPainelAnf();
  body.innerHTML = document.getElementById('ns-painel-anf')?.innerHTML || '';
}

function abrirGerenciar() {
  const modal = document.getElementById('modal-gerenciar-grupos');
  if (modal) {
    modal.style.display = 'flex';
    _renderGerenciar();
  }
}

function fecharGerenciar() {
  const modal = document.getElementById('modal-gerenciar-grupos');
  if (modal) modal.style.display = 'none';
}

async function _renderGerenciar() {
  const body = document.getElementById('ns-gerenciar-body');
  if (!body) return;
  try {
    const gsp    = _GSP();
    const grupos = await gsp.carregarGrupos(_sala.codigo);
    body.innerHTML = grupos.map(g => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line1)">
        <div style="width:12px;height:12px;border-radius:50%;background:${g.cor};flex-shrink:0"></div>
        <div style="flex:1">
          <div style="font-weight:700;color:var(--t1)">${g.nomeGrupo}</div>
          <div style="font-size:.75rem;color:var(--t3)">${g.membros?.length || 0} membros · ${g.statusCiclo || 'aguardando'}</div>
        </div>
        <button class="btn-xs" style="color:var(--danger);background:none;border:1px solid var(--danger);border-radius:4px;padding:4px 10px;font-size:.75rem;cursor:pointer"
          onclick="SalaMode._removerGrupo('${g.nomeGrupo}')">Remover</button>
      </div>`).join('');
  } catch(e) { if (body) body.innerHTML = '<div class="podio-empty">Erro.</div>'; }
}

async function _removerGrupo(nome) {
  if (!confirm('Remover grupo "' + nome + '"?')) return;
  try {
    const gsp = _GSP();
    await gsp.removerGrupo?.(_sala.codigo, nome);
    _mostrarSucesso('Grupo removido.');
    _renderGerenciar();
    _carregarGrupos();
  } catch(e) { _mostrarAviso('Erro: ' + e.message); }
}

/* ════════════════════════════════════════
   HELPERS
════════════════════════════════════════ */
function _calcSeveridade(indicators) {
  if (!indicators) return 'medio';
  const vals = Object.values(indicators);
  const min  = Math.min(...vals);
  const med  = vals.reduce((a,b) => a+b, 0) / (vals.length || 1);
  if (min <= 3 || med <= 5)  return 'critico';
  if (min <= 5 || med <= 8)  return 'alto';
  if (med <= 12)             return 'medio';
  return 'baixo';
}

function _calcTendencia(indicador, estado) {
  // Usa histórico do BetaState se disponível
  if (!_betaState?.history) return 0;
  const hist = _betaState.history;
  const len  = hist.length;
  if (len < 2) return 0;
  const prev = hist[len - 2]?.indicators?.[indicador];
  const cur  = hist[len - 1]?.indicators?.[indicador];
  if (prev === undefined || cur === undefined) return 0;
  return cur - prev;
}

// _atualizarModoSala removida daqui — gerenciada exclusivamente por mainBeta.js

/* ════════════════════════════════════════
   COMPATIBILIDADE COM BetaUI
   (re-exporta funções que BetaUI chama)
════════════════════════════════════════ */
// Exposições para onclick no HTML legado:
window.entrarNaSala      = () => entrar();
window.fecharModalSala   = () => fecharModal();
window.sairDaSala        = () => sair();
window.irParaGrupos      = () => irGrupos();
window.recarregarGrupos  = () => recarregarGrupos();
window.abrirModalCriarGrupo = () => abrirCriarGrupo();
window.fecharModalCriarGrupo= () => fecharCriarGrupo();
window.confirmarCriarGrupo  = () => confirmarCriarGrupo();
window.entrarNoGrupo     = (n) => entrarGrupo(n);
window.irParaLobby       = () => irLobby();
window.iniciarPartidaGrupo = () => iniciarPartida();
window.votarOpcao        = (l) => votar(l);
window.irParaPodioSala   = () => irPodio();
window.anfitriaoRevelarPodio = () => anfRevelar();
window.anfitriaoNovoCiclo    = () => anfNovoCiclo();
window.anfitriaoEncerrarSala = () => anfEncerrar();
window.abrirGerenciarGrupos  = () => abrirGerenciar();
window.fecharGerenciarGrupos = () => fecharGerenciar();
// _atualizarModoSala é definida em mainBeta.js — não re-exportar daqui
window._restaurarSala        = () => restaurar();
window._restaurarGrupo       = () => restaurar();
window._atualizarBadgeSala   = () => _atualizarBadge();
window._atualizarBadgeGrupo  = () => _atualizarBadge();

// Bridging para BetaUI namespace
if (typeof BetaUI !== 'undefined') {
  BetaUI.abrirModalSala      = () => abrirModal();
  BetaUI.fecharModalSala     = () => fecharModal();
  BetaUI.entrarNaSala        = () => entrar();
  BetaUI.sairDaSala          = () => sair();
  BetaUI.irParaGrupos        = () => irGrupos();
  BetaUI.recarregarGrupos    = () => recarregarGrupos();
  BetaUI.irParaLobby         = () => irLobby();
  BetaUI.iniciarPartidaGrupo = () => iniciarPartida();
  BetaUI.irParaPodioSala     = () => irPodio();
  BetaUI.anfitriaoRevelarPodio = () => anfRevelar();
  BetaUI.anfitriaoNovoCiclo  = () => anfNovoCiclo();
  BetaUI.anfitriaoEncerrarSala = () => anfEncerrar();
  BetaUI.abrirGerenciarGrupos = () => abrirGerenciar();
  BetaUI.fecharGerenciarGrupos= () => fecharGerenciar();
  BetaUI.irPainelAnf         = () => irPainelAnf();
}

/* ════════════════════════════════════════
   INIT AUTOMÁTICO
════════════════════════════════════════ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', restaurar);
} else {
  restaurar();
}

/* API PÚBLICA */
return {
  // Modal
  abrirModal, fecharModal, entrar, sair,
  // Grupos
  irGrupos, recarregarGrupos, abrirCriarGrupo, fecharCriarGrupo,
  confirmarCriarGrupo, entrarGrupo, _selecionarCor,
  // Lobby + jogo
  irLobby, iniciarPartida, votar, setConfianca, enviarSinal,
  // Pódio
  irPodio,
  // Anfitrião
  anfRevelar, anfNovoCiclo, anfEncerrar, irPainelAnf,
  abrirGerenciar, fecharGerenciar, _removerGrupo,
  // Estado
  getSala:   () => _sala,
  getGrupo:  () => _grupoAtual,
  getPapel:  () => _papelMeu,
  restaurar,
};

})();
