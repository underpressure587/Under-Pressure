/* ═══════════════════════════════════════════════════════
   BETA · EMPRESA · Varejo
═══════════════════════════════════════════════════════ */

const EmpresaVarejo = {
    id:   "varejo",
    icon: "🛒",
    nome: "Rede de Varejo",
    desc: "Lojas Físicas · E-commerce · Omnichannel",
    tag:  "varejo",
    dica: "Margens apertadas exigem giro rápido. Clientes satisfeitos garantem o retorno que sustenta a operação.",

    intros: [
        {
            badge:     "Rede de Varejo · Omnichannel",
            subtitulo: "Você assumiu a gestão. As lojas físicas sangram e o digital ainda não compensou.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Fundada há 22 anos no interior de São Paulo, sua rede cresceu de 3 para 38 lojas físicas distribuídas em 12 cidades. Com R$ 180 milhões em receita anual e 820 funcionários, a empresa sempre foi referência regional em atendimento. O e-commerce foi lançado há 3 anos e hoje representa 14% das vendas — crescendo, mas insuficiente para compensar a deterioração das margens no físico."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "O varejo regional enfrenta a maior pressão competitiva da história: marketplaces com entrega em 24h, discount stores e o crescimento acelerado do e-commerce dos grandes players. A margem bruta do setor caiu de 32% para 24% nos últimos 5 anos. Quem não se adaptar ao modelo omnichannel nos próximos 2 anos vai perder relevância permanentemente."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "A margem operacional caiu de 8,3% para 5,1% em 18 meses. Seis lojas têm resultado negativo consistente. O estoque parado soma R$ 4,2 milhões. A rotatividade do time de vendas subiu para 47% ao ano — os melhores vendedores estão saindo para redes maiores ou para o setor de serviços."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Reestruturar a rede física sem destruir o que a torna especial — o atendimento personalizado — enquanto acelera a transformação digital e recupera as margens. Cada decisão envolve um trade-off real: fechar lojas deficitárias afeta comunidades e marca; manter custa caixa que poderia modernizar o restante."
                }
            ],
            alerta: { icone: "🚨", titulo: "Margem em Queda" },
            rodape: "Você tem {totalRounds} rodadas para tomar decisões e reconstruir a rentabilidade da rede."
        }
    ]
};

export default EmpresaVarejo;
