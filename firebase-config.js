import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, signInWithRedirect, getRedirectResult,
  GoogleAuthProvider, sendPasswordResetEmail,
  onAuthStateChanged, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeFirestore }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyB_Zkl12AyT5RMfg9eJ68QFTakdBKSioVU",
  authDomain:        "under-pressure-49320.firebaseapp.com",
  projectId:         "under-pressure-49320",
  storageBucket:     "under-pressure-49320.firebasestorage.app",
  messagingSenderId: "240438805750",
  appId:             "1:240438805750:web:9e090a1be367fea18f58d7"
};

const PROJECT_ID = "under-pressure-49320";

let app, auth, googleProvider;
let _firebaseReady = false;
let _cachedAuthUser = undefined; // undefined = ainda não resolveu, null = sem usuário

async function _getToken() {
  if (!auth) return null;
  const user = auth.currentUser || await new Promise(r => {
    const unsub = onAuthStateChanged(auth, u => { unsub(); r(u); });
    setTimeout(() => r(null), 4000);
  });
  return user ? user.getIdToken() : null;
}

if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("COLE_AQUI")) {
  try {
    app            = initializeApp(firebaseConfig);
    auth           = getAuth(app);
    initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
    googleProvider = new GoogleAuthProvider();
    _firebaseReady = true;
    // Captura usuário imediatamente ao inicializar
    let _redirectDone = false;
    onAuthStateChanged(auth, (user) => {
      // Só atualiza após o redirect ter sido processado
      if (_redirectDone) {
        _cachedAuthUser = user || null;
      } else if (user) {
        _cachedAuthUser = user;
      }
    });
    getRedirectResult(auth).then(cred => {
      _redirectDone = true;
      if (cred?.user) {
        _cachedAuthUser = cred.user;
        const u = cred.user;
        const nome = u.displayName || u.email?.split('@')[0] || 'Jogador';
        const player = { uid: u.uid, nome, email: u.email, tipo: 'user' };
        try { localStorage.setItem('gsp_player', JSON.stringify(player)); } catch(e) {}
        // Avisa o _boot imediatamente via evento
        window.dispatchEvent(new CustomEvent('gsp-redirect-login', { detail: player }));
      } else {
        if (_cachedAuthUser === undefined) _cachedAuthUser = null;
      }
    }).catch(() => {
      _redirectDone = true;
      if (_cachedAuthUser === undefined) _cachedAuthUser = null;
    });
    window._gspFirebaseReady = true;
  } catch (e) {
    console.warn("[GSP] Erro ao inicializar Firebase:", e.message);
    window._gspFirebaseReady = false;
  }
} else {
  window._gspFirebaseReady = false;
}

window.dispatchEvent(new Event('gsp-firebase-loaded'));

