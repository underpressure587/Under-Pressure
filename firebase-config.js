import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, signInWithRedirect, getRedirectResult,
  GoogleAuthProvider, sendPasswordResetEmail,
  onAuthStateChanged, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  initializeFirestore,
  getFirestore,
  doc, setDoc, getDoc, deleteDoc, addDoc,
  collection, query, orderBy, limit, getDocs, where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyB_Zkl12AyT5RMfg9eJ68QFTakdBKSioVU",
  authDomain:        "under-pressure-49320.firebaseapp.com",
  projectId:         "under-pressure-49320",
  storageBucket:     "under-pressure-49320.firebasestorage.app",
  messagingSenderId: "240438805750",
  appId:             "1:240438805750:web:9e090a1be367fea18f58d7"
};

const PROJECT_ID = "under-pressure-49320";
const FS_BASE = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents";

let app, auth, db, googleProvider;
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
    db             = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
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

  async processarRedirectGoogle() {
    if (!_firebaseReady) return null;
    try {
      const cred = await getRedirectResult(auth);
      if (!cred || !cred.user) return null;
      const nome = cred.user.displayName || cred.user.email.split("@")[0];
      await GSPAuth._salvarPerfil(cred.user, nome);
      return { uid: cred.user.uid, nome, email: cred.user.email, tipo: "user" };
    } catch(e) {
      console.warn("[GSP] processarRedirectGoogle:", e.message);
      return null;
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
      const url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents/usuarios/" + user.uid + "?updateMask.fieldPaths=nome&updateMask.fieldPaths=email&updateMask.fieldPaths=mandatos&updateMask.fieldPaths=melhorScore";
      const body = { fields: {
        nome:        { stringValue:  nome || '' },
        email:       { stringValue:  user.email || '' },
        mandatos:    { integerValue: "0" },
        melhorScore: { integerValue: "0" },
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
