/* ═══════════════════════════════════════════════════════════════════
   BETA · LOGÍSTICA · ROUNDS EXCLUSIVOS
   Sistema de Sorteio:
     Diagnóstico    → 5 candidatas → 3 selecionadas  (R1–R5)
     Pressão        → 5 candidatas → 4 selecionadas  (R6–R10)
     Decisão Crítica→ 5 candidatas → 3 selecionadas  (R11–R15)
   R10 = Gatilho Estratégico → abre a fase Decisão Crítica

   INDICADORES (8 — exclusivos do setor Logística):
     financeiro   💰  Caixa / receita / penalidades contratuais
     sla          📦  Pontualidade / cumprimento de prazo
     frota        🚛  Estado dos veículos / manutenção
     tecnologia   💻  TMS / roteirização / sistemas de rastreio
     rh           👥  Time / rotatividade / engajamento
     processos    ⚙️   Eficiência operacional / fluxos internos
     seguranca    🛡️   Acidentes / compliance / auditoria
     clientes     🤝  Carteira / contratos / retenção

   FASES NARRATIVAS:
     R1–R5   → Diagnóstico: a extensão real da crise se revela
     R6–R10  → Pressão: consequências chegam de fora e de dentro
     R11–R15 → Decisão Crítica: o futuro da operação é definido
═══════════════════════════════════════════════════════════════════ */

