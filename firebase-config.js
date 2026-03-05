/* ═══════════════════════════════════════════════════════
   FIREBASE CONFIGURATION + SYNC — Gestão Sob Pressão v6
   ─────────────────────────────────────────────────────
   1. Acesse https://console.firebase.google.com
   2. Crie um projeto e registre um App Web
   3. Habilite Authentication (Email/Senha + Google)
   4. Habilite Firestore Database
   5. Cole seu firebaseConfig abaixo substituindo os "COLE_AQUI"
═══════════════════════════════════════════════════════ */

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, signInWithRedirect, getRedirectResult,
  GoogleAuthProvider, sendPasswordResetEmail,
  onAuthStateChanged, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, addDoc, query, orderBy, limit, getDocs, where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ─── COLE SUA CONFIGURAÇÃO AQUI ─────────────────────── */
const firebaseConfig = {
  apiKey:            "AIzaSyCvCkfLd4EyxGlpZJdw1oKBuQBKsHo037E",
  authDomain:        "under-pressure-49320.firebaseapp.com",
  projectId:         "under-pressure-49320",
  storageBucket:     "under-pressure-49320.firebasestorage.app",
  messagingSenderId: "240438805750",
  appId:             "1:240438805750:web:9e090a1be367fea18f58d7"
};
/* ─────────────────────────────────────────────────────── */

let app, auth, db, googleProvider;
let _firebaseReady = false;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "COLE_AQUI") {
  try {
    app            = initializeApp(firebaseConfig);
    auth           = getAuth(app);
    db             = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    _firebaseReady = true;
    console.log("[GSP] Firebase inicializado com sucesso.");
    window._gspFirebaseReady = true;
  } catch (e) {
    console.warn("[GSP] Erro ao inicializar Firebase:", e.message);
    window._gspFirebaseReady = false;
    window._gspFirebaseError = e.message;
  }
} else {
  console.info("[GSP] Firebase não configurado — modo local ativo.");
  window._gspFirebaseReady = false;
}

/* ═══════════════════════════════════════════════════════
   AUTH SERVICE
═══════════════════════════════════════════════════════ */
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
    } catch(e) {
      const useRedirect = [
        "auth/popup-blocked",
        "auth/popup-closed-by-user",
        "auth/cancelled-popup-request",
        "auth/operation-not-supported-in-this-environment",
        "auth/web-storage-unsupported",
      ].includes(e.code);
      if (useRedirect) {
        await signInWithRedirect(auth, googleProvider);
        return null; // página vai recarregar após redirect
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

  /**
   * Aguarda o Firebase resolver o estado de autenticação atual.
   * Essencial para detectar sessões ativas após redirect do Google.
   * Resolve com o usuário Firebase autenticado ou null (timeout: 6s).
   */
  waitForAuthReady() {
    if (!_firebaseReady || !auth) return Promise.resolve(null);
    return new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (user) => {
        unsub();
        resolve(user);
      });
      setTimeout(() => resolve(null), 2000);
    });
  },

  async _salvarPerfil(user, nome) {
    if (!db) return;
    try {
      const ref  = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { nome, email: user.email, criadoEm: serverTimestamp(), mandatos: 0, melhorScore: 0 });
      }
    } catch (e) { console.warn("[GSP] _salvarPerfil:", e.message); }
  },
};

