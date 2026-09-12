


const BetaFeedback = (() => {

    const COR    = { boa: "#22c55e", media: "#f59e0b", ruim: "#ef4444" };
    const ROTULO = { boa: `${Icone('circle-check',13,'var(--good)')} BOA DECISÃO`, media: `${Icone('triangle-alert',13,'var(--warn)')} DECISÃO MÉDIA`, ruim: `${Icone('circle-x',13,'var(--danger)')} MÁ DECISÃO` };

    function calcular({ choice, choiceIndex, avaliacaoContextual, contextoAvaliacao,
                        efeitosFinais, eventoAtivo, history, storyState, storyStateAnterior,
                        efeitosGestor, stakeholderReacao, melhorAlternativa }) {

        
        
        
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
            contextoAvaliacao: textoContexto, 
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
