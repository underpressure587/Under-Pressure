

const BetaImpacto = (() => {

    
    const MULT_CAP = 2.0;

    function calcular(baseEffects, activeEvents) {
        const final = { ...baseEffects };
        activeEvents.forEach(ev => {
            if (!ev.modifier) return;
            Object.entries(ev.modifier).forEach(([k, mult]) => {
                if (final[k] !== undefined) {
                    
                    const multSafe = Math.sign(mult) * Math.min(Math.abs(mult), MULT_CAP);
                    final[k] = Math.round(final[k] * multSafe);
                }
            });
        });
        return final;
    }

    
    const NOMES = {
        financeiro: "Financeiro", rh: "RH", clientes: "Clientes", processos: "Processos",
        margem: "Margem", estoque: "Estoque", marca: "Marca", digital: "Digital",
        sla: "SLA", frota: "Frota", seguranca: "Segurança", tecnologia: "Tecnologia",
        manutencao: "Manutenção", qualidade: "Qualidade", conformidade: "Conformidade",
        produtividade: "Produtividade", reputacao: "Reputação", inovacao: "Inovação",
    };

    function descricao(effects) {
        return Object.entries(effects)
            .filter(([, v]) => v !== 0)
            .map(([k, v]) => `${v > 0 ? "✅" : "❌"} ${NOMES[k] || k}: ${v > 0 ? "+" : ""}${v}`)
            .join(" · ") || "Sem impacto nos indicadores.";
    }

    return { calcular, descricao, NOMES };
})();
