/* ═══════════════════════════════════════════════════════
   UIManutencao · v1.0
   Overlay de manutenção em tempo real.
   — Não usa document.body.innerHTML (não destrói o DOM)
   — Integrado ao Engine.setPausado()
   — Suporta admin liberado (uid na lista "liberados")
═══════════════════════════════════════════════════════ */

const UIManutencao = (() => {
    const OVERLAY_ID   = "manutencao-overlay";
    const MSG_ID       = "manutencao-msg";
    const COUNTDOWN_ID = "manutencao-countdown";

    /* ── Cria o overlay DOM (apenas uma vez) ─────────── */
    function _criarOverlay() {
        if (document.getElementById(OVERLAY_ID)) return;

        const el = document.createElement("div");
        el.id        = OVERLAY_ID;
        el.className = "manutencao-overlay";
        el.setAttribute("role", "alert");
        el.setAttribute("aria-live", "assertive");

        el.innerHTML = `
            <div class="manutencao-box">
                <div class="manutencao-icon">🔧</div>
                <h1 class="manutencao-titulo">Sistema em manutenção</h1>
                <p id="${MSG_ID}" class="manutencao-msg">Voltamos em breve.</p>
                <p id="${COUNTDOWN_ID}" class="manutencao-countdown"></p>
                <div class="manutencao-spinner"></div>
            </div>
        `;

        document.body.appendChild(el);
    }

    /* ── Ativa a manutenção ──────────────────────────── */
    function ativar(motivo = "") {
        _criarOverlay();

        // Atualiza mensagem
        const msgEl = document.getElementById(MSG_ID);
        if (msgEl) msgEl.textContent = motivo || "Voltamos em breve.";

        // Mostra o overlay
        const overlay = document.getElementById(OVERLAY_ID);
        if (overlay) {
            overlay.classList.add("ativo");
            overlay.removeAttribute("hidden");
        }

        // Congela scroll do body
        document.body.classList.add("manutencao-ativa");

        // Pausa o engine sem derrubar estado
        if (typeof Engine !== "undefined") Engine.setPausado(true);

        console.info("[UIManutencao] Ativada. Motivo:", motivo || "(sem motivo)");
    }

    /* ── Desativa a manutenção ───────────────────────── */
    function desativar() {
        const overlay = document.getElementById(OVERLAY_ID);
        if (overlay) {
            overlay.classList.remove("ativo");
            overlay.setAttribute("hidden", "");
        }

        document.body.classList.remove("manutencao-ativa");

        // Retoma o engine
        if (typeof Engine !== "undefined") Engine.setPausado(false);

        console.info("[UIManutencao] Desativada.");
    }

    /* ── Exibe contagem regressiva opcional ──────────── */
    function setCountdown(textoOuNull) {
        const el = document.getElementById(COUNTDOWN_ID);
        if (!el) return;
        el.textContent = textoOuNull || "";
    }

    return { ativar, desativar, setCountdown };
})();


/* ═══════════════════════════════════════════════════════
   MonitorManutencao · escuta Firestore em tempo real
   Chamar: MonitorManutencao.iniciar(db, user)
═══════════════════════════════════════════════════════ */
const MonitorManutencao = (() => {
    let _unsubscribe = null;

    function iniciar(db, user) {
        // Evita múltiplos listeners
        if (_unsubscribe) _unsubscribe();

        // Importar do Firebase SDK (já deve estar disponível no projeto)
        // Se o projeto usa import estático, certifique-se que onSnapshot e doc
        // já estão importados em mainBeta.js.
        const ref = window._firebaseDoc
            ? window._firebaseDoc(db, "config", "global")
            : db.collection("config").doc("global"); // compat SDK fallback

        const handler = (snap) => {
            if (!snap.exists && !snap.exists?.()) return;

            const data = snap.data ? snap.data() : snap;
            if (!data) return;

            const ativo    = data.manutencao === true;
            const liberado = Array.isArray(data.liberados)
                && user?.uid
                && data.liberados.includes(user.uid);

            if (ativo && !liberado) {
                UIManutencao.ativar(data.motivo || "");
            } else {
                UIManutencao.desativar();
            }
        };

        // Modular SDK
        if (window._firebaseOnSnapshot) {
            _unsubscribe = window._firebaseOnSnapshot(ref, handler,
                (err) => console.error("[MonitorManutencao] onSnapshot erro:", err)
            );
        } else {
            // Compat SDK fallback
            _unsubscribe = ref.onSnapshot(handler,
                (err) => console.error("[MonitorManutencao] onSnapshot erro:", err)
            );
        }

        console.info("[MonitorManutencao] Listener iniciado para uid:", user?.uid || "anônimo");
    }

    function parar() {
        if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
    }

    return { iniciar, parar };
})();


/* ═══════════════════════════════════════════════════════
   GarantirConfigManutencao · cria o doc se não existir
   Chamar: GarantirConfigManutencao(db) no boot do admin
═══════════════════════════════════════════════════════ */
async function garantirConfigManutencao(db) {
    try {
        // Modular SDK
        if (window._firebaseGetDoc && window._firebaseDoc && window._firebaseSetDoc) {
            const ref  = window._firebaseDoc(db, "config", "global");
            const snap = await window._firebaseGetDoc(ref);
            if (!snap.exists()) {
                await window._firebaseSetDoc(ref, {
                    manutencao: false,
                    motivo:     "",
                    liberados:  [],
                    atualizadoEm: new Date().toISOString()
                });
                console.info("[Config] config/global criado com valores padrão.");
            }
        } else {
            // Compat SDK fallback
            const snap = await db.collection("config").doc("global").get();
            if (!snap.exists) {
                await db.collection("config").doc("global").set({
                    manutencao: false,
                    motivo:     "",
                    liberados:  [],
                    atualizadoEm: new Date().toISOString()
                });
                console.info("[Config] config/global criado com valores padrão.");
            }
        }
    } catch(e) {
        console.error("[Config] Erro ao garantir config/global:", e);
    }
}
