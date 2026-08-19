

(function () {

  let _globalPollInterval = null;
  let _guestPollInterval  = null;

  const API_KEY = 'AIzaSyB_Zkl12AyT5RMfg9eJ68QFTakdBKSioVU';
  const PROJECT = 'under-pressure-49320';
  const FS      = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/default/documents`;

  
  async function _buscarConfigGlobal() {
    try {
      const r = await fetch(`${FS}/config/global?key=${API_KEY}`);
      if (!r.ok) return null;
      const doc = await r.json();
      const f   = doc.fields || {};
      const _v  = (field) => {
        if (!field) return undefined;
        return field.booleanValue ?? field.stringValue ?? field.integerValue ?? null;
      };
      const _vArr = (field) => {
        if (!field || !field.arrayValue || !Array.isArray(field.arrayValue.values)) return [];
        return field.arrayValue.values.map(v => v && v.stringValue).filter(Boolean);
      };
      return {
        manutencao:       !!_v(f.manutencao),
        mensagem:         _v(f.mensagem)         || '',
        liberados:        _vArr(f.liberados),
      };
    } catch(e) { return null; }
  }

  
  function mostrarOverlay(msgExtra) {
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

  
  async function _tick(uid) {
    try {
      const cfg = await _buscarConfigGlobal();
      if (!cfg) return;

      
      const estaLiberado = !!(uid && cfg.liberados.includes(uid));
      if (cfg.manutencao && !estaLiberado) {
        mostrarOverlay(cfg.mensagem || '');
        return;
      }

      esconderOverlay();

      
      if (!uid) return;

      
      if (window.ADMIN) {
        const banido = await window.ADMIN.verificarBan(uid).catch(() => false);
        if (banido) {
          if (typeof _mostrarOverlayBan === 'function') {
            _mostrarOverlayBan(uid);
          } else if (typeof _forcarSaida === 'function') {
            
            _forcarSaida('🚫 Sua conta foi suspensa pelo administrador.');
          }
          return;
        }
      }

      
      if (typeof _atualizarModoSala === 'function') _atualizarModoSala(cfg);

      
      const ultima = window._ultimaMensagemGlobal || '';
      if (cfg.mensagem && cfg.mensagem !== ultima) {
        window._ultimaMensagemGlobal = cfg.mensagem;
        if (typeof mostrarSucesso === 'function') mostrarSucesso(cfg.mensagem);
      }


      
      if (window._versaoAtual && !window._updateToastVisible) {
        try {
          const rv = await fetch('/version.json?t=' + Date.now());
          if (rv.ok) {
            const v = await rv.json();
            if (v.hash && v.hash !== window._versaoAtual) {
              if (typeof _mostrarToastAtualizacao === 'function') _mostrarToastAtualizacao(false);
            }
          }
        } catch(e) {  }
      }

    } catch(e) {  }
  }

  
  function iniciarPollingConvidado() {
    pararPollingConvidado();
    _tick(null);
    _guestPollInterval = setInterval(() => _tick(null), 5000);
  }

  function pararPollingConvidado() {
    if (_guestPollInterval) { clearInterval(_guestPollInterval); _guestPollInterval = null; }
  }

  
  async function iniciarPolling(uid) {
    pararPolling();
    if (!uid) return;
    await _tick(uid);
    _globalPollInterval = setInterval(() => _tick(uid), 5000);
  }

  function pararPolling() {
    if (_globalPollInterval) { clearInterval(_globalPollInterval); _globalPollInterval = null; }
  }

  
  window.Maintenance = {
    iniciarPolling,
    pararPolling,
    iniciarPollingConvidado,
    pararPollingConvidado,
    mostrarOverlay,
    esconderOverlay,
    salvarSair,
    
    setAdminCheckPending: () => {},
  };

})();
