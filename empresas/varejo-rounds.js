/* ═══════════════════════════════════════════════════════
   BETA · VAREJO · ROUNDS v5.0
   8 indicadores: financeiro, rh, clientes, processos,
                  margem, estoque, marca, digital
═══════════════════════════════════════════════════════ */

const VarejoRounds = [
[
  { title: "Os Números Não Fecham",
    description: "Ana, sua diretora financeira, apresenta os resultados do trimestre: margem operacional caiu de 8,3% para 5,1% em 18 meses. As lojas físicas respondem por 86% da receita mas concentram 94% dos custos. O e-commerce cresce 23% ao ano mas ainda não cobre a perda de margem do físico. Por onde começa o diagnóstico?",
    tags: ["varejo"],
    choices: [
      { risco:"baixo", text:"Mapear as 5 lojas com pior desempenho e calcular o custo real de cada uma", effects:{financeiro:+2,processos:+3,margem:+2}, avaliacao:"boa", ensinamento:"O diagnóstico granular por unidade é o primeiro passo de qualquer reestruturação de varejo. Sem saber quais lojas destroem margem, qualquer decisão é chute no escuro." },
      { risco:"medio", text:"Contratar consultoria especializada em varejo para avaliar toda a operação", effects:{financeiro:-4,processos:+2,margem:+1}, avaliacao:"media", ensinamento:"Consultoria traz benchmarks de mercado valiosos, mas o diagnóstico interno feito pelo próprio time costuma ser mais rápido e mais aderente à realidade operacional da empresa." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-2,capitalPolitico:+1}, text:"Anunciar corte de 10% em todos os custos de todas as lojas imediatamente", effects:{financeiro:+2,rh:-4,processos:-2,margem:+1}, avaliacao:"ruim", ensinamento:"Corte linear sem diagnóstico é o erro clássico de gestão de crise no varejo. Penaliza lojas saudáveis junto com as problemáticas e destrói a moral do time." },
      { text:"Acelerar as vendas do e-commerce para compensar a queda de margem do físico", effects:{clientes:+2,financeiro:-3,digital:+2,margem:-1}, avaliacao:"ruim", ensinamento:"Crescer o canal com menor margem para compensar o problema do canal principal adia o problema sem resolvê-lo. A causa-raiz da queda de margem precisa ser endereçada." }
    ]
  },
  { title: "O Ranking das Lojas",
    description: "O mapeamento revelou: das 38 lojas, 8 respondem por 71% do lucro. 6 lojas têm resultado negativo há mais de 12 meses. O gerente regional defende que as lojas deficitárias ainda têm 'valor estratégico de presença'. O contrato de aluguel de três delas vence em 60 dias.",
    tags: ["varejo"],
    choices: [
      { text:"Não renovar os contratos das 3 lojas deficitárias com aluguel vencendo", effects:{financeiro:+5,rh:-3,clientes:-2,margem:+3}, avaliacao:"boa", ensinamento:"Fechar lojas cronicamente deficitárias é decisão difícil mas necessária. O dinheiro economizado pode fortalecer as lojas rentáveis." },
      { text:"Negociar redução de 30% nos aluguéis das 6 lojas deficitárias antes de qualquer fechamento", effects:{financeiro:+3,processos:+2,margem:+2}, avaliacao:"boa", ensinamento:"Renegociação de aluguel é a primeira alavanca em varejo. Proprietários preferem 30% menos a ter o espaço vazio." },
      { text:"Converter as lojas deficitárias em pontos de experiência sem estoque físico", effects:{financeiro:-2,clientes:+3,processos:-3,marca:+2,estoque:+2}, avaliacao:"media", ensinamento:"Lojas conceito têm apelo no varejo moderno, mas a conversão tem custo e leva tempo." },
      { text:"Manter todas as lojas e dar 6 meses para os gerentes regionais reverterem os resultados", effects:{financeiro:-5,rh:-1,processos:-3,margem:-2}, avaliacao:"ruim", ensinamento:"Manter lojas cronicamente deficitárias sem plano estrutural consome caixa sem perspectiva de retorno." }
    ]
  },
  { title: "O Time de Vendas Está Desmotivado",
    description: "A pesquisa de clima aponta: 62% do time de vendas das lojas físicas se sente 'ameaçado' pelo crescimento do e-commerce. Os melhores vendedores estão saindo. O índice de rotatividade do time comercial subiu de 28% para 47% ao ano.",
    tags: ["varejo"],
    choices: [
      { text:"Criar comissão para vendedores físicos que direcionam clientes ao app — integração real de canais", effects:{rh:+6,clientes:+3,financeiro:-2,digital:+2,marca:+1}, avaliacao:"boa", ensinamento:"Remunerar o vendedor físico por vendas no digital elimina a percepção de competição interna. Omnichannel real começa quando os incentivos dos canais estão alinhados." },
      { text:"Comunicar que o e-commerce e o físico têm papéis complementares e que ninguém será demitido", effects:{rh:+4}, avaliacao:"media", ensinamento:"Comunicação sobre o futuro dos empregos é necessária, mas sem mudança real nos incentivos, o discurso perde credibilidade rapidamente." },
      { risco:"alto", gestorEffects:{reputacaoInterna:+2,capitalPolitico:-1}, text:"Aumentar o salário fixo dos vendedores físicos em 15% para reter o time", effects:{financeiro:-5,rh:+4,margem:-2}, avaliacao:"media", ensinamento:"Aumento de salário resolve o imediato mas não ataca a causa: o medo de irrelevância." },
      { risco:"medio", gestorEffects:{reputacaoInterna:-1}, text:"Focar na automação e aceitar a rotatividade como parte da transformação digital", effects:{financeiro:+2,rh:-6,clientes:-4,marca:-2}, avaliacao:"ruim", ensinamento:"Abrir mão do capital humano acumulado no atendimento físico para economizar em pessoas é uma aposta muito cara." }
    ]
  },
  { title: "O Problema do Estoque",
    description: "O relatório de inventário revela: R$ 4,2 milhões em produtos parados há mais de 90 dias. A previsão de demanda é feita manualmente por cada gerente de loja. Resultado: lojas com excesso em alguns SKUs e ruptura em outros. O índice de ruptura médio está em 18% — acima do benchmark de 8%.",
    tags: ["varejo"],
    choices: [
      { text:"Implementar sistema de gestão de estoque centralizado com reposição automática por loja", effects:{processos:+6,financeiro:-4,rh:-1,estoque:+5}, avaliacao:"boa", ensinamento:"Centralização do estoque com algoritmos de reposição é o padrão em redes de varejo eficientes. Elimina a ruptura, reduz o estoque parado e libera os gerentes para foco no cliente." },
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+1}, text:"Fazer liquidação agressiva dos R$ 4,2M parados para liberar caixa imediatamente", effects:{financeiro:+4,clientes:+1,processos:+2,estoque:+4,margem:-1}, avaliacao:"boa", ensinamento:"Liquidar estoque parado com desconto é preferível a manter o capital imobilizado." },
      { risco:"medio", text:"Contratar gerente de supply chain para liderar a reorganização do estoque", effects:{financeiro:-3,processos:+4,rh:+1,estoque:+2}, avaliacao:"media", ensinamento:"Um gestor especializado em supply chain traz metodologia, mas leva de 3 a 6 meses para produzir resultado concreto." },
      { text:"Treinar os gerentes de loja para melhorar as previsões manuais", effects:{rh:+2,processos:-2,estoque:+1}, avaliacao:"ruim", ensinamento:"Treinamento em previsão manual não escala. Humanos não processam os dados de velocidade de giro que sistemas automatizados tratam em segundos." }
    ]
  },
  { title: "O E-commerce Não Converte",
    description: "O site tem 280.000 visitantes mensais mas converte apenas 1,4% — a média do varejo nacional é 2,8%. O time de TI aponta: tempo de carregamento médio de 6,2 segundos no mobile, frete caro e sem opção de retirada em loja.",
    tags: ["varejo"],
    choices: [
      { text:"Implementar click-and-collect: compra no app, retira na loja mais próxima sem frete", effects:{clientes:+6,processos:+3,financeiro:-3,digital:+4,marca:+2}, avaliacao:"boa", ensinamento:"Click-and-collect resolve o frete — principal barreira no e-commerce de varejo — e ainda traz tráfego para as lojas físicas." },
      { text:"Redesenhar o site focando em performance mobile e checkout simplificado", effects:{clientes:+5,processos:+3,financeiro:-4,digital:+5}, avaliacao:"boa", ensinamento:"Performance mobile é o maior driver de conversão no varejo digital brasileiro. Cada segundo a menos no tempo de carregamento aumenta a conversão em até 7%." },
      { text:"Contratar agência de marketing digital para aumentar o tráfego do site", effects:{financeiro:-5,clientes:+2,digital:+1}, avaliacao:"ruim", ensinamento:"Aumentar tráfego sem aumentar a conversão é amplificar o problema. Se o site converte 1,4%, trazer mais visitantes significa mais abandono, não mais vendas." },
      { text:"Lançar o aplicativo próprio com notificações de ofertas personalizadas", effects:{financeiro:-6,clientes:+3,processos:-2,digital:+3,marca:+1}, avaliacao:"media", ensinamento:"App próprio tem custo alto de desenvolvimento. Com taxa de conversão do site em 1,4%, otimizar o canal existente é mais urgente do que criar um novo canal com os mesmos problemas." }
    ]
  },
  { title: "Marketplace Gigante Invade o Seu Segmento",
    description: "O maior marketplace do país anunciou que vai vender os mesmos produtos do seu mix principal com entrega em 24 horas e preço em média 12% menor. Três dos seus 10 fornecedores principais já assinaram contrato para vender direto na plataforma deles.",
    tags: ["varejo"],
    choices: [
      { text:"Focar em marcas exclusivas e produtos que o marketplace não tem — criar diferenciação real", effects:{clientes:+5,financeiro:-3,processos:+2,marca:+4,margem:+2}, avaliacao:"boa", ensinamento:"Exclusividade de mix é a defesa mais eficaz contra marketplaces. Produtos que o marketplace não tem são itens que seus clientes precisam vir até você para comprar." },
      { text:"Negociar exclusividade de fornecimento com os 3 fornecedores que assinaram com o marketplace", effects:{financeiro:-4,clientes:+3,processos:+2,marca:+2}, avaliacao:"boa", ensinamento:"Recuperar a exclusividade de fornecedores estratégicos tem custo mas elimina a ameaça direta." },
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+1}, text:"Reduzir preços para igualar o marketplace nos produtos mais concorridos", effects:{financeiro:-6,clientes:+2,margem:-4}, avaliacao:"ruim", ensinamento:"Guerra de preços com marketplace capitalizado é batalha perdida. Competir por preço destrói a margem sem garantir os clientes." },
      { text:"Criar programa de fidelidade com benefícios que o marketplace não consegue oferecer", effects:{clientes:+5,financeiro:-3,rh:-1,marca:+3}, avaliacao:"boa", ensinamento:"Fidelidade vai além do preço — ela é construída por conveniência, relacionamento e benefícios tangíveis." }
    ]
  },
  { title: "O Fornecedor Estratégico Aumenta o Preço em 22%",
    description: "Seu principal fornecedor — responsável por 31% do faturamento — comunicou reajuste de 22% em 60 dias, alegando aumento de custo de insumos importados.",
    tags: ["varejo"],
    choices: [
      { risco:"medio", text:"Negociar reajuste parcelado em 3 etapas de 7,3% ao longo de 9 meses", effects:{financeiro:+3,processos:+2,clientes:-1,margem:+1}, avaliacao:"boa", ensinamento:"Renegociação de prazo distribui o impacto e dá tempo para buscar alternativas ou repassar gradualmente ao cliente." },
      { text:"Absorver o reajuste e repassar integralmente ao cliente", effects:{clientes:-5,financeiro:-2,margem:-3}, avaliacao:"ruim", ensinamento:"Repasse integral de reajuste ao consumidor é o caminho que mais deteriora o relacionamento com o cliente." },
      { risco:"medio", text:"Buscar fornecedores alternativos para reduzir a dependência dos 31%", effects:{financeiro:-3,processos:+5,clientes:-2,estoque:-1}, avaliacao:"boa", ensinamento:"Diversificação de fornecedores é a única estratégia estrutural contra concentração de dependência." },
      { text:"Aceitar o reajuste integral e renegociar benefícios como prazo de pagamento e exclusividade", effects:{financeiro:-2,processos:+3,clientes:-1,marca:+1}, avaliacao:"media", ensinamento:"Aceitar o preço em troca de benefícios operacionais pode ser válido se o prazo de pagamento melhorar o fluxo de caixa." }
    ]
  },
  { title: "Crise de Imagem: Reclamação Viral nas Redes",
    description: "Um cliente filmou a devolução de um produto sendo recusada indevidamente por uma gerente de loja e postou no Instagram. Em 48 horas, o vídeo atingiu 1,2 milhão de visualizações. O Procon notificou a empresa.",
    tags: ["varejo"],
    choices: [
      { text:"Publicar nota de desculpas, resolver o caso da cliente e anunciar treinamento de toda a rede", effects:{clientes:+6,rh:-2,processos:+3,marca:+4}, avaliacao:"boa", ensinamento:"Resposta pública rápida com ação concreta é o padrão ouro de gestão de crise em varejo. Clientes que veem a empresa resolver com transparência frequentemente se tornam defensores." },
      { text:"Contatar o cliente para resolver privadamente antes de qualquer comunicação pública", effects:{clientes:+3,processos:+1,marca:+1}, avaliacao:"media", ensinamento:"Resolver privadamente protege o relacionamento com o cliente específico, mas não controla a narrativa pública que já viralizou." },
      { text:"Verificar internamente se a gerente agiu conforme a política vigente antes de se posicionar", effects:{clientes:-5,financeiro:-3,marca:-4}, avaliacao:"ruim", ensinamento:"Em crises digitais, o silêncio público é lido como omissão. A investigação interna pode correr em paralelo com uma resposta imediata." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-1,capitalPolitico:+2}, text:"Desligar a gerente e comunicar isso publicamente como demonstração de valores", effects:{rh:-6,clientes:+2,processos:-2,marca:-1}, avaliacao:"ruim", ensinamento:"Demitir publicamente como resposta a pressão de redes sociais cria precedente de gestão por humilhação." }
    ]
  },
  { title: "Black Friday: O Maior Risco do Ano",
    description: "Faltam 45 dias para a Black Friday. No ano passado, o site ficou fora do ar por 3 horas no pico das 23h. O time de TI quer R$ 280k para infraestrutura cloud escalável. O time de operações quer R$ 180k para reforçar o time de separação de pedidos. O orçamento disponível é de R$ 300k.",
    tags: ["varejo"],
    choices: [
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+1}, text:"Investir R$ 220k em infraestrutura cloud e R$ 80k em operações temporárias", effects:{processos:+5,clientes:+4,financeiro:-4,digital:+4}, avaliacao:"boa", ensinamento:"Site fora do ar na Black Friday é perda direta de receita e dano de imagem irreparável. Priorizar infraestrutura garante que o crescimento de demanda não seja desperdício." },
      { risco:"medio", text:"Investir o orçamento todo em operações — equipe presencial garante a separação e expedição de pedidos", effects:{rh:+3,clientes:-3,processos:-2,digital:-2}, avaliacao:"ruim", ensinamento:"Equipe sem infraestrutura digital não resolve o ponto de falha. O gargalo do ano anterior foi o site — não a separação e expedição de pedidos." },
      { text:"Limitar as promoções digitais para não superar a capacidade atual da infraestrutura", effects:{financeiro:+2,clientes:-4,processos:+1,digital:-2,marca:-2}, avaliacao:"ruim", ensinamento:"Limitar vendas para não estourar a infraestrutura é admitir incapacidade operacional. Na Black Friday, o espaço que você não ocupa é imediatamente preenchido pelo concorrente." },
      { text:"Negociar com o provedor cloud contrato de uso variável — paga só pelo pico", effects:{financeiro:+2,processos:+5,clientes:+4,digital:+3}, avaliacao:"boa", ensinamento:"Cloud com modelo de uso variável elimina o investimento fixo e garante escala sob demanda. É a solução mais inteligente para demanda de pico previsível como Black Friday." }
    ]
  },
  { title: "Resultado da Black Friday",
    description: "A Black Friday foi o melhor dia da história da empresa em receita — R$ 3,1M em 24 horas. Mas o prazo de entrega médio foi 6,8 dias contra os 3 dias prometidos. 23% dos pedidos atrasaram mais de 5 dias. O Reclame Aqui explodiu com 1.847 reclamações. O NPS despencou 22 pontos.",
    tags: ["varejo"],
    choices: [
      { text:"Contatar proativamente todos os clientes com pedido atrasado com cupom de compensação", effects:{clientes:+5,financeiro:-3,rh:-2,marca:+2}, avaliacao:"boa", ensinamento:"Contato proativo antes da reclamação do cliente reduz o volume de Reclame Aqui e transforma a frustração em percepção de cuidado." },
      { text:"Publicar nota pública pedindo desculpas e explicando o volume excepcional como causa", effects:{clientes:+3,processos:+2,marca:+1}, avaliacao:"media", ensinamento:"Nota pública cria contexto, mas 'volume excepcional' é um argumento que todos os varejistas usam toda Black Friday. Clientes esperam que você planeje para o volume." },
      { text:"Rever o contrato com a transportadora que mais atrasou para a próxima operação", effects:{processos:+5,clientes:-1,estoque:+1}, avaliacao:"media", ensinamento:"Renegociar logística para o próximo ano é essencial, mas não resolve as 1.847 reclamações abertas agora." },
      { text:"Absorver as reclamações e focar nos próximos eventos — os clientes esquecem rápido", effects:{clientes:-6,financeiro:-2,marca:-4}, avaliacao:"ruim", ensinamento:"Clientes de varejo têm muitas opções e baixa fidelidade de preço. Uma experiência ruim seguida de silêncio da marca resulta em migração definitiva." }
    ]
  },
  { title: "Fechar ou Transformar: As 6 Lojas Deficitárias",
    description: "Após 6 meses de tentativas de melhoria, as 6 lojas deficitárias mantêm resultado negativo. O custo fixo combinado é de R$ 890k/mês. Um fundo de private equity propôs adquirir 4 dos pontos para convertê-los em dark stores para delivery.",
    tags: ["varejo"],
    choices: [
      { text:"Vender 4 lojas ao PE para dark stores e fechar 2 — R$ 2,1M de caixa e R$ 890k/mês de custo eliminado", effects:{financeiro:+8,clientes:-3,rh:-4,margem:+4,estoque:+2}, avaliacao:"boa", ensinamento:"Transformar ativos que destroem valor em caixa e eliminar custo fixo é a decisão estruturalmente correta." },
      { risco:"medio", gestorEffects:{reputacaoInterna:+1,esgotamento:+1}, text:"Converter as 6 lojas em espaços menores de experiência com estoque reduzido", effects:{financeiro:-4,clientes:+3,processos:-3,marca:+3,estoque:+2}, avaliacao:"media", ensinamento:"Lojas experienciais têm mérito estratégico, mas a conversão tem custo e tempo. Sem garantia de reversão do déficit, a empresa assume mais custo." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-3,capitalPolitico:+2}, text:"Fechar as 6 lojas de uma vez e realocar o time para as lojas rentáveis", effects:{financeiro:+6,rh:-6,clientes:-4,margem:+3}, avaliacao:"media", ensinamento:"Fechamento total é a solução mais limpa financeiramente, mas o impacto humano e de marca é maior." },
      { text:"Dar mais 6 meses com metas rígidas e fechar apenas as que não atingirem o breakeven", effects:{financeiro:-5,processos:-2,margem:-2}, avaliacao:"ruim", ensinamento:"Seis meses a mais de custo fixo de R$ 890k/mês sem mudança estrutural são R$ 5,3M queimados." }
    ]
  },
  { title: "Proposta de Fusão com Rede Concorrente Regional",
    description: "Uma rede concorrente com 22 lojas em cidades onde você não atua propôs fusão. O acordo consolidaria 60 lojas e criaria a maior rede regional do estado. O preço é atrativo, mas as culturas operacionais são opostas.",
    tags: ["varejo"],
    choices: [
      { text:"Propor joint venture comercial sem fusão societária — compartilhar fornecedores e negociar escala conjunta", effects:{financeiro:+4,processos:+3,clientes:+1,margem:+3}, avaliacao:"boa", ensinamento:"Joint venture preserva a independência enquanto captura o benefício de escala. Poder de compra conjunto pode reduzir custo de mercadoria em 8-15%." },
      { risco:"alto", gestorEffects:{capitalPolitico:+2,esgotamento:+2}, text:"Aceitar a fusão — 60 lojas criam poder de barganha que nenhum dos dois tem sozinho", effects:{financeiro:+5,clientes:+2,rh:-4,processos:-5,margem:+1}, avaliacao:"media", ensinamento:"Fusões de redes de varejo com culturas opostas raramente entregam a sincronia prometida." },
      { risco:"medio", gestorEffects:{reputacaoInterna:+1,capitalPolitico:-1}, text:"Recusar e acelerar a expansão orgânica para as cidades onde o concorrente atua", effects:{financeiro:-6,clientes:+3,rh:-2,marca:+1}, avaliacao:"ruim", ensinamento:"Expansão orgânica para mercados onde o concorrente já está estabelecido é custosa e lenta." },
      { risco:"alto", gestorEffects:{capitalPolitico:+2,esgotamento:+2}, text:"Adquirir apenas as 8 lojas do concorrente em mercados estratégicos para você", effects:{financeiro:-3,clientes:+4,processos:+2,marca:+2}, avaliacao:"boa", ensinamento:"Aquisição seletiva de ativos estratégicos captura o que você precisa sem o custo de integrar uma rede inteira com cultura divergente." }
    ]
  },
  { title: "Decisão de Marca Própria",
    description: "O diretor de compras identificou oportunidade: 6 categorias respondem por 44% das vendas mas têm margem bruta de apenas 22%. Os mesmos produtos com marca própria teriam margem estimada de 38%.",
    tags: ["varejo"],
    choices: [
      { text:"Lançar marca própria nas 2 categorias com maior volume e menor risco técnico primeiro", effects:{financeiro:+5,clientes:+2,processos:+3,margem:+4,marca:+3}, avaliacao:"boa", ensinamento:"Começar por onde o risco é menor e o impacto é maior é a estratégia certa em marca própria. Validar com 2 categorias antes de expandir evita over-commit." },
      { text:"Lançar marca própria nas 6 categorias simultaneamente para maximizar o impacto de margem", effects:{financeiro:-4,processos:-4,clientes:-2,margem:-1,estoque:-2}, avaliacao:"ruim", ensinamento:"Lançar 6 categorias ao mesmo tempo fragmenta o foco, o orçamento e a capacidade de resposta a problemas." },
      { text:"Terceirizar o desenvolvimento das marcas próprias para um fabricante com linha exclusiva", effects:{financeiro:-2,processos:+4,clientes:+2,margem:+3,marca:+2}, avaliacao:"boa", ensinamento:"Parceria com fabricante estabelecido reduz o risco técnico e acelera o time-to-market." },
      { text:"Adiar — marca própria exige atenção de gestão que a empresa não tem neste momento", effects:{processos:+2,financeiro:-1,margem:+0}, avaliacao:"media", ensinamento:"Disciplina para não abraçar todas as oportunidades ao mesmo tempo é habilidade valiosa. Mas o custo da inação em margem é real." }
    ]
  },
  { title: "O Investidor Quer Abrir o Capital",
    description: "O fundo que detém 23% da empresa quer abrir o capital em 18 meses. O IPO resolveria o problema de caixa e financiaria a transformação digital completa. Mas exige dois anos de resultados crescentes, auditoria externa e governança formalizada.",
    tags: ["varejo"],
    choices: [
      { text:"Aceitar o objetivo do IPO e iniciar o processo de governança e auditoria imediatamente", effects:{financeiro:+4,processos:+5,rh:-2,margem:+2}, avaliacao:"boa", ensinamento:"IPO como objetivo estratégico orienta todas as decisões de governança e resultado. O processo de se preparar para abrir o capital frequentemente melhora a empresa." },
      { risco:"medio", gestorEffects:{capitalPolitico:-1}, text:"Negociar um prazo de 36 meses — 18 meses é inviável com a situação atual", effects:{financeiro:+2,processos:+3,rh:+1,margem:+1}, avaliacao:"boa", ensinamento:"Prazo realista de preparação protege o valuation. Abrir o capital mal preparado destrói valor para todos os acionistas." },
      { text:"Recusar o IPO e propor recompra da participação do fundo com caixa do próximo ano", effects:{financeiro:-5,rh:+3,processos:-2}, avaliacao:"media", ensinamento:"Recomprar o fundo antes do IPO pode ser correto se o empreendedor quer manter o controle total. O risco é perder a governança e rede de contatos." },
      { risco:"alto", gestorEffects:{capitalPolitico:+2,esgotamento:+3}, text:"Aceitar e contratar bancos de investimento imediatamente para iniciar o coleta de intenções de compra de ações", requisitos:{indicadorMinimo:{financeiro:10,processos:9}}, effects:{financeiro:-4,processos:-3,rh:-3,margem:-2}, avaliacao:"ruim", ensinamento:"Contratar bancos antes de ter governança, auditoria e resultados consistentes queima capital em assessoria sem estar pronto para o mercado." }
    ]
  },
  { title: "O Futuro da Rede: Qual Varejo Você Quer Ser?",
    description: "Após um ciclo intenso de transformação, você precisa definir o posicionamento definitivo para os próximos 3 anos. Os dados mostram que o consumidor evoluiu e o mercado não perdoa ambiguidade.",
    tags: ["varejo"],
    choices: [
      { text:"Varejo omnichannel premium: lojas experienciais + e-commerce com entrega rápida e serviço diferenciado", effects:{financeiro:+5,clientes:+6,processos:+4,rh:+2,marca:+5,digital:+3,margem:+3}, avaliacao:"boa", ensinamento:"Omnichannel premium é o posicionamento mais defensável contra marketplaces. Clientes que pagam mais por experiência têm menor elasticidade de preço e maior fidelidade." },
      { text:"Digital-first: reduzir a rede física para 15 lojas estratégicas e escalar o e-commerce como canal principal", effects:{financeiro:+4,clientes:+3,processos:+5,rh:-3,digital:+6,margem:+2}, avaliacao:"boa", ensinamento:"Varejo digital-first com ancoragem física seletiva é a estratégia de maior eficiência operacional." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-2,capitalPolitico:+1}, text:"Atacadista regional: vender para pequenos varejistas e abandonar o B2C direto", requisitos:{faseEmpresa:["crise"]}, effects:{clientes:-5,financeiro:+3,rh:-4,processos:-3,marca:-4}, avaliacao:"ruim", ensinamento:"Pivô para atacado abandona anos de construção de marca e relacionamento com o consumidor final. Mudança de modelo radical raramente resolve problema de execução." },
      { text:"Varejo de proximidade: micro-lojas de até 200m² em bairros residenciais com sortimento local", effects:{financeiro:+3,clientes:+4,processos:+3,rh:+1,marca:+2,estoque:+2}, avaliacao:"boa", ensinamento:"Varejo de proximidade compete no convênio de localização que o e-commerce não resolve: a compra imediata, sem espera, a 5 minutos de casa." }
    ]
  }
]
]; // fim VarejoRounds
