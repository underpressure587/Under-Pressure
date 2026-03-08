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
const FS_BASE = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents";

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
    onAuthStateChanged(auth, (user) => {
      if (_cachedAuthUser === undefined) _cachedAuthUser = user;
    });
    getRedirectResult(auth).then(cred => {
      if (cred?.user) {
        _cachedAuthUser = cred.user;
        // Salva sessão no localStorage para o boot detectar imediatamente
        const u = cred.user;
        const nome = u.displayName || u.email?.split('@')[0] || 'Jogador';
        const player = { uid: u.uid, nome, email: u.email, tipo: 'user' };
        try { localStorage.setItem('gsp_player', JSON.stringify(player)); } catch(e) {}
      }
    }).catch(() => {});
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
    if (!db || !uid) throw new Error('sem db ou uid');
    try {
      const docRef = doc(db, "podio", uid);
      const snap   = await getDoc(docRef);
      const setor  = entrada.sector || '';
      const score  = entrada.score  || 0;

      if (snap.exists()) {
        const atual = snap.data();
        // Só atualiza melhorScore se o novo score for maior
        const novoMelhor = Math.max(atual.melhorScore || 0, score);
        // Atualiza melhorPorSetor se score do setor for maior
        const melhorPorSetor = { ...(atual.melhorPorSetor || {}) };
        if (!melhorPorSetor[setor] || score > melhorPorSetor[setor].score) {
          melhorPorSetor[setor] = {
            score,
            scoreGestor: entrada.scoreGestor || 0,
            companyName: entrada.companyName || '',
          };
        }
        await setDoc(docRef, {
          uid,
          player:         entrada.player || atual.player || '',
          melhorScore:    novoMelhor,
          totalJogos:     (atual.totalJogos || 0) + 1,
          ultimaPartida:  serverTimestamp(),
          melhorPorSetor,
        }, { merge: true });
      } else {
        // Primeira partida deste jogador
        await setDoc(docRef, {
          uid,
          player:        entrada.player || '',
          melhorScore:   score,
          totalJogos:    1,
          ultimaPartida: serverTimestamp(),
          melhorPorSetor: {
            [setor]: {
              score,
              scoreGestor: entrada.scoreGestor || 0,
              companyName: entrada.companyName || '',
            }
          },
        });
      }
    } catch (e) {
      console.warn("[GSP] salvarNoPodio:", e.message);
      throw e;
    }
  },

  async carregarPodio(sector = null) {
    if (!db) return [];
    try {
      // Busca os top 50 por melhorScore — 1 documento por jogador
      const snap = await getDocs(
        query(collection(db, "podio"), orderBy("melhorScore", "desc"), limit(50))
      );
      const todos = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const isAll = !sector || sector === 'all';

      if (isAll) {
        // Retorna top 20 por melhorScore
        return todos.slice(0, 20).map(p => ({
          uid:          p.uid,
          player:       p.player,
          melhorScore:  p.melhorScore || 0,
          totalJogos:   p.totalJogos  || 1,
          melhorPorSetor: p.melhorPorSetor || {},
          ts:           p.ultimaPartida?.toMillis ? p.ultimaPartida.toMillis() : Date.now(),
          // campos usados no render
          score:        p.melhorScore || 0,
          companyName:  _melhorEmpresa(p.melhorPorSetor),
          sector:       _melhorSetor(p.melhorPorSetor),
        }));
      }

      // Filtro por setor — só quem jogou aquele setor
      return todos
        .filter(p => p.melhorPorSetor?.[sector])
        .map(p => {
          const s = p.melhorPorSetor[sector];
          return {
            uid:          p.uid,
            player:       p.player,
            melhorScore:  p.melhorScore || 0,
            totalJogos:   p.totalJogos  || 1,
            melhorPorSetor: p.melhorPorSetor || {},
            ts:           p.ultimaPartida?.toMillis ? p.ultimaPartida.toMillis() : Date.now(),
            score:        s.score        || 0,
            companyName:  s.companyName  || '',
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
