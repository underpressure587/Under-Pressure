/* ═══════════════════════════════════════════════════════
   BETA · FEEDBACK · v5.0
   Inclui melhor alternativa para aprendizagem comparativa.
═══════════════════════════════════════════════════════ */


const BetaFeedback = (() => {

    const COR    = { boa: "#22c55e", media: "#f59e0b", ruim: "#ef4444" };
    const ROTULO = { boa: "✅ BOA DECISÃO", media: "⚠️ DECISÃO MÉDIA", ruim: "❌ MÁ DECISÃO" };

    function calcular({ choice, choiceIndex, avaliacaoContextual, efeitosFinais,
                        eventoAtivo, history, storyState, storyStateAnterior,
                        efeitosGestor, stakeholderReacao, melhorAlternativa }) {
        return {
            avaliacao:    avaliacaoContextual,
            cor:          COR[avaliacaoContextual]    || "#94a3b8",
            rotulo:       ROTULO[avaliacaoContextual] || "—",
            escolhaTexto: choice.text,
            efeitos:      efeitosFinais,
            ensinamento:  choice.ensinamento || "Reflita sobre o impacto desta decisão nos indicadores da empresa.",
            eventoAtivo,
            historico:    history.slice(-3).reverse(),
            novasFlags:       _detectarNovasFlags(storyState, storyStateAnterior),
            novasConquistas:  _detectarNovasConquistas(storyState, storyStateAnterior),
            efeitosGestor,
            stakeholderReacao,
            melhorAlternativa,   // choice object ou null
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