window.GSPAuth = {
  isReady: () => _firebaseReady,
  getToken: () => _getToken(),

  async cadastrar({ nome, email, senha }) {
    if (!_firebaseReady) throw new Error("Firebase não configurado.");
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    await updateProfile(cred.user, { displayName: nome });
    await GSPAuth._salvarPerfil(cred.user, nome);
    return { uid: cred.user.uid, nome, email, tipo: "user" };
  },

  async login({ email, senha }) {
    if (!_firebaseReady) throw new Error("Firebase não configurado.");
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    const nome = cred.user.displayName || email.split("@")[0];
    await GSPAuth._salvarPerfil(cred.user, nome);
    return { uid: cred.user.uid, nome, email, tipo: "user" };
  },

  async loginGoogle() {
    if (!_firebaseReady) throw new Error("Firebase não configurado.");
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const nome = cred.user.displayName || cred.user.email.split("@")[0];
      await GSPAuth._salvarPerfil(cred.user, nome);
      return { uid: cred.user.uid, nome, email: cred.user.email, tipo: "user" };
    } catch (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      throw e;
    }
  },

  async recuperarSenha(email) {
    if (!_firebaseReady) throw new Error("Firebase não configurado.");
    await sendPasswordResetEmail(auth, email);
  },

  async logout() {
    if (_firebaseReady) await signOut(auth);
  },

  onAuthChange(callback) {
    if (!_firebaseReady) return;
    onAuthStateChanged(auth, user => {
      if (user) callback({ uid: user.uid, nome: user.displayName || user.email, email: user.email, tipo: "user" });
      else callback(null);
    });
  },

  async waitForAuthReady() {
    if (!_firebaseReady || !auth) return null;
    // Aguarda cache ser preenchido (onAuthStateChanged + getRedirectResult)
    let t = 0;
    while (_cachedAuthUser === undefined && t < 80) {
      await new Promise(r => setTimeout(r, 100));
      t++;
    }
    return _cachedAuthUser || null;
  },

  async _salvarPerfil(user, nome) {
    try {
      // Aguarda token ficar disponível (até 5s)
      let token = null;
      for (let i = 0; i < 10; i++) {
        token = await _getToken();
        if (token) break;
        await new Promise(r => setTimeout(r, 500));
      }
      if (!token) { console.warn("[GSP] _salvarPerfil: sem token"); return; }
      // FIX: apenas nome e email — nunca sobrescrever mandatos/melhorScore (resetaria stats do jogador)
      const url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents/usuarios/" + user.uid + "?updateMask.fieldPaths=nome&updateMask.fieldPaths=email";
      const body = { fields: {
        nome:  { stringValue: nome || '' },
        email: { stringValue: user.email || '' },
      }};
      await fetch(url, { method: 'PATCH', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } catch (e) { console.warn("[GSP] _salvarPerfil:", e.message); }
  },
};

// Retorna o nome da empresa do melhor score geral
function _melhorEmpresa(melhorPorSetor) {
  if (!melhorPorSetor) return '';
  return Object.values(melhorPorSetor)
    .sort((a, b) => b.score - a.score)[0]?.companyName || '';
}
// Retorna o setor do melhor score geral
function _melhorSetor(melhorPorSetor) {
  if (!melhorPorSetor) return '';
  return Object.entries(melhorPorSetor)
    .sort((a, b) => b[1].score - a[1].score)[0]?.[0] || '';
}

window.GSPSync = {

  async salvarSessao(uid, dados) {
    if (!uid) return;
    try {
      const token = await _getToken();
      if (!token) return;
      const url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents/usuarios/" + uid + "/dados/sessao";
      const fields = {};
      for (const [k, v] of Object.entries(dados)) {
        if (typeof v === 'number') fields[k] = { integerValue: String(v) };
        else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
        else if (v === null || v === undefined) fields[k] = { nullValue: null };
        else fields[k] = { stringValue: String(v) };
      }
      fields.ts = { timestampValue: new Date().toISOString() };
      await fetch(url, { method: 'PATCH', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) });
    } catch (e) { console.warn("[GSP] salvarSessao:", e.message); }
  },

  async carregarSessao(uid) {
    if (!uid) return null;
    try {
      const token = await _getToken();
      if (!token) return null;
      const url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents/usuarios/" + uid + "/dados/sessao";
      const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.fields) return null;
      const f = data.fields;
      const result = {};
      for (const [k, v] of Object.entries(f)) {
        if (v.integerValue !== undefined) result[k] = parseInt(v.integerValue);
        else if (v.doubleValue !== undefined) result[k] = parseFloat(v.doubleValue);
        else if (v.booleanValue !== undefined) result[k] = v.booleanValue;
        else if (v.stringValue !== undefined) result[k] = v.stringValue;
        else if (v.timestampValue !== undefined) result[k] = new Date(v.timestampValue).getTime();
        else result[k] = null;
      }
      return result;
    } catch (e) { return null; }
  },

  async limparSessao(uid) {
    if (!uid) return;
    try {
      const token = await _getToken();
      if (!token) return;
      const url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents/usuarios/" + uid + "/dados/sessao";
      await fetch(url, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
    } catch (e) {}
  },

  async salvarPartida(uid, entrada) {
    const token = await _getToken();
    if (!token) throw new Error('sem auth');

    // 1. Salva no histórico
    const urlHist = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents/usuarios/" + uid + "/historico";
    const bodyHist = { fields: {
      player:      { stringValue:  entrada.player      || '' },
      score:       { integerValue: String(entrada.score       || 0) },
      scoreGestor: { integerValue: String(entrada.scoreGestor || 0) },
      sector:      { stringValue:  entrada.sector      || '' },
      companyName: { stringValue:  entrada.companyName || '' },
      uid:         { stringValue:  uid },
      ts:          { timestampValue: new Date().toISOString() }
    }};
    const r = await fetch(urlHist, { method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(bodyHist) });
    if (!r.ok) { const t = await r.text(); throw new Error('HTTP ' + r.status + ': ' + t.slice(0,100)); }

    // 2. Atualiza mandatos e melhorScore em /usuarios/{uid}
    try {
      const urlPerfil = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents/usuarios/" + uid;
      // Lê valores atuais
      const getRes = await fetch(urlPerfil, { headers: { 'Authorization': 'Bearer ' + token } });
      let mandatosAtual = 0;
      let melhorScoreAtual = 0;
      if (getRes.ok) {
        const atual = await getRes.json();
        mandatosAtual    = parseInt(atual.fields?.mandatos?.integerValue    || 0);
        melhorScoreAtual = parseInt(atual.fields?.melhorScore?.integerValue || 0);
      }
      const novoMandatos    = mandatosAtual + 1;
      const novoMelhorScore = Math.max(melhorScoreAtual, entrada.score || 0);
      await fetch(urlPerfil + "?updateMask.fieldPaths=mandatos&updateMask.fieldPaths=melhorScore", {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: {
          mandatos:    { integerValue: String(novoMandatos) },
          melhorScore: { integerValue: String(novoMelhorScore) },
        }})
      });
    } catch(e) { console.warn('[GSP] salvarPartida perfil:', e.message); }

    return r.json();
  },

  async carregarHistorico(uid, maximo = 20) {
    if (!uid) return [];
    try {
      const token = await _getToken();
      if (!token) return [];
      const url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents:runQuery";
      const body = {
        structuredQuery: {
          from: [{ collectionId: "historico", allDescendants: false }],
          where: {
            fieldFilter: {
              field: { fieldPath: "uid" },
              op: "EQUAL",
              value: { stringValue: uid }
            }
          },
          orderBy: [{ field: { fieldPath: "ts" }, direction: "DESCENDING" }],
          limit: maximo
        }
      };
      // runQuery deve ser feito no contexto do usuário para subcoleção
      const urlUser = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents/usuarios/" + uid + ":runQuery";
      const res = await fetch(urlUser, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "historico" }],
            orderBy: [{ field: { fieldPath: "ts" }, direction: "DESCENDING" }],
            limit: maximo
          }
        })
      });
      if (!res.ok) return [];
      const rows = await res.json();
      const _pi = v => parseInt(v?.integerValue ?? v?.doubleValue ?? 0);
      return rows
        .filter(r => r.document)
        .map(r => {
          const f = r.document.fields || {};
          return {
            id:          r.document.name.split('/').pop(),
            player:      f.player?.stringValue      || '',
            score:       _pi(f.score),
            scoreGestor: _pi(f.scoreGestor),
            sector:      f.sector?.stringValue      || '',
            companyName: f.companyName?.stringValue || '',
            uid:         f.uid?.stringValue         || uid,
            ts:          f.ts?.timestampValue ? new Date(f.ts.timestampValue).getTime() : Date.now(),
          };
        });
    } catch (e) { console.warn('[GSP] carregarHistorico:', e.message); return []; }
  },

  async salvarNoPodio(uid, entrada) {
    const token = await _getToken();
    if (!token) throw new Error('sem auth');
    const setor = entrada.sector || '';
    const score = entrada.score  || 0;
    const url   = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents/podio/" + uid;

    let melhorScore    = score;
    let totalJogos     = 1;
    let melhorPorSetor = {};
    let playerNome     = entrada.player || '';

    const getRes = await fetch(url, { headers: { "Authorization": "Bearer " + token } });
    if (getRes.ok) {
      const atual = await getRes.json();
      const f = atual.fields || {};
      const raw = f.melhorPorSetor?.mapValue?.fields || {};
      for (const [s, v] of Object.entries(raw)) {
        melhorPorSetor[s] = {
          score:       parseInt(v.mapValue?.fields?.score?.integerValue || 0),
          scoreGestor: parseInt(v.mapValue?.fields?.scoreGestor?.integerValue || 0),
          companyName: v.mapValue?.fields?.companyName?.stringValue || '',
        };
      }
      melhorScore = Math.max(parseInt(f.melhorScore?.integerValue || 0), score);
      totalJogos  = parseInt(f.totalJogos?.integerValue || 0) + 1;
      playerNome  = entrada.player || f.player?.stringValue || '';
    }

    if (!melhorPorSetor[setor] || score > melhorPorSetor[setor].score) {
      melhorPorSetor[setor] = { score, scoreGestor: entrada.scoreGestor || 0, companyName: entrada.companyName || '' };
    }

    const melhorPorSetorFields = {};
    for (const [s, v] of Object.entries(melhorPorSetor)) {
      melhorPorSetorFields[s] = { mapValue: { fields: {
        score:       { integerValue: String(v.score) },
        scoreGestor: { integerValue: String(v.scoreGestor || 0) },
        companyName: { stringValue:  v.companyName || '' },
      }}};
    }

    const body = { fields: {
      uid:           { stringValue:  uid },
      player:        { stringValue:  playerNome },
      melhorScore:   { integerValue: String(melhorScore) },
      totalJogos:    { integerValue: String(totalJogos) },
      ultimaPartida: { timestampValue: new Date().toISOString() },
      melhorPorSetor: { mapValue: { fields: melhorPorSetorFields } },
    }};

    const patchRes = await fetch(url, { method: 'PATCH', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!patchRes.ok) { const t = await patchRes.text(); throw new Error('HTTP ' + patchRes.status + ': ' + t.slice(0,100)); }
    return patchRes.json();
  },


  async carregarPodio(sector = null) {
    try {
      const token = await _getToken();
      const url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents:runQuery";
      const body = {
        structuredQuery: {
          from: [{ collectionId: "podio" }],
          limit: 50
        }
      };
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = "Bearer " + token;

      const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) {
        const t = await res.text();
        console.error("[GSP] runQuery erro:", res.status, t.slice(0,200));
        return [];
      }
      const rows = await res.json();

      const _pi = v => parseInt(v?.integerValue ?? v?.doubleValue ?? 0);

      const todos = rows
        .filter(r => r.document)
        .map(r => {
          const f = r.document.fields || {};
          const raw = f.melhorPorSetor?.mapValue?.fields || {};
          const melhorPorSetor = {};
          for (const [s, v] of Object.entries(raw)) {
            melhorPorSetor[s] = {
              score:       _pi(v.mapValue?.fields?.score),
              scoreGestor: _pi(v.mapValue?.fields?.scoreGestor),
              companyName: v.mapValue?.fields?.companyName?.stringValue || '',
            };
          }
          return {
            uid:           f.uid?.stringValue || '',
            player:        f.player?.stringValue || '',
            melhorScore:   _pi(f.melhorScore),
            totalJogos:    _pi(f.totalJogos) || 1,
            ultimaPartida: f.ultimaPartida?.timestampValue || null,
            melhorPorSetor,
          };
        })
        .filter(p => p.uid && p.melhorScore > 0);


      const isAll = !sector || sector === "all";
      if (isAll) {
        return todos
          .sort((a, b) => b.melhorScore - a.melhorScore)
          .slice(0, 20)
          .map(p => ({
            ...p,
            ts:          p.ultimaPartida ? new Date(p.ultimaPartida).getTime() : Date.now(),
            score:       p.melhorScore,
            companyName: _melhorEmpresa(p.melhorPorSetor),
            sector:      _melhorSetor(p.melhorPorSetor),
          }));
      }
      return todos
        .filter(p => p.melhorPorSetor?.[sector])
        .map(p => {
          const s = p.melhorPorSetor[sector];
          return { ...p, ts: p.ultimaPartida ? new Date(p.ultimaPartida).getTime() : Date.now(), score: s.score, companyName: s.companyName, sector };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

    } catch(e) { console.error("[GSP] carregarPodio ERRO:", e.code, e.message); return []; }
  },


  async carregarPerfil(uid) {
    if (!uid) return null;
    try {
      const token = await _getToken();
      if (!token) return null;
      const url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents/usuarios/" + uid;
      const res = await fetch(url, { headers: { "Authorization": "Bearer " + token } });
      if (!res.ok) return null;
      const data = await res.json();
      const f = data.fields || {};
      const _pi = v => parseInt(v?.integerValue ?? v?.doubleValue ?? 0);
      return {
        nome:        f.nome?.stringValue  || '',
        email:       f.email?.stringValue || '',
        mandatos:    _pi(f.mandatos),
        melhorScore: _pi(f.melhorScore),
      };
    } catch (e) { console.warn('[GSP] carregarPerfil:', e.message); return null; }
  },
};


/* ════════════════════════════════════════════════════
   GSPSalas — Sprint 1: Sala básica
════════════════════════════════════════════════════ */
window.GSPSalas = {

  /* ── Helpers internos ── */
  _url(path) {
    return "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents/" + path;
  },

  _pi(v) { return parseInt(v?.integerValue ?? v?.doubleValue ?? 0); },

  _toFields(obj) {
    const f = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === null || v === undefined) f[k] = { nullValue: null };
      else if (typeof v === 'boolean')   f[k] = { booleanValue: v };
      else if (typeof v === 'number')    f[k] = { integerValue: String(v) };
      else                               f[k] = { stringValue: String(v) };
    }
    return f;
  },

  _fromFields(fields = {}) {
    const obj = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v.integerValue  !== undefined) obj[k] = parseInt(v.integerValue);
      else if (v.doubleValue   !== undefined) obj[k] = parseFloat(v.doubleValue);
      else if (v.booleanValue  !== undefined) obj[k] = v.booleanValue;
      else if (v.stringValue   !== undefined) obj[k] = v.stringValue;
      else if (v.timestampValue !== undefined) obj[k] = new Date(v.timestampValue).getTime();
      else if (v.nullValue     !== undefined) obj[k] = null;
      else obj[k] = null;
    }
    return obj;
  },

  _gerarCodigo() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem I,O,0,1 — evita confusão visual
    let cod = '';
    for (let i = 0; i < 6; i++) cod += chars[Math.floor(Math.random() * chars.length)];
    return cod;
  },

  /* ── criarSala ──────────────────────────────────────
     Só admins podem criar. Verifica /config/admins antes.
     Retorna { codigo, ...dadosSala } ou lança erro.
  ──────────────────────────────────────────────────── */
  async criarSala({ uid, nomeSala, modoSetor, setorFixo, limiteGrupos, minMembros, maxMembros }) {
    const token = await _getToken();
    if (!token) throw new Error('sem_auth');

    // Verifica se é admin
    const adminRes = await fetch(this._url('config/admins'), {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!adminRes.ok) throw new Error('sem_permissao');
    const adminData = await adminRes.json();
    const uids = adminData.fields?.uids?.arrayValue?.values?.map(v => v.stringValue) || [];
    if (!uids.includes(uid)) throw new Error('sem_permissao');

    // Gera código único (tenta até 5 vezes)
    let codigo = null;
    for (let i = 0; i < 5; i++) {
      const tentativa = this._gerarCodigo();
      const check = await fetch(this._url('salas/' + tentativa), {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!check.ok) { codigo = tentativa; break; } // 404 = livre
    }
    if (!codigo) throw new Error('codigo_indisponivel');

    const body = { fields: this._toFields({
      nome:        nomeSala || 'Sala sem nome',
      criadaPor:   uid,
      criadaEm:    Date.now(),
      ativa:       true,
      arquivada:   false,
      modoSetor:   modoSetor   || 'livre',      // 'livre' | 'fixo'
      setorFixo:   setorFixo   || '',
      limiteGrupos: limiteGrupos || 4,
      minMembros:   minMembros   || 2,
      maxMembros:   maxMembros   || 6,
      cicloAtual:   1,
      podioVisivel: false,
    })};

    // Adiciona criadaEm como timestamp real
    body.fields.criadaEm = { timestampValue: new Date().toISOString() };

    const res = await fetch(this._url('salas/' + codigo), {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) { const t = await res.text(); throw new Error('HTTP ' + res.status + ': ' + t.slice(0,100)); }

    return { codigo, nomeSala, modoSetor, setorFixo, limiteGrupos, minMembros, maxMembros };
  },

  /* ── carregarSala ───────────────────────────────────
     Valida e retorna dados da sala pelo código.
     Lança 'sala_nao_encontrada' ou 'sala_inativa'.
  ──────────────────────────────────────────────────── */
  async carregarSala(codigo) {
    const token = await _getToken();
    if (!token) throw new Error('sem_auth');

    const cod = (codigo || '').toUpperCase().trim();
    if (!cod) throw new Error('codigo_invalido');

    const res = await fetch(this._url('salas/' + cod), {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('sala_nao_encontrada');

    const data = await res.json();
    if (!data.fields) throw new Error('sala_nao_encontrada');

    const sala = this._fromFields(data.fields);
    if (!sala.ativa) throw new Error('sala_inativa');

    return { codigo: cod, ...sala };
  },

  /* ── entrarSala ─────────────────────────────────────
     Registra o jogador como membro da sala.
     Salva em salas/{codigo}/membros/{uid}
  ──────────────────────────────────────────────────── */
  async entrarSala(codigo, { uid, nome }) {
    const token = await _getToken();
    if (!token) throw new Error('sem_auth');

    // Confirma que sala existe e está ativa
    await this.carregarSala(codigo);

    const cod = codigo.toUpperCase().trim();
    const body = { fields: this._toFields({ uid, nome, entrou: Date.now() }) };
    body.fields.entrou = { timestampValue: new Date().toISOString() };

    const res = await fetch(this._url('salas/' + cod + '/membros/' + uid), {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) { const t = await res.text(); throw new Error('HTTP ' + res.status + ': ' + t.slice(0,100)); }
    return true;
  },

  /* ── carregarMembrosSala ────────────────────────────
     Retorna lista de membros da sala via runQuery.
  ──────────────────────────────────────────────────── */
  async carregarMembrosSala(codigo) {
    const token = await _getToken();
    if (!token) return [];

    const cod = (codigo || '').toUpperCase().trim();
    const url = this._url('salas/' + cod + '/membros:runQuery').replace('/membros:runQuery', ':runQuery');
    // runQuery na subcoleção membros
    const runUrl = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents/salas/" + cod + ":runQuery";

    const res = await fetch(runUrl, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'membros' }],
          limit: 100
        }
      })
    });
    if (!res.ok) return [];

    const rows = await res.json();
    return rows
      .filter(r => r.document)
      .map(r => this._fromFields(r.document.fields || {}));
  },

  /* ── encerrarSala ───────────────────────────────────
     Marca sala como inativa e arquivada.
     Só o criadoPor ou admin pode encerrar.
  ──────────────────────────────────────────────────── */
  async encerrarSala(codigo, uid) {
    const token = await _getToken();
    if (!token) throw new Error('sem_auth');

    const cod = (codigo || '').toUpperCase().trim();
    const sala = await this.carregarSala(cod);
    if (sala.criadaPor !== uid) {
      // Verifica se é admin
      const adminRes = await fetch(this._url('config/admins'), {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        const uids = adminData.fields?.uids?.arrayValue?.values?.map(v => v.stringValue) || [];
        if (!uids.includes(uid)) throw new Error('sem_permissao');
      } else {
        throw new Error('sem_permissao');
      }
    }

    const url = this._url('salas/' + cod) + '?updateMask.fieldPaths=ativa&updateMask.fieldPaths=arquivada&updateMask.fieldPaths=encerradaEm';
    const body = { fields: {
      ativa:       { booleanValue: false },
      arquivada:   { booleanValue: true },
      encerradaEm: { timestampValue: new Date().toISOString() },
    }};

    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) { const t = await res.text(); throw new Error('HTTP ' + res.status + ': ' + t.slice(0,100)); }
    return true;
  },

  /* ── carregarPodioSala ──────────────────────────────
     Retorna pódio de grupos de um ciclo específico.
  ──────────────────────────────────────────────────── */
  async carregarPodioSala(codigo, ciclo = 1) {
    const token = await _getToken();
    if (!token) return [];

    const cod = (codigo || '').toUpperCase().trim();
    const runUrl = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents/salas/" + cod + ":runQuery";

    const res = await fetch(runUrl, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'podio' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'ciclo' },
              op: 'EQUAL',
              value: { integerValue: String(ciclo) }
            }
          },
          orderBy: [{ field: { fieldPath: 'score' }, direction: 'DESCENDING' }],
          limit: 50
        }
      })
    });
    if (!res.ok) return [];

    const rows = await res.json();
    return rows
      .filter(r => r.document)
      .map(r => this._fromFields(r.document.fields || {}))
      .sort((a, b) => b.score - a.score);
  },

  /* ── salvarNoPodioSala ──────────────────────────────
     Salva resultado de uma partida colaborativa no pódio da sala.
     docId = codigo_grupo para deduplicar por grupo+ciclo.
  ──────────────────────────────────────────────────── */
  async salvarNoPodioSala(codigo, { grupo, cor, membros, score, sector, ciclo, resumo }) {
    const token = await _getToken();
    if (!token) throw new Error('sem_auth');

    const cod     = (codigo || '').toUpperCase().trim();
    const docId   = encodeURIComponent(grupo + '_ciclo' + ciclo);
    const url     = this._url('salas/' + cod + '/podio/' + docId);

    // Lê score atual para manter só o melhor
    let melhorScore = score;
    const getRes = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
    if (getRes.ok) {
      const atual = await getRes.json();
      const scoreAtual = parseInt(atual.fields?.score?.integerValue || 0);
      if (scoreAtual >= score) return true; // já tem score melhor, não sobrescreve
      melhorScore = score;
    }

    const body = { fields: {
      grupo:    { stringValue:  grupo   || '' },
      cor:      { stringValue:  cor     || '#888' },
      sector:   { stringValue:  sector  || '' },
      ciclo:    { integerValue: String(ciclo || 1) },
      score:    { integerValue: String(melhorScore) },
      ts:       { timestampValue: new Date().toISOString() },
      membros:  { arrayValue: { values: (membros || []).map(m => ({ stringValue: String(m) })) } },
      resumo:   { stringValue: JSON.stringify(resumo || {}) },
    }};

    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) { const t = await res.text(); throw new Error('HTTP ' + res.status + ': ' + t.slice(0,100)); }
    return true;
  },
};
