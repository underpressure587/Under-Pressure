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
import {
  getDatabase, ref as rtdbRef, set as rtdbSet,
  onDisconnect, onValue, serverTimestamp as rtdbServerTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey:            "AIzaSyB_Zkl12AyT5RMfg9eJ68QFTakdBKSioVU",
  authDomain:        "under-pressure-49320.firebaseapp.com",
  projectId:         "under-pressure-49320",
  storageBucket:     "under-pressure-49320.firebasestorage.app",
  messagingSenderId: "240438805750",
  appId:             "1:240438805750:web:9e090a1be367fea18f58d7",
  databaseURL: "https://under-pressure-49320-default-rtdb.firebaseio.com",
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

    // Realtime Database — presença em tempo real
    if (firebaseConfig.databaseURL && !firebaseConfig.databaseURL.startsWith('COLE_AQUI')) {
      try {
        const rtdb = getDatabase(app);
        window.GSPRtdb = { db: rtdb, ref: rtdbRef, set: rtdbSet, onDisconnect, onValue, serverTimestamp: rtdbServerTimestamp };
      } catch(e) {
        console.warn('[GSP] RTDB não inicializado:', e.message);
        window.GSPRtdb = null;
      }
    } else {
      window.GSPRtdb = null;
    }
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
  isGoogleUser: () => { const u = _cachedAuthUser || auth?.currentUser; return !!u?.providerData?.some(p => p.providerId === 'google.com'); },
  getPhotoURL: () => { const u = _cachedAuthUser || auth?.currentUser; return u?.photoURL || null; },

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
      return { uid: cred.user.uid, nome, email: cred.user.email, tipo: "google", photoURL: cred.user.photoURL || null };
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
      const isGoogle = user.providerData?.some(p => p.providerId === "google.com");
      if (user) callback({ uid: user.uid, nome: user.displayName || user.email, email: user.email, tipo: isGoogle ? "google" : "user", photoURL: isGoogle ? (user.photoURL || null) : null });
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
      photoURL:      { stringValue: entrada.photoURL || '' },
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
            photoURL:      f.photoURL?.stringValue || null,
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

/* ════════════════════════════════════════════════════
   GSPSalas — Sprint 2: Grupos
════════════════════════════════════════════════════ */
Object.assign(window.GSPSalas, {

  /* ── criarGrupo ─────────────────────────────────────
     Jogador cria um grupo novo na sala.
     Ele vira o líder automaticamente (primeiro a entrar).
     Valida limite de grupos definido pelo anfitrião.
  ──────────────────────────────────────────────────── */
  async criarGrupo(codigo, { uid, nome, nomeGrupo, cor }) {
    const token = await _getToken();
    if (!token) throw new Error('sem_auth');

    const cod = (codigo || '').toUpperCase().trim();

    // Carrega config da sala para verificar limite
    const sala = await this.carregarSala(cod);
    if (!sala.aberta && sala.aberta !== undefined) throw new Error('sala_fechada');

    // Conta grupos existentes
    const gruposExist = await this.carregarGrupos(cod);
    if (gruposExist.length >= (sala.limiteGrupos || 99)) throw new Error('limite_grupos');

    // Verifica se nome já existe
    const nomeNorm = (nomeGrupo || '').trim();
    if (!nomeNorm) throw new Error('nome_invalido');
    if (gruposExist.some(g => g.nomeGrupo?.toLowerCase() === nomeNorm.toLowerCase())) {
      throw new Error('nome_duplicado');
    }

    const docId = encodeURIComponent(nomeNorm);
    const url   = this._url('salas/' + cod + '/grupos/' + docId);

    const body = { fields: {
      nomeGrupo:   { stringValue:  nomeNorm },
      cor:         { stringValue:  cor || '#888' },
      lider:       { stringValue:  uid },
      liderNome:   { stringValue:  nome || '' },
      membros:     { arrayValue:   { values: [{ stringValue: uid }] } },
      statusCiclo: { stringValue:  'aguardando' },
      criadoEm:    { timestampValue: new Date().toISOString() },
    }};

    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) { const t = await res.text(); throw new Error('HTTP ' + res.status + ': ' + t.slice(0,100)); }

    // Registra membro no grupo
    await this._registrarMembroGrupo(cod, nomeNorm, uid, nome);
    return { nomeGrupo: nomeNorm, cor, lider: uid };
  },

  /* ── entrarGrupo ────────────────────────────────────
     Jogador entra em grupo existente.
     Valida maxMembros da sala.
  ──────────────────────────────────────────────────── */
  async entrarGrupo(codigo, { uid, nome, nomeGrupo }) {
    const token = await _getToken();
    if (!token) throw new Error('sem_auth');

    const cod     = (codigo || '').toUpperCase().trim();
    const sala    = await this.carregarSala(cod);
    const docId   = encodeURIComponent((nomeGrupo || '').trim());
    const urlGrupo = this._url('salas/' + cod + '/grupos/' + docId);

    // Lê grupo atual
    const getRes = await fetch(urlGrupo, { headers: { 'Authorization': 'Bearer ' + token } });
    if (!getRes.ok) throw new Error('grupo_nao_encontrado');
    const data = await getRes.json();
    const f    = data.fields || {};

    // Checa limite de membros
    const membrosAtuais = (f.membros?.arrayValue?.values || []).map(v => v.stringValue);
    if (membrosAtuais.includes(uid)) return true; // já está no grupo
    if (membrosAtuais.length >= (sala.maxMembros || 99)) throw new Error('grupo_cheio');

    // Verifica se statusCiclo permite entrada
    const status = f.statusCiclo?.stringValue || 'aguardando';
    if (status === 'jogando') throw new Error('partida_em_curso');

    // Adiciona uid ao array membros
    membrosAtuais.push(uid);
    const urlPatch = urlGrupo + '?updateMask.fieldPaths=membros';
    const body = { fields: {
      membros: { arrayValue: { values: membrosAtuais.map(m => ({ stringValue: m })) } }
    }};

    const res = await fetch(urlPatch, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) { const t = await res.text(); throw new Error('HTTP ' + res.status + ': ' + t.slice(0,100)); }

    await this._registrarMembroGrupo(cod, nomeGrupo, uid, nome);
    return true;
  },

  /* ── _registrarMembroGrupo ──────────────────────────
     Salva em salas/{cod}/membros/{uid} o grupo do jogador.
  ──────────────────────────────────────────────────── */
  async _registrarMembroGrupo(cod, nomeGrupo, uid, nome) {
    const token = await _getToken();
    if (!token) return;
    const url = this._url('salas/' + cod + '/membros/' + uid);
    const body = { fields: this._toFields({ uid, nome: nome || '', grupo: nomeGrupo, entrou: Date.now() }) };
    body.fields.entrou = { timestampValue: new Date().toISOString() };
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).catch(() => {});
  },

  /* ── carregarGrupos ─────────────────────────────────
     Lista todos os grupos da sala com contagem de membros.
  ──────────────────────────────────────────────────── */
  async carregarGrupos(codigo) {
    const token = await _getToken();
    if (!token) return [];

    const cod    = (codigo || '').toUpperCase().trim();
    const runUrl = 'https://firestore.googleapis.com/v1/projects/' + PROJECT_ID +
                   '/databases/default/documents/salas/' + cod + ':runQuery';

    const res = await fetch(runUrl, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'grupos' }],
          orderBy: [{ field: { fieldPath: 'criadoEm' }, direction: 'ASCENDING' }],
          limit: 50
        }
      })
    });
    if (!res.ok) return [];

    const rows = await res.json();
    return rows
      .filter(r => r.document)
      .map(r => {
        const f = r.document.fields || {};
        return {
          nomeGrupo:   f.nomeGrupo?.stringValue   || '',
          cor:         f.cor?.stringValue          || '#888',
          lider:       f.lider?.stringValue        || '',
          liderNome:   f.liderNome?.stringValue    || '',
          statusCiclo: f.statusCiclo?.stringValue  || 'aguardando',
          membros:     (f.membros?.arrayValue?.values || []).map(v => v.stringValue),
        };
      });
  },

  /* ── transferirLideranca ────────────────────────────
     Líder atual ou anfitrião transfere liderança para outro membro.
  ──────────────────────────────────────────────────── */
  async transferirLideranca(codigo, nomeGrupo, { solicitanteUid, novoLiderUid, novoLiderNome }) {
    const token = await _getToken();
    if (!token) throw new Error('sem_auth');

    const cod    = (codigo || '').toUpperCase().trim();
    const sala   = await this.carregarSala(cod);
    const docId  = encodeURIComponent((nomeGrupo || '').trim());
    const url    = this._url('salas/' + cod + '/grupos/' + docId);

    // Lê grupo
    const getRes = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
    if (!getRes.ok) throw new Error('grupo_nao_encontrado');
    const data = await getRes.json();
    const f    = data.fields || {};

    const liderAtual = f.lider?.stringValue || '';
    const isAnfitriao = sala.criadaPor === solicitanteUid;
    const isLider    = liderAtual === solicitanteUid;
    if (!isLider && !isAnfitriao) throw new Error('sem_permissao');

    // Verifica se novo líder é membro
    const membros = (f.membros?.arrayValue?.values || []).map(v => v.stringValue);
    if (!membros.includes(novoLiderUid)) throw new Error('nao_e_membro');

    const urlPatch = url + '?updateMask.fieldPaths=lider&updateMask.fieldPaths=liderNome';
    const body = { fields: {
      lider:     { stringValue: novoLiderUid },
      liderNome: { stringValue: novoLiderNome || '' },
    }};

    const res = await fetch(urlPatch, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) { const t = await res.text(); throw new Error('HTTP ' + res.status + ': ' + t.slice(0,100)); }
    return true;
  },

  /* ── moverMembro ────────────────────────────────────
     Anfitrião move um jogador de grupo (remove do atual, entra no novo).
  ──────────────────────────────────────────────────── */
  async moverMembro(codigo, { uid, grupoAtual, grupoDestino }) {
    const token = await _getToken();
    if (!token) throw new Error('sem_auth');

    const cod = (codigo || '').toUpperCase().trim();

    // Remove do grupo atual
    if (grupoAtual) {
      const urlAtual = this._url('salas/' + cod + '/grupos/' + encodeURIComponent(grupoAtual));
      const getRes   = await fetch(urlAtual, { headers: { 'Authorization': 'Bearer ' + token } });
      if (getRes.ok) {
        const data    = await getRes.json();
        const membros = (data.fields?.membros?.arrayValue?.values || [])
          .map(v => v.stringValue).filter(m => m !== uid);
        await fetch(urlAtual + '?updateMask.fieldPaths=membros', {
          method: 'PATCH',
          headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: {
            membros: { arrayValue: { values: membros.map(m => ({ stringValue: m })) } }
          }})
        });
      }
    }

    // Entra no grupo destino
    if (grupoDestino) {
      await this.entrarGrupo(cod, { uid, nomeGrupo: grupoDestino });
    }
    return true;
  },
});

