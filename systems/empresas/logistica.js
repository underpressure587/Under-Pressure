/* ═══════════════════════════════════════════════════════
   BETA · EMPRESA · Logística
═══════════════════════════════════════════════════════ */

const EmpresaLogistica = {
    id:   "logistica",
    icon: "🚚",
    nome: "Operadora de Logística",
    desc: "Frota · TMS · Last-Mile Delivery",
    tag:  "logistica",
    dica: "Prazo é tudo. Atrasos destroem contratos. Processos operacionais eficientes são sua vantagem competitiva.",

    intros: [
        {
            badge:     "Operadora Logística · Last-Mile",
            subtitulo: "O SLA está quebrando. Seu maior cliente está de olho. O relógio corre.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Fundada há 11 anos na Grande São Paulo, sua operadora de logística cresceu de uma frota de 12 veículos para 420 entregadores e 8 centros de distribuição. Com faturamento de R$ 52 milhões anuais, a empresa atende 38 clientes corporativos e processou 2,1 milhões de entregas no último ano. A reputação de confiabilidade foi construída ao longo de uma década de operação consistente."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "O mercado de last-mile está sendo disputado por startups capitalizadas por VC com preços abaixo do custo para ganhar market share. Grandes e-commerces internacionalizaram suas operações e agora pressionam por SLA de 24h em centros urbanos. A tecnologia de roteirização por IA está redefinindo o custo por entrega — quem não investir vai perder competitividade rapidamente."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "31% das entregas estão fora do prazo de 48h — mais do que o dobro do benchmark setorial. O TMS está desatualizado, o estoque de manutenção da frota está em atraso e a rotatividade de entregadores atingiu 68% ao ano. Um cliente representa 38% da receita e tem cláusula de SLA no contrato."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Recuperar o nível de serviço sem aumentar o custo por entrega, diversificar a carteira de clientes para reduzir a dependência do cliente principal e modernizar a tecnologia de operação — tudo isso com uma equipe sob pressão e rotatividade crescente. Cada decisão precisa equilibrar o curto prazo operacional com a transformação estrutural necessária."
                }
            ],
            alerta: { icone: "🚨", titulo: "SLA em Descumprimento" },
            rodape: "Você tem {totalRounds} rodadas para recolocar a operação nos trilhos antes que os clientes percam a confiança."
        }
    ]
};

export default EmpresaLogistica;
