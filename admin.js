/* ════════════════════════════════════════════════════
   UNDER PRESSURE — PAINEL ADMIN
   Todas as consultas via REST API do Firestore
════════════════════════════════════════════════════ */

const ADMIN = (() => {

  const PROJECT_ID = 'under-pressure-49320';
  const FS = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/default/documents`;

  let _adminUids = [];
  let _currentSection = 'visao-geral';
  let _setorSelecionado = '';  // setor ativo no dropdown do pódio
  let _banUid = '';            // uid do jogador sendo analisado no modal de ban

  /* ── TOKEN ─────────────────────────────────────── */
  async function _token() {
    const tok = await window.GSPAuth?.getToken();
    if (!tok) throw new Error('Não autenticado');
    return tok;
  }

  async function _get(path) {
    const tok = await _token();
    const r = await fetch(`${FS}/${path}`, { headers: { Authorization: `Bearer ${tok}` } });
    if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
    return r.json();
  }

  async function _patch(path, fields) {
    const tok = await _token();
    const keys = Object.keys(fields);
    const mask = keys.map(k => `updateMask.fieldPaths=${k}`).join('&');
    const r = await fetch(`${FS}/${path}?${mask}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    if (!r.ok) throw new Error(`PATCH ${path} → ${r.status}`);
    return r.json();
  }

  async function _delete(path) {
    const tok = await _token();
    const r = await fetch(`${FS}/${path}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok}` } });
    if (!r.ok) throw new Error(`DELETE ${path} → ${r.status}`);
  }

  async function _query(body) {
    const tok = await _token();
    const r = await fetch(`${FS}:runQuery`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(`query → ${r.status}`);
    return r.json();
  }

  /* ── PARSE FIRESTORE VALUE ──────────────────────── */
  function _val(v) {
    if (!v) return null;
    if (v.stringValue  !== undefined) return v.stringValue;
    if (v.integerValue !== undefined) return parseInt(v.integerValue);
    if (v.doubleValue  !== undefined) return parseFloat(v.doubleValue);
    if (v.booleanValue !== undefined) return v.booleanValue;
    if (v.timestampValue !== undefined) return new Date(v.timestampValue).getTime();
    if (v.arrayValue)  return (v.arrayValue.values || []).map(_val);
    if (v.mapValue)    return _parseFields(v.mapValue.fields || {});
    return null;
  }

  function _parseFields(fields) {
    const obj = {};
    for (const k in fields) obj[k] = _val(fields[k]);
    return obj;
  }

  function _fsStr(v)  { return { stringValue: String(v) }; }
  function _fsBool(v) { return { booleanValue: !!v }; }
  function _fsInt(v)  { return { integerValue: String(parseInt(v)) }; }

  /* ── VERIFICAR ADMIN ────────────────────────────── */
  async function verificarAdmin(uid) {
    try {
      const doc = await _get('config/admins');
      const uids = _val(doc.fields?.uids) || [];
      _adminUids = uids;
      return uids.includes(uid);
    } catch(e) {
      console.error('[ADMIN] Erro ao verificar admin:', e);
      return false;
    }
  }

  /* ── VISÃO GERAL ────────────────────────────────── */
  async function carregarVisaoGeral() {
    _setLoading('admin-visao-geral', true);
    try {
      // Total de jogadores registrados
      const jogadores = await _query({
        structuredQuery: {
          from: [{ collectionId: 'usuarios' }],
          select: { fields: [{ fieldPath: 'melhorScore' }] }
        }
      });
      const docs = jogadores.filter(r => r.document);
      const total = docs.length;
      const scores = docs.map(r => _val(r.document.fields?.melhorScore) || 0);
      const mediaScore = total ? Math.round(scores.reduce((a,b)=>a+b,0) / total) : 0;

      // Dados do pódio: total real de partidas (soma de totalJogos) + atividade recente
      const podioRes = await _query({
        structuredQuery: {
          from: [{ collectionId: 'podio' }],
          select: { fields: [{ fieldPath: 'totalJogos' }, { fieldPath: 'ultimaPartida' }] }
        }
      });
      const podioItems = podioRes.filter(r => r.document).map(r => _parseFields(r.document.fields));
      const totalPartidas = podioItems.reduce((acc, p) => acc + (p.totalJogos || 0), 0);
      const agora = Date.now();
      const ativosDia    = podioItems.filter(p => (agora - (p.ultimaPartida || 0)) < 86400000).length;
      const ativosSemana = podioItems.filter(p => (agora - (p.ultimaPartida || 0)) < 604800000).length;

      document.getElementById('admin-total-jogadores').textContent = total;
      document.getElementById('admin-total-partidas').textContent  = totalPartidas;
      document.getElementById('admin-partidas-dia').textContent    = ativosDia;
      document.getElementById('admin-partidas-semana').textContent = ativosSemana;
      document.getElementById('admin-score-medio').textContent     = mediaScore;

    } catch(e) {
      _showAdminError('admin-visao-geral', 'Erro ao carregar dados: ' + e.message);
    }
    _setLoading('admin-visao-geral', false);
  }

  /* ── JOGADORES ──────────────────────────────────── */
  async function carregarJogadores(busca = '') {
    _setLoading('admin-jogadores-lista', true);
    try {
      const res = await _query({
        structuredQuery: {
          from: [{ collectionId: 'usuarios' }],
          select: { fields: [
            { fieldPath: 'nome' }, { fieldPath: 'email' },
            { fieldPath: 'mandatos' }, { fieldPath: 'melhorScore' },
            { fieldPath: 'banido' }
          ]}
        }
      });

      let jogadores = res.filter(r => r.document).map(r => {
        const uid = r.document.name.split('/').pop();
        return { uid, ..._parseFields(r.document.fields) };
      });

      if (busca) {
        const b = busca.toLowerCase();
        jogadores = jogadores.filter(j =>
          (j.nome||'').toLowerCase().includes(b) ||
          (j.email||'').toLowerCase().includes(b)
        );
      }
      jogadores.sort((a,b) => (b.melhorScore||0) - (a.melhorScore||0));

      const lista = document.getElementById('admin-jogadores-lista');
      if (!jogadores.length) {
        lista.innerHTML = '<div class="admin-empty">Nenhum jogador encontrado.</div>';
        return;
      }

      lista.innerHTML = jogadores.map(j => `
        <div class="admin-jogador-row ${j.banido ? 'banido' : ''}" data-uid="${j.uid}">
          <div class="admin-jogador-info">
            <div class="admin-jogador-nome">${j.nome || 'Sem nome'} ${j.banido ? '<span class="admin-ban-badge">BANIDO</span>' : ''}</div>
            <div class="admin-jogador-email">${j.email || 'Convidado'}</div>
            <div class="admin-jogador-stats">${j.mandatos || 0} mandatos · Melhor: ${j.melhorScore || 0} pts</div>
          </div>
          <div class="admin-jogador-acoes">
            <button class="admin-btn-sm" onclick="ADMIN.verHistoricoJogador('${j.uid}', '${(j.nome||'').replace(/'/g,"\\'")}')">📋 Histórico</button>
            <button class="admin-btn-sm ${j.banido ? 'admin-btn-ok' : 'admin-btn-danger'}" onclick="ADMIN.abrirModalBan('${j.uid}', '${(j.nome||'').replace(/'/g,"\'")}', ${!!j.banido})">
              ${j.banido ? '✅ Desbanir' : '🚫 Banir'}
            </button>
          </div>
        </div>
      `).join('');

    } catch(e) {
      _showAdminError('admin-jogadores-lista', 'Erro: ' + e.message);
    }
    _setLoading('admin-jogadores-lista', false);
  }

  async function verHistoricoJogador(uid, nome) {
    const modal = document.getElementById('admin-modal');
    const modalBody = document.getElementById('admin-modal-body');
    const modalTitle = document.getElementById('admin-modal-title');
    modalTitle.textContent = `Histórico de ${nome}`;
    modalBody.innerHTML = '<div class="admin-loading">Carregando...</div>';
    modal.style.display = 'flex';

    try {
      const tok = await _token();
      // FIX: consulta direto na subcoleção do usuário, sem collection group nem filtro por uid
      const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/default/documents/usuarios/${uid}:runQuery`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'historico' }],
            orderBy: [{ field: { fieldPath: 'ts' }, direction: 'DESCENDING' }],
            limit: 30
          }
        })
      });
      const data = await r.json();
      const docs = (Array.isArray(data) ? data : [])
        .filter(row => row.document)
        .map(row => _parseFields(row.document.fields));

      if (!docs.length) {
        modalBody.innerHTML = '<div class="admin-empty">Nenhuma partida registrada.</div>';
        return;
      }

      modalBody.innerHTML = docs.map(d => `
        <div class="admin-hist-row">
          <div class="admin-hist-empresa">${d.companyName || '—'} <span class="admin-hist-setor">${d.sector || '—'}</span></div>
          <div class="admin-hist-score">${d.score || 0} pts</div>
          <div class="admin-hist-data">${d.ts ? new Date(d.ts).toLocaleDateString('pt-BR') : '—'}</div>
        </div>
      `).join('');
    } catch(e) {
      modalBody.innerHTML = `<div class="admin-empty">Erro: ${e.message}</div>`;
    }
  }

  async function toggleBan(uid, estaBanido) {
    const acao = estaBanido ? 'desbanir' : 'banir';
    if (!confirm(`Tem certeza que deseja ${acao} este jogador?`)) return;
    _showAdminToast('Processando...');
    try {
      const patchR = await fetch(`${FS}/usuarios/${uid}?updateMask.fieldPaths=banido`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${await _token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { banido: _fsBool(!estaBanido) } })
      });
      if (!patchR.ok) {
        const errBody = await patchR.text();
        let msg = `HTTP ${patchR.status}`;
        if (patchR.status === 403) msg = 'Permissão negada — redeploy as regras do Firestore';
        else if (patchR.status === 404) msg = 'Usuário não encontrado no Firestore';
        else msg += ': ' + errBody.slice(0, 100);
        throw new Error(msg);
      }
      _showAdminToast(estaBanido ? '✅ Jogador desbanido!' : '🚫 Jogador banido!');
      carregarJogadores(document.getElementById('admin-busca')?.value || '');
    } catch(e) {
      _showAdminToast('Erro: ' + e.message, true);
    }
  }

  /* ── PÓDIO ──────────────────────────────────────── */
  async function carregarPodioAdmin() {
    _setLoading('admin-podio-lista', true);
    try {
      const res = await _query({
        structuredQuery: {
          from: [{ collectionId: 'podio' }],
          select: { fields: [
            { fieldPath: 'player' }, { fieldPath: 'melhorScore' },
            { fieldPath: 'totalJogos' }, { fieldPath: 'ultimaPartida' }
          ]}
        }
      });
      const items = res.filter(r => r.document).map(r => {
        const uid = r.document.name.split('/').pop();
        return { uid, ..._parseFields(r.document.fields) };
      }).sort((a,b) => (b.melhorScore||0) - (a.melhorScore||0));

      const lista = document.getElementById('admin-podio-lista');
      if (!items.length) {
        lista.innerHTML = '<div class="admin-empty">Pódio vazio.</div>';
        return;
      }
      lista.innerHTML = items.map((p, i) => `
        <div class="admin-podio-row">
          <div class="admin-podio-pos">#${i+1}</div>
          <div class="admin-podio-info">
            <div class="admin-podio-nome">${p.player || '—'}</div>
            <div class="admin-podio-detalhe">${p.totalJogos || 0} jogos · ${p.ultimaPartida ? new Date(p.ultimaPartida).toLocaleDateString('pt-BR') : '—'}</div>
          </div>
          <div class="admin-podio-score">${p.melhorScore || 0}</div>
          <button class="admin-btn-sm admin-btn-danger" onclick="ADMIN.removerDoPodio('${p.uid}', '${(p.player||'').replace(/'/g,"\\'")}')">🗑️</button>
        </div>
      `).join('');
    } catch(e) {
      _showAdminError('admin-podio-lista', 'Erro: ' + e.message);
    }
    _setLoading('admin-podio-lista', false);
  }

  async function removerDoPodio(uid, nome) {
    if (!confirm(`Remover ${nome} do pódio?`)) return;
    try {
      await _delete(`podio/${uid}`);
      _showAdminToast('Entrada removida do pódio!');
      carregarPodioAdmin();
    } catch(e) {
      _showAdminToast('Erro: ' + e.message, true);
    }
  }

  async function resetarPodioPorSetor() {
    const setor = _setorSelecionado;
    if (!setor) { _showAdminToast('Selecione um setor.', true); return; }
    if (!confirm(`Resetar pódio de ${setor}? Isso remove todas as entradas desse setor.`)) return;
    try {
      const res = await _query({
        structuredQuery: {
          from: [{ collectionId: 'podio' }],
          where: { fieldFilter: { field: { fieldPath: 'sector' }, op: 'EQUAL', value: { stringValue: setor } } }
        }
      });
      const docs = res.filter(r => r.document);
      for (const d of docs) {
        const uid = d.document.name.split('/').pop();
        await _delete(`podio/${uid}`);
      }
      _showAdminToast(`${docs.length} entradas de ${setor} removidas!`);
      carregarPodioAdmin();
    } catch(e) {
      _showAdminToast('Erro: ' + e.message, true);
    }
  }

  /* ── SETORES ────────────────────────────────────── */
  async function carregarSetores() {
    _setLoading('admin-conteudo-body', true);
    try {
      const res = await _query({
        structuredQuery: {
          from: [{ collectionId: 'podio' }],
          select: { fields: [{ fieldPath: 'melhorPorSetor' }, { fieldPath: 'totalJogos' }] }
        }
      });
      const docs = res.filter(r => r.document).map(r => _parseFields(r.document.fields));
      const setores = {};
      for (const doc of docs) {
        const mps = doc.melhorPorSetor || {};
        for (const [setor, dados] of Object.entries(mps)) {
          if (!setores[setor]) setores[setor] = { count: 0, totalScore: 0 };
          setores[setor].count++;
          setores[setor].totalScore += (dados.score || 0);
        }
      }
      const body = document.getElementById('admin-conteudo-body');
      const rows = Object.entries(setores).sort((a,b) => b[1].count - a[1].count).map(([setor, d]) => `
        <div class="admin-conteudo-row">
          <div class="admin-conteudo-setor">${_emojiSetor(setor)} ${setor.charAt(0).toUpperCase() + setor.slice(1)}</div>
          <div class="admin-conteudo-stat">${d.count} jogadores</div>
          <div class="admin-conteudo-stat">Média: ${Math.round(d.totalScore / d.count)} pts</div>
        </div>
      `).join('');
      body.innerHTML = rows || '<div class="admin-empty">Sem dados ainda.</div>';
    } catch(e) {
      _showAdminError('admin-conteudo-body', 'Erro: ' + e.message);
    }
    _setLoading('admin-conteudo-body', false);
  }

  function _emojiSetor(s) {
    const map = { tecnologia:'🚀', varejo:'🛒', logistica:'🚛', industria:'🏭' };
    return map[s] || '🏢';
  }

  /* ── CONFIGURAÇÕES GLOBAIS ──────────────────────── */
  async function carregarConfigGlobal() {
    try {
      const doc = await _get('config/global');
      const fields = _parseFields(doc.fields || {});
      const msgEl = document.getElementById('admin-msg-global');
      const mntEl = document.getElementById('admin-manutencao');
      if (msgEl) msgEl.value = fields.mensagem || '';
      if (mntEl) mntEl.checked = !!fields.manutencao;
      _atualizarBannerManutencao(!!fields.manutencao);
    } catch(e) { /* doc pode não existir */ }
    carregarAdmins();
  }

  function _atualizarBannerManutencao(ativo) {
    const banner = document.getElementById('admin-manutencao-banner');
    if (banner) banner.style.display = ativo ? 'flex' : 'none';
  }

  async function salvarConfigGlobal() {
    const msg = document.getElementById('admin-msg-global')?.value || '';
    const manutencao = document.getElementById('admin-manutencao')?.checked || false;
    const btnSalvar = document.getElementById('btn-salvar-config');
    if (btnSalvar) { btnSalvar.disabled = true; btnSalvar.textContent = '⏳ Salvando...'; }
    try {
      const tok = await _token();
      // FIX: `r` em vez de `patchR` (bug original causava ReferenceError)
      const r = await fetch(
        `${FS}/config/global?updateMask.fieldPaths=mensagem&updateMask.fieldPaths=manutencao`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: {
            mensagem:   _fsStr(msg),
            manutencao: _fsBool(manutencao)
          }})
        }
      );
      if (!r.ok) {
        const errBody = await r.text();
        throw new Error(r.status === 403
          ? 'Permissão negada — redeploy as regras do Firestore'
          : `HTTP ${r.status}: ${errBody.slice(0,80)}`);
      }
      _atualizarBannerManutencao(manutencao);
      const statusMsg = manutencao
        ? '🔧 Manutenção ATIVADA — jogadores serão expulsos em até 5s'
        : msg ? '📢 Mensagem global salva' : '✅ Configurações salvas';
      _showAdminToast(statusMsg);
    } catch(e) {
      _showAdminToast('Erro: ' + e.message, true);
    } finally {
      if (btnSalvar) { btnSalvar.disabled = false; btnSalvar.textContent = '💾 Salvar'; }
    }
  }

  /* ── GERENCIAMENTO DE ADMINS ────────────────────── */
  async function carregarAdmins() {
    const container = document.getElementById('admin-admins-lista');
    if (!container) return;
    container.innerHTML = '<div class="admin-loading">Carregando...</div>';
    try {
      const doc = await _get('config/admins');
      const uids = _val(doc.fields?.uids) || [];
      _adminUids = uids;
      if (!uids.length) {
        container.innerHTML = '<div class="admin-empty">Nenhum admin cadastrado.</div>';
        return;
      }
      container.innerHTML = uids.map(uid => `
        <div class="admin-uid-row">
          <span class="admin-uid-text">${uid}</span>
          <button class="admin-btn-sm admin-btn-danger" onclick="ADMIN.removerAdmin('${uid}')">✕</button>
        </div>
      `).join('');
    } catch(e) {
      container.innerHTML = '<div class="admin-empty">Sem admins cadastrados.</div>';
    }
  }

  async function adicionarAdmin() {
    const input = document.getElementById('admin-novo-uid');
    const uid = input?.value?.trim();
    if (!uid) { _showAdminToast('Digite um UID válido.', true); return; }
    if (_adminUids.includes(uid)) { _showAdminToast('Já é admin.', true); return; }
    try {
      const uids = [..._adminUids, uid];
      const tok = await _token();
      const r = await fetch(`${FS}/config/admins?updateMask.fieldPaths=uids`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: {
          uids: { arrayValue: { values: uids.map(u => ({ stringValue: u })) } }
        }})
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      _adminUids = uids;
      if (input) input.value = '';
      _showAdminToast('✅ Admin adicionado!');
      carregarAdmins();
    } catch(e) {
      _showAdminToast('Erro: ' + e.message, true);
    }
  }

  async function removerAdmin(uid) {
    if (!confirm(`Remover ${uid} dos admins?`)) return;
    try {
      const uids = _adminUids.filter(u => u !== uid);
      const tok = await _token();
      const r = await fetch(`${FS}/config/admins?updateMask.fieldPaths=uids`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: {
          uids: { arrayValue: { values: uids.map(u => ({ stringValue: u })) } }
        }})
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      _adminUids = uids;
      _showAdminToast('Admin removido.');
      carregarAdmins();
    } catch(e) {
      _showAdminToast('Erro: ' + e.message, true);
    }
  }

  /* ── DROPDOWN CUSTOMIZADO (pódio) ──────────────── */
  function toggleDropdown() {
    const menu = document.getElementById('admin-setor-menu');
    const dropdown = document.getElementById('admin-setor-dropdown');
    if (!menu) return;
    const isOpen = menu.style.display !== 'none';
    menu.style.display = isOpen ? 'none' : 'block';
    dropdown?.classList.toggle('open', !isOpen);
    // Fecha ao clicar fora
    if (!isOpen) {
      const close = (e) => {
        if (!dropdown?.contains(e.target)) {
          menu.style.display = 'none';
          dropdown?.classList.remove('open');
          document.removeEventListener('click', close);
        }
      };
      setTimeout(() => document.addEventListener('click', close), 10);
    }
  }

  function selecionarSetor(valor, label) {
    _setorSelecionado = valor;
    const labelEl = document.getElementById('admin-setor-label');
    if (labelEl) labelEl.textContent = label;
    // Destaca item ativo no menu
    document.querySelectorAll('.admin-dropdown-item').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.trim() === label.trim());
    });
    // Fecha o menu
    const menu = document.getElementById('admin-setor-menu');
    const dropdown = document.getElementById('admin-setor-dropdown');
    if (menu) menu.style.display = 'none';
    dropdown?.classList.remove('open');
  }

  /* ── MODAL MENSAGEM GLOBAL ──────────────────────── */
  async function abrirModalMsg() {
    const modal = document.getElementById('admin-modal-msg');
    if (!modal) return;
    // Carrega valor atual do Firestore
    try {
      const doc = await _get('config/global');
      const fields = _parseFields(doc.fields || {});
      const el = document.getElementById('admin-msg-global');
      if (el) el.value = fields.mensagem || '';
      _atualizarPreviewMsg(fields.mensagem || '');
    } catch(e) {}
    modal.style.display = 'flex';
    // Atualiza preview ao digitar
    const ta = document.getElementById('admin-msg-global');
    if (ta) ta.oninput = () => _atualizarPreviewMsg(ta.value);
  }

  function _atualizarPreviewMsg(texto) {
    const preview = document.getElementById('admin-msg-preview');
    const previewText = document.getElementById('admin-msg-preview-text');
    if (!preview || !previewText) return;
    if (texto.trim()) {
      preview.style.display = 'block';
      previewText.textContent = texto;
    } else {
      preview.style.display = 'none';
    }
  }

  function fecharModalMsg() {
    const modal = document.getElementById('admin-modal-msg');
    if (modal) modal.style.display = 'none';
  }

  async function salvarMensagemGlobal() {
    const msg = document.getElementById('admin-msg-global')?.value || '';
    const btn = document.getElementById('btn-salvar-msg');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Enviando...'; }
    try {
      const tok = await _token();
      const r = await fetch(
        `${FS}/config/global?updateMask.fieldPaths=mensagem`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: { mensagem: _fsStr(msg) }})
        }
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      fecharModalMsg();
      _showAdminToast(msg ? '📢 Mensagem enviada a todos os jogadores!' : '✅ Mensagem removida.');
    } catch(e) {
      _showAdminToast('Erro: ' + e.message, true);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '📢 Enviar'; }
    }
  }

  async function limparMensagemGlobal() {
    const el = document.getElementById('admin-msg-global');
    if (el) { el.value = ''; _atualizarPreviewMsg(''); }
    await salvarMensagemGlobal();
  }

  /* ── MODAL BANIMENTO ────────────────────────────── */
  const BAN_MOTIVOS = [
    'Comportamento inadequado',
    'Uso indevido do sistema',
    'Violação dos termos de uso',
    'Linguagem ofensiva',
    'Exploração de bugs',
    'Outro (especificar abaixo)',
  ];
  let _banMotivoSelecionado = '';

  async function abrirModalBan(uid, nome, estaBanido) {
    _banUid = uid;
    _banMotivoSelecionado = '';
    _banConfirmPending = false;
    const modal = document.getElementById('admin-modal-ban');
    const title = document.getElementById('admin-ban-title');
    const playerCard = document.getElementById('admin-ban-player-card');
    const statusEl = document.getElementById('admin-ban-status');
    const foot = document.getElementById('admin-ban-foot');
    if (!modal) return;

    title.innerHTML = `<span style="display:flex;align-items:center;gap:8px">${estaBanido
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Desbanir Jogador'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> Banir Jogador'
    }</span>`;

    playerCard.innerHTML = `
      <div class="admin-ban-avatar">${(nome||'?').charAt(0).toUpperCase()}</div>
      <div style="flex:1;min-width:0">
        <div class="admin-ban-nome">${nome || 'Sem nome'}</div>
        <div class="admin-ban-uid">${uid}</div>
      </div>`;

    statusEl.innerHTML = estaBanido
      ? '<div class="admin-ban-badge-ativo">Jogador atualmente BANIDO</div>'
      : '<div class="admin-ban-badge-livre">Jogador com acesso normal</div>';

    // Área de motivo — só para banir (não para desbanir)
    const motivoSection = document.getElementById('admin-ban-motivo-section');
    if (motivoSection) {
      if (estaBanido) {
        motivoSection.style.display = 'none';
      } else {
        motivoSection.style.display = 'block';
        // Renderiza botões de motivo predefinido
        const motivoGrid = document.getElementById('admin-ban-motivo-grid');
        if (motivoGrid) {
          motivoGrid.innerHTML = BAN_MOTIVOS.map(m => `
            <button class="admin-motivo-btn" onclick="ADMIN.selecionarMotivo('${m.replace(/'/g,"\'")}', this)">${m}</button>
          `).join('');
        }
        // Limpa campo de detalhe
        const detalhe = document.getElementById('admin-ban-detalhe');
        const detalheWrap = document.getElementById('admin-ban-detalhe-wrap');
        if (detalhe) { detalhe.value = ''; _atualizarContadorDetalhe(); }
        if (detalheWrap) detalheWrap.style.display = 'none';
      }
    }

    // Histórico de bans anteriores
    await _carregarHistBanAdmin(uid);

    foot.innerHTML = `
      <button class="admin-btn" style="background:var(--bg3);border:1px solid var(--line2);color:var(--t2)" onclick="ADMIN.fecharModalBan()">Cancelar</button>
      <button id="admin-ban-confirm-btn" class="admin-btn ${estaBanido ? 'admin-btn-ok' : 'admin-btn-danger'}" onclick="ADMIN.confirmarBan('${uid}', ${estaBanido})">
        ${estaBanido ? 'Confirmar Desbanimento' : 'Confirmar Banimento'}
      </button>`;

    modal.style.display = 'flex';
    _carregarHistBan(uid);
  }

  function selecionarMotivo(motivo, btn) {
    _banMotivoSelecionado = motivo;
    document.querySelectorAll('.admin-motivo-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Mostra campo de detalhe livre só para "Outro"
    const detalheWrap = document.getElementById('admin-ban-detalhe-wrap');
    if (detalheWrap) detalheWrap.style.display = motivo.startsWith('Outro') ? 'block' : 'none';
  }

  function _atualizarContadorDetalhe() {
    const detalhe = document.getElementById('admin-ban-detalhe');
    const contador = document.getElementById('admin-ban-detalhe-contador');
    if (detalhe && contador) {
      contador.textContent = `${detalhe.value.length}/200`;
    }
  }

  async function _carregarHistBanAdmin(uid) {
    const section = document.getElementById('admin-ban-hist-admin');
    if (!section) return;
    try {
      const doc = await _get(`usuarios/${uid}`);
      const fields = _parseFields(doc.fields || {});
      const hist = fields.banHistory || [];
      if (!hist.length) { section.style.display = 'none'; return; }
      section.style.display = 'block';
      section.innerHTML = `
        <div class="admin-label" style="margin-bottom:6px">Histórico de banimentos</div>
        ${hist.slice(-3).reverse().map(h => `
          <div class="admin-ban-hist-entry">
            <span class="admin-ban-hist-tipo ${h.tipo === 'ban' ? 'tipo-ban' : 'tipo-unban'}">${h.tipo === 'ban' ? 'Ban' : 'Unban'}</span>
            <span class="admin-ban-hist-motivo">${h.motivo || '—'}</span>
            <span class="admin-ban-hist-data">${h.ts ? new Date(h.ts).toLocaleDateString('pt-BR') : '—'}</span>
          </div>`).join('')}`;
    } catch(e) { section.style.display = 'none'; }
  }

  async function _carregarHistBan(uid) {
    const section = document.getElementById('admin-ban-historico');
    const lista = document.getElementById('admin-ban-hist-lista');
    if (!section || !lista) return;
    lista.innerHTML = '<div class="admin-loading">Carregando...</div>';
    section.style.display = 'block';
    try {
      const tok = await _token();
      const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/default/documents/usuarios/${uid}:runQuery`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'historico' }],
            orderBy: [{ field: { fieldPath: 'ts' }, direction: 'DESCENDING' }],
            limit: 5
          }
        })
      });
      const data = await r.json();
      const docs = (Array.isArray(data) ? data : [])
        .filter(row => row.document)
        .map(row => _parseFields(row.document.fields));
      if (!docs.length) { lista.innerHTML = '<div class="admin-empty" style="padding:8px">Sem partidas registradas.</div>'; return; }
      lista.innerHTML = docs.map(d => `
        <div class="admin-hist-row">
          <div class="admin-hist-empresa">${d.companyName || '—'} <span class="admin-hist-setor">${d.sector || '—'}</span></div>
          <div class="admin-hist-score">${d.score || 0} pts</div>
          <div class="admin-hist-data">${d.ts ? new Date(d.ts).toLocaleDateString('pt-BR') : '—'}</div>
        </div>`).join('');
    } catch(e) {
      lista.innerHTML = '<div class="admin-empty" style="padding:8px">Erro ao carregar.</div>';
    }
  }

  let _banConfirmPending = false;
  let _banConfirmTimer = null;

  async function confirmarBan(uid, estaBanido) {
    // Desbanimento: ação reversível, clique único
    if (estaBanido) {
      await _executarBan(uid, true);
      return;
    }

    // Banimento: requer duplo clique para evitar acidente
    const btn = document.querySelector('#admin-ban-foot .admin-btn-danger');
    if (!btn) return;

    if (!_banConfirmPending) {
      // Primeiro clique — entra em estado de confirmação
      _banConfirmPending = true;
      btn.textContent = '⚠️ Clique novamente para confirmar';
      btn.style.background = 'rgba(231,76,60,.35)';
      btn.style.borderColor = 'var(--err)';
      // Cancela automaticamente após 3s
      _banConfirmTimer = setTimeout(() => {
        _banConfirmPending = false;
        btn.textContent = '🚫 Confirmar Banimento';
        btn.style.background = '';
        btn.style.borderColor = '';
      }, 3000);
    } else {
      // Segundo clique — executa
      clearTimeout(_banConfirmTimer);
      _banConfirmPending = false;
      await _executarBan(uid, false);
    }
  }

  async function _executarBan(uid, estaBanido) {
    // Valida motivo obrigatório para ban
    if (!estaBanido && !_banMotivoSelecionado) {
      _showAdminToast('Selecione um motivo antes de banir.', true);
      return;
    }

    const foot = document.getElementById('admin-ban-foot');
    const btns = foot?.querySelectorAll('button');
    btns?.forEach(b => { b.disabled = true; });

    try {
      const tok = await _token();

      // Determina o motivo final (predefinido + detalhe se "Outro")
      let motivoFinal = _banMotivoSelecionado;
      if (motivoFinal.startsWith('Outro')) {
        const detalhe = document.getElementById('admin-ban-detalhe')?.value?.trim();
        if (detalhe) motivoFinal = detalhe;
        else motivoFinal = 'Outro';
      }

      // Lê banHistory atual para append
      let banHistory = [];
      try {
        const docAtual = await _get(`usuarios/${uid}`);
        banHistory = _val(docAtual.fields?.banHistory) || [];
      } catch(e) {}

      const novaEntrada = {
        tipo: estaBanido ? 'unban' : 'ban',
        motivo: estaBanido ? '' : motivoFinal,
        ts: Date.now(),
      };
      banHistory.push(novaEntrada);

      // Campos a atualizar
      const fieldsUpdate = {
        banido: _fsBool(!estaBanido),
        banHistory: { arrayValue: { values: banHistory.map(e => ({ mapValue: { fields: {
          tipo:   { stringValue: e.tipo },
          motivo: { stringValue: e.motivo || '' },
          ts:     { integerValue: String(e.ts) },
        }}})) }},
      };
      if (!estaBanido) {
        fieldsUpdate.motivoBan = _fsStr(motivoFinal);
      } else {
        fieldsUpdate.motivoBan = _fsStr(''); // limpa o motivo ao desbanir
      }

      const mask = Object.keys(fieldsUpdate).map(k => `updateMask.fieldPaths=${k}`).join('&');
      const patchR = await fetch(`${FS}/usuarios/${uid}?${mask}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsUpdate })
      });

      if (!patchR.ok) {
        const errBody = await patchR.text();
        let msg = `HTTP ${patchR.status}`;
        if (patchR.status === 403) msg = 'Permissão negada — redeploy as regras do Firestore';
        else msg += ': ' + errBody.slice(0, 80);
        throw new Error(msg);
      }

      fecharModalBan();
      _showAdminToast(estaBanido ? 'Jogador desbanido!' : 'Jogador banido!');
      if (_currentSection === 'jogadores') {
        carregarJogadores(document.getElementById('admin-busca')?.value || '');
      }
    } catch(e) {
      _showAdminToast('Erro: ' + e.message, true);
      btns?.forEach(b => { b.disabled = false; });
    }
  }

  function fecharModalBan() {
    const modal = document.getElementById('admin-modal-ban');
    if (modal) modal.style.display = 'none';
    _banUid = '';
  }

  /* ── VERIFICAR BAN / CONFIG GLOBAL ─────────────── */
  async function verificarBan(uid) {
    try {
      const doc = await _get(`usuarios/${uid}`);
      return !!_val(doc.fields?.banido);
    } catch(e) { return false; }
  }

  // Retorna dados de banimento (motivoBan) para o overlay do jogador
  async function _getBanInfo(uid) {
    try {
      const doc = await _get(`usuarios/${uid}`);
      return _parseFields(doc.fields || {});
    } catch(e) { return {}; }
  }

  async function verificarMensagemGlobal() {
    try {
      const doc = await _get('config/global');
      const fields = _parseFields(doc.fields || {});
      return { manutencao: !!fields.manutencao, mensagem: fields.mensagem || '' };
    } catch(e) {
      return { manutencao: false, mensagem: '' };
    }
  }

  /* ── UI HELPERS ─────────────────────────────────── */
  function _setLoading(id, on) {
    const el = document.getElementById(id);
    if (el && on) el.innerHTML = '<div class="admin-loading">Carregando...</div>';
  }

  function _showAdminError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<div class="admin-empty" style="color:var(--err)">${msg}</div>`;
  }

  function _showAdminToast(msg, erro = false) {
    const t = document.getElementById('admin-toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'admin-toast ' + (erro ? 'admin-toast-err' : 'admin-toast-ok');
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 3000);
  }

  /* ── NAVEGAÇÃO ENTRE SEÇÕES ─────────────────────── */
  function irParaSecao(id) {
    _currentSection = id;
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    const sec = document.getElementById('admin-sec-' + id);
    const btn = document.querySelector(`.admin-nav-btn[data-sec="${id}"]`);
    if (sec) sec.style.display = 'block';
    if (btn) btn.classList.add('active');
    if (id === 'visao-geral') carregarVisaoGeral();
    if (id === 'jogadores')   carregarJogadores();
    if (id === 'podio')       carregarPodioAdmin();
    if (id === 'conteudo')    carregarSetores();
    if (id === 'config')      carregarConfigGlobal();
  }

  function fecharModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.style.display = 'none';
  }

  return {
    verificarAdmin, verificarBan, _getBanInfo, verificarMensagemGlobal,
    irParaSecao,
    carregarJogadores, verHistoricoJogador, toggleBan,
    removerDoPodio, resetarPodioPorSetor,
    salvarConfigGlobal,
    adicionarAdmin, removerAdmin,
    fecharModal,
    // Dropdown
    toggleDropdown, selecionarSetor,
    // Modal mensagem global
    abrirModalMsg, fecharModalMsg, salvarMensagemGlobal, limparMensagemGlobal,
    // Modal banimento
    abrirModalBan, fecharModalBan, confirmarBan, selecionarMotivo,
  };

})();

window.ADMIN = ADMIN;