/* ════════════════════════════════════════════════════
   GSPSalas — Sprints 3-6: Lobby, Votação, Ciclo, Admin
════════════════════════════════════════════════════ */
Object.assign(window.GSPSalas, {

  /* ── criarPartida ───────────────────────────────────
     Cria doc da partida colaborativa em salas/{cod}/partidas/{id}
  ──────────────────────────────────────────────────── */
  async criarPartida(codigo, { grupo, sector, totalRodadas, timerSegundos, ciclo, jogadores }) {
    const token = await _getToken();
    if (!token) throw new Error('sem_auth');
    const cod  = (codigo || '').toUpperCase().trim();
    const id   = grupo + '_ciclo' + ciclo;
    const url  = this._url('salas/' + cod + '/partidas/' + encodeURIComponent(id));
    const body = { fields: {
      grupo:        { stringValue:  grupo },
      ciclo:        { integerValue: String(ciclo || 1) },
      sector:       { stringValue:  sector || '' },
      status:       { stringValue:  'lobby' },
      rodadaAtual:  { integerValue: '0' },
      totalRodadas: { integerValue: String(totalRodadas || 15) },
      timerSegundos:{ integerValue: String(timerSegundos || 60) },
      processando:  { booleanValue: false },
      score:        { integerValue: '0' },
      criadaEm:     { timestampValue: new Date().toISOString() },
      jogadores:    { stringValue: JSON.stringify(jogadores || {}) },
      votos:        { stringValue: '{}' },
      sinais:       { stringValue: '{}' },
      papeis:       { stringValue: '{}' },
      online:       { stringValue: '{}' },
      indicators:   { stringValue: '{}' },
      situacaoAtual:{ stringValue: '{}' },
      decisaoFinal: { stringValue: '' },
      fase:         { stringValue: 'lobby' },
      faseInicio:   { stringValue: new Date().toISOString() },
      faseDuracao:  { integerValue: '4' },
      placarGrupos: { stringValue: '[]' },
    }};
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) { const t = await res.text(); throw new Error('HTTP ' + res.status + ': ' + t.slice(0,100)); }
    return id;
  },

  /* ── carregarEstadoPartida ──────────────────────────
     Lê estado atual da partida (polling).
  ──────────────────────────────────────────────────── */
  async carregarEstadoPartida(codigo, partidaId) {
    const token = await _getToken();
    if (!token) return null;
    const cod = (codigo || '').toUpperCase().trim();
    const url = this._url('salas/' + cod + '/partidas/' + encodeURIComponent(partidaId));
    const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.fields) return null;
    const f = data.fields;
    return {
      grupo:        f.grupo?.stringValue        || '',
      ciclo:        parseInt(f.ciclo?.integerValue || 1),
      sector:       f.sector?.stringValue       || '',
      status:       f.status?.stringValue       || 'lobby',
      rodadaAtual:  parseInt(f.rodadaAtual?.integerValue  || 0),
      totalRodadas: parseInt(f.totalRodadas?.integerValue || 15),
      timerSegundos:parseInt(f.timerSegundos?.integerValue|| 60),
      processando:  f.processando?.booleanValue ?? false,
      score:        parseInt(f.score?.integerValue || 0),
      jogadores:    JSON.parse(f.jogadores?.stringValue    || '{}'),
      votos:        JSON.parse(f.votos?.stringValue        || '{}'),
      online:       JSON.parse(f.online?.stringValue       || '{}'),
      indicators:   JSON.parse(f.indicators?.stringValue   || '{}'),
      situacaoAtual:JSON.parse(f.situacaoAtual?.stringValue|| '{}'),
      decisaoFinal: f.decisaoFinal?.stringValue || '',
      timerInicio:  f.timerInicio?.stringValue  || null,
      fase:         f.fase?.stringValue         || 'votacao',
      faseInicio:   f.faseInicio?.stringValue   || null,
      faseDuracao:  parseInt(f.faseDuracao?.integerValue || 30),
      sinais:       JSON.parse(f.sinais?.stringValue      || '{}'),
      papeis:       JSON.parse(f.papeis?.stringValue      || '{}'),
      placarGrupos: JSON.parse(f.placarGrupos?.stringValue|| '[]'),
    };
  },

  /* ── patchPartida ───────────────────────────────────
     Atualiza campos específicos da partida via PATCH.
  ──────────────────────────────────────────────────── */
  async patchPartida(codigo, partidaId, fields) {
    const token = await _getToken();
    if (!token) throw new Error('sem_auth');
    const cod   = (codigo || '').toUpperCase().trim();
    const url   = this._url('salas/' + cod + '/partidas/' + encodeURIComponent(partidaId));
    const mask  = Object.keys(fields).map(k => 'updateMask.fieldPaths=' + k).join('&');
    const body  = { fields };
    const res   = await fetch(url + '?' + mask, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) { const t = await res.text(); throw new Error('HTTP ' + res.status + ': ' + t.slice(0,100)); }
    return true;
  },

  /* ── heartbeat ──────────────────────────────────────
     Marca jogador como online. Chama a cada 5s.
  ──────────────────────────────────────────────────── */
  async heartbeat(codigo, partidaId, uid) {
    try {
      const estado = await this.carregarEstadoPartida(codigo, partidaId);
      if (!estado) return;
      const online = estado.online || {};
      online[uid]  = Date.now();
      // Remove jogadores offline (>15s sem heartbeat)
      const agora  = Date.now();
      Object.keys(online).forEach(k => { if (agora - online[k] > 15000) delete online[k]; });
      await this.patchPartida(codigo, partidaId, {
        online: { stringValue: JSON.stringify(online) }
      });
    } catch(e) { /* silencioso — heartbeat não pode travar a UI */ }
  },

  /* ── registrarVoto ──────────────────────────────────
     Salva voto do jogador. Detecta se todos votaram → chama processarRodada.
  ──────────────────────────────────────────────────── */
  async registrarVoto(codigo, partidaId, uid, opcao) {
    const estado = await this.carregarEstadoPartida(codigo, partidaId);
    if (!estado || estado.status !== 'votando') return false;
    if (estado.processando) return false;

    const votos = estado.votos || {};
    votos[uid]  = opcao;

    await this.patchPartida(codigo, partidaId, {
      votos: { stringValue: JSON.stringify(votos) }
    });

    // Verifica se todos os jogadores online votaram
    const online   = estado.online || {};
    const onlineIds= Object.keys(online).filter(k => Date.now() - online[k] < 15000);
    const votaram  = onlineIds.filter(k => votos[k]);

    if (votaram.length >= onlineIds.length && onlineIds.length > 0) {
      await this._tentarProcessarRodada(codigo, partidaId);
    }
    return true;
  },

  /* ── _tentarProcessarRodada ─────────────────────────
     Flag processando:true para evitar duplicação.
     Calcula decisão majoritária e avança estado.
  ──────────────────────────────────────────────────── */
  async _tentarProcessarRodada(codigo, partidaId) {
    try {
      // Trava processamento
      const estado = await this.carregarEstadoPartida(codigo, partidaId);
      if (!estado || estado.processando) return;

      await this.patchPartida(codigo, partidaId, {
        processando: { booleanValue: true }
      });

      const votos   = estado.votos || {};
      const jogadores = estado.jogadores || {};
      const lider   = Object.keys(jogadores)[0]; // primeiro = líder

      // Conta votos — suporta string ('A') e objeto ({letra:'A', confianca:'moderado'})
      const contagem = {};
      Object.values(votos).forEach(v => {
        const letra = typeof v === 'object' ? v.letra : v;
        if (letra) contagem[letra] = (contagem[letra] || 0) + 1;
      });

      const votoLider = typeof votos[lider] === 'object' ? votos[lider]?.letra : votos[lider];
      let decisao = null;
      if (Object.keys(contagem).length === 0) {
        decisao = votoLider || 'A';
      } else {
        const max = Math.max(...Object.values(contagem));
        const empatados = Object.keys(contagem).filter(k => contagem[k] === max);
        if (empatados.length === 1) {
          decisao = empatados[0];
        } else {
          decisao = empatados.includes(votoLider) ? votoLider : empatados[0];
        }
      }

      await this.patchPartida(codigo, partidaId, {
        decisaoFinal: { stringValue: decisao },
        status:       { stringValue: 'revelando' },
        processando:  { booleanValue: false },
      });
    } catch(e) {
      console.error('[GSPSalas] _tentarProcessarRodada:', e.message);
      // Destravar em caso de erro
      try {
        await this.patchPartida(codigo, partidaId, { processando: { booleanValue: false } });
      } catch(e2) {}
    }
  },

  /* ── avancarRodada ──────────────────────────────────
     Após revelar decisão, aplica efeitos e avança rodada.
     Chamado pelo cliente após animação de revelação.
  ──────────────────────────────────────────────────── */
  async avancarRodada(codigo, partidaId, { novaRodada, indicators, score, situacaoAtual, status, fase, faseInicio, faseDuracao, votos, sinais, decisaoFinal, papeis }) {
    const fields = {
      rodadaAtual:   { integerValue: String(novaRodada) },
      indicators:    { stringValue: JSON.stringify(indicators || {}) },
      score:         { integerValue: String(score || 0) },
      situacaoAtual: { stringValue: JSON.stringify(situacaoAtual || {}) },
      votos:         { stringValue: JSON.stringify(votos || {}) },
      sinais:        { stringValue: JSON.stringify(sinais || {}) },
      decisaoFinal:  { stringValue: decisaoFinal || '' },
      status:        { stringValue: status || 'votando' },
      timerInicio:   { stringValue: new Date().toISOString() },
      processando:   { booleanValue: false },
    };
    if (fase         !== undefined) fields.fase        = { stringValue: fase };
    if (faseInicio   !== undefined) fields.faseInicio  = { stringValue: new Date(faseInicio).toISOString() };
    if (faseDuracao  !== undefined) fields.faseDuracao = { integerValue: String(faseDuracao) };
    if (papeis       !== undefined) fields.papeis      = { stringValue: JSON.stringify(papeis) };
    await this.patchPartida(codigo, partidaId, fields);
  },

  /* ── iniciarPartida ─────────────────────────────────
     Muda status para em_jogo + define timerInicio.
  ──────────────────────────────────────────────────── */
  async iniciarPartida(codigo, partidaId, { sector, indicators, situacaoAtual, fase, faseInicio, faseDuracao, papeis }) {
    await this.patchPartida(codigo, partidaId, {
      status:        { stringValue: 'votando' },
      sector:        { stringValue: sector || '' },
      indicators:    { stringValue: JSON.stringify(indicators || {}) },
      situacaoAtual: { stringValue: JSON.stringify(situacaoAtual || {}) },
      timerInicio:   { stringValue: new Date().toISOString() },
      votos:         { stringValue: '{}' },
      sinais:        { stringValue: '{}' },
      fase:          { stringValue: fase || 'alerta' },
      faseInicio:    { stringValue: faseInicio ? new Date(faseInicio).toISOString() : new Date().toISOString() },
      faseDuracao:   { integerValue: String(faseDuracao || 4) },
      papeis:        { stringValue: JSON.stringify(papeis || {}) },
    });
  },

  /* ── avancarFase ────────────────────────────────────
     Avança a fase interna da rodada (alerta→deliberacao→votacao→revelacao→impacto→placar).
     Chamado pelo líder após timer esgotar.
  ──────────────────────────────────────────────────── */
  async avancarFase(codigo, partidaId, { fase, faseInicio, faseDuracao, decisaoFinal, indicators, placarGrupos }) {
    const fields = {
      fase:       { stringValue: fase || 'votacao' },
      faseInicio: { stringValue: faseInicio ? new Date(faseInicio).toISOString() : new Date().toISOString() },
      faseDuracao:{ integerValue: String(faseDuracao || 30) },
    };
    if (decisaoFinal !== undefined) fields.decisaoFinal = { stringValue: decisaoFinal || '' };
    if (indicators   !== undefined) fields.indicators   = { stringValue: JSON.stringify(indicators) };
    if (placarGrupos !== undefined) fields.placarGrupos = { stringValue: JSON.stringify(placarGrupos) };
    // Na transição para votacao: limpa votos e sinais
    if (fase === 'votacao') {
      fields.votos  = { stringValue: '{}' };
      fields.sinais = { stringValue: '{}' };
    }
    await this.patchPartida(codigo, partidaId, fields);
  },

  /* ── registrarSinal ─────────────────────────────────
     Salva sinal de comunicação do jogador (ex: 🔴 Risco alto).
  ──────────────────────────────────────────────────── */
  async registrarSinal(codigo, partidaId, uid, sinalId) {
    if (!uid || !sinalId) return false;
    try {
      const estado = await this.carregarEstadoPartida(codigo, partidaId);
      if (!estado) return false;
      const sinais = estado.sinais || {};
      sinais[uid]  = sinalId;
      await this.patchPartida(codigo, partidaId, {
        sinais: { stringValue: JSON.stringify(sinais) }
      });
      return true;
    } catch(e) { return false; }
  },

  /* ── registrarVotoCompleto ──────────────────────────
     Salva voto com objeto {letra, confianca}. Detecta todos votaram → processa.
  ──────────────────────────────────────────────────── */
  async registrarVotoCompleto(codigo, partidaId, uid, { letra, confianca }) {
    const estado = await this.carregarEstadoPartida(codigo, partidaId);
    if (!estado || estado.status !== 'votando') return false;
    if (estado.processando) return false;

    const votos = estado.votos || {};
    votos[uid]  = { letra, confianca: confianca || 'moderado' };

    await this.patchPartida(codigo, partidaId, {
      votos: { stringValue: JSON.stringify(votos) }
    });

    // Verifica se todos os online votaram
    const online    = estado.online || {};
    const onlineIds = Object.keys(online).filter(k => Date.now() - online[k] < 15000);
    const votaram   = onlineIds.filter(k => votos[k]?.letra);

    if (votaram.length >= onlineIds.length && onlineIds.length > 0) {
      await this._tentarProcessarRodada(codigo, partidaId);
    }
    return true;
  },

  /* ── encerrarPartida ────────────────────────────────
     Marca partida encerrada e salva no pódio.
  ──────────────────────────────────────────────────── */
  async encerrarPartida(codigo, partidaId, { grupo, cor, membros, score, sector, ciclo, resumo }) {
    await this.patchPartida(codigo, partidaId, {
      status: { stringValue: 'encerrada' },
      score:  { integerValue: String(score) },
    });
    // Atualiza statusCiclo do grupo
    const cod   = (codigo || '').toUpperCase().trim();
    const docId = encodeURIComponent((grupo || '').trim());
    await this.patchPartida(codigo, docId + '_status', {}).catch(() => {});
    try {
      const token = await _getToken();
      if (token) {
        await fetch(this._url('salas/' + cod + '/grupos/' + docId) + '?updateMask.fieldPaths=statusCiclo', {
          method: 'PATCH',
          headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: { statusCiclo: { stringValue: 'concluido' } } })
        });
      }
    } catch(e) {}
    // Salva no pódio da sala
    await this.salvarNoPodioSala(codigo, { grupo, cor, membros, score, sector, ciclo, resumo });
  },

  /* ── verificarTodosGruposConcluiram ─────────────────
     Retorna true se todos os grupos têm statusCiclo=concluido.
  ──────────────────────────────────────────────────── */
  async verificarTodosGruposConcluiram(codigo) {
    const grupos = await this.carregarGrupos(codigo);
    if (!grupos.length) return false;
    return grupos.every(g => g.statusCiclo === 'concluido');
  },

  /* ── revelarPodio ───────────────────────────────────
     Anfitrião revela o pódio (podioVisivel: true).
  ──────────────────────────────────────────────────── */
  async revelarPodio(codigo, uid) {
    const token = await _getToken();
    if (!token) throw new Error('sem_auth');
    const cod  = (codigo || '').toUpperCase().trim();
    const sala = await this.carregarSala(cod);
    if (sala.criadaPor !== uid) throw new Error('sem_permissao');
    const url  = this._url('salas/' + cod) + '?updateMask.fieldPaths=podioVisivel';
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { podioVisivel: { booleanValue: true } } })
    });
  },

  /* ── liberarNovoCiclo ───────────────────────────────
     Anfitrião reseta statusCiclo de todos os grupos e incrementa cicloAtual.
  ──────────────────────────────────────────────────── */
  async liberarNovoCiclo(codigo, uid) {
    const token = await _getToken();
    if (!token) throw new Error('sem_auth');
    const cod  = (codigo || '').toUpperCase().trim();
    const sala = await this.carregarSala(cod);
    if (sala.criadaPor !== uid) throw new Error('sem_permissao');

    const grupos = await this.carregarGrupos(cod);
    await Promise.all(grupos.map(g => {
      const docId = encodeURIComponent(g.nomeGrupo);
      return fetch(this._url('salas/' + cod + '/grupos/' + docId) + '?updateMask.fieldPaths=statusCiclo', {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { statusCiclo: { stringValue: 'aguardando' } } })
      });
    }));

    // Incrementa ciclo e oculta pódio
    const novoCiclo = (sala.cicloAtual || 1) + 1;
    const urlSala   = this._url('salas/' + cod) +
      '?updateMask.fieldPaths=cicloAtual&updateMask.fieldPaths=podioVisivel';
    await fetch(urlSala, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: {
        cicloAtual:   { integerValue: String(novoCiclo) },
        podioVisivel: { booleanValue: false },
      }})
    });
  },

  /* ── listarSalasAdmin ───────────────────────────────
     Admin lista todas as salas ativas/arquivadas.
  ──────────────────────────────────────────────────── */
  async listarSalasAdmin() {
    const token = await _getToken();
    if (!token) return [];
    const url = 'https://firestore.googleapis.com/v1/projects/' + PROJECT_ID +
                '/databases/default/documents:runQuery';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'salas' }],
          orderBy: [{ field: { fieldPath: 'criadaEm' }, direction: 'DESCENDING' }],
          limit: 100
        }
      })
    });
    if (!res.ok) return [];
    const rows = await res.json();
    return rows.filter(r => r.document).map(r => {
      const f   = r.document.fields || {};
      const cod = r.document.name.split('/').pop();
      return {
        codigo:     cod,
        nome:       f.nome?.stringValue       || cod,
        criadaPor:  f.criadaPor?.stringValue  || '',
        ativa:      f.ativa?.booleanValue     ?? true,
        arquivada:  f.arquivada?.booleanValue ?? false,
        cicloAtual: parseInt(f.cicloAtual?.integerValue || 1),
        criadaEm:   f.criadaEm?.timestampValue || null,
      };
    });
  },

  /* ── adminPausarPartida / adminEncerrarPartida ───── */
  async adminPausarPartida(codigo, partidaId) {
    await this.patchPartida(codigo, partidaId, {
      status: { stringValue: 'pausada' }
    });
  },

  async adminEncerrarPartida(codigo, partidaId) {
    await this.patchPartida(codigo, partidaId, {
      status: { stringValue: 'encerrada' }
    });
  },

  async adminDeletarSala(codigo) {
    const token = await _getToken();
    if (!token) throw new Error('sem_auth');
    const cod = (codigo || '').toUpperCase().trim();
    const url = this._url('salas/' + cod) + '?updateMask.fieldPaths=ativa&updateMask.fieldPaths=arquivada';
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: {
        ativa:     { booleanValue: false },
        arquivada: { booleanValue: true },
      }})
    });
  },
});
