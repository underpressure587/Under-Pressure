/* ═══════════════════════════════════════════════════════
   BETA · IMPREVISTO · v5.0
   Eventos com gestorEffects, pesos por gestor e flags.
═══════════════════════════════════════════════════════ */

const BetaImprevisto = (() => {

    /* ── Limite máximo de multiplicador por setor (Bug #6 FIX) ─────────
       Impede que um único imprevisto zere um indicador numa rodada só.
       Ex.: rotatividade tinha rh:2.5 → com choice rh:-8 → -20 (colapso).
       Cap em 2.0 para negativos garante no máximo -16 num indicador (8×2),
       e o clamp [0,20] de _clampIndicadores ainda protege o valor final.    */
    const MULT_CAP = 2.0;

    /* ── Pool de imprevistos com modifiers por setor (Bug #5 FIX) ──────
       Cada evento define modifier separado por setor, usando apenas as
       chaves que existem naquele setor. Setores sem entry usam "default".
       Isso resolve o problema silencioso onde modifiers de indicadores
       inexistentes (ex.: reputacao em logística) não tinham efeito algum. */
    const POOL = [
        {
            id: "greve",
            titulo: "⚠️ Risco de Greve",
            descricao: "A equipe está agitada. Decisões que prejudiquem RH têm impacto dobrado.",
            // tecnologia não tem "rh" — usa "clima" que é o equivalente
            modifierPorSetor: {
                tecnologia: { clima: 2.0 },
                varejo:     { rh: 2.0 },
                logistica:  { rh: 2.0 },
                industria:  { rh: 2.0 },
            },
            gestorEffects: { capitalPolitico: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "crise_cambial",
            titulo: "💱 Crise Cambial",
            descricao: "Oscilação do câmbio amplifica os efeitos financeiros.",
            modifierPorSetor: {
                default: { financeiro: 1.5 },
            },
            gestorEffects: { esgotamento: +1 },
            duracao: 2
        },
        {
            id: "viral_positivo",
            titulo: "📣 Campanha Viral",
            descricao: "A empresa ganhou atenção positiva. Ganhos com clientes são maiores.",
            // tecnologia chama o indicador de "satisfacao"; os outros de "clientes"
            modifierPorSetor: {
                tecnologia: { satisfacao: 1.5 },
                varejo:     { clientes: 1.5, marca: 1.5 },
                logistica:  { clientes: 1.5 },
                industria:  { clientes: 1.5 },
            },
            gestorEffects: { capitalPolitico: +1 },
            duracao: 1
        },
        {
            id: "auditoria",
            titulo: "🔍 Auditoria Surpresa",
            descricao: "Auditores na casa. Decisões que impactam processos e conformidade têm efeito amplificado.",
            modifierPorSetor: {
                tecnologia: { processos: 2.0, qualidade: 2.0, seguranca: 1.5 },
                varejo:     { processos: 2.0 },
                logistica:  { processos: 2.0, seguranca: 1.5 },
                industria:  { processos: 2.0, qualidade: 2.0, conformidade: 2.0 },
            },
            gestorEffects: { capitalPolitico: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "investidor",
            titulo: "💼 Visita de Investidor",
            descricao: "Investidor presente. Ganhos financeiros são maiores, perdas também.",
            modifierPorSetor: {
                default: { financeiro: 2.0 },
            },
            gestorEffects: { capitalPolitico: +2 },
            duracao: 1
        },
        {
            id: "rotatividade",
            titulo: "🚪 Alta Rotatividade",
            descricao: "Muitas saídas simultâneas. O indicador de pessoas está hipersensível.",
            // Cap em 2.0 (antes era 2.5 — podia zerar indicador numa rodada)
            modifierPorSetor: {
                tecnologia: { clima: 2.0 },
                varejo:     { rh: 2.0 },
                logistica:  { rh: 2.0 },
                industria:  { rh: 2.0 },
            },
            gestorEffects: { reputacaoInterna: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "acidente_operacional",
            titulo: "🚨 Incidente Operacional",
            descricao: "Ocorrência inesperada na operação. Decisões de segurança têm impacto dobrado.",
            modifierPorSetor: {
                tecnologia: { seguranca: 2.0, qualidade: 1.5 },
                varejo:     { processos: 2.0, rh: 1.5 },
                logistica:  { seguranca: 2.0, frota: 1.5 },
                industria:  { seguranca: 2.0, manutencao: 1.5 },
            },
            gestorEffects: { capitalPolitico: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "reconhecimento_setor",
            titulo: "🏅 Reconhecimento do Setor",
            descricao: "A empresa foi citada positivamente pela mídia especializada.",
            // reputacao e marca não existem em logística/indústria — usa clientes como proxy
            modifierPorSetor: {
                tecnologia: { reputacao: 1.5, satisfacao: 1.2 },
                varejo:     { marca: 1.5, clientes: 1.2 },
                logistica:  { clientes: 1.5, sla: 1.2 },
                industria:  { clientes: 1.5, qualidade: 1.2 },
            },
            gestorEffects: { capitalPolitico: +1, reputacaoInterna: +1 },
            duracao: 1
        },
    ];

    /* ── Resolve o modifier correto para um evento+setor ────────────────
       Prioridade: modifierPorSetor[sector] → modifierPorSetor.default → modifier legado */
    function _resolverModifier(ev, sector) {
        if (ev.modifierPorSetor) {
            return ev.modifierPorSetor[sector] || ev.modifierPorSetor.default || {};
        }
        // Compatibilidade com estrutura legada (modifier flat)
        return ev.modifier || {};
    }

    let _usedIds = new Set();

    function sortear(currentRound, storyState = null, gestor = null, sector = null) {
        const prob = Math.min(0.15 + currentRound * 0.01, 0.40);
        if (Math.random() > prob) return null;

        const disponiveis = POOL.filter(ev => !_usedIds.has(ev.id));
        if (!disponiveis.length) {
            _usedIds.clear();
            return sortear(currentRound, storyState, gestor, sector);
        }

        /* ── Emite o evento com modifier já resolvido para o setor ─────
           BetaImpacto.calcular() lê ev.modifier, então injetamos o
           modifier correto (por setor) no objeto retornado.             */
        const _emitir = (ev) => {
            const modifier = _resolverModifier(ev, sector);
            return { ...ev, modifier, expiresAt: currentRound + ev.duracao - 1 };
        };

        if (!storyState) {
            const ev = disponiveis[Math.floor(Math.random() * disponiveis.length)];
            _usedIds.add(ev.id);
            return _emitir(ev);
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
            if (esg >= 7 && ev.id === "greve")          peso *= 1.5;
            if (capPol <= 3 && ev.id === "auditoria")   peso *= 2;

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
        return _emitir(evEscolhido);
    }

    function resetar() { _usedIds.clear(); }

    /* ── Labels de indicadores para exibição no banner ──
       Mapeamento completo de todos os setores.             */
    const _LABELS_IND = {
        financeiro:    "💰 Financeiro",
        rh:            "👥 RH",
        clientes:      "⭐ Clientes",
        processos:     "⚙️ Processos",
        margem:        "📊 Margem",
        estoque:       "📦 Estoque",
        marca:         "🏷️ Marca",
        digital:       "🖥️ Digital",
        sla:           "⏱️ SLA",
        frota:         "🚛 Frota",
        seguranca:     "🦺 Segurança",
        tecnologia:    "📡 Tecnologia",
        manutencao:    "🔧 Manutenção",
        qualidade:     "🎯 Qualidade",
        conformidade:  "📋 Conformidade",
        clima:         "🧑‍💻 Clima",
        satisfacao:    "⭐ Satisfação",
        produtividade: "⚡ Produtividade",
        reputacao:     "📣 Reputação",
        inovacao:      "🔬 Inovação",
    };

    /* Indicadores válidos por setor — usado para filtrar o modifier
       e mostrar apenas os que de fato existem no setor ativo.       */
    const _IND_POR_SETOR = {
        tecnologia: ["financeiro","clima","satisfacao","qualidade","produtividade","reputacao","inovacao","seguranca"],
        varejo:     ["financeiro","rh","clientes","processos","margem","estoque","marca","digital"],
        logistica:  ["financeiro","rh","clientes","processos","sla","frota","seguranca","tecnologia"],
        industria:  ["financeiro","rh","clientes","processos","seguranca","manutencao","qualidade","conformidade"],
    };

    /**
     * Retorna string descrevendo quais indicadores o imprevisto amplifica,
     * filtrada para o setor atual. Ex: "💰 Financeiro ×2 · 👥 RH ×1.5"
     * Se nenhum modifier bater o setor, retorna string vazia.
     */
    function descricaoIndicadores(ev, sector) {
        const modifier = _resolverModifier(ev, sector);
        if (!modifier || !Object.keys(modifier).length) return "";
        const validos = _IND_POR_SETOR[sector] || [];
        const partes  = Object.entries(modifier)
            .filter(([k]) => !sector || validos.includes(k))
            .map(([k, mult]) => {
                const label = _LABELS_IND[k] || k;
                return `${label} ×${mult}`;
            });
        return partes.join(" · ");
    }

    /**
     * Retorna string descrevendo os efeitos no gestor do imprevisto.
     * Ex: "Cap. Político −1 · Esgotamento +1"
     */
    function descricaoGestor(ev) {
        if (!ev?.gestorEffects) return "";
        const labels = {
            reputacaoInterna: "🧑 Reputação",
            capitalPolitico:  "🏛 Cap. Político",
            esgotamento:      "🔋 Esgotamento",
        };
        return Object.entries(ev.gestorEffects)
            .filter(([, v]) => v !== 0)
            .map(([k, v]) => `${labels[k] || k} ${v > 0 ? "+" : ""}${v}`)
            .join(" · ");
    }

    return { sortear, resetar, descricaoIndicadores, descricaoGestor };
})();
