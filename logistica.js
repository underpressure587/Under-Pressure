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
        },

        /* ── 2 ─────────────────────────────────────── */
        {
            badge:     "Logística Refrigerada · Cadeia do Frio",
            subtitulo: "Uma falha na cadeia do frio não é apenas prejuízo — é risco sanitário.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Sua operadora de logística refrigerada atua há 14 anos no transporte e armazenagem de alimentos perecíveis, medicamentos e insumos hospitalares. Com 190 colaboradores, 87 veículos refrigerados e 3 armazéns frigorificados no eixo SP-RJ-BH, a empresa fatura R$ 38 milhões anuais. Os contratos com redes de supermercados e distribuidoras farmacêuticas exigem rastreabilidade contínua e temperatura garantida."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "A ANVISA intensificou auditorias na cadeia do frio após episódios de contaminação em outros operadores do setor. Seguradoras elevaram os prêmios de cobertura de carga perecível em 40%. Ao mesmo tempo, grandes redes varejistas estão verticalizando parte da operação logística, reduzindo o volume disponível para terceiros. O custo de energia para refrigeração subiu 22% no último ano."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "Um sensor de temperatura falhou em um veículo durante uma entrega para rede farmacêutica, resultando na devolução de R$ 620 mil em medicamentos. O cliente acionou a cláusula de auditoria do contrato. Internamente, o diagnóstico revelou que 18% da frota refrigerada está com sistemas de monitoramento desatualizados. O responsável de qualidade identificou o problema há 4 meses, mas o investimento foi adiado por restrições orçamentárias."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Modernizar o sistema de monitoramento de temperatura de toda a frota sem paralisar a operação, reconstituir a confiança do cliente farmacêutico e estabelecer um protocolo de qualidade que passe na auditoria iminente — tudo isso gerenciando um caixa apertado e uma equipe operacional sob pressão máxima. Uma segunda falha neste momento pode custar o contrato mais importante da empresa."
                }
            ],
            alerta: { icone: "🚨", titulo: "Falha na Cadeia do Frio" },
            rodape: "Você tem {totalRounds} rodadas para reconquistar a confiança e modernizar a operação."
        },

        /* ── 3 ─────────────────────────────────────── */
        {
            badge:     "Fulfillment de E-commerce · Operação Omnichannel",
            subtitulo: "O contrato com o marketplace maior do Brasil começou. A operação não estava pronta.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Especializada em fulfillment para e-commerce, sua empresa opera 2 centros de distribuição na região de Campinas e processa 18 mil pedidos por dia. Com 310 funcionários e faturamento de R$ 45 milhões, a empresa cresceu 3x nos últimos 2 anos acompanhando o boom do comércio eletrônico. O diferencial é a integração com os principais marketplaces nacionais e o SLA de despacho em até 4 horas do recebimento do pedido."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "A guerra de entrega entre marketplaces empurrou o SLA padrão de same-day para next-day nas regiões metropolitanas. Gigantes do e-commerce estão construindo seus próprios CDs, ameaçando contratos de operadores independentes. A escassez de mão de obra especializada em operações de CD elevou o custo de contratação em 35%, enquanto a automação ainda está fora do alcance financeiro da maioria dos operadores de médio porte."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "A entrada de um contrato com um marketplace de grande porte elevou o volume de pedidos em 62% de um mês para o outro. O CD principal está operando acima de 110% da capacidade, gerando filas internas, erros de separação e atrasos. O índice de pedidos com problema saltou de 1,2% para 4,7% — acima do limite contratual de 2%. O marketplace já emitiu alerta formal e tem cláusula de rescisão por performance."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Absorver o volume adicional rapidamente sem comprometer a qualidade das entregas dos clientes já existentes, antes que o marketplace acione a cláusula de rescisão. Isso exige decisões simultâneas de infraestrutura, pessoas e processo — em um ambiente onde cada erro é visível em tempo real no painel do contratante e pode virar notícia nas redes sociais dos consumidores finais."
                }
            ],
            alerta: { icone: "🚨", titulo: "Capacidade no Limite" },
            rodape: "Você tem {totalRounds} rodadas para estabilizar a operação e honrar os contratos."
        }
    ]
};
