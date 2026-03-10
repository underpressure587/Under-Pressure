/* ═══════════════════════════════════════════════════════
   BETA · IMPACTO · v5.0
   Calcula efeito real de uma decisão com modificadores
   de eventos ativos. Suporte a todos os 8 indicadores.
═══════════════════════════════════════════════════════ */

const BetaImpacto = (() => {

    function calcular(baseEffects, activeEvents) {
        const final = { ...baseEffects };
        activeEvents.forEach(ev => {
            if (!ev.modifier) return;
            Object.entries(ev.modifier).forEach(([k, mult]) => {
                if (final[k] !== undefined)
                    final[k] = Math.round(final[k] * mult);
            });
        });
        return final;
    }

    // Nomes legíveis de todos os indicadores possíveis
    const NOMES = {
        financeiro: "Financeiro", rh: "RH", clientes: "Clientes", processos: "Processos",
        margem: "Margem", estoque: "Estoque", marca: "Marca", digital: "Digital",
        sla: "SLA", frota: "Frota", seguranca: "Segurança", tecnologia: "Tecnologia",
        manutencao: "Manutenção", qualidade: "Qualidade", conformidade: "Conformidade",
        clima: "Clima", satisfacao: "Satisfação", produtividade: "Produtividade",
        reputacao: "Reputação", inovacao: "Inovação",
    };

    function descricao(effects) {
        return Object.entries(effects)
            .filter(([, v]) => v !== 0)
            .map(([k, v]) => `${v > 0 ? "✅" : "❌"} ${NOMES[k] || k}: ${v > 0 ? "+" : ""}${v}`)
            .join(" · ") || "Sem impacto nos indicadores.";
    }

    return { calcular, descricao, NOMES };
})();
