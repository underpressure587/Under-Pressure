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
  doc, setDoc, getDoc, deleteDoc,
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
const FS_BASE = "https://southamerica-east1-firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents";

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
    db             = initializeFirestore(app, { experimentalForceLongPolling: true });
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
    if (!db) return;
    try {
      await setDoc(doc(db, "usuarios", user.uid), {
        nome, email: user.email, criadoEm: serverTimestamp(), mandatos: 0, melhorScore: 0
      }, { merge: true });
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
    if (!db || !uid) return;
    try {
      await setDoc(doc(db, "usuarios", uid, "dados", "sessao"), { ...dados, ts: serverTimestamp() });
    } catch (e) { console.warn("[GSP] salvarSessao:", e.message); }
  },

  async carregarSessao(uid) {
    if (!db || !uid) return null;
    try {
      const snap = await getDoc(doc(db, "usuarios", uid, "dados", "sessao"));
      return snap.exists() ? snap.data() : null;
    } catch (e) { return null; }
  },

  async limparSessao(uid) {
    if (!db || !uid) return;
    try { await deleteDoc(doc(db, "usuarios", uid, "dados", "sessao")); } catch (e) {}
  },

  async salvarPartida(uid, entrada) {
    const token = await _getToken();
    if (!token) throw new Error('sem auth');
    const url = FS_BASE + "/usuarios/" + uid + "/historico";
    const body = { fields: {
      player:      { stringValue:  entrada.player      || '' },
      score:       { integerValue: String(entrada.score       || 0) },
      scoreGestor: { integerValue: String(entrada.scoreGestor || 0) },
      sector:      { stringValue:  entrada.sector      || '' },
      companyName: { stringValue:  entrada.companyName || '' },
      uid:         { stringValue:  uid },
      ts:          { timestampValue: new Date().toISOString() }
    }};
    const r = await fetch(url, { method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) { const t = await r.text(); throw new Error('HTTP ' + r.status + ': ' + t.slice(0,100)); }
    return r.json();
  },

  async carregarHistorico(uid, maximo = 20) {
    if (!db || !uid) return [];
    try {
      const snap = await getDocs(query(collection(db, "usuarios", uid, "historico"), orderBy("ts", "desc"), limit(maximo)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { return []; }
  },

  async salvarNoPodio(uid, entrada) {
    const token = await _getToken();
    if (!token) throw new Error('sem auth');
    const setor = entrada.sector || '';
    const score = entrada.score  || 0;
    const url   = FS_BASE + "/podio/" + uid;

    // Lê o documento atual via REST
    let melhorScore    = score;
    let totalJogos     = 1;
    let melhorPorSetor = {};
    let playerNome     = entrada.player || '';

    const getRes = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (getRes.ok) {
      const atual = await getRes.json();
      const f = atual.fields || {};
      // Lê melhorPorSetor do formato REST
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

    // Atualiza melhorPorSetor se score do setor for maior
    if (!melhorPorSetor[setor] || score > melhorPorSetor[setor].score) {
      melhorPorSetor[setor] = {
        score,
        scoreGestor: entrada.scoreGestor || 0,
        companyName: entrada.companyName || '',
      };
    }

    // Converte melhorPorSetor para formato Firestore REST
    const melhorPorSetorFields = {};
    for (const [s, v] of Object.entries(melhorPorSetor)) {
      melhorPorSetorFields[s] = {
        mapValue: { fields: {
          score:       { integerValue: String(v.score) },
          scoreGestor: { integerValue: String(v.scoreGestor || 0) },
          companyName: { stringValue:  v.companyName || '' },
        }}
      };
    }

    // PATCH cria ou atualiza o documento com o uid como ID
    const body = { fields: {
      uid:           { stringValue:  uid },
      player:        { stringValue:  playerNome },
      melhorScore:   { integerValue: String(melhorScore) },
      totalJogos:    { integerValue: String(totalJogos) },
      ultimaPartida: { timestampValue: new Date().toISOString() },
      melhorPorSetor: { mapValue: { fields: melhorPorSetorFields } },
    }};

    const patchRes = await fetch(url, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!patchRes.ok) {
      const t = await patchRes.text();
      throw new Error('HTTP ' + patchRes.status + ': ' + t.slice(0, 100));
    }
    return patchRes.json();
  },

  async carregarPodio(sector = null) {
    const token = await _getToken();
    const url   = FS_BASE + "/podio?pageSize=100";
    const headers = token
      ? { 'Authorization': 'Bearer ' + token }
      : {};

    try {
      const res = await fetch(url, { headers });
      if (!res.ok) { console.warn("[GSP] carregarPodio HTTP:", res.status); return []; }
      const data = await res.json();
      if (!data.documents) return [];

      const _parseInt = (f) => parseInt(f?.integerValue ?? f?.doubleValue ?? 0);

      const parseDoc = (d) => {
        const f = d.fields || {};
        const getMelhorPorSetor = () => {
          const raw = f.melhorPorSetor?.mapValue?.fields || {};
          const result = {};
          for (const [s, v] of Object.entries(raw)) {
            result[s] = {
              score:       _parseInt(v.mapValue?.fields?.score),
              scoreGestor: _parseInt(v.mapValue?.fields?.scoreGestor),
              companyName: v.mapValue?.fields?.companyName?.stringValue || '',
            };
          }
          return result;
        };

        // Suporte ao formato novo (melhorScore) e antigo (score + sector)
        const melhorScoreNovo   = _parseInt(f.melhorScore);
        const scoreAntigo       = _parseInt(f.score);
        const setorAntigo       = f.sector?.stringValue || '';
        const companyNameAntigo = f.companyName?.stringValue || '';
        const melhorPorSetor    = getMelhorPorSetor();

        // Se formato antigo e sem melhorPorSetor, monta a partir dos campos diretos
        if (scoreAntigo > 0 && setorAntigo && Object.keys(melhorPorSetor).length === 0) {
          melhorPorSetor[setorAntigo] = {
            score: scoreAntigo,
            scoreGestor: _parseInt(f.scoreGestor),
            companyName: companyNameAntigo,
          };
        }

        const melhorScore = melhorScoreNovo > 0 ? melhorScoreNovo : scoreAntigo;

        return {
          uid:           f.uid?.stringValue || '',
          player:        f.player?.stringValue || '',
          melhorScore,
          totalJogos:    _parseInt(f.totalJogos) || 1,
          ultimaPartida: f.ultimaPartida?.timestampValue || f.ts?.timestampValue || null,
          melhorPorSetor,
        };
      };

      const todosRaw = data.documents.map(parseDoc);
      const todos = todosRaw.filter(p => p.uid && p.melhorScore > 0);
      // DEBUG VISIVEL
      const dbgEl = document.getElementById('podio-lista');
      if (dbgEl) {
        const info = todosRaw.map(p => p.player + '|uid=' + (p.uid||'?') + '|score=' + p.melhorScore).join('<br>');
        dbgEl.innerHTML = '<div style="color:lime;padding:12px;font-size:.7rem;word-break:break-all">Raw=' + todosRaw.length + ' Filtrados=' + todos.length + '<br>' + info + '</div>';
      }
      if (!todos.length) return todos;

      const isAll = !sector || sector === 'all';

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
          return {
            ...p,
            ts:          p.ultimaPartida ? new Date(p.ultimaPartida).getTime() : Date.now(),
            score:       s.score,
            companyName: s.companyName,
            sector,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

    } catch (e) { console.warn("[GSP] carregarPodio:", e.message); return []; }
  },

  async carregarPerfil(uid) {
    if (!db || !uid) return null;
    try {
      const snap = await getDoc(doc(db, "usuarios", uid));
      return snap.exists() ? snap.data() : null;
    } catch (e) { return null; }
  },
};
