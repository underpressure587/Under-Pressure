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
/* Histórias [1] e [2] adicionadas abaixo */
,
[

  { title: "O Mapa da Nova Concorrência",
    description: "O relatório de inteligência chega: Raia Drogasil e Pague Menos abriram 31 lojas na sua região em 18 meses. Das suas 24 lojas, 9 estão em raio de 800m de um concorrente nacional. O ticket médio caiu de R$98 para R$81. Mas o NPS da sua rede é 72 — o dos concorrentes na região é 61. Por onde começa?",
    tags: ["varejo"],
    choices: [
      { text: "Mapear as 9 lojas em rota de colisão e calcular quais têm vantagem defensável de localização", risco: "baixo", effects: { financeiro: +1, processos: +3, margem: +1, clientes: +1 }, avaliacao: "boa", ensinamento: "Diagnóstico por loja evita decisões generalizadas que fecham unidades que poderiam sobreviver. Localização, base fiel e mix definem quais têm vantagem real." },
      { text: "Reduzir preços dos 50 produtos mais vendidos para competir com as redes nacionais", risco: "alto", effects: { clientes: +2, margem: -4, financeiro: -3 }, avaliacao: "ruim", ensinamento: "Guerra de preços com Raia Drogasil é batalha perdida. As redes têm poder de compra centralizado com custo 15-20% menor — cada centavo de desconto é sangramento de margem sem retorno." },
      { text: "Comunicar o diferencial de atendimento usando o NPS superior como argumento de posicionamento", risco: "baixo", effects: { marca: +3, clientes: +2, digital: +1 }, avaliacao: "boa", ensinamento: "NPS 72 vs 61 é um diferencial mensurável. Clientes que escolhem pelo atendimento têm fidelidade alta e menor sensibilidade a preço — o segmento que a farmácia regional precisa defender." },
      { text: "Contratar consultoria de varejo farmacêutico para benchmarking de respostas a concorrentes nacionais", risco: "medio", effects: { financeiro: -2, processos: +3 }, avaliacao: "media", ensinamento: "Benchmarking é valioso — mas farmácias regionais que sobreviveram à entrada de grandes redes geralmente o fizeram com conhecimento interno e agilidade local, não com planos de consultoria." }
    ]
  },

  { title: "O Farmacêutico Que Quer Sair",
    description: "Cristiane, farmacêutica sênior com 11 anos de empresa, pede conversa. A Raia Drogasil ofereceu R$2.200 a mais por mês. 'Não é só o dinheiro — é que aqui parece que a farmácia não tem futuro.' Sete dos 24 postos de farmacêutico têm defasagem salarial acima de 20%. Perder farmacêuticos experientes afeta diretamente o diferencial de atendimento.",
    tags: ["varejo"],
    choices: [
      { text: "Reajustar o salário de todos os farmacêuticos defasados para o nível de mercado", risco: "medio", effects: { rh: +5, margem: -3, financeiro: -3, clientes: +2, marca: +2 }, avaliacao: "boa", ensinamento: "Farmacêutico experiente é o principal ativo diferencial de uma farmácia regional. O custo do reajuste é real — mas o custo de perder 7 farmacêuticos e substituir por perfis inexperientes é muito maior." },
      { text: "Contra-oferta apenas para a Cristiane — reter quem ameaça sair, não todos", risco: "medio", gestorEffects: { reputacaoInterna: -1 }, effects: { rh: +1, margem: -1, financeiro: -1 }, avaliacao: "ruim", ensinamento: "Contra-oferta seletiva vira informação interna em dias. Os outros 6 farmacêuticos vão aprender que precisam ameaçar sair para receber reajuste." },
      { text: "Criar plano de carreira: farmacêutico clínico, farmacêutico gestor e especialista em manipulação", risco: "baixo", effects: { rh: +4, marca: +2, clientes: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Plano de carreira cria perspectiva de futuro que dinheiro sozinho não garante. Farmacêuticos em trilhas especializadas têm retenção naturalmente maior." },
      { text: "Aceitar a saída e contratar substituto recém-formado com salário menor", risco: "alto", gestorEffects: { reputacaoInterna: -2 }, effects: { rh: -4, clientes: -3, marca: -3, financeiro: +1 }, avaliacao: "ruim", ensinamento: "Substituir farmacêutico de 11 anos por recém-formado economiza R$2.200/mês mas perde anos de conhecimento de pacientes crônicos e relacionamento médico. O custo invisível é muito maior." }
    ]
  },

  { title: "O Sistema de Estoque Quebrado",
    description: "Ruptura de 14,3% — quase o dobro do benchmark de 8%. Em medicamentos crônicos, é 9,2%. Clientes com prescrição de uso contínuo que encontram ruptura frequentemente não voltam. O sistema tem 9 anos e não integra com fornecedores. Reposição feita por planilha em cada loja.",
    tags: ["varejo"],
    choices: [
      { text: "Implementar sistema de reposição automática com integração com as principais distribuidoras farmacêuticas", risco: "medio", effects: { processos: +5, estoque: +5, clientes: +3, financeiro: -4, margem: +1 }, avaliacao: "boa", ensinamento: "Ruptura zero em crônicos é a condição mínima para fidelização em farmácia. Integração elimina o erro humano da planilha e o custo de compra de emergência com preço spot." },
      { text: "Focar apenas nos 200 SKUs crônicos mais críticos — resolver onde o impacto na fidelização é maior", risco: "baixo", effects: { estoque: +3, clientes: +3, processos: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Priorizar os 200 SKUs de maior impacto na fidelização resolve 70% do problema com 30% do investimento. Pareto funciona em estoque farmacêutico." },
      { text: "Criar time centralizado de supply chain para supervisionar o estoque das 24 lojas", risco: "medio", effects: { processos: +3, estoque: +3, financeiro: -2, rh: +1 }, avaliacao: "media", ensinamento: "Time centralizado melhora a supervisão — mas sem sistema adequado, o time gerencia planilhas com mais experiência. O gargalo é a ferramenta, não o número de pessoas." },
      { text: "Treinar os gerentes de loja em métodos melhores de previsão de demanda manual", risco: "baixo", effects: { processos: +1, estoque: +1, rh: +1 }, avaliacao: "ruim", ensinamento: "Humanos fazendo previsão manual de 1.500+ SKUs farmacêuticos é sistematicamente inferior a qualquer sistema automatizado." }
    ]
  },

  { title: "O App de Delivery Chega à Cidade",
    description: "iFood Saúde e Rappi Farmácia chegaram com entrega em 60 minutos. As redes nacionais já estão integradas. Suas 24 lojas não têm presença digital além de um perfil no Google desatualizado. 23% dos clientes de 18-35 anos estão usando os apps.",
    tags: ["varejo"],
    choices: [
      { text: "Integrar com iFood Saúde e Rappi nas 24 lojas — usar o canal que já tem o cliente", risco: "medio", effects: { digital: +4, clientes: +3, marca: +1, financeiro: -2, margem: -1 }, avaliacao: "boa", ensinamento: "Marketplaces de delivery já têm o cliente. Entrar nos apps em 2 semanas é mais inteligente do que 12 meses construindo canal próprio com R$500k de investimento." },
      { text: "Criar serviço de delivery próprio via WhatsApp Business — atendimento farmacêutico personalizado", risco: "baixo", effects: { digital: +2, clientes: +3, marca: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "WhatsApp para delivery regional é o canal mais eficiente para pacientes crônicos acima de 40 anos que preferem conversar com farmacêutico de confiança a navegar em apps." },
      { text: "Desenvolver app próprio de delivery com fidelização integrada", risco: "alto", gestorEffects: { esgotamento: +2 }, effects: { digital: +3, financeiro: -5, processos: -2, clientes: +1 }, avaliacao: "ruim", ensinamento: "App próprio com escala de 24 lojas regionais não compete com iFood em downloads. O investimento resulta em app com base de usuários insuficiente para ser sustentável." },
      { text: "Ignorar o digital por enquanto — o atendimento presencial representa 100% da receita", risco: "medio", effects: { digital: -2, clientes: -2, marca: -1 }, avaliacao: "ruim", ensinamento: "Ignorar o digital é perder os próximos 3 anos de captação de clientes mais jovens. Cada mês sem presença digital é participação cedida para quem já está presente." }
    ]
  },

  { title: "A Loja com Pior Resultado",
    description: "A loja do Centro tem resultado negativo há 8 meses. A Raia Drogasil abriu a 200m há 6 meses. Aluguel vence em 90 dias — R$18k/mês. A loja ainda tem 40 clientes crônicos fiéis. O gerente tem 14 anos de empresa.",
    tags: ["varejo"],
    choices: [
      { text: "Não renovar o aluguel e migrar os 40 clientes crônicos para a loja mais próxima com suporte do farmacêutico", risco: "medio", gestorEffects: { reputacaoInterna: -1 }, effects: { financeiro: +4, margem: +3, rh: -2, clientes: -2 }, avaliacao: "boa", ensinamento: "Manter loja cronicamente deficitária por lealdade ao gerente é R$216k/ano de prejuízo. Migração cuidadosa dos crônicos minimiza o churn." },
      { text: "Renegociar o aluguel para R$10k e reformular a loja para especialização em manipulação", risco: "medio", effects: { financeiro: +2, margem: +2, clientes: +2, marca: +3 }, avaliacao: "boa", ensinamento: "Manipulação é o segmento que as redes nacionais não replicam competitivamente. Loja especializada cria moat real e atrai prescrições médicas com ticket muito superior." },
      { text: "Dar mais 3 meses com meta de reversão — se não atingir breakeven, fechar", risco: "medio", effects: { financeiro: -2, processos: -1, margem: -2 }, avaliacao: "ruim", ensinamento: "Mais 3 meses sem mudança estrutural são mais 3 meses de prejuízo. A causa do déficit é a concorrência do Raia a 200m — nenhuma meta muda essa realidade geográfica." },
      { text: "Converter a loja em ponto de retirada de pedidos online — custo menor, mantém o endereço", risco: "baixo", effects: { digital: +2, financeiro: +2, margem: +1, rh: -2 }, avaliacao: "media", ensinamento: "Dark store para delivery é viável — mas requer volume digital que ainda não existe. A conversão pode ser prematura sem a base digital construída." }
    ]
  },

  { title: "O Programa de Fidelidade dos Grandes",
    description: "A Raia lançou o Programa Fidelidade Sempre — 10% de desconto em crônicos por R$9,90/mês. Em 2 semanas, 800 clientes da sua base se cadastraram. Você não tem programa de fidelidade digital.",
    tags: ["varejo"],
    choices: [
      { text: "Lançar programa de fidelidade digital em 60 dias com benefícios focados em atendimento, não apenas desconto", risco: "medio", effects: { digital: +3, clientes: +4, marca: +3, financeiro: -3, margem: -1 }, avaliacao: "boa", ensinamento: "Fidelidade em farmácia regional vai além do desconto: consulta prioritária, lembretes de medicação, entrega para crônicos. Benefícios de serviço são mais difíceis de replicar do que pontos." },
      { text: "Usar o WhatsApp como fidelidade manual — farmacêutico avisa quando o medicamento do paciente chega", risco: "baixo", effects: { clientes: +3, marca: +2, digital: +1, rh: -1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Farmacêutico que avisa que o medicamento chegou é um programa de fidelidade mais eficiente do que qualquer app. Relacionamento personalizado é o que as redes não conseguem escalar." },
      { text: "Criar desconto linear de 8% em crônicos para todos os clientes cadastrados", risco: "alto", effects: { clientes: +3, margem: -4, financeiro: -3 }, avaliacao: "ruim", ensinamento: "Desconto permanente em crônicos é o caminho mais rápido para destruir margem farmacêutica. Com custo de mercadoria similar ao da Raia, o desconto vai direto do lucro." },
      { text: "Ignorar o programa dos concorrentes — quem paga por serviço não troca por desconto", risco: "medio", effects: { marca: +2, clientes: -2, digital: -1 }, avaliacao: "media", ensinamento: "Nem todos que se cadastraram vão migrar. Mas ignorar completamente cria percepção de que a empresa não está reagindo — e isso acelera a migração dos clientes indecisos." }
    ]
  },

  { title: "A Parceria com Planos de Saúde",
    description: "Uma operadora regional com 120 mil beneficiários quer parceria: suas farmácias entram na rede credenciada com desconto de 25% nos medicamentos do rol ANS. Pagamento em 45 dias, volume mínimo de R$400k/mês. A margem por transação cai 8 pontos.",
    tags: ["varejo"],
    choices: [
      { text: "Aceitar com limite: apenas as 12 lojas com melhor fluxo de caixa para suportar o prazo de 45 dias", risco: "medio", effects: { clientes: +4, margem: -2, financeiro: +2, processos: +2, marca: +2 }, avaliacao: "boa", ensinamento: "Entrar com as lojas mais saudáveis primeiro protege o caixa e permite aprender o processo antes de escalar. O volume de 120k beneficiários justifica o desconto." },
      { text: "Negociar prazo de 30 dias e desconto de 20% antes de assinar", risco: "medio", effects: { clientes: +3, margem: -1, financeiro: +1, processos: +1, marca: +2 }, avaliacao: "boa", ensinamento: "Condições de parceria de plano sempre têm margem de negociação. 10 pontos de desconto a menos e 15 dias a menos fazem diferença enorme no fluxo de caixa." },
      { text: "Aceitar para todas as 24 lojas — volume de R$400k/mês justifica qualquer pressão de caixa", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +1 }, effects: { clientes: +5, margem: -4, financeiro: -3, processos: -2 }, avaliacao: "ruim", ensinamento: "45 dias de prazo em 24 lojas com margem pressionada pode estrangular o fluxo antes do volume compensar. Parceria de plano precisa de capital de giro." },
      { text: "Recusar — a margem de 8 pontos a menos torna a operação inviável", risco: "medio", effects: { clientes: -2, marca: -1 }, avaliacao: "media", ensinamento: "Rede sem credenciamento em planos perde sistematicamente pacientes com cobertura — um mercado crescente. Recusar pode ser correto se a margem está no limite absoluto." }
    ]
  },

  { title: "A Rede Nacional Baixa o Preço nos Crônicos",
    description: "A Raia anunciou campanha regional: genéricos e similares em crônicos com desconto de até 32% por 60 dias. Objetivo: capturar a base de pacientes crônicos. Sua gerente estima que 20% dos 94k clientes cadastrados podem migrar nos próximos 30 dias.",
    tags: ["varejo"],
    choices: [
      { text: "Campanha de contra-ataque: 'Aqui você tem farmacêutico de confiança, não só preço baixo' — eventos de orientação farmacêutica", risco: "baixo", effects: { marca: +4, clientes: +3, rh: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Disputar por serviço onde você tem vantagem é melhor do que disputar por preço onde o concorrente tem escala. Pacientes crônicos com farmacêutico de confiança têm fidelidade alta." },
      { text: "Igualar o desconto de 32% nos 20 medicamentos crônicos mais vendidos", risco: "alto", effects: { clientes: +3, margem: -5, financeiro: -4 }, avaliacao: "ruim", ensinamento: "A Raia pode manter o desconto por 60 dias e depois retirar — você pode ficar preso em guerra de preço que não pode ganhar." },
      { text: "Oferecer desconto apenas para clientes cadastrados com mais de 12 meses — recompensar a fidelidade", risco: "medio", effects: { clientes: +3, margem: -2, financeiro: -1, marca: +3 }, avaliacao: "boa", ensinamento: "Desconto segmentado para fiéis é estratégia diferente de desconto universal. Você recompensa quem escolheu sua farmácia sem abrir para quem está mirando só o preço." },
      { text: "Não reagir — campanha de 60 dias é temporária e crônicos voltam quando acabar", risco: "medio", effects: { clientes: -4, marca: -1 }, avaliacao: "ruim", ensinamento: "Paciente crônico que muda de farmácia durante promoção tem probabilidade baixa de retornar. O farmacêutico da nova farmácia aprende o histórico — cada migração em crônico é perda de longo prazo." }
    ]
  },

  { title: "O Serviço de Farmacêutico Online",
    description: "Uma startup de saúde digital propõe parceria: seus farmacêuticos atendem por videochamada na plataforma deles (20h-23h e fins de semana). A startup paga R$80/hora e envia as receitas para retirada ou delivery nas suas lojas. Volume estimado: 40 atendimentos/semana.",
    tags: ["varejo"],
    choices: [
      { text: "Aceitar com 4 farmacêuticos voluntários pagos por hora — canal de captação sem custo de marketing", risco: "baixo", gestorEffects: { reputacaoInterna: +1 }, effects: { digital: +3, clientes: +3, rh: +2, marca: +3, financeiro: +1 }, avaliacao: "boa", ensinamento: "Farmacêutico online que converte em receita para retirada ou delivery na sua loja é um canal de captação com custo zero de marketing. A startup faz o tráfego — você faz a conversão." },
      { text: "Aceitar apenas como piloto de 90 dias com 2 farmacêuticos antes de expandir", risco: "baixo", effects: { digital: +2, clientes: +2, rh: +1, marca: +2 }, avaliacao: "boa", ensinamento: "Piloto de escala menor reduz o risco operacional e permite avaliar se os atendimentos online realmente convertem em vendas antes de comprometer mais farmacêuticos." },
      { text: "Criar a própria plataforma de teleconsulta farmacêutica — controlar o canal", risco: "alto", gestorEffects: { esgotamento: +1 }, effects: { digital: +2, financeiro: -4, processos: -2 }, avaliacao: "ruim", ensinamento: "Plataforma própria exige desenvolvimento, regulação de tele-farmácia e aquisição de usuários. A startup já resolveu os três — competição interna desperdiça recursos escassos." },
      { text: "Recusar — farmacêutico online pode canibalizar o atendimento presencial", risco: "medio", effects: { digital: -1, clientes: -1 }, avaliacao: "ruim", ensinamento: "Atendimento presencial e digital são complementares. Paciente que consulta online e retira na loja é cliente que você não teria alcançado de outra forma." }
    ]
  },

  { title: "A Crise de Ruptura em Crônicos",
    description: "Falha no sistema causou ruptura simultânea em 8 medicamentos crônicos nas lojas da região norte por 5 dias. 340 clientes afetados. 67 compraram no Raia, 43 no Pague Menos. Vinte e dois já sinalizaram que vão continuar no concorrente. Cada crônico representa R$1.100/ano.",
    tags: ["varejo"],
    choices: [
      { text: "Ligar para os 22 clientes que sinalizaram migração com o farmacêutico pessoalmente", risco: "baixo", gestorEffects: { reputacaoInterna: +1 }, effects: { clientes: +4, marca: +3, rh: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "22 ligações que podem recuperar R$24k/ano em receita recorrente é o melhor ROI possível. Paciente crônico que conhece o farmacêutico pelo nome responde diferente de qualquer campanha." },
      { text: "Criar alerta automático de stock-out para farmacêuticos pedirem antes de zerar o estoque", risco: "baixo", effects: { processos: +4, estoque: +3, clientes: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Alerta baseado na velocidade de venda elimina 80% das rupturas antes que aconteçam. Prevenção sempre é mais barata que remediação." },
      { text: "Criar estoque de segurança de 30 dias para os 50 medicamentos crônicos mais vendidos", risco: "medio", effects: { estoque: +4, clientes: +2, financeiro: -3, processos: +2 }, avaliacao: "boa", ensinamento: "A ruptura em crônicos é tão cara em fidelização que o custo do estoque extra raramente supera o custo do cliente perdido." },
      { text: "Oferecer desconto de 15% para os 340 afetados na próxima compra como compensação", risco: "medio", effects: { clientes: +3, margem: -2, financeiro: -2, marca: +1 }, avaliacao: "media", ensinamento: "Desconto de compensação funciona melhor para clientes que ainda não foram ao concorrente. Para quem já foi e gostou, o desconto pode não ser suficiente para reverter." }
    ]
  },

  { title: "A Especialização que Define o Futuro",
    description: "O board pede uma decisão estratégica: três caminhos possíveis — manipulação farmacêutica (ticket 3x maior, redes não atuam), farmácia clínica para crônicos (triagem e acompanhamento farmacoterapêutico) ou transformação digital completa com delivery prioritário.",
    tags: ["varejo"],
    choices: [
      { text: "Manipulação: converter 6 lojas estratégicas em farmácias de manipulação com laboratório próprio", risco: "medio", effects: { margem: +5, marca: +4, clientes: +3, financeiro: -4, processos: +2 }, avaliacao: "boa", ensinamento: "Farmácia de manipulação é o segmento mais protegido contra redes. Ticket médio de R$280 vs R$81 da rede convencional — e nenhuma grande rede opera competitivamente nesse espaço." },
      { text: "Farmácia clínica: acompanhamento farmacoterapêutico para crônicos em parceria com médicos da região", risco: "medio", effects: { marca: +5, clientes: +4, rh: +3, financeiro: -3, margem: +2 }, avaliacao: "boa", ensinamento: "Farmacêutico clínico que acompanha o paciente cria vínculo de saúde sem preço. Pacientes que veem a farmácia como parceira de saúde têm fidelidade absoluta." },
      { text: "Digital-first: transformar as 24 lojas em hubs de delivery com 1 hora de entrega e app próprio", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { digital: +5, clientes: +2, financeiro: -5, processos: -2 }, avaliacao: "media", ensinamento: "Delivery em 1 hora como diferencial exige operação logística que as 24 lojas não têm e app com base de usuários suficiente. As redes nacionais já estão mais avançadas nesse caminho." },
      { text: "Manter o modelo atual com execução melhorada — fazer tudo mais bem feito sem especializar", risco: "medio", effects: { processos: +2, marca: +1 }, avaliacao: "ruim", ensinamento: "Em mercado com concorrentes de escala nacional, 'fazer mais bem feito' sem diferencial claro é perder participação em câmera lenta." }
    ]
  },

  { title: "A Fusão com Rede Regional Menor",
    description: "Uma rede concorrente com 11 farmácias em cidades onde você não atua propõe fusão. Resultado: 35 lojas, poder de negociação 12% melhor com distribuidoras. Problema: a rede menor tem dívida de R$3,2M e 3 lojas deficitárias que você precisaria assumir.",
    tags: ["varejo"],
    choices: [
      { text: "Propor compra apenas das 8 lojas lucrativas — não assumir a dívida nem as deficitárias", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { financeiro: -3, clientes: +3, margem: +3, processos: +2, marca: +2 }, avaliacao: "boa", ensinamento: "Aquisição seletiva de ativos sem a dívida do vendedor é a forma mais inteligente de crescer. As 8 lojas lucrativas adicionam escala sem os problemas que fizeram a outra rede vender." },
      { text: "Propor aliança de compras conjunta sem fusão societária — capturar a escala sem o risco", risco: "baixo", effects: { financeiro: 0, margem: +2, processos: +2 }, avaliacao: "boa", ensinamento: "Consórcio de compras captura o benefício de escala na negociação com distribuidoras sem os riscos de integração de uma fusão." },
      { text: "Aceitar a fusão completa — 35 lojas criam poder de barganha que nenhuma das duas tem separada", risco: "alto", gestorEffects: { capitalPolitico: +2, esgotamento: +2 }, effects: { financeiro: -5, clientes: +3, margem: +1, processos: -4, rh: -2 }, avaliacao: "ruim", ensinamento: "Assumir R$3,2M de dívida mais 3 lojas deficitárias em momento de margem pressionada é dobrar um problema. A integração de culturas pode demorar 3 anos." },
      { text: "Comprar as 11 lojas integralmente e usar 12 meses para sanear as deficitárias", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +3 }, effects: { financeiro: -6, clientes: +3, margem: -2, processos: -4 }, avaliacao: "ruim", ensinamento: "Sanear 3 lojas deficitárias enquanto gere 8 novas e as 24 originais é sobrecarga operacional que raramente termina bem." }
    ]
  },

  { title: "O Medicamento Manipulado Como Âncora",
    description: "O diretor médico de uma clínica de endocrinologia com 1.800 pacientes quer parceria exclusiva de manipulação. Volume potencial: R$180k/mês. Em troca, quer 18% de desconto e uma salinha de atendimento farmacêutico dentro da clínica. Investimento: R$280k em laboratório.",
    tags: ["varejo"],
    choices: [
      { text: "Aceitar e abrir o laboratório — R$180k/mês com margem de 55% paga o investimento em 3 meses", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { margem: +5, clientes: +4, marca: +4, financeiro: -3, processos: +3 }, avaliacao: "boa", ensinamento: "Parceria com prescriptor de alto volume é o modelo de crescimento mais eficiente em manipulação. O barreira de entrada criada por prescrições exclusivas é real." },
      { text: "Aceitar apenas a salinha — sem o laboratório, terceirize a manipulação com farmácia parceira", risco: "baixo", effects: { clientes: +3, marca: +3, margem: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Terceirizar enquanto controla o relacionamento é estratégia de baixo risco. Quando o volume justificar, você abre o laboratório com demanda garantida." },
      { text: "Negociar para reduzir o desconto para 12% — a margem de manipulação não suporta 18%", risco: "medio", effects: { clientes: +2, marca: +2, margem: +3, financeiro: -2 }, avaliacao: "boa", ensinamento: "Desconto de 18% em manipulação comprime a margem que é o principal argumento do negócio. Negociar é correto — o médico quer o relacionamento tanto quanto o desconto." },
      { text: "Recusar — concentrar 1.800 pacientes em um único médico cria dependência perigosa", risco: "medio", effects: { clientes: -1, marca: -1 }, avaliacao: "ruim", ensinamento: "1.800 pacientes crônicos de manipulação é base que você não construiria em 3 anos organicamente. A dependência pode ser mitigada desenvolvendo outros canais de prescrição em paralelo." }
    ]
  },

  { title: "O Investimento no Digital",
    description: "Um fundo regional quer aportar R$4M para digitalização — mas exige 40% das vendas por canal digital em 18 meses (hoje é 0%) em troca de 15% da empresa. O conselho está dividido sobre a meta e sobre ceder participação.",
    tags: ["varejo"],
    choices: [
      { text: "Aceitar com meta renegociada: 20% das vendas online em 18 meses, não 40%", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { digital: +5, financeiro: +4, processos: +2, clientes: +2, marca: +2 }, avaliacao: "boa", ensinamento: "Capital para digitalização com meta negociada é melhor do que com meta inatingível. 40% digital em 18 meses para rede sem presença digital é irreal — metas assim criam conflito com investidores." },
      { text: "Aceitar apenas R$2M em troca de 8% — menos capital, menos pressão, menos diluição", risco: "baixo", effects: { digital: +3, financeiro: +2, processos: +1, clientes: +1 }, avaliacao: "boa", ensinamento: "Capital menor com menos diluição e meta razoável pode ser o melhor deal. R$2M para delivery + fidelidade digital entrega impacto real sem comprometer a identidade farmacêutica." },
      { text: "Recusar e digitalizar com recursos próprios — sem pressão de investidor", risco: "medio", effects: { digital: +2, financeiro: -2, processos: +1 }, avaliacao: "media", ensinamento: "Digitalização própria é mais lenta mas preserva o controle. Com margem pressionada, o custo de não ter capital externo pode ser maior do que ceder 15%." },
      { text: "Aceitar as condições integralmente — 40% digital em 18 meses mobiliza o time", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { digital: +4, financeiro: +3, processos: -3, rh: -2 }, avaliacao: "ruim", ensinamento: "Meta de 40% digital em 18 meses partindo do zero distorce toda a operação. A urgência pode comprometer o atendimento presencial que é o principal diferencial da rede." }
    ]
  },

  { title: "O Futuro da Farmácia Regional",
    description: "Você atravessou um ciclo intenso de transformação. A rede está mais sólida, com posicionamento mais claro e novas alavancas de crescimento. O board pede a visão para os próximos 3 anos.",
    tags: ["varejo"],
    choices: [
      { text: "Farmácia de saúde integral: manipulação + farmácia clínica + digital em um modelo integrado único na região", effects: { margem: +5, marca: +5, clientes: +4, rh: +3, digital: +3, financeiro: +4 }, avaliacao: "boa", ensinamento: "O futuro das farmácias regionais não é competir com as redes em volume — é ser a referência de saúde da comunidade. Esse ecossistema não é replicável por nenhuma rede nacional localmente." },
      { text: "Expansão regional focada: 12 lojas de excelência em vez de 24 com desempenho variado", effects: { margem: +4, financeiro: +5, processos: +4, marca: +3, rh: +2 }, avaliacao: "boa", ensinamento: "Menos lojas com mais qualidade é estratégia válida quando a dispersão dilui a capacidade de manter o padrão que diferencia a rede." },
      { text: "Franquia regional: transformar o modelo em franquia para farmacêuticos independentes da região", requisitos: { indicadorMinimo: { processos: 8, marca: 12 } }, effects: { financeiro: +5, marca: +4, processos: +3, clientes: +3 }, avaliacao: "boa", ensinamento: "Franquear para farmacêuticos locais multiplica a presença sem custo de propriedade direta. O franchisee tem o incentivo de dono e o conhecimento da comunidade que as redes não replicam." },
      { text: "Vender para rede nacional com cláusula de manutenção de marca regional por 3 anos", effects: { financeiro: +8, clientes: +2, rh: -3, marca: -4, margem: -2 }, avaliacao: "media", ensinamento: "Venda para rede nacional resolve o financeiro — mas 'manutenção de marca por 3 anos' raramente sobrevive à integração na cultura da compradora. É solução de curto prazo para o acionista." }
    ]
  }

]
,
/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [2] · Atacarejo Regional · Autosserviço
   Contexto: 7 lojas (era 2), 980 funcionários, R$420M receita,
   3 lojas abaixo do breakeven, dívida 2,8x EBITDA, gestão
   sobrecarregada, perdas subindo de 1,4% para 2,9%.

   INDICADORES: financeiro:6, rh:7, clientes:8, processos:5,
                margem:5, estoque:7, marca:8, digital:4

   ATENÇÃO: financeiro (6) e margem (5) sob pressão da dívida.
   processos (5) baixo reflete gestão descentralizada.
   margem<=4 drena financeiro automaticamente.
══════════════════════════════════════════════════════════════════ */

[

  {
    title: "O Peso da Expansão Rápida",
    description: "O CFO apresenta o balanço: dívida de R$38M (2,8x EBITDA), três lojas consumindo R$420k/mês a mais do que geram, perdas por quebra e furto em R$12M/ano (2,9% da receita). Você foi rápido demais — e o crescimento cobrou a conta. Por onde começa o diagnóstico?",
    tags: ["varejo"],
    choices: [
      { text: "Fazer auditoria completa das 3 lojas deficitárias — entender a causa antes de agir", risco: "baixo", effects: { processos: +3, financeiro: +1, margem: +1 }, avaliacao: "boa", ensinamento: "Diagnóstico granular por loja é o primeiro passo de qualquer turnaround. Sem entender se o déficit é estrutural (localização, concorrência) ou operacional (gestão, mix), qualquer decisão é arriscada." },
      { text: "Fechar as 3 lojas deficitárias imediatamente para parar o sangramento", risco: "alto", gestorEffects: { reputacaoInterna: -2, capitalPolitico: +1 }, effects: { financeiro: +4, rh: -5, clientes: -3, marca: -2 }, avaliacao: "ruim", ensinamento: "Fechar sem diagnóstico pode eliminar lojas que teriam reversão viável com ajustes operacionais. Além disso, o custo humano e de imagem de fechar 3 lojas de uma vez é alto — e permanente." },
      { text: "Contratar gerente de turnaround especializado em varejo alimentar para liderar o processo", risco: "medio", effects: { processos: +3, financeiro: -2, rh: +1 }, avaliacao: "boa", ensinamento: "Um especialista em turnaround de varejo traz metodologia e benchmarks que o time interno raramente tem. O custo da contratação é pequeno frente às perdas mensais das 3 lojas." },
      { text: "Renegociar a dívida com o banco antes de qualquer outra decisão — o problema raiz é financeiro", risco: "medio", effects: { financeiro: +3, processos: -1, margem: +1 }, avaliacao: "media", ensinamento: "Renegociar dívida estende o runway mas não resolve as lojas deficitárias. Sem mudança operacional, o problema volta em 6 meses com a dívida renegociada." }
    ]
  },

  {
    title: "O Gerente Que Não Escala",
    description: "Com 7 lojas, o modelo de gestão que funcionava com 2 está quebrando. Cada gerente de loja toma decisões de compra, precificação e promoção de forma independente. O resultado: mix de produtos diferente em cada loja, preços inconsistentes e negociações isoladas com fornecedores que custam R$3M/ano a mais em custo de mercadoria.",
    tags: ["varejo"],
    choices: [
      { text: "Centralizar as compras e precificação — criar uma estrutura de trade marketing para todas as lojas", risco: "medio", effects: { processos: +5, margem: +3, financeiro: +2, rh: -1 }, avaliacao: "boa", ensinamento: "Centralização de compras é o maior alavanca financeiro disponível. R$3M em custo de mercadoria recuperados é mais impactante do que qualquer promoção de vendas." },
      { text: "Contratar 3 supervisores regionais para coordenar as lojas sem tirar a autonomia dos gerentes", risco: "medio", effects: { processos: +3, rh: +1, financeiro: -2 }, avaliacao: "media", ensinamento: "Supervisores regionais melhoram a coordenação mas não eliminam a ineficiência de negociações descentralizadas. É uma evolução parcial." },
      { text: "Manter a autonomia dos gerentes — eles conhecem o cliente local melhor do que qualquer estrutura central", risco: "medio", effects: { processos: -2, margem: -2, financeiro: -1, rh: +2 }, avaliacao: "ruim", ensinamento: "Autonomia local tem valor no atendimento — não na negociação com fornecedores. Cada gerente comprando separado paga preço de pequeno varejista em um negócio que tem volume de rede." },
      { text: "Implementar sistema ERP integrado para dar visibilidade sem retirar autonomia decisória local", risco: "baixo", effects: { processos: +4, estoque: +2, financeiro: -3, margem: +1 }, avaliacao: "boa", ensinamento: "ERP não centraliza decisões — centraliza informação. Gerentes com dados em tempo real tomam decisões melhores do que gerentes no escuro. Visibilidade é o primeiro passo para a coordenação." }
    ]
  },

  {
    title: "A Perda Que Sangra",
    description: "O inventário das 7 lojas revelou R$12M em perdas anuais — 2,9% da receita. A média nacional do setor de atacarejo é 1,6%. A distribuição: 40% é furto externo, 35% é quebra operacional por manuseio, 25% é furto interno. Três lojas têm índice acima de 4%. A cultura do time é de tolerância implícita — 'sempre foi assim'.",
    tags: ["varejo"],
    choices: [
      { text: "Implementar câmeras, portais de detecção e auditoria de saídas nas 3 lojas com maior índice de perda", risco: "medio", effects: { processos: +4, processos: +3, financeiro: +3, margem: +2, rh: -1 }, avaliacao: "boa", ensinamento: "Tecnologia de prevenção de perdas tem ROI medido em semanas em atacarejo. Cada 0,5% de redução de perda em R$420M de receita representa R$2,1M — o custo das câmeras é recuperado no primeiro mês." },
      { text: "Contratar empresa especializada em prevenção de perdas para auditoria e treinamento de toda a rede", risco: "medio", effects: { processos: +3, financeiro: -2, margem: +2, estoque: +1 }, avaliacao: "boa", ensinamento: "Especialistas em prevenção de perdas trazem metodologia de combate ao furto interno e externo que o time interno raramente desenvolve sozinho. O custo da consultoria é marginal frente ao problema." },
      { text: "Demitir os gerentes das 3 lojas com maior índice e contratar novos com perfil mais rigoroso", risco: "alto", gestorEffects: { reputacaoInterna: -2, capitalPolitico: 0 }, effects: { rh: -4, processos: +1, margem: +1, financeiro: -1 }, avaliacao: "ruim", ensinamento: "Demitir gerentes por índice de perda sem investigar as causas pode punir quem está em localização de alto risco. Demissão sem processo gera clima de medo que normalmente aumenta o furto interno." },
      { text: "Criar programa de bônus para lojas que reduzirem o índice de perda abaixo de 1,8% em 6 meses", risco: "baixo", effects: { processos: +3, margem: +2, rh: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Incentivo financeiro alinhado à meta correta muda comportamento rapidamente. Gerente que ganha bônus por reduzir perda tem interesse pessoal em cada real recuperado." }
    ]
  },

  {
    title: "O Assaí Chegou na Cidade",
    description: "O Assaí Atacadista abriu uma loja de 8.500m² a 3 km da sua unidade principal — a maior e mais rentável da rede. Nos primeiros 30 dias, o volume de clientes da sua loja principal caiu 18%. O Assaí tem escala nacional, 4.000m² a mais de área, e preços que você não consegue igualar com sua estrutura de custo atual.",
    tags: ["varejo"],
    choices: [
      { text: "Diferenciar pelo serviço ao pequeno comerciante: fracionamento, crédito e entrega que o Assaí não oferece", risco: "baixo", effects: { clientes: +4, marca: +3, processos: +2, margem: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "O pequeno comerciante precisa de mais do que preço baixo — precisa de crédito, fracionamento de embalagens e prazo de entrega. São serviços que o Assaí com modelo padronizado não consegue oferecer de forma competitiva." },
      { text: "Reduzir preços nos 50 itens mais comparados para não perder a percepção de preço competitivo", risco: "alto", effects: { clientes: +2, margem: -4, financeiro: -3 }, avaliacao: "ruim", ensinamento: "Guerra de preços com Assaí em margem já pressionada é caminho para o prejuízo. O Assaí tem poder de compra nacional que garante custo de mercadoria 20% menor — cada centavo de desconto é tirado direto da margem restante." },
      { text: "Analisar o mix de clientes da loja principal e focar em categorias onde o Assaí não compete", risco: "medio", effects: { margem: +2, processos: +2, clientes: +1, estoque: +2 }, avaliacao: "boa", ensinamento: "Especialização de mix em categorias subrepresentadas pelo concorrente é a estratégia correta para coexistência. O Assaí força você a descobrir onde você é verdadeiramente bom." },
      { text: "Investir na localização: reformar e ampliar a loja principal para competir em estrutura física", risco: "alto", gestorEffects: { esgotamento: +2, capitalPolitico: -1 }, effects: { financeiro: -5, clientes: +2, marca: +2 }, avaliacao: "ruim", ensinamento: "Ampliar loja para competir com Assaí em tamanho com a dívida atual é acumular investimento de capital em uma batalha onde o adversário tem vantagem estrutural permanente de escala." }
    ]
  },

  {
    title: "A Dívida que Aperta o Caixa",
    description: "O banco credor enviou carta: com o EBITDA em queda por 3 trimestres seguidos, o covenant financeiro (dívida/EBITDA máximo de 2,5x) foi violado. O banco pode exigir antecipação de R$15M em 90 dias se não houver renegociação. O custo financeiro atual consome R$560k/mês em juros. Você tem 30 dias para apresentar um plano.",
    tags: ["varejo"],
    choices: [
      { text: "Apresentar ao banco um plano de desinvestimento das 3 lojas deficitárias como garantia de geração de caixa", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { financeiro: +4, processos: +2, margem: +2, rh: -2, clientes: -1 }, avaliacao: "boa", ensinamento: "Bancos preferem devedores com plano claro a devedores em default. Apresentar um plano de desinvestimento com cronograma e geração de caixa projetada transforma a conversa de cobrança em parceria de reestruturação." },
      { text: "Vender ativos imobilizados (terrenos próprios de 2 lojas) para quitar parte da dívida", risco: "medio", effects: { financeiro: +6, processos: -1, margem: +2, estoque: 0 }, avaliacao: "boa", ensinamento: "Sale-and-leaseback de imóveis é um instrumento clássico de gestão de crise financeira. Converte ativo imobilizado em caixa sem perder a operação — o aluguel substitui o custo de capital que está pesando no fluxo." },
      { text: "Buscar novo investidor para capitalização e quitação parcial da dívida", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { financeiro: +5, processos: -1, rh: 0, clientes: 0 }, avaliacao: "media", ensinamento: "Capitalização resolve o problema imediato mas dilui o controle acionário em um momento de crise — quando o valuation é mais baixo. O custo do capital captado em crise é alto." },
      { text: "Ignorar o covenant e continuar operando normalmente — bancos raramente executam a antecipação imediatamente", risco: "alto", gestorEffects: { capitalPolitico: -2, esgotamento: +1 }, effects: { financeiro: -4, processos: -2, clientes: -1, marca: -2 }, avaliacao: "ruim", ensinamento: "Ignorar covenant violado é apostar que o banco vai ser passivo. Bancos que notificam formalmente geralmente são sérios. O risco de antecipação forçada de R$15M pode quebrar a empresa." }
    ]
  },

  {
    title: "O Estoque de Perecíveis Fora de Controle",
    description: "O relatório de perdas de perecíveis chega: R$2,1M em hortifrúti, carnes e laticínios descartados no último trimestre por vencimento e má conservação. A média do setor é R$600k para o mesmo volume. As 3 lojas novas — ainda sem volume suficiente — têm o pior índice. A central de compras compra o mesmo volume para todas as lojas independente do giro real.",
    tags: ["varejo"],
    choices: [
      { text: "Implementar sistema de compra por loja baseado no giro real dos últimos 30 dias para cada categoria de perecível", risco: "medio", effects: { estoque: +5, margem: +3, processos: +3, financeiro: +2 }, avaliacao: "boa", ensinamento: "Compra de perecível por giro real elimina o principal driver de perda. Loja nova com volume menor que a loja madura não pode receber o mesmo pedido semanal — a diferença vai para o lixo." },
      { text: "Contratar gerentes de perecíveis especializados para as 3 lojas novas", risco: "medio", effects: { estoque: +3, financeiro: -2, rh: +1, margem: +1 }, avaliacao: "media", ensinamento: "Especialização em perecíveis melhora o gerenciamento — mas sem o sistema de compra ajustado, o gerente especializado ainda vai receber volume errado para gerenciar." },
      { text: "Reduzir o mix de perecíveis nas lojas novas até que o volume justifique a variedade atual", risco: "baixo", effects: { estoque: +4, margem: +3, clientes: -2, processos: +2 }, avaliacao: "boa", ensinamento: "Mix reduzido de perecível em loja nova é prática correta de gestão de risco. Melhor ter 60 SKUs de perecível com ruptura zero do que 120 SKUs com 30% de descarte." },
      { text: "Criar sistema de descontos progressivos para perecíveis próximos ao vencimento em todas as lojas", risco: "baixo", effects: { estoque: +2, clientes: +2, margem: -1, financeiro: +1 }, avaliacao: "media", ensinamento: "Desconto em perecível próximo ao vencimento é melhor do que descarte — mas é sintoma, não cura. O problema raiz é o volume de compra errado, não a falta de mecanismo de liquidação." }
    ]
  },

  {
    title: "A Loja Que Não Decola",
    description: "A loja de Ribeirão Vermelho, inaugurada há 14 meses, ainda opera 28% abaixo do breakeven. O estudo de viabilidade previa breakeven em 8 meses. O problema identificado: a cidade tem 45k habitantes — metade do público mínimo que o modelo de atacarejo requer para ser viável. O aluguel de R$32k/mês e os R$8M de investimento em estrutura foram realizados.",
    tags: ["varejo"],
    choices: [
      { text: "Converter a loja para atacado de venda direta para pequenos comerciantes — mudar o modelo, não fechar", risco: "medio", effects: { clientes: +2, margem: +2, processos: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Loja em cidade pequena pode ser viável com modelo B2B puro — venda para mercearias, restaurantes e bares locais que precisam de volume sem fazer 80km para o atacado mais próximo." },
      { text: "Fechar a loja e negociar a saída do aluguel com indenização para o proprietário", risco: "alto", gestorEffects: { reputacaoInterna: -1, capitalPolitico: +1 }, effects: { financeiro: +3, rh: -3, clientes: -1, margem: +2 }, avaliacao: "boa", ensinamento: "Parar de sangrar R$420k/mês de prejuízo é uma decisão correta mesmo com o custo de saída. A alternativa é continuar queimando caixa em um mercado sem tamanho suficiente para o modelo." },
      { text: "Dar mais 12 meses e dobrar o investimento em marketing local para acelerar o reconhecimento de marca", risco: "alto", effects: { financeiro: -4, clientes: +1, marca: +1, margem: -2 }, avaliacao: "ruim", ensinamento: "Marketing não cria clientes onde não existem. Uma cidade de 45k habitantes tem demanda física limitada — mais marketing não multiplica a população que pode sustentar um atacarejo." },
      { text: "Subarrendar parte da loja para outros varejistas complementares — reduzir o custo de ocupação", risco: "baixo", effects: { financeiro: +2, margem: +2, processos: -1 }, avaliacao: "media", ensinamento: "Subarrendamento de espaço excedente é uma solução criativa de curto prazo que reduz o custo de ocupação sem fechar a loja. Funciona melhor quando há demanda local por espaço comercial." }
    ]
  },

  {
    title: "O Mix do Pequeno Comerciante",
    description: "O estudo de clientes revela: 34% da receita vem de pequenos comerciantes (mercearias, bares, restaurantes). Esse segmento tem ticket médio 4x maior e frequência 2x menor que o consumidor final. Mas as lojas foram desenhadas para o consumidor final — o layout, o fracionamento e os serviços são todos voltados para quem compra para casa, não para revender.",
    tags: ["varejo"],
    choices: [
      { text: "Criar uma área exclusiva B2B em cada loja: embalagem fechada, preço de atacado, crédito e entrega para comerciantes", risco: "medio", effects: { clientes: +4, margem: +3, processos: +2, financeiro: -2 }, avaliacao: "boa", ensinamento: "Segregar o atendimento B2B do B2C é padrão em atacarejo bem gerido. O comerciante não quer esperar na fila do consumidor final e o consumidor final não quer ver o carrinho do restaurante ocupando espaço." },
      { text: "Criar um horário exclusivo para comerciantes: das 7h às 9h sem concorrência com o consumidor final", risco: "baixo", effects: { clientes: +3, processos: +2, rh: -1, margem: +1 }, avaliacao: "boa", ensinamento: "Horário preferencial para B2B é a solução de menor investimento e maior impacto na experiência do comerciante. Resolve o atrito sem reformar o layout." },
      { text: "Lançar um aplicativo de pedidos para comerciantes com entrega no dia seguinte", risco: "alto", gestorEffects: { esgotamento: +1 }, effects: { digital: +3, clientes: +3, financeiro: -4, processos: -2 }, avaliacao: "media", ensinamento: "Delivery B2B para pequenos comerciantes tem mercado real — mas exige logística, sistema de pedidos e carteira de crédito. Com os problemas operacionais atuais, adicionar um novo canal pode ser distração." },
      { text: "Focar no consumidor final — o B2B de pequenos comerciantes tem margem melhor mas escala menor", risco: "medio", effects: { clientes: +1, margem: -1, processos: +1 }, avaliacao: "ruim", ensinamento: "Ignorar o segmento que representa 34% da receita com ticket 4x maior é uma escolha estratégica difícil de justificar. Pequenos comerciantes são a base mais resistente à entrada do Assaí." }
    ]
  },

  {
    title: "A Tecnologia de Prevenção de Perdas",
    description: "O orçamento de tecnologia para o próximo semestre precisa ser decidido. Duas opções competem pelos mesmos recursos: sistema de câmeras inteligentes com IA para detecção de furto (R$1,8M para as 7 lojas, ROI estimado de 8 meses) ou sistema ERP integrado com compras, estoque e financeiro (R$2,2M, ROI de 14 meses). O CFO diz que só tem R$1,5M aprovado para tecnologia.",
    tags: ["varejo"],
    choices: [
      { text: "Priorizar câmeras de IA nas 3 lojas com maior índice de perda — ROI mais rápido, custo menor", risco: "baixo", effects: { processos: +3, financeiro: +3, margem: +2, estoque: +1 }, avaliacao: "boa", ensinamento: "ROI de 8 meses em prevenção de perdas é raramente igualado em qualquer outro investimento de varejo. Começar pelas 3 lojas críticas com R$800k entrega 65% do resultado com 44% do custo total." },
      { text: "Priorizar o ERP — sem gestão integrada, qualquer outra solução é band-aid", risco: "medio", effects: { processos: +5, estoque: +3, financeiro: -2, margem: +1 }, avaliacao: "boa", ensinamento: "ERP integrado é a fundação de qualquer operação de varejo escalável. Sem dados centralizados de compra, estoque e venda por loja, cada decisão operacional é baseada em suposição." },
      { text: "Buscar financiamento adicional de R$700k para implementar os dois sistemas simultaneamente", risco: "alto", gestorEffects: { capitalPolitico: -1, esgotamento: +1 }, effects: { processos: +5, financeiro: -3, margem: +2, estoque: +3 }, avaliacao: "media", ensinamento: "Mais dívida para tecnologia com o covenant já violado e o banco em alerta é uma decisão de risco alto. A tecnologia é necessária — o timing do financiamento precisa ser mais cuidadoso." },
      { text: "Implementar controles manuais de prevenção de perdas e adiar o investimento em tecnologia para o próximo ano", risco: "medio", effects: { processos: -1, financeiro: -1, margem: -1, estoque: -1 }, avaliacao: "ruim", ensinamento: "Controles manuais em 7 lojas com 980 funcionários não são escaláveis. Cada mês sem tecnologia de prevenção de perdas custa em média R$1M — mais do que o investimento adiado." }
    ]
  },

  {
    title: "A Negociação com o Banco",
    description: "O banco aceitou negociar. As opções na mesa: (A) Alongar o prazo da dívida de 5 para 9 anos com taxa 1,8% maior — parcela menor, custo total maior. (B) Carência de 12 meses no principal com pagamento de juros apenas — alivia o caixa agora. (C) Conversão de R$12M de dívida em participação acionária de 8% — banco vira sócio. O CFO recomenda a opção A.",
    tags: ["varejo"],
    choices: [
      { text: "Aceitar a opção A: prazo maior, custo maior, mas sem diluição e sem carência que cria falsa sensação de folga", risco: "baixo", gestorEffects: { capitalPolitico: +1 }, effects: { financeiro: +3, margem: +1, processos: +1 }, avaliacao: "boa", ensinamento: "Alongar o prazo é a opção mais conservadora e mais previsível. O custo financeiro total é maior, mas a previsibilidade do fluxo de caixa permite planejar melhor a operação." },
      { text: "Aceitar a opção B: carência de 12 meses libera R$560k/mês para investir na recuperação operacional", risco: "medio", effects: { financeiro: +4, margem: +2, processos: +2, estoque: +1 }, avaliacao: "boa", ensinamento: "Carência no principal é a opção mais inteligente quando os recursos liberados são investidos na correção do problema que gerou a crise. R$560k/mês durante 12 meses é o capital necessário para implementar as mudanças operacionais." },
      { text: "Aceitar a opção C: banco como sócio com 8% elimina R$12M de dívida sem custo de juros futuros", risco: "alto", gestorEffects: { capitalPolitico: +2, esgotamento: +1 }, effects: { financeiro: +5, processos: -1, rh: -1 }, avaliacao: "media", ensinamento: "Banco como sócio muda a dinâmica da empresa. Bancos não são sócios passivos — eles exigem reporting, têm critérios de saída e podem forçar decisões que conflitam com a visão operacional." },
      { text: "Rejeitar todas as opções e buscar outro banco com condições melhores", risco: "alto", gestorEffects: { capitalPolitico: -2 }, effects: { financeiro: -3, processos: -1 }, avaliacao: "ruim", ensinamento: "Rejeitar a negociação com o banco credor sem ter alternativa concreta é arriscar a execução imediata do covenant. Buscar outro banco leva de 60 a 120 dias — tempo que você não tem." }
    ]
  },

  {
    title: "O Crescimento Suspenso",
    description: "O board decidiu: nenhuma nova loja nos próximos 2 anos. O foco é consolidar as 7 existentes. O problema: a equipe que foi contratada para liderar a expansão — 3 gerentes de expansão e 2 consultores de ponto — agora não tem função. Manter custa R$680k/ano. A demissão custa R$420k em indenizações.",
    tags: ["varejo"],
    choices: [
      { text: "Realocar os gerentes de expansão para funções de turnaround nas lojas deficitárias — eles conhecem abertura de loja", risco: "baixo", effects: { processos: +3, rh: +2, financeiro: -1, margem: +1 }, avaliacao: "boa", ensinamento: "Gerentes de expansão que conhecem abertura de loja entendem de layout, mix, operação inicial e captação de clientes — habilidades diretamente transferíveis para turnaround de loja existente." },
      { text: "Desligar os 5 profissionais de expansão — o projeto de crescimento foi encerrado", risco: "medio", gestorEffects: { reputacaoInterna: -1 }, effects: { financeiro: +2, rh: -3, processos: -1 }, avaliacao: "media", ensinamento: "Desligar quando a função desaparece é uma decisão difícil mas legítima. O custo da indenização é menor que o custo de manter profissionais sem função clara por 2 anos." },
      { text: "Manter os gerentes de expansão explorando oportunidades de M&A — comprar lojas de terceiros em vez de abrir", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +1 }, effects: { financeiro: -2, processos: +1, clientes: +1 }, avaliacao: "ruim", ensinamento: "M&A com dívida de 2,8x EBITDA e 3 lojas no prejuízo é prioridade errada. A equipe de expansão sem fundo de aquisição é um custo sem resultado." },
      { text: "Contratar apenas os 2 perfis mais estratégicos e desligar os outros 3 com pacote de recolocação", risco: "baixo", effects: { financeiro: +1, rh: -1, processos: +2 }, avaliacao: "boa", ensinamento: "Manutenção seletiva de talento estratégico é a solução de equilíbrio. Preservar os 2 melhores para a próxima fase de crescimento minimiza o custo humano sem manter capacidade ociosa." }
    ]
  },

  {
    title: "A Proposta do Atacadão",
    description: "O Atacadão (Carrefour) quer adquirir suas 4 melhores lojas por R$85M — um múltiplo de 5,2x EBITDA dessas unidades. As 3 lojas deficitárias e os ativos imobilizados ficam com você. O dinheiro quita a dívida integralmente e sobram R$47M para recomeçar. Mas você perde o coração da rede — as 4 lojas que geram 76% do resultado.",
    tags: ["varejo"],
    choices: [
      { text: "Negociar: vender apenas 2 das 4 melhores lojas por R$42M — quitar metade da dívida e manter o controle operacional", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { financeiro: +5, clientes: -2, margem: +2, processos: +1 }, avaliacao: "boa", ensinamento: "Venda parcial que resolve o passivo sem sacrificar o negócio inteiro é o equilíbrio correto. Ficar com 5 lojas — 2 das melhores e 3 em recuperação — com dívida quitada cria condições para reconstrução." },
      { text: "Aceitar a proposta integralmente — R$47M de sobra permite reconstruir sem o peso da dívida", risco: "alto", gestorEffects: { capitalPolitico: +2, esgotamento: +1 }, effects: { financeiro: +8, clientes: -5, rh: -4, marca: -4, processos: -3 }, avaliacao: "media", ensinamento: "Vender as 4 melhores lojas resolve a dívida mas deixa você com R$47M e 3 lojas deficitárias para recomeçar. A questão é se você consegue construir um novo negócio viável com esse capital partindo de 3 unidades problemáticas." },
      { text: "Recusar e buscar um investidor de private equity para capitalização", risco: "alto", gestorEffects: { capitalPolitico: -1, esgotamento: +2 }, effects: { financeiro: +3, clientes: 0, processos: -1 }, avaliacao: "media", ensinamento: "PE como alternativa ao Atacadão pode funcionar se houver interesse real e timing compatível com a pressão do banco. O risco é que a negociação com PE dura 4-6 meses — tempo que o fluxo de caixa atual talvez não suporte." },
      { text: "Aceitar mas incluir cláusula de recompra: direito de recomprar 2 lojas em 3 anos por múltiplo definido", risco: "medio", effects: { financeiro: +6, clientes: -3, margem: +2, processos: -1 }, avaliacao: "boa", ensinamento: "Cláusula de recompra preserva a opcionalidade de reconstruir o negócio depois de sanear o passivo. Se a recuperação funcionar, você recompra as melhores lojas com a empresa saudável." }
    ]
  },

  {
    title: "A Recuperação das Lojas Deficitárias",
    description: "Com a dívida renegociada ou reduzida, você tem uma janela para recuperar as 3 lojas que ainda estão no prejuízo. O diretor de operações apresenta 3 estratégias distintas para as 3 lojas: fechar a de Ribeirão Vermelho (cidade pequena demais), converter a de Santo André para formato de atacado B2B puro, e reformular a de Campinas com foco em hortifrúti e perecíveis premium.",
    tags: ["varejo"],
    choices: [
      { text: "Executar o plano triplo: fechar Ribeirão, converter Santo André e reformular Campinas simultaneamente", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +3 }, effects: { financeiro: +3, processos: -3, rh: -3, margem: +3, clientes: -1 }, avaliacao: "media", ensinamento: "Três transformações simultâneas em lojas deficitárias sobrecarregam o time de gestão que já está no limite. O risco de execução parcial de todas é maior do que executar uma por vez com excelência." },
      { text: "Priorizar a conversão de Santo André em B2B — menor investimento, maior margem, diferenciação real", risco: "baixo", effects: { margem: +3, clientes: +2, processos: +2, financeiro: +1 }, avaliacao: "boa", ensinamento: "Começar pela conversão mais clara (B2B em Santo André) entrega resultado mais rápido e libera o aprendizado para as próximas. Execução sequencial em turnaround é mais eficaz do que execução paralela com recursos limitados." },
      { text: "Fechar as 3 lojas deficitárias de uma vez e realocar os 340 funcionários para as lojas saudáveis", risco: "alto", gestorEffects: { reputacaoInterna: -3, capitalPolitico: +2 }, effects: { financeiro: +5, rh: -5, clientes: -3, marca: -3, margem: +4 }, avaliacao: "ruim", ensinamento: "Fechar 3 lojas de uma vez com 340 demissões tem impacto humano e de marca que vai além dos números. A comunidade local e o restante do time lembram — e a reputação como empregador sofre por anos." },
      { text: "Testar novos formatos em cada loja deficitária: uma como dark store, uma B2B e uma perecíveis premium — medir e decidir", risco: "medio", effects: { processos: +3, processos: -2, financeiro: -2, clientes: +1 }, avaliacao: "media", ensinamento: "Testar formatos diferentes em paralelo é a abordagem de maior aprendizado — mas de maior custo de execução. Com recursos ainda escassos, testar 3 formatos diferentes pode diluir o resultado de cada um." }
    ]
  },

  {
    title: "O Crescimento Responsável",
    description: "As lojas estabilizadas, a dívida renegociada e os processos melhorados. É hora de definir a estratégia de crescimento para os próximos 3 anos — desta vez, com mais responsabilidade do que na expansão anterior.",
    tags: ["varejo"],
    choices: [
      { text: "Crescimento orgânico disciplinado: máximo de 1 loja por ano, apenas em cidades acima de 80k habitantes com estudo de viabilidade detalhado", effects: { financeiro: +4, processos: +4, margem: +3, rh: +2, clientes: +3 }, avaliacao: "boa", ensinamento: "Crescimento disciplinado com critério de viabilidade claro é a lição aprendida na crise. Uma loja por ano — bem escolhida e bem executada — constrói uma rede saudável. Velocidade sem critério foi o erro que trouxe a crise." },
      { text: "Consolidação total: sem novas lojas, foco 100% em rentabilidade e eficiência das 7 existentes por 3 anos", effects: { margem: +5, financeiro: +5, processos: +5, clientes: +2, rh: +2 }, avaliacao: "boa", ensinamento: "Consolidação total após uma crise de expansão é uma estratégia legítima e poderosa. Três anos de foco em eficiência com as lojas existentes podem dobrar a margem sem o risco de um novo ponto." },
      { text: "Franquia para operadores regionais: crescer sem capital próprio, com o know-how como ativo", requisitos: { indicadorMinimo: { processos: 9, marca: 12 } }, effects: { financeiro: +4, marca: +3, clientes: +4, processos: +2, rh: -1 }, avaliacao: "boa", ensinamento: "Franquia de atacarejo regional permite crescimento de marca sem capital de abertura. O franchisee assume o risco de ponto — você fornece o modelo, o know-how e o poder de compra negociado." },
      { text: "Pivô para B2B puro: transformar toda a rede em atacado exclusivo para pequenos comerciantes e fechar o varejo ao consumidor final", effects: { margem: +4, clientes: -4, financeiro: +2, processos: +3, marca: -3 }, avaliacao: "ruim", ensinamento: "Pivô total para B2B abandona a base de consumidores finais construída em anos e que representa 66% da receita atual. A especialização B2B pode ser um canal a mais — não a substituição do modelo inteiro." }
    ]
  }

]

]; // fim VarejoRounds
