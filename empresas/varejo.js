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
        },

        /* ── 2 ─────────────────────────────────────── */
        {
            badge:     "Rede de Farmácias · Varejo de Saúde",
            subtitulo: "As redes nacionais chegaram na sua cidade. E trouxeram preços que você não consegue bater.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Sua rede regional de farmácias foi fundada há 27 anos na região metropolitana de Fortaleza. Com 24 lojas, 360 funcionários e R$ 110 milhões em receita anual, a empresa construiu uma base fiel de clientes graças ao atendimento humanizado e ao relacionamento de longo prazo com médicos locais. O programa de fidelidade tem 94 mil clientes ativos e a participação de mercado regional sempre foi estável, em torno de 18%."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "Duas grandes redes nacionais abriram 31 lojas na região nos últimos 18 meses, com preços até 15% abaixo dos praticados localmente graças ao poder de compra centralizado. A digitalização do setor farmacêutico acelerou: aplicativos de comparação de preço e delivery de medicamentos em até 1 hora passaram a ser o padrão de exigência dos consumidores mais jovens. Margens de medicamentos de referência foram comprimidas pela pressão dos genéricos."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "A receita caiu 11% no último semestre e quatro lojas em áreas onde os concorrentes nacionais abriram pontos registram resultado negativo. O ticket médio por cliente recuou de R$ 98 para R$ 81. O sistema de gestão de estoque está desatualizado, gerando rupturas frequentes nos produtos de maior giro. A equipe de farmacêuticos — o principal diferencial de atendimento — está com salários defasados em relação às ofertas dos concorrentes."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Reposicionar a rede para competir no que as grandes redes não conseguem replicar — proximidade, confiança e serviço personalizado — enquanto moderniza a operação e decide quais lojas defender, quais transformar e quais fechar. Tentar competir em preço é um caminho direto para a destruição de margem. O verdadeiro diferencial está em saber qual batalha é possível vencer."
                }
            ],
            alerta: { icone: "🚨", titulo: "Concorrência Nacional Chegou" },
            rodape: "Você tem {totalRounds} rodadas para reposicionar a rede antes que a erosão de clientes se torne irreversível."
        },

        /* ── 3 ─────────────────────────────────────── */
        {
            badge:     "Atacarejo Regional · Autosserviço",
            subtitulo: "Você dobrou o tamanho em 3 anos. Agora o crescimento rápido está cobrando a conta.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Seu atacarejo cresceu de 2 para 7 lojas nos últimos 3 anos, aproveitando o movimento de migração de consumidores para o formato cash-and-carry durante o período de alta inflação. Com 980 funcionários e R$ 420 milhões em receita anual, a rede se tornou referência no interior de Minas Gerais. O modelo atende tanto o consumidor final quanto pequenos comerciantes e restaurantes, com tíquete médio de R$ 310."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "A normalização da inflação reduziu o ímpeto do consumidor para o formato atacarejo. Grandes redes do segmento — Atacadão e Assaí — estão em franca expansão para o interior do estado, com lojas maiores e preços beneficiados por escala nacional. O custo de ocupação das novas lojas abertas nos últimos 2 anos pesa cada vez mais no resultado, especialmente nas unidades que ainda não atingiram maturidade de volume."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "Três das sete lojas abertas recentemente ainda operam abaixo do ponto de equilíbrio. A dívida contraída para financiar a expansão representa 2,8x o EBITDA — acima do limite confortável para o setor. O time de gestão, que funcionava bem com 2 lojas, está sobrecarregado e sem processos estruturados para operar 7 unidades. A taxa de perdas (quebra e furto) subiu de 1,4% para 2,9% da receita."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Desacelerar o crescimento e colocar as lojas existentes no azul antes que a chegada dos grandes concorrentes reduza ainda mais as margens. Isso exige profissionalizar a gestão, controlar perdas, reduzir o endividamento e possivelmente rever o mix de produtos para focar nos segmentos onde a rede tem vantagem real frente às grandes redes nacionais."
                }
            ],
            alerta: { icone: "🚨", titulo: "Expansão Desequilibrada" },
            rodape: "Você tem {totalRounds} rodadas para consolidar a operação e recuperar a rentabilidade da rede."
        }
        }
    ]
};
