/* ═══════════════════════════════════════════════════════
   BETA · EMPRESA · Indústria
═══════════════════════════════════════════════════════ */

const EmpresaIndustria = {
    id:   "industria",
    icon: "🏭",
    nome: "Indústria Metalúrgica",
    desc: "Produção Pesada · ISO 9001 · Segurança",
    tag:  "industria",
    dica: "Segurança e conformidade não são custo — são pré-requisito. Uma parada de linha pode custar semanas.",

    intros: [
        {
            badge:     "Indústria Metalúrgica · Manufatura",
            subtitulo: "A fábrica tem 22 anos de história. E equipamentos quase tão velhos quanto ela.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Fundada em 2003 no interior do estado, sua metalúrgica cresceu de uma pequena oficina de usinagem para uma planta de 8.400m² com 310 funcionários diretos. Com faturamento de R$ 68 milhões anuais, a empresa produz componentes estruturais e peças de precisão para o setor automotivo e de infraestrutura. A certificação ISO 9001 foi conquistada há 7 anos e é a âncora dos contratos mais importantes."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "A indústria metalúrgica nacional enfrenta tripla pressão: custo de energia em alta histórica, matéria-prima importada sujeita à volatilidade cambial e concorrência crescente de fundições asiáticas com custo 30% menor. Ao mesmo tempo, clientes de grande porte estão exigindo certificações ESG e rastreabilidade total — requisitos que demandam investimento significativo em tecnologia e processos."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "O índice de frequência de acidentes está em 18,4 — o dobro do benchmark do setor. A certificação ISO 9001 está sob risco por não-conformidades identificadas em auditoria. A prensa hidráulica principal, responsável por 60% da produção, sofreu falha recente. E o engenheiro sênior que domina o conhecimento de manutenção quer se aposentar."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Modernizar a operação sem paralisar a produção que sustenta os contratos existentes. Cada real investido em segurança e automação é um real não investido em capacidade produtiva — e vice-versa. A empresa precisa decidir se vai competir por custo, por qualidade técnica ou por sustentabilidade. Os três ao mesmo tempo, sem capital suficiente, é caminho para a mediocridade em tudo."
                }
            ],
            alerta: { icone: "🚨", titulo: "Segurança e ISO em Risco" },
            rodape: "Você tem {totalRounds} rodadas para transformar a fábrica antes que os problemas acumulados se tornem irreversíveis."
        },

        /* ── 2 ─────────────────────────────────────── */
        {
            badge:     "Indústria de Embalagens · Bens de Consumo",
            subtitulo: "Seus maiores clientes querem embalagens sustentáveis. Sua linha de produção não está pronta.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Com 18 anos de operação no interior do Paraná, sua indústria de embalagens plásticas atende 62 clientes no setor alimentício e de higiene pessoal. São 430 funcionários, duas plantas industriais e faturamento de R$ 94 milhões anuais. A empresa é fornecedora homologada de três grandes redes varejistas e de dois dos maiores fabricantes de alimentos do país — contratos que representam 58% da receita."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "A pressão ESG chegou à cadeia de fornecedores: os grandes clientes passaram a exigir que ao menos 30% dos insumos usados nas embalagens sejam de origem reciclada ou renovável até o próximo ano. A regulamentação federal de responsabilidade pós-consumo também avança, com multas previstas para produtores que não comprovarem destinação adequada de resíduos. Concorrentes já iniciaram conversões de linha."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "A conversão de uma linha de produção para insumos reciclados custa entre R$ 8 e R$ 12 milhões e leva de 6 a 10 meses. A empresa não tem caixa suficiente para converter as duas plantas simultaneamente. Um dos clientes-âncora enviou carta formal solicitando cronograma de adequação — e deixou claro que avaliará outros fornecedores caso o prazo não seja cumprido."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Priorizar qual linha converter primeiro sem perder os clientes que exigem o prazo mais curto, ao mesmo tempo em que negocia financiamento para a conversão e mantém a produção corrente funcionando. Cada mês de atraso aumenta o risco de perder contratos; cada decisão precipitada pode comprometer a qualidade do produto e gerar devoluções que destroem a margem."
                }
            ],
            alerta: { icone: "🚨", titulo: "Adequação ESG Urgente" },
            rodape: "Você tem {totalRounds} rodadas para modernizar a operação sem perder os contratos que sustentam a empresa."
        },

        /* ── 3 ─────────────────────────────────────── */
        {
            badge:     "Indústria Química · Especialidades",
            subtitulo: "Uma autuação ambiental parou a planta. A retomada depende de você.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Fundada há 30 anos no ABC paulista, sua indústria química produz aditivos e solventes para o segmento de tintas, vernizes e adesivos industriais. Com 280 funcionários e R$ 71 milhões em receita anual, a empresa é fornecedora de referência para construtoras e fabricantes de móveis. A reputação técnica construída ao longo de três décadas é o principal ativo da marca."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "A fiscalização ambiental no setor químico intensificou-se após acidentes em concorrentes regionais. Licenças de operação estão sendo revisadas em todo o setor. Ao mesmo tempo, a alta do dólar encareceu os insumos importados em 27% nos últimos 12 meses, comprimindo margens. Clientes construtoras, por sua vez, atravessam um ciclo de baixa e têm reduzido pedidos."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "O IBAMA autuou a empresa por descarte irregular de resíduo em área de proteção ambiental. A multa inicial é de R$ 4,1 milhões, e a planta está operando em regime parcial sob monitoramento do órgão. O responsável técnico ambiental pediu demissão no dia seguinte à autuação. A imprensa regional noticiou o caso, e dois clientes sinalizaram revisão de contrato."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Regularizar a situação ambiental com agilidade para retomar a operação plena, reconstruir a credibilidade com clientes e órgãos reguladores, e simultaneamente reorganizar o processo de gestão de resíduos para evitar recorrência. A crise expõe a fragilidade da governança interna — e a janela para agir antes de perder contratos críticos é estreita."
                }
            ],
            alerta: { icone: "🚨", titulo: "Autuação Ambiental Ativa" },
            rodape: "Você tem {totalRounds} rodadas para regularizar a operação e reconstruir a confiança do mercado."
        }
    ]
};
