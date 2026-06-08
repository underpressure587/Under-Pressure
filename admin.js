/* ════════════════════════════════════════════════════
   UNDER PRESSURE — PAINEL ADMIN
   Todas as consultas via REST API do Firestore
════════════════════════════════════════════════════ */

const ADMIN = (() => {

  const PROJECT_ID = 'under-pressure-49320';
  const FS = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/default/documents`;

  let _adminUids = [];
  let _adminOwner = '';          // UID do owner do sistema (protegido)
  let _adminPermissoes = {};     // { uid: ['jogadores','config',...] }
  let _currentSection = 'visao-geral';
  let _setorSelecionado = '';  // setor ativo no dropdown do pódio
  let _banUid = '';            // uid do jogador sendo analisado no modal de ban
  let _adminNomes = {};          // { uid: 'Nome Exibido' }
  let _pollingAdminInterval = null;  // polling de revogação de acesso

  /* ── TOKEN ─────────────────────────────────────── */
  async function _token() {
    // 1. Espera GSPAuth ficar pronto (firebase-config.js é type=module, carrega depois)
    let t = 0;
    while (!window.GSPAuth?.isReady() && t < 50) {
      await new Promise(r => setTimeout(r, 100));
      t++;
    }
    // 2. Espera o usuário autenticado estar disponível (currentUser pode ser null inicialmente)
    if (window.GSPAuth?.waitForAuthReady) {
      await window.GSPAuth.waitForAuthReady();
    }
    // 3. Tenta obter token com retry (até 5s)
    let tok = null;
    for (let i = 0; i < 10; i++) {
      tok = await window.GSPAuth?.getToken().catch(() => null);
      if (tok) break;
      await new Promise(r => setTimeout(r, 500));
    }
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
    if (!uid) { console.warn('[ADMIN] verificarAdmin chamado sem uid'); return false; }

    // — Tentativa 1: RTDB (mais rápido e não sofre de indisponibilidade do Firestore) —
    if (window.GSPRtdb) {
      try {
        const { db, ref, onValue } = window.GSPRtdb;
        const DB_URL = 'https://under-pressure-49320-default-rtdb.firebaseio.com';
        const result = await new Promise((resolve, reject) => {
          const admRef = ref(db, 'config/admins');
          const unsub = onValue(admRef, (snapshot) => {
            unsub(); // leitura única
            resolve(snapshot.val());
          }, (err) => {
            unsub();
            reject(err);
          }, { onlyOnce: true });
        });
        console.log('[ADMIN] verificarAdmin via RTDB — dados recebidos:', JSON.stringify(result));
        if (result) {
          const uids  = Array.isArray(result.uids)  ? result.uids  : [];
          const owner = typeof result.owner === 'string' ? result.owner : '';
          _adminUids  = uids;
          _adminOwner = owner;
          const isAdmin = !!(uids.includes(uid) || uid === owner);
          console.log('[ADMIN] verificarAdmin RTDB | uid:', uid, '| uids:', uids, '| owner:', owner, '| isAdmin:', isAdmin);
          return isAdmin;
        }
        console.warn('[ADMIN] verificarAdmin RTDB: nó config/admins vazio — tentando Firestore...');
      } catch(e) {
        console.warn('[ADMIN] verificarAdmin RTDB falhou:', e?.message, '— tentando Firestore...');
      }
    }

    // — Tentativa 2: Firestore REST (fallback) —
    try {
      const doc = await _get('config/admins');
      console.log('[ADMIN] verificarAdmin via Firestore — doc recebido:', JSON.stringify(doc?.fields));
      if (!doc || !doc.fields) {
        console.warn('[ADMIN] verificarAdmin Firestore: doc.fields indefinido — retornando false');
        return false;
      }
      const uids  = _val(doc.fields?.uids)  || [];
      const owner = _val(doc.fields?.owner) || '';
      _adminUids  = uids;
      _adminOwner = owner;
      const isAdmin = !!(uids.includes(uid) || uid === owner);
      console.log('[ADMIN] verificarAdmin Firestore | uid:', uid, '| uids:', uids, '| owner:', owner, '| isAdmin:', isAdmin);
      return isAdmin;
    } catch(e) {
      console.error('[ADMIN] verificarAdmin Firestore também falhou:', e?.message, e);
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

      // Aplica filtro de status
      if (_filtroJogadores === 'banidos') jogadores = jogadores.filter(j => j.banido);
      if (_filtroJogadores === 'ativos')  jogadores = jogadores.filter(j => !j.banido);

      jogadores.sort((a,b) => (b.melhorScore||0) - (a.melhorScore||0));

      // Atualiza contadores nas abas
      const totalTodos   = res.filter(r => r.document).length;
      const totalBanidos = res.filter(r => r.document && _val(r.document.fields?.banido)).length;
      document.querySelectorAll('.admin-filtro-btn[data-filtro]').forEach(b => {
        const f = b.dataset.filtro;
        if (f === 'todos')   b.textContent = `Todos (${totalTodos})`;
        if (f === 'ativos')  b.textContent = `Ativos (${totalTodos - totalBanidos})`;
        if (f === 'banidos') b.textContent = `Banidos (${totalBanidos})`;
      });

      const lista = document.getElementById('admin-jogadores-lista');
      if (!jogadores.length) {
        lista.innerHTML = '<div class="admin-empty">Nenhum jogador encontrado.</div>';
        return;
      }

      lista.innerHTML = jogadores.map(j => `
        <div class="admin-jogador-row ${j.banido ? 'banido' : ''}" data-uid="${j.uid}" style="display:flex;align-items:flex-start;gap:10px">
          <div style="width:8px;height:8px;border-radius:50%;background:${j.banido ? '#ef4444' : '#22c55e'};flex-shrink:0;margin-top:6px"></div>
          <div class="admin-jogador-info" style="flex:1">
            <div class="admin-jogador-nome">${j.nome || 'Sem nome'} ${j.banido ? '<span class="admin-ban-badge">BANIDO</span>' : ''}</div>
            <div class="admin-jogador-email">${j.email || 'Convidado'}</div>
            <div class="admin-jogador-stats">${j.mandatos || 0} mandatos · Melhor: ${j.melhorScore || 0} pts</div>
          </div>
          <div class="admin-jogador-acoes">
            <button class="admin-btn-sm" onclick="ADMIN.verHistoricoJogador('${j.uid}', '${(j.nome||'').replace(/'/g,"\'")}')">📋 Histórico</button>
            <button class="admin-btn-sm" onclick="ADMIN.abrirModalInbox('${j.uid}', '${(j.nome||'').replace(/'/g,"\\'")}')">✉️ Msg</button>
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

    await _opFeedback({
      etapas: ['Verificando permissões…', `${estaBanido ? 'Removendo' : 'Aplicando'} banimento…`],
      executar: async () => {
        const patchR = await fetch(`${FS}/usuarios/${uid}?updateMask.fieldPaths=banido`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${await _token()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: { banido: _fsBool(!estaBanido) } })
        });
        if (!patchR.ok) { const b = await patchR.text(); throw new Error(`HTTP ${patchR.status}: ${b.slice(0,80)}`); }
      },
      sucesso: estaBanido ? 'Jogador desbanido!' : 'Jogador banido!',
      onSucesso: () => carregarJogadores(document.getElementById('admin-busca')?.value || ''),
    });
  }

  /* ── PÓDIO ──────────────────────────────────────── */
  async function carregarPodioAdmin() {
    _setLoading('admin-podio-lista', true);
    try {
      // Monta query: sem where = todos; com setor = filtrado
      const query = {
        from: [{ collectionId: 'podio' }],
        select: { fields: [
          { fieldPath: 'player' }, { fieldPath: 'melhorScore' },
          { fieldPath: 'totalJogos' }, { fieldPath: 'ultimaPartida' },
          { fieldPath: 'sector' }
        ]}
      };
      if (_setorSelecionado) {
        query.where = { fieldFilter: {
          field: { fieldPath: 'sector' },
          op: 'EQUAL',
          value: { stringValue: _setorSelecionado }
        }};
      }

      const res = await _query({ structuredQuery: query });
      const items = res.filter(r => r.document).map(r => {
        const uid = r.document.name.split('/').pop();
        return { uid, ..._parseFields(r.document.fields) };
      }).sort((a,b) => (b.melhorScore||0) - (a.melhorScore||0));

      // Atualiza contador na toolbar
      const countEl = document.getElementById('admin-podio-count');
      if (countEl) {
        const label = _setorSelecionado
          ? `${items.length} entrada(s) em ${_setorSelecionado}`
          : `${items.length} entrada(s) no total`;
        countEl.textContent = label;
      }

      const lista = document.getElementById('admin-podio-lista');
      if (!items.length) {
        lista.innerHTML = '<div class="admin-empty">Pódio vazio' + (_setorSelecionado ? ' para este setor' : '') + '.</div>';
        return;
      }
      lista.innerHTML = items.map((p, i) => `
        <div class="admin-podio-row">
          <div class="admin-podio-pos">#${i+1}</div>
          <div class="admin-podio-info">
            <div class="admin-podio-nome">${p.player || '—'}</div>
            <div class="admin-podio-detalhe">${p.totalJogos || 0} jogos · ${p.ultimaPartida ? new Date(p.ultimaPartida).toLocaleDateString('pt-BR') : '—'}${p.sector && !_setorSelecionado ? ` · <span style="color:var(--gold2);font-weight:600">${p.sector}</span>` : ''}</div>
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

    await _opFeedback({
      etapas: ['Verificando permissões…', `Removendo ${nome} do pódio…`],
      executar: async () => { await _delete(`podio/${uid}`); },
      sucesso: `${nome} removido do pódio.`,
      onSucesso: () => carregarPodioAdmin(),
    });
  }

  async function resetarPodioPorSetor() {
    const setor = _setorSelecionado;
    if (!setor) { _showAdminToast('Selecione um setor primeiro.', true); return; }
    if (!confirm(`Resetar pódio de "${setor}"?\nIsso remove todas as entradas desse setor e não pode ser desfeito.`)) return;

    let _totalDocs = 0;
    await _opFeedback({
      etapas: [
        'Verificando permissões…',
        `Buscando entradas de ${setor}…`,
        'Removendo registros…',
      ],
      executar: async () => {
        const res  = await _query({
          structuredQuery: {
            from: [{ collectionId: 'podio' }],
            where: { fieldFilter: { field: { fieldPath: 'sector' }, op: 'EQUAL', value: { stringValue: setor } } }
          }
        });
        const docs = res.filter(r => r.document);
        _totalDocs = docs.length;
        for (const d of docs) {
          const uid = d.document.name.split('/').pop();
          await _delete(`podio/${uid}`);
        }
      },
      sucesso: `${_totalDocs} entrada(s) de ${setor} removidas!`,
      onSucesso: () => carregarPodioAdmin(),
    });
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

  /* ── RTDB SYNC: mantém config/admins no RTDB sincronizado ── */
  async function _rtdbSyncAdmins(uids, owner) {
    if (!window.GSPRtdb) return;
    try {
      const { db, ref, set } = window.GSPRtdb;
      await set(ref(db, 'config/admins'), {
        uids:  Array.isArray(uids)          ? uids  : _adminUids,
        owner: typeof owner === 'string'    ? owner : _adminOwner,
      });
      console.log('[ADMIN] RTDB config/admins sincronizado | uids:', uids);
    } catch(e) {
      console.warn('[ADMIN] _rtdbSyncAdmins falhou (não crítico):', e?.message);
    }
  }

  /* ── CONFIGURAÇÕES GLOBAIS ──────────────────────── */
  async function adicionarAdmin() {
    const input = document.getElementById('admin-novo-uid');
    const uid   = input?.value?.trim();
    if (!uid) { _showAdminToast('Digite um UID válido.', true); return; }
    if (_adminUids.includes(uid)) { _showAdminToast('Já é admin.', true); return; }

    await _opFeedback({
      etapas: [
        'Verificando permissões…',
        'Adicionando UID à lista…',
        'Sincronizando banco de dados…',
      ],
      executar: async () => {
        const uids = [..._adminUids, uid];
        const tok  = await _token();
        const r = await fetch(`${FS}/config/admins?updateMask.fieldPaths=uids`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: {
            uids: { arrayValue: { values: uids.map(u => ({ stringValue: u })) } }
          }})
        });
        if (!r.ok) { const b = await r.text(); throw new Error(`HTTP ${r.status}: ${b.slice(0,80)}`); }
        _adminUids = uids;
        await _rtdbSyncAdmins(uids, _adminOwner);
        if (input) input.value = '';
        _registrarAuditoria(`Admin adicionado: ${uid.slice(0,8)}`);
      },
      sucesso: 'Admin adicionado com sucesso!',
      onSucesso: () => _renderAdminLista(),
    });
  }

  async function removerAdmin(uid) {
    if (uid === _adminOwner) { _showAdminToast('Owner não pode ser removido.', true); return; }
    const nomeExib = _adminNomes[uid] || uid.slice(0, 12) + '…';
    if (!confirm(`Remover ${nomeExib} dos admins?`)) return;

    await _opFeedback({
      etapas: [
        'Verificando permissões…',
        `Removendo ${nomeExib}…`,
        'Limpando permissões associadas…',
        'Sincronizando banco de dados…',
      ],
      executar: async () => {
        const uids = _adminUids.filter(u => u !== uid);
        const novasPermissoes = { ..._adminPermissoes };
        delete novasPermissoes[uid];
        const tok = await _token();
        const r = await fetch(`${FS}/config/admins?updateMask.fieldPaths=uids&updateMask.fieldPaths=permissoes`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: {
            uids: { arrayValue: { values: uids.map(u => ({ stringValue: u })) } },
            permissoes: { mapValue: { fields: Object.fromEntries(
              Object.entries(novasPermissoes).map(([k, v]) => [k, {
                arrayValue: { values: (Array.isArray(v) ? v : []).map(s => ({ stringValue: s })) }
              }])
            )}}
          }})
        });
        if (!r.ok) { const b = await r.text(); throw new Error(`HTTP ${r.status}: ${b.slice(0,80)}`); }
        _adminUids       = uids;
        _adminPermissoes = novasPermissoes;
        await _rtdbSyncAdmins(uids, _adminOwner);
        _registrarAuditoria(`Admin removido: ${uid.slice(0,8)}`);
      },
      sucesso: `${nomeExib} removido dos administradores.`,
      onSucesso: () => _renderAdminLista(),
    });
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
    const menu     = document.getElementById('admin-setor-menu');
    const dropdown = document.getElementById('admin-setor-dropdown');
    if (menu) menu.style.display = 'none';
    dropdown?.classList.remove('open');

    // Atualiza estado do botão Resetar Setor (desabilitado quando "Todos")
    const btnResetSetor = document.getElementById('btn-resetar-setor');
    if (btnResetSetor) {
      btnResetSetor.disabled = !valor;
      btnResetSetor.title    = valor ? `Apagar todas as entradas de ${valor}` : 'Selecione um setor para resetar';
    }

    // Recarrega a lista com o novo filtro
    carregarPodioAdmin();
  }

  // Reseta pódio completo (todos os setores)
  async function resetarPodioTotal() {
    if (!confirm('⚠️ Isso vai apagar TODO o pódio de TODOS os setores.\n\nEsta ação não pode ser desfeita.')) return;

    let _total = 0;
    await _opFeedback({
      etapas: [
        'Verificando permissões…',
        'Buscando todas as entradas…',
        'Apagando registros…',
      ],
      executar: async () => {
        const res  = await _query({ structuredQuery: { from: [{ collectionId: 'podio' }] } });
        const docs = res.filter(r => r.document);
        _total = docs.length;
        for (const d of docs) {
          const uid = d.document.name.split('/').pop();
          await _delete(`podio/${uid}`);
        }
        _registrarAuditoria(`Pódio completo resetado (${_total} entradas)`);
      },
      sucesso: `${_total} entrada(s) removidas do pódio!`,
      onSucesso: () => carregarPodioAdmin(),
    });
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

    await _opFeedback({
      etapas: ['Verificando permissões…', 'Publicando mensagem global…'],
      executar: async () => {
        const tok = await _token();
        const r   = await fetch(`${FS}/config/global?updateMask.fieldPaths=mensagem`, {
          method:  'PATCH',
          headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
          body:    JSON.stringify({ fields: { mensagem: _fsStr(msg) }})
        });
        if (!r.ok) { const b = await r.text(); throw new Error(`HTTP ${r.status}: ${b.slice(0,80)}`); }
      },
      sucesso: msg ? 'Mensagem enviada a todos os jogadores!' : 'Mensagem global removida.',
      onSucesso: () => fecharModalMsg(),
    });
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

    // Determina o motivo final antes de entrar no feedback
    let motivoFinal = _banMotivoSelecionado;
    if (!estaBanido) motivoFinal = '';
    else if (motivoFinal.startsWith('Outro')) {
      const detalhe = document.getElementById('admin-ban-detalhe')?.value?.trim();
      motivoFinal = detalhe || 'Outro';
    }

    await _opFeedback({
      etapas: estaBanido
        ? ['Verificando permissões…', 'Removendo banimento…', 'Atualizando histórico…']
        : ['Verificando permissões…', 'Aplicando banimento…', 'Registrando motivo…', 'Atualizando histórico…'],
      executar: async () => {
        const tok = await _token();

        let banHistory = [];
        try {
          const docAtual = await _get(`usuarios/${uid}`);
          banHistory = _val(docAtual.fields?.banHistory) || [];
        } catch(e) {}

        banHistory.push({ tipo: estaBanido ? 'unban' : 'ban', motivo: motivoFinal, ts: Date.now() });

        const fieldsUpdate = {
          banido: _fsBool(!estaBanido),
          banHistory: { arrayValue: { values: banHistory.map(e => ({ mapValue: { fields: {
            tipo:   { stringValue: e.tipo },
            motivo: { stringValue: e.motivo || '' },
            ts:     { integerValue: String(e.ts) },
          }}})) }},
          motivoBan: _fsStr(estaBanido ? '' : motivoFinal),
        };

        const mask   = Object.keys(fieldsUpdate).map(k => `updateMask.fieldPaths=${k}`).join('&');
        const patchR = await fetch(`${FS}/usuarios/${uid}?${mask}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: fieldsUpdate })
        });
        if (!patchR.ok) { const b = await patchR.text(); throw new Error(`HTTP ${patchR.status}: ${b.slice(0,80)}`); }
      },
      sucesso: estaBanido ? 'Jogador desbanido com sucesso!' : 'Jogador banido com sucesso!',
      onSucesso: () => {
        fecharModalBan();
        if (_currentSection === 'jogadores')
          carregarJogadores(document.getElementById('admin-busca')?.value || '');
      },
    });

    btns?.forEach(b => { b.disabled = false; });
  }

  /* ── INBOX (MENSAGENS PARA JOGADOR) ─────────────── */
  let _inboxUid = '';
  let _inboxNome = '';

  function abrirModalInbox(uid, nome) {
    _inboxUid = uid;
    _inboxNome = nome || uid;
    const modal = document.getElementById('admin-modal-inbox');
    const dest  = document.getElementById('admin-inbox-dest');
    const txt   = document.getElementById('admin-inbox-texto');
    if (!modal) return;
    if (dest) dest.innerHTML = `Para: <strong style="color:var(--t1)">${_inboxNome}</strong>`;
    if (txt) txt.value = '';
    modal.style.display = 'flex';
  }

  function fecharModalInbox() {
    const modal = document.getElementById('admin-modal-inbox');
    if (modal) modal.style.display = 'none';
    _inboxUid  = '';
    _inboxNome = '';
  }

  async function enviarMensagemInbox() {
    const texto = document.getElementById('admin-inbox-texto')?.value?.trim();
    if (!texto) { _showAdminToast('Digite uma mensagem.', true); return; }
    if (!_inboxUid) { _showAdminToast('Destinatário inválido.', true); return; }
    const dest = _inboxNome || _inboxUid;

    await _opFeedback({
      etapas: ['Verificando permissões…', `Enviando mensagem para ${dest}…`, 'Registrando no log…'],
      executar: async () => {
        const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
        const campos = {
          texto:             { stringValue: texto },
          de:                { stringValue: 'admin' },
          ts:                { integerValue: String(Date.now()) },
          lida:              { booleanValue: false },
          confirmada:        { booleanValue: false },
          categoria:         { stringValue: 'geral' },
          fixada:            { booleanValue: false },
          exigirConfirmacao: { booleanValue: false },
          broadcast:         { booleanValue: false },
          expiraEm:          { integerValue: String(Date.now() + 30*24*60*60*1000) },
        };
        await _patch(`usuarios/${_inboxUid}/mensagens/${msgId}`, campos);
        await _patch(`mensagens_log/${msgId}`, {
          ...campos,
          destUid:      { stringValue: _inboxUid },
          destNome:     { stringValue: _inboxNome },
          lidoPor:      { integerValue: '0' },
          totalEnviado: { integerValue: '1' },
        });
      },
      sucesso: `Mensagem enviada para ${dest}!`,
      onSucesso: () => {
        fecharModalInbox();
        if (_currentSection === 'mensagens') carregarMensagens();
      },
    });
  }

  async function enviarMensagemTodos(texto) {
    if (!texto) return;
    try {
      const res = await _query({
        structuredQuery: {
          from: [{ collectionId: 'usuarios' }],
          select: { fields: [{ fieldPath: 'nome' }] }
        }
      });
      const uids = res.filter(r => r.document).map(r => r.document.name.split('/').pop());
      const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
      const campos = {
        texto:             { stringValue: texto },
        de:                { stringValue: 'admin' },
        ts:                { integerValue: String(Date.now()) },
        lida:              { booleanValue: false },
        confirmada:        { booleanValue: false },
        categoria:         { stringValue: 'aviso' },
        fixada:            { booleanValue: false },
        exigirConfirmacao: { booleanValue: false },
        broadcast:         { booleanValue: true },
        expiraEm:          { integerValue: String(Date.now() + 30*24*60*60*1000) },
      };
      let ok = 0;
      for (const uid of uids) {
        try {
          await _patch(`usuarios/${uid}/mensagens/${msgId}`, campos);
          ok++;
        } catch(e) { /* continua */ }
      }
      await _patch(`mensagens_log/${msgId}`, {
        ...campos,
        destUid:      { stringValue: '' },
        destNome:     { stringValue: '' },
        lidoPor:      { integerValue: '0' },
        totalEnviado: { integerValue: String(ok) },
      });
      _showAdminToast(`✅ Mensagem enviada para ${ok} jogadores!`);
      if (_currentSection === 'mensagens') carregarMensagens();
    } catch(e) {
      _showAdminToast('Erro ao enviar broadcast: ' + e.message, true);
    }
  }


  /* ── NOVA MENSAGEM INDIVIDUAL (aba Mensagens) ───── */
  let _novaMsgUid       = '';
  let _novaMsgNome      = '';
  let _novaMsgCategoria = 'geral';

  function abrirNovaMsg(uid, nome) {
    _novaMsgUid       = uid  || '';
    _novaMsgNome      = nome || '';
    _novaMsgCategoria = 'geral';
    const modal = document.getElementById('admin-modal-nova-msg');
    const dest  = document.getElementById('admin-nova-msg-dest');
    const txt   = document.getElementById('admin-nova-msg-texto');
    const fixar = document.getElementById('admin-nova-msg-fixar');
    const conf  = document.getElementById('admin-nova-msg-confirmar');
    if (!modal) return;
    if (dest) dest.textContent = nome ? `Para: ${nome}` : 'Para: todos os jogadores';
    if (txt)   txt.value = '';
    if (fixar) fixar.checked = false;
    if (conf)  conf.checked  = false;
    // Reseta botões de categoria
    modal.querySelectorAll('.admin-msg-cat-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === 'geral');
    });
    modal.style.display = 'flex';
  }

  function fecharNovaMsg() {
    const modal = document.getElementById('admin-modal-nova-msg');
    if (modal) modal.style.display = 'none';
    _novaMsgUid = ''; _novaMsgNome = ''; _novaMsgCategoria = 'geral';
  }

  function selecionarCategoria(btn) {
    const modal = document.getElementById('admin-modal-nova-msg');
    modal?.querySelectorAll('.admin-msg-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _novaMsgCategoria = btn.dataset.cat || 'geral';
  }

  async function enviarNovaMsg() {
    const texto = document.getElementById('admin-nova-msg-texto')?.value?.trim();
    if (!texto) { _showAdminToast('Digite uma mensagem.', true); return; }
    const fixar = !!(document.getElementById('admin-nova-msg-fixar')?.checked);
    const conf  = !!(document.getElementById('admin-nova-msg-confirmar')?.checked);
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
    const campos = {
      texto:             { stringValue: texto },
      de:                { stringValue: 'admin' },
      ts:                { integerValue: String(Date.now()) },
      lida:              { booleanValue: false },
      confirmada:        { booleanValue: false },
      categoria:         { stringValue: _novaMsgCategoria },
      fixada:            { booleanValue: fixar },
      exigirConfirmacao: { booleanValue: conf },
      broadcast:         { booleanValue: !_novaMsgUid },
      expiraEm:          { integerValue: String(Date.now() + 30*24*60*60*1000) },
    };
    try {
      if (_novaMsgUid) {
        // Mensagem individual
        await _patch(`usuarios/${_novaMsgUid}/mensagens/${msgId}`, campos);
        await _patch(`mensagens_log/${msgId}`, {
          ...campos,
          destUid:  { stringValue: _novaMsgUid },
          destNome: { stringValue: _novaMsgNome },
          lidoPor:  { integerValue: '0' }, totalEnviado: { integerValue: '1' },
        });
        } else {
        // Sem destinatário definido — abre broadcast
        fecharNovaMsg();
        abrirBroadcast();
        return;
      }
      fecharNovaMsg();
      _showAdminToast(`✅ Mensagem enviada para ${_novaMsgNome || _novaMsgUid}!`);
      if (_currentSection === 'mensagens') carregarMensagens();
    } catch(e) {
      _showAdminToast('Erro ao enviar: ' + e.message, true);
    }
  }

  /* ── HISTÓRICO DE MENSAGENS ─────────────────────── */
  async function carregarMensagens() {
    const lista = document.getElementById('admin-msgs-lista');
    const total = document.getElementById('admin-msgs-total');
    if (!lista) return;
    lista.innerHTML = '<div class="admin-empty">Carregando...</div>';
    try {
      const res = await _query({
        structuredQuery: {
          from: [{ collectionId: 'mensagens_log' }],
          orderBy: [{ field: { fieldPath: 'ts' }, direction: 'DESCENDING' }],
          limit: 50,
        }
      });
      const msgs = res.filter(r => r.document).map(r => {
        const f = _parseFields(r.document.fields || {});
        const id = r.document.name.split('/').pop();
        return { id, ...f };
      });
      if (total) total.textContent = msgs.length;
      if (!msgs.length) {
        lista.innerHTML = '<div class="admin-empty">Nenhuma mensagem enviada ainda.</div>';
        return;
      }
      lista.innerHTML = msgs.map(m => {
        const data = new Date(Number(m.ts) || 0).toLocaleString('pt-BR');
        const dest = m.broadcast ? 'Todos' : (m.destNome || m.destUid || '—');
        const lidos = m.lidoPor !== undefined ? m.lidoPor : '—';
        return `<div style="background:var(--bg3);border:1px solid var(--line2);border-radius:10px;padding:10px 12px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:.75rem;color:var(--t3)">${data} · Para: <strong style="color:var(--t2)">${dest}</strong></span>
            <span style="font-size:.7rem;background:var(--bg2);border:1px solid var(--line2);border-radius:20px;padding:2px 8px;color:var(--t3)">${m.categoria || 'geral'}</span>
          </div>
          <div style="font-size:.85rem;color:var(--t1);margin-bottom:6px">${m.texto || ''}</div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:.72rem;color:var(--t3)">👁 Lidos: ${lidos}${m.totalEnviado ? ' / ' + m.totalEnviado : ''}</span>
            <button class="admin-btn" style="padding:3px 10px;font-size:.72rem;background:transparent;border:1px solid var(--line2);color:var(--t3)" onclick="ADMIN.apagarMensagemLog('${m.id}')">🗑 Apagar</button>
          </div>
        </div>`;
      }).join('');
    } catch(e) {
      lista.innerHTML = `<div class="admin-empty">Erro: ${e.message}</div>`;
    }
  }

  async function apagarMensagemLog(id) {
    if (!id) return;
    try {
      const tok = await _token();
      await fetch(`${FS}/mensagens_log/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tok}` },
      });
      _showAdminToast('Mensagem removida do log.');
      carregarMensagens();
    } catch(e) {
      _showAdminToast('Erro ao apagar: ' + e.message, true);
    }
  }

  async function apagarTodasMensagens() {
    if (!confirm('⚠️ Apagar TODAS as mensagens de TODOS os jogadores e limpar o log?\n\nEsta ação não pode ser desfeita.')) return;
    _showAdminToast('Apagando mensagens...');
    let totalApagadas = 0;
    let erros = 0;
    try {
      const tok = await _token();

      // 1. Busca todos os usuários
      const res = await _query({
        structuredQuery: {
          from: [{ collectionId: 'usuarios' }],
          select: { fields: [{ fieldPath: 'nome' }] }
        }
      });
      const uids = res.filter(r => r.document).map(r => r.document.name.split('/').pop());

      // 2. Para cada usuário, busca mensagens via runQuery scoped ao documento do usuário
      for (const uid of uids) {
        try {
          // runQuery no path do doc do usuário retorna apenas sua subcoleção 'mensagens'
          const r = await fetch(`${FS}/usuarios/${uid}:runQuery`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              structuredQuery: {
                from: [{ collectionId: 'mensagens' }],
                select: { fields: [{ fieldPath: 'ts' }] }
              }
            })
          });
          if (!r.ok) continue;
          const rows = await r.json();
          const msgDocs = (rows || []).filter(d => d.document);
          for (const doc of msgDocs) {
            try {
              const path = doc.document.name.split('/documents/')[1];
              await _delete(path);
              totalApagadas++;
            } catch(e) { erros++; }
          }
        } catch(e) { erros++; }
      }

      // 3. Apaga todo o mensagens_log via _query + _delete
      const logRes = await _query({
        structuredQuery: {
          from: [{ collectionId: 'mensagens_log' }],
          select: { fields: [{ fieldPath: 'ts' }] }
        }
      });
      const logDocs = logRes.filter(r => r.document);
      for (const doc of logDocs) {
        try {
          const path = doc.document.name.split('/documents/')[1];
          await _delete(path);
        } catch(e) { /* continua */ }
      }

      _showAdminToast(`✅ ${totalApagadas} mensagens apagadas${erros > 0 ? ` (${erros} erros)` : ''}.`);
      carregarMensagens();
    } catch(e) {
      _showAdminToast('Erro: ' + e.message, true);
    }
  }

  /* ── BROADCAST ──────────────────────────────────── */
  function abrirBroadcast() {
    const modal = document.getElementById('admin-modal-broadcast');
    const txt   = document.getElementById('admin-broadcast-texto');
    if (!modal) return;
    if (txt) txt.value = '';
    modal.style.display = 'flex';
  }

  function fecharBroadcast() {
    const modal = document.getElementById('admin-modal-broadcast');
    if (modal) modal.style.display = 'none';
  }

  async function confirmarBroadcast() {
    const texto = document.getElementById('admin-broadcast-texto')?.value?.trim();
    if (!texto) { _showAdminToast('Digite uma mensagem.', true); return; }
    fecharBroadcast();
    _showAdminToast('Enviando para todos...');
    try {
      const res = await _query({ structuredQuery: { from: [{ collectionId: 'usuarios' }], select: { fields: [{ fieldPath: 'nome' }] } } });
      const uids = res.filter(r => r.document).map(r => r.document.name.split('/').pop());
      let ok = 0;
      const msgId = `bcast_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
      for (const uid of uids) {
        try {
          await _patch(`usuarios/${uid}/mensagens/${msgId}`, {
            texto: { stringValue: texto }, de: { stringValue: 'admin' },
            ts: { integerValue: String(Date.now()) }, lida: { booleanValue: false },
            confirmada: { booleanValue: false }, categoria: { stringValue: 'aviso' },
            fixada: { booleanValue: false }, exigirConfirmacao: { booleanValue: false },
            expiraEm: { integerValue: String(Date.now() + 30*24*60*60*1000) },
            broadcast: { booleanValue: true },
          });
          ok++;
        } catch(e) { /* continua */ }
      }
      await _patch(`mensagens_log/${msgId}`, {
        texto: { stringValue: texto }, destUid: { stringValue: '' }, destNome: { stringValue: '' },
        categoria: { stringValue: 'aviso' }, fixada: { booleanValue: false },
        exigirConfirmacao: { booleanValue: false }, broadcast: { booleanValue: true },
        lidoPor: { integerValue: '0' }, totalEnviado: { integerValue: String(ok) },
        ts: { integerValue: String(Date.now()) },
      });
      _showAdminToast(`✅ Mensagem enviada para ${ok} jogadores!`);
      if (_currentSection === 'mensagens') carregarMensagens();
    } catch(e) { _showAdminToast('Erro: ' + e.message, true); }
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
      const result = {
        manutencao:   !!fields.manutencao,
        mensagem:     fields.mensagem || '',
        modoSalaAtivo: !!fields.modoSalaAtivo,
        liberados:    Array.isArray(fields.liberados) ? fields.liberados : [],
      };
      console.log('[GSP] verificarMensagemGlobal:', result);
      return result;
    } catch(e) {
      console.error('[GSP] verificarMensagemGlobal erro:', e.message);
      return null;
    }
  }

  // ── Adicionar / remover UID da lista de liberados durante manutenção ──
  async function toggleLiberado(uid, adicionar) {
    uid = (uid || '').trim();
    if (!uid) { _showAdminToast('⚠ Informe um UID válido.', true); return; }
    try {
      const snap     = await _get('config/global');
      const fields   = _parseFields(snap.fields || {});
      const liberados = Array.isArray(fields.liberados) ? fields.liberados : [];
      const atualizado = adicionar
        ? [...new Set([...liberados, uid])]
        : liberados.filter(u => u !== uid);
      await _patch('config/global', {
        liberados: { arrayValue: { values: atualizado.map(u => ({ stringValue: u })) } }
      });
      _showAdminToast(adicionar ? `✅ UID liberado` : `🚫 UID removido`);
      _registrarAuditoria(adicionar ? `UID liberado em manutenção: ${uid}` : `UID removido dos liberados: ${uid}`);
    } catch(e) {
      console.error('[Admin] toggleLiberado:', e);
      _showAdminToast('❌ Erro ao atualizar lista de liberados.', true);
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

  /* ══════════════════════════════════════════════════
     FEEDBACK DE OPERAÇÃO — tela de loading com etapas
  ══════════════════════════════════════════════════ */

  // Converte código HTTP / mensagem de erro em texto amigável
  function _traduzirErro(e) {
    const msg = (e?.message || String(e)).toLowerCase();
    const status = parseInt((e?.message || '').match(/\d{3}/)?.[0] || '0');

    if (status === 403 || msg.includes('permission') || msg.includes('permiss'))
      return { titulo: 'Permissão negada', detalhe: 'Sua permissão para esta ação foi revogada. Recarregue o painel ou faça login novamente.', tipo: 'revogado' };
    if (status === 401 || msg.includes('não autenticado') || msg.includes('unauthenticated') || msg.includes('token'))
      return { titulo: 'Sessão expirada', detalhe: 'Seu login expirou. Saia e entre novamente para continuar.', tipo: 'auth' };
    if (status === 404 || msg.includes('not found') || msg.includes('não encontrado'))
      return { titulo: 'Recurso não encontrado', detalhe: 'O documento que tentou acessar não existe ou foi removido.', tipo: 'notfound' };
    if (status >= 500 || msg.includes('unavailable') || msg.includes('internal'))
      return { titulo: 'Falha no servidor', detalhe: 'O Firestore retornou um erro interno. Tente novamente em instantes.', tipo: 'server' };
    if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network') || msg.includes('offline') || msg.includes('conexão'))
      return { titulo: 'Falha na conexão', detalhe: 'Não foi possível alcançar o servidor. Verifique sua internet e tente novamente.', tipo: 'network' };
    if (status === 429 || msg.includes('quota') || msg.includes('limit'))
      return { titulo: 'Limite atingido', detalhe: 'O Firestore atingiu o limite de requisições. Aguarde alguns segundos.', tipo: 'quota' };

    return { titulo: 'Erro inesperado', detalhe: e?.message || 'Ocorreu um problema desconhecido. Tente novamente.', tipo: 'generic' };
  }

  // Ícones SVG para os estados
  const _opIcons = {
    loading: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin .8s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
    ok:      `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    err:     `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    revoked: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  };

  /**
   * _opFeedback(config)
   *
   * config: {
   *   etapas:  string[]           — ex: ['Verificando permissões…', 'Salvando dados…']
   *   executar: async () => any   — função que faz a operação real
   *   sucesso:  string            — mensagem de sucesso
   *   onSucesso?: () => void      — callback pós-sucesso (fechar modal, recarregar lista…)
   *   fecharBotao?: string        — texto do botão de fechar no estado de sucesso (default: 'Fechar')
   * }
   */
  async function _opFeedback({ etapas = [], executar, sucesso, onSucesso, fecharBotao = 'Fechar' }) {
    const ov = document.getElementById('admin-op-feedback');
    const iconEl   = document.getElementById('aof-icon');
    const tituloEl = document.getElementById('aof-titulo');
    const etapaEl  = document.getElementById('aof-etapa');
    const barraEl  = document.getElementById('aof-barra-fill');
    const listaEl  = document.getElementById('aof-lista');
    const footerEl = document.getElementById('aof-footer');
    if (!ov) return;  // fallback seguro: se o HTML não tiver o overlay, ignora

    // Reset
    iconEl.innerHTML   = _opIcons.loading;
    iconEl.className   = 'aof-icon aof-loading';
    tituloEl.textContent = 'Aguarde…';
    etapaEl.textContent  = etapas[0] || 'Iniciando…';
    barraEl.style.width  = '0%';
    listaEl.innerHTML    = '';
    footerEl.innerHTML   = '';
    ov.style.display     = 'flex';

    // Renderiza etapas como itens pendentes
    const itens = etapas.map((txt, i) => {
      const li = document.createElement('div');
      li.className = 'aof-item aof-pending';
      li.innerHTML = `<span class="aof-item-dot"></span><span class="aof-item-txt">${txt}</span>`;
      listaEl.appendChild(li);
      return li;
    });

    // Avança visualmente pelas etapas com delay mínimo para o olho perceber
    async function _avancarEtapa(i) {
      if (i > 0 && itens[i-1]) {
        itens[i-1].className = 'aof-item aof-done';
        itens[i-1].querySelector('.aof-item-dot').innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      }
      if (itens[i]) {
        itens[i].className = 'aof-item aof-running';
        etapaEl.textContent = etapas[i];
      }
      barraEl.style.width = `${Math.round(((i + 1) / (etapas.length + 1)) * 85)}%`;
      await new Promise(r => setTimeout(r, 320));
    }

    // Executa etapas visuais antes da operação real
    for (let i = 0; i < etapas.length - 1; i++) {
      await _avancarEtapa(i);
    }
    // Última etapa visual fica "rodando" enquanto o fetch real acontece
    if (etapas.length > 0) await _avancarEtapa(etapas.length - 1);

    // ── Executa a operação real ──────────────────────
    try {
      await executar();

      // Sucesso
      itens.forEach(li => {
        li.className = 'aof-item aof-done';
        li.querySelector('.aof-item-dot').innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      });
      barraEl.style.width = '100%';
      barraEl.style.background = 'var(--ok)';
      iconEl.innerHTML   = _opIcons.ok;
      iconEl.className   = 'aof-icon aof-ok';
      tituloEl.textContent = 'Concluído!';
      etapaEl.textContent  = sucesso;
      footerEl.innerHTML   = `<button class="aof-btn aof-btn-ok" onclick="document.getElementById('admin-op-feedback').style.display='none'">${fecharBotao}</button>`;

      if (onSucesso) {
        await new Promise(r => setTimeout(r, 900));
        ov.style.display = 'none';
        onSucesso();
      }

    } catch(e) {
      // Marca a última etapa em execução como falha
      const emExec = itens.find(li => li.classList.contains('aof-running'));
      if (emExec) {
        emExec.className = 'aof-item aof-fail';
        emExec.querySelector('.aof-item-dot').innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
      }

      barraEl.style.background = 'var(--err)';
      barraEl.style.width      = '100%';

      const { titulo, detalhe, tipo } = _traduzirErro(e);
      const isRevoked = tipo === 'revogado' || tipo === 'auth';

      iconEl.innerHTML   = isRevoked ? _opIcons.revoked : _opIcons.err;
      iconEl.className   = 'aof-icon aof-err';
      tituloEl.textContent = titulo;
      etapaEl.textContent  = detalhe;

      footerEl.innerHTML = isRevoked
        ? `<button class="aof-btn aof-btn-err" onclick="document.getElementById('btn-sair').click()">Sair da conta</button>
           <button class="aof-btn aof-btn-ghost" onclick="document.getElementById('admin-op-feedback').style.display='none'">Fechar</button>`
        : `<button class="aof-btn aof-btn-ghost" onclick="document.getElementById('admin-op-feedback').style.display='none'">Fechar</button>`;
    }
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
    if (id === 'visao-geral')  { carregarVisaoGeral(); carregarAoVivo(); }
    if (id === 'jogadores')    carregarJogadores();
    if (id === 'podio')        carregarPodioAdmin();
    if (id === 'dashboard')    carregarDashboard();
    if (id === 'historias')    carregarHistorias();
    if (id === 'feedback')     carregarFeedback();
    if (id === 'sessoes')      carregarSessoes();
    if (id === 'versao')       carregarVersao();
    if (id === 'logs')         carregarLogs();
    if (id === 'config')       { carregarConfigGlobal(); carregarAuditLog(); }
    if (id === 'mensagens')    carregarMensagens();
  }

  function fecharModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.style.display = 'none';
  }

  /* ════════════════════════════════════════════════════
     VERSÃO
  ════════════════════════════════════════════════════ */
  let _versaoAtual = null;

  async function carregarVersao() {
    try {
      // Busca o version.json gerado pelo deploy
      const r = await fetch('/version.json?t=' + Date.now());
      if (!r.ok) { _renderVersaoSemDados(); return; }
      const v = await r.json();
      _versaoAtual = v;

      document.getElementById('versao-badge-atual').textContent  = v.versao || ('v' + (v.hash || '—').slice(0,7));
      document.getElementById('versao-hash-atual').textContent   = v.hash  || '';
      document.getElementById('versao-deploy-atual').textContent = v.deployedAt ? _formatarData(v.deployedAt) : '—';

      // Mensagem do commit — injeta dinamicamente se elemento não existir
      const hashEl = document.getElementById('versao-hash-atual');
      if (hashEl && v.commitMsg) {
        let commitEl = document.getElementById('versao-commit-msg');
        if (!commitEl) {
          commitEl = document.createElement('div');
          commitEl.id = 'versao-commit-msg';
          commitEl.style.cssText = 'font-size:.78rem;color:var(--t3);margin-top:4px';
          hashEl.parentNode.insertBefore(commitEl, hashEl.nextSibling);
        }
        commitEl.textContent = '💬 ' + v.commitMsg;
        commitEl.style.display = 'block';
      }

      // Arquivos alterados — injeta dinamicamente se elemento não existir
      if (v.arquivosAlterados?.length) {
        let arquivosEl = document.getElementById('versao-arquivos-lista');
        if (!arquivosEl) {
          arquivosEl = document.createElement('div');
          arquivosEl.id = 'versao-arquivos-lista';
          arquivosEl.style.cssText = 'margin-top:8px';
          arquivosEl.innerHTML = '<div style="font-size:.72rem;color:var(--t3);margin-bottom:4px">📁 Arquivos alterados:</div><div id="versao-arquivos-tags" style="display:flex;flex-wrap:wrap;gap:4px"></div>';
          const hashCard = document.getElementById('versao-hash-atual');
          if (hashCard) hashCard.parentNode.appendChild(arquivosEl);
        }
        const tagsEl = document.getElementById('versao-arquivos-tags');
        if (tagsEl) {
          tagsEl.innerHTML = v.arquivosAlterados.map(f =>
            `<span style="background:var(--bg3);color:var(--t2);font-size:.7rem;padding:2px 8px;border-radius:20px;font-family:monospace">${f}</span>`
          ).join('');
        }
      }

      // Carrega changelog do Firestore (404 = ainda não salvo, não é erro)
      let snap = null;
      try { snap = await _get(`versoes/${v.hash}`); } catch(e) { if (!e.message.includes('404')) throw e; }
      if (snap?.fields) {
        const cl = snap.fields.changelog?.stringValue || '';
        const cr = snap.fields.critica?.booleanValue  || false;
        document.getElementById('versao-changelog-input').value = cl;
        document.getElementById('versao-critica-check').checked = cr;
      }

      // Estatísticas de usuários por versão
      _carregarStatsVersao(v.hash);

      // Histórico
      _carregarHistoricoVersoes();

    } catch(e) { console.error('[Versao] erro:', e); _renderVersaoSemDados(); }
  }

  function _renderVersaoSemDados() {
    const el = document.getElementById('versao-deploy-atual');
    if (el) el.textContent = 'version.json não encontrado — faça um deploy via GitHub Actions';
  }

  async function salvarChangelog() {
    if (!_versaoAtual?.hash) { _showAdminToast('Versão não carregada', true); return; }
    const changelog = document.getElementById('versao-changelog-input')?.value.trim() || '';
    const critica   = document.getElementById('versao-critica-check')?.checked || false;

    await _opFeedback({
      etapas: ['Verificando permissões…', 'Salvando changelog da versão…'],
      executar: async () => {
        await _patch(`versoes/${_versaoAtual.hash}`, {
          changelog:  { stringValue: changelog },
          critica:    { booleanValue: critica },
          versao:     { stringValue: _versaoAtual.versao || _versaoAtual.hash?.slice(0,7) },
          hash:       { stringValue: _versaoAtual.hash },
          deployedAt: { stringValue: _versaoAtual.deployedAt || '' },
          savedAt:    { stringValue: new Date().toISOString() },
        });
      },
      sucesso: 'Changelog salvo!',
      onSucesso: () => _carregarHistoricoVersoes(),
    });
  }

  async function _carregarStatsVersao(hashAtual) {
    try {
      // Conta sessões ativas com versão registrada
      const snapRaw = await _query({ structuredQuery: { from: [{ collectionId: 'sessoes_ativas' }] } });
      const docs = (snapRaw || []).filter(r => r.document).map(r => r.document);
      let atuais = 0, antigos = 0;
      docs.forEach(d => {
        const h = d.fields?.versao?.stringValue;
        if (!h) return;
        if (h === hashAtual) atuais++; else antigos++;
      });
      const elA = document.getElementById('versao-usuarios-atuais');
      const elV = document.getElementById('versao-usuarios-antigos');
      if (elA) elA.textContent = atuais;
      if (elV) elV.textContent = antigos;
    } catch(e) {}
  }

  async function _carregarHistoricoVersoes() {
    const lista = document.getElementById('versao-historico-lista');
    if (!lista) return;
    lista.innerHTML = '<span style="color:var(--t3);font-size:.78rem">Carregando...</span>';
    try {
      const snapRaw = await _query({ structuredQuery: { from: [{ collectionId: 'versoes' }] } });
      const docs = (snapRaw || []).filter(r => r.document).map(r => r.document).sort((a, b) => {
        const tA = a.fields?.savedAt?.stringValue || '';
        const tB = b.fields?.savedAt?.stringValue || '';
        return tB.localeCompare(tA);
      });
      if (!docs.length) { lista.innerHTML = '<span style="color:var(--t3);font-size:.78rem">Nenhuma versão registrada ainda.</span>'; return; }
      lista.innerHTML = docs.map(d => {
        const f        = d.fields || {};
        const versao   = f.versao?.stringValue   || f.hash?.stringValue?.slice(0,7) || '—';
        const hash     = f.hash?.stringValue     || '';
        const critica  = f.critica?.booleanValue || false;
        const log      = f.changelog?.stringValue || 'Sem changelog registrado.';
        const data     = f.deployedAt?.stringValue ? _formatarData(f.deployedAt.stringValue) : '—';
        return `
          <div class="admin-versao-hist-item">
            <div class="admin-versao-hist-header">
              <span class="admin-versao-hist-badge ${critica ? 'critica' : ''}">${critica ? '⚠️ ' : ''}${versao}</span>
              <span class="admin-versao-hist-date">${data}</span>
            </div>
            <div class="admin-versao-hist-log">${log.replace(/\n/g, '<br>')}</div>
            ${hash ? `<div class="admin-versao-hist-hash">${hash}</div>` : ''}
          </div>`;
      }).join('');
    } catch(e) {
      lista.innerHTML = '<span style="color:var(--t3);font-size:.78rem">Erro ao carregar histórico.</span>';
    }
  }

  // Aliases removidos — usar _get, _patch, _token diretamente (definidos no topo)

  function _formatarData(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch(e) { return iso; }
  }

  /* ════════════════════════════════════════════════════
     AO VIVO (Geral) — Firebase Realtime Database
  ════════════════════════════════════════════════════ */
  let _aoVivoUnsubscribe = null; // guarda o unsubscribe do listener RTDB

  function carregarAoVivo() {
    const lista = document.getElementById('admin-aovivo-lista');
    if (!lista) return;

    // — RTDB (tempo real) —
    if (window.GSPRtdb) {
      const { db, ref, onValue } = window.GSPRtdb;

      // Cancela listener anterior se existir
      if (_aoVivoUnsubscribe) { _aoVivoUnsubscribe(); _aoVivoUnsubscribe = null; }

      lista.innerHTML = '<div class="admin-loading">Conectando...</div>';

      const presRef = ref(db, 'presence');
      _aoVivoUnsubscribe = onValue(presRef, (snapshot) => {
        const dados = snapshot.val() || {};
        const jogadores = Object.values(dados);

        if (!jogadores.length) {
          lista.innerHTML = '<div class="admin-empty">Sem jogadores online agora.</div>';
          return;
        }

        lista.innerHTML = jogadores
          .sort((a, b) => (b.ts || 0) - (a.ts || 0))
          .map(d => {
            const emPartida = d.status !== 'home' && d.setor;
            const detalhe = emPartida
              ? `${_emojiSetor(d.setor)} ${(d.setor||'').charAt(0).toUpperCase()+(d.setor||'').slice(1)} · Rodada ${(d.rodada||0)+1}`
              : '🏠 Na tela inicial';
            return `
            <div class="admin-aovivo-row">
              <div class="admin-sessao-dot ativa"></div>
              <div class="admin-sessao-info">
                <div class="admin-sessao-nome">${d.nome || 'Jogador'}</div>
                <div class="admin-sessao-detalhe">${detalhe}</div>
              </div>
            </div>`;
          }).join('');
      }, (err) => {
        lista.innerHTML = '<div class="admin-empty">Erro ao conectar ao Realtime DB.</div>';
        console.error('[Admin] RTDB onValue erro:', err);
      });
      return;
    }

    // — Fallback: Firestore REST (RTDB não configurado) —
    (async () => {
      try {
        const res = await _query({
          structuredQuery: {
            from: [{ collectionId: 'sessoes' }],
            orderBy: [{ field: { fieldPath: 'ts' }, direction: 'DESCENDING' }],
            limit: 10
          }
        });
        const docs = res.filter(r => r.document).map(r => _parseFields(r.document.fields));
        const agora = Date.now();
        const ativas = docs.filter(d => d.ts && (agora - d.ts) < 300000);
        if (!ativas.length) { lista.innerHTML = '<div class="admin-empty">Sem sessões ativas.</div>'; return; }
        lista.innerHTML = ativas.map(d => `
          <div class="admin-aovivo-row">
            <div class="admin-sessao-dot ativa"></div>
            <div class="admin-sessao-info">
              <div class="admin-sessao-nome">${d.nome || 'Jogador'}</div>
              <div class="admin-sessao-detalhe">${_emojiSetor(d.setor)} ${(d.setor||'').charAt(0).toUpperCase()+(d.setor||'').slice(1)} · Rodada ${(d.rodada||0)+1}</div>
            </div>
          </div>`).join('');
      } catch(e) { lista.innerHTML = '<div class="admin-empty">Erro ao carregar.</div>'; }
    })();
  }

  /* ════════════════════════════════════════════════════
     FILTROS DE JOGADORES
  ════════════════════════════════════════════════════ */
  let _filtroJogadores = 'todos';
  function filtrarJogadores(filtro) {
    _filtroJogadores = filtro;
    document.querySelectorAll('.admin-filtro-btn[data-filtro]').forEach(b => {
      b.classList.toggle('active', b.dataset.filtro === filtro);
    });
    carregarJogadores(document.getElementById('admin-busca')?.value || '');
  }

  /* ════════════════════════════════════════════════════
     EXPORT CSV — JOGADORES
  ════════════════════════════════════════════════════ */
  async function exportarCSVJogadores() {
    try {
      const res = await _query({
        structuredQuery: {
          from: [{ collectionId: 'usuarios' }],
          select: { fields: [{ fieldPath: 'nome' }, { fieldPath: 'email' }, { fieldPath: 'mandatos' }, { fieldPath: 'melhorScore' }, { fieldPath: 'banido' }] }
        }
      });
      const rows = res.filter(r => r.document).map(r => {
        const d = _parseFields(r.document.fields);
        return `"${d.nome||''}","${d.email||''}","${d.mandatos||0}","${d.melhorScore||0}","${d.banido?'Banido':'Ativo'}"`;
      });
      if (!rows.length) { _showAdminToast('Nenhum jogador encontrado para exportar.', true); return; }
      const csv = 'Nome,E-mail,Mandatos,Score,Status\n' + rows.join('\n');
      _downloadCSV(csv, 'jogadores.csv');
    } catch(e) { _showAdminToast('Erro ao exportar: ' + e.message, true); }
  }

  /* ════════════════════════════════════════════════════
     EXPORT CSV — PÓDIO
  ════════════════════════════════════════════════════ */
  async function exportarCSVPodio() {
    try {
      const res = await _query({
        structuredQuery: {
          from: [{ collectionId: 'podio' }],
          select: { fields: [{ fieldPath: 'player' }, { fieldPath: 'melhorScore' }, { fieldPath: 'sector' }, { fieldPath: 'totalJogos' }, { fieldPath: 'ultimaPartida' }] }
        }
      });
      const items = res.filter(r => r.document)
        .map(r => _parseFields(r.document.fields))
        .sort((a,b) => (b.melhorScore||0) - (a.melhorScore||0));
      if (!items.length) { _showAdminToast('Pódio vazio, nada para exportar.', true); return; }
      const rows = items.map((p, i) =>
        `"${i+1}","${p.player||''}","${p.melhorScore||0}","${p.sector||''}","${p.totalJogos||0}","${p.ultimaPartida ? new Date(p.ultimaPartida).toLocaleDateString('pt-BR') : ''}"`
      );
      const csv = '#,Jogador,Score,Setor,Jogos,Última partida\n' + rows.join('\n');
      _downloadCSV(csv, 'podio.csv');
    } catch(e) { _showAdminToast('Erro ao exportar: ' + e.message, true); }
  }

  function _downloadCSV(csv, nome) {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = nome; a.click();
    URL.revokeObjectURL(url);
  }

  /* ════════════════════════════════════════════════════
     DASHBOARD
  ════════════════════════════════════════════════════ */
  let _periodoAtual = 'hoje';

  function mudarPeriodoDash(periodo) {
    _periodoAtual = periodo;
    document.querySelectorAll('.admin-periodo-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.periodo === periodo);
    });
    carregarDashboard();
  }

  async function carregarDashboard() {
    try {
      const res = await _query({
        structuredQuery: {
          from: [{ collectionId: 'podio' }],
          select: { fields: [{ fieldPath: 'melhorPorSetor' }, { fieldPath: 'totalJogos' }, { fieldPath: 'ultimaPartida' }] }
        }
      });
      const agora = Date.now();
      const limite = _periodoAtual === 'hoje' ? 86400000 : _periodoAtual === 'semana' ? 604800000 : 2592000000;
      const docs = res.filter(r => r.document).map(r => _parseFields(r.document.fields));
      const recentes = docs.filter(d => d.ultimaPartida && (agora - d.ultimaPartida) < limite);

      // Métricas gerais
      const partidas = recentes.reduce((a, d) => a + (d.totalJogos || 0), 0);
      const setoresCount = {};
      docs.forEach(d => {
        const mps = d.melhorPorSetor || {};
        Object.keys(mps).forEach(s => { setoresCount[s] = (setoresCount[s] || 0) + 1; });
      });
      const totalSetores = Object.keys(setoresCount).length;

      document.getElementById('dash-partidas').textContent = partidas || '—';
      document.getElementById('dash-setores').textContent  = totalSetores || '—';
      document.getElementById('dash-abandono').textContent = '—';

      // Setores mais jogados
      const setoresOrdenados = Object.entries(setoresCount).sort((a,b) => b[1]-a[1]);
      const maxCount = setoresOrdenados[0]?.[1] || 1;
      const setoresEl = document.getElementById('dash-setores-lista');
      setoresEl.innerHTML = setoresOrdenados.map(([s, c]) => `
        <div class="admin-dash-setor-row">
          <span class="admin-dash-setor-nome">${_emojiSetor(s)} ${s.charAt(0).toUpperCase()+s.slice(1)}</span>
          <div class="admin-dash-bar-track"><div class="admin-dash-bar-fill" style="width:${Math.round(c/maxCount*100)}%"></div></div>
          <span class="admin-dash-pct">${c}</span>
        </div>`).join('') || '<div class="admin-empty">Sem dados.</div>';

      // Abandono por rodada (baseado em stats/diario)
      try {
        const stats = await _get('stats/diario');
        const hoje = new Date().toISOString().slice(0,10);
        // Campo do dia é gravado como stringValue com JSON
        const rawHoje = stats.fields?.[hoje]?.stringValue;
        const dadosHoje = rawHoje ? JSON.parse(rawHoje) : {};
        const abandono = dadosHoje.abandonoPorRodada || {};
        const abEl = document.getElementById('dash-abandono-lista');
        const entradas = Object.entries(abandono).sort((a,b) => Number(a[0])-Number(b[0]));
        abEl.innerHTML = entradas.map(([r, v]) => `
          <div class="admin-dash-abandono-row">
            <span class="admin-dash-rod">R.${Number(r)+1}</span>
            <div class="admin-dash-bar-track"><div class="admin-dash-bar-fill" style="width:${Math.min(v,100)}%;background:#ef4444"></div></div>
            <span class="admin-dash-abandono-pct">${v}%</span>
          </div>`).join('') || '<div class="admin-empty" style="padding:8px 16px">Sem dados de abandono registrados.</div>';
      } catch(e) {
        document.getElementById('dash-abandono-lista').innerHTML = '<div class="admin-empty" style="padding:8px 16px">Sem dados.</div>';
      }
    } catch(e) {
      _showAdminError('admin-sec-dashboard', 'Erro: ' + e.message);
    }
  }

  /* ════════════════════════════════════════════════════
     HISTÓRIAS
  ════════════════════════════════════════════════════ */
  const _HISTORIAS_CONFIG = {
    tecnologia: [
      { id: 0, nome: 'SaaS B2B', sub: 'Dívida técnica e rotatividade' },
      { id: 1, nome: 'EdTech B2C', sub: 'Pós-pandemia e pivot' },
      { id: 2, nome: 'Scale-up de IA', sub: 'Pipeline travado' },
    ],
    varejo: [
      { id: 0, nome: 'Rede Omnichannel', sub: 'Margem em queda' },
      { id: 1, nome: 'Rede de Farmácias', sub: 'Concorrência nacional' },
      { id: 2, nome: 'Atacarejo Regional', sub: 'Expansão desequilibrada' },
    ],
    logistica: [
      { id: 0, nome: 'Last-Mile Delivery', sub: 'SLA em descumprimento' },
      { id: 1, nome: 'Cadeia do Frio', sub: 'Falha no monitoramento' },
      { id: 2, nome: 'Fulfillment E-commerce', sub: 'Volume no limite' },
    ],
    industria: [
      { id: 0, nome: 'Metalúrgica', sub: 'Segurança e ISO em risco' },
      { id: 1, nome: 'Embalagens ESG', sub: 'Adequação urgente' },
      { id: 2, nome: 'Química Ambiental', sub: 'Autuação do IBAMA' },
    ],
  };

  async function carregarHistorias() {
    const lista = document.getElementById('admin-historias-lista');
    lista.innerHTML = '<div class="admin-loading">Carregando...</div>';
    let estadoAtual = {};
    try {
      const snap = await _get('config/historias');
      estadoAtual = _parseFields(snap.fields || {});
    } catch(e) { /* sem doc ainda — todas ativas por padrão */ }

    let html = '';
    for (const [setor, historias] of Object.entries(_HISTORIAS_CONFIG)) {
      html += `<div class="admin-sec-title">${_emojiSetor(setor)} ${setor.charAt(0).toUpperCase()+setor.slice(1)}</div>`;
      historias.forEach(h => {
        const chave = `${setor}_${h.id}`;
        const ativa = estadoAtual[chave] !== false; // padrão: ativa
        html += `
          <div class="admin-historia-row">
            <div class="admin-historia-info">
              <div class="admin-historia-nome">${h.nome}</div>
              <div class="admin-historia-sub">${h.sub}</div>
            </div>
            <span class="admin-historia-badge ${ativa ? 'ativa' : 'inativa'}" id="hist-badge-${chave}">${ativa ? 'Ativa' : 'Inativa'}</span>
            <label class="admin-switch" style="margin-left:8px">
              <input type="checkbox" ${ativa ? 'checked' : ''} onchange="ADMIN.toggleHistoria('${chave}', this.checked)">
              <span class="admin-switch-track"></span>
            </label>
          </div>`;
      });
    }
    lista.innerHTML = html;
  }

  async function toggleHistoria(chave, ativa) {
    await _opFeedback({
      etapas: ['Verificando permissões…', `${ativa ? 'Ativando' : 'Desativando'} história…`],
      executar: async () => {
        const campos = { [chave]: _fsBool(ativa) };
        const mask   = Object.keys(campos).map(k => `updateMask.fieldPaths=${k}`).join('&');
        const tok    = await _token();
        const r = await fetch(`${FS}/config/historias?${mask}`, {
          method:  'PATCH',
          headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
          body:    JSON.stringify({ fields: campos })
        });
        if (!r.ok) { const b = await r.text(); throw new Error(`HTTP ${r.status}: ${b.slice(0,80)}`); }
        const badge = document.getElementById(`hist-badge-${chave}`);
        if (badge) {
          badge.textContent = ativa ? 'Ativa' : 'Inativa';
          badge.className   = `admin-historia-badge ${ativa ? 'ativa' : 'inativa'}`;
        }
        _registrarAuditoria(ativa ? `História ${chave} ativada` : `História ${chave} desativada`);
      },
      sucesso: ativa ? 'História ativada com sucesso!' : 'História desativada.',
    });
  }

  /* ════════════════════════════════════════════════════
     FEEDBACK
  ════════════════════════════════════════════════════ */
  async function carregarFeedback() {
    try {
      const res = await _query({
        structuredQuery: {
          from: [{ collectionId: 'feedbacks' }],
          orderBy: [{ field: { fieldPath: 'ts' }, direction: 'DESCENDING' }],
          limit: 50
        }
      });
      const docs = res.filter(r => r.document).map(r => _parseFields(r.document.fields));
      if (!docs.length) {
        document.getElementById('feedback-por-historia').innerHTML = '<div class="admin-empty">Sem feedbacks ainda.</div>';
        document.getElementById('feedback-recentes').innerHTML = '';
        return;
      }

      // Média geral
      const notas = docs.filter(d => d.nota).map(d => d.nota);
      const media = notas.length ? (notas.reduce((a,b) => a+b, 0) / notas.length).toFixed(1) : '—';
      document.getElementById('feedback-nota-media').textContent = media;
      document.getElementById('feedback-estrelas-media').textContent = '★'.repeat(Math.round(Number(media))) + '☆'.repeat(5 - Math.round(Number(media)));
      document.getElementById('feedback-total').textContent = `${notas.length} avaliações`;

      // Por história
      const porHist = {};
      docs.forEach(d => {
        const k = d.historiaId || 'geral';
        if (!porHist[k]) porHist[k] = { notas: [], nome: d.historiaId || 'Geral' };
        if (d.nota) porHist[k].notas.push(d.nota);
      });
      document.getElementById('feedback-por-historia').innerHTML = Object.entries(porHist).map(([k, v]) => {
        const m = v.notas.length ? (v.notas.reduce((a,b) => a+b, 0) / v.notas.length).toFixed(1) : '—';
        return `<div class="admin-feedback-hist-row">
          <span class="admin-feedback-hist-nome">${v.nome}</span>
          <span class="admin-feedback-hist-nota">★ ${m}</span>
          <span class="admin-feedback-hist-count">${v.notas.length} aval.</span>
        </div>`;
      }).join('');

      // Recentes com texto
      document.getElementById('feedback-recentes').innerHTML = docs.filter(d => d.texto).slice(0, 10).map(d => `
        <div class="admin-feedback-recente">
          <div class="admin-feedback-recente-header">
            <span class="admin-feedback-recente-nome">${d.nomeJogador || 'Jogador'}</span>
            <span class="admin-feedback-recente-estrelas">${'★'.repeat(d.nota||0)}</span>
          </div>
          <div class="admin-feedback-recente-texto">"${d.texto}"</div>
        </div>`).join('') || '<div class="admin-empty">Sem avaliações com texto.</div>';

    } catch(e) { _showAdminError('admin-sec-feedback', 'Erro: ' + e.message); }
  }

  /* ════════════════════════════════════════════════════
     SESSÕES — Firebase Realtime Database
  ════════════════════════════════════════════════════ */
  let _sessoesUnsubscribe = null; // guarda o unsubscribe do listener RTDB

  function carregarSessoes() {
    const lista = document.getElementById('admin-sessoes-lista');
    const contador = document.getElementById('sessoes-contador');
    if (!lista) return;

    // — RTDB (tempo real) —
    if (window.GSPRtdb) {
      const { db, ref, onValue } = window.GSPRtdb;

      // Cancela listener anterior se existir
      if (_sessoesUnsubscribe) { _sessoesUnsubscribe(); _sessoesUnsubscribe = null; }

      lista.innerHTML = '<div class="admin-loading">Conectando...</div>';
      if (contador) contador.textContent = '...';

      const presRef = ref(db, 'presence');
      _sessoesUnsubscribe = onValue(presRef, (snapshot) => {
        const dados = snapshot.val() || {};
        const jogadores = Object.values(dados).sort((a, b) => (b.ts || 0) - (a.ts || 0));

        const total = jogadores.length;
        if (contador) contador.textContent = `${total} online${total !== 1 ? 's' : ''}`;

        if (!total) {
          lista.innerHTML = '<div class="admin-empty">Nenhum jogador online no momento.</div>';
          return;
        }

        lista.innerHTML = jogadores.map(d => {
          const tempo = d.ts ? _tempoRelativo(d.ts) : '—';
          const emPartida = d.status !== 'home' && d.setor;
          const detalhe = emPartida
            ? `${_emojiSetor(d.setor)} ${(d.setor||'').charAt(0).toUpperCase()+(d.setor||'').slice(1)} · Rodada ${(d.rodada||0)+1} · ${d.companyName||''}`
            : '🏠 Na tela inicial';
          return `<div class="admin-sessao-row">
            <div class="admin-sessao-dot ativa"></div>
            <div class="admin-sessao-info">
              <div class="admin-sessao-nome">${d.nome || 'Jogador'}</div>
              <div class="admin-sessao-detalhe">${detalhe}</div>
            </div>
            <span class="admin-sessao-tempo">${tempo}</span>
          </div>`;
        }).join('');
      }, (err) => {
        lista.innerHTML = '<div class="admin-empty">Erro ao conectar ao Realtime DB.</div>';
        console.error('[Admin] RTDB sessões erro:', err);
      });
      return;
    }

    // — Fallback: Firestore REST —
    (async () => {
      lista.innerHTML = '<div class="admin-loading">Carregando...</div>';
      try {
        const res = await _query({
          structuredQuery: {
            from: [{ collectionId: 'sessoes' }],
            orderBy: [{ field: { fieldPath: 'ts' }, direction: 'DESCENDING' }],
            limit: 20
          }
        });
        const docs = res.filter(r => r.document).map(r => _parseFields(r.document.fields));
        const agora = Date.now();
        const ativas = docs.filter(d => d.ts && (agora - d.ts) < 300000).length;
        if (contador) contador.textContent = `${ativas} ativa${ativas !== 1 ? 's' : ''}`;
        if (!docs.length) { lista.innerHTML = '<div class="admin-empty">Sem sessões registradas.</div>'; return; }
        lista.innerHTML = docs.map(d => {
          const ativa = d.ts && (agora - d.ts) < 300000;
          const tempo = d.ts ? _tempoRelativo(d.ts) : '—';
          return `<div class="admin-sessao-row">
            <div class="admin-sessao-dot ${ativa ? 'ativa' : 'inativa'}"></div>
            <div class="admin-sessao-info">
              <div class="admin-sessao-nome">${d.nome || 'Jogador'}</div>
              <div class="admin-sessao-detalhe">${_emojiSetor(d.setor)} ${(d.setor||'').charAt(0).toUpperCase()+(d.setor||'').slice(1)} · Rodada ${(d.rodada||0)+1} · ${d.companyName||''}</div>
            </div>
            <span class="admin-sessao-tempo">${tempo}</span>
          </div>`;
        }).join('');
      } catch(e) { lista.innerHTML = '<div class="admin-empty">Erro ao carregar sessões.</div>'; }
    })();
  }

  /* ════════════════════════════════════════════════════
     LOGS
  ════════════════════════════════════════════════════ */
  let _filtroLogs = 'todos';

  function filtrarLogs(filtro) {
    _filtroLogs = filtro;
    document.querySelectorAll('#admin-sec-logs .admin-filtro-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.filtro === filtro);
    });
    carregarLogs();
  }

  async function carregarLogs() {
    const lista = document.getElementById('admin-logs-lista');
    lista.innerHTML = '<div class="admin-loading">Carregando...</div>';
    try {
      const res = await _query({
        structuredQuery: {
          from: [{ collectionId: 'logs' }],
          orderBy: [{ field: { fieldPath: 'ts' }, direction: 'DESCENDING' }],
          limit: 50
        }
      });
      let docs = res.filter(r => r.document).map(r => _parseFields(r.document.fields));
      if (_filtroLogs !== 'todos') docs = docs.filter(d => d.tipo === _filtroLogs);
      if (!docs.length) { lista.innerHTML = '<div class="admin-empty">Sem logs registrados.</div>'; return; }
      lista.innerHTML = docs.map(d => `
        <div class="admin-log-row">
          <div class="admin-log-header">
            <span class="admin-log-tipo ${d.tipo||'aviso'}">${(d.tipo||'aviso').toUpperCase()}</span>
            <span class="admin-log-tempo">${d.ts ? _formatarDataHora(d.ts) : '—'}</span>
          </div>
          <div class="admin-log-msg">${d.msg || '—'}</div>
          <div class="admin-log-meta">${d.nomeJogador||''} ${d.versao ? '· v'+d.versao.slice(0,7) : ''} ${d.setor ? '· '+d.setor : ''}</div>
        </div>`).join('');
    } catch(e) { lista.innerHTML = '<div class="admin-empty">Sem logs ou erro ao carregar.</div>'; }
  }

  /* ════════════════════════════════════════════════════
     LOG DE AUDITORIA
  ════════════════════════════════════════════════════ */
  async function _registrarAuditoria(acao) {
    try {
      const ts   = Date.now().toString();
      const user = window._player;
      const nome = user?.nome || 'Admin';
      const uid  = user?.uid  || 'desconhecido';
      await _patch(`auditoria/${ts}`, {
        acao:  _fsStr(acao),
        uid:   _fsStr(uid),
        nome:  _fsStr(nome),
        ts:    _fsInt(Date.now()),
      });
    } catch(e) { /* silencioso */ }
  }

  async function carregarAuditLog() {
    const el = document.getElementById('admin-audit-log');
    if (!el) return;
    try {
      const res = await _query({
        structuredQuery: {
          from: [{ collectionId: 'auditoria' }],
          orderBy: [{ field: { fieldPath: 'ts' }, direction: 'DESCENDING' }],
          limit: 20
        }
      });
      const docs = res.filter(r => r.document).map(r => ({
        ..._parseFields(r.document.fields),
        _id: r.document.name.split('/').pop()
      }));
      const isOwner = window._player?.uid && window._player.uid === _adminOwner;
      const limparBtn = isOwner
        ? `<button class="admin-btn admin-btn-danger" style="margin-bottom:8px;font-size:.75rem" onclick="ADMIN.limparAuditLog()">🗑 Limpar log</button>`
        : '';
      if (!docs.length) {
        el.innerHTML = limparBtn + '<div class="admin-empty">Sem registros.</div>';
        return;
      }
      el.innerHTML = limparBtn + docs.map(d => `
        <div class="admin-audit-row">
          <span class="admin-audit-quem">Admin — ${d.nome || d.uid?.slice(0,8) || 'desconhecido'}</span>
          <span> — ${d.acao||''}</span>
          <span class="admin-audit-quando"> · ${d.ts ? _formatarDataHora(d.ts) : ''}</span>
        </div>`).join('');
    } catch(e) { el.innerHTML = '<div class="admin-empty">Sem registros.</div>'; }
  }

  async function limparAuditLog() {
    if (!confirm('Limpar todo o log de auditoria? Esta ação não pode ser desfeita.')) return;
    let _total = 0;

    await _opFeedback({
      etapas: [
        'Verificando permissões…',
        'Buscando registros de auditoria…',
        'Apagando entradas…',
      ],
      executar: async () => {
        const res = await _query({
          structuredQuery: { from: [{ collectionId: 'auditoria' }], limit: 100 }
        });
        const ids = res.filter(r => r.document).map(r => r.document.name.split('/').pop());
        _total = ids.length;
        const tok = await _token();
        await Promise.all(ids.map(id =>
          fetch(`${FS}/auditoria/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok}` } })
        ));
      },
      sucesso: `${_total} registro(s) de auditoria removidos.`,
      onSucesso: () => carregarAuditLog(),
    });
  }

  /* ════════════════════════════════════════════════════
     AGENDAMENTO DE MANUTENÇÃO
  ════════════════════════════════════════════════════ */
  async function carregarConfigGlobal() {
    try {
      const doc = await _get('config/global');
      const cfg = _parseFields(doc.fields || {});
      const cb = document.getElementById('admin-manutencao');
      if (cb) cb.checked = !!cfg.manutencao;
      const banner = document.getElementById('admin-manutencao-banner');
      if (banner) banner.style.display = cfg.manutencao ? 'block' : 'none';
      const cbSala = document.getElementById('admin-modo-sala');
      if (cbSala) cbSala.checked = !!cfg.modoSalaAtivo;
      const inicio = document.getElementById('admin-manut-inicio');
      const fim    = document.getElementById('admin-manut-fim');
      if (inicio) inicio.value = cfg.manutencaoInicio || '';
      if (fim)    fim.value    = cfg.manutencaoFim    || '';
      const mensagemEl = document.getElementById('admin-manut-mensagem');
      if (mensagemEl) mensagemEl.value = cfg.mensagem || '';
    } catch(e) { console.warn('[ADMIN] Config:', e); }
    // Admins
    carregarAdmins();
    // Inicia polling de revogação de acesso (30s)
    _iniciarPollingAdmin();
  }

  const _SECOES = [
    { id: 'visao-geral', label: '📊 Geral'      },
    { id: 'jogadores',   label: '👥 Jogadores'   },
    { id: 'mensagens',   label: '✉️ Mensagens'   },
    { id: 'podio',       label: '🏆 Pódio'       },
    { id: 'dashboard',   label: '📈 Dashboard'   },
    { id: 'historias',   label: '🎮 Histórias'   },
    { id: 'feedback',    label: '💬 Feedback'    },
    { id: 'sessoes',     label: '🖥️ Sessões'     },
    { id: 'versao',      label: '🔖 Versão'      },
    { id: 'logs',        label: '🐛 Logs'        },
    { id: 'config',      label: '⚙️ Config'      },
  ];

  async function carregarAdmins() {
    try {
      const doc = await _get('config/admins');
      _adminUids       = _val(doc.fields?.uids)        || [];
      _adminOwner      = _val(doc.fields?.owner)       || '';
      _adminPermissoes = _val(doc.fields?.permissoes)  || {};
      _adminNomes      = _val(doc.fields?.nomes)       || {};

      // Registra/atualiza o displayName do admin logado no campo nomes
      const meUID  = window._player?.uid  || '';
      const meNome = window._player?.nome || '';
      if (meUID && meNome && _adminNomes[meUID] !== meNome) {
        _gravarNomeAdmin(meUID, meNome).catch(() => {});
      }

      // Sincroniza RTDB sempre que o painel carrega
      await _rtdbSyncAdmins(_adminUids, _adminOwner);
      _renderAdminLista();
      _aplicarPermissoesNav();
    } catch(e) { console.warn('[ADMIN] carregarAdmins:', e); }
  }

  // Grava apenas o mapa "nomes" no config/admins (permitido pelas Firestore Rules para qualquer admin)
  async function _gravarNomeAdmin(uid, nome) {
    try {
      const nomes = { ..._adminNomes, [uid]: nome };
      const tok   = await _token();
      const r = await fetch(`${FS}/config/admins?updateMask.fieldPaths=nomes`, {
        method:  'PATCH',
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: {
          nomes: { mapValue: { fields: Object.fromEntries(
            Object.entries(nomes).map(([k, v]) => [k, { stringValue: v }])
          )}}
        }})
      });
      if (r.ok) _adminNomes = nomes;
    } catch(e) { /* silencioso — não crítico */ }
  }

  function _renderAdminLista() {
    const lista = document.getElementById('admin-admins-lista');
    if (!lista) return;
    const meUID = window._player?.uid || '';
    if (!_adminUids.length) {
      lista.innerHTML = '<div class="admin-empty">Nenhum admin cadastrado.</div>';
      return;
    }
    lista.innerHTML = _adminUids.map(u => {
      const isOwner    = u === _adminOwner;
      const isMe       = u === meUID;
      const perms      = Array.isArray(_adminPermissoes[u]) ? _adminPermissoes[u] : _SECOES.map(s => s.id);
      const nomeExib   = _adminNomes[u] || '';
      const uidCurto   = u.slice(0, 10) + '…';

      const permBtns = isOwner
        ? '<span style="font-size:.7rem;color:var(--warn);font-weight:700">👑 Owner</span>'
        : `<button class="admin-btn-sm" style="background:var(--bg3);border:1px solid var(--line2)" onclick="ADMIN.abrirPermissoes('${u}')">⚙️ Permissões</button>
           <button class="admin-btn-sm admin-btn-danger" onclick="ADMIN.removerAdmin('${u}')">✕</button>`;

      const meBadge = isMe
        ? '<span style="font-size:.6rem;background:rgba(201,151,58,.15);color:var(--gold);border:1px solid var(--gold-bd);border-radius:4px;padding:1px 5px;font-weight:700;flex-shrink:0">você</span>'
        : '';

      const permInfo = isOwner ? '' : `<span style="font-size:.65rem;color:var(--t3)">(${perms.length}/${_SECOES.length} seções)</span>`;

      return `
        <div class="admin-uid-row" style="flex-wrap:wrap;gap:6px;align-items:center">
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
            <div style="display:flex;align-items:center;gap:6px;min-width:0">
              ${nomeExib
                ? `<span style="font-size:.88rem;font-weight:700;color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${nomeExib}</span>`
                : `<span style="font-size:.82rem;color:var(--t2);font-family:var(--mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${uidCurto}</span>`
              }
              ${meBadge}
            </div>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:.68rem;color:var(--t3);font-family:var(--mono)">${nomeExib ? uidCurto : ''}</span>
              ${permInfo}
            </div>
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0">${permBtns}</div>
        </div>`;
    }).join('');
  }

  function _aplicarPermissoesNav() {
    const meUID = window._player?.uid || '';
    if (!meUID || meUID === _adminOwner) {
      // Owner: garante que todos os botões aparecem
      document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.style.display = '');
      _esconderOverlayBloqueio();
      return;
    }

    const perms = Array.isArray(_adminPermissoes[meUID]) ? _adminPermissoes[meUID] : null;

    // Admin com zero permissões ativas → overlay de sem-permissão
    if (perms && perms.length === 0) {
      _mostrarOverlaySemPermissao();
      return;
    }

    _esconderOverlayBloqueio();

    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      const sec = btn.dataset.sec;
      // null = sem restrição definida ainda → mostra tudo
      btn.style.display = (!perms || perms.includes(sec)) ? '' : 'none';
    });

    // Se a seção atual não é mais permitida, redireciona para a primeira disponível
    const primeiraBtnVisivel = document.querySelector('.admin-nav-btn:not([style*="none"])');
    if (perms && !perms.includes(_currentSection) && primeiraBtnVisivel) {
      primeiraBtnVisivel.click();
    }
  }

  /* ── OVERLAYS DE BLOQUEIO ───────────────────────── */
  function _mostrarOverlayAcessoRevogado() {
    let ov = document.getElementById('admin-overlay-revogado');
    if (!ov) return;
    ov.style.display = 'flex';
  }

  function _mostrarOverlaySemPermissao() {
    let ov = document.getElementById('admin-overlay-sem-permissao');
    if (!ov) return;
    // Esconde o conteúdo principal mas não o nav (admin ainda está logado)
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.style.display = 'none');
    ov.style.display = 'flex';
  }

  function _esconderOverlayBloqueio() {
    const ov1 = document.getElementById('admin-overlay-revogado');
    const ov2 = document.getElementById('admin-overlay-sem-permissao');
    if (ov1) ov1.style.display = 'none';
    if (ov2) ov2.style.display = 'none';
  }

  /* ── POLLING: revogação imediata de acesso ──────── */
  function _iniciarPollingAdmin() {
    if (_pollingAdminInterval) return; // já rodando
    _pollingAdminInterval = setInterval(_verificarAcessoAdmin, 30_000);
  }

  function _pararPollingAdmin() {
    if (_pollingAdminInterval) {
      clearInterval(_pollingAdminInterval);
      _pollingAdminInterval = null;
    }
  }

  async function _verificarAcessoAdmin() {
    const meUID = window._player?.uid || '';
    if (!meUID) return;
    try {
      const doc = await _get('config/admins');
      const uids       = _val(doc.fields?.uids)        || [];
      const owner      = _val(doc.fields?.owner)       || '';
      const permissoes = _val(doc.fields?.permissoes)  || {};
      const nomes      = _val(doc.fields?.nomes)       || {};

      // ① Acesso totalmente revogado (UID removido da lista)
      const aindaAdmin = uids.includes(meUID) || meUID === owner;
      if (!aindaAdmin) {
        _pararPollingAdmin();
        _mostrarOverlayAcessoRevogado();
        return;
      }

      // ② Atualiza estado local sem precisar chamar carregarAdmins inteiro
      const permAntes = JSON.stringify(_adminPermissoes[meUID] ?? null);
      _adminUids       = uids;
      _adminOwner      = owner;
      _adminPermissoes = permissoes;
      _adminNomes      = nomes;

      // Reavalia permissões se mudaram
      const permDepois = JSON.stringify(_adminPermissoes[meUID] ?? null);
      if (permAntes !== permDepois) {
        _renderAdminLista();
        _aplicarPermissoesNav();
      }
    } catch(e) {
      console.warn('[ADMIN] polling verificação de acesso falhou:', e?.message);
    }
  }

  function abrirPermissoes(uid) {
    const perms      = Array.isArray(_adminPermissoes[uid]) ? _adminPermissoes[uid] : _SECOES.map(s => s.id);
    const nomeExib   = _adminNomes[uid] || uid.slice(0, 14) + '…';
    const temTodasPerms = perms.length === _SECOES.length;
    const modal = document.getElementById('admin-modal');
    const body  = document.getElementById('admin-modal-body');
    if (!modal || !body) return;

    const tituloEl = document.getElementById('admin-modal-title');
    if (tituloEl) tituloEl.textContent = '⚙️ Permissões';

    body.innerHTML = `
      <div style="padding:16px 20px">
        <div style="font-size:.8rem;color:var(--t3);margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--line)">
          Editando acesso de <strong style="color:var(--t1)">${nomeExib}</strong>
          <span style="display:block;font-size:.68rem;font-family:var(--mono);color:var(--t3);margin-top:2px">${uid}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <span style="font-size:.75rem;color:var(--t3)">${perms.length}/${_SECOES.length} seções ativas</span>
          <button onclick="(function(){
              document.querySelectorAll('#admin-modal-body input[data-perm]').forEach(c=>c.checked=true);
            })()" style="font-size:.7rem;background:transparent;border:none;color:var(--gold);cursor:pointer;padding:0">
            Marcar todas
          </button>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${_SECOES.map(s => `
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px 10px;border-radius:var(--r);background:var(--bg3);border:1px solid var(--line);transition:border-color .15s"
              onmouseover="this.style.borderColor='var(--line2)'" onmouseout="this.style.borderColor='var(--line)'">
              <input type="checkbox" data-perm="${s.id}" ${perms.includes(s.id) ? 'checked' : ''}
                style="width:15px;height:15px;accent-color:var(--gold);flex-shrink:0">
              <span style="font-size:.84rem;color:var(--t1)">${s.label}</span>
            </label>`).join('')}
        </div>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="admin-btn admin-btn-ok" style="flex:1" onclick="ADMIN.salvarPermissoes('${uid}')">✅ Salvar</button>
          <button class="admin-btn" style="flex:1;background:var(--bg3);border:1px solid var(--line2);color:var(--t2);text-transform:none;letter-spacing:0;font-weight:600" onclick="ADMIN.fecharModal()">Cancelar</button>
        </div>
      </div>`;
    modal.style.display = 'flex';
  }

  async function salvarPermissoes(uid) {
    const checkboxes  = document.querySelectorAll('#admin-modal-body input[data-perm]');
    const selecionadas = Array.from(checkboxes).filter(c => c.checked).map(c => c.dataset.perm);
    const nomeExib    = _adminNomes[uid] || uid.slice(0,10) + '…';

    await _opFeedback({
      etapas: [
        'Verificando permissões…',
        `Salvando acesso de ${nomeExib}…`,
      ],
      executar: async () => {
        const novasPermissoes = { ..._adminPermissoes, [uid]: selecionadas };
        const tok = await _token();
        const r = await fetch(`${FS}/config/admins?updateMask.fieldPaths=permissoes`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: {
            permissoes: { mapValue: { fields: Object.fromEntries(
              Object.entries(novasPermissoes).map(([k, v]) => [k, {
                arrayValue: { values: v.map(s => ({ stringValue: s })) }
              }])
            )}}
          }})
        });
        if (!r.ok) { const b = await r.text(); throw new Error(`HTTP ${r.status}: ${b.slice(0,80)}`); }
        _adminPermissoes = novasPermissoes;
        _registrarAuditoria(`Permissões de ${uid.slice(0,8)} atualizadas`);
      },
      sucesso: `${selecionadas.length} seção(ões) salvas para ${nomeExib}`,
      onSucesso: () => { fecharModal(); _renderAdminLista(); },
    });
  }

  async function salvarConfigGlobal() {
    const manut    = document.getElementById('admin-manutencao')?.checked || false;
    const inicio   = document.getElementById('admin-manut-inicio')?.value || '';
    const fim      = document.getElementById('admin-manut-fim')?.value    || '';
    const modoSala = document.getElementById('admin-modo-sala')?.checked  || false;
    const mensagem = document.getElementById('admin-manut-mensagem')?.value.trim() || '';

    await _opFeedback({
      etapas: [
        'Verificando permissões…',
        'Gravando configurações globais…',
        'Registrando auditoria…',
      ],
      executar: async () => {
        await _patch('config/global', {
          manutencao:       _fsBool(manut),
          manutencaoInicio: _fsStr(inicio),
          manutencaoFim:    _fsStr(fim),
          modoSalaAtivo:    _fsBool(modoSala),
          mensagem:         _fsStr(mensagem),
        });
        const banner = document.getElementById('admin-manutencao-banner');
        if (banner) banner.style.display = manut ? 'block' : 'none';
        _registrarAuditoria(manut ? 'Manutenção ativada' : 'Manutenção desativada');
        if (modoSala !== undefined) _registrarAuditoria(modoSala ? 'Modo Sala ativado' : 'Modo Sala desativado');
      },
      sucesso: 'Configurações globais salvas com sucesso!',
    });
  }

  /* ════════════════════════════════════════════════════
     HELPERS UTILITÁRIOS
  ════════════════════════════════════════════════════ */
  function _tempoRelativo(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60)  return `${diff}s atrás`;
    if (diff < 3600) return `${Math.floor(diff/60)}min atrás`;
    return `${Math.floor(diff/3600)}h atrás`;
  }

  function _formatarDataHora(ts) {
    try {
      const d = new Date(typeof ts === 'string' ? ts : Number(ts));
      return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
    } catch(e) { return '—'; }
  }

  return {
    verificarAdmin, verificarBan, _getBanInfo, verificarMensagemGlobal, toggleLiberado,
    irParaSecao,
    carregarJogadores, verHistoricoJogador, toggleBan,
    filtrarJogadores, exportarCSVJogadores, exportarCSVPodio,
    removerDoPodio, resetarPodioPorSetor, resetarPodioTotal,
    carregarConfigGlobal, salvarConfigGlobal,
    adicionarAdmin, removerAdmin, carregarAdmins, abrirPermissoes, salvarPermissoes,
    _iniciarPollingAdmin, _pararPollingAdmin, _verificarAcessoAdmin,
    limparAuditLog,
    fecharModal,
    abrirModalInbox, fecharModalInbox, enviarMensagemInbox, enviarMensagemTodos,
    abrirNovaMsg, fecharNovaMsg, enviarNovaMsg, selecionarCategoria,
    carregarMensagens, apagarMensagemLog, apagarTodasMensagens,
    abrirBroadcast, fecharBroadcast, confirmarBroadcast,
    toggleDropdown, selecionarSetor,
    abrirModalMsg, fecharModalMsg, salvarMensagemGlobal, limparMensagemGlobal,
    abrirModalBan, fecharModalBan, confirmarBan, selecionarMotivo, _atualizarContadorDetalhe,
    carregarVersao, salvarChangelog,
    carregarDashboard, mudarPeriodoDash,
    carregarHistorias, toggleHistoria,
    carregarFeedback,
    carregarSessoes,
    filtrarLogs,
    carregarAuditLog, carregarAoVivo,
  };

})();

window.ADMIN = ADMIN;
