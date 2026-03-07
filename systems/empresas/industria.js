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
        }
    ]
};

export default EmpresaIndustria;