const LogisticaRounds = [

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [0] · Last-Mile Delivery — SLA em colapso
   Contexto: 420 entregadores, 8 CDs, faturamento R$52M,
   31% das entregas fora do prazo, cliente que representa 38% da
   receita com cláusula de SLA no contrato, TMS desatualizado,
   rotatividade de 68% ao ano.
══════════════════════════════════════════════════════════════════ */
[

  /* ═══════════════════════════════════════════════════════
     R1 · DIAGNÓSTICO · A Ligação das 7h da Manhã
     Contexto: primeiro dia na gestão.
     O maior cliente liga antes mesmo do expediente começar.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Ligação das 7h da Manhã",
    description: "Seu celular toca às 7h03. É o diretor de operações da GrandeMart — seu maior cliente, responsável por 38% da receita. A voz está tensa: 'Tivemos 17 entregas atrasadas só ontem. Meu contrato prevê multa de 0,5% do faturamento por dia acima de 10% de atraso. Quero uma reunião hoje às 14h com plano de ação.' Você tem até as 9h para se preparar. O que você faz primeiro?",
    tags: ["logistica"],
    fase: "diagnostico",
    choices: [
      {
        text: "Mapear imediatamente os dados reais dos últimos 30 dias de SLA para chegar na reunião com diagnóstico preciso, não promessas vazias",
        risco: "baixo",
        effects: { sla: +3, clientes: +4, processos: +2, financeiro: +1 },
        avaliacao: "boa",
        ensinamento: "Chegar com dados reais a uma reunião de crise transforma a postura defensiva em postura analítica. O cliente não quer desculpas — quer ver que você entende o problema com a mesma profundidade que ele. Diagnóstico honesto antes da promessa é o que separa gestores de operadores."
      },
      {
        text: "Ligar para os coordenadores de rota agora e cobrar uma explicação sobre os atrasos de ontem antes da reunião",
        risco: "medio",
        effects: { rh: -2, processos: +1, sla: +1, clientes: -1 },
        avaliacao: "ruim",
        ensinamento: "Cobrar sem diagnóstico cria defensividade na equipe e gera explicações parciais que vão confundir mais do que esclarecer. Reuniões de crise exigem dados, não depoimentos. A pressão mal direcionada consome energia sem produzir insight."
      },
      {
        text: "Confirmar a reunião e propor apresentar em 5 dias úteis um plano estruturado de recuperação de SLA — hoje só ouvir",
        risco: "baixo",
        effects: { clientes: +3, sla: +1, financeiro: -1, processos: +1 },
        avaliacao: "boa",
        ensinamento: "Gerir expectativas é uma habilidade de liderança. Prometer um plano sólido em 5 dias é melhor do que improvisar hoje. O cliente precisa sentir controle e seriedade — e ouvir primeiro é uma das posturas mais subestimadas em gestão de crise."
      },
      {
        text: "Pedir ao financeiro para calcular o valor máximo de multa que a empresa suportaria antes de comprometer o fluxo de caixa",
        risco: "medio",
        gestorEffects: { capitalPolitico: -1 },
        effects: { financeiro: +2, clientes: -3, sla: -1, processos: -1 },
        avaliacao: "ruim",
        ensinamento: "Calcular a multa tolerável antes de tentar resolver o problema é uma postura reativa que sinaliza conformismo com o descumprimento. Clientes com cláusula de SLA interpretam isso como sinal de que a empresa não prioriza a qualidade — e começam a avaliar alternativas."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R2 · DIAGNÓSTICO · O TMS que Nunca Funcionou Direito
     Contexto: 4 dias de diagnóstico.
     O sistema de roteirização revela um problema estrutural.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O TMS que Nunca Funcionou Direito",
    description: "Após 4 dias de análise, o coordenador de TI apresenta o diagnóstico do sistema de gestão de transporte: o TMS atual tem 7 anos, não integra com GPS em tempo real, gera rotas estáticas que ignoram trânsito e janelas de entrega, e o fornecedor encerrou o suporte em 2022. '60% dos atrasos têm raiz no sistema de roteirização,' ele conclui. 'Mas uma substituição completa leva de 4 a 8 meses.' Como você decide avançar?",
    tags: ["logistica"],
    fase: "diagnostico",
    choices: [
      {
        text: "Contratar um módulo de roteirização dinâmica como camada sobre o TMS atual — solução de 3 semanas que resolve 60% do problema enquanto a substituição é planejada",
        risco: "baixo",
        effects: { tecnologia: +4, sla: +3, processos: +3, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Soluções intermediárias que entregam resultado rápido enquanto a solução definitiva é construída são a base da gestão de crise operacional. Uma camada de roteirização dinâmica pode custar R$15k/mês e reduzir atrasos imediatamente — sem paralisar a operação durante a migração."
      },
      {
        text: "Iniciar imediatamente o processo de substituição completa do TMS — a solução parcial vai gerar dívida técnica operacional",
        risco: "alto",
        effects: { tecnologia: +2, sla: -3, processos: -1, financeiro: -5, clientes: -2 },
        avaliacao: "ruim",
        ensinamento: "Substituição de TMS em operação ativa sem phase-in adequado é um dos riscos mais subestimados em logística. As 4 a 8 meses de transição com sistema instável podem custar mais em multas de SLA e perda de clientes do que o valor total do novo sistema."
      },
      {
        text: "Manter o TMS atual e treinar os coordenadores para compensar manualmente as falhas de roteirização",
        risco: "medio",
        effects: { tecnologia: -1, sla: +1, rh: -3, processos: -2, financeiro: +1 },
        avaliacao: "ruim",
        ensinamento: "Compensar falha de sistema com esforço humano é insustentável e tem custo oculto alto: horas extras, erro humano e esgotamento da equipe. Sistemas de roteirização ruim geram frustração crônica nos operadores que tentam corrigir suas falhas manualmente todos os dias."
      },
      {
        text: "Solicitar proposta de 3 fornecedores de TMS simultâneos e usar a competição para negociar implementação mais rápida e preço menor",
        risco: "baixo",
        effects: { tecnologia: +3, financeiro: +2, processos: +2, sla: +1 },
        avaliacao: "boa",
        ensinamento: "Processo competitivo de seleção de TMS reduz custo e aumenta poder de negociação sobre prazo de implementação. Fornecedores sabem que quem decide rápido tem urgência — e urgência bem gerenciada vira vantagem na negociação de condições contratuais."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R3 · DIAGNÓSTICO · A Reunião dos Coordenadores
     Contexto: 2ª semana. O diagnóstico humano chega.
     A equipe de coordenadores revela o que os dados não mostram.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Reunião dos Coordenadores",
    description: "Você convoca os 8 coordenadores de CD para uma reunião de escuta. O que emerge surpreende: a rotatividade de 68% ao ano entre entregadores criou um gap crítico de experiência nas rotas — entregadores novos levam 40% mais tempo nas mesmas rotas. 'Estamos sempre treinando alguém que vai embora em 3 meses,' diz a coordenadora do CD Leste. 'O salário está abaixo do mercado há 2 anos. A concorrência paga R$300 a mais por mês.' Qual é a sua resposta a esse diagnóstico?",
    tags: ["logistica"],
    fase: "diagnostico",
    choices: [
      {
        text: "Criar um programa de retenção com bônus por permanência: R$200/mês adicionais após 6 meses e R$400/mês após 12 meses na empresa",
        risco: "medio",
        effects: { rh: +5, sla: +3, financeiro: -3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Bônus por permanência é mais eficiente que aumento de salário-base para reduzir rotatividade: cria incentivo temporal claro, reduz custo de turnover (que equivale a 3-6 salários por substituição), e o benefício se paga quando o entregador experiente atinge a curva de produtividade plena."
      },
      {
        text: "Digitalizar o conhecimento de rotas: criar um app de apoio a entregadores com instruções de endereços difíceis, histórico de cada cliente e rotas otimizadas",
        risco: "baixo",
        effects: { tecnologia: +3, sla: +4, processos: +4, rh: +2 },
        avaliacao: "boa",
        ensinamento: "Transformar conhecimento tácito em ativo digital é uma das melhores defesas contra rotatividade. Quando as informações críticas de rota deixam de existir apenas na cabeça do entregador experiente, a curva de aprendizado do novo colaborador cai de semanas para dias."
      },
      {
        text: "Reajustar o salário de todos os entregadores imediatamente para ficar R$150 acima da concorrência",
        risco: "medio",
        effects: { rh: +4, financeiro: -5, sla: +2, clientes: +1 },
        avaliacao: "media",
        ensinamento: "Reajuste imediato resolve o problema salarial, mas sem mudança de cultura e gestão pode não reduzir a rotatividade significativamente. Pesquisas de evasão mostram que salário é o gatilho, mas gestão direta e condições de trabalho são as causas-raiz que fazem as pessoas ficarem ou saírem."
      },
      {
        text: "Terceirizar parte da frota de entrega para parceiros eventuais — reduzir a dependência de equipe própria e a pressão de RH",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { financeiro: -2, sla: -2, rh: +1, processos: -3, clientes: -2 },
        avaliacao: "ruim",
        ensinamento: "Terceirizar a operação de last-mile como resposta à rotatividade é trocar um problema por dois: perde-se controle de qualidade e SLA, aumenta-se dependência de terceiros sem capacidade de enforcement real, e os clientes percebem a queda no padrão de atendimento antes mesmo dos dados mostrarem."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R4 · DIAGNÓSTICO · A Frota que Envelhece
     Contexto: 3ª semana. O relatório de manutenção chega.
     Os números de frota revelam um risco operacional silencioso.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Frota que Envelhece",
    description: "O responsável de manutenção apresenta o diagnóstico da frota: média de 9,2 anos por veículo, 23% com algum nível de irregularidade de manutenção, e o custo de corretiva nos últimos 6 meses superou o custo de preventiva em 3,7x. 'Estamos gastando para apagar incêndio, não para preveni-lo,' ele resume. 'Em 3 dos nossos 8 CDs, os veículos quebram na rua pelo menos uma vez por semana.' Qual é a sua prioridade?",
    tags: ["logistica"],
    fase: "diagnostico",
    choices: [
      {
        text: "Implementar manutenção preventiva programada obrigatória com parada semanal de cada veículo — custo imediato, mas quebras caem em 60% em 90 dias",
        risco: "baixo",
        effects: { frota: +5, sla: +3, seguranca: +3, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Manutenção preventiva programada tem ROI comprovado em frotas: cada R$1 investido em preventiva economiza R$3 a R$5 em corretiva e R$8 a R$12 em parada não planejada. O custo visível da preventiva é menor que o custo invisível das quebras — que inclui SLA, multa e imagem junto ao cliente."
      },
      {
        text: "Renovar imediatamente os 23% de veículos com irregularidade crítica, priorizando os CDs com maior índice de quebra",
        risco: "medio",
        effects: { frota: +4, seguranca: +4, financeiro: -6, sla: +2 },
        avaliacao: "media",
        ensinamento: "Renovação seletiva de frota é estrategicamente correta mas financeiramente pesada. Feita sem capital disponível ou linha de crédito adequada, pode comprometer o caixa operacional. O correto é combinar renovação com leasing ou financiamento escalonado, não com caixa próprio."
      },
      {
        text: "Contratar empresa especializada em gestão de frota para terceirizar toda a manutenção com SLA garantido",
        risco: "baixo",
        effects: { frota: +3, processos: +3, financeiro: -3, seguranca: +2 },
        avaliacao: "boa",
        ensinamento: "Terceirizar a manutenção para empresa especializada com SLA contratual transforma custo variável imprevisível em custo fixo gerenciável. Para frotas médias, isso geralmente reduz custo total em 15-25% e elimina o risco de indisponibilidade por falha de equipe interna."
      },
      {
        text: "Monitorar a situação por mais 30 dias coletando dados mais precisos antes de tomar uma decisão de alto custo",
        risco: "alto",
        effects: { frota: -2, sla: -2, seguranca: -2, clientes: -1 },
        avaliacao: "ruim",
        ensinamento: "Adiar decisão de frota quando 23% dos veículos já têm irregularidade documentada é aceitar o risco de acidentes e quebras. Cada semana de postergação aumenta a probabilidade de um incidente que gerará custo muito maior — humano, financeiro e reputacional — do que qualquer intervenção preventiva."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R5 · DIAGNÓSTICO · O Cliente que Ameaça Sair
     Contexto: fim da 3ª semana. O diagnóstico externo chega.
     A GrandeMart formaliza a insatisfação antes do prazo combinado.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Cliente que Ameaça Sair",
    description: "A GrandeMart antecipa a reunião e envia e-mail formal: '27 atrasos nas últimas 2 semanas. Estamos avaliando dois fornecedores alternativos. Temos uma chamada na sexta para decidir se renovamos ou rescindimos o contrato.' Eles representam 38% da sua receita. A reunião de sexta é daqui a 3 dias. O que você leva para essa conversa?",
    tags: ["logistica"],
    fase: "diagnostico",
    choices: [
      {
        text: "Apresentar na sexta o diagnóstico completo das causas-raiz + plano estruturado de 90 dias com métricas semanais de SLA monitoradas por eles em tempo real",
        risco: "baixo",
        effects: { clientes: +6, sla: +2, processos: +3, reputacao: +3 },
        avaliacao: "boa",
        ensinamento: "Clientes em risco de churn não querem promessas — querem evidência de que o problema foi compreendido com profundidade e que há um sistema de monitoramento que os protege no futuro. Visibilidade em tempo real do SLA é uma das ferramentas mais eficazes de reconquista de confiança em logística."
      },
      {
        text: "Propor desconto de 15% nas próximas 8 semanas como compensação pelos atrasos recentes",
        risco: "medio",
        effects: { clientes: +3, financeiro: -4, sla: -1, processos: -1 },
        avaliacao: "media",
        ensinamento: "Desconto pode estabilizar a relação no curto prazo, mas sem plano de melhoria operacional ele sinaliza que o problema vai continuar — só que mais barato. O cliente que precisa ser retido pelo preço está a um passo de sair assim que a concorrência oferecer ainda menos."
      },
      {
        text: "Pedir ao CEO que vá pessoalmente à GrandeMart antes da reunião de sexta para demonstrar comprometimento do nível executivo",
        risco: "baixo",
        effects: { clientes: +5, reputacao: +3, processos: +1, sla: +1 },
        avaliacao: "boa",
        ensinamento: "Atenção executiva em crise de conta estratégica tem um valor de sinal que nenhuma proposta formal substitui. A presença do CEO diz ao cliente: 'Você é importante o suficiente para eu sair da minha cadeira.' Isso frequentemente muda a dinâmica da reunião antes mesmo de uma palavra ser dita."
      },
      {
        text: "Deixar a reunião fluir sem apresentar proposta formal — ouvir as exigências deles antes de comprometer qualquer coisa",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2 },
        effects: { clientes: -4, sla: -1, reputacao: -3, processos: -1 },
        avaliacao: "ruim",
        ensinamento: "Chegar a uma reunião de rescisão iminente sem proposta concreta é uma postura que os clientes interpretam como despreparo ou descaso. A janela de reconquista nesse momento é estreita — e quem não apresenta um plano perde a iniciativa para quem pede a rescisão."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R6 · PRESSÃO · O Motorista Acidentado
     Contexto: 4ª semana. A pressão vem de um evento externo.
     Um acidente com veículo da frota coloca a empresa na berlinda.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Motorista Acidentado",
    description: "Uma van de entrega colide com um carro de passeio na Marginal Pinheiros. O motorista da empresa está bem, mas o outro veículo teve perda total e o condutor foi hospitalizado. A perícia vai apontar que a van tinha um defeito de freio registrado na checklist há 11 dias, sem resolução. O acidente vai virar notícia local. Um repórter já ligou para a assessoria perguntando sobre a manutenção da frota. Como você age nas próximas 2 horas?",
    tags: ["logistica"],
    fase: "pressao",
    choices: [
      {
        text: "Acionar o jurídico, o seguro e o responsável de comunicação simultaneamente — cuidar do acidentado e ter uma nota oficial pronta antes que o repórter publique",
        risco: "baixo",
        effects: { seguranca: +3, reputacao: +3, financeiro: -2, clientes: +1 },
        avaliacao: "boa",
        ensinamento: "Gestão de crise eficaz exige paralelismo: jurídico, seguro, comunicação e cuidado humano devem acontecer ao mesmo tempo. A nota proativa antes da publicação da notícia é determinante para a narrativa. Empresas que falam primeiro controlam o enquadramento — as que reagem perdem esse poder."
      },
      {
        text: "Aguardar a conclusão da perícia antes de emitir qualquer comunicado — não assumir responsabilidade antes de ter os fatos confirmados",
        risco: "alto",
        effects: { reputacao: -4, seguranca: -2, clientes: -3, financeiro: -2 },
        avaliacao: "ruim",
        ensinamento: "Silêncio em crise de segurança é interpretado como culpa. A nota não precisa admitir responsabilidade antes da perícia — mas precisa demonstrar que a empresa está presente, cooperando e cuidando das pessoas. O vácuo de comunicação é preenchido por quem tem interesse em construir a pior narrativa possível."
      },
      {
        text: "Visitar pessoalmente o acidentado no hospital e garantir que todos os custos médicos serão cobertos pela empresa, independente do resultado da perícia",
        risco: "baixo",
        effects: { reputacao: +4, seguranca: +2, financeiro: -3, rh: +3 },
        avaliacao: "boa",
        ensinamento: "O gesto humano de ir pessoalmente ao hospital transforma a crise em narrativa de responsabilidade. Não é uma admissão legal de culpa — é uma demonstração de caráter que repórteres, clientes e colaboradores percebem e que nenhuma nota de assessoria substitui."
      },
      {
        text: "Paralisar toda a frota imediatamente para revisão de segurança em todos os veículos antes de qualquer nova saída",
        risco: "medio",
        gestorEffects: { capitalPolitico: -1 },
        effects: { seguranca: +5, sla: -5, clientes: -4, financeiro: -3 },
        avaliacao: "media",
        ensinamento: "Paralisar a frota demonstra comprometimento com segurança, mas o impacto operacional imediato pode custar contratos. A decisão correta é paralisar apenas os veículos com defeitos documentados e pendentes, não toda a frota — isso demonstra inteligência operacional, não apenas reatividade."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R7 · PRESSÃO · O Sindicato Bate à Porta
     Contexto: 5ª semana. A pressão vem de dentro.
     O sindicato dos transportadores abre negociação formal.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Sindicato Bate à Porta",
    description: "O sindicato dos transportadores solicita reunião formal e apresenta uma pauta: reajuste salarial de 18%, seguro de vida melhorado, substituição de veículos com mais de 10 anos e implantação de pausas de descanso formalizadas. 'Temos 180 assinaturas de motoristas dispostos a cruzar os braços se não houver resposta em 10 dias,' diz o representante. O jurídico trabalhista confirma: a pauta é legítima e a empresa está vulnerável em pelo menos dois pontos.",
    tags: ["logistica"],
    fase: "pressao",
    choices: [
      {
        text: "Negociar ponto a ponto: aceitar imediatamente seguro de vida e pausas de descanso (custo baixo, impacto alto no clima), propor reajuste de 10% com revisão em 6 meses e cronograma de renovação de frota",
        risco: "baixo",
        effects: { rh: +6, seguranca: +3, financeiro: -3, sla: +2, clientes: +1 },
        avaliacao: "boa",
        ensinamento: "Negociação sindical eficaz separa o que é barato e de alto impacto simbólico (pausas, seguro) do que é caro e precisa de escalonamento (salário, renovação de frota). Conceder imediatamente nos pontos humanitários demonstra boa-fé e cria capital para negociar com mais calma nos pontos financeiramente pesados."
      },
      {
        text: "Rejeitar a pauta e contratar assessoria jurídica especializada para avaliar a legalidade de uma eventual greve",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -3 },
        effects: { rh: -6, seguranca: -2, sla: -3, reputacao: -3, clientes: -3 },
        avaliacao: "ruim",
        ensinamento: "Postura adversarial com sindicato em empresa com pauta legítima quase sempre piora o desfecho. Quando o jurídico confirma vulnerabilidade real, a batalha legal é cara, lenta e destrói o clima. O custo de uma greve de 3 dias em logística supera qualquer concessão salarial do primeiro ano."
      },
      {
        text: "Aceitar integralmente a pauta sindical para evitar qualquer risco de paralisação e manter a operação estável",
        risco: "medio",
        effects: { rh: +5, financeiro: -7, sla: +1, processos: -2 },
        avaliacao: "media",
        ensinamento: "Aceitar integralmente sem negociação esgota o caixa e cria precedente de que pressão sindical sem negociação é o caminho. Além disso, concessão sem contrapartida não gera engajamento — gera expectativa de que a próxima rodada terá o mesmo padrão de capitulação."
      },
      {
        text: "Propor a criação de uma comissão interna de melhoria com representantes dos motoristas, coordenadores e gestão para co-construir as soluções antes de negociar com o sindicato",
        risco: "baixo",
        effects: { rh: +4, processos: +3, sla: +1, clientes: +1, seguranca: +2 },
        avaliacao: "boa",
        ensinamento: "Co-construção com representantes diretos cria legitimidade interna e frequentemente produz soluções mais criativas e aceitáveis do que a negociação com o sindicato como único interlocutor. Motoristas que participaram da solução são mais propensos a adotá-la e a defender a empresa internamente."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R8 · PRESSÃO · O Contrato que Você Não Pode Perder
     Contexto: 6ª semana. Uma oportunidade e um risco chegam juntos.
     Um segundo grande cliente entra em contato — mas há um porém.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Contrato que Você Não Pode Perder",
    description: "A FreshBox, startup de e-commerce de alimentos frescos, quer fechar um contrato de R$8M anuais — o que reduziria a dependência da GrandeMart de 38% para 22% da receita. A reunião comercial foi ótima. Mas o diretor de operações deles é direto: 'Precisamos de SLA de 24h em 3 cidades e rastreamento em tempo real para o cliente final. Vocês conseguem entregar isso em 60 dias?' Seu time diz que, com a operação atual, levaria 90 dias. O que você responde?",
    tags: ["logistica"],
    fase: "pressao",
    choices: [
      {
        text: "Ser honesto: 'Levamos 90 dias para entregar o padrão que vocês precisam. Podemos assinar hoje com data de início no dia 91 e cronograma transparente das entregas parciais.'",
        risco: "baixo",
        effects: { clientes: +4, reputacao: +4, processos: +3, sla: +2 },
        avaliacao: "boa",
        ensinamento: "Transparência sobre prazo real é uma das melhores estratégias de venda em mercado B2B. Clientes sofisticados sabem que quem promete o impossível não vai entregar. A empresa que diz 'leva 90 dias porque vamos fazer certo' diferencia-se da concorrente que promete 60 dias e entrega mal."
      },
      {
        text: "Aceitar os 60 dias, contratar equipe adicional de entregadores e TI em regime emergencial para cumprir o prazo",
        risco: "alto",
        effects: { clientes: +3, financeiro: -5, rh: -3, sla: -2, processos: -3 },
        avaliacao: "ruim",
        ensinamento: "Contratar em regime emergencial para cumprir prazo impossível resulta em contratação de baixa qualidade, pressão extrema na operação existente e produto final aquém do prometido. O contrato que parecia uma conquista vira uma crise operacional em 30 dias."
      },
      {
        text: "Propor um piloto de 45 dias com 1 cidade e 500 entregas mensais — com SLA de 24h garantido nessa escala, antes de escalar para o contrato completo",
        risco: "baixo",
        effects: { clientes: +5, processos: +4, sla: +3, financeiro: +1, tecnologia: +2 },
        avaliacao: "boa",
        ensinamento: "Piloto controlado é a estratégia de expansão mais inteligente em logística: testa a operação em escala menor com cliente real, gera dados reais de desempenho e cria confiança progressiva. Clientes que cresceram junto com a operação têm índice de retenção muito maior do que os adquiridos já em escala plena."
      },
      {
        text: "Aceitar os 60 dias e subcontratar o trecho de rastreamento em tempo real para uma startup de tecnologia logística parceira",
        risco: "medio",
        effects: { clientes: +2, tecnologia: +3, processos: -2, financeiro: -2, sla: -1 },
        avaliacao: "media",
        ensinamento: "Subcontratar tecnologia pode ser uma solução de curto prazo, mas cria dependência externa em componente que o cliente valoriza como diferencial. Se a startup parceira falhar, o cliente vê a falha como sua — e você não controla a qualidade de um serviço que colocou seu nome."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R9 · PRESSÃO · A Auditoria Surpresa
     Contexto: 7ª semana. Pressão regulatória chegando.
     O Detran anuncia fiscalização nas frotas comerciais da região.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Auditoria Surpresa",
    description: "O Detran anuncia que realizará blitz em frotas comerciais da Grande São Paulo nos próximos 15 dias como parte de uma operação estadual. Seu responsável de frota é direto: 'Temos 34 veículos com alguma irregularidade documental ou de manutenção. Se pegarem 10 deles na blitz, temos multa, apreensão e possível interdição dos CDs envolvidos.' Você tem 15 dias. O que você prioriza?",
    tags: ["logistica"],
    fase: "pressao",
    choices: [
      {
        text: "Regularizar todos os 34 veículos em regime de urgência — contratar mecânico adicional, trabalhar nos finais de semana e usar locados para manter a operação nos dias de vistoria",
        risco: "medio",
        effects: { seguranca: +5, frota: +4, financeiro: -4, sla: -1 },
        avaliacao: "boa",
        ensinamento: "Regularização preventiva antes de fiscalização é sempre mais barata do que a multa + apreensão + impacto operacional. O custo de 34 regularizações em regime de urgência raramente chega a 20% do custo médio de uma interdição de CD por 48 horas."
      },
      {
        text: "Priorizar apenas os 12 veículos mais críticos — os que operam nas rotas de maior visibilidade e têm mais chance de serem abordados",
        risco: "medio",
        effects: { seguranca: +2, frota: +2, financeiro: -2, sla: +1 },
        avaliacao: "media",
        ensinamento: "Priorização por risco de visibilidade é uma gestão de compliance parcial. Funcionalmente reduz o risco imediato, mas não resolve as irregularidades remanescentes — que vão reaparecer na próxima fiscalização ou, pior, em um sinistro. Compliance por seleção cria cultura de tolerância com irregularidade."
      },
      {
        text: "Redirecionar temporariamente os veículos irregulares para operações internas (CD a CD) fora das vias públicas durante o período da blitz",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2, esgotamento: +1 },
        effects: { seguranca: -3, sla: -4, financeiro: -2, clientes: -3 },
        avaliacao: "ruim",
        ensinamento: "Desviar veículos irregulares para evitar fiscalização é evasão, não gestão. Além do risco legal, impacta o SLA das rotas descobertas. E não resolve o problema — em 15 dias os veículos voltam às ruas com as mesmas irregularidades e com um histórico agora contestável se houver sinistro."
      },
      {
        text: "Comunicar proativamente ao Detran a situação e solicitar um prazo de 30 dias para regularização com cronograma formal",
        risco: "baixo",
        effects: { seguranca: +4, reputacao: +3, financeiro: -1, frota: +3 },
        avaliacao: "boa",
        ensinamento: "Transparência proativa com órgão regulador frequentemente resulta em tratamento diferenciado. Empresas que se autodeclaram em processo de regularização com cronograma formal têm probabilidade significativamente menor de sofrer autuação máxima — e constroem relacionamento institucional que vale muito em futuras interações."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R10 · PRESSÃO / GATILHO ESTRATÉGICO · O Ultimato da GrandeMart
     Contexto: 8ª semana. O momento decisivo chega.
     A GrandeMart apresenta o ultimato que abre o ato final.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Ultimato da GrandeMart",
    description: "A GrandeMart convoca uma reunião de alto nível. Seu diretor de supply chain é direto: 'Temos uma proposta de outro operador logístico com SLA de 98% garantido e rastreamento em tempo real. Para renovar com vocês em 60 dias, precisamos de três coisas: novo TMS integrado ao nosso sistema, rastreamento GPS para o cliente final e SLA acima de 95% nas próximas 4 semanas. Se não, rescindimos o contrato.' Você sabe que atender os três pontos em 4 semanas é extremamente desafiador. O que você decide?",
    tags: ["logistica"],
    fase: "pressao",
    choices: [
      {
        text: "Aceitar o desafio formalmente, comprometer os três pontos com cronograma transparente semana a semana e escalar internamente como prioridade máxima da empresa",
        risco: "medio",
        effects: { clientes: +5, sla: +3, tecnologia: +3, financeiro: -3, rh: -2 },
        avaliacao: "boa",
        ensinamento: "Aceitar um desafio operacional difícil com cronograma transparente é a resposta de uma empresa que acredita em si mesma. O compromisso público interno cria foco coletivo. E clientes que testemunham uma empresa se reinventar sob pressão real tendem a construir lealdade de longo prazo que não se compra com desconto."
      },
      {
        text: "Negociar: aceitar dois dos três pontos — TMS e GPS — e propor meta de SLA 92% em 4 semanas com 95% em 8 semanas",
        risco: "baixo",
        effects: { clientes: +4, sla: +4, tecnologia: +4, financeiro: -2, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Negociação baseada em realidade operacional preserva a credibilidade. Clientes B2B maduros preferem parceiros que sabem o que podem entregar a parceiros que prometem tudo. A meta de 92% com caminho claro para 95% demonstra domínio técnico — e muda a pergunta de 'conseguem?' para 'quando conseguem?'"
      },
      {
        text: "Recusar as condições e propor renovação com as condições atuais — perder o contrato é preferível a comprometer toda a operação",
        risco: "alto",
        gestorEffects: { capitalPolitico: -3, esgotamento: +2 },
        effects: { financeiro: -8, clientes: -6, rh: -2, sla: -1 },
        avaliacao: "ruim",
        ensinamento: "Recusar sem contraoferta concreta é abandonar 38% da receita. A lição não é aceitar o impossível — é negociar. Empresas que perdem grandes contratos por não negociarem as condições raramente conseguem substituir esse volume no curto prazo, e a queda de caixa afeta toda a operação."
      },
      {
        text: "Pedir 10 dias para avaliar internamente e voltar com uma proposta — não tomar uma decisão sob pressão imediata",
        risco: "medio",
        effects: { clientes: -2, processos: +2, sla: +1, financeiro: -1 },
        avaliacao: "media",
        ensinamento: "Pedir prazo para pensar pode ser prudência ou fuga. Neste contexto, 10 dias pode ser interpretado pelo cliente como hesitação — e enquanto você avalia, o concorrente avança. A reunião de ultimato é o momento da decisão: chegar sem posição é o pior cenário."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R11 · DECISÃO CRÍTICA · A Escolha do Novo TMS
     Contexto: 9ª semana. A decisão de tecnologia que define o futuro.
     Três fornecedores em mesa, cada um com uma proposta diferente.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Escolha do Novo TMS",
    description: "Três fornecedores apresentaram propostas de TMS: (A) solução robusta, 6 meses de implementação, R$2,8M de contrato, integração nativa com o sistema da GrandeMart; (B) solução SaaS rápida, 6 semanas de implantação, R$180k/ano, mas sem integração nativa — precisa de desenvolvimento adicional; (C) parceria com startup de ex-engenheiros da Loggi, implementação em 4 semanas, R$90k/ano, sem histórico de cliente enterprise. Você tem que decidir hoje.",
    tags: ["logistica"],
    fase: "decisao",
    choices: [
      {
        text: "Opção A: solução robusta com integração nativa — é o que o cliente precisa e o que vai segurar o contrato no longo prazo",
        risco: "alto",
        effects: { tecnologia: +6, clientes: +4, financeiro: -6, sla: +2 },
        avaliacao: "media",
        ensinamento: "A solução mais completa nem sempre é a mais adequada para o momento. 6 meses de implementação em um contexto de cliente com ultimato de 4 semanas é uma aposta de que o cliente vai esperar — e apostas com 38% da receita têm custo de erro muito alto."
      },
      {
        text: "Opção B: SaaS rápido + desenvolvimento de integração paralelo — entrega resultado em 6 semanas com investimento gerenciável",
        risco: "medio",
        effects: { tecnologia: +5, sla: +4, clientes: +4, financeiro: -3, processos: +3 },
        avaliacao: "boa",
        ensinamento: "Solução SaaS de implantação rápida com desenvolvimento de integração paralelo equilibra velocidade e robustez. O custo adicional do desenvolvimento de integração ainda fica dentro de uma fração do valor do contrato GrandeMart — e a entrega em 6 semanas é defensável na negociação."
      },
      {
        text: "Opção C: startup com histórico técnico sólido e implementação em 4 semanas — custo baixo e prazo ideal",
        risco: "alto",
        effects: { tecnologia: +3, sla: +3, financeiro: +1, clientes: -2, processos: +1 },
        avaliacao: "media",
        ensinamento: "TMS de startup sem histórico enterprise é um risco alto em operação de missão crítica. O prazo e o custo são atraentes, mas uma falha técnica em 30 dias de operação pode custar mais do que o contrato GrandeMart inteiro — e reputação não se recupera rápido em logística B2B."
      },
      {
        text: "Combinar B como sistema principal e contratar a startup como camada de rastreamento GPS para o cliente final — o melhor dos dois mundos",
        risco: "baixo",
        effects: { tecnologia: +6, sla: +5, clientes: +5, financeiro: -4, processos: +4 },
        avaliacao: "boa",
        ensinamento: "Arquitetura modular — TMS enterprise + camada especializada de tracking — é o padrão das operações logísticas mais avançadas do mercado. Usar a startup para o componente mais visível ao cliente final (GPS em tempo real) e o SaaS robusto para gestão interna equilibra risco e inovação."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R12 · DECISÃO CRÍTICA · A Reestruturação da Equipe
     Contexto: 10ª semana. A decisão mais difícil sobre pessoas.
     Crescer mantendo a equipe atual ou reestruturar para o novo modelo?
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Reestruturação da Equipe",
    description: "Com o novo TMS, a operação vai mudar profundamente. O consultor de RH apresenta o diagnóstico: 3 dos 8 coordenadores de CD não têm perfil para gerir operação baseada em dados e tecnologia. 'Eles são excelentes na operação tradicional,' ele diz, 'mas no novo modelo vão ser um gargalo.' Ao mesmo tempo, você precisa de 2 analistas de dados operacionais que o mercado não tem em abundância. Como você decide sobre o time?",
    tags: ["logistica"],
    fase: "decisao",
    choices: [
      {
        text: "Criar um programa de capacitação de 8 semanas para os 3 coordenadores em análise de dados — manter o time e desenvolver as competências",
        risco: "medio",
        effects: { rh: +5, processos: +3, financeiro: -2, tecnologia: +2, sla: +2 },
        avaliacao: "boa",
        ensinamento: "Desenvolver pessoas existentes custa menos do que contratar e preserva o conhecimento operacional acumulado — que tem valor real. Coordenadores com 10 anos de estrada que aprendem análise de dados tornam-se ativos raros: dominam a operação E os dados. O risco é que alguns não se adaptam — mas isso você descobre com clareza no processo."
      },
      {
        text: "Desligar os 3 coordenadores com histórico sólido e contratar substitutos com perfil analítico do mercado",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -3 },
        effects: { rh: -4, tecnologia: +3, financeiro: -4, processos: -2, sla: -2 },
        avaliacao: "ruim",
        ensinamento: "Desligar profissionais experientes para substituir por perfis 'mais modernos' sem tentativa de desenvolvimento é uma decisão de alto custo humano e operacional. O novo coordenador analítico precisa de 3 a 6 meses para entender a operação — tempo que a empresa não tem no contexto atual."
      },
      {
        text: "Reposicionar os 3 coordenadores em funções operacionais sênior e contratar 2 analistas de dados como líderes do novo modelo — estrutura híbrida",
        risco: "baixo",
        effects: { rh: +4, tecnologia: +4, processos: +5, financeiro: -3, sla: +3 },
        avaliacao: "boa",
        ensinamento: "Estrutura híbrida que preserva expertise operacional e injeta capacidade analítica é a transição mais eficaz em transformação de operações logísticas. O erro mais comum é achar que uma coisa substitui a outra — na prática, elas se complementam e a empresa fica mais forte nas duas dimensões."
      },
      {
        text: "Deixar a estrutura atual e resolver o gap analítico com uma consultoria externa por 12 meses",
        risco: "medio",
        effects: { rh: +1, tecnologia: +2, financeiro: -4, processos: +1, sla: +1 },
        avaliacao: "media",
        ensinamento: "Consultoria resolve o problema de curto prazo mas não constrói capacidade interna. Ao fim dos 12 meses, a empresa está exatamente no mesmo ponto analítico — e R$400k mais pobre. A construção de capacidade analítica interna é um ativo que consultoria não pode substituir no longo prazo."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R13 · DECISÃO CRÍTICA · A Diversificação da Carteira
     Contexto: 11ª semana. A decisão estratégica de longo prazo.
     Reduzir a dependência da GrandeMart ou focar e crescer com ela?
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Diversificação da Carteira",
    description: "Com a operação se estabilizando, você precisa decidir o rumo estratégico: a GrandeMart, mesmo renovando, ainda vai representar 30% da receita. O diretor comercial apresenta duas estratégias opostas: (A) Ir a fundo na GrandeMart — tornar-se o operador mais integrado que eles têm, buscar 100% do volume deles; (B) Diversificar agressivamente — fechar pelo menos 8 contratos novos de R$2-5M nos próximos 12 meses para chegar a um teto de 15% por cliente.",
    tags: ["logistica"],
    fase: "decisao",
    choices: [
      {
        text: "Estratégia A: aprofundar a GrandeMart — tornar-se indispensável para eles vale mais do que diversificar",
        risco: "alto",
        effects: { clientes: +5, financeiro: +4, sla: +3, processos: -1, rh: -1 },
        avaliacao: "media",
        ensinamento: "Concentração em um cliente âncora pode ser uma estratégia válida se o cliente é grande o suficiente e se a empresa se torna estruturalmente integrada ao processo dele. O risco é que qualquer mudança na GrandeMart — troca de CEO, M&A, internalização da operação — vira uma crise existencial para você."
      },
      {
        text: "Estratégia B: diversificar agressivamente — nenhum cliente deve representar mais de 15% da receita",
        risco: "medio",
        effects: { clientes: +3, financeiro: +3, rh: -3, processos: -3, sla: -2 },
        avaliacao: "media",
        ensinamento: "Diversificação de carteira é o caminho certo estrategicamente — mas 8 novos contratos em 12 meses sem capacidade operacional adicional resulta em crescimento disfuncional: SLA cai, time estica e os novos clientes chegam a uma operação abaixo do padrão prometido."
      },
      {
        text: "Estratégia híbrida: manter GrandeMart como âncora (máximo 30%) e adicionar 3 contratos estratégicos por setor diferente — farmácia, e-commerce e indústria",
        risco: "baixo",
        effects: { clientes: +5, financeiro: +4, processos: +3, rh: +1, sla: +2 },
        avaliacao: "boa",
        ensinamento: "Diversificação setorial inteligente — 3 clientes em segmentos com perfis de demanda complementares — é mais resiliente do que 8 clientes no mesmo setor. Se o varejo vai mal, farmácia e indústria compensam. E 3 contratos em 12 meses é um ritmo que a operação atual consegue absorver com qualidade."
      },
      {
        text: "Adiar a decisão estratégica por 90 dias — focar primeiro em consolidar as melhorias operacionais antes de crescer",
        risco: "medio",
        gestorEffects: { capitalPolitico: -1 },
        effects: { processos: +2, sla: +2, financeiro: -1, clientes: -2 },
        avaliacao: "media",
        ensinamento: "Adiar estratégia de crescimento tem um custo de oportunidade real: 90 dias de janela é tempo suficiente para a concorrência fechar os contratos que você não foi buscar. Melhorar operação e crescer não precisam ser sequenciais — podem acontecer em paralelo com alocação inteligente de prioridades."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R14 · DECISÃO CRÍTICA · O Investidor Aparece
     Contexto: 12ª semana. Uma oportunidade muda o cenário.
     Um fundo de private equity propõe entrada na empresa.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Investidor Aparece",
    description: "Um fundo de PE especializado em logística propõe adquirir 40% da empresa por R$18M — o que daria capital para renovar a frota integralmente, implementar o TMS da melhor opção e contratar a equipe analítica necessária. Em troca: assento no conselho, meta de crescimento de 35% ao ano e cláusula de saída em 4 anos. O sócio-fundador quer ouvir sua recomendação antes de responder.",
    tags: ["logistica"],
    fase: "decisao",
    choices: [
      {
        text: "Recomendar aceitar — o capital resolve os gargalos de frota e tecnologia de uma vez e o crescimento de 35% ao ano é atingível com a operação em ordem",
        risco: "medio",
        gestorEffects: { capitalPolitico: +2 },
        effects: { financeiro: +7, tecnologia: +4, frota: +5, clientes: +3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "PE especializado em logística traz mais do que capital: traz know-how setorial, rede de clientes e governança que profissionaliza a gestão. A meta de 35% ao ano é desafiadora mas defensável com a operação que está sendo construída. A diluição de 40% de uma empresa maior vale mais do que 100% de uma empresa estagnada."
      },
      {
        text: "Recomendar negociar: aceitar o capital mas reduzir a participação do fundo para 25% e a meta para 25% ao ano",
        risco: "baixo",
        effects: { financeiro: +4, frota: +3, tecnologia: +3, clientes: +2 },
        avaliacao: "boa",
        ensinamento: "Negociar o valuation e as condições de entrada é uma demonstração de maturidade empresarial. Toda proposta de PE tem gordura — e um fundo que reduz para 25%/25% para fechar o negócio é um fundo que acredita genuinamente no potencial. A melhor negociação é aquela em que ambos os lados saem satisfeitos."
      },
      {
        text: "Recomendar rejeitar — perder 40% da empresa é alto demais considerando a fase de recuperação que acabou de começar",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { financeiro: -2, frota: -1, tecnologia: -1, clientes: -1 },
        avaliacao: "media",
        ensinamento: "Rejeitar PE especializado por medo de diluição pode ser a decisão mais cara da história da empresa. Sem capital, a renovação de frota e o TMS ficam no prazo longo — e nesse meio tempo a concorrência capitalizada vai fechar os contratos que você está disputando. Independência sem capital em setor intensivo em ativos é um luxo caro."
      },
      {
        text: "Recomendar buscar um segundo investidor para criar competição e aumentar o valuation antes de fechar com o PE",
        risco: "medio",
        effects: { financeiro: +3, clientes: +1, processos: -1, rh: -1 },
        avaliacao: "media",
        ensinamento: "Processo competitivo de captação aumenta o valuation — mas leva de 3 a 6 meses e o foco do time se divide entre a operação e o roadshow. Em um momento de recuperação operacional crítico, a distração do processo de captação paralelo pode custar mais do que o prêmio de valuation que ele geraria."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R15 · DECISÃO FINAL · O Futuro da Operação
     Contexto: 13ª semana. O horizon de longo prazo.
     Onde estará a empresa em 3 anos?
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Futuro da Operação",
    description: "Com a operação estabilizada, o contrato GrandeMart renovado e o capital ou a organização interna alinhados, você precisa definir o posicionamento estratégico para os próximos 3 anos. Onde a empresa vai competir e como vai se diferenciar num mercado cada vez mais tecnológico e competitivo?",
    tags: ["logistica"],
    fase: "decisao",
    choices: [
      {
        text: "Especialização vertical em last-mile para e-commerce premium: SLA de 4 horas, entregadores certificados, experiência de entrega como diferencial de marca",
        effects: { sla: +5, clientes: +5, reputacao: +4, financeiro: +3, tecnologia: +3 },
        avaliacao: "boa",
        ensinamento: "Especialização vertical em segmento premium é a estratégia mais defensável contra concorrentes de baixo custo. Entregar em 4 horas com entregador certificado para e-commerce de luxo não compete com o mesmo mercado que a startup de motoboys. São propostas de valor diferentes para clientes diferentes."
      },
      {
        text: "Plataforma logística aberta: conectar pequenos e médios lojistas a uma rede de entregadores independentes com TMS proprietário como diferencial tecnológico",
        effects: { tecnologia: +5, clientes: +4, financeiro: +4, processos: +3, rh: +2 },
        avaliacao: "boa",
        ensinamento: "Modelo de plataforma multiplica o volume sem multiplicar proporcionalmente a estrutura de custos. O TMS proprietário vira um ativo que gera receita de duas formas: operação própria e licenciamento para outros operadores — criando uma barreira competitiva difícil de replicar."
      },
      {
        text: "Expansão geográfica para o interior paulista e Sul do país — cobertura nacional como diferencial para grandes varejistas",
        requisitos: { indicadorMinimo: { financeiro: 11, sla: 12 } },
        effects: { clientes: +4, financeiro: +3, frota: -2, rh: -3, processos: -2, sla: -1 },
        avaliacao: "media",
        ensinamento: "Expansão geográfica sem a base operacional consolidada é a receita para repetir os problemas de SLA em escala maior. Crescer o território antes de dominar a operação no território atual é construir sobre areia. A expansão certa acontece depois que o modelo funciona — não para fugir dos problemas do modelo atual."
      },
      {
        text: "Logística reversa e sustentabilidade: especialização em retorno de produtos e frota elétrica como posicionamento ESG para grandes corporações",
        effects: { reputacao: +5, clientes: +3, tecnologia: +3, financeiro: +2, frota: +3 },
        avaliacao: "boa",
        ensinamento: "Logística reversa é um segmento de alto crescimento e margens melhores do que o last-mile tradicional. Combinado com posicionamento ESG via frota elétrica, cria um diferencial que grandes corporações com metas de ESG valorizam e pagam mais — e que startups de baixo custo não conseguem replicar rapidamente."
      }
    ]
  }

],

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [1] · Cadeia do Frio Refrigerada — Falha na cadeia do frio
   Contexto: 190 colaboradores, 87 veículos refrigerados, 3 armazéns
   SP-RJ-BH, R$38M faturamento, falha de sensor = R$620k de
   medicamentos devolvidos, auditoria farmacêutica acionada.
══════════════════════════════════════════════════════════════════ */
[

  /* ═══════════════════════════════════════════════════════
     R1 · DIAGNÓSTICO · A Devolução de R$ 620 mil
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Devolução de R$ 620 mil",
    description: "Você assume a gestão no dia seguinte à devolução de R$620 mil em medicamentos pela rede farmacêutica FarmaPlus. O diretor comercial te chama: 'Eles ativaram a cláusula de auditoria. Temos 15 dias para apresentar um plano de correção antes que decidam pela rescisão. Esse contrato vale R$9M anuais.' Qual é o seu primeiro movimento?",
    tags: ["logistica"],
    fase: "diagnostico",
    choices: [
      {
        text: "Solicitar reunião urgente com a FarmaPlus antes dos 15 dias — ir até eles com o diagnóstico do problema e os primeiros passos já iniciados",
        risco: "baixo",
        effects: { clientes: +5, seguranca: +2, reputacao: +3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Em contratos farmacêuticos, velocidade de resposta à falha é tão importante quanto a solução técnica. Ir ao cliente antes do prazo com diagnóstico e ações iniciais demonstra que a empresa leva compliance a sério — e muda a dinâmica da auditoria de adversarial para colaborativa."
      },
      {
        text: "Contratar imediatamente uma consultoria especializada em qualidade farmacêutica para liderar o processo de resposta à auditoria",
        risco: "medio",
        effects: { seguranca: +4, clientes: +3, financeiro: -3, processos: +3 },
        avaliacao: "boa",
        ensinamento: "Consultoria especializada em supply chain farmacêutico conhece exatamente o que os auditores procuram. O custo da consultoria é uma fração do valor do contrato em risco e pode ser a diferença entre uma auditoria aprovada e uma rescisão."
      },
      {
        text: "Fazer um diagnóstico interno completo antes de qualquer comunicação externa — entender tudo antes de falar",
        risco: "alto",
        effects: { processos: +2, seguranca: +1, clientes: -3, reputacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Silêncio de 7 dias para diagnóstico interno em contexto de auditoria farmacêutica é interpretado pelo cliente como omissão ou falta de urgência. O cliente precisa ver movimento imediato — não um plano perfeito depois de uma semana. Ação visível com diagnóstico parcial é melhor do que resposta perfeita tardia."
      },
      {
        text: "Acionar o seguro de transporte de cargas para cobrir os R$620 mil e focar em proteger o fluxo de caixa",
        risco: "medio",
        gestorEffects: { capitalPolitico: -2 },
        effects: { financeiro: +3, clientes: -4, seguranca: -1, reputacao: -3 },
        avaliacao: "ruim",
        ensinamento: "Acionar seguro sem primeiro correr para reconquistar o cliente é uma leitura errada das prioridades. O cliente farmacêutico não quer o reembolso — quer a garantia de que o problema não vai se repetir. Focar no seguro antes da relação sinaliza que a empresa coloca o caixa acima da confiança."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R2 · DIAGNÓSTICO · O Mapa dos Sensores
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Mapa dos Sensores",
    description: "O responsável de qualidade apresenta o levantamento: 18% da frota refrigerada — 16 veículos de 87 — tem sistemas de monitoramento de temperatura desatualizados ou com falhas documentadas. 'Eu reportei isso há 4 meses,' ele diz com voz tensa. 'O investimento foi adiado duas vezes.' O problema é sistêmico, não isolado. Como você responde a esse diagnóstico interno?",
    tags: ["logistica"],
    fase: "diagnostico",
    choices: [
      {
        text: "Aprovar imediatamente a atualização dos 16 veículos críticos — custará R$340k mas elimina o risco imediato e demonstra ação concreta para a auditoria",
        risco: "baixo",
        effects: { seguranca: +5, frota: +4, clientes: +3, financeiro: -3 },
        avaliacao: "boa",
        ensinamento: "Agir imediatamente no problema documentado é a única resposta que transforma um diagnóstico negativo em prova de responsabilidade. Os R$340k de custo são uma fração do risco de perder o contrato de R$9M — e a documentação da ação tem valor jurídico e comercial real na auditoria."
      },
      {
        text: "Reconhecer o problema publicamente ao responsável de qualidade e criar um processo formal de escalada para que relatórios de risco cheguem até a diretoria",
        risco: "baixo",
        effects: { processos: +4, seguranca: +3, rh: +3, clientes: +2 },
        avaliacao: "boa",
        ensinamento: "O problema real não foi o sensor — foi o processo de governança que permitiu que um relatório de risco crítico fosse ignorado por 4 meses. Corrigir o sensor sem corrigir o processo é garantir que o próximo sensor vai falhar da mesma forma. Criar um sistema de escalada de alertas é a intervenção sistêmica necessária."
      },
      {
        text: "Investigar por que o investimento foi adiado antes de tomar qualquer decisão — entender o contexto financeiro do período",
        risco: "medio",
        gestorEffects: { reputacaoInterna: -2 },
        effects: { processos: +1, seguranca: -1, clientes: -2, rh: -2 },
        avaliacao: "ruim",
        ensinamento: "Investigar o passado antes de agir no presente quando há risco ativo é uma inversão de prioridades. O responsável de qualidade que reportou o problema precisa ver que o novo gestor age diferente do anterior — não que ele também vai gastar energia investigando por que o problema não foi resolvido antes de resolvê-lo."
      },
      {
        text: "Paralisar os 16 veículos com falha de monitoramento até que a atualização seja feita — zero risco enquanto a solução é implementada",
        risco: "alto",
        effects: { seguranca: +4, clientes: -3, financeiro: -5, sla: -4 },
        avaliacao: "media",
        ensinamento: "Paralisar 16 veículos de uma frota de 87 sem aviso reduz a capacidade operacional em 18% imediatamente. Em cadeia do frio, isso frequentemente significa não cumprimento de entregas de alto risco — o que pode gerar problemas com outros clientes enquanto você tenta resolver o problema com a FarmaPlus."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R3 · DIAGNÓSTICO · O Protocolo que Não Existia
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Protocolo que Não Existia",
    description: "O auditor da FarmaPlus realiza a primeira visita e faz uma pergunta que trava a sala: 'Qual é o protocolo de ação quando um sensor de temperatura detecta variação fora do parâmetro durante uma entrega?' Silêncio. A empresa não tem um protocolo formal documentado. O motorista que estava no veículo na falha conta que ligou para o supervisor, mas não havia um procedimento claro do que fazer. Como você responde ao auditor?",
    tags: ["logistica"],
    fase: "diagnostico",
    choices: [
      {
        text: "Ser honesto com o auditor: 'O protocolo formal não existia. Estamos criando e implementando nos próximos 10 dias e podemos compartilhar com vocês antes da próxima visita.'",
        risco: "baixo",
        effects: { clientes: +4, seguranca: +3, reputacao: +3, processos: +4 },
        avaliacao: "boa",
        ensinamento: "Transparência com auditores farmacêuticos é mais valorizada do que a narrativa de que tudo estava certo. Auditores experientes sabem quando estão recebendo resposta ensaiada — e a empresa que admite a lacuna e apresenta prazo de correção constrói muito mais credibilidade do que a que tenta justificar o que não existia."
      },
      {
        text: "Apresentar o protocolo que será criado como se já fosse um rascunho em desenvolvimento — comprar tempo sem admitir que não existia nada",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2, esgotamento: +2 },
        effects: { clientes: -4, seguranca: -2, reputacao: -4, processos: -1 },
        avaliacao: "ruim",
        ensinamento: "Enganar um auditor farmacêutico é arriscado em qualquer circunstância — e auditores experientes costumam detectar protocolos criados às pressas com inconsistências que revelam a data real de criação. Se a farsa for descoberta, a empresa perde toda a credibilidade construída e a rescisão vira quase certa."
      },
      {
        text: "Pedir ao jurídico para acompanhar a reunião com o auditor antes de responder a qualquer pergunta sobre protocolos",
        risco: "alto",
        effects: { clientes: -3, reputacao: -3, processos: -1, seguranca: -1 },
        avaliacao: "ruim",
        ensinamento: "Trazer o jurídico para um processo de auditoria de qualidade transforma uma conversa de melhoria em uma negociação de defesa — e os auditores percebem a mudança. Na cadeia farmacêutica, transparência e colaboração são as moedas de troca que mantêm contratos."
      },
      {
        text: "Criar o protocolo nas próximas 48 horas com a equipe e agendar uma segunda reunião com o auditor para apresentá-lo formalmente",
        risco: "baixo",
        effects: { processos: +5, seguranca: +4, clientes: +3, rh: +2 },
        avaliacao: "boa",
        ensinamento: "Ação em 48 horas demonstra urgência real. A segunda reunião com o protocolo criado transforma o vácuo identificado na primeira visita em prova de capacidade de resposta rápida — e o auditor que viu o problema na visita 1 e vê a solução na visita 2 tem uma percepção completamente diferente da empresa."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R4 · DIAGNÓSTICO · O Custo da Certificação
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Custo da Certificação",
    description: "Para atender exigências da FarmaPlus e de outros clientes do setor, o consultor de qualidade recomenda buscar a certificação ISO 9001 adaptada para cadeia do frio. 'Com isso, vocês passam de fornecedor sob vigilância para fornecedor certificado — abre contratos com hospitais e laboratórios que só trabalham com certificados.' O custo: R$280k e 9 meses de processo. O CFO alerta: 'O caixa está apertado. Temos outras prioridades urgentes.' Como você decide?",
    tags: ["logistica"],
    fase: "diagnostico",
    choices: [
      {
        text: "Iniciar o processo de certificação agora — é um investimento que se paga com a abertura de novos contratos e é mais barato do que uma rescisão da FarmaPlus",
        risco: "medio",
        effects: { seguranca: +4, clientes: +5, reputacao: +5, financeiro: -3, processos: +3 },
        avaliacao: "boa",
        ensinamento: "Certificação em cadeia do frio é um ativo que abre mercados inteiros fechados a não certificados. Hospitais públicos, laboratórios e exportação de alimentos exigem certificação. O custo de R$280k tem ROI calculável — um único contrato com hospital de médio porte paga o investimento em menos de 12 meses."
      },
      {
        text: "Adiar a certificação e focar os recursos na atualização dos sensores e criação dos protocolos que a FarmaPlus está exigindo agora",
        risco: "baixo",
        effects: { seguranca: +3, financeiro: +1, clientes: +2, processos: +2, reputacao: -1 },
        avaliacao: "boa",
        ensinamento: "Priorizar as exigências imediatas da FarmaPlus sobre a certificação de longo prazo é uma leitura correta de urgência vs. importância. A certificação é importante — mas não urgente. A auditoria em curso é urgente. Recursos escassos devem ir para onde o risco está mais imediato."
      },
      {
        text: "Buscar uma linha de crédito específica para a certificação — não usar o caixa operacional para um investimento de longo prazo",
        risco: "baixo",
        effects: { financeiro: +2, seguranca: +3, clientes: +3, reputacao: +2, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Separar o financiamento de investimentos estratégicos do caixa operacional é uma prática de gestão financeira correta. Certificações têm ROI claro e são elegíveis a linhas do BNDES para qualidade e compliance — que têm custo menor do que crédito convencional."
      },
      {
        text: "Substituir a certificação por uma autodeclaração de conformidade interna — tem o mesmo efeito prático por uma fração do custo",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -1 },
        effects: { seguranca: -2, clientes: -3, reputacao: -3, financeiro: +1 },
        avaliacao: "ruim",
        ensinamento: "No setor farmacêutico e hospitalar, autodeclaração não tem valor legal nem comercial. Clientes que exigem certificação de terceira parte não aceitam declarações internas como equivalente. Tentar substituir uma certificação independente por uma autoevaluação é um atalho que fecha portas em vez de abrir."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R5 · DIAGNÓSTICO · A Decisão da FarmaPlus
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Decisão da FarmaPlus",
    description: "No 15º dia, a FarmaPlus se reúne com você para comunicar a decisão sobre o contrato. Eles viram as ações tomadas: atualização dos sensores em andamento, protocolo de temperatura criado e treinamento iniciado. Mas o diretor de supply chain diz: 'Avançamos positivamente. Para continuar com vocês, precisamos de um SLA de temperatura com garantia contratual e um dashboard de monitoramento que nossa equipe acessa em tempo real.' São exigências técnicas que você ainda não tem. Como você responde?",
    tags: ["logistica"],
    fase: "diagnostico",
    choices: [
      {
        text: "Aceitar as exigências com prazo de 60 dias e propor um período de transição com auditoria conjunta semanal enquanto o dashboard é implementado",
        risco: "baixo",
        effects: { clientes: +6, tecnologia: +4, sla: +3, processos: +3 },
        avaliacao: "boa",
        ensinamento: "Proposta com prazo realista e auditoria conjunta é um acordo de confiança progressiva — a FarmaPlus não precisa confiar cegamente, ela valida no processo. Para clientes farmacêuticos, visibilidade é quase tão importante quanto conformidade. O dashboard não é só tecnologia — é o mecanismo de confiança."
      },
      {
        text: "Apresentar uma proposta de SLA de temperatura como aditivo contratual imediato — aceitar a exigência legal antes mesmo de ter o dashboard pronto",
        risco: "medio",
        effects: { clientes: +4, financeiro: -2, sla: +2, seguranca: +2, reputacao: +3 },
        avaliacao: "boa",
        ensinamento: "Aditivo contratual de SLA de temperatura demonstra comprometimento jurídico com a qualidade. O dashboard pode vir depois — o compromisso formal primeiro. Clientes que confiam no parceiro com um SLA escrito têm muito mais paciência para aguardar as implementações tecnológicas que acompanham o compromisso."
      },
      {
        text: "Pedir mais 30 dias de prazo antes de responder às exigências — as ações já tomadas merecem reconhecimento antes de novas demandas",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { clientes: -4, reputacao: -3, sla: -1, financeiro: -2 },
        avaliacao: "ruim",
        ensinamento: "No 15º dia de uma auditoria farmacêutica, pedir mais prazo para avaliar as exigências do cliente é sinalizar que o problema não foi totalmente compreendido. O cliente está te dando o que precisa para continuar — e pedir tempo para pensar sobre isso é uma resposta que pode transformar a decisão de 'continuar monitorando' em 'rescindir'."
      },
      {
        text: "Apresentar o mapa completo de investimentos necessários para atender as exigências e pedir coparticipação da FarmaPlus nos custos de desenvolvimento do dashboard",
        risco: "medio",
        effects: { clientes: +2, financeiro: +1, tecnologia: +2, processos: +1 },
        avaliacao: "media",
        ensinamento: "Coparticipação em desenvolvimento tecnológico é uma estratégia válida em parcerias de longo prazo — mas pedida no momento errado, parece que a empresa está transferindo o custo do seu próprio problema para o cliente que acabou de ser impactado pela falha. O timing desta conversa importa tanto quanto a proposta em si."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R6 · PRESSÃO · A ANVISA Bate à Porta
  ═══════════════════════════════════════════════════════ */
  {
    title: "A ANVISA Bate à Porta",
    description: "A FarmaPlus reportou o incidente à ANVISA como parte do protocolo de farmacovigilância. Um fiscal da ANVISA liga para agendar uma vistoria nos seus armazéns frigorificados em 5 dias. O consultor de qualidade é claro: 'Estamos 60% prontos para uma vistoria. Há registros de temperatura incompletos, um armazém com equipamento fora da especificação e a documentação de treinamento está desatualizada.' O que você prioriza?",
    tags: ["logistica"],
    fase: "pressao",
    choices: [
      {
        text: "Contratar dois técnicos de refrigeração para trabalhar em regime de urgência nos 5 dias — priorizar o armazém crítico e a documentação de temperatura",
        risco: "medio",
        effects: { seguranca: +5, frota: +3, clientes: +2, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Cinco dias é tempo curto — mas suficiente para resolver os pontos mais críticos com equipe adicional. Priorizar o armazém fora de especificação e os registros de temperatura é atacar exatamente o que gerou a notificação original. Uma vistoria com 85% de conformidade tem resultado muito diferente de uma com 60%."
      },
      {
        text: "Solicitar à ANVISA um reagendamento de 30 dias para estar completamente preparado",
        risco: "alto",
        effects: { seguranca: -2, reputacao: -3, clientes: -3, processos: +1 },
        avaliacao: "ruim",
        ensinamento: "Pedir reagendamento de vistoria da ANVISA após um incidente reportado é quase sempre indeferido — e quando concedido, gera um nível de escrutínio muito maior. O fiscal que aguarda 30 dias chega com uma hipótese muito mais negativa do que o fiscal que faz a vistoria imediata."
      },
      {
        text: "Fazer a vistoria nas condições atuais com total transparência — apresentar o plano de correção para cada não conformidade encontrada",
        risco: "baixo",
        effects: { seguranca: +3, reputacao: +4, clientes: +3, processos: +4 },
        avaliacao: "boa",
        ensinamento: "Transparência com a ANVISA combinada com plano de correção documentado é a postura que transforma um processo de auto em um processo de adequação. A ANVISA tem poderes punitivos severos — mas usa a punição máxima para quem esconde, não para quem demonstra comprometimento genuíno com a correção."
      },
      {
        text: "Consultar o jurídico para entender os limites das obrigações de informação durante a vistoria — não fornecer mais do que o obrigatório por lei",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2 },
        effects: { seguranca: -3, reputacao: -4, clientes: -2, processos: -1 },
        avaliacao: "ruim",
        ensinamento: "Postura defensiva com a ANVISA em contexto de incidente farmacêutico é a receita para o pior desfecho possível. O fiscal que percebe resistência ou obstrução tem todos os incentivos para elevar o nível do processo. Transparência e cooperação não são ingenuidade — são a estratégia mais inteligente disponível."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R7 · PRESSÃO · O Armazém que Precisa Parar
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Armazém que Precisa Parar",
    description: "A vistoria da ANVISA identificou que o armazém de São Paulo está com 3 câmaras frias operando fora da faixa de temperatura especificada para medicamentos. O fiscal emite uma notificação: ou a empresa faz a adequação em 48 horas ou o armazém será interditado. As 3 câmaras representam 40% da capacidade do armazém SP — e há 12 clientes com entregas programadas nos próximos 3 dias. Como você age?",
    tags: ["logistica"],
    fase: "pressao",
    choices: [
      {
        text: "Paralisar as 3 câmaras imediatamente, acionar o armazém de Campinas para absorver o volume e comunicar os 12 clientes com transparência e novo cronograma",
        risco: "baixo",
        effects: { seguranca: +5, clientes: +2, sla: -2, processos: +3, reputacao: +3 },
        avaliacao: "boa",
        ensinamento: "Conformidade imediata com a ANVISA protege a empresa da penalidade máxima e demonstra cultura de qualidade real. Comunicar os clientes antecipadamente com plano alternativo é o que diferencia uma interrupção gerenciada de uma crise operacional. Clientes que recebem aviso com antecedência raramente cancelam contratos."
      },
      {
        text: "Contratar empresa de manutenção para trabalhar as 48 horas ininterruptamente nas câmaras — resolver sem paralisar a operação",
        risco: "medio",
        effects: { frota: +3, seguranca: +3, financeiro: -3, sla: +1 },
        avaliacao: "boa",
        ensinamento: "Manutenção emergencial nas 48 horas sem paralisar a operação é tecnicamente possível se a empresa especializada estiver disponível. O risco é que a câmara fique com operação marginal durante o reparo — o que exige monitoramento intensivo para garantir que a temperatura não saia do parâmetro durante o processo."
      },
      {
        text: "Continuar operando as câmaras em temperatura fora do parâmetro nos próximos 3 dias para cumprir as entregas — priorizar os clientes antes da regularização",
        risco: "alto",
        gestorEffects: { capitalPolitico: -3, esgotamento: +2 },
        effects: { seguranca: -6, clientes: -4, reputacao: -5, financeiro: -4 },
        avaliacao: "ruim",
        ensinamento: "Continuar operando câmaras fora de parâmetro após notificação da ANVISA é uma infração administrativa grave — com risco de interdição total, não só das câmaras. Na cadeia farmacêutica, uma segunda falha após notificação equivale a declarar que a empresa não tem cultura de qualidade e pode custar a licença de operação."
      },
      {
        text: "Subcontratar temporariamente um armazém frigorificado concorrente para absorver o volume das 3 câmaras durante a adequação",
        risco: "baixo",
        effects: { sla: +3, clientes: +3, financeiro: -2, seguranca: +3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Subcontratação emergencial de capacidade frigorificada é uma solução criativa que honra os compromissos com os clientes sem comprometer a conformidade. No mercado, armazéns concorrentes frequentemente operam acordos de reciprocidade — e a transparência sobre o motivo da subcontratação pode até fortalecer a percepção de seriedade da empresa."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R8 · PRESSÃO · O Segurador Revisa a Apólice
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Segurador Revisa a Apólice",
    description: "A seguradora que cobre a carga perecível notifica que, após o incidente dos R$620 mil, vai revisar a apólice. As novas condições propostas: aumento de 65% no prêmio anual ou inclusão de franquia de R$300k por sinistro. O CFO alerta: 'Com o prêmio mais alto, a margem do segmento refrigerado cai para 4%. Com a franquia, o risco por sinistro fica muito alto para o nosso caixa atual.' Qual é a sua resposta à seguradora?",
    tags: ["logistica"],
    fase: "pressao",
    choices: [
      {
        text: "Apresentar à seguradora todo o plano de melhoria em andamento — atualização dos sensores, novos protocolos, treinamento — para negociar um aumento menor com base em evidência de redução de risco",
        risco: "baixo",
        effects: { financeiro: +3, seguranca: +2, clientes: +1, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Seguradoras precificam risco — e evidência de redução de risco é o melhor argumento de negociação de prêmio disponível. Um dossiê de ações corretivas com cronograma e evidências pode reduzir o aumento proposto de 65% para 25-30%. Negociar com dados é sempre mais eficaz do que negociar com queixa."
      },
      {
        text: "Aceitar a franquia — é melhor do que o aumento de prêmio anual que vai comprimir a margem definitivamente",
        risco: "alto",
        effects: { financeiro: +1, seguranca: -2, clientes: -1, processos: -1 },
        avaliacao: "ruim",
        ensinamento: "Aceitar franquia de R$300k com caixa apertado é trocar margem comprimida por risco de solvência em caso de sinistro. Se uma segunda falha ocorrer, a empresa arca com R$300k de franquia em um caixa que já está sob pressão — um segundo incidente pode ser terminal."
      },
      {
        text: "Fazer cotação com outras seguradoras antes de responder — o incidente pode ter fechado menos portas do que se imagina",
        risco: "baixo",
        effects: { financeiro: +3, seguranca: +1, processos: +2, clientes: 0 },
        avaliacao: "boa",
        ensinamento: "Mercado de seguros de carga é competitivo mesmo após incidentes. Seguradoras menores ou especializadas frequentemente oferecem condições mais favoráveis do que as grandes seguradoras que aplicam aumentos automáticos pós-sinistro. A concorrência entre seguradoras é uma alavanca subutilizada por muitas empresas."
      },
      {
        text: "Sair do seguro de carga perecível e criar uma reserva interna equivalente ao prêmio anual",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { financeiro: +2, seguranca: -4, clientes: -3, reputacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Autossegurar carga farmacêutica é inviável para uma empresa de médio porte com caixa apertado: o evento que tornou o seguro caro é exatamente o tipo de evento que pode se repetir. Além disso, muitos contratos no setor farmacêutico exigem apólice de seguro ativa como cláusula contratual."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R9 · PRESSÃO · O Técnico que Quer Sair
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Técnico que Quer Sair",
    description: "Rogério, o responsável de qualidade que identificou o problema dos sensores 4 meses antes e cujo alerta foi ignorado, pede demissão. Em conversa privada ele é direto: 'Fiz a coisa certa. O problema foi ignorado. Depois da crise, todo mundo olhou para mim como se eu fosse o culpado.' Ele tem 15 anos de experiência em cadeia do frio e conhece cada câmara, cada veículo, cada protocolo da empresa. Perdê-lo agora seria um golpe técnico e moral. Como você responde?",
    tags: ["logistica"],
    fase: "pressao",
    choices: [
      {
        text: "Reconhecer publicamente que ele agiu corretamente e que a falha foi da gestão que não atuou no seu alerta — e apresentar uma contraproposta de retenção com papel de liderança formal",
        risco: "baixo",
        effects: { rh: +6, seguranca: +4, reputacao: +3, processos: +3 },
        avaliacao: "boa",
        ensinamento: "Reconhecimento público do erro de gestão e reparação da injustiça são os únicos argumentos que têm chance de reter alguém que saiu por uma questão de princípio. O técnico não quer só dinheiro — quer que a empresa demonstre que aprendeu. E o time que assiste a esse reconhecimento aprende que alertar problemas é seguro."
      },
      {
        text: "Oferecer aumento de 30% e promoção formal sem reconhecer publicamente o episódio anterior — focar na solução sem reabrir o passado",
        risco: "medio",
        effects: { rh: +2, financeiro: -2, seguranca: +1, reputacao: -1 },
        avaliacao: "media",
        ensinamento: "Reconhecimento financeiro sem reconhecimento moral raramente retém alguém que saiu por princípio. Rogério sabe que a empresa sabe que ele tinha razão — e oferecer dinheiro sem admitir isso vai parecer uma tentativa de comprar o silêncio, não de reparar a injustiça. O dinheiro precisa vir acompanhado do reconhecimento."
      },
      {
        text: "Aceitar a demissão e contratar um substituto sênior com experiência em certificação ISO — a ruptura pode ser uma oportunidade de renovação",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -3 },
        effects: { rh: -5, seguranca: -3, clientes: -2, financeiro: -3, processos: -3 },
        avaliacao: "ruim",
        ensinamento: "Deixar ir o técnico que conhece cada centímetro da operação refrigerada durante uma auditoria da ANVISA é um risco operacional e de compliance crítico. Um substituto leva de 6 a 12 meses para acumular o conhecimento que Rogério tem — e a auditoria não vai esperar esse tempo."
      },
      {
        text: "Criar um Comitê de Qualidade com Rogério como presidente e poder de veto em decisões de investimento de segurança",
        risco: "baixo",
        effects: { rh: +5, seguranca: +5, processos: +4, clientes: +2, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Transformar o problema de governança em uma solução estrutural é a resposta mais inteligente. Comitê de Qualidade com poder real de veto é o mecanismo que impede que o próximo alerta de Rogério seja ignorado — e demonstra para ele e para o time que a empresa está mudando o sistema, não apenas a pessoa na cadeira."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R10 · PRESSÃO / GATILHO · A Proposta de Parceria
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Proposta de Parceria",
    description: "Uma rede hospitalar de grande porte — com 8 hospitais em SP e MG — entra em contato. Eles querem terceirizar a logística de insumos cirúrgicos e medicamentos de alto custo. O contrato potencial: R$14M anuais, 3 anos, cláusula de SLA de 99,5% e exigência de certificação ISO e dashboard de monitoramento. 'Estamos avaliando três empresas. A decisão é em 45 dias.' É a maior oportunidade da história da empresa — e também o teste mais exigente. O que você responde?",
    tags: ["logistica"],
    fase: "pressao",
    choices: [
      {
        text: "Participar do processo seletivo com honestidade: apresentar o estado atual, o plano de certificação e propor que o contrato inicie em 90 dias — quando a empresa estará pronta",
        risco: "baixo",
        effects: { clientes: +4, reputacao: +4, seguranca: +3, processos: +3 },
        avaliacao: "boa",
        ensinamento: "Propostas honestas sobre capacidade atual ganham mais contratos de longo prazo do que propostas infladas. Uma rede hospitalar que negocia com inteligência prefere um parceiro que sabe o que pode entregar a um que promete tudo e falha na execução — especialmente quando insumos cirúrgicos estão em jogo."
      },
      {
        text: "Aceitar a proposta nas condições deles e construir a capacidade necessária nos 45 dias com regime de guerra interno",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1, esgotamento: +2 },
        effects: { financeiro: -4, rh: -4, sla: -3, seguranca: -2, clientes: -2 },
        avaliacao: "ruim",
        ensinamento: "Aceitar contrato de insumos cirúrgicos com SLA de 99,5% sem estar certificado é o risco operacional mais alto possível em logística de saúde. Uma falha na entrega de insumos cirúrgicos não é uma multa contratual — é um risco à vida do paciente e ao funcionamento do hospital. O nível de exigência é incomparável com qualquer outro setor."
      },
      {
        text: "Propor uma parceria de transição: no primeiro ano, operar como subcontratado de outro operador certificado para construir o track record exigido",
        risco: "baixo",
        effects: { clientes: +3, seguranca: +3, reputacao: +2, processos: +4, financeiro: +1 },
        avaliacao: "boa",
        ensinamento: "Subcontratação como modelo de entrada em um mercado que exige certificação é uma estratégia de crescimento inteligente. A rede hospitalar fica satisfeita com um operador qualificado, a empresa constrói track record e aprende os requisitos com a operação real — e no contrato seguinte está pronta para ser a titular."
      },
      {
        text: "Declinar a oportunidade — a empresa ainda não está pronta e assumir esse contrato agora pode destruir o que está sendo construído",
        risco: "medio",
        effects: { seguranca: +2, sla: +1, rh: +1, financeiro: -2, clientes: -1 },
        avaliacao: "media",
        ensinamento: "Recusar uma oportunidade de R$14M é uma decisão dolorosa — mas estrategicamente defensável se a empresa genuinamente não tem capacidade. O problema é que 'não estamos prontos' pode virar o status permanente se não houver um plano claro de quando a empresa vai estar pronta e o que muda até lá."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R11 · DECISÃO CRÍTICA · A Certificação ou os Sensores?
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Certificação ou os Sensores?",
    description: "Com o caixa sob pressão, você precisa escolher onde concentrar R$400k disponíveis nos próximos 90 dias. O consultor apresenta duas opções excludentes: (A) Completar a atualização de todos os 87 sensores de temperatura da frota — resolve 100% da conformidade técnica imediata; (B) Iniciar o processo de certificação ISO para cadeia do frio — abre o mercado hospitalar e farmacêutico premium mas leva 9 meses. Qual é a sua escolha?",
    tags: ["logistica"],
    fase: "decisao",
    choices: [
      {
        text: "Opção A: completar os sensores — a base técnica precisa estar 100% correta antes de qualquer certificação",
        risco: "baixo",
        effects: { seguranca: +6, frota: +4, clientes: +3, sla: +3, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Certificação sem conformidade técnica real é um risco duplo: o auditor da ISO vai encontrar os gaps, e o cliente que entrou por causa da certificação vai encontrar a operação abaixo do padrão esperado. A sequência correta é: operação correta primeiro, certificação depois — não o inverso."
      },
      {
        text: "Opção B: iniciar a certificação — é o que abre os contratos de maior valor e o processo vai exigir a atualização dos sensores de qualquer forma",
        risco: "medio",
        effects: { reputacao: +4, clientes: +3, processos: +3, seguranca: +2, financeiro: -3 },
        avaliacao: "media",
        ensinamento: "Iniciar a certificação antes de resolver todos os gaps técnicos é possível — o processo tem 9 meses e pode absorver as correções. O risco é que a auditoria de pré-certificação aponte não conformidades que atrasam o processo e geram custo adicional. É uma corrida onde os checkpoints intermediários importam tanto quanto o destino."
      },
      {
        text: "Dividir os R$400k: R$250k nos sensores mais críticos (os que atendem hospitais e farmácias) e R$150k no início do processo de certificação",
        risco: "baixo",
        effects: { seguranca: +4, reputacao: +3, clientes: +4, processos: +3, financeiro: -3 },
        avaliacao: "boa",
        ensinamento: "Alocação híbrida que resolve o risco imediato mais crítico e inicia o investimento de longo prazo é uma estratégia de portfólio clássica. Completar os sensores dos veículos que atendem farmácias e hospitais elimina 80% do risco com 60% do investimento — e o processo de certificação já começa a rodar em paralelo."
      },
      {
        text: "Buscar captação de R$800k para fazer os dois ao mesmo tempo — não escolher entre urgente e importante quando se pode ter os dois",
        risco: "medio",
        effects: { financeiro: +1, seguranca: +3, clientes: +3, processos: +2, frota: +2 },
        avaliacao: "media",
        ensinamento: "Captação para resolver um problema de compliance é viável — mas leva tempo que a empresa pode não ter. Depender da captação para manter a operação adequada é o sinal de uma empresa que está gerenciando crise com dívida em vez de com decisão. A boa notícia é que bancos e fundos conhecem o mercado de cadeia do frio e reconhecem o ROI do investimento."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R12 · DECISÃO CRÍTICA · O Modelo de Precificação
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Modelo de Precificação",
    description: "Com a operação se estabilizando, o diretor comercial apresenta um dilema: os contratos atuais foram negociados há 3 anos com margens de 12%. Com o aumento de custo de energia (22%), seguros (40%) e manutenção, a margem real caiu para 4,8%. 'Precisamos reajustar preços ou cortar custos. Mas reajuste pode perder clientes e corte de custos pode afetar qualidade.' O que você decide?",
    tags: ["logistica"],
    fase: "decisao",
    choices: [
      {
        text: "Propor reajuste transparente e individualizado para cada cliente — apresentar os dados reais de custo e o impacto no serviço se os preços não subirem",
        risco: "medio",
        effects: { financeiro: +5, clientes: +2, reputacao: +3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Reajuste com transparência sobre os fundamentos é muito mais eficaz do que reajuste por decreto. Clientes B2B entendem que energia subiu 22% — eles mesmos sentiram o impacto. A empresa que explica os números antes de pedir o aumento tem taxa de aceitação muito maior do que a que comunica o reajuste como fato consumado."
      },
      {
        text: "Criar dois níveis de serviço: standard (preço atual, sem dashboard de monitoramento) e premium (reajuste de 18%, com dashboard, SLA garantido e protocolo de resposta a falhas)",
        risco: "baixo",
        effects: { financeiro: +4, clientes: +4, tecnologia: +3, processos: +3, reputacao: +3 },
        avaliacao: "boa",
        ensinamento: "Tiering de serviço é uma estratégia de precificação que deixa o cliente escolher o nível de risco que aceita — e frequentemente migra para o premium quando percebe o valor real do monitoramento contínuo. Para o operador, o premium tem margem melhor e cria diferenciação competitiva real."
      },
      {
        text: "Absorver o aumento de custos por mais 12 meses e compensar com eficiência operacional — reajustar clientes agora é arriscar a carteira já fragilizada",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { financeiro: -4, clientes: +2, sla: -1, rh: -2 },
        avaliacao: "ruim",
        ensinamento: "Absorver 12 meses de margem comprimida sem reajuste é consumir a reserva financeira que a empresa precisa para os investimentos de compliance e tecnologia. Ao final dos 12 meses, a empresa estará mais fraca financeiramente e vai precisar fazer um reajuste ainda maior — o que é muito mais difícil de negociar do que um ajuste incremental."
      },
      {
        text: "Renegociar os contratos de energia e manutenção antes de repassar qualquer custo ao cliente — reduzir o custo na fonte antes de aumentar o preço",
        risco: "baixo",
        effects: { financeiro: +3, processos: +3, frota: +2, clientes: +1 },
        avaliacao: "boa",
        ensinamento: "Renegociação de contratos de fornecimento antes do repasse ao cliente demonstra responsabilidade com eficiência — e frequentemente revela economias que a pressão cotidiana impede de enxergar. Um processo estruturado de sourcing em energia e manutenção pode reduzir a necessidade de reajuste em 30-40%."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R13 · DECISÃO CRÍTICA · A Expansão para o Rio
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Expansão para o Rio",
    description: "Um cliente farmacêutico de médio porte quer expandir o contrato atual para incluir cobertura no Rio de Janeiro, mas você não tem armazém frigorificado no RJ. Três opções na mesa: (A) alugar um galpão e montar o armazém em 90 dias; (B) parceria com um operador local do RJ; (C) recusar e indicar o cliente para um parceiro referenciado no RJ. O contrato vale R$3,2M adicionais por ano. O que você decide?",
    tags: ["logistica"],
    fase: "decisao",
    choices: [
      {
        text: "Opção A: montar o armazém próprio no RJ — a expansão geográfica é um ativo estratégico de longo prazo",
        risco: "alto",
        effects: { clientes: +3, financeiro: -5, frota: -2, processos: -3, sla: -2 },
        avaliacao: "media",
        ensinamento: "Montar um armazém frigorificado certificado em 90 dias enquanto a operação principal ainda está em fase de consolidação é um risco operacional elevado. O prazo de 90 dias é viável para o galpão — mas a certificação das câmaras e a adequação aos protocolos da ANVISA RJ podem levar o dobro do tempo."
      },
      {
        text: "Opção B: parceria com operador local — entrar no RJ sem o risco do investimento imediato",
        risco: "baixo",
        effects: { clientes: +4, financeiro: +2, processos: +2, seguranca: +2, sla: +2 },
        avaliacao: "boa",
        ensinamento: "Parceria com operador local certificado é a forma mais eficiente de expandir território sem comprometer capital nem qualidade. O risco é a dependência do parceiro — que pode ser mitigado com SLA contratual, inspeções periódicas e cláusula de exclusividade para o cliente compartilhado."
      },
      {
        text: "Opção C: recusar e indicar um parceiro referenciado — preservar a qualidade da operação atual",
        risco: "medio",
        effects: { reputacao: +2, clientes: -1, financeiro: -1, processos: +2 },
        avaliacao: "media",
        ensinamento: "Recusar crescimento para preservar qualidade é uma postura respeitável — mas a indicação de parceiro sem nenhum retorno comercial perde uma oportunidade. Um modelo de parceria com comissão de indicação mantém a empresa no relacionamento com o cliente e cria uma receita marginal sem risco operacional."
      },
      {
        text: "Propor um modelo híbrido: terceiros no primeiro ano com meta de abertura de armazém próprio no segundo ano se o volume justificar",
        risco: "baixo",
        effects: { clientes: +5, financeiro: +3, processos: +3, sla: +3, seguranca: +2 },
        avaliacao: "boa",
        ensinamento: "Modelo híbrido com gate de volume para investimento próprio é a estratégia mais inteligente em expansão geográfica: valida a demanda antes do investimento fixo, mantém a relação com o cliente e cria um caminho natural para internalização quando o volume justifica. É crescimento com critério, não com apostas."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R14 · DECISÃO CRÍTICA · O Contrato com o Hospital
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Contrato com o Hospital",
    description: "A rede hospitalar voltou. Depois de 90 dias, eles reavaliam a empresa e reconhecem a evolução. A proposta está na mesa: R$14M por 3 anos, mas agora com condições ajustadas — SLA de 99% (não mais 99,5%) e início em 120 dias. A empresa ainda não concluiu a certificação ISO, mas está com 70% do processo. O consultor de qualidade diz: 'Provavelmente chegamos na certificação em 60 a 75 dias.' O sócio-fundador quer a sua posição.",
    tags: ["logistica"],
    fase: "decisao",
    choices: [
      {
        text: "Recomendar aceitar o contrato com início em 120 dias — os 20 a 60 dias de gap entre a certificação provável e o início do contrato são gerenciáveis com transparência",
        risco: "medio",
        effects: { clientes: +5, financeiro: +6, reputacao: +4, seguranca: +2, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Aceitar um contrato estratégico com gap de certificação de 20-60 dias é defensável quando há transparência com o cliente e caminho claro de certificação documentado. A rede hospitalar que ajustou o SLA para 99% já demonstrou que quer fechar negócio — e adiamentos de certificação são parte normal do processo para quem avalia empresas em evolução."
      },
      {
        text: "Recomendar assinar condicionado à certificação — contrato em vigor somente após emissão do certificado ISO",
        risco: "baixo",
        effects: { clientes: +3, seguranca: +5, reputacao: +3, financeiro: +4, processos: +3 },
        avaliacao: "boa",
        ensinamento: "Contrato condicional à certificação é uma postura de integridade que o cliente hospitalar vai respeitar — e que elimina o risco jurídico de operar em não conformidade. O processo de assinatura pode ocorrer antes; a vigência, após a certificação. É uma cláusula padrão em contratos farmacêuticos que o setor conhece bem."
      },
      {
        text: "Recomendar não assinar — 120 dias com 70% de certificação e incerteza de prazo é risco demais com um cliente tão exigente",
        risco: "medio",
        gestorEffects: { capitalPolitico: -2 },
        effects: { financeiro: -3, clientes: -2, reputacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Recusar R$14M quando a empresa está a 60 dias da certificação e o cliente ajustou as condições é uma decisão difícil de defender interna e externamente. A rede hospitalar que voltou com condições flexibilizadas é um sinal claro de que quer fechar — e esse tipo de sinal raramente aparece duas vezes."
      },
      {
        text: "Recomendar aceitar e contratar uma segunda consultoria para acelerar a certificação para 45 dias — garantir o prazo com recurso adicional",
        risco: "baixo",
        effects: { clientes: +5, financeiro: +4, seguranca: +4, processos: +4, reputacao: +4 },
        avaliacao: "boa",
        ensinamento: "Investimento adicional em consultoria para acelerar certificação quando há um contrato de R$14M na mesa é um ROI extremamente claro. Uma consultoria adicional de R$80k que abrevia o prazo em 3 semanas enquanto fecha um contrato de R$14M é uma das melhores alocações de recurso possíveis."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R15 · DECISÃO FINAL · O Posicionamento Estratégico
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Posicionamento Estratégico",
    description: "Com a FarmaPlus reconquistada, a certificação encaminhada e o contrato hospitalar em negociação, você precisa definir o posicionamento estratégico da empresa para os próximos 3 anos. O mercado de cadeia do frio está crescendo, mas também está se tornando mais regulado e competitivo. Onde a empresa vai competir e como?",
    tags: ["logistica"],
    fase: "decisao",
    choices: [
      {
        text: "Especialização em logística farmacêutica e hospitalar: ser o operador de referência em compliance e rastreabilidade para o setor de saúde",
        effects: { seguranca: +5, reputacao: +5, clientes: +4, financeiro: +3, tecnologia: +3 },
        avaliacao: "boa",
        ensinamento: "Especialização em saúde é o nicho de maior crescimento e maior barreira de entrada em logística refrigerada. Compliance rigoroso, rastreabilidade e certificações não são custos — são o produto que o setor de saúde compra. A empresa que se tornar referência nesse nicho vai competir em condições completamente diferentes do mercado geral."
      },
      {
        text: "Expansão na cadeia alimentar premium: supermercados premium, exportação de proteínas e hortifrutigranjeiros de alta rastreabilidade",
        effects: { clientes: +4, financeiro: +4, frota: +3, processos: +3, reputacao: +3 },
        avaliacao: "boa",
        ensinamento: "O segmento alimentar premium tem crescimento acelerado com a expansão do e-commerce de alimentos frescos e supermercados de alto padrão. Os requisitos de rastreabilidade e cadeia do frio são similares ao farmacêutico — a certificação já em andamento é diretamente aplicável a esse mercado também."
      },
      {
        text: "Plataforma de cadeia do frio como serviço: tecnologia própria de monitoramento licenciada para pequenos operadores refrigerados",
        effects: { tecnologia: +5, financeiro: +3, reputacao: +4, processos: +4, clientes: +2 },
        avaliacao: "boa",
        ensinamento: "Transformar o problema técnico que quase destruiu a empresa em um produto de tecnologia que outros operadores precisam é uma estratégia de pivô elegante. O dashboard de monitoramento que a FarmaPlus exigiu pode ser licenciado para operadores que não têm capacidade de desenvolver internamente — criando uma receita recorrente além da operação física."
      },
      {
        text: "Crescimento de volume: manter a cadeia do frio como base e crescer em outras modalidades — cargas secas, last-mile urbano — para diversificar",
        effects: { financeiro: +3, clientes: +2, rh: -2, processos: -2, sla: -2, seguranca: -1 },
        avaliacao: "media",
        ensinamento: "Diversificação modal antes de dominar completamente a especialização é dispersão de energia. As competências de cadeia do frio certificada não se transferem automaticamente para cargas secas e last-mile — e a empresa que tenta ser competitiva em dois mundos simultaneamente frequentemente não domina nenhum dos dois."
      }
    ]
  }

],

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [2] · Fulfillment E-commerce — Capacidade no Limite
   Contexto: 2 CDs em Campinas, 310 funcionários, R$45M faturamento,
   marketplace de grande porte elevou o volume em 62%, CD operando
   a 110% da capacidade, pedidos com problema saltaram de 1,2% para
   4,7% (limite contratual: 2%), marketplace emitiu alerta formal.
══════════════════════════════════════════════════════════════════ */
[

  /* ═══════════════════════════════════════════════════════
     R1 · DIAGNÓSTICO · O Painel do Marketplace
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Painel do Marketplace",
    description: "Você acessa o painel de performance do marketplace pela primeira vez como gestor responsável. Os dados são brutais: 4,7% de pedidos com problema (acima do limite de 2%), tempo médio de despacho em 5,2 horas (vs. SLA de 4 horas), e um alerta vermelho piscando: 'Performance em avaliação — rescisão possível se índice não retornar a 2% em 21 dias.' O que você faz primeiro?",
    tags: ["logistica"],
    fase: "diagnostico",
    choices: [
      {
        text: "Entrar em contato imediato com o gerente de conta do marketplace — entender exatamente o que está sendo medido e o que eles precisam ver para manter o contrato",
        risco: "baixo",
        effects: { clientes: +4, processos: +3, sla: +2 },
        avaliacao: "boa",
        ensinamento: "Saber exatamente como o cliente mede o problema é o pré-requisito de qualquer solução. Marketplaces medem dezenas de métricas simultaneamente — mas têm 2 ou 3 que são dealbreakers. O gestor de conta sabe exatamente quais são e o que vai segurar o contrato. Essa conversa vale mais do que qualquer análise interna de dados."
      },
      {
        text: "Mapear as causas-raiz dos 4,7% de pedidos com problema — separar por tipo de erro (separação, embalagem, prazo, endereço)",
        risco: "baixo",
        effects: { processos: +4, sla: +2, tecnologia: +2, rh: +1 },
        avaliacao: "boa",
        ensinamento: "Pareto dos erros em fulfillment quase sempre revela que 80% dos problemas têm 2 ou 3 causas-raiz. Sem esse mapa, qualquer intervenção é aleatória. A análise de causa-raiz por tipo de erro direciona os recursos para onde o impacto é maior — e em 21 dias, cada recurso mal alocado é um dia perdido."
      },
      {
        text: "Convocar reunião de emergência com toda a equipe do CD para comunicar a situação e cobrar comprometimento",
        risco: "medio",
        effects: { rh: -2, processos: +1, sla: +1 },
        avaliacao: "ruim",
        ensinamento: "Reunião de crise com toda a equipe sem diagnóstico e sem soluções concretas gera ansiedade sem direção. O time já sente a pressão — uma reunião de cobrança antes de um plano de ação aumenta o estresse sem aumentar a performance. O gestor que convoca o time depois de ter o diagnóstico e as soluções tem uma conversa completamente diferente."
      },
      {
        text: "Contratar imediatamente 30 operadores temporários para aumentar a capacidade de separação e despacho",
        risco: "alto",
        effects: { rh: +1, sla: -1, processos: -3, financeiro: -3 },
        avaliacao: "ruim",
        ensinamento: "Adicionar mão de obra sem processo estruturado em um CD já operando acima da capacidade piora a performance antes de melhorá-la. Operadores novos em ambiente caótico geram mais erros nos primeiros 15 dias. A capacidade adicional só ajuda quando o processo está claro — do contrário, é ruído adicional no sistema."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R2 · DIAGNÓSTICO · O Layout que Não Escala
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Layout que Não Escala",
    description: "Um consultor de operações passa 2 dias observando o CD e apresenta o diagnóstico: o layout foi projetado para 12 mil pedidos/dia e está processando 19 mil. Os corredores de picking estão com congestionamento nas horas de pico, o endereçamento dos produtos não reflete o giro real (os mais vendidos ficam nos pontos mais distantes) e o processo de conferência cria um gargalo que atrasa o despacho em 40 minutos por lote. Qual é a sua prioridade de intervenção?",
    tags: ["logistica"],
    fase: "diagnostico",
    choices: [
      {
        text: "Reorganizar o endereçamento dos produtos: mover os 20% de SKUs de maior giro para as posições de maior acesso — muda em 72 horas e impacta imediatamente a velocidade de picking",
        risco: "baixo",
        effects: { processos: +5, sla: +4, rh: +2, tecnologia: +1 },
        avaliacao: "boa",
        ensinamento: "Reorganização por curva ABC de giro é a intervenção de maior impacto e menor custo em picking. Os 20% de SKUs mais vendidos respondem tipicamente por 80% do volume de movimento — colocá-los nos primeiros metros do corredor reduz a distância percorrida por pedido em 30 a 40%. É uma mudança de 72 horas que os operadores sentem no mesmo dia."
      },
      {
        text: "Reestruturar completamente o processo de conferência para eliminar o gargalo de 40 minutos por lote",
        risco: "medio",
        effects: { processos: +4, sla: +4, tecnologia: +3, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Conferência ineficiente é frequentemente o maior gargalo em fulfillment de alto volume. Substituir conferência manual por conferência por amostragem com barcode scan pode reduzir o tempo de 40 minutos para 8 minutos por lote — sem reduzir a taxa de acuracidade em mais de 0,1%."
      },
      {
        text: "Expandir imediatamente para o CD secundário que está com 60% de capacidade — redistribuir o volume entre os dois CDs",
        risco: "baixo",
        effects: { sla: +3, processos: +3, financeiro: -2, rh: +1 },
        avaliacao: "boa",
        ensinamento: "Redistribuição de volume para o CD com capacidade disponível é a resposta mais rápida para excesso de demanda. O custo logístico de redistribuição interna é uma fração do custo de uma rescisão de contrato. A chave é identificar quais pedidos (por região, por SKU) fazem mais sentido no CD secundário."
      },
      {
        text: "Contratar empresa de engenharia para redesenhar o layout completo do CD — resolver o problema pela raiz",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { processos: +2, sla: -3, clientes: -3, financeiro: -4 },
        avaliacao: "ruim",
        ensinamento: "Redesenho completo de layout é um projeto de 60 a 90 dias que vai piorar a operação durante a execução. Em um contexto de 21 dias para entregar resultado ao marketplace, uma intervenção que piora antes de melhorar é o caminho mais curto para perder o contrato."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R3 · DIAGNÓSTICO · O Time Exausto
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Time Exausto",
    description: "A supervisora do turno noturno pede uma reunião urgente. Ela apresenta dados que havia levantado por conta própria: 23% de absenteísmo nos últimos 15 dias (vs. média histórica de 8%), 3 acidentes de trabalho leves no mesmo período, e uma pesquisa informal com 40 operadores mostrando que 68% estão 'muito cansados' ou 'extremamente cansados'. 'As horas extras viraram a regra há 6 semanas. As pessoas estão no limite físico.' Como você responde?",
    tags: ["logistica"],
    fase: "diagnostico",
    choices: [
      {
        text: "Contratar imediatamente 40 temporários e distribuir as horas extras para que ninguém trabalhe mais de 2 horas acima da jornada por dia",
        risco: "baixo",
        effects: { rh: +5, seguranca: +3, sla: +2, financeiro: -3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Trabalhador exausto comete mais erros — e em fulfillment de e-commerce, erro de separação é diretamente o índice que está ameaçando o contrato. A contratação de temporários é o investimento mais direto na redução dos 4,7% de pedidos com problema. O custo dos temporários é muito menor do que o custo de perder o contrato."
      },
      {
        text: "Implementar rodízio de turnos com 4 equipes em vez de 3 — distribuir o volume sem aumentar o headcount total",
        risco: "medio",
        effects: { rh: +3, sla: +2, processos: +2, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Sistema de 4 turnos reduz a jornada efetiva de cada operador sem aumentar proporcionalmente a folha — apenas redistribui o mesmo headcount em mais turnos. O investimento é em reorganização do sistema, não em contratação. Para CD de e-commerce que opera 18 a 20 horas por dia, esse modelo é padrão de eficiência."
      },
      {
        text: "Oferecer bônus adicional de R$500 por semana para quem aceitar manter as horas extras voluntariamente",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2 },
        effects: { rh: -3, seguranca: -4, sla: -2, financeiro: -3 },
        avaliacao: "ruim",
        ensinamento: "Pagar para pessoas exaustas continuarem exaustas é a receita para o próximo acidente. Após 6 semanas de sobrecarga, o corpo não compensa o cansaço com dinheiro. O bônus pode aumentar a presença de curto prazo, mas a taxa de erros de um operador exausto é 3 a 4 vezes maior do que a de um descansado — e os acidentes são irreversíveis."
      },
      {
        text: "Reconhecer o esforço da equipe publicamente e criar um plano de folgas compensatórias para o mês seguinte — manter o ritmo atual por mais 3 semanas até a estabilização",
        risco: "alto",
        effects: { rh: -4, seguranca: -3, sla: -3, clientes: -2 },
        avaliacao: "ruim",
        ensinamento: "Prometer folgas futuras para uma equipe já além do limite físico não muda a realidade do dia de amanhã. 3 semanas de sobrecarga com 23% de absenteísmo e 3 acidentes em 15 dias vai resultar em mais acidentes e mais absenteísmo — exatamente quando o marketplace está medindo o desempenho com lupa."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R4 · DIAGNÓSTICO · O WMS que Não Foi
  ═══════════════════════════════════════════════════════ */
  {
    title: "O WMS que Não Foi",
    description: "O coordenador de TI revela que um projeto de implementação de WMS (Warehouse Management System) foi iniciado 14 meses atrás, chegou a 65% de implementação e foi paralisado por restrição orçamentária. 'Se tivéssemos o WMS completo, teríamos reduzido o erro de separação em pelo menos 70%,' ele explica. 'O sistema atual não tem integração em tempo real com o painel do marketplace, o que significa que somos os últimos a saber quando um pedido está com problema.' Como você decide sobre o WMS?",
    tags: ["logistica"],
    fase: "diagnostico",
    choices: [
      {
        text: "Reativar o projeto de WMS imediatamente e completar os 35% restantes — o investimento já foi feito, só falta cruzar a linha",
        risco: "medio",
        effects: { tecnologia: +5, processos: +4, sla: +3, financeiro: -3 },
        avaliacao: "boa",
        ensinamento: "WMS 65% implementado é um ativo parado que deteriora com o tempo — o time que participou da implementação parcial vai saindo, a documentação vai ficando desatualizada e o custo de retomada aumenta a cada mês. Completar o investimento que já foi feito tem ROI muito mais claro do que iniciar um novo projeto."
      },
      {
        text: "Implementar apenas o módulo de integração com o marketplace como prioridade — resolver o gap de visibilidade em tempo real antes de qualquer outra coisa",
        risco: "baixo",
        effects: { tecnologia: +4, clientes: +4, processos: +3, sla: +4, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Priorizar o módulo de integração com o marketplace é atacar diretamente o problema que está ameaçando o contrato: visibilidade em tempo real. Quando o marketplace vê que a empresa monitora os mesmos dados que eles, a percepção de controle e comprometimento muda radicalmente — e isso tem valor imediato na negociação do prazo."
      },
      {
        text: "Abandonar o WMS atual e avaliar soluções SaaS mais modernas que implementam em 4 semanas",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2 },
        effects: { tecnologia: +2, processos: -3, sla: -3, financeiro: -4, rh: -2 },
        avaliacao: "ruim",
        ensinamento: "Abandonar 65% de implementação de WMS para começar do zero com SaaS genérico é destruir o investimento feito e adicionar o risco de um novo processo de mudança em um CD já sob pressão máxima. Migrações de WMS em ambiente de produção ativo têm taxa de sucesso em 4 semanas extremamente baixa."
      },
      {
        text: "Manter o sistema atual e compensar os gaps com processos manuais adicionais enquanto a operação se estabiliza",
        risco: "alto",
        effects: { tecnologia: -1, processos: -2, sla: -2, rh: -3 },
        avaliacao: "ruim",
        ensinamento: "Compensar gaps de sistema com processos manuais em CD de alto volume é a mesma abordagem que levou à crise atual. O erro de separação que gerou os 4,7% de pedidos com problema é exatamente o tipo de falha que o WMS previne automaticamente. Mais processos manuais em um time exausto vão gerar mais erros, não menos."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R5 · DIAGNÓSTICO · O Dia 21 do Prazo
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Dia 21 do Prazo",
    description: "No 21º dia, o painel do marketplace mostra: taxa de pedidos com problema em 2,8% — melhor do que os 4,7%, mas ainda acima do limite contratual de 2%. Você tem uma reunião em 2 horas com o gerente de contas do marketplace. O módulo de integração está ativo, o endereçamento foi reorganizado e os temporários foram contratados. A trajetória é positiva — mas você não cruzou a linha. O que você apresenta na reunião?",
    tags: ["logistica"],
    fase: "diagnostico",
    choices: [
      {
        text: "Apresentar a trajetória: de 4,7% para 2,8% em 21 dias com as ações específicas que geraram cada melhoria — e propor mais 14 dias com metas semanais",
        risco: "baixo",
        effects: { clientes: +5, processos: +3, sla: +2, reputacao: +3 },
        avaliacao: "boa",
        ensinamento: "Narrativa de trajetória com evidência de causalidade é muito mais persuasiva do que um número isolado. A queda de 4,7% para 2,8% em 21 dias com ações documentadas demonstra que a empresa entende o problema e tem capacidade de correção. O gerente de contas que vê isso sabe que 2% em 14 dias é crível — e vai defender internamente."
      },
      {
        text: "Pedir uma revisão do limite contratual de 2% — o padrão atual é mais exigente do que a média do setor",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2 },
        effects: { clientes: -4, reputacao: -3, sla: -1 },
        avaliacao: "ruim",
        ensinamento: "Pedir revisão de SLA no dia do prazo de um contrato em avaliação de rescisão é uma das piores estratégias possíveis. O marketplace interpreta como admissão de que a empresa não consegue atingir o padrão — e que vai continuar não conseguindo. A negociação de limite deve acontecer antes do incidente, não no dia da auditoria."
      },
      {
        text: "Compartilhar acesso ao painel interno de monitoramento em tempo real — dar visibilidade completa da operação para o gerente de contas",
        risco: "baixo",
        effects: { clientes: +4, tecnologia: +2, reputacao: +4, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Dar acesso de visibilidade ao cliente é um gesto de parceria que poucos operadores fazem — e que transforma a dinâmica de uma relação de cobrança em uma relação de colaboração. O gerente de contas que monitora junto com você tem todos os incentivos para ser um aliado interno, não um adversário."
      },
      {
        text: "Não ir à reunião — enviar relatório por e-mail e pedir reagendamento para quando o índice estiver abaixo de 2%",
        risco: "alto",
        effects: { clientes: -6, reputacao: -5, sla: -2, financeiro: -3 },
        avaliacao: "ruim",
        ensinamento: "Não comparecer à reunião convocada pelo cliente no prazo acordado é uma das piores decisões possíveis em gestão de relacionamento B2B. O marketplace vai interpretar como abandono da relação — e processar a rescisão antes mesmo de receber o relatório por e-mail. Em momentos críticos, a presença é insubstituível."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R6 · PRESSÃO · O Segundo Marketplace Aparece
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Segundo Marketplace Aparece",
    description: "Enquanto você tenta estabilizar a operação para o primeiro marketplace, um segundo — menor mas em crescimento acelerado — propõe um contrato de R$6M anuais com início imediato. 'Estamos insatisfeitos com nosso operador atual e queremos fechar em 7 dias,' diz o diretor de operações deles. Seu time operacional é unânime: 'Não temos capacidade agora.' O diretor comercial é igualmente unânime: 'Não podemos perder essa janela.' Como você decide?",
    tags: ["logistica"],
    fase: "pressao",
    choices: [
      {
        text: "Recusar o contrato imediato e propor início em 60 dias — ser honesto sobre a capacidade atual",
        risco: "baixo",
        effects: { clientes: +2, processos: +2, sla: +2, rh: +1 },
        avaliacao: "boa",
        ensinamento: "Recusar crescimento que a operação não comporta no momento certo é uma das decisões mais difíceis e mais importantes da gestão. Aceitar um segundo contrato enquanto o primeiro está em risco de rescisão é apostar em dois fronts com metade dos recursos — e provavelmente perder os dois."
      },
      {
        text: "Aceitar o contrato e alocar o CD secundário exclusivamente para o novo marketplace — manter separados os dois clientes",
        risco: "medio",
        effects: { clientes: +3, financeiro: +4, processos: -3, sla: -2, rh: -3 },
        avaliacao: "media",
        ensinamento: "Separação de CDs por cliente é uma solução criativa — mas o CD secundário foi a válvula de escape da operação principal. Retirá-lo como buffer enquanto o primeiro marketplace está em monitoramento de performance é correr dois riscos simultâneos com a mesma estrutura de suporte."
      },
      {
        text: "Negociar com o segundo marketplace: fechar o contrato hoje, mas com início em 45 dias e volume crescente — piloto de 3 mil pedidos/dia no primeiro mês",
        risco: "baixo",
        effects: { clientes: +5, financeiro: +3, processos: +3, sla: +2, rh: +1 },
        avaliacao: "boa",
        ensinamento: "Contrato com ramp-up estruturado é a resposta que satisfaz o cliente sem destruir a operação. O segundo marketplace aceita início em 45 dias quando a alternativa é continuar insatisfeito com o operador atual. E o piloto de 3 mil pedidos/dia é o suficiente para demonstrar a qualidade da operação antes de escalar."
      },
      {
        text: "Usar a proposta do segundo marketplace como alavanca para renegociar os termos do primeiro — mostrar que a empresa tem alternativas",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2 },
        effects: { clientes: -4, reputacao: -3, processos: -1 },
        avaliacao: "ruim",
        ensinamento: "Usar uma proposta externa como ameaça para renegociar com um cliente que está avaliando rescisão é um erro estratégico grave. O marketplace em avaliação vai interpretar como sinal de que a empresa está mais interessada em negociar do que em resolver o problema operacional — e vai acelerar o processo de rescisão."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R7 · PRESSÃO · O Sinistro no CD
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Sinistro no CD",
    description: "Uma empilhadeira colide com uma estante de armazenagem no CD principal. Resultado: 3 operadores com ferimentos leves, 400 SKUs danificados e o corredor B completamente bloqueado por 72 horas. O corredor B é responsável por 30% do volume de separação do CD. O marketplace tem 1.200 pedidos programados para despacho nas próximas 24 horas. Como você age?",
    tags: ["logistica"],
    fase: "pressao",
    choices: [
      {
        text: "Cuidar dos 3 operadores feridos imediatamente, acionar o seguro e comunicar o marketplace com transparência sobre o impacto nas próximas 72 horas",
        risco: "baixo",
        effects: { seguranca: +3, clientes: +2, rh: +3, reputacao: +3 },
        avaliacao: "boa",
        ensinamento: "Em sinistros com lesionados, o cuidado com as pessoas é a prioridade absoluta — não a logística. Clientes B2B maduros compreendem eventos de força maior quando comunicados com transparência e rapidez. A empresa que cuida dos seus colaboradores publicamente também demonstra ao cliente como vai tratar os problemas que ele tiver."
      },
      {
        text: "Redistribuir os 1.200 pedidos para o CD secundário imediatamente — resolver a logística antes de tratar as demais consequências",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2 },
        effects: { sla: +1, rh: -4, seguranca: -2, processos: -2 },
        avaliacao: "ruim",
        ensinamento: "Priorizar a logística sobre o cuidado com os feridos é uma decisão que o time nunca esquece. Operadores que assistiram ao gestor correr para os pedidos antes de chamar o médico tomam uma decisão permanente sobre como se relacionar com a empresa. A reputação interna que se perde em um momento desses leva anos para reconstruir."
      },
      {
        text: "Paralisar toda a operação por 4 horas para limpeza, segurança e nova alocação planejada antes de retomar",
        risco: "medio",
        effects: { seguranca: +4, processos: +2, rh: +2, sla: -3, clientes: -2 },
        avaliacao: "media",
        ensinamento: "Pausa forçada para reorganização planejada é mais eficiente do que retomada parcial caótica. 4 horas de parada com plano de retomada produz melhores resultados nas 68 horas seguintes do que uma retomada imediata com o time em estado de choque e o corredor ainda parcialmente comprometido."
      },
      {
        text: "Subcontratar uma equipe de separação externa para operar a partir do corredor B durante as 72 horas de bloqueio",
        risco: "medio",
        effects: { sla: +2, financeiro: -2, processos: -1, seguranca: -1, clientes: +2 },
        avaliacao: "media",
        ensinamento: "Subcontratação de emergência para manutenção de capacidade operacional é uma solução que mantém o SLA com custo adicional. O risco é a segurança: operadores externos em um ambiente que acabou de ter um acidente grave exigem briefing intensivo — e a falta desse briefing pode gerar um segundo incidente."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R8 · PRESSÃO · A Demissão do Gerente de CD
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Demissão do Gerente de CD",
    description: "O gerente do CD principal — 9 anos de casa, domina cada processo da operação — pede demissão. Motivo revelado na conversa de saída: 'Fui ignorado quando alertei que o CD não estava pronto para absorver o marketplace. Agora todo mundo me trata como culpado pelo problema que eu tentei evitar.' Ele tem 3 propostas de empresas concorrentes. Como você responde?",
    tags: ["logistica"],
    fase: "pressao",
    choices: [
      {
        text: "Reconhecer que ele tinha razão, que a decisão de aceitar o marketplace sem preparo foi de gestão — não de operação — e propor um novo papel de arquiteto da expansão com autonomia real",
        risco: "baixo",
        effects: { rh: +6, processos: +4, sla: +3, clientes: +2 },
        avaliacao: "boa",
        ensinamento: "A mesma conversa da saída do gerente de CD que alertou a empresa há meses é a mesma da cadeia do frio com o responsável de qualidade. O padrão é o mesmo: quem avisou certo foi tratado como culpado depois. A resposta também é a mesma: reconhecimento, não defesa."
      },
      {
        text: "Oferecer aumento de 25% e promoção para diretor de operações imediatamente",
        risco: "medio",
        effects: { rh: +3, financeiro: -2, processos: +1 },
        avaliacao: "media",
        ensinamento: "Promoção e aumento sem reconhecimento do ponto central — que ele estava certo e foi tratado injustamente — tem chance de reter o colaborador, mas não o engajamento. Uma pessoa que ficou pelo dinheiro e não pela causa vai continuar olhando para fora assim que a injustiça percebida persistir."
      },
      {
        text: "Aceitar a demissão e usar o momento de transição para contratar um gerente com perfil mais analítico e focado em automação",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -3 },
        effects: { rh: -5, processos: -4, sla: -3, clientes: -2 },
        avaliacao: "ruim",
        ensinamento: "Perder 9 anos de conhecimento operacional durante uma crise de performance com prazo de cliente é um dos piores momentos possíveis para uma transição de gestão de CD. O perfil 'mais analítico' vai levar 6 meses para entender a operação — um período que a empresa não tem disponível."
      },
      {
        text: "Realizar uma conversa honesta com toda a liderança sobre a cultura de resposta a alertas — usar o caso dele para mudar o padrão antes de tentar reter",
        risco: "baixo",
        effects: { rh: +5, processos: +3, reputacao: +3, clientes: +2 },
        avaliacao: "boa",
        ensinamento: "A conversa sistêmica sobre cultura de resposta a alertas é o que diferencia uma empresa que aprende de uma que apenas retém. Mudar o sistema antes de pedir para o colaborador ficar demonstra que a empresa não quer apenas a pessoa — quer se tornar o lugar onde alertas são ouvidos."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R9 · PRESSÃO · O Pico do Black Friday
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Pico do Black Friday",
    description: "O marketplace confirma: o Black Friday vai triplicar o volume de pedidos por 5 dias — de 19 mil para 57 mil pedidos/dia. A operação atual consegue processar no máximo 22 mil com qualidade. A data é daqui a 45 dias. O marketplace é claro: 'Quem não tiver capacidade de pico vai perder os lojistas para quem tiver.' Você tem 45 dias e um CD que ainda não atingiu 2% de SLA consistente. Como você planeja?",
    tags: ["logistica"],
    fase: "pressao",
    choices: [
      {
        text: "Ser transparente com o marketplace: a empresa tem capacidade de 22 mil pedidos/dia com qualidade — propor um quota de pico de 28 mil com planejamento detalhado de recursos",
        risco: "baixo",
        effects: { clientes: +4, processos: +4, sla: +3, reputacao: +3 },
        avaliacao: "boa",
        ensinamento: "Transparência sobre capacidade real com um plano concreto de esforço é muito mais defensável do que prometer 57 mil e entregar 30 mil com qualidade ruim. O marketplace que recebe honestidade antes do evento pode redistribuir o volume — o que é muito melhor para todos do que uma crise durante a data mais importante do varejo."
      },
      {
        text: "Montar uma operação de pico com 80 temporários adicionais, tenda de overflow no estacionamento do CD e turnos de 20 horas por 5 dias",
        risco: "alto",
        effects: { sla: -2, rh: -4, seguranca: -3, clientes: -2, financeiro: -4 },
        avaliacao: "ruim",
        ensinamento: "Operação de overflow com tenda e turnos de 20 horas é a receita para o maior desastre de Black Friday possível. Temporários treinados em 3 semanas, operando 20 horas em ambiente improvisado, com o time fixo já esgotado — a taxa de erros vai ser catastrófica exatamente no momento em que o cliente está mais atento à qualidade."
      },
      {
        text: "Subcontratar o excedente de capacidade com dois operadores parceiros certificados — manter a qualidade sem comprometer a operação própria",
        risco: "medio",
        effects: { sla: +3, clientes: +3, financeiro: -3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Subcontratação de pico com parceiros certificados é uma estratégia de crescimento controlado clássica em fulfillment. O risco é a qualidade dos parceiros — que precisa ser auditada antes do evento, não durante. Um contrato de SLA com os parceiros, com penalidade real, é o mecanismo que alinha os incentivos."
      },
      {
        text: "Usar o Black Friday como argumento para investimento de capital: apresentar o business case de um terceiro CD para aprovação urgente do sócio",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +2, processos: +3, clientes: +1, sla: +1 },
        avaliacao: "media",
        ensinamento: "Business case de expansão ancorado em evento de pico é uma janela de oportunidade legítima — mas 45 dias não é tempo para construir um terceiro CD. A decisão de investimento pode ser tomada agora para o próximo ciclo, enquanto o pico atual é gerenciado com subcontratação. As duas coisas não são excludentes."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R10 · PRESSÃO / GATILHO · O Resultado do Black Friday
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Resultado do Black Friday",
    description: "O Black Friday passou. Os dados chegam: taxa de pedidos com problema em 1,7% — abaixo do limite de 2% pela primeira vez. O marketplace envia uma mensagem do diretor de operações: 'Vocês superaram as expectativas no pico. Queremos conversar sobre expansão do contrato e sobre incluir vocês como operador preferencial para um novo vertical que estamos lançando.' É o reconhecimento que a empresa precisava — e também um novo desafio estratégico. Como você responde?",
    tags: ["logistica"],
    fase: "pressao",
    choices: [
      {
        text: "Aceitar a reunião de expansão e ir preparado: trazer dados do Black Friday, roadmap de capacidade e a proposta do terceiro CD como condição para crescer",
        risco: "baixo",
        effects: { clientes: +5, financeiro: +3, processos: +3, sla: +2 },
        avaliacao: "boa",
        ensinamento: "Reunião de expansão após um desempenho excepcional é o momento de negociar com poder — não de aceitar qualquer condição que o marketplace propuser. Trazer o roadmap de capacidade e o business case do terceiro CD transforma a conversa de 'vocês conseguem absorver mais?' em 'o que vocês precisam para crescer com qualidade?'"
      },
      {
        text: "Pedir uma semana antes de responder — celebrar com o time e garantir que a operação está consolidada antes de comprometer novo crescimento",
        risco: "medio",
        effects: { rh: +4, processos: +2, clientes: -1, sla: +1 },
        avaliacao: "media",
        ensinamento: "Celebrar com o time é essencial — e uma semana de consolidação antes de crescer não é excesso de cautela, é sabedoria operacional. O risco é que uma semana de silêncio pode ser interpretada como hesitação pelo marketplace, que vai oferecer o novo vertical para outro operador. A resposta ideal é: 'Queremos essa conversa. Pode ser em 5 dias?'"
      },
      {
        text: "Aceitar imediatamente o novo vertical — o momento de expansão quando o cliente quer é sempre o melhor momento",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { clientes: +3, financeiro: +4, rh: -3, processos: -3, sla: -2 },
        avaliacao: "ruim",
        ensinamento: "Aceitar novo vertical sem entender o volume, os requisitos e a capacidade necessária é repetir o erro que gerou a crise original: crescimento sem preparo. O Black Friday foi resolvido — mas a operação ainda está em 1,7%, não em 1,0%. Uma nova carga imediata pode regredir o indicador antes que a consolidação aconteça."
      },
      {
        text: "Responder com entusiasmo e propor uma parceria de co-desenvolvimento do novo vertical — modelar a operação junto com o marketplace antes do lançamento",
        risco: "baixo",
        effects: { clientes: +6, processos: +4, reputacao: +4, tecnologia: +3, financeiro: +2 },
        avaliacao: "boa",
        ensinamento: "Co-desenvolvimento com o marketplace transforma a relação de fornecedor-cliente em parceria estratégica. Um operador que ajuda a modelar o processo do novo vertical antes do lançamento tem vantagem competitiva que nenhum outro operador pode replicar — e cria dependência mútua que é muito mais valiosa do que qualquer cláusula contratual."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R11 · DECISÃO CRÍTICA · O Terceiro CD
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Terceiro CD",
    description: "Com o marketplace propondo expansão de 40% de volume e o segundo marketplace em ramp-up, a empresa definitivamente precisa de um terceiro CD. Três opções no radar: (A) Construir próprio em Jundiaí — R$3,2M, 10 meses, 100% controle; (B) Alugar galpão já configurado em Sorocaba — R$280k/ano + R$400k de adaptação, 3 meses; (C) Parceria com um operador de CD existente em São José dos Campos que tem capacidade ociosa.",
    tags: ["logistica"],
    fase: "decisao",
    choices: [
      {
        text: "Opção A: construir próprio em Jundiaí — o controle operacional a longo prazo vale o investimento e o prazo",
        risco: "alto",
        effects: { processos: +4, financeiro: -7, sla: -2, clientes: -2, rh: -2 },
        avaliacao: "media",
        ensinamento: "Construção própria é a opção com maior retorno em 5 anos — mas 10 meses de prazo em um contexto de crescimento imediato é uma aposta que o marketplace não vai aguardar. Quando a demanda já existe, velocidade de resposta tem valor superior ao controle de longo prazo. A construção própria pode ser o CD 4, não o CD 3."
      },
      {
        text: "Opção B: alugar galpão em Sorocaba — equilíbrio entre velocidade, investimento e controle operacional",
        risco: "baixo",
        effects: { processos: +4, financeiro: -3, sla: +3, clientes: +4, rh: +2 },
        avaliacao: "boa",
        ensinamento: "Galpão configurado com adaptações pontuais é a opção que equilibra todos os critérios relevantes neste momento: velocidade de entrada em operação, investimento gerenciável e autonomia operacional. Os 3 meses de setup permitem treinar o time e implementar os processos que funcionaram nos CDs atuais."
      },
      {
        text: "Opção C: parceria em São José dos Campos — menor investimento e maior flexibilidade",
        risco: "medio",
        effects: { processos: +2, financeiro: +1, sla: +2, clientes: +2, rh: +1 },
        avaliacao: "media",
        ensinamento: "Parceria com operador existente tem a menor barreira de entrada, mas também o menor controle operacional. Para o marketplace que monitora taxa de pedidos com problema em tempo real, qualidade depende de processos controlados — que são mais difíceis de garantir em operação de terceiro do que em operação própria."
      },
      {
        text: "Propor ao marketplace co-investimento no terceiro CD em troca de contrato exclusivo de 5 anos — transformar a necessidade em parceria estratégica",
        risco: "baixo",
        effects: { clientes: +5, financeiro: +3, processos: +4, sla: +3, reputacao: +4 },
        avaliacao: "boa",
        ensinamento: "Co-investimento em infraestrutura logística é um modelo de parceria cada vez mais comum entre marketplaces e operadores de alto performance. Para o marketplace, garante capacidade dedicada e exclusividade. Para o operador, transforma o capital do cliente em ativo da operação — e o exclusivo de 5 anos é a âncora financeira que viabiliza o investimento."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R12 · DECISÃO CRÍTICA · A Automação
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Automação",
    description: "O WMS completado gerou dados que revelam uma oportunidade: 35% do tempo dos operadores é gasto em movimentações que um sistema de esteiras e classificadoras automatizadas poderia eliminar. Uma empresa de automação logística propõe um projeto: R$2,1M de investimento, payback em 28 meses, capacidade do CD salta de 22 mil para 35 mil pedidos/dia. O CFO alerta: 'Temos capital para isso — ou para o terceiro CD, mas não para os dois.' O que você prioriza?",
    tags: ["logistica"],
    fase: "decisao",
    choices: [
      {
        text: "Priorizar o terceiro CD — expansão geográfica resolve o problema de capacidade para mais clientes e marketplaces",
        risco: "medio",
        effects: { clientes: +4, processos: +3, financeiro: -4, sla: +2, rh: +1 },
        avaliacao: "media",
        ensinamento: "Terceiro CD responde melhor à necessidade imediata de atender novos clientes — mas não resolve o custo operacional crescente do volume adicional. Dois CDs ineficientes custam mais do que um CD eficiente. A decisão entre expansão e eficiência depende de qual gargalo vai custar mais caro no próximo ano."
      },
      {
        text: "Priorizar a automação — reduzir o custo por pedido e aumentar a qualidade do CD atual primeiro",
        risco: "medio",
        effects: { processos: +5, tecnologia: +5, sla: +4, rh: +2, financeiro: -3 },
        avaliacao: "media",
        ensinamento: "Automação com payback de 28 meses em um CD que vai processar 35 mil pedidos/dia é um investimento de retorno claro. O risco é deixar de capturar novos contratos por falta de capacidade geográfica. Em logística, às vezes a resposta certa não é 'mais rápido' — é 'mais eficiente primeiro'."
      },
      {
        text: "Estruturar leasing financeiro para a automação e usar o capital próprio para o terceiro CD — os dois ao mesmo tempo",
        risco: "baixo",
        effects: { processos: +4, tecnologia: +4, clientes: +4, financeiro: -3, sla: +3 },
        avaliacao: "boa",
        ensinamento: "Leasing de equipamentos de automação é padrão no setor porque o ativo tem vida útil longa e fluxo de caixa previsível. Estruturar o investimento em automação via leasing libera o capital próprio para o terceiro CD — que tem ROI mais imediato por cada novo contrato fechado. Engenharia financeira criativa é parte da gestão estratégica."
      },
      {
        text: "Adiar ambos e focar os próximos 12 meses em eficiência de processo sem automação física",
        risco: "medio",
        gestorEffects: { capitalPolitico: -1 },
        effects: { processos: +2, financeiro: +2, sla: -1, clientes: -2, rh: -1 },
        avaliacao: "media",
        ensinamento: "Eficiência de processo sem investimento é possível — mas tem teto. Os 35% de tempo de operador em movimentações eliminável por automação é um dado que não muda com treinamento nem com reorganização. Adiar o investimento por 12 meses é escolher continuar operando abaixo do potencial quando o capital existe para mudar isso."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R13 · DECISÃO CRÍTICA · O Modelo de Negócio
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Modelo de Negócio",
    description: "Com 2 marketplaces e capacidade em expansão, o conselheiro externo levanta uma questão estratégica: 'A empresa cobra por pedido processado. Mas o mercado está indo para contratos de capacidade dedicada com receita mensal fixa. O modelo atual tem variabilidade de receita que dificulta o planejamento. É hora de mudar o modelo de precificação?' O diretor financeiro concorda. O diretor comercial tem dúvidas. Qual é o seu posicionamento?",
    tags: ["logistica"],
    fase: "decisao",
    choices: [
      {
        text: "Migrar para modelo híbrido: taxa fixa de capacidade dedicada + variável por pedido acima da cota — previsibilidade para ambos os lados",
        risco: "baixo",
        effects: { financeiro: +5, clientes: +3, processos: +4, sla: +2 },
        avaliacao: "boa",
        ensinamento: "Modelo híbrido de precificação (fixed + variable) é o padrão mais adotado em fulfillment B2B porque alinha os interesses de ambos os lados: o cliente tem previsibilidade de custo e o operador tem previsibilidade de receita. A cota de pico protege o operador de perdas em datas como Black Friday sem penalizar o cliente em volumes normais."
      },
      {
        text: "Manter o modelo por pedido — é mais simples, os clientes entendem e mudar agora pode criar resistência",
        risco: "medio",
        effects: { clientes: +1, financeiro: -2, processos: -1 },
        avaliacao: "ruim",
        ensinamento: "O modelo mais simples não é sempre o melhor modelo. Receita variável em uma operação com custo fixo alto (armazéns, pessoas, automação) cria risco de fluxo de caixa em momentos de baixo volume — como janeiro e fevereiro pós-Black Friday. O modelo de negócio precisa acompanhar a maturidade da operação."
      },
      {
        text: "Migrar para 100% de capacidade dedicada com contratos de 24 meses — maximizar a previsibilidade de receita",
        risco: "medio",
        effects: { financeiro: +4, clientes: -2, processos: +3, sla: +2 },
        avaliacao: "media",
        ensinamento: "Contratos 100% dedicados maximizam a previsibilidade mas reduzem a flexibilidade do cliente — que vai pagar capacidade ociosa nos meses de baixo volume. Clientes de e-commerce têm sazonalidade alta e resistem a pagar por capacidade que não usam. O modelo 100% dedicado é mais adequado para clientes B2B industriais do que para marketplaces."
      },
      {
        text: "Criar um produto de fulfillment-as-a-service: plataforma digital que permite a lojistas individuais contratar capacidade por demanda, sem passar pelo marketplace",
        effects: { tecnologia: +4, clientes: +4, financeiro: +3, reputacao: +4, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Fulfillment-as-a-service é o modelo que empresas como ShipBob e Fulfillment by Amazon construíram para criar mercado B2C sem intermediário de marketplace. Democratizar o acesso a fulfillment de qualidade para lojistas pequenos é uma oportunidade de mercado enorme — e usa a infraestrutura já construída para um segmento que os marketplaces não atendem diretamente."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R14 · DECISÃO CRÍTICA · A Oferta de Aquisição
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Oferta de Aquisição",
    description: "O maior grupo de fulfillment do Brasil apresenta uma proposta de aquisição: R$38M por 70% da empresa. O valuation implícito é 8x o EBITDA atual — considerado alto para o setor. A proposta inclui manutenção do time de gestão por 3 anos e acesso imediato à rede de 12 CDs em todo o Brasil. O sócio-fundador quer a sua opinião antes de decidir. O que você recomenda?",
    tags: ["logistica"],
    fase: "decisao",
    choices: [
      {
        text: "Recomendar aceitar: o acesso a 12 CDs nacionais elimina o maior gargalo de crescimento da empresa de uma vez",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +7, clientes: +5, processos: +3, sla: +3, rh: +2 },
        avaliacao: "boa",
        ensinamento: "Em fulfillment de e-commerce, cobertura geográfica nacional é o ativo mais difícil de construir organicamente e o que mais valor agrega para marketplaces que operam em todo o país. A oferta de 8x EBITDA com infraestrutura pronta é uma oportunidade que combina liquidez para o fundador com aceleração de crescimento para a operação."
      },
      {
        text: "Recomendar negociar: aceitar 60% por R$36M e incluir cláusula de buyback a partir de ano 5 se o EBITDA dobrar",
        risco: "baixo",
        effects: { financeiro: +5, clientes: +4, processos: +3, rh: +2 },
        avaliacao: "boa",
        ensinamento: "Negociar participação menor com opção de buyback é uma estrutura que protege o upside do fundador caso o crescimento supere as expectativas. É uma postura de quem acredita no valor que vai criar na empresa — e que quer participar desse valor no futuro sem estar totalmente dependente do acquirer para isso."
      },
      {
        text: "Recomendar recusar: a empresa acabou de provar sua capacidade e está no momento de crescer independente",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1, esgotamento: +2 },
        effects: { financeiro: -1, processos: -1, clientes: -1 },
        avaliacao: "media",
        ensinamento: "Recusar uma oferta de 8x EBITDA após um Black Friday que validou a operação é defensável — se houver um plano claro para criar mais valor independente do que o acquirer ofere. Sem esse plano, a independência pode ser mais cara do que parece, especialmente se o crescimento for limitado por capital para novos CDs."
      },
      {
        text: "Recomendar usar a oferta como alavanca para uma rodada de investimento próprio — provar ao mercado de PE que a empresa vale esse valuation sem precisar vender o controle",
        risco: "medio",
        effects: { financeiro: +4, clientes: +3, processos: +2, reputacao: +3 },
        avaliacao: "boa",
        ensinamento: "Uma oferta de aquisição com múltiplo alto é o melhor argumento de pitch para investidores de PE. 'Temos uma oferta de 8x e preferimos crescer com parceiro financeiro sem ceder o controle' é uma posição de força. A janela entre receber a oferta e decidir é o momento ideal para uma captação competitiva."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R15 · DECISÃO FINAL · A Visão de Longo Prazo
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Visão de Longo Prazo",
    description: "Com o primeiro marketplace estabilizado, o segundo em ramp-up e a expansão de capacidade encaminhada, você precisa definir onde a empresa quer estar em 3 anos. O setor de fulfillment está em transformação: automação, IA para previsão de demanda, expansão do social commerce e pressão por entregas cada vez mais rápidas. Qual é o posicionamento estratégico que você defende?",
    tags: ["logistica"],
    fase: "decisao",
    choices: [
      {
        text: "Fulfillment tech: ser o operador com maior sofisticação tecnológica — IA para previsão, automação máxima, analytics em tempo real compartilhado com o cliente",
        effects: { tecnologia: +6, processos: +5, clientes: +4, reputacao: +4, financeiro: +3 },
        avaliacao: "boa",
        ensinamento: "Liderança tecnológica em fulfillment é uma vantagem competitiva crescente à medida que o mercado amadurece. A empresa que entrega dados preditivos ao cliente — 'seu pico de Black Friday vai ser 2,3x o ano anterior' com 85% de acurácia — não é apenas um operador logístico: é um parceiro de inteligência de negócios."
      },
      {
        text: "Especialização em social commerce: ser o operador preferencial para marcas que vendem por Instagram, TikTok e WhatsApp — volumes menores, margens maiores",
        effects: { clientes: +5, financeiro: +4, reputacao: +4, processos: +3, tecnologia: +3 },
        avaliacao: "boa",
        ensinamento: "Social commerce está crescendo 3x mais rápido do que o e-commerce tradicional e tem perfil de pedido completamente diferente: menos volume, mais personalização, mais exigência de embalagem e apresentação. Operadores especializados nesse segmento têm margens melhores e competem em dimensões onde os grandes operadores não se adaptam facilmente."
      },
      {
        text: "Crescimento nacional: abrir CDs em todas as capitais nos próximos 3 anos — cobertura nacional como principal diferencial",
        requisitos: { indicadorMinimo: { financeiro: 12, processos: 11 } },
        effects: { clientes: +4, financeiro: +3, rh: -3, processos: -3, sla: -2 },
        avaliacao: "media",
        ensinamento: "Expansão nacional agressiva — todas as capitais em 3 anos — é o caminho para se tornar um operador de referência nacional, mas exige execução perfeita em paralelo em múltiplas frentes. Empresas que tentam crescer em 10 locais simultaneamente antes de ter o modelo comprovado frequentemente acabam com 10 operações mediocres em vez de uma excelente."
      },
      {
        text: "Plataforma de fulfillment colaborativo: rede de operadores independentes compartilhando tecnologia, precificação e padrão de qualidade unificados",
        effects: { tecnologia: +5, clientes: +4, financeiro: +4, reputacao: +5, processos: +4 },
        avaliacao: "boa",
        ensinamento: "Plataforma colaborativa multiplica o alcance sem multiplicar o investimento de capital. A empresa que criou o WMS, o dashboard de monitoramento e os processos que salvaram o contrato do marketplace pode licenciar esse sistema para outros operadores regionais — criando uma rede com padrão unificado e competindo em escala contra os gigantes do setor."
      }
    ]
  }

]

]; // fim LogisticaRounds
