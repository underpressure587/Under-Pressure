/* ════════════════════════════════════════════════════
   maintenance.js  —  Under Pressure
   Módulo isolado de manutenção.

   Responsabilidades:
   - Verificação leve via REST público (sem window.ADMIN)
   - Overlay de manutenção (mostrar / esconder)
   - Polling global (logado): ban + manutenção + mensagem
   - Polling convidado: só manutenção
   - Flag _adminCheckPending: bloqueia overlay durante boot

   Globals consumidos (de outros módulos):
     window.ADMIN, window._isAdmin, window._player,
     window._versaoAtual, window._ultimaMensagemGlobal,
     BetaState, Engine,
     sair(), _salvarSessao(), _forcarSaida(),
     _atualizarModoSala(), _mostrarToastAtualizacao(),
     mostrarSucesso()
════════════════════════════════════════════════════ */

(function () {

  /* ── Estado interno ─────────────────────────────── */
  let _globalPollInterval = null;
  let _guestPollInterval  = null;
  let _adminCheckPending  = true; // true até _atualizarBotaoAdmin terminar

  /* Expõe via window para mainBeta.js poder setar */
  Object.defineProperty(window, '_adminCheckPending', {
    get: ()  => _adminCheckPending,
    set: (v) => { _adminCheckPending = !!v; },
    configurable: true,
  });

  const isAdmin  = () => !!window._isAdmin;
  const getPlayer = () => window._player || null;

  /* ════════════════════════════════════════════════
     VERIFICAÇÃO LEVE — REST público, sem auth
  ════════════════════════════════════════════════ */
  async function _verificarManutencaoInicial() {
    try {
      const API_KEY = 'AIzaSyB_Zkl12AyT5RMfg9eJ68QFTakdBKSioVU';
      const PROJECT = 'under-pressure-49320';
      const FS      = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/default/documents`;
      const r = await fetch(`${FS}/config/global?key=${API_KEY}`);
      if (!r.ok) return null;
      const doc = await r.json();
      const f   = doc.fields || {};
      const _v  = (field) => {
        if (!field) return undefined;
        return field.booleanValue ?? field.stringValue ?? field.integerValue ?? null;
      };
      return { manutencao: !!_v(f.manutencao), mensagem: _v(f.mensagem) || '' };
    } catch(e) { return null; }
  }

  /* ════════════════════════════════════════════════
     OVERLAY
  ════════════════════════════════════════════════ */
  function mostrarOverlay(msgExtra) {
    if (isAdmin()) {
      console.log('[Manutencao] 🛡️ overlay bloqueado — _isAdmin=true');
      return;
    }
    if (_adminCheckPending) {
      console.log('[Manutencao] ⏳ overlay bloqueado — adminCheck pendente');
      return;
    }
    console.warn('[Manutencao] 🚨 Exibindo overlay | uid:', getPlayer()?.uid);
    const el = document.getElementById('overlay-manutencao');
    if (!el) return;

    const extra = document.getElementById('manut-msg-extra');
    if (extra) {
      if (msgExtra) { extra.textContent = msgExtra; extra.style.display = 'block'; }
      else            extra.style.display = 'none';
    }

    const btnSalvar = document.getElementById('manut-btn-salvar');
    const emJogo = !!(typeof BetaState !== 'undefined' && BetaState.get());
    if (btnSalvar) btnSalvar.style.display = emJogo ? 'block' : 'none';

    el.style.display = 'flex';
    if (typeof Engine !== 'undefined') Engine.setPausado(true);
  }

  function esconderOverlay() {
    const el = document.getElementById('overlay-manutencao');
    if (el) el.style.display = 'none';
    if (typeof Engine !== 'undefined') Engine.setPausado(false);
  }

  function salvarSair() {
    try { if (typeof _salvarSessao === 'function') _salvarSessao(); } catch(e) {}
    esconderOverlay();
    if (typeof sair === 'function') sair();
  }

  /* ════════════════════════════════════════════════
     POLLING CONVIDADO
  ════════════════════════════════════════════════ */
  function iniciarPollingConvidado() {
    pararPollingConvidado();
    const tick = async () => {
      const cfg = await _verificarManutencaoInicial().catch(() => null);
      if (!cfg) return;
      const btn = document.getElementById('manut-btn-salvar');
      if (cfg.manutencao) {
        if (btn) btn.style.display = 'none';
        mostrarOverlay(cfg.mensagem || '');
      } else {
        if (btn) btn.style.display = '';
        esconderOverlay();
      }
    };
    tick();
    _guestPollInterval = setInterval(tick, 5000);
  }

  function pararPollingConvidado() {
    if (_guestPollInterval) { clearInterval(_guestPollInterval); _guestPollInterval = null; }
  }

  /* ════════════════════════════════════════════════
     POLLING GLOBAL (usuário logado)
  ════════════════════════════════════════════════ */
  async function iniciarPolling(uid) {
    pararPolling();
    if (!uid) return;
    console.log('[Manutencao] 🚀 iniciarPolling uid:', uid, '| _isAdmin:', isAdmin(), '| ADMIN:', !!window.ADMIN);

    /* Aguarda window.ADMIN — até 15s (mobile lento) */
    if (!window.ADMIN) {
      console.warn('[Manutencao] ⚠️ ADMIN indisponível — aguardando 15s...');
      let t = 0;
      while (!window.ADMIN && t < 150) { await new Promise(r => setTimeout(r, 100)); t++; }
      console.log(window.ADMIN
        ? `[Manutencao] ✅ ADMIN carregou após ${t*100}ms`
        : '[Manutencao] ❌ ADMIN não carregou — fallback REST');
    }

    /* ── FALLBACK: sem window.ADMIN ── */
    if (!window.ADMIN) {
      /* Aguarda adminCheck terminar — até 25s */
      if (_adminCheckPending) {
        console.log('[Manutencao] ⏳ Aguardando adminCheck...');
        let t = 0;
        while (_adminCheckPending && t < 250) { await new Promise(r => setTimeout(r, 100)); t++; }
        console.log('[Manutencao] adminCheck concluído após', t*100, 'ms | _isAdmin:', isAdmin());
      }

      const tickLeve = async () => {
        /* Recheck: ADMIN pode ter carregado depois */
        if (!isAdmin() && uid && window.ADMIN) {
          const ok = await window.ADMIN.verificarAdmin(uid).catch(() => undefined);
          if (ok === true) { window._isAdmin = true; console.log('[Manutencao/Leve] ✅ admin confirmado via recheck'); }
        }
        const cfg = await _verificarManutencaoInicial().catch(() => null);
        if (!cfg) return;
        if (cfg.manutencao && !isAdmin() && !_adminCheckPending) {
          mostrarOverlay(cfg.mensagem || '');
        } else {
          if (cfg.manutencao && isAdmin()) console.log('[Manutencao/Leve] ✅ manutenção ativa mas admin — bloqueado');
          esconderOverlay();
        }
      };
      await tickLeve();
      _globalPollInterval = setInterval(tickLeve, 5000);
      return;
    }

    /* ── CAMINHO NORMAL: usa window.ADMIN ── */
    const tick = async () => {
      try {
        const player = getPlayer();

        /* 1. Ban */
        if (!isAdmin()) {
          const banido = await window.ADMIN.verificarBan(uid);
          if (banido) {
            if (typeof _forcarSaida === 'function')
              _forcarSaida('🚫 Sua conta foi suspensa pelo administrador.');
            return;
          }
        }

        /* 2. Manutenção + config global */
        const cfg = await window.ADMIN.verificarMensagemGlobal();
        if (!cfg) return;
        if (typeof _atualizarModoSala === 'function') _atualizarModoSala(cfg);

        if (cfg.manutencao && !isAdmin()) {
          /* Recheck admin antes de bloquear */
          if (player?.uid && !_adminCheckPending) {
            const recheck = await window.ADMIN.verificarAdmin(player.uid).catch(() => false);
            if (recheck) { window._isAdmin = true; esconderOverlay(); return; }
          }
          /* Lista de liberados */
          const liberado = Array.isArray(cfg.liberados) && player?.uid && cfg.liberados.includes(player.uid);
          if (!liberado) { mostrarOverlay(cfg.mensagem || ''); return; }
        } else if (cfg.manutencao && isAdmin()) {
          console.log('[Manutencao/Tick] ✅ manutenção ativa mas admin — overlay bloqueado');
        }

        esconderOverlay();

        /* 3. Mensagem global */
        const ultima = window._ultimaMensagemGlobal || '';
        if (cfg.mensagem && cfg.mensagem !== ultima) {
          window._ultimaMensagemGlobal = cfg.mensagem;
          if (typeof mostrarSucesso === 'function') mostrarSucesso(cfg.mensagem);
        }

        /* 4. Forçar atualização */
        if (cfg.forcarAtualizacao && cfg.forcarAtualizacao !== window._versaoAtual) {
          if (typeof _mostrarToastAtualizacao === 'function') _mostrarToastAtualizacao(true);
          return;
        }

        /* 5. Nova versão via version.json */
        if (window._versaoAtual) {
          const rv = await fetch('/version.json?t=' + Date.now());
          if (rv.ok) {
            const v = await rv.json();
            if (v.hash && v.hash !== window._versaoAtual)
              if (typeof _mostrarToastAtualizacao === 'function') _mostrarToastAtualizacao(false);
          }
        }

      } catch(e) { /* ignora erros de rede temporários */ }
    };

    await tick();
    _globalPollInterval = setInterval(tick, 5000);
  }

  function pararPolling() {
    if (_globalPollInterval) { clearInterval(_globalPollInterval); _globalPollInterval = null; }
  }

  /* ── API pública ─────────────────────────────────── */
  window.Maintenance = {
    iniciarPolling,
    pararPolling,
    iniciarPollingConvidado,
    pararPollingConvidado,
    mostrarOverlay,
    esconderOverlay,
    salvarSair,
    setAdminCheckPending: (v) => { _adminCheckPending = !!v; },
  };

})();
