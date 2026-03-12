/* ════════════════════════════════════════════════════
   UNDER PRESSURE — PAINEL ADMIN
   Todas as consultas via REST API do Firestore
════════════════════════════════════════════════════ */

const ADMIN = (() => {

  const PROJECT_ID = 'under-pressure-49320';
  const FS = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/default/documents`;

  let _adminUids = [];
  let _currentSection = 'visao-geral';

  /* ── TOKEN ─────────────────────────────────────── */
  async function _token() {
    console.log('[ADMIN] _token: chamando GSPAuth.getToken...');
    const tok = await window.GSPAuth?.getToken();
    console.log('[ADMIN] _token resultado:', tok ? 'token ok' : 'NULL - usuário não autenticado');
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
      // Total jogadores
      const jogadores = await _query({
        structuredQuery: {
          from: [{ collectionId: 'usuarios' }],
          select: { fields: [{ fieldPath: 'nome' }, { fieldPath: 'mandatos' }, { fieldPath: 'melhorScore' }] }
        }
      });

      const docs = jogadores.filter(r => r.document);
      const total = docs.length;
      const scores = docs.map(r => _val(r.document.fields?.melhorScore) || 0);
      const mediaScore = total ? Math.round(scores.reduce((a,b)=>a+b,0) / total) : 0;

      // Partidas recentes do pódio
      const podioRes = await _query({
        structuredQuery: {
          from: [{ collectionId: 'podio' }],
          select: { fields: [{ fieldPath: 'ts' }, { fieldPath: 'sector' }] }
        }
      });

      const podioItems = podioRes.filter(r => r.document).map(r => _parseFields(r.document.fields));
      const agora = Date.now();
      const dia  = podioItems.filter(p => (agora - (p.ts || 0)) < 86400000).length;
      const semana = podioItems.filter(p => (agora - (p.ts || 0)) < 604800000).length;

      document.getElementById('admin-total-jogadores').textContent = total;
      document.getElementById('admin-total-partidas').textContent = podioItems.length;
      document.getElementById('admin-partidas-dia').textContent = dia;
      document.getElementById('admin-partidas-semana').textContent = semana;
      document.getElementById('admin-score-medio').textContent = mediaScore;

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
            <button class="admin-btn-sm ${j.banido ? 'admin-btn-ok' : 'admin-btn-danger'}" onclick="ADMIN.toggleBan('${j.uid}', ${!!j.banido})">
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
    modalTitle.textContent = `📋 Histórico de ${nome}`;
    modalBody.innerHTML = '<div class="admin-loading">Carregando...</div>';
    modal.style.display = 'flex';

    try {
      const tok = await _token();
      const url = `${FS}/usuarios/${uid}/historico?pageSize=20&orderBy=ts desc`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
      const data = await r.json();
      const docs = (data.documents || []).map(d => _parseFields(d.fields));

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
    try {
      await _patch(`usuarios/${uid}`, { banido: _fsBool(!estaBanido) });
      _showAdminToast(estaBanido ? 'Jogador desbanido!' : 'Jogador banido!');
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
            { fieldPath: 'nome' }, { fieldPath: 'score' },
            { fieldPath: 'sector' }, { fieldPath: 'companyName' }, { fieldPath: 'ts' }
          ]}
        }
      });

      const items = res.filter(r => r.document).map(r => {
        const uid = r.document.name.split('/').pop();
        return { uid, ..._parseFields(r.document.fields) };
      }).sort((a,b) => (b.score||0) - (a.score||0));

      const lista = document.getElementById('admin-podio-lista');
      if (!items.length) {
        lista.innerHTML = '<div class="admin-empty">Pódio vazio.</div>';
        return;
      }

      lista.innerHTML = items.map((p, i) => `
        <div class="admin-podio-row">
          <div class="admin-podio-pos">#${i+1}</div>
          <div class="admin-podio-info">
            <div class="admin-podio-nome">${p.nome || '—'}</div>
            <div class="admin-podio-detalhe">${p.companyName || '—'} · ${p.sector || '—'} · ${p.ts ? new Date(p.ts).toLocaleDateString('pt-BR') : '—'}</div>
          </div>
          <div class="admin-podio-score">${p.score || 0}</div>
          <button class="admin-btn-sm admin-btn-danger" onclick="ADMIN.removerDoPodio('${p.uid}', '${(p.nome||'').replace(/'/g,"\\'")}')">🗑️</button>
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
    const setor = document.getElementById('admin-setor-reset')?.value;
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

  /* ── CONTEÚDO DO JOGO ───────────────────────────── */
  async function carregarConteudo() {
    _setLoading('admin-conteudo-body', true);
    try {
      const res = await _query({
        structuredQuery: {
          from: [{ collectionId: 'podio' }],
          select: { fields: [{ fieldPath: 'sector' }, { fieldPath: 'score' }] }
        }
      });

      const items = res.filter(r => r.document).map(r => _parseFields(r.document.fields));
      const setores = {};
      for (const item of items) {
        const s = item.sector || 'outros';
        if (!setores[s]) setores[s] = { count: 0, totalScore: 0 };
        setores[s].count++;
        setores[s].totalScore += (item.score || 0);
      }

      const body = document.getElementById('admin-conteudo-body');
      const rows = Object.entries(setores).sort((a,b) => b[1].count - a[1].count).map(([setor, d]) => `
        <div class="admin-conteudo-row">
          <div class="admin-conteudo-setor">${_emojiSetor(setor)} ${setor}</div>
          <div class="admin-conteudo-stat">${d.count} partidas</div>
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
    } catch(e) {
      // Documento pode não existir ainda, tudo bem
    }
  }

  async function salvarConfigGlobal() {
    const msg = document.getElementById('admin-msg-global')?.value || '';
    const manutencao = document.getElementById('admin-manutencao')?.checked || false;
    try {
      await _patch('config/global', {
        mensagem: _fsStr(msg),
        manutencao: _fsBool(manutencao)
      });
      _showAdminToast('Configurações salvas!');
    } catch(e) {
      _showAdminToast('Erro: ' + e.message, true);
    }
  }

  /* ── VERIFICAR BAN NO BOOT ──────────────────────── */
  async function verificarBan(uid) {
    try {
      const doc = await _get(`usuarios/${uid}`);
      return !!_val(doc.fields?.banido);
    } catch(e) {
      return false;
    }
  }

  async function verificarMensagemGlobal() {
    try {
      const doc = await _get('config/global');
      const fields = _parseFields(doc.fields || {});
      if (fields.manutencao) return { manutencao: true };
      if (fields.mensagem) return { mensagem: fields.mensagem };
    } catch(e) {}
    return null;
  }

  /* ── UI HELPERS ─────────────────────────────────── */
  function _setLoading(id, on) {
    const el = document.getElementById(id);
    if (!el) return;
    if (on) el.innerHTML = '<div class="admin-loading">⏳ Carregando...</div>';
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

    // Carrega dados da seção
    if (id === 'visao-geral')  carregarVisaoGeral();
    if (id === 'jogadores')    carregarJogadores();
    if (id === 'podio')        carregarPodioAdmin();
    if (id === 'conteudo')     carregarConteudo();
    if (id === 'config')       carregarConfigGlobal();
  }

  function fecharModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.style.display = 'none';
  }

  return {
    verificarAdmin,
    verificarBan,
    verificarMensagemGlobal,
    irParaSecao,
    carregarJogadores,
    verHistoricoJogador,
    toggleBan,
    removerDoPodio,
    resetarPodioPorSetor,
    salvarConfigGlobal,
    fecharModal,
  };

})();

window.ADMIN = ADMIN;
