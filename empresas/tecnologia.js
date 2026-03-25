/* ═══════════════════════════════════════════════════════
   BETA · EMPRESA · Tecnologia
   3 histórias de intro — 1 sorteada por jogo
═══════════════════════════════════════════════════════ */

const EmpresaTecnologia = {
    id:   "tecnologia",
    icon: "🚀",
    nome: "Startup de Tecnologia",
    desc: "SaaS · IA · Engenharia de Software",
    tag:  "tecnologia",
    dica: "Startups vivem de inovação e velocidade. Cuide do time — engenheiros insatisfeitos pedem demissão.",

    /* ── Array de intros (sorteado pelo engine) ─────── */
    intros: [

        /* ── 1 ─────────────────────────────────────── */
        {
            badge:     "Startup de Tecnologia · SaaS B2B",
            subtitulo: "Você acaba de assumir a gestão. O relógio já está correndo.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Fundada há 4 anos num coworking em São Paulo, sua startup cresceu de 3 para 67 funcionários surfando a onda da transformação digital. Vocês desenvolvem uma plataforma SaaS de gestão para PMEs e já atingiram R$ 4,2 milhões em ARR. O NPS do produto é 71 — acima da média do mercado — e o pipeline comercial nunca esteve tão cheio."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "O setor de SaaS B2B no Brasil cresceu 28% no último ano, mas a competição esquentou. Dois concorrentes bem financiados entraram no seu nicho com preços 20% abaixo dos seus. Os investidores da série A estão atentos: o próximo round depende dos resultados dos próximos dois trimestres."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "A dívida técnica acumulada nos últimos 18 meses está travando a velocidade de entrega. A rotatividade no time de engenharia disparou: três sêniores pediram demissão no último mês, levando consigo conhecimento crítico do produto. O churn de clientes subiu de 2,1% para 3,8% mensais."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Equilibrar a pressão por crescimento rápido — que os investidores exigem — com a necessidade urgente de estabilizar o time e a plataforma. Cada decisão envolve um trade-off real: crescer rápido demais quebra o produto e o time; crescer devagar demais perde o mercado para os concorrentes."
                }
            ],
            alerta: { icone: "🚨", titulo: "Crise em Andamento" },
            rodape: "Você tem {totalRounds} rodadas para tomar decisões e conduzir a empresa ao resultado."
        },

        /* ── 2 ─────────────────────────────────────── */
        {
            badge:     "EdTech · Ensino Digital B2C",
            subtitulo: "O boom acabou. Agora é hora de construir um negócio de verdade.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Sua plataforma de educação online nasceu no auge da pandemia e chegou a 180 mil alunos ativos em 2021. Com R$ 22 milhões em receita anual e 95 colaboradores, a empresa se tornou referência em cursos de tecnologia e negócios para jovens profissionais. O modelo de assinatura mensal respondia por 70% da receita recorrente."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "A volta ao presencial reduziu a demanda por cursos online em 34% no setor. Plataformas internacionais como Coursera e Udemy ampliaram sua presença no Brasil com preços agressivos. O mercado de EdTech enfrenta uma onda de consolidação: quatro startups do setor faliram nos últimos seis meses, abrindo espaço — mas também gerando desconfiança nos investidores."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "A base de assinantes caiu de 180 mil para 94 mil em 18 meses. O CAC triplicou enquanto o LTV encolheu. O runway atual é de 8 meses — insuficiente para chegar ao break-even sem um corte cirúrgico de custos ou uma entrada de capital. O time de conteúdo, responsável pela qualidade que diferencia o produto, está sobrecarregado e desmotivado."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Decidir entre dois caminhos: pivotar para o modelo B2B (vender licenças corporativas para treinamento de equipes, onde as margens são maiores) ou focar no B2C e recuperar a base com um produto mais enxuto e preço competitivo. Cada caminho exige um perfil de time diferente — e você não tem capital para tentar os dois ao mesmo tempo."
                }
            ],
            alerta: { icone: "🚨", titulo: "Runway Crítico" },
            rodape: "Você tem {totalRounds} rodadas para tomar decisões e definir o futuro da empresa."
        },

        /* ── 3 ─────────────────────────────────────── */
        {
            badge:     "Scale-up de IA · Automação Corporativa",
            subtitulo: "O produto funciona. O problema é que o mercado ainda não sabe disso.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Sua empresa desenvolve uma plataforma de automação inteligente para processos de RH e compliance. Fundada há 3 anos por ex-pesquisadores de IA da USP, o produto ganhou dois prêmios de inovação e tem NPS de 83 entre os 40 clientes atuais. O faturamento é de R$ 6,8 milhões em ARR, com 58 funcionários — a maioria formada por cientistas de dados e engenheiros sênior."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "O hype de IA generativa fez grandes players — SAP, Oracle e startups bem capitalizadas — anunciarem soluções similares para os próximos 12 meses. Clientes enterprise que demonstravam interesse passaram a 'aguardar o mercado amadurecer'. Ao mesmo tempo, o segmento de PMEs que a empresa atende hoje tem tíquete médio baixo e ciclo de vendas longo, comprimindo a eficiência comercial."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "O pipeline comercial está travado: 60% das oportunidades estão em 'avaliação técnica' há mais de 90 dias. A equipe de vendas, de apenas 4 pessoas, não tem experiência em vendas enterprise. O time técnico, excelente, não se comunica bem com compradores não-técnicos — e as demos frequentemente afastam em vez de convencer os decisores de negócio."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Transformar um produto tecnicamente superior em um negócio comercialmente viável antes que os grandes players lancem suas soluções. Isso exige construir capacidade de vendas enterprise, simplificar a proposta de valor e, possivelmente, escolher um vertical específico onde a empresa possa dominar antes de expandir. O tempo é o recurso mais escasso."
                }
            ],
            alerta: { icone: "🚨", titulo: "Pipeline Travado" },
            rodape: "Você tem {totalRounds} rodadas para transformar o potencial em resultado real."
        }

    ] /* fim de intros[] */
};
