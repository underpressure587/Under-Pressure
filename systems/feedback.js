/* ═══════════════════════════════════════════════════════
   BETA · FEEDBACK · v5.0
   Inclui melhor alternativa para aprendizagem comparativa.
═══════════════════════════════════════════════════════ */


const BetaFeedback = (() => {

    const COR    = { boa: "#22c55e", media: "#f59e0b", ruim: "#ef4444" };
    const ROTULO = { boa: "✅ BOA DECISÃO", media: "⚠️ DECISÃO MÉDIA", ruim: "❌ MÁ DECISÃO" };

    function calcular({ choice, choiceIndex, avaliacaoContextual, contextoAvaliacao,
                        efeitosFinais, eventoAtivo, history, storyState, storyStateAnterior,
                        efeitosGestor, stakeholderReacao, melhorAlternativa }) {

        // Monta o texto de análise:
        // 1. Ensinamento da choice (específico para a alternativa escolhida)
        // 2. Contexto da avaliação (explica fase, urgência, tendência) — separado por linha
        const ensinamentoBase = choice.ensinamento || '';
        const textoContexto   = contextoAvaliacao  || '';

        let ensinamento;
        if (ensinamentoBase && textoContexto) {
            ensinamento = `${ensinamentoBase}

${textoContexto}`;
        } else {
            ensinamento = ensinamentoBase || textoContexto || 'Reflita sobre o impacto desta decisão nos indicadores da empresa.';
        }

        return {
            avaliacao:    avaliacaoContextual,
            cor:          COR[avaliacaoContextual]    || "#94a3b8",
            rotulo:       ROTULO[avaliacaoContextual] || "—",
            escolhaTexto: choice.text,
            efeitos:      efeitosFinais,
            ensinamento,
            contextoAvaliacao: textoContexto, // exposto separado para UI usar se quiser
            eventoAtivo,
            historico:    history.slice(-3).reverse(),
            novasFlags:       _detectarNovasFlags(storyState, storyStateAnterior),
            novasConquistas:  _detectarNovasConquistas(storyState, storyStateAnterior),
            efeitosGestor,
            stakeholderReacao,
            melhorAlternativa,
        };
    }

    function _detectarNovasFlags(storyState, storyStateAnterior) {
        if (!storyState || !storyStateAnterior) return [];
        const antes = storyStateAnterior.flags || [];
        return (storyState.flags || []).filter(f => !antes.includes(f));
    }

    function _detectarNovasConquistas(storyState, storyStateAnterior) {
        if (!storyState || !storyStateAnterior) return [];
        const antes = storyStateAnterior.conquistas || [];
        return (storyState.conquistas || []).filter(c => !antes.includes(c));
    }

    return { calcular, COR, ROTULO };
})();
