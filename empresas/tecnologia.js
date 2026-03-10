/* ═══════════════════════════════════════════════════════
   BETA · EMPRESA · Tecnologia
   10 histórias de intro — 1 sorteada por jogo
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
        }

    ] /* fim de intros[] — histórias 2-10 removidas para teste beta */
};
