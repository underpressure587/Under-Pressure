/* ═══════════════════════════════════════════════════════
   BETA · IMPREVISTO · v5.0
   Eventos com gestorEffects, pesos por gestor e flags.
═══════════════════════════════════════════════════════ */

const BetaImprevisto = (() => {

    const POOL = [
        {
            id: "greve",
            titulo: "⚠️ Risco de Greve",
            descricao: "A equipe está agitada. Decisões que prejudiquem RH têm impacto dobrado.",
            modifier: { rh: 2, clima: 2 },
            gestorEffects: { capitalPolitico: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "crise_cambial",
            titulo: "💱 Crise Cambial",
            descricao: "Oscilação do câmbio amplifica os efeitos financeiros.",
            modifier: { financeiro: 1.5 },
            gestorEffects: { esgotamento: +1 },
            duracao: 2
        },
        {
            id: "viral_positivo",
            titulo: "📣 Campanha Viral",
            descricao: "A empresa ganhou atenção positiva. Ganhos com clientes são maiores.",
            modifier: { clientes: 1.5, satisfacao: 1.5 },
            gestorEffects: { capitalPolitico: +1 },
            duracao: 1
        },
        {
            id: "auditoria",
            titulo: "🔍 Auditoria Surpresa",
            descricao: "Auditores na casa. Decisões que impactam processos têm efeito amplificado.",
            modifier: { processos: 2, qualidade: 2, conformidade: 2 },
            gestorEffects: { capitalPolitico: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "investidor",
            titulo: "💼 Visita de Investidor",
            descricao: "Investidor presente. Ganhos financeiros são maiores, perdas também.",
            modifier: { financeiro: 2 },
            gestorEffects: { capitalPolitico: +2 },
            duracao: 1
        },
        {
            id: "rotatividade",
            titulo: "🚪 Alta Rotatividade",
            descricao: "Muitas saídas simultâneas. O indicador de RH está hipersensível.",
            modifier: { rh: 2.5, clima: 2.5 },
            gestorEffects: { reputacaoInterna: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "acidente_operacional",
            titulo: "🚨 Incidente Operacional",
            descricao: "Ocorrência inesperada na operação. Decisões de segurança têm impacto dobrado.",
            modifier: { seguranca: 2, processos: 1.5 },
            gestorEffects: { capitalPolitico: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "reconhecimento_setor",
            titulo: "🏅 Reconhecimento do Setor",
            descricao: "A empresa foi citada positivamente pela mídia especializada.",
            modifier: { reputacao: 1.5, marca: 1.5, clientes: 1.2 },
            gestorEffects: { capitalPolitico: +1, reputacaoInterna: +1 },
            duracao: 1
        },
    ];

    let _usedIds = new Set();

    function sortear(currentRound, storyState = null, gestor = null) {
        const prob = Math.min(0.15 + currentRound * 0.01, 0.40);
        if (Math.random() > prob) return null;

        const disponiveis = POOL.filter(ev => !_usedIds.has(ev.id));
        if (!disponiveis.length) {
            _usedIds.clear();
            return sortear(currentRound, storyState, gestor);
        }

        if (!storyState) {
            const ev = disponiveis[Math.floor(Math.random() * disponiveis.length)];
            _usedIds.add(ev.id);
            return { ...ev, expiresAt: currentRound + ev.duracao };
        }

        const flags     = storyState.flags || [];
        const reputacao = storyState.reputacaoMercado || "boa";
        const esg       = gestor?.esgotamento ?? 5;
        const capPol    = gestor?.capitalPolitico ?? 5;

        const poolPonderado = disponiveis.map(ev => {
            let peso = 1;

            // Pesos por flags
            if (flags.includes("lideranca_toxica")      && ev.id === "rotatividade")         peso = 4;
            if (flags.includes("rh_negligenciado")      && ev.id === "greve")                peso = 3;
            if (flags.includes("ignorou_seguranca")     && ev.id === "auditoria")            peso = 4;
            if (flags.includes("ignorou_seguranca")     && ev.id === "acidente_operacional") peso = 3;
            if (flags.includes("crescimento_sem_caixa") && ev.id === "investidor")           peso = 0.2;
            if (flags.includes("crescimento_saudavel")  && ev.id === "investidor")           peso = 3;
            if (flags.includes("investiu_em_inovacao")  && ev.id === "viral_positivo")       peso = 3;

            // Pesos pelo estado do gestor
            if (esg >= 7 && ev.id === "greve")          peso *= 1.5;  // time sente o esgotamento
            if (capPol <= 3 && ev.id === "auditoria")   peso *= 2;    // conselho desconfiante provoca auditoria

            // Reputação modula eventos positivos/negativos
            if (reputacao === "toxica" && (ev.id === "investidor" || ev.id === "viral_positivo" || ev.id === "reconhecimento_setor")) {
                peso = 0;
            }
            if (reputacao === "boa" && (ev.id === "investidor" || ev.id === "viral_positivo" || ev.id === "reconhecimento_setor")) {
                peso *= 1.5;
            }

            return { ev, peso };
        }).filter(p => p.peso > 0);

        const totalPeso = poolPonderado.reduce((acc, p) => acc + p.peso, 0);
        let rand = Math.random() * totalPeso;
        let evEscolhido = poolPonderado[poolPonderado.length - 1].ev;

        for (const { ev, peso } of poolPonderado) {
            rand -= peso;
            if (rand <= 0) { evEscolhido = ev; break; }
        }

        _usedIds.add(evEscolhido.id);
        return { ...evEscolhido, expiresAt: currentRound + evEscolhido.duracao };
    }

    function resetar() { _usedIds.clear(); }

    return { sortear, resetar };
})();
