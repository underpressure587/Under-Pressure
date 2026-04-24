/* ═══════════════════════════════════════════════════════════════════
   BETA · VAREJO · ROUNDS v6.0
   Estrutura: 3 histórias × 15 rodadas × 3 fases
   Indicadores: financeiro, rh, clientes, processos,
                margem, estoque, marca, digital
   Sistema de sorteio: diagnostico(5→3) pressao(5→4) decisao(5→3)
═══════════════════════════════════════════════════════════════════ */

const VarejoRounds = [

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [0] · Rede Omnichannel — Margem em queda
   Contexto: rede de 38 lojas físicas, R$180M de receita,
   e-commerce em 14%, margem caindo de 8,3% para 5,1%,
   6 lojas no vermelho, estoque parado de R$4,2M.
══════════════════════════════════════════════════════════════════ */
[

  /* ═══════════════════════════════════════════════════════
     R1 · DIAGNÓSTICO · Os Números Não Fecham
     Contexto: primeiro dia, diretora financeira apresenta
     a queda de margem dos últimos 18 meses.
  ═══════════════════════════════════════════════════════ */
  {
    title: "Os Números Não Fecham",
    description: "Ana, sua diretora financeira, apresenta os resultados do trimestre: margem operacional caiu de 8,3% para 5,1% em 18 meses. As lojas físicas respondem por 86% da receita mas concentram 94% dos custos. O e-commerce cresce 23% ao ano mas ainda não cobre a perda de margem do físico. Por onde começa o diagnóstico?",
    tags: ["varejo"],
    fase: "diagnostico",
    choices: [
      {
        text: "Mapear as 5 lojas com pior desempenho e calcular o custo real de cada uma",
        risco: "baixo",
        effects: { financeiro: +2, processos: +3, margem: +2 },
        avaliacao: "boa",
        ensinamento: "O diagnóstico granular por unidade é o primeiro passo de qualquer reestruturação de varejo. Sem saber quais lojas destroem margem, qualquer decisão é chute no escuro."
      },
      {
        text: "Contratar consultoria especializada em varejo para avaliar toda a operação",
        risco: "medio",
        effects: { financeiro: -4, processos: +2, margem: +1 },
        avaliacao: "media",
        ensinamento: "Consultoria traz benchmarks de mercado valiosos, mas o diagnóstico interno feito pelo próprio time costuma ser mais rápido e mais aderente à realidade operacional da empresa."
      },
      {
        text: "Anunciar corte de 10% em todos os custos de todas as lojas imediatamente",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2, capitalPolitico: +1 },
        effects: { financeiro: +2, rh: -4, processos: -2, margem: +1 },
        avaliacao: "ruim",
        ensinamento: "Corte linear sem diagnóstico é o erro clássico de gestão de crise no varejo. Penaliza lojas saudáveis junto com as problemáticas e destrói a moral do time."
      },
      {
        text: "Acelerar as vendas do e-commerce para compensar a queda de margem do físico",
        risco: "medio",
        effects: { clientes: +2, financeiro: -3, digital: +2, margem: -1 },
        avaliacao: "ruim",
        ensinamento: "Crescer o canal com menor margem para compensar o problema do canal principal adia o problema sem resolvê-lo. A causa-raiz da queda de margem precisa ser endereçada."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R2 · DIAGNÓSTICO · O Ranking das Lojas
     Contexto: mapeamento revela 8 lojas gerando 71% do lucro
     e 6 lojas com resultado negativo há mais de 12 meses.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Ranking das Lojas",
    description: "O mapeamento revelou: das 38 lojas, 8 respondem por 71% do lucro. 6 lojas têm resultado negativo há mais de 12 meses. O gerente regional defende que as lojas deficitárias ainda têm 'valor estratégico de presença'. O contrato de aluguel de três delas vence em 60 dias.",
    tags: ["varejo"],
    fase: "diagnostico",
    choices: [
      {
        text: "Não renovar os contratos das 3 lojas deficitárias com aluguel vencendo",
        risco: "medio",
        effects: { financeiro: +5, rh: -3, clientes: -2, margem: +3 },
        avaliacao: "boa",
        ensinamento: "Fechar lojas cronicamente deficitárias é decisão difícil mas necessária. O dinheiro economizado pode fortalecer as lojas rentáveis."
      },
      {
        text: "Negociar redução de 30% nos aluguéis das 6 lojas deficitárias antes de qualquer fechamento",
        risco: "baixo",
        effects: { financeiro: +3, processos: +2, margem: +2 },
        avaliacao: "boa",
        ensinamento: "Renegociação de aluguel é a primeira alavanca em varejo. Proprietários preferem 30% menos a ter o espaço vazio."
      },
      {
        text: "Converter as lojas deficitárias em pontos de experiência sem estoque físico",
        risco: "alto",
        effects: { financeiro: -2, clientes: +3, processos: -3, marca: +2, estoque: +2 },
        avaliacao: "media",
        ensinamento: "Lojas conceito têm apelo no varejo moderno, mas a conversão tem custo e leva tempo para provar ROI."
      },
      {
        text: "Manter todas as lojas e dar 6 meses para os gerentes regionais reverterem os resultados",
        risco: "alto",
        effects: { financeiro: -5, rh: -1, processos: -3, margem: -2 },
        avaliacao: "ruim",
        ensinamento: "Manter lojas cronicamente deficitárias sem plano estrutural consome caixa sem perspectiva de retorno."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R3 · DIAGNÓSTICO · O Time de Vendas Está Desmotivado
     Contexto: 62% do time se sente ameaçado pelo e-commerce,
     rotatividade subiu de 28% para 47% ao ano.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Time de Vendas Está Desmotivado",
    description: "A pesquisa de clima aponta: 62% do time de vendas das lojas físicas se sente 'ameaçado' pelo crescimento do e-commerce. Os melhores vendedores estão saindo. O índice de rotatividade do time comercial subiu de 28% para 47% ao ano.",
    tags: ["varejo"],
    fase: "diagnostico",
    choices: [
      {
        text: "Criar comissão para vendedores físicos que direcionam clientes ao app — integração real de canais",
        risco: "baixo",
        effects: { rh: +6, clientes: +3, financeiro: -2, digital: +2, marca: +1 },
        avaliacao: "boa",
        ensinamento: "Remunerar o vendedor físico por vendas no digital elimina a percepção de competição interna. Omnichannel real começa quando os incentivos dos canais estão alinhados."
      },
      {
        text: "Comunicar que o e-commerce e o físico têm papéis complementares e que ninguém será demitido",
        risco: "baixo",
        effects: { rh: +4, marca: +1 },
        avaliacao: "media",
        ensinamento: "Comunicação sobre o futuro dos empregos é necessária, mas sem mudança real nos incentivos, o discurso perde credibilidade rapidamente."
      },
      {
        text: "Aumentar o salário fixo dos vendedores físicos em 15% para reter o time",
        risco: "alto",
        gestorEffects: { reputacaoInterna: +2, capitalPolitico: -1 },
        effects: { financeiro: -5, rh: +4, margem: -2 },
        avaliacao: "media",
        ensinamento: "Aumento de salário resolve o imediato mas não ataca a causa: o medo de irrelevância frente ao digital."
      },
      {
        text: "Focar na automação e aceitar a rotatividade como parte da transformação digital",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2 },
        effects: { financeiro: +2, rh: -6, clientes: -4, marca: -2 },
        avaliacao: "ruim",
        ensinamento: "Abrir mão do capital humano acumulado no atendimento físico para economizar em pessoas é uma aposta muito cara em varejo de relacionamento."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R4 · DIAGNÓSTICO · O Problema do Estoque
     Contexto: R$4,2M parados há 90 dias, ruptura em 18%
     contra benchmark de 8%, previsão manual por loja.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Problema do Estoque",
    description: "O relatório de inventário revela: R$ 4,2 milhões em produtos parados há mais de 90 dias. A previsão de demanda é feita manualmente por cada gerente de loja. Resultado: lojas com excesso em alguns SKUs e ruptura em outros. O índice de ruptura médio está em 18% — acima do benchmark de 8%.",
    tags: ["varejo"],
    fase: "diagnostico",
    choices: [
      {
        text: "Implementar sistema de gestão de estoque centralizado com reposição automática por loja",
        risco: "medio",
        effects: { processos: +6, financeiro: -4, rh: -1, estoque: +5 },
        avaliacao: "boa",
        ensinamento: "Centralização do estoque com algoritmos de reposição é o padrão em redes de varejo eficientes. Elimina a ruptura, reduz o estoque parado e libera os gerentes para foco no cliente."
      },
      {
        text: "Fazer liquidação agressiva dos R$4,2M parados para liberar caixa imediatamente",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +1 },
        effects: { financeiro: +4, clientes: +1, processos: +2, estoque: +4, margem: -1 },
        avaliacao: "boa",
        ensinamento: "Liquidar estoque parado com desconto é preferível a manter o capital imobilizado. A perda de margem pontual libera caixa para reinvestir em produtos de giro rápido."
      },
      {
        text: "Contratar gerente de supply chain para liderar a reorganização do estoque",
        risco: "medio",
        effects: { financeiro: -3, processos: +4, rh: +1, estoque: +2 },
        avaliacao: "media",
        ensinamento: "Um gestor especializado em supply chain traz metodologia, mas leva de 3 a 6 meses para produzir resultado concreto."
      },
      {
        text: "Treinar os gerentes de loja para melhorar as previsões manuais de estoque",
        risco: "baixo",
        effects: { rh: +2, processos: -2, estoque: +1 },
        avaliacao: "ruim",
        ensinamento: "Treinamento em previsão manual não escala. Humanos não processam os dados de velocidade de giro que sistemas automatizados tratam em segundos."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R5 · DIAGNÓSTICO · O E-commerce Não Converte
     Contexto: 280k visitantes mensais, conversão de 1,4%
     contra benchmark de 2,8%, site lento, frete caro.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O E-commerce Não Converte",
    description: "O site tem 280.000 visitantes mensais mas converte apenas 1,4% — a média do varejo nacional é 2,8%. O time de TI aponta: tempo de carregamento médio de 6,2 segundos no mobile, frete caro e sem opção de retirada em loja. O canal digital cresce em visitas mas não em receita.",
    tags: ["varejo"],
    fase: "diagnostico",
    choices: [
      {
        text: "Implementar 'retire na loja' e notificação por WhatsApp — integração física e digital com baixo custo",
        risco: "baixo",
        effects: { digital: +5, clientes: +4, processos: +2, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "O 'click and collect' aumenta conversão online, reduz custo de frete e traz o cliente para a loja — onde pode comprar mais. É a âncora do omnichannel real."
      },
      {
        text: "Migrar para nova plataforma de e-commerce com melhor performance mobile",
        risco: "alto",
        effects: { digital: +6, financeiro: -6, processos: -3, clientes: -1 },
        avaliacao: "media",
        ensinamento: "Troca de plataforma resolve a causa técnica mas tem risco de migração, custo alto e período de instabilidade que pode piorar a conversão temporariamente."
      },
      {
        text: "Investir em tráfego pago para aumentar o volume de visitantes e compensar a baixa conversão",
        risco: "medio",
        effects: { financeiro: -4, digital: +2, clientes: +1, margem: -2 },
        avaliacao: "ruim",
        ensinamento: "Trazer mais tráfego para um funil com baixa conversão é jogar dinheiro fora. O problema é a taxa de conversão, não o volume de visitantes."
      },
      {
        text: "Reduzir o catálogo online para os 200 produtos de maior giro e otimizar a experiência deles",
        risco: "baixo",
        effects: { digital: +3, processos: +3, estoque: +2, clientes: +2, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Catálogo focado nos produtos de maior giro reduz complexidade, melhora a velocidade do site e concentra o estoque no que realmente converte."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R6 · PRESSÃO · O Marketplace Gigante Chega ao Seu Segmento
     Contexto: Mercado Livre lança categoria específica
     para o seu nicho com frete grátis e entrega em 24h.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Marketplace Gigante Chega ao Seu Segmento",
    description: "O Mercado Livre acaba de lançar uma categoria específica para o seu segmento com frete grátis para compras acima de R$ 80 e entrega em 24h via Mercado Envios. Em duas semanas, três dos seus maiores fornecedores já estão vendendo diretamente na plataforma — com preços 12% menores que os seus.",
    tags: ["varejo"],
    fase: "pressao",
    choices: [
      {
        text: "Entrar no Mercado Livre como vendedor e usar o marketplace para escoar estoque parado",
        risco: "medio",
        effects: { financeiro: +3, digital: +4, estoque: +3, margem: -2 },
        avaliacao: "boa",
        ensinamento: "Usar o marketplace do concorrente para escoar estoque e ganhar escala digital é uma tática válida enquanto se constrói o canal próprio. A comissão dói, mas o giro compensa."
      },
      {
        text: "Negociar exclusividade de produtos com fornecedores-chave para proteger o diferencial",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +1 },
        effects: { financeiro: -3, estoque: +3, marca: +3, margem: +2 },
        avaliacao: "boa",
        ensinamento: "Exclusividade de produto cria barreira competitiva que marketplace não consegue replicar. Exige relacionamento forte com fornecedores e disposição para pagar prêmio."
      },
      {
        text: "Baixar os preços para igualar o marketplace e defender a participação de mercado",
        risco: "alto",
        effects: { clientes: +2, financeiro: -4, margem: -5, marca: -1 },
        avaliacao: "ruim",
        ensinamento: "Guerra de preço com marketplace que tem escala nacional é batalha perdida. A destruição de margem que isso causa é irreversível no curto prazo."
      },
      {
        text: "Acelerar o programa de fidelidade com benefícios que marketplace não oferece — consultoria de produto, entrega agendada",
        risco: "baixo",
        effects: { clientes: +5, marca: +4, financeiro: -2, digital: +2 },
        avaliacao: "boa",
        ensinamento: "Serviço personalizado e relacionamento de longo prazo são os diferenciais do varejo regional que nenhum marketplace consegue replicar com escala."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R7 · PRESSÃO · O Fornecedor Estratégico Aumenta 22%
     Contexto: principal fornecedor reajusta preço em 22%
     por pressão cambial, representa 31% do mix.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Fornecedor Estratégico Aumenta 22%",
    description: "Seu principal fornecedor — responsável por 31% do seu mix de produtos — comunica reajuste de 22% por pressão cambial e aumento de custos de matéria-prima. Você tem 30 dias para responder. Repassar integralmente para o consumidor em um momento de concorrência acirrada é arriscado. Absorver significa destruir margem.",
    tags: ["varejo"],
    fase: "pressao",
    choices: [
      {
        text: "Negociar redução para 12% de reajuste com pagamento antecipado de 90 dias de estoque",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: -3, estoque: -2, margem: +3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Antecipar pagamento em troca de menor reajuste é uma negociação clássica em varejo. Usa o poder de compra para reduzir o impacto na margem."
      },
      {
        text: "Buscar fornecedores alternativos e reduzir a dependência do fornecedor principal para 15% do mix",
        risco: "alto",
        effects: { processos: -3, financeiro: -2, estoque: -1, margem: +2, marca: -1 },
        avaliacao: "media",
        ensinamento: "Diversificar fornecedores é estratégico no longo prazo, mas a transição tem custo de qualidade e logística que pode ser maior que o reajuste no curto prazo."
      },
      {
        text: "Repassar o reajuste integralmente ao consumidor com comunicação transparente sobre a causa",
        risco: "medio",
        effects: { margem: +4, clientes: -4, financeiro: +2, marca: -2 },
        avaliacao: "media",
        ensinamento: "Transparência sobre reajuste pode funcionar em marcas com forte fidelização, mas em varejo de alta concorrência, o cliente migra para quem não repassou."
      },
      {
        text: "Absorver o reajuste integralmente para não perder participação de mercado",
        risco: "alto",
        effects: { clientes: +3, margem: -6, financeiro: -4 },
        avaliacao: "ruim",
        ensinamento: "Absorver 22% de reajuste sem nenhuma compensação é insustentável. Em varejo de margens apertadas, isso pode levar uma loja saudável ao prejuízo em dois trimestres."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R8 · PRESSÃO · Crise de Imagem: Reclamação Viral
     Contexto: vídeo de cliente com produto com defeito
     viraliza com 800k visualizações em 48 horas.
  ═══════════════════════════════════════════════════════ */
  {
    title: "Crise de Imagem: Reclamação Viral",
    description: "Um cliente filmou uma reclamação sobre produto com defeito que viraliza com 800 mil visualizações em 48 horas. A mídia local cobre o caso. Sua nota de avaliação no Google caiu de 4,3 para 3,8 em dois dias. O produto em questão é de um fornecedor parceiro há 8 anos.",
    tags: ["varejo"],
    fase: "pressao",
    choices: [
      {
        text: "Responder publicamente em 2 horas assumindo responsabilidade, trocar o produto e anunciar auditoria do fornecedor",
        risco: "baixo",
        gestorEffects: { reputacaoInterna: +2 },
        effects: { marca: +5, clientes: +4, financeiro: -2, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Resposta rápida, transparente e com ação concreta transforma crises em prova de maturidade. Marcas que assumem erros rapidamente saem mais fortes do que antes da crise."
      },
      {
        text: "Entrar em contato privado com o cliente para resolver e pedir que retire o vídeo",
        risco: "alto",
        effects: { marca: -4, clientes: -2, financeiro: -1 },
        avaliacao: "ruim",
        ensinamento: "Tentar suprimir conteúdo viral é contraproducente e frequentemente piora a crise. O público interpreta como má-fé e o caso ganha mais visibilidade."
      },
      {
        text: "Suspender vendas do produto e fazer recall preventivo de todos os itens do mesmo lote",
        risco: "medio",
        effects: { marca: +3, clientes: +3, financeiro: -4, estoque: -3, processos: +3 },
        avaliacao: "boa",
        ensinamento: "Recall preventivo demonstra responsabilidade e prioriza o consumidor sobre o lucro imediato. O custo financeiro é real mas o dano evitado de uma segunda crise é maior."
      },
      {
        text: "Aguardar o caso esfriar naturalmente — crises virais têm vida curta nas redes sociais",
        risco: "alto",
        effects: { marca: -6, clientes: -5, financeiro: -2 },
        avaliacao: "ruim",
        ensinamento: "Silêncio em crises virais é interpretado como descaso. O caso não esfria — ele é alimentado pela ausência de resposta e pode virar notícia por mais tempo."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R9 · PRESSÃO · Black Friday: O Maior Risco do Ano
     Contexto: Black Friday em 3 semanas, sistema de pagamento
     instável, estoque insuficiente nos produtos âncora.
  ═══════════════════════════════════════════════════════ */
  {
    title: "Black Friday: O Maior Risco do Ano",
    description: "A Black Friday é daqui a 3 semanas — representa 18% do faturamento anual. O time de TI alerta: o sistema de pagamento online teve 3 instabilidades no último mês. O estoque dos produtos âncora — os que puxam o tráfego — está em apenas 60% do necessário. Qualquer falha pode destruir um ano de construção de imagem digital.",
    tags: ["varejo"],
    fase: "pressao",
    choices: [
      {
        text: "Contratar servidor de contingência, fazer testes de carga e garantir estoque mínimo dos top 10 produtos",
        risco: "baixo",
        effects: { financeiro: -4, digital: +5, clientes: +4, processos: +3 },
        avaliacao: "boa",
        ensinamento: "Investir em resiliência técnica antes de um evento de pico é custo de operação, não desperdício. Uma Black Friday sem falhas vale muito mais do que a economia em infraestrutura."
      },
      {
        text: "Fazer uma Black Friday limitada — apenas lojas físicas, sem ofensiva digital este ano",
        risco: "medio",
        effects: { financeiro: +1, digital: -3, clientes: -2, marca: -1 },
        avaliacao: "media",
        ensinamento: "Recuar do digital em um evento-chave é uma perda de posicionamento difícil de recuperar. O consumidor que migra para o concorrente na Black Friday pode não voltar."
      },
      {
        text: "Rodar a Black Friday normalmente e lidar com problemas conforme surgirem",
        risco: "alto",
        effects: { financeiro: +3, digital: -5, clientes: -6, marca: -4 },
        avaliacao: "ruim",
        ensinamento: "Improvisar em um evento de pico com sistema instável e estoque insuficiente é receita para crise. O cliente que encontra falha em Black Friday não esquece — e fala nas redes."
      },
      {
        text: "Antecipar o evento para 2 semanas antes com menor escala mas infraestrutura garantida",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +2, digital: +3, clientes: +2, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Antecipar o evento com menor escala é uma tática inteligente: captura demanda antecipada, testa a infraestrutura em escala menor e evita o pico de risco."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R10 · PRESSÃO · O Gerente Regional Pede Demissão
     Contexto: seu melhor gerente regional — responsável por
     12 lojas e 45% da receita — recebe proposta da concorrência.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Gerente Regional Pede Demissão",
    description: "Roberto, seu melhor gerente regional — responsável por 12 lojas e 45% da receita — chega com uma proposta da concorrência: aumento de 40% e um pacote de bônus por resultado. Ele construiu as relações com os melhores fornecedores locais e lidera um time de 180 pessoas. Perdê-lo agora, no meio da reestruturação, pode ser catastrófico.",
    tags: ["varejo"],
    fase: "pressao",
    choices: [
      {
        text: "Fazer contraproposta com aumento de 25% e participação nos resultados da rede",
        risco: "medio",
        gestorEffects: { capitalPolitico: -1 },
        effects: { financeiro: -3, rh: +5, processos: +3, margem: -1 },
        avaliacao: "boa",
        ensinamento: "Reter um gestor-chave no meio de uma reestruturação vale o custo. Participação nos resultados alinha os interesses e cria incentivo de longo prazo — mais poderoso que salário fixo."
      },
      {
        text: "Deixá-lo ir e usar a oportunidade para reestruturar a gestão regional com dois gerentes menores",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2 },
        effects: { rh: -4, processos: -4, financeiro: -2, clientes: -2 },
        avaliacao: "ruim",
        ensinamento: "Substituir um gestor experiente por dois inexperientes em plena reestruturação é dobrar o risco. O conhecimento tácito e as relações que ele carrega não se transferem em 30 dias."
      },
      {
        text: "Igualar a proposta integralmente — o que for necessário para mantê-lo",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: -5, rh: +4, margem: -2 },
        avaliacao: "media",
        ensinamento: "Igualar proposta sem contrapartida pode funcionar no curto prazo mas cria precedente. Se ele sabe que ameaçar de saída funciona, outros podem usar a mesma tática."
      },
      {
        text: "Iniciar imediatamente um plano de sucessão — documentar processos e identificar substituto interno",
        risco: "baixo",
        gestorEffects: { reputacaoInterna: +1 },
        effects: { processos: +4, rh: +2, financeiro: -1, clientes: -1 },
        avaliacao: "media",
        ensinamento: "Dependência extrema de uma pessoa é risco estrutural. Mesmo que ele fique, o plano de sucessão é necessário. Mas fazê-lo com pressa e sem ele colaborando tem custo de qualidade."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R11 · DECISÃO CRÍTICA · Fechar ou Transformar as Lojas Deficitárias
     Contexto: após 6 meses de reestruturação, 4 lojas ainda
     no vermelho. Decisão definitiva não pode mais ser adiada.
  ═══════════════════════════════════════════════════════ */
  {
    title: "Fechar ou Transformar: A Decisão Definitiva",
    description: "Após 6 meses de intervenção, 4 lojas ainda operam no vermelho. O conselho quer uma decisão definitiva: fechar tudo que não vira em 90 dias ou converter em outro formato. A comunidade local de uma das cidades já iniciou uma campanha nas redes contra o possível fechamento — a loja está lá há 18 anos.",
    tags: ["varejo"],
    fase: "decisao",
    choices: [
      {
        text: "Fechar as 4 lojas, pagar rescisões corretamente e usar o caixa para fortalecer as 8 lojas mais rentáveis",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2, capitalPolitico: +2 },
        effects: { financeiro: +6, rh: -5, clientes: -3, margem: +5, marca: -2 },
        avaliacao: "boa",
        ensinamento: "Decisões dolorosas tomadas com clareza e responsabilidade social são melhores que prolongar o sofrimento. O caixa liberado pode transformar as lojas rentáveis em referências regionais."
      },
      {
        text: "Converter as 4 lojas em hubs de distribuição do e-commerce — transformando custo em ativo logístico",
        risco: "medio",
        effects: { digital: +5, processos: +4, financeiro: -3, rh: -1, estoque: +3 },
        avaliacao: "boa",
        ensinamento: "Reposicionar lojas físicas como centros de fulfillment local é uma das estratégias mais inteligentes do omnichannel. Transforma passivo em vantagem competitiva real frente ao e-commerce puro."
      },
      {
        text: "Fazer parceria com marcas complementares para dividir o espaço e os custos das lojas deficitárias",
        risco: "medio",
        effects: { financeiro: +2, processos: -2, marca: +1, clientes: +2 },
        avaliacao: "media",
        ensinamento: "Modelo de loja compartilhada reduz custo fixo e traz tráfego complementar. O risco é a gestão da experiência do cliente quando duas marcas dividem o mesmo espaço."
      },
      {
        text: "Dar mais 6 meses para as lojas deficitárias com metas agressivas e gestores diferentes",
        risco: "alto",
        effects: { financeiro: -4, rh: -2, processos: -1, margem: -3 },
        avaliacao: "ruim",
        ensinamento: "Adiar uma decisão estrutural por mais 6 meses queima caixa sem perspectiva diferente. Se 6 meses de intervenção não resolveram, o problema não é de gestão — é de localização ou formato."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R12 · DECISÃO CRÍTICA · A Proposta de Fusão
     Contexto: rede concorrente regional propõe fusão que
     dobraria a escala mas exigiria ceder controle operacional.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Proposta de Fusão",
    description: "Uma rede concorrente regional — 22 lojas, mesma geografia, segmento complementar — propõe fusão. A operação combinada teria escala para negociar melhores condições com fornecedores e dividir custos de TI. A contrapartida: você teria 51% mas o CEO da outra rede assumiria a diretoria de operações.",
    tags: ["varejo"],
    fase: "decisao",
    choices: [
      {
        text: "Aceitar a fusão com cláusula de revisão dos papéis executivos em 18 meses baseada em resultados",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +1 },
        effects: { financeiro: +4, processos: -3, rh: -2, marca: +3, margem: +3 },
        avaliacao: "boa",
        ensinamento: "Fusão bem estruturada com cláusulas de revisão protege os interesses sem travar o negócio. A escala resultante pode ser a diferença entre sobreviver e liderar o mercado regional."
      },
      {
        text: "Recusar a fusão e propor aliança estratégica para compras e TI sem integração operacional",
        risco: "medio",
        effects: { processos: +3, margem: +2, financeiro: +1, marca: +1 },
        avaliacao: "media",
        ensinamento: "Aliança preserva autonomia mas captura menos valor que a fusão. É uma opção válida se a cultura das empresas for muito diferente ou se o relacionamento entre os sócios não for de confiança."
      },
      {
        text: "Contrapropor a aquisição completa da concorrente — comprar 100% em vez de fundir",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +2 },
        effects: { financeiro: -6, processos: -4, rh: -2, margem: +4 },
        avaliacao: "media",
        ensinamento: "Aquisição total dá controle mas exige capital e capacidade de integração. Em um momento de reestruturação interna, absorver outra empresa pode sobrecarregar o time de gestão."
      },
      {
        text: "Recusar completamente e usar a proposta como leverage para renegociar com fornecedores",
        risco: "medio",
        effects: { margem: +2, processos: +1, marca: -1 },
        avaliacao: "ruim",
        ensinamento: "Usar uma proposta de fusão como blefe na negociação com fornecedores é uma tática de curto prazo que pode queimar um relacionamento estratégico sem trazer o benefício real da fusão."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R13 · DECISÃO CRÍTICA · Marca Própria ou Curadoria Premium
     Contexto: empresa de consultoria apresenta dois caminhos
     opostos para diferenciação frente aos marketplaces.
  ═══════════════════════════════════════════════════════ */
  {
    title: "Marca Própria ou Curadoria Premium",
    description: "A consultoria apresenta dois caminhos opostos: lançar uma linha de marca própria em 3 categorias estratégicas — margem 8pp maior, mas risco de aceitação e custo de desenvolvimento — ou se reposicionar como varejo de curadoria premium, reduzindo o mix para 20% dos SKUs atuais e focando em produtos com alto valor percebido.",
    tags: ["varejo"],
    fase: "decisao",
    choices: [
      {
        text: "Lançar marca própria nas 3 categorias de maior giro — piloto em 6 meses antes de escalar",
        risco: "medio",
        effects: { margem: +5, financeiro: -4, marca: +3, clientes: +2, estoque: -2 },
        avaliacao: "boa",
        ensinamento: "Marca própria é a maior alavanca de margem no varejo. O piloto controlado reduz o risco de aceitação e permite aprender antes de comprometer capital em escala."
      },
      {
        text: "Apostar na curadoria premium — menos produtos, mais história, atendimento especializado",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1 },
        effects: { margem: +4, clientes: +3, marca: +5, financeiro: -3, estoque: +4, digital: +2 },
        avaliacao: "boa",
        ensinamento: "Varejo de curadoria é o oposto do marketplace: você compete em seleção e conhecimento, não em preço. É uma aposta de posicionamento que exige consistência e tempo para construir."
      },
      {
        text: "Fazer os dois simultaneamente para não perder nenhuma oportunidade",
        risco: "alto",
        gestorEffects: { esgotamento: +2 },
        effects: { financeiro: -6, processos: -4, rh: -3, margem: +1 },
        avaliacao: "ruim",
        ensinamento: "Executar duas transformações estratégicas simultâneas com recursos limitados é diluir esforço sem executar nenhuma bem. Foco é a vantagem competitiva do varejo regional frente aos grandes."
      },
      {
        text: "Manter o mix atual e investir em tecnologia de personalização para aumentar o ticket médio",
        risco: "baixo",
        effects: { financeiro: -3, digital: +4, clientes: +3, processos: +2 },
        avaliacao: "media",
        ensinamento: "Personalização via dados é uma terceira via válida, mas exige maturidade analítica. Sem diferenciar o mix ou a marca, a guerra de preço com o marketplace continua."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R14 · DECISÃO CRÍTICA · O Investidor Quer Abrir o Capital
     Contexto: fundo de private equity propõe aportar R$30M
     em troca de 35% e um roadmap de IPO em 4 anos.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Investidor Quer Abrir o Capital",
    description: "Um fundo de private equity propõe aportar R$ 30 milhões em troca de 35% da empresa e um roadmap de IPO em 4 anos. O dinheiro resolveria a questão de capital de giro e financiaria a expansão digital. A contrapartida: governança formal, metas trimestrais rígidas e um CFO indicado pelo fundo.",
    tags: ["varejo"],
    fase: "decisao",
    choices: [
      {
        text: "Aceitar o aporte com cláusula de veto do fundador nas decisões estratégicas de produto e marca",
        risco: "medio",
        gestorEffects: { capitalPolitico: +2 },
        effects: { financeiro: +7, digital: +4, processos: +3, rh: +2, margem: +2 },
        avaliacao: "boa",
        ensinamento: "Capital de private equity bem estruturado acelera o crescimento que a operação saudável não consegue financiar sozinha. A cláusula de veto estratégico protege o DNA da empresa enquanto o fundo acelera a profissionalização."
      },
      {
        text: "Negociar um aporte menor — R$15M por 20% — para manter mais controle e testar a relação",
        risco: "baixo",
        effects: { financeiro: +3, digital: +2, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Entrada menor de capital reduz a diluição e permite testar o relacionamento antes de comprometer com o IPO. É uma postura cautelosa válida para fundadores que nunca trabalharam com PE."
      },
      {
        text: "Recusar e buscar financiamento bancário para manter 100% do controle",
        risco: "alto",
        effects: { financeiro: +2, processos: -1, margem: -2 },
        avaliacao: "media",
        ensinamento: "Financiamento bancário preserva controle mas tem custo de capital mais alto e sem o valor agregado da rede de relacionamentos e governança que o PE traz."
      },
      {
        text: "Aceitar todas as condições — o capital e a disciplina de governança são o que a empresa precisa",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1, esgotamento: +2 },
        effects: { financeiro: +8, digital: +5, processos: +5, rh: -2, marca: -1 },
        avaliacao: "media",
        ensinamento: "Aceitar todas as condições sem negociar sinaliza fraqueza e pode resultar em perda de controle cultural antes do previsto. O CFO indicado pelo fundo terá poder real sobre decisões do dia a dia."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R15 · DECISÃO CRÍTICA · O Futuro da Rede
     Contexto: rodada final — qual varejo você quer ser
     nos próximos 5 anos?
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Futuro da Rede: Qual Varejo Você Quer Ser?",
    description: "Após um ano de decisões difíceis, a rede está em melhor forma — mas o mercado segue se transformando. O conselho pede um plano estratégico para os próximos 5 anos. Três caminhos claros estão na mesa. Cada um exige um perfil de empresa diferente — e nem todos são compatíveis com o que você construiu até aqui.",
    tags: ["varejo"],
    fase: "decisao",
    choices: [
      {
        text: "Varejo de proximidade especializado — menos lojas, mais profundas, atendimento consultivo como diferencial permanente",
        risco: "baixo",
        gestorEffects: { capitalPolitico: +2 },
        effects: { marca: +6, clientes: +5, margem: +4, financeiro: +2, digital: +2, rh: +3 },
        avaliacao: "boa",
        ensinamento: "Especialização profunda em varejo de proximidade é a resposta mais sustentável para o varejo regional diante dos marketplaces. Você vence onde eles não conseguem chegar: o relacionamento humano e o conhecimento local."
      },
      {
        text: "Plataforma omnichannel regional — integração total físico-digital, dark stores e entrega em 2 horas",
        risco: "medio",
        effects: { digital: +6, processos: +4, financeiro: -3, clientes: +4, marca: +3 },
        avaliacao: "boa",
        ensinamento: "O omnichannel integrado é o modelo que combina a conveniência do digital com a confiança do físico. Exige investimento contínuo em tecnologia mas cria uma barreira competitiva real."
      },
      {
        text: "Atacado para pequenos varejistas — usar a estrutura logística para virar distribuidor regional",
        risco: "alto",
        gestorEffects: { esgotamento: +2 },
        effects: { financeiro: +3, processos: -3, rh: -2, clientes: -3, marca: -2 },
        avaliacao: "ruim",
        ensinamento: "Pivotar para atacado quando a empresa foi construída em varejo ao consumidor é uma mudança de DNA completa. A competência essencial que você desenvolveu — relacionamento com o cliente final — perde valor nesse modelo."
      },
      {
        text: "Vender a operação para um grupo nacional e sair pelo melhor preço enquanto a empresa ainda tem valor",
        risco: "medio",
        gestorEffects: { capitalPolitico: +3, esgotamento: -2 },
        effects: { financeiro: +8, marca: -3, rh: -4, clientes: -2 },
        avaliacao: "media",
        ensinamento: "Vender no momento de melhora é uma saída válida e muitas vezes inteligente. O risco é subestimar o valor do que foi construído e vender por menos do que vale — especialmente se o turnaround ainda não se refletiu completamente no valuation."
      }
    ]
  }

],

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [1] · Rede de Farmácias — Concorrência Nacional
   Contexto: 24 lojas em Fortaleza, R$110M receita, 27 anos,
   duas redes nacionais abriram 31 lojas na região em 18 meses,
   preços 15% menores, receita caiu 11%, 4 lojas no vermelho.
══════════════════════════════════════════════════════════════════ */
[

  /* ═══════════════════════════════════════════════════════
     R1 · DIAGNÓSTICO · As Redes Nacionais Chegaram
  ═══════════════════════════════════════════════════════ */
  {
    title: "As Redes Nacionais Chegaram",
    description: "Duas grandes redes nacionais abriram 31 lojas na sua região em 18 meses, com preços até 15% abaixo dos seus. A receita caiu 11% no semestre. Seu time de farmacêuticos — principal diferencial — recebe ofertas 20% acima do seu salário atual. Por onde você começa o contra-ataque?",
    tags: ["varejo"],
    fase: "diagnostico",
    choices: [
      {
        text: "Mapear quais lojas perderam mais clientes e identificar o perfil dos que ficaram — para entender o que ainda defende",
        risco: "baixo",
        effects: { processos: +4, clientes: +2, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "O cliente que permaneceu depois da entrada do concorrente nacional revela seu diferencial real. Entender esse perfil é mais valioso do que qualquer pesquisa de mercado."
      },
      {
        text: "Baixar os preços nos 50 produtos de maior comparação para igualar os concorrentes nacionais",
        risco: "alto",
        effects: { clientes: +2, margem: -5, financeiro: -4 },
        avaliacao: "ruim",
        ensinamento: "Guerra de preço com quem tem escala nacional é batalha perdida. Cada real de desconto destrói margem que você não tem como recuperar sem o mesmo poder de compra."
      },
      {
        text: "Reforçar o programa de fidelidade com benefícios exclusivos de saúde — teleconsulta, aferição gratuita, serviços de farmacêutico",
        risco: "baixo",
        effects: { clientes: +5, marca: +4, financeiro: -2, rh: +2 },
        avaliacao: "boa",
        ensinamento: "Serviços de saúde complementares criam vínculo que a rede nacional não consegue replicar com escala. O farmacêutico que conhece o cliente pelo nome é impossível de commoditizar."
      },
      {
        text: "Fechar imediatamente as 4 lojas no vermelho e concentrar recursos nas 20 mais rentáveis",
        risco: "medio",
        effects: { financeiro: +4, rh: -3, clientes: -2, margem: +3 },
        avaliacao: "media",
        ensinamento: "Fechar lojas deficitárias libera caixa, mas feito sem estratégia pode parecer recuo e acelerar a migração de clientes indecisos para o concorrente nacional."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R2 · DIAGNÓSTICO · O Farmacêutico Quer Sair
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Farmacêutico Que Segura Tudo Quer Sair",
    description: "Dr. Marcos, seu farmacêutico mais experiente — 14 anos na rede, responsável por 3 lojas e pelo programa de acompanhamento de pacientes crônicos com 2.400 clientes cadastrados — recebeu uma proposta 25% maior de uma das redes nacionais. Perdê-lo pode fazer a base de pacientes crônicos migrar junto.",
    tags: ["varejo"],
    fase: "diagnostico",
    choices: [
      {
        text: "Fazer contraproposta com aumento de 20% e torná-lo coordenador do programa de saúde da rede",
        risco: "medio",
        gestorEffects: { capitalPolitico: -1 },
        effects: { financeiro: -3, rh: +5, clientes: +3, marca: +2 },
        avaliacao: "boa",
        ensinamento: "Reter um profissional que carrega relacionamento com pacientes crônicos é estratégico. A promoção cria pertencimento e reconhecimento além do salário."
      },
      {
        text: "Deixá-lo ir e distribuir os pacientes crônicos entre os outros farmacêuticos",
        risco: "alto",
        effects: { rh: -3, clientes: -6, marca: -4, financeiro: -2 },
        avaliacao: "ruim",
        ensinamento: "Pacientes crônicos têm relação de confiança com o farmacêutico, não com a rede. A redistribuição provável é para o concorrente nacional, não para outros farmacêuticos seus."
      },
      {
        text: "Igualar completamente a proposta e criar um plano de retenção para todos os farmacêuticos",
        risco: "medio",
        effects: { financeiro: -5, rh: +6, clientes: +2, marca: +3 },
        avaliacao: "boa",
        ensinamento: "Criar um programa de valorização do farmacêutico como diferencial estratégico — não apenas manter salário — transforma o custo de retenção em vantagem competitiva sustentável."
      },
      {
        text: "Documentar o programa de acompanhamento e treinar substituto antes de negociar",
        risco: "baixo",
        effects: { processos: +3, rh: -2, clientes: -2, financeiro: -1 },
        avaliacao: "media",
        ensinamento: "Documentar processos antes de negociar é prudente, mas se o profissional perceber que você está preparando a saída dele, a negociação perde credibilidade."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R3 · DIAGNÓSTICO · O Sistema de Estoque É do Século Passado
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Sistema de Estoque É do Século Passado",
    description: "O sistema de gestão de estoque foi implementado há 11 anos e gera rupturas frequentes nos produtos de maior giro. O índice de ruptura está em 14% — a rede nacional vizinha entrega qualquer produto em até 2 horas por app. Seu fornecedor de sistema oferece upgrade por R$280 mil. Existe também opção de software SaaS moderno por R$8 mil/mês.",
    tags: ["varejo"],
    fase: "diagnostico",
    choices: [
      {
        text: "Implementar o SaaS moderno — menor custo inicial, atualizações automáticas e integração com app próprio",
        risco: "baixo",
        effects: { processos: +5, financeiro: -2, estoque: +5, digital: +3 },
        avaliacao: "boa",
        ensinamento: "SaaS farmacêutico moderno integra estoque, pedido automático e app de delivery. O custo mensal é previsível e o fornecedor assume a responsabilidade de manter o sistema atualizado."
      },
      {
        text: "Fazer o upgrade do sistema atual — já conhecemos o fornecedor e o time está treinado",
        risco: "medio",
        effects: { processos: +2, financeiro: -5, estoque: +2 },
        avaliacao: "media",
        ensinamento: "Familiar não significa melhor. Upgrade de sistema legado frequentemente reproduz as limitações antigas. O custo único é alto e o resultado pode ser uma versão modernizada do mesmo problema."
      },
      {
        text: "Contratar um gerente de supply chain para resolver o problema manualmente antes de investir em sistema",
        risco: "medio",
        effects: { rh: +1, processos: +1, financeiro: -3, estoque: +1 },
        avaliacao: "ruim",
        ensinamento: "Gestão manual não escala. Um gerente bom pode melhorar processos, mas sem sistema integrado, o índice de ruptura não cai de forma sustentável em uma rede de 24 lojas."
      },
      {
        text: "Priorizar o app de delivery próprio integrado ao estoque atual como primeira etapa",
        risco: "alto",
        effects: { digital: +5, processos: -2, estoque: -1, financeiro: -4, clientes: +3 },
        avaliacao: "media",
        ensinamento: "App de delivery sem estoque confiável gera cancelamentos e frustrações. A experiência do cliente piora se o app mostra disponibilidade e a entrega não chega."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R4 · DIAGNÓSTICO · O Ticket Médio Caiu 17%
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Ticket Médio Caiu 17%",
    description: "O ticket médio por cliente recuou de R$ 98 para R$ 81 no último semestre. A análise mostra duas causas: clientes comprando apenas os itens em promoção e migrando o restante para as redes nacionais; e a queda de medicamentos de referência em favor dos genéricos, que têm margem 40% menor.",
    tags: ["varejo"],
    fase: "diagnostico",
    choices: [
      {
        text: "Criar programa de cesta completa — desconto progressivo para quem compra medicamentos, higiene e beleza juntos",
        risco: "baixo",
        effects: { clientes: +4, financeiro: +2, margem: +3, marca: +1 },
        avaliacao: "boa",
        ensinamento: "Venda casada com incentivo de desconto progressivo aumenta o ticket médio sem guerra de preço. O cliente percebe valor e a rede captura categorias que antes iam para o concorrente."
      },
      {
        text: "Ampliar o mix de produtos de saúde e bem-estar — dermocosméticos, suplementos, produtos de alta margem",
        risco: "medio",
        effects: { margem: +4, clientes: +2, estoque: -2, financeiro: -3, marca: +2 },
        avaliacao: "boa",
        ensinamento: "Dermocosméticos e suplementos têm margem 3x maior que medicamentos genéricos. É onde farmácias regionais competem melhor — com conhecimento e indicação especializada."
      },
      {
        text: "Focar em medicamentos de referência com atendimento especializado para diferenciar da rede nacional",
        risco: "medio",
        effects: { clientes: +2, margem: +3, financeiro: -1, marca: +3 },
        avaliacao: "media",
        ensinamento: "Posicionamento em medicamentos de referência funciona para uma parcela do público, mas a compressão de margem do setor farmacêutico é estrutural e não reversa com posicionamento."
      },
      {
        text: "Lançar promoções agressivas para recuperar o volume perdido e compensar com escala",
        risco: "alto",
        effects: { clientes: +3, margem: -5, financeiro: -3 },
        avaliacao: "ruim",
        ensinamento: "Recuperar ticket médio via promoção é contraditório. Você atrai o cliente de promoção — que compra apenas o item com desconto — e piora ainda mais a média."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R5 · DIAGNÓSTICO · O Programa de Fidelidade Não Fideliza
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Programa de Fidelidade Não Fideliza",
    description: "O programa de fidelidade tem 94 mil clientes cadastrados, mas apenas 31% compraram mais de uma vez no último trimestre. A análise mostra: os pontos vencem em 90 dias, o aplicativo trava com frequência e 67% dos clientes não sabe quantos pontos tem. A rede nacional lançou um programa com cashback imediato e integração com Pix.",
    tags: ["varejo"],
    fase: "diagnostico",
    choices: [
      {
        text: "Reformular o programa com cashback em vez de pontos — crédito imediato na próxima compra",
        risco: "medio",
        effects: { clientes: +6, digital: +3, financeiro: -3, marca: +3 },
        avaliacao: "boa",
        ensinamento: "Cashback imediato é percebido como desconto real, não como promessa futura. A conversão de pontos para comportamento de recompra é muito maior quando o benefício é tangível e imediato."
      },
      {
        text: "Corrigir o app e estender o prazo dos pontos para 12 meses sem mudar o modelo",
        risco: "baixo",
        effects: { digital: +3, clientes: +2, financeiro: -1 },
        avaliacao: "media",
        ensinamento: "Melhorar a experiência técnica é necessário mas insuficiente. O modelo de pontos com prazo longo ainda é mais abstrato do que o cashback imediato que o concorrente oferece."
      },
      {
        text: "Substituir o programa por benefícios de saúde exclusivos — consultas, aferição de pressão, orientação de farmacêutico",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { clientes: +5, marca: +5, financeiro: -2, rh: +2 },
        avaliacao: "boa",
        ensinamento: "Benefícios de saúde criam vínculo emocional que cashback não cria. Uma farmácia que cuida da saúde do cliente — não apenas vende remédio — é impossible de replicar por uma rede nacional."
      },
      {
        text: "Encerrar o programa de fidelidade e usar o orçamento em promoções pontuais de maior visibilidade",
        risco: "alto",
        effects: { financeiro: +1, clientes: -3, marca: -2 },
        avaliacao: "ruim",
        ensinamento: "Encerrar o programa de fidelidade envia o sinal errado para os 29 mil clientes ativos. Promoções pontuais têm menor poder de retenção do que benefícios contínuos."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R6 · PRESSÃO · A Rede Nacional Abre Loja na Porta
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Rede Nacional Abre Loja na Porta da Sua Melhor Unidade",
    description: "A maior rede nacional acaba de inaugurar uma loja de 800m² a 200 metros da sua unidade mais rentável — que responde por 22% de toda a receita da rede. A nova loja tem delivery em 1 hora, estacionamento e uma farmácia de manipulação. Nas primeiras 2 semanas, o movimento da sua loja caiu 18%.",
    tags: ["varejo"],
    fase: "pressao",
    choices: [
      {
        text: "Reformar a loja para melhorar a experiência — consultório de farmacêutico, área de bem-estar, café",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: -5, clientes: +4, marca: +5, rh: +2 },
        avaliacao: "boa",
        ensinamento: "Diferenciar a experiência física quando o concorrente tem vantagem em preço e logística é a resposta correta. O cliente que fica na farmácia regional quer algo que a rede nacional não oferece."
      },
      {
        text: "Iniciar entrega em 2 horas por WhatsApp usando motoboys parceiros",
        risco: "baixo",
        effects: { digital: +4, clientes: +3, financeiro: -2, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Delivery rápido via WhatsApp com o farmacêutico que o cliente conhece é difícil de replicar pela rede nacional. A proximidade e o atendimento personalizado são o diferencial."
      },
      {
        text: "Baixar os preços dos 30 produtos mais comparados para empatar com a rede nacional",
        risco: "alto",
        effects: { clientes: +2, margem: -5, financeiro: -4 },
        avaliacao: "ruim",
        ensinamento: "Empatar em preço com quem tem poder de compra nacional destrói a sua margem sem garantir a retenção do cliente. A rede nacional pode baixar mais quando quiser."
      },
      {
        text: "Ativar os 2.400 pacientes crônicos cadastrados com ligação pessoal do farmacêutico",
        risco: "baixo",
        effects: { clientes: +5, rh: +2, marca: +3, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "O relacionamento pessoal com pacientes crônicos é o ativo mais defensável de uma farmácia regional. Uma ligação do farmacêutico que conhece o histórico do cliente vale mais que qualquer promoção."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R7 · PRESSÃO · Vigilância Sanitária Autua Duas Lojas
  ═══════════════════════════════════════════════════════ */
  {
    title: "Vigilância Sanitária Autua Duas Lojas",
    description: "A Vigilância Sanitária autua duas lojas por armazenamento irregular de medicamentos termolábeis — produtos que precisam de refrigeração. A multa total é R$ 85 mil e uma das lojas pode ter a licença suspensa. A mídia local cobriu o caso. Ao mesmo tempo, a rede nacional usa o episódio em publicidade comparativa.",
    tags: ["varejo"],
    fase: "pressao",
    choices: [
      {
        text: "Assumir publicamente, pagar as multas, substituir os equipamentos e comunicar auditoria em todas as lojas",
        risco: "medio",
        gestorEffects: { reputacaoInterna: +2 },
        effects: { financeiro: -5, marca: +3, clientes: +2, processos: +4 },
        avaliacao: "boa",
        ensinamento: "Transparência radical em crise sanitária de uma farmácia — que vende saúde — é a única resposta que preserva a confiança. Qualquer evasiva aprofunda o dano à reputação."
      },
      {
        text: "Recorrer administrativamente para reduzir a multa e evitar a suspensão da licença",
        risco: "alto",
        effects: { financeiro: +1, marca: -4, clientes: -3, processos: -1 },
        avaliacao: "ruim",
        ensinamento: "Recorrer sem comunicar ações corretivas envia sinal de que a farmácia prioriza evitar punição em vez de corrigir o problema. Em saúde, isso é letal para a confiança do cliente."
      },
      {
        text: "Contratar consultoria de compliance sanitário e implementar auditoria mensal em todas as lojas",
        risco: "baixo",
        effects: { processos: +5, financeiro: -3, marca: +2, clientes: +1 },
        avaliacao: "boa",
        ensinamento: "Compliance sanitário rigoroso transforma uma crise em diferencial. Uma farmácia auditada mensalmente pode usar isso como argumento de confiança contra as redes nacionais."
      },
      {
        text: "Resolver internamente sem comunicar e focar em recuperar as vendas com promoções",
        risco: "alto",
        effects: { financeiro: -2, marca: -5, clientes: -4 },
        avaliacao: "ruim",
        ensinamento: "A mídia já cobriu o caso. Tentar minimizar sem comunicação ativa alimenta a narrativa negativa. Promoções enquanto a crise de reputação está ativa são ignoradas pelo cliente."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R8 · PRESSÃO · O Plano de Saúde Quer Credenciar Só as Nacionais
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Plano de Saúde Quer Credenciar Só as Redes Nacionais",
    description: "O principal plano de saúde da região — com 180 mil beneficiários — anuncia que vai credenciar apenas farmácias com mais de 50 lojas a partir do próximo ano. Isso eliminaria seu credenciamento e 28% da sua receita que vem de reembolsos de plano. O prazo para recurso é de 60 dias.",
    tags: ["varejo"],
    fase: "pressao",
    choices: [
      {
        text: "Articular com outras farmácias regionais para formar consórcio e atender o critério de volume",
        risco: "medio",
        gestorEffects: { capitalPolitico: +2 },
        effects: { processos: -2, financeiro: +2, clientes: +3, marca: +2 },
        avaliacao: "boa",
        ensinamento: "Consórcio de farmácias regionais é uma resposta coletiva que cria poder de negociação sem abrir mão da independência. Exige coordenação, mas é a única forma de competir com redes nacionais nesse critério."
      },
      {
        text: "Negociar diretamente com o plano de saúde apresentando seus dados de adesão e satisfação dos beneficiários",
        risco: "baixo",
        effects: { processos: +2, clientes: +2, financeiro: +1, marca: +2 },
        avaliacao: "boa",
        ensinamento: "Dados de satisfação de beneficiários é o argumento mais forte com planos de saúde. Se seus clientes do plano têm maior adesão ao tratamento, isso tem valor financeiro para o plano — e você pode precificar isso."
      },
      {
        text: "Aceitar a descredenciamento e migrar esses clientes para pagamento direto com desconto",
        risco: "alto",
        effects: { clientes: -5, financeiro: -4, margem: +1 },
        avaliacao: "ruim",
        ensinamento: "Cliente que usa plano de saúde não muda para pagamento direto facilmente — vai para a farmácia credenciada. Aceitar a perda sem lutar é entregar 28% da receita de bandeja."
      },
      {
        text: "Iniciar expansão acelerada para chegar a 50 lojas antes do prazo — mesmo que com endividamento",
        risco: "alto",
        gestorEffects: { esgotamento: +2 },
        effects: { financeiro: -8, processos: -4, rh: -2, clientes: +1 },
        avaliacao: "ruim",
        ensinamento: "Expandir 26 lojas em 60 dias para cumprir um critério burocrático é impossível sem destruir a operação. O endividamento resultante pode ser pior do que perder o credenciamento."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R9 · PRESSÃO · Desabastecimento Nacional de Medicamento Chave
  ═══════════════════════════════════════════════════════ */
  {
    title: "Desabastecimento Nacional de Medicamento Chave",
    description: "Um medicamento para hipertensão — o mais prescrito da sua base de 2.400 pacientes crônicos — entra em desabastecimento nacional por problema na cadeia de produção. Seus pacientes estão ligando desesperados. A rede nacional vizinha conseguiu estoque do importado com preço 180% maior. Você tem contato com um distribuidor paralelo de procedência duvidosa.",
    tags: ["varejo"],
    fase: "pressao",
    choices: [
      {
        text: "Ligar para os 2.400 pacientes, informar a situação e orientar a buscar o médico para substituição terapêutica",
        risco: "baixo",
        gestorEffects: { reputacaoInterna: +2 },
        effects: { clientes: +6, marca: +5, rh: +2, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Cuidar ativamente dos pacientes em uma crise de desabastecimento — mesmo sem a solução imediata — é o que transforma farmácia em parceiro de saúde. Esse nível de cuidado não tem preço e é impossível de replicar."
      },
      {
        text: "Buscar o medicamento importado e oferecer parcelamento para os pacientes que não podem pagar o preço cheio",
        risco: "medio",
        effects: { clientes: +4, financeiro: -3, margem: -2, marca: +3 },
        avaliacao: "boa",
        ensinamento: "Absorver parte do custo do importado para garantir acesso dos pacientes crônicos é um investimento em fidelização de longo prazo. Quem resolve o problema na crise não é esquecido."
      },
      {
        text: "Comprar do distribuidor paralelo para garantir o estoque e vender ao preço de mercado",
        risco: "alto",
        effects: { financeiro: +2, clientes: -2, marca: -6, processos: -3 },
        avaliacao: "ruim",
        ensinamento: "Medicamento de procedência duvidosa coloca em risco a saúde dos pacientes e a licença da farmácia. O ganho financeiro imediato é incompatível com a responsabilidade de uma farmácia."
      },
      {
        text: "Comunicar o desabastecimento nas redes sociais e posicionar a farmácia como transparente e responsável",
        risco: "baixo",
        effects: { marca: +4, clientes: +2, digital: +2 },
        avaliacao: "media",
        ensinamento: "Comunicar abertamente o desabastecimento sem oferecer solução alternativa é incompleto. A comunicação de transparência precisa vir acompanhada de alguma ação concreta de apoio ao paciente."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R10 · PRESSÃO · A Rede Nacional Faz Proposta para Comprar Você
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Rede Nacional Faz Proposta para Comprar Você",
    description: "A maior rede nacional faz uma oferta formal de aquisição: R$ 42 milhões pela operação completa — 3,8x o faturamento anual. A oferta é 30% acima do que qualquer avaliação interna projetou. Mas o comprador deixa claro: os farmacêuticos atuais serão mantidos por 12 meses, após isso a política de RH segue o padrão nacional.",
    tags: ["varejo"],
    fase: "pressao",
    choices: [
      {
        text: "Recusar e usar a oferta como validação do valor construído para buscar investidores regionais",
        risco: "medio",
        gestorEffects: { capitalPolitico: +2 },
        effects: { financeiro: +1, marca: +3, clientes: +2, rh: +2 },
        avaliacao: "boa",
        ensinamento: "Uma oferta de aquisição é o melhor valuation externo que você pode ter. Usar isso para atrair investidores regionais que preservem a cultura é uma alternativa real ao M&A."
      },
      {
        text: "Negociar condições melhores: R$ 52M e garantia de 36 meses para os farmacêuticos atuais",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +3, rh: +2, clientes: +1 },
        avaliacao: "boa",
        ensinamento: "Negociar preço e proteção do time é legítimo quando a saída é uma possibilidade real. Saber o que não é negociável antes de sentar na mesa é o que separa bons de maus desfechos em M&A."
      },
      {
        text: "Aceitar a oferta — 42 milhões é mais do que qualquer cenário orgânico pode gerar em 10 anos",
        risco: "alto",
        gestorEffects: { capitalPolitico: +3, esgotamento: -2 },
        effects: { financeiro: +8, rh: -4, clientes: -2, marca: -3 },
        avaliacao: "media",
        ensinamento: "Vender pelo preço certo no momento certo é uma decisão legítima. O risco é o impacto nos farmacêuticos e pacientes crônicos que vão perder o relacionamento construído ao longo de anos."
      },
      {
        text: "Recusar sem negociar — a farmácia tem um propósito maior do que ser adquirida por quem você combate",
        risco: "baixo",
        effects: { marca: +2, rh: +2, financeiro: -1, clientes: +1 },
        avaliacao: "media",
        ensinamento: "Recusar por princípio sem avaliar os números pode ser integridade ou pode ser ego. O propósito da empresa precisa ser sustentável financeiramente para que possa ser vivido."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R11 · DECISÃO CRÍTICA · Reposicionamento Total ou Defesa Gradual
  ═══════════════════════════════════════════════════════ */
  {
    title: "Reposicionamento Total ou Defesa Gradual",
    description: "Com 18 meses de pressão competitiva, a situação está estabilizada mas não revertida. O conselho apresenta dois caminhos opostos: reposicionar completamente a rede como farmácia de saúde integrada — com consultórios, teleconsulta e serviços pagos — ou executar uma defesa gradual mantendo o modelo atual mas com operação mais enxuta.",
    tags: ["varejo"],
    fase: "decisao",
    choices: [
      {
        text: "Reposicionar como farmácia de saúde integrada — consultório, teleconsulta, nutricionista, espaço de bem-estar",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +1 },
        effects: { marca: +6, clientes: +5, financeiro: -5, rh: +3, processos: -2 },
        avaliacao: "boa",
        ensinamento: "Farmácia de saúde integrada é o modelo que mais cresce no varejo farmacêutico global. Transforma o ponto de venda em destino de saúde — impossível de replicar por uma rede nacional sem custo muito maior."
      },
      {
        text: "Defender gradualmente: enxugar a operação, fechar 4 lojas e fortalecer as 20 mais rentáveis",
        risco: "medio",
        effects: { financeiro: +4, margem: +4, processos: +3, clientes: -1, rh: -3 },
        avaliacao: "boa",
        ensinamento: "Defesa focada em rentabilidade é válida quando o capital para reposicionamento total não existe. Menos lojas, mais saudáveis, podem ser a base para o próximo passo estratégico."
      },
      {
        text: "Criar uma sub-marca de farmácia popular para competir em preço nas regiões mais impactadas",
        risco: "alto",
        effects: { financeiro: -4, marca: -3, clientes: +2, processos: -3 },
        avaliacao: "ruim",
        ensinamento: "Criar uma sub-marca de desconto dilui o posicionamento principal sem garantir competitividade em preço. Você fica no meio-termo — nem premium, nem mais barato — que é o pior lugar para estar."
      },
      {
        text: "Focar exclusivamente no segmento de oncologia e doenças raras — nicho com menor competição e maior margem",
        risco: "medio",
        effects: { margem: +5, clientes: -3, financeiro: -2, rh: +2, marca: +3 },
        avaliacao: "media",
        ensinamento: "Nicho de alta especialização tem margens superiores e menor competição, mas exige investimento em farmacêuticos especializados e pode alienar a base atual de clientes."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R12 · DECISÃO CRÍTICA · O Modelo de Franquia
  ═══════════════════════════════════════════════════════ */
  {
    title: "Transformar em Franquia para Ganhar Escala",
    description: "Uma consultoria especializada em franquias apresenta um modelo: transformar a rede em franquia regional permitiria chegar a 80 lojas em 3 anos sem capital próprio. Os franqueados entram com o investimento, você entra com a marca, o sistema e o know-how. O risco: manter o padrão de atendimento que é o seu diferencial.",
    tags: ["varejo"],
    fase: "decisao",
    choices: [
      {
        text: "Lançar o modelo de franquia com critérios rígidos de seleção de franqueados e padrão de atendimento",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +4, marca: +3, processos: -3, clientes: +2, rh: -1 },
        avaliacao: "boa",
        ensinamento: "Franquia bem estruturada escala a marca sem escalar o capital. O segredo está nos critérios de seleção de franqueados e no sistema de controle de qualidade — especialmente em farmácia, onde o atendimento é o diferencial."
      },
      {
        text: "Testar o modelo com 3 franquias piloto antes de escalar — validar se o padrão se mantém",
        risco: "baixo",
        effects: { processos: +3, financeiro: +1, marca: +2, clientes: +1 },
        avaliacao: "boa",
        ensinamento: "Piloto controlado reduz o risco de diluir a marca antes de provar que o modelo funciona. Três lojas bem selecionadas ensinam mais do que qualquer consultoria sobre o que pode e o que não pode ser franqueado."
      },
      {
        text: "Recusar o modelo de franquia — o atendimento personalizado não é replicável sem controle total",
        risco: "baixo",
        effects: { marca: +2, processos: +1, financeiro: -1 },
        avaliacao: "media",
        ensinamento: "A preocupação com a replicabilidade do atendimento é legítima. Mas recusar crescimento por medo de diluição pode ser a decisão que limita a rede a uma escala inviável frente à concorrência nacional."
      },
      {
        text: "Lançar franquias em outras cidades do Nordeste com expansão acelerada e menor rigor na seleção",
        risco: "alto",
        gestorEffects: { esgotamento: +2 },
        effects: { financeiro: +2, marca: -4, processos: -5, clientes: -2 },
        avaliacao: "ruim",
        ensinamento: "Expansão acelerada com menor rigor em seleção de franqueados é a forma mais rápida de destruir uma marca regional. Um franqueado que não mantém o padrão prejudica todas as unidades."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R13 · DECISÃO CRÍTICA · Farmácia de Manipulação Própria
  ═══════════════════════════════════════════════════════ */
  {
    title: "Abrir Farmácia de Manipulação Própria",
    description: "Seu farmacêutico sênior propõe um projeto: abrir uma farmácia de manipulação própria integrada às lojas. Custo inicial R$ 1,2 milhão, retorno previsto em 30 meses. A margem de manipulados é 3x maior que a de medicamentos industriais e cria um diferencial que as redes nacionais não têm. O risco: regulatório, operacional e de capital.",
    tags: ["varejo"],
    fase: "decisao",
    choices: [
      {
        text: "Abrir a farmácia de manipulação e integrar às 5 lojas de maior faturamento como diferencial",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +1 },
        effects: { margem: +5, financeiro: -5, clientes: +4, marca: +5, rh: +3 },
        avaliacao: "boa",
        ensinamento: "Farmácia de manipulação cria o diferencial mais defensável do varejo farmacêutico. É impossível de replicar pelas redes nacionais sem investimento proporcional e é o serviço mais fidelizador do setor."
      },
      {
        text: "Fazer parceria com uma farmácia de manipulação existente para oferecer o serviço sem o investimento",
        risco: "baixo",
        effects: { margem: +2, clientes: +3, financeiro: -1, marca: +2 },
        avaliacao: "boa",
        ensinamento: "Parceria permite capturar parte do diferencial sem o risco de capital. A desvantagem é a menor margem e a dependência de um parceiro que pode ser adquirido pela concorrência."
      },
      {
        text: "Recusar — o capital e o foco são necessários para fortalecer o core da operação atual",
        risco: "baixo",
        effects: { financeiro: +1, processos: +2 },
        avaliacao: "media",
        ensinamento: "Manter o foco no core em momentos de pressão competitiva é disciplina estratégica. Mas deixar de capturar um diferencial real enquanto o concorrente o faz pode ser um erro de longo prazo."
      },
      {
        text: "Abrir a farmácia de manipulação e escalar para todas as 24 lojas imediatamente",
        risco: "alto",
        gestorEffects: { esgotamento: +3 },
        effects: { financeiro: -8, processos: -5, rh: -2, margem: +2 },
        avaliacao: "ruim",
        ensinamento: "Escalar uma operação nova para todas as 24 lojas sem validar o modelo é um risco desnecessário. O custo regulatório e operacional de 24 laboratórios de manipulação é proibitivo antes de provar a demanda."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R14 · DECISÃO CRÍTICA · Programa de Saúde Preventiva com Planos
  ═══════════════════════════════════════════════════════ */
  {
    title: "Parceria com Operadora para Programa de Saúde Preventiva",
    description: "Uma operadora de plano de saúde regional propõe criar um programa de saúde preventiva usando sua rede de farmácias como ponto de contato: aferição, orientação farmacêutica, alertas de adesão ao tratamento. O pagamento seria por resultado — quanto menor o custo hospitalar dos beneficiários, maior o repasse para a farmácia.",
    tags: ["varejo"],
    fase: "decisao",
    choices: [
      {
        text: "Aceitar a parceria — é a prova de que o modelo de farmácia de saúde integrada é viável",
        risco: "medio",
        gestorEffects: { capitalPolitico: +2 },
        effects: { financeiro: +4, clientes: +5, marca: +6, rh: +3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Parceria com operadora que paga por resultado de saúde é o futuro do varejo farmacêutico. Transforma a farmácia de ponto de compra em parceiro de saúde — com receita recorrente e diferencial impossível de copiar."
      },
      {
        text: "Aceitar com cláusula de exclusividade territorial por 3 anos para proteger o investimento",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +5, clientes: +4, marca: +5, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Exclusividade territorial protege o investimento em treinamento de farmacêuticos e infraestrutura. Se o programa funcionar, você quer ser o único parceiro antes que a rede nacional chegue com escala."
      },
      {
        text: "Recusar — pagamento por resultado é muito incerto para investir em infraestrutura",
        risco: "baixo",
        effects: { financeiro: +1, processos: +1 },
        avaliacao: "ruim",
        ensinamento: "Recusar uma inovação de modelo de negócio por incerteza de resultado pode ser o maior erro estratégico do setor. Quem estruturar primeiro o modelo de farmácia parceira de saúde vai criar uma vantagem difícil de reverter."
      },
      {
        text: "Negociar pagamento fixo além do variável para garantir previsibilidade de receita",
        risco: "baixo",
        effects: { financeiro: +3, clientes: +3, marca: +4, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Combinar componente fixo com variável reduz o risco do modelo novo sem abrir mão do upside. É uma posição de negociação justa que qualquer operadora sensata deve aceitar em um primeiro contrato."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R15 · DECISÃO CRÍTICA · O Legado: Qual Farmácia Você Quer Ser
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Legado: Qual Farmácia Você Quer Ser",
    description: "Dois anos após a chegada das redes nacionais, a situação se estabilizou. O conselho pede a visão de longo prazo: qual é o papel da sua rede nos próximos 10 anos? Você pode manter o modelo atual, se transformar em plataforma de saúde ou se posicionar como a alternativa regional consciente às grandes corporações.",
    tags: ["varejo"],
    fase: "decisao",
    choices: [
      {
        text: "Farmácia de saúde comunitária — integrada com o SUS, postos de saúde e programas municipais",
        risco: "medio",
        gestorEffects: { capitalPolitico: +2 },
        effects: { marca: +6, clientes: +5, rh: +4, financeiro: +2, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Farmácia integrada ao sistema público de saúde cria um papel social impossível de ser preenchido pelas redes nacionais. A comunidade que enxerga a farmácia como parceira de saúde — não apenas loja — não a abandona por preço."
      },
      {
        text: "Plataforma digital de saúde com app próprio, teleatendimento e logística de última milha",
        risco: "alto",
        effects: { digital: +6, financeiro: -4, clientes: +4, marca: +4, processos: -2 },
        avaliacao: "boa",
        ensinamento: "Ser a farmácia digital regional é uma posição defensável. A rede nacional tem escala mas não tem o relacionamento local. Uma plataforma digital com entrega em 1 hora e farmacêutico conhecido pelo nome cria um diferencial real."
      },
      {
        text: "Manter o modelo atual — o que funcionou por 27 anos pode funcionar por mais 27",
        risco: "alto",
        effects: { financeiro: +1, processos: +1, clientes: -2, marca: -1, digital: -2 },
        avaliacao: "ruim",
        ensinamento: "O ambiente competitivo de 10 anos atrás não existe mais. Manter o modelo sem adaptação em um mercado que se transformou é apostar que o mundo vai voltar para você — o que nunca acontece no varejo."
      },
      {
        text: "Ser a farmácia do bem-estar — pilates, nutrição, estética, saúde mental integrados à farmácia",
        risco: "medio",
        effects: { marca: +5, clientes: +4, financeiro: -3, rh: +3, processos: -1 },
        avaliacao: "boa",
        ensinamento: "Bem-estar é o maior mercado de crescimento no varejo de saúde. Integrar pilates, nutricionista e saúde mental à farmácia cria um destino de saúde integral que fideliza por experiência, não por preço."
      }
    ]
  }

],

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [2] · Atacarejo Regional — Expansão Desequilibrada
   Contexto: 7 lojas no interior de MG, R$420M receita, 980 func,
   3 lojas abaixo do break-even, dívida 2,8x EBITDA,
   Atacadão e Assaí expandindo para a região.
══════════════════════════════════════════════════════════════════ */
[

  /* ═══════════════════════════════════════════════════════
     R1 · DIAGNÓSTICO · A Conta da Expansão Chegou
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Conta da Expansão Chegou",
    description: "Em 3 anos você dobrou de 2 para 7 lojas. Agora o banco pede reunião: a dívida está em 2,8x o EBITDA — o limite do covenant é 3x. Se passar disso, o banco pode declarar vencimento antecipado. Três das sete lojas ainda operam abaixo do ponto de equilíbrio. O CFO apresenta três cenários. Qual você escolhe para começar a estabilização?",
    tags: ["varejo"],
    fase: "diagnostico",
    choices: [
      {
        text: "Vender o imóvel da loja principal e fazer lease-back para liberar caixa sem fechar operações",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +6, processos: -1, margem: -1 },
        avaliacao: "boa",
        ensinamento: "Sale-and-lease-back libera capital imobilizado sem interromper operações. É uma das ferramentas mais usadas por redes de varejo para desalavancar sem fechar lojas."
      },
      {
        text: "Renegociar a dívida com o banco pedindo carência de 12 meses e alongamento do prazo",
        risco: "baixo",
        effects: { financeiro: +3, processos: +2, margem: +1 },
        avaliacao: "boa",
        ensinamento: "Renegociação proativa — antes de estourar o covenant — é sempre melhor do que negociar em posição de fraqueza. Bancos preferem renegociar a executar garantias."
      },
      {
        text: "Fechar as 3 lojas deficitárias imediatamente para reduzir a queima de caixa",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2 },
        effects: { financeiro: +4, rh: -5, clientes: -3, margem: +3 },
        avaliacao: "media",
        ensinamento: "Fechar lojas que ainda não atingiram maturidade pode ser prematuro. Algumas lojas novas levam até 24 meses para atingir o break-even — fechar antes desse prazo pode ser desperdiçar o investimento já feito."
      },
      {
        text: "Acelerar as vendas com promoções agressivas para aumentar o faturamento e melhorar o índice de dívida",
        risco: "alto",
        effects: { financeiro: +2, margem: -5, clientes: +2 },
        avaliacao: "ruim",
        ensinamento: "Promoções agressivas para melhorar indicadores financeiros de curto prazo destroem margem permanentemente. O índice de dívida melhora momentaneamente mas a rentabilidade piora estruturalmente."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R2 · DIAGNÓSTICO · A Taxa de Perdas Dobrou
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Taxa de Perdas Dobrou",
    description: "A taxa de perdas — quebra e furto — subiu de 1,4% para 2,9% da receita. Em uma operação de R$ 420 milhões, isso representa R$ 6,3 milhões a mais sendo desperdiçado por ano. O time de segurança está sobrecarregado. Nas três lojas novas, onde os processos ainda não estão consolidados, a taxa chega a 4,1%.",
    tags: ["varejo"],
    fase: "diagnostico",
    choices: [
      {
        text: "Implementar sistema de câmeras com IA para identificação de furtos em tempo real nas lojas novas",
        risco: "medio",
        effects: { financeiro: -3, processos: +5, margem: +4, estoque: +3 },
        avaliacao: "boa",
        ensinamento: "Tecnologia de prevenção de perdas tem ROI claro em varejo de grande escala. R$3M de investimento contra R$6M de perda anual se paga em menos de um exercício."
      },
      {
        text: "Contratar 30 seguranças adicionais para cobrir as lojas novas com maior índice de perda",
        risco: "medio",
        effects: { financeiro: -3, rh: +2, processos: +2, margem: +2 },
        avaliacao: "media",
        ensinamento: "Segurança humana reduz perdas mas tem custo fixo permanente. Em grandes áreas de venda como atacarejo, a cobertura humana tem limitações que tecnologia resolve de forma mais escalável."
      },
      {
        text: "Implementar processos rígidos de inventário diário e responsabilizar os gerentes das lojas novas",
        risco: "baixo",
        effects: { processos: +4, rh: -1, margem: +2, estoque: +2 },
        avaliacao: "boa",
        ensinamento: "Inventário rigoroso com responsabilidade clara do gerente é a base de qualquer programa de prevenção de perdas. Sem medir, não dá para controlar."
      },
      {
        text: "Aceitar a taxa de perda como custo da expansão e focar em aumentar as vendas para compensar",
        risco: "alto",
        effects: { processos: -3, margem: -3, financeiro: -2 },
        avaliacao: "ruim",
        ensinamento: "Normalizar 2,9% de perda em varejo é normalizar a destruição de margem. Atacarejo opera com margens de 3-5% — perder quase 3% do faturamento em quebra e furto pode eliminar o lucro inteiro."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R3 · DIAGNÓSTICO · O Time de Gestão Está No Limite
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Time de Gestão Está No Limite",
    description: "A pesquisa de clima revela: 78% dos gerentes de loja dizem ter 'processos insuficientes' para tomar decisões. O time que gerenciava 2 lojas agora opera 7 sem estrutura adicional. Dois gerentes regionais pediram demissão no último trimestre. O diretor de operações trabalha 14 horas por dia e está no limite do esgotamento.",
    tags: ["varejo"],
    fase: "diagnostico",
    choices: [
      {
        text: "Contratar um COO experiente em expansão de varejo para profissionalizar a gestão operacional",
        risco: "medio",
        effects: { financeiro: -4, processos: +6, rh: +4, margem: +2 },
        avaliacao: "boa",
        ensinamento: "Um COO que já escalou redes de varejo traz os processos, o sistema e a equipe que a empresa ainda não construiu. É o investimento mais impactante que uma empresa em expansão acelerada pode fazer."
      },
      {
        text: "Criar um programa de formação interna de gerentes — promover os melhores operadores de loja",
        risco: "baixo",
        effects: { rh: +4, processos: +3, financeiro: -2, margem: +1 },
        avaliacao: "boa",
        ensinamento: "Promover gerentes internos preserva a cultura e cria comprometimento. O risco é o tempo — formar um gerente regional leva de 6 a 12 meses, que podem ser críticos na situação atual."
      },
      {
        text: "Centralizar todas as decisões operacionais na direção até a situação estabilizar",
        risco: "alto",
        gestorEffects: { esgotamento: +3 },
        effects: { processos: -3, rh: -3, financeiro: -1 },
        avaliacao: "ruim",
        ensinamento: "Centralizar decisões quando o time de direção já está esgotado é adicionar gasolina no fogo. A qualidade das decisões vai cair e os gerentes de loja vão perder a capacidade de resolver problemas locais."
      },
      {
        text: "Implementar um sistema de gestão integrado — ERP com dashboards em tempo real para cada loja",
        risco: "medio",
        effects: { processos: +5, financeiro: -3, rh: +2, estoque: +3 },
        avaliacao: "boa",
        ensinamento: "ERP integrado em uma rede de 7 lojas devolve autonomia com informação. O gerente que vê seus números em tempo real toma decisões melhores sem precisar escalar para a diretoria."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R4 · DIAGNÓSTICO · Mix de Produto Errado nas Lojas Novas
  ═══════════════════════════════════════════════════════ */
  {
    title: "Mix de Produto Errado nas Lojas Novas",
    description: "A análise das 3 lojas deficitárias revela o problema central: o mix de produtos foi copiado das 2 lojas originais — que atendem uma região com perfil de renda e hábito de compra diferente. Nas cidades novas, 40% dos SKUs têm giro abaixo do mínimo rentável. Mas os pedidos de compra são centralizados e o fornecedor exige pedido mínimo alto.",
    tags: ["varejo"],
    fase: "diagnostico",
    choices: [
      {
        text: "Criar um comitê local de mix — gerente da loja + comprador da central decidem o portfólio por região",
        risco: "baixo",
        effects: { processos: +4, estoque: +4, clientes: +3, margem: +2, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Mix regionalizado é a vantagem do atacarejo local frente ao nacional. Quem conhece o consumidor local escolhe os produtos certos — não quem está 500km de distância no centro de compras."
      },
      {
        text: "Liquidar os 40% de SKUs de baixo giro com promoção agressiva e redefinir o portfólio",
        risco: "medio",
        effects: { estoque: +5, financeiro: +2, margem: -2, clientes: +1 },
        avaliacao: "boa",
        ensinamento: "Liquidar estoque de baixo giro é necessário mas deve ser feito com estratégia. O markup negativo da liquidação é menor do que o custo de manter capital imobilizado em produto que não gira."
      },
      {
        text: "Manter o mix centralizado para garantir o poder de compra consolidado com os fornecedores",
        risco: "alto",
        effects: { processos: +1, estoque: -3, clientes: -2, margem: -2 },
        avaliacao: "ruim",
        ensinamento: "Poder de compra centralizado é uma vantagem real, mas sem flexibilidade de mix por região, você perde o cliente local para o concorrente que entende o que ele quer comprar."
      },
      {
        text: "Negociar com os fornecedores pedido mínimo menor em troca de mais lojas abertas ao portfólio deles",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { processos: +3, estoque: +2, financeiro: +1, margem: +2 },
        avaliacao: "boa",
        ensinamento: "Usar a perspectiva de crescimento como leverage na negociação de pedido mínimo é uma tática legítima. O fornecedor que acredita na expansão aceita flexibilizar para entrar nas lojas novas."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R5 · DIAGNÓSTICO · O Pequeno Comerciante Está Sumindo
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Pequeno Comerciante Está Sumindo",
    description: "O atacarejo sempre atendeu dois públicos: consumidor final e pequenos comerciantes, que representavam 38% do faturamento. Nos últimos 6 meses, a participação do comerciante caiu para 24%. A análise revela: as plataformas de atacado digital — iFood Shop, Jüssi, CashMe — entregam na porta do comerciante com preço competitivo.",
    tags: ["varejo"],
    fase: "diagnostico",
    choices: [
      {
        text: "Criar serviço de entrega para pequenos comerciantes da região — mínimo R$500 com entrega no dia seguinte",
        risco: "medio",
        effects: { clientes: +5, financeiro: -3, processos: -2, digital: +3, margem: +1 },
        avaliacao: "boa",
        ensinamento: "Entrega para o pequeno comerciante é o que os atacados digitais oferecem. O diferencial do regional é o preço mais competitivo e o relacionamento — uma ligação para o gerente de conta resolve o que o app não resolve."
      },
      {
        text: "Criar um app próprio de pedidos para comerciantes com histórico de compra e recomendação de mix",
        risco: "alto",
        gestorEffects: { esgotamento: +1 },
        effects: { digital: +5, financeiro: -5, processos: -3, clientes: +3 },
        avaliacao: "media",
        ensinamento: "App próprio para B2B é estratégico mas caro e lento para desenvolver. O risco é gastar 12 meses e R$3M para construir o que o iFood Shop já tem pronto — e perder mais clientes no processo."
      },
      {
        text: "Criar gerentes de conta dedicados para os 50 maiores comerciantes com visita mensal",
        risco: "baixo",
        effects: { clientes: +4, rh: +2, financeiro: -2, processos: +2, margem: +2 },
        avaliacao: "boa",
        ensinamento: "Gerente de conta para B2B de alto volume é o modelo mais eficiente de retenção. O comerciante que tem um contato direto no atacado prefere a segurança do relacionamento ao app que pode falhar na entrega."
      },
      {
        text: "Aceitar a migração dos comerciantes e focar exclusivamente no consumidor final",
        risco: "alto",
        effects: { processos: +1, clientes: -3, financeiro: -3, margem: -2 },
        avaliacao: "ruim",
        ensinamento: "Perder 38% do faturamento que vem de B2B sem um plano de substituição é aceitar uma queda estrutural de receita. O consumidor final tem ticket médio 5x menor que o comerciante."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R6 · PRESSÃO · Atacadão Abre a 3km da Sua Loja Principal
  ═══════════════════════════════════════════════════════ */
  {
    title: "Atacadão Abre a 3km da Sua Loja Principal",
    description: "O Atacadão inaugura uma loja de 8.000m² a 3km da sua unidade principal — que responde por 35% da receita total da rede. A loja tem estacionamento para 400 carros, galeria de serviços e preços em alguns SKUs âncora 8% abaixo dos seus. Na primeira semana, o movimento da sua loja caiu 22%.",
    tags: ["varejo"],
    fase: "pressao",
    choices: [
      {
        text: "Intensificar o mix de produtos regionais e perecíveis locais onde o Atacadão não tem vantagem",
        risco: "baixo",
        effects: { clientes: +4, margem: +3, estoque: +2, marca: +3, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Produtos regionais e perecíveis locais são onde o atacarejo regional tem vantagem real. O Atacadão nacional não tem relacionamento com o produtor local de frango ou a cooperativa de laticínios da região."
      },
      {
        text: "Baixar os preços nos 20 SKUs mais comparados para igualar o Atacadão",
        risco: "alto",
        effects: { clientes: +2, margem: -6, financeiro: -4 },
        avaliacao: "ruim",
        ensinamento: "Guerra de preço com quem compra 10x mais é guerra perdida. O Atacadão pode sustentar preço negativo por meses para matar a concorrência regional — você não tem essa capacidade."
      },
      {
        text: "Reformar e ampliar o estacionamento da sua loja principal — a conveniência é onde o cliente decide",
        risco: "medio",
        effects: { financeiro: -4, clientes: +3, processos: +2, marca: +2 },
        avaliacao: "boa",
        ensinamento: "Em atacarejo, o estacionamento é parte da experiência de compra. Família que vai com carro cheio de compras prioriza facilidade de acesso e espaço para manobrar — antes mesmo de entrar na loja."
      },
      {
        text: "Criar programa de fidelidade para pequenos comerciantes com desconto progressivo por volume",
        risco: "baixo",
        effects: { clientes: +5, margem: +2, financeiro: -2, processos: +1 },
        avaliacao: "boa",
        ensinamento: "O pequeno comerciante que tem desconto progressivo e gerente de conta tem um custo de mudança real. Para ele, mudar de atacadão significa reaprender processo, preço e relação — o que tem fricção."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R7 · PRESSÃO · Greve dos Caminhoneiros Paralisa o Abastecimento
  ═══════════════════════════════════════════════════════ */
  {
    title: "Greve dos Caminhoneiros Paralisa o Abastecimento",
    description: "Uma greve nacional de caminhoneiros entra no 5º dia sem sinal de resolução. Seu estoque de produtos de alto giro — arroz, óleo, frango, açúcar — tem apenas 4 dias de cobertura. Os concorrentes nacionais, com CDs regionais maiores, têm 15 dias de cobertura. Clientes estão comprando em pânico e o estoque está evaporando.",
    tags: ["varejo"],
    fase: "pressao",
    choices: [
      {
        text: "Limitar a compra por CPF dos itens críticos e comunicar transparentemente a situação",
        risco: "baixo",
        gestorEffects: { reputacaoInterna: +1 },
        effects: { clientes: +3, estoque: +4, marca: +3, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Racionamento com comunicação transparente é a resposta mais ética e sustentável em crise de abastecimento. O cliente que entende a situação e recebe tratamento justo confia mais na marca."
      },
      {
        text: "Deixar o mercado funcionar — quem compra primeiro leva, sem limite",
        risco: "alto",
        effects: { financeiro: +2, estoque: -5, clientes: -3, marca: -4 },
        avaliacao: "ruim",
        ensinamento: "Deixar o estoque esvaziar sem gestão favorece quem compra em pânico e prejudica o cliente regular. Em 2 dias você fica sem produto e sem reputação."
      },
      {
        text: "Acionar fornecedores locais de emergência — cooperativas e produtores regionais — para complementar o estoque",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { estoque: +3, financeiro: -3, margem: -2, clientes: +2, marca: +3 },
        avaliacao: "boa",
        ensinamento: "Fornecedor local de emergência tem custo maior mas mantém o estoque dos produtos essenciais. É exatamente para isso que o relacionamento regional tem valor — você consegue o que o Atacadão não consegue."
      },
      {
        text: "Aumentar os preços dos itens em escassez para controlar a demanda e proteger a margem",
        risco: "alto",
        effects: { financeiro: +3, margem: +2, clientes: -6, marca: -6 },
        avaliacao: "ruim",
        ensinamento: "Aumento de preço em crise de abastecimento é especulação — e o cliente não esquece. Uma rede que aumenta o preço do arroz durante a greve dos caminhoneiros pode perder clientes que foram fiéis por anos."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R8 · PRESSÃO · Funcionário Aciona a Justiça do Trabalho
  ═══════════════════════════════════════════════════════ */
  {
    title: "Ação Trabalhista Coletiva Ameaça a Operação",
    description: "Um grupo de 47 funcionários das lojas novas entra com ação trabalhista coletiva: alegam horas extras não pagas, ausência de equipamentos de proteção e assédio de um gerente regional. O passivo estimado é R$ 2,8 milhões. O caso vaza para a mídia local. Um dos fornecedores pede garantias antes de renovar o contrato.",
    tags: ["varejo"],
    fase: "pressao",
    choices: [
      {
        text: "Abrir auditoria interna imediata, afastar o gerente acusado e comunicar publicamente as medidas",
        risco: "medio",
        gestorEffects: { reputacaoInterna: +2 },
        effects: { rh: +4, marca: +3, financeiro: -3, processos: +3 },
        avaliacao: "boa",
        ensinamento: "Resposta rápida com afastamento imediato e auditoria interna demonstra que a empresa toma as alegações a sério. Empresas que agem antes de serem forçadas a agir saem melhor das crises trabalhistas."
      },
      {
        text: "Negociar acordo extrajudicial com os funcionários antes que o caso se aprofunde",
        risco: "baixo",
        effects: { financeiro: -3, rh: +2, processos: +1 },
        avaliacao: "boa",
        ensinamento: "Acordo extrajudicial rápido é quase sempre financeiramente vantajoso em relação ao processo. Reduz o custo total e encerra o risco reputacional mais rapidamente."
      },
      {
        text: "Contestar todas as alegações judicialmente e aguardar o processo",
        risco: "alto",
        effects: { financeiro: -2, rh: -5, marca: -4, processos: -2 },
        avaliacao: "ruim",
        ensinamento: "Contestar ação coletiva trabalhista sem investigação interna é apostar que o judiciário vai encontrar o que você não procurou. O processo longo alimenta a narrativa negativa por meses."
      },
      {
        text: "Demitir imediatamente os 47 funcionários envolvidos na ação para eliminar o passivo futuro",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -3 },
        effects: { rh: -8, marca: -7, financeiro: -4, clientes: -2 },
        avaliacao: "ruim",
        ensinamento: "Demitir os funcionários que processaram a empresa é uma das piores decisões possíveis — agrava a ação, cria passivo maior e destrói a reputação como empregador em toda a região."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R9 · PRESSÃO · Inflação Corrói o Poder de Compra do Cliente
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Inflação Corrói o Poder de Compra do Seu Cliente",
    description: "A inflação do ano acumulou 9,2% e o consumidor de menor renda — seu principal cliente — está comprando menos e trocando para itens mais baratos. O ticket médio caiu 14% em volume (o que você vende) mas subiu 6% em valor (por causa dos preços maiores). Sua margem operacional caiu de 3,8% para 2,1%.",
    tags: ["varejo"],
    fase: "pressao",
    choices: [
      {
        text: "Criar linha 'Econômico' com marcas próprias de menor preço nos 10 itens de maior consumo",
        risco: "medio",
        effects: { clientes: +5, margem: +3, financeiro: -3, estoque: -1, marca: +2 },
        avaliacao: "boa",
        ensinamento: "Marca própria econômica em itens de alto giro é a resposta clássica do varejo para momento de compressão de renda. Você mantém o cliente na loja com preço competitivo e captura margem que seria do fornecedor."
      },
      {
        text: "Intensificar produtos a granel — maior percepção de economia pelo cliente",
        risco: "baixo",
        effects: { clientes: +4, margem: +2, processos: -2, estoque: +2 },
        avaliacao: "boa",
        ensinamento: "Produtos a granel permitem que o cliente compre a quantidade que cabe no bolso. Em momento de inflação alta, esse controle de gasto é o principal fator de escolha da loja."
      },
      {
        text: "Manter o mix atual e aguardar a normalização da inflação",
        risco: "alto",
        effects: { clientes: -3, financeiro: -3, margem: -2 },
        avaliacao: "ruim",
        ensinamento: "Aguardar enquanto o cliente migra para o concorrente que tem a opção mais barata é entregar participação de mercado de bandeja. Clientes perdidos para o preço demoram muito para voltar."
      },
      {
        text: "Criar sistema de crédito próprio para os clientes regulares — comprar agora e pagar no mês",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +1 },
        effects: { clientes: +4, financeiro: -4, processos: -3, margem: -1 },
        avaliacao: "media",
        ensinamento: "Crédito próprio em atacarejo tem risco de inadimplência alto em momentos de inflação e desemprego. O cliente que não tem dinheiro hoje pode não ter amanhã — e o risco passa a ser seu."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R10 · PRESSÃO · O Assaí Propõe Adquirir 3 das Suas Lojas
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Assaí Propõe Adquirir 3 das Suas Lojas",
    description: "O Assaí faz uma proposta direta: comprar as 3 lojas novas que ainda não atingiram break-even por R$ 18 milhões — preço justo pelo ativo, mas abaixo do custo de investimento. Com esse dinheiro você quitaria 60% da dívida. A operação ficaria com 4 lojas — as 2 originais e mais 2 das novas que já estão lucrativas.",
    tags: ["varejo"],
    fase: "pressao",
    choices: [
      {
        text: "Aceitar a proposta — 18M liquida a dívida e permite focar nas 4 lojas lucrativas",
        risco: "medio",
        gestorEffects: { capitalPolitico: +2 },
        effects: { financeiro: +7, rh: -3, clientes: -2, margem: +4, processos: +3 },
        avaliacao: "boa",
        ensinamento: "Vender ativo deficitário para desalavancar e focar no que funciona é uma decisão estratégica madura. Não é derrota — é reconhecer que escala mal gerenciada destrói valor."
      },
      {
        text: "Contrapropor R$ 24 milhões pelas 3 lojas ou apenas 2 das 3 por R$ 14 milhões",
        risco: "medio",
        effects: { financeiro: +3, processos: +1 },
        avaliacao: "boa",
        ensinamento: "Negociar condições de uma proposta inbound é sempre válido. O Assaí quer os ativos — caso contrário não teria feito a oferta. A contraproposta revela quanto eles realmente querem."
      },
      {
        text: "Recusar e usar os próximos 12 meses para levar as lojas deficitárias ao break-even",
        risco: "alto",
        effects: { financeiro: -3, processos: -2, rh: -1 },
        avaliacao: "media",
        ensinamento: "Recusar pode fazer sentido se você tem um plano concreto. Mas com dívida em 2,8x EBITDA e lojas que não atingiram break-even em 3 anos, o plano precisa ser muito específico para justificar não vender."
      },
      {
        text: "Recusar e propor que o Assaí entre como sócio operacional das 3 lojas deficitárias",
        risco: "alto",
        gestorEffects: { esgotamento: +2 },
        effects: { financeiro: +1, processos: -3, rh: -2 },
        avaliacao: "ruim",
        ensinamento: "Ter o principal concorrente como sócio operacional cria conflito de interesse permanente. Quem controla o operacional das lojas controla o que você aprende e o que você perde."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R11 · DECISÃO CRÍTICA · Consolidar ou Crescer de Novo
  ═══════════════════════════════════════════════════════ */
  {
    title: "Consolidar ou Crescer de Novo",
    description: "Após 18 meses de estabilização, a dívida está em 1,8x EBITDA e as 4 lojas remanescentes são lucrativas. O banco, surpreso com a recuperação, oferece nova linha de crédito para expansão. Um ponto excelente em uma cidade vizinha está disponível por 3 anos de aluguel antecipado. A equipe está dividida.",
    tags: ["varejo"],
    fase: "decisao",
    choices: [
      {
        text: "Consolidar — manter as 4 lojas por mais 12 meses, profissionalizar completamente antes de crescer",
        risco: "baixo",
        gestorEffects: { capitalPolitico: +1 },
        effects: { processos: +5, rh: +3, margem: +3, financeiro: +2 },
        avaliacao: "boa",
        ensinamento: "Crescer antes de consolidar foi o erro da primeira expansão. A segunda expansão precisa ser feita com processos maduros, time treinado e sistemas que escalem — não com a mesma estrutura de 2 lojas."
      },
      {
        text: "Abrir a 5ª loja com os aprendizados da crise — processos, mix e gestão desde o dia 1",
        risco: "medio",
        effects: { financeiro: -3, processos: +2, clientes: +3, margem: +1, rh: -1 },
        avaliacao: "boa",
        ensinamento: "Uma loja aberta com o processo certo é diferente de 7 abertas com o processo errado. O aprendizado da crise tem valor real se for aplicado na próxima expansão."
      },
      {
        text: "Usar o crédito para modernizar as 4 lojas — tecnologia, experiência do cliente, mix premium",
        risco: "baixo",
        effects: { processos: +4, clientes: +4, margem: +3, financeiro: -3, digital: +3 },
        avaliacao: "boa",
        ensinamento: "Investir em qualidade antes de quantidade é a lição mais valiosa de uma crise de expansão. Lojas melhores geram mais margem e criam a base para o próximo ciclo de crescimento sustentável."
      },
      {
        text: "Crescer agressivamente — a janela de oportunidade vai fechar quando o Atacadão expandir mais",
        risco: "alto",
        gestorEffects: { esgotamento: +2 },
        effects: { financeiro: -5, processos: -4, rh: -3, margem: -2 },
        avaliacao: "ruim",
        ensinamento: "Crescer com urgência porque o concorrente pode crescer é o mesmo erro da primeira expansão. O Atacadão sempre vai crescer — a questão é se você vai crescer com estrutura ou vai criar a mesma crise outra vez."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R12 · DECISÃO CRÍTICA · Vertical de Açougue e Peixaria Próprios
  ═══════════════════════════════════════════════════════ */
  {
    title: "Vertical de Açougue e Peixaria Próprios",
    description: "Um consultor de varejo apresenta uma oportunidade: criar açougue e peixaria com corte próprio dentro das lojas — o produto mais rentável e fidelizador do atacarejo. A margem de perecíveis com processamento próprio é 4x maior que a de não-perecíveis. O investimento em equipamentos e profissionais é R$ 1,4 milhão por loja.",
    tags: ["varejo"],
    fase: "decisao",
    choices: [
      {
        text: "Implementar nas 2 lojas originais primeiro — já têm cliente fiel que valoriza qualidade",
        risco: "medio",
        effects: { margem: +5, clientes: +5, financeiro: -4, marca: +4, rh: +2 },
        avaliacao: "boa",
        ensinamento: "Começar nas lojas com cliente mais fiel reduz o risco de aprendizado. A base de clientes que já confia na rede é mais tolerante com imperfeições do lançamento."
      },
      {
        text: "Implementar em todas as 4 lojas simultaneamente para maximizar o impacto",
        risco: "alto",
        gestorEffects: { esgotamento: +2 },
        effects: { margem: +3, clientes: +3, financeiro: -7, rh: -2, processos: -3 },
        avaliacao: "ruim",
        ensinamento: "Implementar operação nova e complexa em 4 lojas ao mesmo tempo reproduz o erro da expansão. Perecíveis com processamento próprio exigem treinamento específico e controle rigoroso que não se monta em paralelo."
      },
      {
        text: "Fazer parceria com açougue local reconhecido para operar dentro das lojas",
        risco: "baixo",
        effects: { margem: +2, clientes: +4, financeiro: -1, marca: +3 },
        avaliacao: "boa",
        ensinamento: "Parceria com açougue local reconhecido captura o diferencial de produto sem o risco operacional de montar a competência do zero. E valida o apetite do cliente antes do investimento total."
      },
      {
        text: "Recusar — perecíveis com processamento próprio são complexos demais para o momento atual",
        risco: "baixo",
        effects: { processos: +1, financeiro: +1 },
        avaliacao: "media",
        ensinamento: "Conservadorismo após uma crise é compreensível, mas recusar o maior diferencial de margem do atacarejo pode ceder o terreno para o concorrente que vai implementar e fidelizar os seus melhores clientes."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R13 · DECISÃO CRÍTICA · Plataforma Digital B2B para Comerciantes
  ═══════════════════════════════════════════════════════ */
  {
    title: "Plataforma Digital B2B: Atacarejo no App",
    description: "Um startup de tecnologia propõe construir uma plataforma B2B para pedidos de comerciantes: app, site, pagamento online e entrega em 24h. O investimento é R$ 800 mil no primeiro ano. O potencial: recuperar os 14pp de participação de comerciantes perdidos para os atacados digitais. O risco: competência digital que a empresa nunca desenvolveu.",
    tags: ["varejo"],
    fase: "decisao",
    choices: [
      {
        text: "Investir na plataforma própria com o startup como parceiro tecnológico",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { digital: +6, financeiro: -4, clientes: +4, processos: +2, margem: +2 },
        avaliacao: "boa",
        ensinamento: "Plataforma B2B própria para comerciantes é a combinação de preço regional com conveniência digital. É o modelo que grandes atacadistas globais estão implementando para defender a base B2B contra os marketplaces."
      },
      {
        text: "Usar o WhatsApp Business com um time de 3 pessoas para digitalizar os pedidos sem construir plataforma",
        risco: "baixo",
        effects: { digital: +3, financeiro: -1, clientes: +3, processos: +1 },
        avaliacao: "boa",
        ensinamento: "WhatsApp Business para pedidos B2B é a solução de menor custo e menor risco para começar a digitalizar sem construir tecnologia. O comerciante já usa — você só facilita o processo."
      },
      {
        text: "Integrar ao iFood Shop ou Rappi como canal de distribuição B2B sem construir plataforma própria",
        risco: "medio",
        effects: { digital: +4, clientes: +2, financeiro: -2, margem: -2 },
        avaliacao: "media",
        ensinamento: "Usar o marketplace do iFood ou Rappi para B2B é rápido e sem risco tecnológico, mas cede a relação com o cliente para a plataforma. O comerciante passa a ser cliente do iFood, não seu."
      },
      {
        text: "Recusar — o foco deve ser na operação física antes de investir em digital",
        risco: "alto",
        effects: { processos: +1, clientes: -2, digital: -2 },
        avaliacao: "ruim",
        ensinamento: "Adiar a digitalização do B2B enquanto plataformas digitais capturam os comerciantes da sua região é entregar o canal mais rentável de bandeja. O comerciante que migra para o digital raramente volta ao modelo presencial."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R14 · DECISÃO CRÍTICA · Certificação de Sustentabilidade
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Maior Cliente B2B Exige Certificação ESG",
    description: "Sua maior rede de restaurantes cliente — representa R$ 8,2 milhões em compras anuais — comunica que a partir do próximo ano vai priorizar fornecedores com certificação de sustentabilidade. Sem a certificação, você pode perder o contrato. O processo de certificação leva 18 meses e custa R$ 340 mil em adaptações.",
    tags: ["varejo"],
    fase: "decisao",
    choices: [
      {
        text: "Iniciar o processo de certificação imediatamente e usar isso como diferencial para atrair novos clientes B2B",
        risco: "medio",
        gestorEffects: { capitalPolitico: +2 },
        effects: { financeiro: -3, clientes: +3, marca: +5, processos: +3, rh: +2 },
        avaliacao: "boa",
        ensinamento: "Certificação ESG impulsionada por exigência de cliente B2B tem ROI claro — o custo do processo é menor do que o custo de perder o contrato. E o diferencial serve para atrair novos clientes que têm a mesma exigência."
      },
      {
        text: "Negociar prazo estendido com o cliente e começar apenas as adaptações de menor custo",
        risco: "baixo",
        effects: { financeiro: -1, clientes: +1, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Negociar prazo com o cliente enquanto começa pelas adaptações de menor impacto é uma postura pragmática. Demonstra comprometimento sem colocar a operação em risco financeiro imediato."
      },
      {
        text: "Recusar a certificação e tentar manter o cliente com desconto de preço",
        risco: "alto",
        effects: { financeiro: -2, clientes: -4, margem: -3, marca: -2 },
        avaliacao: "ruim",
        ensinamento: "Tentar substituir exigência de ESG com desconto de preço mistura critérios que os compradores modernos tratam separadamente. O desconto não resolve a exigência e ainda comprime a margem."
      },
      {
        text: "Usar a certificação como projeto estratégico completo — solar, embalagens, logística verde",
        risco: "medio",
        gestorEffects: { esgotamento: +1 },
        effects: { financeiro: -5, marca: +6, clientes: +4, processos: +3 },
        avaliacao: "boa",
        ensinamento: "ESG abrangente — não apenas para cumprir uma exigência — transforma o custo em diferencial de longo prazo. Atacarejo com pegada verde em região que valoriza o produtor local cria uma identidade de marca única."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R15 · DECISÃO CRÍTICA · O Legado do Atacarejo Regional
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Legado: Que Atacarejo Você Quer Deixar",
    description: "Cinco anos após a crise de expansão, as 4 lojas são rentáveis e a rede tem reputação sólida na região. O Atacadão e o Assaí estão presentes, mas você sobreviveu e se diferenciou. O conselho pergunta: qual é a próxima fase? Você pode crescer de novo, vender no auge ou se tornar referência regional de forma diferente.",
    tags: ["varejo"],
    fase: "decisao",
    choices: [
      {
        text: "Atacarejo regional especializado em produtos locais e sustentáveis — ser o oposto das redes nacionais",
        risco: "baixo",
        gestorEffects: { capitalPolitico: +2 },
        effects: { marca: +6, clientes: +5, margem: +4, financeiro: +2, rh: +3 },
        avaliacao: "boa",
        ensinamento: "Posicionamento de atacarejo regional com foco em produto local e sustentabilidade é o modelo mais defensável contra as redes nacionais. Você vence onde elas não conseguem replicar: o enraizamento na comunidade e a cadeia de fornecedores locais."
      },
      {
        text: "Crescer para 10 lojas nos próximos 3 anos — desta vez com processos, time e capital adequados",
        risco: "medio",
        effects: { financeiro: -3, processos: +3, clientes: +3, rh: -1, margem: +1 },
        avaliacao: "boa",
        ensinamento: "Crescer de novo depois de uma crise de expansão é possível — se os erros foram aprendidos. O que diferencia a segunda expansão da primeira é a maturidade operacional e a humildade de crescer dentro da capacidade real da empresa."
      },
      {
        text: "Vender a operação para um fundo regional que quer construir uma rede de atacarejo alternativo",
        risco: "medio",
        gestorEffects: { capitalPolitico: +3, esgotamento: -2 },
        effects: { financeiro: +8, rh: -2, clientes: -1, marca: -2 },
        avaliacao: "media",
        ensinamento: "Vender no momento de força é estrategicamente inteligente. O risco é o impacto na cultura e no time que sobreviveu à crise junto com você — e a incerteza sobre o que o fundo vai fazer com o posicionamento que foi construído."
      },
      {
        text: "Transformar em cooperativa de atacarejo — incluir funcionários e fornecedores como donos do negócio",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +1 },
        effects: { rh: +6, clientes: +4, marca: +5, financeiro: -3, processos: -2 },
        avaliacao: "boa",
        ensinamento: "Cooperativa de atacarejo transforma o negócio em projeto coletivo — funcionários que são donos têm comprometimento que salário não compra. É um modelo que combina eficiência econômica com impacto social real na comunidade."
      }
    ]
  }

]

]; // fim VarejoRounds
