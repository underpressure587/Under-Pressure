/* ═══════════════════════════════════════════════════════
   BETA · INDICADORES · Helpers de nível e avaliação
   v5.0 — pesos por setor, labels novos indicadores
═══════════════════════════════════════════════════════ */

const BetaIndicadores = (() => {

    const LABELS = {
        // Padrão (todos os setores)
        financeiro:    "💰 Financeiro",
        rh:            "👥 RH",
        clientes:      "⭐ Clientes",
        processos:     "⚙️ Processos",
        // Varejo
        margem:        "📊 Margem Operacional",
        estoque:       "📦 Giro de Estoque",
        marca:         "🏷️ Força da Marca",
        digital:       "🖥️ Canal Digital",
        // Logística
        sla:           "⏱️ Cumprimento de SLA",
        frota:         "🚛 Estado da Frota",
        seguranca:     "🦺 Segurança Operacional",
        tecnologia:    "📡 TMS / Tecnologia",
        // Indústria
        // seguranca (reaproveitado com mesmo emoji)
        manutencao:    "🔧 Manutenção de Ativos",
        qualidade:     "🎯 Controle de Qualidade",
        conformidade:  "📋 Conformidade Regulatória",
        // Tecnologia
        clima:         "🧑‍💻 Clima Organizacional",
        satisfacao:    "⭐ Satisfação do Cliente",
        produtividade: "⚡ Produtividade",
        reputacao:     "📣 Reputação de Mercado",
        inovacao:      "🔬 Inovação",
    };

    // Pesos por setor (soma = 1.0 em cada)
    const PESOS = {
        tecnologia: {
            financeiro: 0.20, clima: 0.10, satisfacao: 0.15,
            qualidade:  0.13, produtividade: 0.12, reputacao: 0.12,
            inovacao:   0.10, seguranca: 0.08
        },
        varejo: {
            financeiro: 0.18, rh: 0.12, clientes: 0.20, processos: 0.10,
            margem:     0.18, estoque: 0.08, marca: 0.09, digital: 0.05
        },
        logistica: {
            financeiro: 0.15, rh: 0.12, clientes: 0.18, processos: 0.10,
            sla:        0.20, frota: 0.10, seguranca: 0.10, tecnologia: 0.05
        },
        industria: {
            financeiro: 0.15, rh: 0.12, clientes: 0.15, processos: 0.12,
            seguranca:  0.18, manutencao: 0.12, qualidade: 0.10, conformidade: 0.06
        },
        default: {
            financeiro: 0.30, rh: 0.25, clientes: 0.25, processos: 0.20
        }
    };

    function nivel(value) {
        if (value <= 3)  return "critico";
        if (value <= 6)  return "baixo";
        if (value <= 12) return "medio";
        if (value <= 16) return "bom";
        return "excelente";
    }

    function corNivel(value) {
        return {
            critico:   "#ef4444",
            baixo:     "#f97316",
            medio:     "#f59e0b",
            bom:       "#22c55e",
            excelente: "#00d4ff",
        }[nivel(value)];
    }

    function labelNivel(value) {
        return {
            critico:   "CRÍTICO",
            baixo:     "BAIXO",
            medio:     "MÉDIO",
            bom:       "BOM",
            excelente: "EXCELENTE",
        }[nivel(value)];
    }

    function resumoEstado(indicators) {
        const vals  = Object.values(indicators);
        const media = vals.reduce((a, b) => a + b, 0) / vals.length;
        if (media <= 4)  return "em colapso";
        if (media <= 7)  return "em crise severa";
        if (media <= 10) return "em crise";
        if (media <= 13) return "estável";
        if (media <= 16) return "saudável";
        return "em expansão";
    }

    function avaliarDecisaoContextual(effects, indicators, situacao) {
        const positivos = Object.entries(effects).filter(([, v]) => v > 0);
        const negativos = Object.entries(effects).filter(([, v]) => v < 0);
        const somaPos   = positivos.reduce((a, [, v]) => a + v, 0);
        const somaNeg   = Math.abs(negativos.reduce((a, [, v]) => a + v, 0));
        const netScore  = somaPos - somaNeg;

        const penCritico = negativos.some(([k]) => nivel(indicators[k] ?? 10) === "critico") ? -2 : 0;
        const bonCritico = positivos.some(([k]) => nivel(indicators[k] ?? 10) === "critico") ? +1.5 : 0;

        const score = netScore + penCritico + bonCritico;

        if (score >= 3)  return "boa";
        if (score >= 0)  return "media";
        return "ruim";
    }

    function isGameOver(indicators) {
        // BUG #6 FIX: threshold <= 1 para game over ser alcançável
        return Object.values(indicators).some(v => v <= 1);
    }

    function scoreTotal(indicators, sector = null) {
        const pesos = PESOS[sector] || PESOS.default;
        return Object.entries(pesos).reduce((acc, [k, p]) => {
            return acc + (indicators[k] ?? 0) * p;
        }, 0);
    }

    return {
        LABELS, PESOS,
        nivel, corNivel, labelNivel, resumoEstado,
        avaliarDecisaoContextual, isGameOver, scoreTotal
    };
})();
