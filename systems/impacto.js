/* ═══════════════════════════════════════════════════════
   BETA · IMPACTO · v5.0
   Calcula efeito real de uma decisão com modificadores
   de eventos ativos. Suporte a todos os 8 indicadores.
═══════════════════════════════════════════════════════ */

const BetaImpacto = (() => {

    /* Limite máximo de amplificação por imprevisto (Bug #6 FIX).
       Sem cap, rotatividade(2.5) × choice rh:-8 = -20 → colapso numa rodada.
       Cap em 2.0 garante no máximo ±16 num indicador antes do clamp [0,20]. */
    const MULT_CAP = 2.0;

    function calcular(baseEffects, activeEvents) {
        const final = { ...baseEffects };
        activeEvents.forEach(ev => {
            if (!ev.modifier) return;
            Object.entries(ev.modifier).forEach(([k, mult]) => {
                if (final[k] !== undefined) {
                    // Aplica cap: multiplicador nunca excede MULT_CAP em valor absoluto
                    const multSafe = Math.sign(mult) * Math.min(Math.abs(mult), MULT_CAP);
                    final[k] = Math.round(final[k] * multSafe);
                }
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