/* ═══════════════════════════════════════════════════════
   SYNC SERVICE
   Estrutura no Firestore:

   usuarios/{uid}
     ├── nome, email, mandatos, melhorScore, criadoEm
     ├── dados/sessao          ← sessão em andamento
     └── historico/{docId}     ← cada partida finalizada

   podio/{docId}               ← top scores global
═══════════════════════════════════════════════════════ */
window.GSPSync = {

  /* ────────────────────────────────────────────────
     SESSÃO EM ANDAMENTO
     Salva no Firestore para continuar em qualquer
     dispositivo após o login
  ─────────────────────────────────────────────────*/

  async salvarSessao(uid, dados) {
    if (!db || !uid) return;
    try {
      await setDoc(
        doc(db, "usuarios", uid, "dados", "sessao"),
        { ...dados, ts: serverTimestamp() }
      );
    } catch (e) { console.warn("[GSP] salvarSessao:", e.message); }
  },

  async carregarSessao(uid) {
    if (!db || !uid) return null;
    try {
      const snap = await getDoc(doc(db, "usuarios", uid, "dados", "sessao"));
      return snap.exists() ? snap.data() : null;
    } catch (e) { console.warn("[GSP] carregarSessao:", e.message); return null; }
  },

  async limparSessao(uid) {
    if (!db || !uid) return;
    try {
      await deleteDoc(doc(db, "usuarios", uid, "dados", "sessao"));
    } catch (e) { console.warn("[GSP] limparSessao:", e.message); }
  },

  /* ────────────────────────────────────────────────
     HISTÓRICO PESSOAL
     Cada partida finalizada é salva na subcoleção
     historico do usuário
  ─────────────────────────────────────────────────*/

  async salvarPartida(uid, entrada) {
    if (!db || !uid) return;
    try {
      // Salva a partida na subcoleção
      await addDoc(
        collection(db, "usuarios", uid, "historico"),
        { ...entrada, ts: serverTimestamp() }
      );
      // Atualiza estatísticas do perfil
      const perfilRef  = doc(db, "usuarios", uid);
      const perfilSnap = await getDoc(perfilRef);
      if (perfilSnap.exists()) {
        const d = perfilSnap.data();
        await updateDoc(perfilRef, {
          mandatos:      (d.mandatos  || 0) + 1,
          melhorScore:   Math.max(d.melhorScore || 0, entrada.score),
          ultimaPartida: serverTimestamp()
        });
      }
    } catch (e) { console.warn("[GSP] salvarPartida:", e.message); }
  },

  async carregarHistorico(uid, maximo = 20) {
    if (!db || !uid) return [];
    try {
      const q    = query(
        collection(db, "usuarios", uid, "historico"),
        orderBy("ts", "desc"),
        limit(maximo)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { console.warn("[GSP] carregarHistorico:", e.message); return []; }
  },

  /* ────────────────────────────────────────────────
     PÓDIO GLOBAL
     Todos os jogadores competem no mesmo ranking
  ─────────────────────────────────────────────────*/

  async salvarNoPodio(uid, entrada) {
    if (!db || !uid) return;
    try {
      await addDoc(collection(db, "podio"), {
        uid,
        player:      entrada.player,
        score:       entrada.score,
        scoreGestor: entrada.scoreGestor,
        sector:      entrada.sector,
        companyName: entrada.companyName,
        ts:          serverTimestamp()
      });
    } catch (e) { console.warn("[GSP] salvarNoPodio:", e.message); }
  },

  /**
   * Retorna dados do pódio já agregados por jogador:
   * - sector = null/"all": ordena por SCORE MÉDIO de todas as partidas
   * - sector específico:   ordena pelo MELHOR SCORE naquele setor
   * Cada entrada retornada representa UM jogador (sem duplicatas).
   */
  async carregarPodio(sector = null) {
    if (!db) return [];
    try {
      // Busca todas as entradas (até 200) para agregar corretamente
      const constraints = [orderBy("ts", "desc"), limit(200)];
      if (sector && sector !== "all") constraints.unshift(where("sector", "==", sector));
      const snap = await getDocs(query(collection(db, "podio"), ...constraints));
      const all  = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Agrupa por jogador
      const map = new Map();
      for (const e of all) {
        const key = e.uid || e.player;
        if (!map.has(key)) {
          map.set(key, { uid: e.uid, player: e.player, jogos: [], melhorPorSetor: {} });
        }
        const g = map.get(key);
        g.jogos.push(e);
        const s = e.sector;
        if (!g.melhorPorSetor[s] || e.score > g.melhorPorSetor[s].score) {
          g.melhorPorSetor[s] = e;
        }
      }

      const result = Array.from(map.values()).map(g => {
        const scores  = g.jogos.map(j => j.score);
        const media   = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const melhor  = Math.max(...scores);
        // Entrada representativa = jogo com melhor score geral
        const rep     = g.jogos.reduce((a, b) => b.score > a.score ? b : a);
        return {
          ...rep,
          uid:           g.uid,
          player:        g.player,
          scoreMedia:    media,
          scoreMelhor:   melhor,
          totalJogos:    g.jogos.length,
          melhorPorSetor: g.melhorPorSetor,
          // score usado para ordenação depende do modo chamado
          score: sector && sector !== "all"
            ? (g.melhorPorSetor[sector]?.score ?? 0)
            : media,
          // companyName da melhor partida no setor (se filtrado)
          companyName: sector && sector !== "all"
            ? (g.melhorPorSetor[sector]?.companyName ?? rep.companyName)
            : rep.companyName,
        };
      });

      return result
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
    } catch (e) { console.warn("[GSP] carregarPodio:", e.message); return []; }
  },

  /* ────────────────────────────────────────────────
     PERFIL COMPLETO
  ─────────────────────────────────────────────────*/

  async carregarPerfil(uid) {
    if (!db || !uid) return null;
    try {
      const snap = await getDoc(doc(db, "usuarios", uid));
      return snap.exists() ? snap.data() : null;
    } catch (e) { console.warn("[GSP] carregarPerfil:", e.message); return null; }
  },
};
