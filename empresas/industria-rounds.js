/* ═══════════════════════════════════════════════════════════════════
   BETA · INDÚSTRIA · ROUNDS EXCLUSIVOS
   Sistema de Sorteio:
     Diagnóstico    → 5 candidatas → 3 selecionadas  (R1–R5)
     Pressão        → 5 candidatas → 4 selecionadas  (R6–R10)
     Decisão Crítica→ 5 candidatas → 3 selecionadas  (R11–R15)
   R10 = Gatilho Estratégico → abre a fase Decisão Crítica

   INDICADORES (8 — exclusivos do setor Indústria):
     financeiro   💰  Caixa / receita / penalidades contratuais
     seguranca    🦺  Acidentes / MTE / índice de frequência
     qualidade    🔧  Especificação / rejeições / defeitos
     manutencao   ⚙️   Estado dos equipamentos / paradas
     rh           👷  Engajamento / rotatividade / afastamentos
     processos    📋  Eficiência operacional / fluxos
     conformidade 📜  ISO / certificações / auditorias
     clientes     🤝  Carteira / contratos / retenção

   FASES NARRATIVAS:
     R1–R5   → Diagnóstico: a extensão real da crise se revela
     R6–R10  → Pressão: consequências chegam de fora e de dentro
     R11–R15 → Decisão Crítica: o futuro da planta é definido
═══════════════════════════════════════════════════════════════════ */

const IndustriaRounds = [

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [0] · Metalúrgica — ISO em risco, segurança no limite
   Contexto: 310 funcionários, 8.400m², R$68M faturamento,
   índice de acidentes 18,4 (dobro do benchmark), ISO 9001 sob risco,
   prensa hidráulica principal falhou (60% da produção),
   engenheiro sênior de manutenção prestes a se aposentar.
══════════════════════════════════════════════════════════════════ */
[

  /* ═══════════════════════════════════════════════════════
     R1 · DIAGNÓSTICO · O Primeiro Dia na Fábrica
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Primeiro Dia na Fábrica",
    description: "Seu primeiro dia como gestor responsável. Durante o tour pela planta com o supervisor de produção, você nota: um operador trabalhando sem EPI completo, uma máquina de usinagem com proteção lateral removida e uma faixa amarela de interdição ignorada por todos. Ao perguntar ao supervisor, ele encolhe os ombros: 'É assim há anos. Todo mundo já se acostumou.' O índice de acidentes está em 18,4 — o dobro do benchmark do setor. O que você faz no final desse primeiro dia?",
    tags: ["industria"],
    fase: "diagnostico",
    choices: [
      {
        text: "Convocar reunião com supervisores e líderes de turno ainda hoje: comunicar que as regras de segurança são inegociáveis a partir de agora, com consequências claras para descumprimento",
        risco: "baixo",
        effects: { seguranca: +4, rh: +2, processos: +2, conformidade: +2 },
        avaliacao: "boa",
        ensinamento: "A primeira semana define a cultura que vai vigorar. Tolerância com desvios de segurança no início do mandato cria precedente difícil de reverter. Comunicar a mudança de postura com clareza — antes de qualquer incidente — é o que transforma intenção em norma real."
      },
      {
        text: "Observar por mais uma semana antes de agir — entender a cultura da fábrica antes de fazer mudanças que podem gerar resistência",
        risco: "alto",
        effects: { seguranca: -2, rh: -1, conformidade: -2, processos: -1 },
        avaliacao: "ruim",
        ensinamento: "Esperar para entender a cultura é prudente em muitas situações — mas não quando há risco iminente de acidente. Cada dia de tolerância com desvios de segurança normalizados é um dia em que o próximo incidente pode acontecer. O gestor que testemunha e não age torna-se coresponsável."
      },
      {
        text: "Parar imediatamente as máquinas com irregularidade e lavrar ocorrência formal — demonstrar com ações, não palavras, que o padrão mudou",
        risco: "baixo",
        effects: { seguranca: +5, conformidade: +3, processos: -2, rh: +1 },
        avaliacao: "boa",
        ensinamento: "Ação imediata e documentada nos primeiros dias estabelece credibilidade que nenhum discurso substitui. O operador que vê a máquina parada por irregularidade de segurança entende que o novo gestor é diferente dos anteriores — e essa percepção se espalha pela fábrica antes do almoço."
      },
      {
        text: "Contratar consultoria de segurança do trabalho para fazer um diagnóstico completo antes de tomar qualquer medida",
        risco: "medio",
        effects: { seguranca: +2, conformidade: +2, financeiro: -2, processos: +1 },
        avaliacao: "media",
        ensinamento: "Diagnóstico externo tem valor — mas levará semanas, e os desvios visíveis no primeiro dia não precisam de consultoria para serem corrigidos. Delegar a percepção do problema a um terceiro quando a evidência está na sua frente é uma forma de procrastinação gerencial disfarçada de prudência."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R2 · DIAGNÓSTICO · O Engenheiro que Vai Embora
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Engenheiro que Vai Embora",
    description: "Raimundo, 61 anos, engenheiro de manutenção com 19 anos de empresa, anuncia que vai se aposentar em 4 meses. Ele é o único que conhece a fundo o funcionamento da prensa hidráulica principal — a mesma que falhou na semana passada e que responde por 60% da produção. 'Tenho tudo na cabeça,' ele diz. 'Nunca precisei documentar porque sempre estava aqui.' O supervisor de manutenção é honesto: 'Se o Raimundo sair sem transferir o conhecimento, ficamos cegos nessa máquina.'",
    tags: ["industria"],
    fase: "diagnostico",
    choices: [
      {
        text: "Criar imediatamente um programa de transferência de conhecimento: Raimundo passa as próximas 16 semanas documentando procedimentos e treinando o substituto com dedicação de 30% do tempo",
        risco: "baixo",
        effects: { manutencao: +5, processos: +4, rh: +3, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "Conhecimento tácito acumulado em 19 anos não se transfere em duas semanas de correria antes da aposentadoria. Um programa estruturado com tempo adequado, documentação formal e treinamento prático transforma o risco da saída em um ativo — o manual que Raimundo vai deixar vale mais do que ele imagina."
      },
      {
        text: "Contratar imediatamente um técnico de manutenção sênior externo para trabalhar ao lado de Raimundo nos próximos 4 meses",
        risco: "baixo",
        effects: { manutencao: +4, processos: +3, financeiro: -2, rh: +2 },
        avaliacao: "boa",
        ensinamento: "Contratação de substituto com sobreposição de 4 meses é uma das estratégias mais eficazes de transferência de conhecimento técnico. O novo profissional aprende na prática com quem mais sabe — e quando Raimundo sair, há alguém que viveu os mesmos problemas ao lado dele, não apenas leu um manual."
      },
      {
        text: "Oferecer a Raimundo um contrato de consultoria pós-aposentadoria para ser acionado em emergências — resolver quando o problema aparecer",
        risco: "alto",
        effects: { manutencao: -2, processos: -2, seguranca: -2, qualidade: -2 },
        avaliacao: "ruim",
        ensinamento: "Consultor de emergência disponível no telefone não substitui conhecimento interno operacional. Quando a prensa travar às 2h da manhã de uma segunda-feira, o consultor pode estar viajando, doente ou simplesmente não disponível. Dependência de uma pessoa externa para equipamento crítico é risco operacional inaceitável."
      },
      {
        text: "Pedir ao Raimundo que grave vídeos de todos os procedimentos antes de sair — solução rápida e de baixo custo",
        risco: "medio",
        effects: { manutencao: +2, processos: +1, financeiro: +1, qualidade: +1 },
        avaliacao: "media",
        ensinamento: "Vídeos são melhor do que nada — mas são o pior formato para procedimentos de manutenção complexos que dependem de contexto, sensação tátil e julgamento situacional. O técnico que assiste a um vídeo sobre a prensa nunca vai saber o que fazer quando o barulho for diferente do que aparece na gravação."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R3 · DIAGNÓSTICO · A Auditoria ISO que Chegou
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Auditoria ISO que Chegou",
    description: "O auditor do organismo certificador chega para a auditoria de manutenção da ISO 9001. Em três horas de visita, ele identifica quatro não-conformidades maiores: registros de calibração de instrumentos desatualizados, procedimentos de controle de qualidade não seguidos na linha 3, rastreabilidade de lotes incompleta em 23% dos registros e treinamentos obrigatórios em atraso para 41 funcionários. 'Vocês têm 90 dias para corrigir ou a certificação é suspensa,' ele comunica ao final. Como você responde?",
    tags: ["industria"],
    fase: "diagnostico",
    choices: [
      {
        text: "Montar força-tarefa imediata com um responsável para cada não-conformidade, cronograma semanal de avanço e reunião quinzenal com o auditor para demonstrar progresso proativo",
        risco: "baixo",
        effects: { conformidade: +6, processos: +4, qualidade: +3, clientes: +2 },
        avaliacao: "boa",
        ensinamento: "Quatro não-conformidades em 90 dias são gerenciáveis com organização. O erro clássico é tentar resolver tudo de uma vez sem responsável definido — e chegar no dia 89 com metade das correções feitas. Força-tarefa com dono por problema e ritmo de revisão quinzenal cria a cadência que transforma urgência em execução."
      },
      {
        text: "Contestar as não-conformidades junto ao organismo certificador — algumas delas são interpretações discutíveis da norma",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2 },
        effects: { conformidade: -3, clientes: -3, reputacao: -2, processos: -1 },
        avaliacao: "ruim",
        ensinamento: "Contestar não-conformidades identificadas por auditor acreditado raramente é vencido e sempre tem custo de relacionamento. O organismo certificador tem poder para acelerar a suspensão se perceber postura de não cooperação. Energia gasta contestando é energia que não foi usada para corrigir."
      },
      {
        text: "Priorizar as duas não-conformidades de maior risco para os clientes — rastreabilidade e controle de qualidade — e resolver as outras no prazo normal",
        risco: "baixo",
        effects: { conformidade: +4, qualidade: +5, clientes: +3, processos: +3 },
        avaliacao: "boa",
        ensinamento: "Triage de não-conformidades por impacto ao cliente é uma leitura estratégica correta. Rastreabilidade incompleta e controle de qualidade fora do procedimento são os pontos que podem gerar recalls, devoluções e perda de contratos — muito antes da suspensão formal da ISO. Resolver o que importa para o cliente primeiro é gestão de risco inteligente."
      },
      {
        text: "Negociar com o organismo certificador mais 60 dias de prazo além dos 90 — a empresa precisa de tempo para fazer certo",
        risco: "medio",
        effects: { conformidade: -1, processos: +1, clientes: -1, financeiro: -1 },
        avaliacao: "media",
        ensinamento: "Pedir extensão de prazo em auditoria ISO é possível em casos justificados — mas sinaliza ao mercado que a empresa não tem capacidade de resolver problemas com urgência. Clientes que dependem da certificação para manter a empresa em sua lista de fornecedores homologados ficam sabendo dessas extensões."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R4 · DIAGNÓSTICO · A Prensa que Para de Novo
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Prensa que Para de Novo",
    description: "Três semanas após a última falha, a prensa hidráulica principal para novamente. Desta vez, o técnico que tentou fazer a manutenção emergencial identifica o problema em 6 horas — mas ao abrir o equipamento, encontra algo preocupante: desgaste avançado em componentes que deveriam ter sido substituídos há pelo menos 18 meses segundo o manual do fabricante. Raimundo, chamado ao local, confirma: 'Eu sabia que estava desgastado. Mas a peça importada custava R$87 mil e sempre dava para segurar mais um pouco.' A produção está parada há 8 horas.",
    tags: ["industria"],
    fase: "diagnostico",
    choices: [
      {
        text: "Comprar e instalar a peça imediatamente e, em paralelo, fazer um levantamento completo de todos os componentes críticos da planta com desgaste acima de 70%",
        risco: "baixo",
        effects: { manutencao: +5, producao: +4, qualidade: +2, financeiro: -3 },
        avaliacao: "boa",
        ensinamento: "Resolver o imediato e diagnosticar o sistêmico ao mesmo tempo é a resposta certa a falhas repetidas. A prensa parada custa muito mais por hora do que a peça importada custaria por mês. E o levantamento de componentes críticos transforma um problema recorrente em um cronograma de manutenção preventiva que a empresa consegue planejar."
      },
      {
        text: "Fazer reparo provisório para retomar a produção hoje e planejar a substituição definitiva para o próximo trimestre — minimizar o impacto financeiro imediato",
        risco: "alto",
        effects: { manutencao: -2, producao: +1, seguranca: -3, qualidade: -2, financeiro: +1 },
        avaliacao: "ruim",
        ensinamento: "Reparo provisório em componente crítico que já falhou duas vezes é aceitar um terceiro evento — provavelmente pior. O custo da próxima falha não é mais R$87k: é parada mais longa, possível dano estrutural à máquina e risco de acidente com operadores próximos ao equipamento."
      },
      {
        text: "Aproveitar a parada para fazer uma revisão geral completa da prensa — transformar a crise em uma manutenção programada abrangente",
        risco: "medio",
        effects: { manutencao: +6, producao: -2, qualidade: +3, processos: +3, financeiro: -4 },
        avaliacao: "boa",
        ensinamento: "Parada não planejada transformada em revisão geral é uma das formas mais eficientes de manutenção: o equipamento já está aberto, o técnico já está no local e o custo marginal de fazer a revisão completa é uma fração do custo de parar de novo em duas semanas. O custo de produção parada por 2 dias extra é menor que o de uma quarta falha."
      },
      {
        text: "Responsabilizar formalmente o Raimundo pela decisão de adiar a manutenção — documentar a ocorrência e abrir processo interno",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -3 },
        effects: { rh: -5, manutencao: -2, processos: -2, seguranca: -2 },
        avaliacao: "ruim",
        ensinamento: "Responsabilizar individualmente um colaborador por uma falha sistêmica — onde a decisão de adiar manutenção era prática comum aceita pela gestão anterior — destrói o clima e cria medo de reportar problemas. A cultura de segurança psicológica que você precisa construir começa exatamente em situações como essa."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R5 · DIAGNÓSTICO · O Relatório do MTE
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Relatório do MTE",
    description: "Um fiscal do Ministério do Trabalho e Emprego realiza visita de rotina e lavra auto de infração por três irregularidades: ausência de PPRA atualizado, laudo de insalubridade vencido e equipamentos sem a manutenção preventiva documentada exigida pela NR-12. A multa somada é de R$142 mil. Mais grave: o fiscal inclui na notificação uma recomendação de interdição parcial da linha 2 caso as irregularidades não sejam sanadas em 30 dias. A linha 2 responde por 28% da produção.",
    tags: ["industria"],
    fase: "diagnostico",
    choices: [
      {
        text: "Regularizar imediatamente as três pendências com equipe dedicada — PPRA, laudo de insalubridade e documentação NR-12 — e agendar visita de retorno com o MTE para demonstrar as correções antes do prazo",
        risco: "baixo",
        effects: { conformidade: +5, seguranca: +4, rh: +2, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Visita proativa de retorno ao fiscal antes do prazo é uma das estratégias mais eficazes em fiscalização trabalhista. Demonstra que a empresa age de boa-fé e frequentemente resulta em redução de multa e cancelamento da recomendação de interdição. O fiscal que vê a empresa correndo para regularizar tem comportamento completamente diferente do fiscal que precisa cobrar."
      },
      {
        text: "Contratar advogado trabalhista para contestar as três infrações — há argumentos jurídicos para reduzir ou anular a multa",
        risco: "medio",
        effects: { financeiro: +1, conformidade: -2, seguranca: -1, processos: -1 },
        avaliacao: "media",
        ensinamento: "Contestação jurídica pode reduzir a multa — mas não suspende a recomendação de interdição. E enquanto o processo corre, a linha 2 continua em risco. Resolver o problema de conformidade é sempre mais eficiente do que vencê-lo na Justiça depois que a interdição aconteceu."
      },
      {
        text: "Priorizar apenas a regularização da NR-12 para evitar a interdição da linha 2 — as outras duas pendências têm prazo mais confortável",
        risco: "medio",
        effects: { conformidade: +3, producao: +3, seguranca: +2, rh: +1, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Triage por impacto operacional é correto aqui: a NR-12 é o que pode interditar a linha. PPRA e laudo de insalubridade têm consequências de conformidade importantes, mas não implicam interdição imediata. Focar o que protege a produção primeiro, sem abandonar o restante, é gestão de prioridade com clareza."
      },
      {
        text: "Comunicar ao maior cliente sobre as pendências antes que ele descubra por outro canal — demonstrar transparência proativa",
        risco: "baixo",
        effects: { clientes: +3, conformidade: +1, rh: +1, reputacao: +2 },
        avaliacao: "boa",
        ensinamento: "Clientes que dependem de fornecedores com certificação e conformidade regulatória preferem receber notícias difíceis de quem gera a notícia — não da imprensa ou de um concorrente. A transparência proativa constrói o tipo de confiança que não se compra: a de que o parceiro vai falar a verdade quando é difícil."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R6 · PRESSÃO · O Acidente Grave
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Acidente Grave",
    description: "Na segunda-feira de manhã, um operador da linha 1 sofre um esmagamento de dois dedos ao tentar desobstruir uma prensa sem seguir o procedimento de bloqueio de energia. Ele é levado ao hospital. A análise preliminar aponta: a proteção da máquina havia sido removida na semana anterior para facilitar um ajuste e não foi recolocada. Nenhum supervisor registrou ou corrigiu a irregularidade. O SESMT é acionado e a linha 1 é paralisada pelo próprio time de segurança. Como você age nas primeiras 2 horas?",
    tags: ["industria"],
    fase: "pressao",
    choices: [
      {
        text: "Ir pessoalmente ao hospital visitar o colaborador, garantir assistência completa à família e comunicar ao time que a investigação vai começar imediatamente — com foco em entender o sistema, não em punir o indivíduo",
        risco: "baixo",
        effects: { rh: +5, seguranca: +3, conformidade: +2, clientes: +1 },
        avaliacao: "boa",
        ensinamento: "O gesto humano do gestor que vai ao hospital transforma um acidente em um marco de cultura. O time inteiro observa como a liderança responde ao momento mais difícil — e a investigação que foca no sistema em vez de no culpado é o que cria uma cultura onde as pessoas relatam problemas antes do acidente."
      },
      {
        text: "Convocar reunião imediata com todos os supervisores para cobrar explicações sobre como a proteção ficou removida sem ser registrada",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2 },
        effects: { rh: -4, seguranca: -1, processos: -1, conformidade: -1 },
        avaliacao: "ruim",
        ensinamento: "Reunião de cobrança imediatamente após o acidente, antes da investigação, cria defensividade e silêncio — o oposto do que a empresa precisa. Supervisores que sentem que serão punidos vão proteger a própria posição, não contribuir com a verdade. A busca pelo culpado destrói a busca pela causa."
      },
      {
        text: "Acionar imediatamente o seguro, o jurídico e o SESMT simultaneamente — coordenar as respostas institucionais em paralelo com o cuidado ao colaborador",
        risco: "baixo",
        effects: { seguranca: +4, conformidade: +3, financeiro: +1, rh: +2 },
        avaliacao: "boa",
        ensinamento: "Gestão paralela de resposta a acidentes — cuidado humano, apuração técnica e proteção institucional simultaneamente — é o padrão de empresas com cultura de segurança madura. Cada um desses fronts tem urgência própria e não pode esperar o outro. A coordenação simultânea é o que diferencia uma crise gerenciada de uma crise que escala."
      },
      {
        text: "Paralisar toda a fábrica imediatamente para revisão de segurança em todas as linhas antes de qualquer retomada",
        risco: "medio",
        gestorEffects: { capitalPolitico: -1 },
        effects: { seguranca: +5, producao: -5, clientes: -3, financeiro: -3 },
        avaliacao: "media",
        ensinamento: "Paralisia total demonstra seriedade com segurança — mas em uma metalúrgica com contratos de prazo, parar todas as linhas por revisão pode gerar multas contratuais que a empresa não comporta. A resposta proporcional é paralisar a linha afetada e fazer a revisão das demais em turnos, sem interromper a produção completa."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R7 · PRESSÃO · O Cliente Automotivo Audita
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Cliente Automotivo Audita",
    description: "A Montadora Horizonte — responsável por 34% da receita da empresa — anuncia auditoria de segundo partido em sua planta. A data é daqui a 20 dias. O gerente de qualidade avisa em particular: 'Se eles virem o estado atual da documentação de rastreabilidade e os registros de calibração, vamos reprovar. E reprovação em auditoria de montadora com frequência resulta em suspensão de fornecedor.' Uma suspensão pela Montadora Horizonte significaria perda imediata de R$23 milhões em receita anual.",
    tags: ["industria"],
    fase: "pressao",
    choices: [
      {
        text: "Mobilizar equipe em regime de dedicação integral por 20 dias para regularizar rastreabilidade e calibrações — fazer o que precisa ser feito, mesmo que seja intenso",
        risco: "medio",
        effects: { conformidade: +5, qualidade: +4, clientes: +4, rh: -2, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Vinte dias com dedicação total é suficiente para corrigir os problemas documentais críticos que uma auditoria de segundo partido avalia. O custo de horas extras e foco intenso por 20 dias é uma fração do risco de R$23 milhões. Gestão de crise real exige mobilização real — não apenas plano no papel."
      },
      {
        text: "Entrar em contato com o gerente de conta da Montadora Horizonte e ser transparente sobre os desafios em andamento — pedir uma visita de pré-auditoria informal antes da data oficial",
        risco: "baixo",
        effects: { clientes: +5, conformidade: +3, reputacao: +3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Transparência proativa com o cliente antes de uma auditoria transforma a dinâmica de adversarial para colaborativa. O gerente de conta que sabe dos desafios antes do auditor pode ser um aliado interno. Clientes de longa data frequentemente preferem ajudar o fornecedor a corrigir do que substituí-lo — se a honestidade vier antes da crise."
      },
      {
        text: "Contratar uma consultoria especializada em sistemas de qualidade automotiva para liderar a preparação para auditoria",
        risco: "baixo",
        effects: { conformidade: +4, qualidade: +3, financeiro: -3, clientes: +2 },
        avaliacao: "boa",
        ensinamento: "Consultoria especializada em requisitos de qualidade automotiva (IATF, PPAP, FMEA) conhece exatamente o que os auditores de montadora procuram e como os registros precisam estar organizados. O custo da consultoria é justificado quando o risco do cliente representa R$23M de receita."
      },
      {
        text: "Solicitar adiamento da auditoria por 60 dias — a empresa está em processo de melhoria e precisa de mais tempo",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2 },
        effects: { clientes: -4, conformidade: -2, reputacao: -3, financeiro: -2 },
        avaliacao: "ruim",
        ensinamento: "Pedir adiamento de auditoria de cliente estratégico é um sinal vermelho imediato. A montadora que concede o adiamento vai chegar com nível de escrutínio muito maior — e o fornecedor que pediu tempo será avaliado com o dobro da atenção. O adiamento raramente resolve o problema; apenas aumenta a pressão do momento seguinte."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R8 · PRESSÃO · A Proposta de Automação
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Proposta de Automação",
    description: "Um fabricante de equipamentos apresenta uma proposta de automação parcial da linha 2: substituir dois postos de trabalho manuais por braços robóticos, reduzindo o risco de acidente nesses pontos em 85% e aumentando a capacidade produtiva em 22%. O custo: R$1,4 milhões, payback estimado de 26 meses. O sindicato dos metalúrgicos já soube da proposta e o representante sindical pede uma reunião urgente: 'Dois trabalhadores vão perder o emprego?'",
    tags: ["industria"],
    fase: "pressao",
    choices: [
      {
        text: "Reunir-se com o sindicato antes de qualquer decisão — comprometer que os dois operadores serão reposicionados em outras funções ou treinados para operar os novos equipamentos",
        risco: "baixo",
        effects: { rh: +5, seguranca: +3, processos: +2, conformidade: +1 },
        avaliacao: "boa",
        ensinamento: "Automação sem plano de transição para os trabalhadores afetados é o caminho mais curto para conflito sindical, baixo moral e resistência passiva à mudança. A empresa que reposiciona os colaboradores antes de instalar os robôs demonstra que a modernização não é contra o time — e essa percepção determina se a mudança vai funcionar ou vai ser sabotada passivamente."
      },
      {
        text: "Aprovar a automação sem negociar com o sindicato — a decisão de modernização é prerrogativa da gestão",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -3 },
        effects: { rh: -5, seguranca: +2, processos: -2, conformidade: -1, financeiro: -2 },
        avaliacao: "ruim",
        ensinamento: "Automação implementada contra a resistência do sindicato em ambiente metalúrgico tem histórico de greves, paralisações e sabotagem passiva que consomem os ganhos de produtividade antes de se realizarem. O payback de 26 meses vira 50 meses quando se calcula o custo de conflito industrial."
      },
      {
        text: "Aprovar o projeto condicionado ao reposicionamento dos dois operadores em novas funções — nenhuma demissão por automação",
        risco: "baixo",
        effects: { rh: +4, seguranca: +5, producao: +4, financeiro: -3, conformidade: +2 },
        avaliacao: "boa",
        ensinamento: "Automação com garantia de reposicionamento é a fórmula que reduz a resistência sindical e mantém o moral do time. Os dois operadores reposicionados viram os maiores defensores do novo equipamento — porque viram que a empresa os protegeu. Esse tipo de confiança tem valor que não aparece no payback financeiro da proposta."
      },
      {
        text: "Adiar a decisão de automação para depois de resolver as não-conformidades ISO e o acidente — não sobrecarregar a organização com muitas mudanças simultâneas",
        risco: "medio",
        effects: { processos: +1, financeiro: +1, seguranca: -1, producao: -1 },
        avaliacao: "media",
        ensinamento: "Sequenciar mudanças para não sobrecarregar a organização é uma leitura válida de capacidade de absorção. O risco é que o 'depois' nunca chegue — e a automação que poderia reduzir acidentes em 85% naqueles pontos fica esperando a janela certa que nunca abre."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R9 · PRESSÃO · A Alta do Aço
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Alta do Aço",
    description: "O preço do aço carbono — principal matéria-prima da empresa — subiu 31% nos últimos 60 dias por combinação de alta cambial e redução de oferta do mercado doméstico. O CFO apresenta o impacto: se os contratos atuais forem mantidos no preço original, a margem bruta cai de 18% para 9% no próximo trimestre. Três grandes clientes têm contratos com cláusula de reajuste semestral. Os demais têm contratos anuais fechados. O que você decide?",
    tags: ["industria"],
    fase: "pressao",
    choices: [
      {
        text: "Negociar reajuste extraordinário com os três clientes com cláusula semestral usando os dados reais de custo — e iniciar negociação antecipada com os demais sobre o impacto no próximo ciclo",
        risco: "baixo",
        effects: { financeiro: +5, clientes: +3, processos: +2, conformidade: +1 },
        avaliacao: "boa",
        ensinamento: "Reajuste baseado em dados reais de custo é a negociação mais defensável com clientes B2B. A empresa que apresenta o custo do aço antes e depois, o impacto na margem e o risco para a continuidade da operação tem um argumento que o cliente não pode ignorar — especialmente se depende de peças críticas."
      },
      {
        text: "Absorver o aumento de custo por um trimestre e usar o período para buscar fornecedores alternativos de aço com melhor preço",
        risco: "alto",
        effects: { financeiro: -5, clientes: +2, processos: +1, rh: -1, manutencao: -1 },
        avaliacao: "ruim",
        ensinamento: "Absorver 9 pontos de margem bruta por um trimestre inteiro com a esperança de encontrar fornecedor mais barato é uma aposta arriscada. Aço é commodity — os preços sobem para todo o mercado simultaneamente. E caixa consumido em um trimestre de margem comprimida não volta quando a necessidade de manutenção aparecer."
      },
      {
        text: "Revisar o mix de produção priorizando os produtos de maior margem e reduzindo volume dos contratos menos rentáveis",
        risco: "medio",
        effects: { financeiro: +3, producao: -2, clientes: -2, processos: +2 },
        avaliacao: "media",
        ensinamento: "Revisão de mix por margem é uma estratégia legítima em contexto de alta de matéria-prima — mas reduzir volume de contratos ativos pode acionar cláusulas de penalidade e criar precedente ruim com clientes que consideravam a empresa um parceiro confiável de abastecimento."
      },
      {
        text: "Fazer hedge cambial e comprar estoque de aço acima do necessário agora, antes de nova alta — travar o custo atual",
        risco: "medio",
        effects: { financeiro: -3, producao: +3, processos: +2, manutencao: +1 },
        avaliacao: "boa",
        ensinamento: "Hedge de matéria-prima e compra antecipada de estoque estratégico são ferramentas legítimas de gestão de risco em indústrias intensivas em commodity. O risco é o capital imobilizado em estoque — mas em um contexto de alta acelerada de 31%, travar o custo atual pode gerar economia significativa nos próximos dois trimestres."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R10 · PRESSÃO / GATILHO · O Contrato que Define o Futuro
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Contrato que Define o Futuro",
    description: "A Montadora Horizonte comunica uma decisão estratégica: está consolidando sua base de fornecedores de componentes estruturais de 8 para 3 empresas nos próximos 18 meses. A empresa que ficar nessa base receberá um contrato de R$41 milhões anuais por 5 anos — mais que o dobro do contrato atual. A condição: passar em uma auditoria técnica em 45 dias, apresentar plano de investimento em automação e tecnologia, e ter o índice de acidentes abaixo de 8,0 (atualmente em 18,4). Duas outras metalúrgicas concorrentes estão disputando as mesmas vagas. O que você prioriza para os próximos 45 dias?",
    tags: ["industria"],
    fase: "pressao",
    choices: [
      {
        text: "Focar nos três critérios simultâneos: mobilizar o SESMT para redução imediata do índice de acidentes, preparar documentação técnica para a auditoria e elaborar um plano de automação crível com cronograma e ROI",
        risco: "medio",
        effects: { seguranca: +4, conformidade: +4, clientes: +5, processos: +3, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Contratos de 5 anos com valor dobrado justificam 45 dias de esforço máximo em todos os critérios. A empresa que chega à auditoria com os três pilares endereçados — segurança, conformidade técnica e plano de investimento — envia um sinal de maturidade organizacional que vai além do que qualquer checklist avalia."
      },
      {
        text: "Priorizar a redução do índice de acidentes — é o critério mais distante do exigido e o mais difícil de melhorar em 45 dias",
        risco: "baixo",
        effects: { seguranca: +6, rh: +3, conformidade: +2, clientes: +3 },
        avaliacao: "boa",
        ensinamento: "Priorizar o gap mais crítico é uma leitura correta de risco. Ir de 18,4 para abaixo de 8,0 em 45 dias exige mudança comportamental real, não apenas documentação — e isso demanda foco. A auditoria técnica e o plano de automação têm mais espaço para documentação de intenção; o índice de acidentes é um número que não mente."
      },
      {
        text: "Ser honesto com a Montadora Horizonte sobre o estado atual e propor um cronograma de 90 dias — melhor perder essa janela do que prometer o que não entregará",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { clientes: -3, financeiro: -4, reputacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Honestidade é sempre um valor — mas a janela de 45 dias da montadora não vai esperar pela honestidade que poderia ter sido demonstrada no trabalho feito antes. Recusar uma oportunidade de R$41M por impossibilidade que nunca foi testada é uma decisão prematura. O certo é tentar e medir o progresso real antes de desistir."
      },
      {
        text: "Contratar uma empresa de consultoria industrial para liderar todos os preparativos — velocidade de execução acima de tudo",
        risco: "medio",
        effects: { conformidade: +3, seguranca: +2, clientes: +2, financeiro: -3, rh: -1 },
        avaliacao: "media",
        ensinamento: "Consultoria acelera preparação técnica — mas índice de acidentes e cultura de segurança não melhoram com consultor externo fazendo reuniões. A montadora vai auditar a realidade da fábrica, não o relatório preparado pela consultoria. O investimento em consultoria é melhor direcionado para os pontos estritamente documentais."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R11 · DECISÃO CRÍTICA · O Plano de Investimento
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Plano de Investimento",
    description: "Para o contrato de R$41M com a Montadora Horizonte, você precisa apresentar um plano de investimento em tecnologia e automação. O CFO confirma: a empresa tem capacidade para um investimento de até R$3,5 milhões nos próximos 12 meses. Três opções estão na mesa: (A) Automação da linha 2 com robótica colaborativa — R$2,8M, ganho de 30% de capacidade; (B) Sistema MES (Manufacturing Execution System) para rastreabilidade em tempo real — R$1,9M; (C) Renovação completa do parque de maquinário da linha 1 — R$3,2M, elimina 70% do risco de paradas.",
    tags: ["industria"],
    fase: "decisao",
    choices: [
      {
        text: "Opção A: automação da linha 2 — capacidade adicional é o que a Montadora Horizonte mais valoriza para justificar o contrato de longo prazo",
        risco: "medio",
        effects: { producao: +6, clientes: +4, seguranca: +3, financeiro: -4, rh: +1 },
        avaliacao: "media",
        ensinamento: "Automação aumenta capacidade — mas a Montadora Horizonte pediu explicitamente redução de acidentes e rastreabilidade, não apenas capacidade. Um plano de automação sem MES apresenta o investimento mais visível, mas resolve apenas parcialmente os critérios que a auditoria vai avaliar."
      },
      {
        text: "Opção B: MES para rastreabilidade — atende diretamente o critério de conformidade da auditoria e é o diferencial técnico que a montadora mais valoriza no fornecedor",
        risco: "baixo",
        effects: { conformidade: +6, qualidade: +5, clientes: +5, processos: +4, financeiro: -3 },
        avaliacao: "boa",
        ensinamento: "MES com rastreabilidade em tempo real é o investimento que mais impacta os critérios da auditoria automotiva. Rastreabilidade de lote, controle de processo e alertas de qualidade em tempo real são exatamente o que as montadoras avaliam — e o sistema sobra capital para manutenções complementares."
      },
      {
        text: "Opção C: renovação da linha 1 — eliminar o risco de paradas é o que mais impacta a confiabilidade de entrega que o contrato de 5 anos exige",
        risco: "medio",
        effects: { manutencao: +7, seguranca: +4, producao: +3, qualidade: +3, financeiro: -5 },
        avaliacao: "media",
        ensinamento: "Renovação do parque elimina risco de parada — mas o R$3,2M compromete quase todo o capital disponível sem resolver rastreabilidade e conformidade documental que a auditoria vai avaliar. É o investimento mais operacionalmente correto, mas estrategicamente incompleto para o objetivo de curto prazo."
      },
      {
        text: "Combinar B e manutenção preventiva planejada: MES em R$1,9M + R$800k em manutenção crítica da linha 1 — resolver conformidade e reduzir risco de paradas com o capital disponível",
        risco: "baixo",
        effects: { conformidade: +5, qualidade: +4, manutencao: +4, clientes: +4, processos: +3, financeiro: -4 },
        avaliacao: "boa",
        ensinamento: "Combinação de MES com manutenção preventiva crítica é o portfólio que resolve os dois critérios mais relevantes da auditoria automotiva: conformidade/rastreabilidade e confiabilidade de entrega. Usa o capital disponível de forma estratégica sem apostar tudo em um único investimento de alto custo."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R12 · DECISÃO CRÍTICA · A Renovação da ISO
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Renovação da ISO",
    description: "O prazo de 90 dias da ISO 9001 chegou. O auditor retorna. Das quatro não-conformidades, três foram completamente corrigidas. A quarta — rastreabilidade de lotes completa em 100% dos registros — ainda está em 91%. O auditor apresenta as opções: manter a certificação com uma não-conformidade menor registrada e prazo de 30 dias para a última correção; ou suspender a certificação preventivamente até a resolução total. Dois clientes têm contratos que exigem ISO ativa. O que você decide?",
    tags: ["industria"],
    fase: "decisao",
    choices: [
      {
        text: "Aceitar a manutenção com não-conformidade menor registrada — 91% de rastreabilidade é suficientemente próximo para não justificar uma suspensão que afeta contratos",
        risco: "baixo",
        effects: { conformidade: +4, clientes: +4, processos: +2, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "A distinção entre não-conformidade maior e menor é fundamental no sistema ISO. Uma não-conformidade menor com prazo de 30 dias mantém a certificação ativa — e 30 dias é tempo suficiente para completar os 9% restantes de rastreabilidade com foco. Aceitar a suspensão preventiva quando há caminho de manutenção disponível é renunciar desnecessariamente ao que foi construído em 90 dias."
      },
      {
        text: "Pedir ao auditor mais 15 dias para completar os 9% restantes antes da decisão final — a certificação merece 100% de resolução",
        risco: "baixo",
        effects: { conformidade: +5, qualidade: +3, clientes: +3, processos: +3 },
        avaliacao: "boa",
        ensinamento: "Quinze dias para completar 9% de rastreabilidade é um prazo razoável que a maioria dos auditores concede quando a trajetória de melhoria é evidente. Chegar à renovação com 100% resolve a não-conformidade sem registros negativos no histórico de auditoria — o que tem valor para clientes que auditam fornecedores."
      },
      {
        text: "Aceitar a suspensão preventiva — transparência total é melhor do que certificação com pendência",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2 },
        effects: { conformidade: -2, clientes: -4, financeiro: -3, reputacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Aceitar a suspensão quando há opção de manutenção com não-conformidade menor é uma decisão de custo desnecessário. Os dois clientes com exigência de ISO ativa precisarão ser comunicados da suspensão — o que pode acionar cláusulas contratuais. Certificação com não-conformidade menor registrada é muito melhor do que certificação suspensa."
      },
      {
        text: "Comunicar proativamente os dois clientes com exigência de ISO sobre a situação antes que eles descubram pela suspensão",
        risco: "baixo",
        effects: { clientes: +5, conformidade: +2, reputacao: +4, processos: +1 },
        avaliacao: "boa",
        ensinamento: "Comunicação proativa antes de uma decisão formal é uma das estratégias mais eficazes de gestão de relacionamento com clientes. O cliente que descobre a situação por você — com contexto, trajetória de melhoria e prazo de resolução — tem uma reação completamente diferente do cliente que descobre pela suspensão do certificado no banco de dados do organismo."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R13 · DECISÃO CRÍTICA · O Novo Contrato e a Equipe
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Novo Contrato e a Equipe",
    description: "A Montadora Horizonte confirma: a empresa passou na auditoria e está selecionada como um dos três fornecedores consolidados. O contrato de R$41M começa em 6 meses. Para atender o volume, a empresa precisará contratar entre 60 e 80 funcionários adicionais e abrir um segundo turno completo. O sindicato já está de olho nas condições do novo turno. O RH alerta: 'O mercado de mão de obra qualificada para metalúrgica no interior está apertado — vamos disputar com outras fábricas.' Como você planeja a expansão de equipe?",
    tags: ["industria"],
    fase: "decisao",
    choices: [
      {
        text: "Criar um programa de formação próprio: parceria com SENAI para formação de 80 operadores em 5 meses — a empresa que forma tem mais retenção do que a que apenas contrata",
        risco: "baixo",
        effects: { rh: +6, processos: +4, producao: +3, financeiro: -2, clientes: +2 },
        avaliacao: "boa",
        ensinamento: "Empresa que forma o próprio operador tem vantagem de retenção comprovada: o colaborador que foi contratado como aprendiz e foi capacitado pela empresa tem taxa de permanência 40% maior do que o que foi contratado pronto. Em mercado apertado de mão de obra qualificada, a formação própria é vantagem competitiva real."
      },
      {
        text: "Contratar imediatamente pelo salário mais alto do mercado — atrair os melhores disponíveis antes que a concorrência feche as vagas",
        risco: "medio",
        effects: { rh: +3, producao: +3, financeiro: -4, processos: +1 },
        avaliacao: "media",
        ensinamento: "Contratação a preço premium funciona no curto prazo — mas cria uma estrutura de custo de pessoal que vai comprimir a margem do novo contrato. Além disso, profissionais contratados pelo maior salário saem pelo próximo salário maior: não há vínculo além do financeiro."
      },
      {
        text: "Negociar com o sindicato as condições do segundo turno antes de qualquer contratação — construir o modelo junto evita conflito durante a expansão",
        risco: "baixo",
        effects: { rh: +5, conformidade: +3, processos: +3, clientes: +1 },
        avaliacao: "boa",
        ensinamento: "Co-construção das condições do segundo turno com o sindicato é a estratégia mais eficaz para evitar conflito durante a expansão. A empresa que chega ao sindicato com a proposta pronta enfrenta resistência; a empresa que chega com o problema aberto e convida para a solução constrói um parceiro — e as condições negociadas têm mais legitimidade com os operadores."
      },
      {
        text: "Terceirizar parte da expansão com uma empresa de mão de obra temporária para os primeiros 12 meses — reduzir o risco de contratação prematura",
        risco: "medio",
        effects: { producao: +3, rh: -2, qualidade: -2, conformidade: -2, financeiro: -1 },
        avaliacao: "ruim",
        ensinamento: "Mão de obra temporária em linha de produção que acabou de passar em auditoria automotiva de qualidade é um risco de conformidade real. A Montadora Horizonte vai auditar periodicamente — e alta rotatividade de pessoal de produção cria inconsistência nos processos e rastreabilidade que a empresa acabou de construir."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R14 · DECISÃO CRÍTICA · O Concorrente que Aparece
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Concorrente que Aparece",
    description: "Uma metalúrgica de capital chinês anuncia a abertura de uma planta a 80 km da sua no próximo ano, com capacidade 2,5x maior e custo operacional estimado 28% menor por peça. Dois dos seus cinco principais clientes já foram visitados pelos representantes da empresa chinesa. O conselho de administração quer uma resposta estratégica. O que você apresenta como posicionamento da empresa para os próximos 3 anos?",
    tags: ["industria"],
    fase: "decisao",
    choices: [
      {
        text: "Competir por qualidade técnica e conformidade: posicionar a empresa como o fornecedor de maior confiabilidade e rastreabilidade do setor — o que asiáticos não conseguem entregar com a mesma velocidade",
        risco: "baixo",
        effects: { clientes: +5, qualidade: +5, conformidade: +4, reputacao: +4, financeiro: +3 },
        avaliacao: "boa",
        ensinamento: "Competir por qualidade e conformidade contra custo asiático é a estratégia correta para metalúrgicas médias brasileiras. Peças de precisão para automotivo exigem rastreabilidade, qualidade certificada e proximidade logística que uma planta recém-inaugurada não consegue demonstrar nos primeiros anos. A confiabilidade construída em décadas não se replica em 12 meses."
      },
      {
        text: "Competir por custo: reduzir estrutura, automatizar ao máximo e tentar igualar o custo por peça do concorrente em 18 meses",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { financeiro: -3, rh: -4, producao: +2, qualidade: -2, seguranca: -2 },
        avaliacao: "ruim",
        ensinamento: "Tentar igualar custo asiático é uma guerra que metalúrgicas de médio porte raramente vencem. A vantagem de custo estrutural de uma planta de capital estrangeiro com escala 2,5x maior não se elimina com corte de estrutura local. Competir na mesma dimensão do concorrente mais forte é a receita para perder nos próprios termos."
      },
      {
        text: "Focar em nichos de alta complexidade técnica: peças de precisão extrema que exigem certificações específicas que o concorrente não tem — e cobrar o prêmio correspondente",
        risco: "baixo",
        effects: { qualidade: +5, clientes: +3, financeiro: +4, conformidade: +4, producao: -1 },
        avaliacao: "boa",
        ensinamento: "Especialização em nichos de alta complexidade é a estratégia de diferenciação mais sustentável para médias indústrias diante de concorrentes de maior escala. Certificações específicas, tolerâncias apertadas e histórico de conformidade são barreiras de entrada reais que protegem margens — mesmo contra competidores com custo significativamente menor."
      },
      {
        text: "Buscar fusão ou parceria estratégica com outra metalúrgica nacional para ganhar escala suficiente para competir",
        risco: "medio",
        effects: { financeiro: +3, producao: +3, clientes: +2, rh: -2, processos: -2 },
        avaliacao: "media",
        ensinamento: "Fusão para ganho de escala é estrategicamente válido — mas integrar duas culturas industriais enquanto se prepara para um concorrente de alta velocidade é arriscado. A integração pós-fusão em indústria geralmente leva 18 a 24 meses antes de gerar qualquer ganho real de eficiência — e esse é exatamente o tempo em que o concorrente vai estar conquistando clientes."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R15 · DECISÃO FINAL · O Futuro da Fábrica
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Futuro da Fábrica",
    description: "Com o contrato da Montadora Horizonte confirmado, a ISO regularizada e o índice de acidentes em trajetória de queda, você precisa definir o posicionamento estratégico da planta para os próximos 3 anos. O contexto: pressão ESG crescente dos clientes, concorrente asiático chegando, mercado de trabalho metalúrgico apertado e oportunidade de expansão para outros setores além do automotivo.",
    tags: ["industria"],
    fase: "decisao",
    choices: [
      {
        text: "Excelência em manufatura automotiva: certificar IATF 16949, tornar-se o fornecedor de maior confiabilidade da região e crescer dentro da base da Montadora Horizonte",
        effects: { conformidade: +6, clientes: +5, qualidade: +5, financeiro: +4, processos: +3 },
        avaliacao: "boa",
        ensinamento: "IATF 16949 é a certificação automotiva que abre as portas das maiores montadoras do mundo. Ser o fornecedor mais confiável da região em manufatura automotiva é uma posição defensável contra concorrentes asiáticos — que demoram anos para conquistar a certificação e o histórico exigidos pelo setor."
      },
      {
        text: "Diversificação setorial: expandir para infraestrutura, energia renovável e defesa — reduzir dependência do ciclo automotivo",
        effects: { clientes: +4, financeiro: +4, producao: +3, conformidade: +2, rh: +2 },
        avaliacao: "boa",
        ensinamento: "Diversificação setorial para infraestrutura e energia renovável é uma estratégia de crescimento com timing favorável: ambos os setores estão em expansão acelerada e demandam componentes metálicos de precisão com as mesmas certificações que a empresa já tem ou está construindo. Reduzir dependência do automotivo — setor com ciclos de baixa acentuados — é gestão de risco inteligente."
      },
      {
        text: "Indústria 4.0: digitalização completa da fábrica — gêmeo digital, IoT em todos os equipamentos e venda de dados de processo como produto",
        effects: { processos: +5, qualidade: +4, conformidade: +4, financeiro: +3, manutencao: +4 },
        avaliacao: "boa",
        ensinamento: "Digitalização industrial não é só modernização — é criação de um diferencial competitivo que concorrentes com menor maturidade tecnológica não conseguem replicar rapidamente. A metalúrgica que vende dados de processo junto com o componente físico — rastreabilidade, histórico de parâmetros, certificados digitais — oferece algo que o custo asiático não substitui."
      },
      {
        text: "Expansão geográfica: abrir segunda planta em outro estado aproveitando incentivos fiscais regionais e a reputação construída com a Montadora Horizonte",
        requisitos: { indicadorMinimo: { financeiro: 12, conformidade: 12 } },
        effects: { producao: +4, clientes: +3, financeiro: +2, rh: -3, processos: -2, manutencao: -2 },
        avaliacao: "media",
        ensinamento: "Segunda planta antes de ter a primeira operando com excelência replica os problemas em escala maior. A lição mais cara da indústria manufatureira é que crescimento geográfico antes de maturidade operacional dobra o problema, não a capacidade. A planta que acabou de resolver ISO e acidentes precisa de pelo menos 12 meses de estabilidade antes de exportar o modelo."
      }
    ]
  }

],

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [1] · Embalagens Plásticas — Adequação ESG urgente
   Contexto: 430 funcionários, duas plantas no Paraná, R$94M
   faturamento, exigência de 30% de insumos reciclados pelos clientes,
   conversão de linha custa R$8-12M e leva 6-10 meses,
   cliente-âncora enviou carta formal com prazo de adequação.
══════════════════════════════════════════════════════════════════ */
[

  /* ═══════════════════════════════════════════════════════
     R1 · DIAGNÓSTICO · A Carta do Cliente
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Carta do Cliente",
    description: "Você assume a gestão e, na primeira semana, encontra uma carta formal do Grupo Alimentar Nacional — responsável por 22% da receita — sobre sua mesa. A carta é clara: a empresa tem 8 meses para apresentar embalagens com pelo menos 30% de conteúdo reciclado, ou será aberta licitação para novos fornecedores. O consultor ESG contratado há 3 meses diz que a conversão de uma linha leva entre 6 e 10 meses. Qual é seu primeiro movimento?",
    tags: ["industria"],
    fase: "diagnostico",
    choices: [
      {
        text: "Agendar reunião com o Grupo Alimentar Nacional para entender exatamente quais produtos eles precisam primeiro e em qual embalagem — priorizar a conversão pelo portfólio mais crítico para o cliente",
        risco: "baixo",
        effects: { clientes: +5, processos: +3, conformidade: +2, financeiro: +1 },
        avaliacao: "boa",
        ensinamento: "Antes de decidir qual linha converter, é preciso entender qual produto o cliente mais precisa em formato ESG. Clientes que enviam carta formal raramente precisam de 100% do portfólio imediatamente — a conversão gradual por produto prioritário é o que mantém o contrato enquanto o processo acontece."
      },
      {
        text: "Iniciar imediatamente o processo de seleção de fornecedor de resina reciclada — sem matéria-prima garantida, a conversão não adianta",
        risco: "baixo",
        effects: { processos: +4, conformidade: +3, financeiro: -1, producao: +2 },
        avaliacao: "boa",
        ensinamento: "Resina reciclada pós-consumo de qualidade para embalagens alimentícias é escassa e tem lista de espera em fornecedores certificados. Garantir o fornecimento de insumo antes de converter a linha é o passo que a maioria das empresas esquece — e que torna a conversão inútil quando o equipamento está pronto mas o insumo não chega."
      },
      {
        text: "Contratar imediatamente a empresa de engenharia para iniciar a conversão da linha mais rentável — maximizar o retorno do investimento",
        risco: "alto",
        effects: { producao: -2, conformidade: +2, financeiro: -4, clientes: -1, rh: -1 },
        avaliacao: "ruim",
        ensinamento: "Converter a linha mais rentável sem saber qual produto o cliente precisa primeiro é uma aposta que pode usar o capital disponível no ponto errado. A linha mais rentável com o insumo reciclado pode não ser o produto que o Grupo Alimentar Nacional precisa em 8 meses — e você terá gasto R$8-12M fora do alvo."
      },
      {
        text: "Responder formalmente ao Grupo Alimentar Nacional comprometendo o prazo de 8 meses e apresentando um cronograma geral — comprar credibilidade com o cliente enquanto o diagnóstico é feito",
        risco: "medio",
        effects: { clientes: +4, conformidade: +2, processos: +1 },
        avaliacao: "boa",
        ensinamento: "Uma resposta formal comprometendo o prazo com cronograma — mesmo que ainda em construção — demonstra que a empresa levou a carta a sério. O cliente que enviou uma carta formal precisa de sinal de que foi ouvido. O comprometimento escrito abre espaço para a conversa mais detalhada sobre quais produtos têm prioridade."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R2 · DIAGNÓSTICO · O Engenheiro de Processo Fala
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Engenheiro de Processo Fala",
    description: "O engenheiro de processo mais experiente da empresa pede uma reunião reservada. Ele apresenta um diagnóstico técnico que ninguém havia formalizado: 'A linha A da planta 1 pode ser convertida para 30% de reciclado em 5 meses por R$6,8M. A linha B da planta 2 vai levar 9 meses e custar R$11,2M. Mas tem algo que ninguém te contou: a resina reciclada disponível no mercado tem variabilidade de qualidade que pode aumentar o índice de rejeição em até 18% nas primeiras semanas.' Como você responde a esse diagnóstico?",
    tags: ["industria"],
    fase: "diagnostico",
    choices: [
      {
        text: "Priorizar a linha A — menor prazo, menor custo e é a que consegue atender o Grupo Alimentar Nacional dentro dos 8 meses",
        risco: "baixo",
        effects: { conformidade: +4, producao: +3, financeiro: -3, clientes: +4 },
        avaliacao: "boa",
        ensinamento: "Linha A em 5 meses por R$6,8M atende o cliente prioritário dentro do prazo com investimento gerenciável. A lógica é correta: converter o que resolve o problema mais urgente primeiro, e usar o aprendizado operacional com resina reciclada na linha A para fazer uma conversão melhor na linha B depois."
      },
      {
        text: "Investigar fornecedores de resina reciclada de maior consistência antes de iniciar qualquer conversão — o risco de 18% de rejeição pode comprometer a qualidade das embalagens alimentícias",
        risco: "baixo",
        effects: { qualidade: +4, conformidade: +3, processos: +3, clientes: +2, producao: +1 },
        avaliacao: "boa",
        ensinamento: "Para embalagens alimentícias, variabilidade de insumo não é só um problema de custo — é um problema de segurança do produto final. Um lote de embalagens fora da especificação em contato com alimento pode gerar recall e comprometer certificações. Investir 3 semanas em validação de fornecedor de resina antes de converter a linha é o mais barato seguro de qualidade disponível."
      },
      {
        text: "Converter as duas linhas simultaneamente com financiamento — o prazo dos clientes não permite sequenciamento",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { financeiro: -7, producao: -3, rh: -3, conformidade: +2, clientes: +2 },
        avaliacao: "ruim",
        ensinamento: "Converter duas linhas simultaneamente por R$18M de uma vez, sem experiência prévia com resina reciclada, é triplicar o risco operacional. Se o problema de variabilidade de qualidade aparecer, aparece nas duas plantas ao mesmo tempo. Sequenciamento inteligente — com aprendizado da primeira conversão aplicado na segunda — é sempre mais seguro em transformação industrial."
      },
      {
        text: "Apresentar ao engenheiro uma proposta de teste piloto em pequena escala antes da conversão — validar a resina reciclada em produção real antes de investir R$6,8M",
        risco: "baixo",
        effects: { qualidade: +5, processos: +4, financeiro: +1, conformidade: +3, producao: +1 },
        avaliacao: "boa",
        ensinamento: "Piloto de produção com resina reciclada antes da conversão da linha inteira é o investimento mais inteligente possível: revela os problemas de variabilidade em escala controlada, permite ajuste dos parâmetros de processo e dá ao engenheiro os dados reais que vão tornar a conversão definitiva muito mais eficiente."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R3 · DIAGNÓSTICO · A Regulamentação Avança
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Regulamentação Avança",
    description: "O governo federal publica a regulamentação definitiva da Política Nacional de Resíduos Sólidos para embalagens plásticas: a partir do próximo ano, toda embalagem plástica rígida para uso alimentício precisará ter no mínimo 15% de conteúdo reciclado ou pagará uma taxa de R$0,08 por unidade produzida. A sua empresa produz em média 180 milhões de unidades por ano. O CFO calcula: 'Se não convertermos nenhuma linha, a taxa vai custar R$14,4M anuais — mais do que o custo de conversão.' Como você usa esse dado na gestão?",
    tags: ["industria"],
    fase: "diagnostico",
    choices: [
      {
        text: "Apresentar ao conselho o cálculo completo de ROI da conversão versus a taxa regulatória — transformar a pressão ESG em business case financeiro irrefutável",
        risco: "baixo",
        effects: { financeiro: +4, conformidade: +4, processos: +3, clientes: +2 },
        avaliacao: "boa",
        ensinamento: "Traduzir exigência ESG em linguagem financeira é a forma mais eficaz de remover resistência interna. A regulamentação que transforma R$14,4M de taxa evitável em argumento para investimento de R$6,8M em conversão é o business case que o conselho não consegue recusar — e que acelera a aprovação do orçamento."
      },
      {
        text: "Usar o prazo da regulamentação para negociar com os clientes um reajuste de preço — se a lei exige, o custo deve ser compartilhado",
        risco: "medio",
        effects: { financeiro: +3, clientes: -2, conformidade: +1, processos: +1 },
        avaliacao: "media",
        ensinamento: "Tentar repassar o custo da adequação regulatória ao cliente logo após receber uma carta de exigência ESG é a leitura errada do timing. O cliente que está exigindo embalagem sustentável vai interpretar o pedido de reajuste como resistência à mudança — e vai acelerar a avaliação de fornecedores alternativos."
      },
      {
        text: "Antecipar a conformidade para a regulamentação: converter para 25% de reciclado (acima dos 15% exigidos) e usar isso como diferencial comercial com clientes que exigem mais do que a lei pede",
        risco: "baixo",
        effects: { clientes: +5, conformidade: +5, reputacao: +4, qualidade: +3, financeiro: -3 },
        avaliacao: "boa",
        ensinamento: "Superar o mínimo regulatório e usar isso como diferencial é a estratégia que transforma compliance em vantagem competitiva. O cliente que exige 30% de reciclado não vai para o concorrente que faz 15% — e a empresa que já está em 25% tem vantagem real sobre quem está correndo para chegar ao mínimo."
      },
      {
        text: "Calcular o valor de pagar a taxa regulatória nos primeiros 2 anos e usar o período para fazer a conversão com mais calma e melhor tecnologia",
        risco: "alto",
        effects: { financeiro: -5, clientes: -3, conformidade: -3, reputacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Pagar R$14,4M/ano em taxa regulatória enquanto posta a conversão é destruir o mesmo valor que financiaria a mudança — duas vezes. E os clientes que exigem ESG interpretam a escolha de pagar a taxa como declaração de que a empresa não tem intenção real de se adequar. O contrato cai antes de chegar ao segundo ano."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R4 · DIAGNÓSTICO · O Fornecedor de Resina Problemas
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Fornecedor de Resina Problema",
    description: "O fornecedor de resina reciclada selecionado após o piloto entrega o primeiro lote de produção com 23% de variação na densidade do material — fora da especificação técnica acordada. O resultado: 14% de rejeição no primeiro mês de operação da linha convertida, embalagens com espessura irregular que passaram pelo controle de qualidade mas foram devolvidas por dois clientes. O fornecedor alega que o problema é 'sazonalidade da matéria-prima'. Como você age?",
    tags: ["industria"],
    fase: "diagnostico",
    choices: [
      {
        text: "Acionar a cláusula de não-conformidade do contrato, exigir substituição do lote e abrir processo de qualificação de um segundo fornecedor em paralelo — nunca depender de fonte única de insumo crítico",
        risco: "baixo",
        effects: { qualidade: +5, processos: +4, conformidade: +3, clientes: +2, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Dupla qualificação de fornecedor de insumo crítico é o padrão mínimo em qualquer gestão de supply chain madura. Fornecedor único de resina reciclada em processo de adequação regulatória é um ponto de falha que pode paralisar toda a estratégia ESG da empresa. O custo de qualificar um segundo fornecedor é uma fração do custo de ter a linha parada por falta de insumo conformante."
      },
      {
        text: "Ajustar os parâmetros de processo da linha para absorver a variação do fornecedor — adaptar a máquina à resina disponível",
        risco: "medio",
        effects: { producao: +2, qualidade: -2, processos: +2, conformidade: -2, financeiro: +1 },
        avaliacao: "ruim",
        ensinamento: "Adaptar o processo para compensar variação de insumo fora de especificação é aceitar a degradação de qualidade como solução. Em embalagens alimentícias, espessura irregular não é apenas um problema estético — é um risco de contaminação e integridade do produto que os clientes alimentícios não toleram e que pode acionar recall."
      },
      {
        text: "Paralisar a linha convertida até que o fornecedor entregue material conforme especificação — zero tolerância com não-conformidade em insumo crítico",
        risco: "medio",
        effects: { qualidade: +4, producao: -3, clientes: -2, financeiro: -3 },
        avaliacao: "media",
        ensinamento: "Paralisia por não-conformidade de insumo é a decisão correta de qualidade — mas em contexto de prazo com cliente, parar a linha enquanto aguarda fornecedor gera atraso que pode acionar cláusula contratual. A paralisação é mais defensável quando acompanhada de um plano ativo de resolução, não de espera passiva."
      },
      {
        text: "Realizar análise técnica conjunta com o fornecedor na planta deles para identificar a causa-raiz da variação e definir parâmetros de aceitação mais claros",
        risco: "baixo",
        effects: { qualidade: +4, processos: +3, conformidade: +3, clientes: +2 },
        avaliacao: "boa",
        ensinamento: "Análise técnica conjunta na planta do fornecedor transforma uma relação comercial de cobrança em uma parceria de desenvolvimento de processo. Fornecedores de resina reciclada estão todos aprendendo juntos — a empresa que colabora para resolver o problema técnico na fonte tem mais chance de conseguir insumo conforme do que a que apenas cobra."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R5 · DIAGNÓSTICO · A Segunda Carta
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Segunda Carta",
    description: "Cinco meses após a primeira carta, o Grupo Alimentar Nacional envia uma segunda comunicação. O tom é diferente: 'Reconhecemos o progresso nas embalagens da linha A, mas o prazo de 8 meses está chegando ao fim e ainda há produtos críticos do nosso portfólio sem solução ESG. Temos uma reunião de conselho em 60 dias onde decidiremos a base de fornecedores para os próximos 3 anos. Precisamos de uma apresentação sobre o plano completo de adequação.' Como você se prepara para essa apresentação?",
    tags: ["industria"],
    fase: "diagnostico",
    choices: [
      {
        text: "Apresentar dados reais: o que foi feito na linha A, o que está em andamento, os desafios técnicos encontrados e um cronograma realista para os produtos restantes — com evidência de comprometimento, não de perfeição",
        risco: "baixo",
        effects: { clientes: +5, conformidade: +4, reputacao: +3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Apresentação de progresso real com honestidade sobre desafios é muito mais convincente para um conselho do que um plano perfeito no papel. Empresas que mostram o que aprenderam na prática — incluindo os problemas que encontraram e como estão resolvendo — demonstram capacidade de execução que clientes de longo prazo valorizam."
      },
      {
        text: "Contratar uma certificadora independente para validar o conteúdo reciclado já implementado e apresentar o certificado na reunião do conselho",
        risco: "baixo",
        effects: { conformidade: +5, clientes: +4, reputacao: +4, qualidade: +3 },
        avaliacao: "boa",
        ensinamento: "Certificação independente de conteúdo reciclado transforma uma afirmação interna em evidência verificável. Para um conselho que vai decidir a base de fornecedores para 3 anos, um certificado de terceira parte é uma ancoragem que nenhum slide de apresentação substitui."
      },
      {
        text: "Apresentar um plano de conversão das duas plantas completo nos próximos 18 meses — mostrar ambição para tranquilizar o cliente",
        risco: "medio",
        effects: { clientes: +3, conformidade: +2, financeiro: -2, producao: -1 },
        avaliacao: "media",
        ensinamento: "Planos ambiciosos apresentados a clientes sem o histórico de execução para sustentá-los criam expectativa que dificulta a negociação posterior. O cliente que ouviu '18 meses para 100%' e depois recebe '24 meses para 70%' tem uma percepção de falha que não existiria se o plano original fosse mais conservador e honesto."
      },
      {
        text: "Propor ao Grupo Alimentar Nacional um contrato de exclusividade ESG para os próximos 3 anos em troca de flexibilidade no prazo de conversão dos produtos restantes",
        risco: "baixo",
        effects: { clientes: +6, financeiro: +4, conformidade: +3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Contrato de exclusividade ESG como moeda de troca por flexibilidade de prazo é uma negociação inteligente de ambos os lados: o cliente garante fornecimento prioritário de embalagem sustentável e o fornecedor garante o contrato por 3 anos enquanto completa a conversão. Transforma uma pressão de prazo em uma parceria estratégica."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R6 · PRESSÃO · O Segundo Cliente Entra em Cena
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Segundo Cliente Entra em Cena",
    description: "A rede Higiene Brasil — responsável por 19% da receita — envia comunicação formal com exigência similar à do Grupo Alimentar Nacional, mas com prazo mais apertado: 5 meses para apresentar embalagem com 25% de reciclado nos 3 produtos de maior volume. O problema: a linha A recém-convertida está operando com capacidade plena para o Grupo Alimentar. Atender a Higiene Brasil significa dividir a capacidade da linha A — ou iniciar antes do previsto a conversão da linha B, que custará R$11,2M.",
    tags: ["industria"],
    fase: "pressao",
    choices: [
      {
        text: "Renegociar a alocação da linha A com o Grupo Alimentar para liberar capacidade para a Higiene Brasil — transparência sobre o conflito de capacidade e busca de solução conjunta",
        risco: "baixo",
        effects: { clientes: +4, processos: +3, conformidade: +2, financeiro: +1 },
        avaliacao: "boa",
        ensinamento: "Clientes estratégicos que sabem que a empresa está gerenciando múltiplas conversões ESG simultaneamente geralmente preferem colaborar na alocação de capacidade do que perder o fornecedor. A transparência sobre o conflito e a proposta de solução conjunta transforma um problema de fornecedor em um problema compartilhado — com soluções que nenhum dos dois encontraria sozinho."
      },
      {
        text: "Antecipar a conversão da linha B e buscar financiamento — os dois clientes juntos representam 41% da receita e merecem o investimento",
        risco: "medio",
        effects: { clientes: +4, conformidade: +3, financeiro: -5, producao: -2, rh: -2 },
        avaliacao: "media",
        ensinamento: "41% da receita em dois clientes com exigência simultânea é um argumento forte para antecipar o investimento. O risco é executar duas conversões em paralelo com a empresa ainda aprendendo a lidar com resina reciclada. O aprendizado da linha A ainda não foi completamente absorvido — e a linha B vai ter os mesmos desafios, possivelmente amplificados."
      },
      {
        text: "Ser honesto com a Higiene Brasil: a capacidade atual não suporta os dois clientes — propor início em 7 meses com ramp-up gradual dos 3 produtos",
        risco: "baixo",
        effects: { clientes: +3, conformidade: +2, processos: +2, financeiro: +1, producao: +1 },
        avaliacao: "boa",
        ensinamento: "Honestidade sobre capacidade com prazo alternativo é mais respeitada do que promessa impossível seguida de falha. O cliente que aceita 7 meses com entrega real confia mais no fornecedor do que o cliente a quem foi prometido 5 meses e recebeu 8 meses com desculpas."
      },
      {
        text: "Subcontratar a produção das embalagens da Higiene Brasil para um concorrente parceiro durante a transição — manter o contrato sem comprometer a capacidade da linha A",
        risco: "medio",
        effects: { clientes: +2, financeiro: -2, qualidade: -2, conformidade: -1 },
        avaliacao: "ruim",
        ensinamento: "Subcontratar embalagens alimentícias para um concorrente mantém o contrato no papel, mas transfere o controle de qualidade ESG para um terceiro. Se a qualidade do parceiro for abaixo do esperado, o cliente vê a falha com o nome da sua empresa — não do parceiro. E a Higiene Brasil está exigindo ESG de você, não de quem você subcontratar."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R7 · PRESSÃO · O Acidente Químico na Linha
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Acidente Químico na Linha",
    description: "Durante a operação com resina reciclada na linha A, um vazamento de aditivo plastificante expõe três operadores a vapores acima do limite de tolerância. Ninguém foi hospitalizado, mas o SESMT interdita o setor de mistura de compostos por 48 horas. A investigação revela que o procedimento de segurança para o novo aditivo — necessário para processar a resina reciclada — não foi atualizado quando a linha foi convertida. Como você age?",
    tags: ["industria"],
    fase: "pressao",
    choices: [
      {
        text: "Tratar os três operadores, atualizar imediatamente os procedimentos de segurança para todos os novos aditivos e realizar treinamento obrigatório antes de retomar a operação",
        risco: "baixo",
        effects: { seguranca: +5, conformidade: +4, rh: +3, processos: +3 },
        avaliacao: "boa",
        ensinamento: "Incidente de exposição química sem hospitalização é uma janela de aprendizado que muitas empresas ignoram. O treinamento realizado antes de retomar a operação — não depois do próximo incidente — é o que transforma uma quase-tragédia em melhoria real de processo. A atualização do procedimento antes da retomada é a única resposta aceitável."
      },
      {
        text: "Retomar a operação em 24 horas com supervisão adicional — o processo produtivo não pode parar por mais de 48 horas sem comprometer o prazo do cliente",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -3 },
        effects: { seguranca: -4, rh: -4, conformidade: -3, producao: +1, clientes: -1 },
        avaliacao: "ruim",
        ensinamento: "Retomar a operação sem atualizar o procedimento de segurança que causou o incidente é aceitar que o próximo operador vai ser exposto da mesma forma. O prazo do cliente não é argumento aceitável para operar em condição de risco documentado — e se houver um segundo incidente, o custo para o operador e para a empresa será muito maior do que o atraso de entrega."
      },
      {
        text: "Suspender temporariamente o uso do aditivo problemático e buscar formulação alternativa — segurança acima da produção",
        risco: "medio",
        effects: { seguranca: +4, producao: -3, conformidade: +2, financeiro: -2, clientes: -2 },
        avaliacao: "media",
        ensinamento: "Buscar formulação alternativa é a resposta mais estrutural — mas leva tempo que a empresa pode não ter no contexto de prazo com clientes. A solução mais eficiente é a combinação: atualizar o procedimento de segurança imediatamente (48 horas) e iniciar em paralelo a busca de alternativa menos crítica para uso futuro."
      },
      {
        text: "Comunicar proativamente o incidente ao MTE e aos clientes afetados antes de ser acionado — transparência como postura institucional",
        risco: "baixo",
        effects: { conformidade: +4, seguranca: +3, clientes: +3, reputacao: +3 },
        avaliacao: "boa",
        ensinamento: "Comunicação proativa de incidente ao MTE antes de ser fiscalizado e aos clientes antes de vazar pela mídia é uma postura de maturidade institucional rara em indústrias de médio porte. Empresas que reportam voluntariamente constroem uma relação com o regulador e com o cliente que nenhuma empresa que espera ser cobrada consegue ter."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R8 · PRESSÃO · O Banco Questiona
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Banco Questiona",
    description: "O banco que financia 40% do capital de giro da empresa solicita uma reunião. O gerente de conta apresenta uma nova exigência: a partir do próximo semestre, a linha de crédito estará condicionada a um relatório ESG auditado externamente. 'Nossa política de crédito passou a exigir critérios de sustentabilidade para renovação de limites em todos os clientes do setor industrial,' explica ele. 'Empresas sem relatório ESG auditado vão ter seu limite reduzido em 30%.' Um corte de 30% no capital de giro afetaria diretamente a capacidade de pagar fornecedores de resina.",
    tags: ["industria"],
    fase: "pressao",
    choices: [
      {
        text: "Contratar imediatamente uma auditoria ESG — o relatório que o banco exige é o mesmo que vai diferenciar a empresa com os clientes que exigem sustentabilidade",
        risco: "baixo",
        effects: { conformidade: +5, financeiro: +3, clientes: +4, reputacao: +4 },
        avaliacao: "boa",
        ensinamento: "O relatório ESG auditado que o banco exige é o mesmo documento que abre contratos com empresas que fazem due diligence de sustentabilidade em fornecedores. O custo da auditoria é justificado não só pela manutenção do limite de crédito — é um investimento com retorno em múltiplos frentes simultâneos."
      },
      {
        text: "Negociar com o banco um prazo de 12 meses para o primeiro relatório — a empresa está em processo de conversão e os dados ESG só serão robustos quando a linha B também estiver convertida",
        risco: "medio",
        effects: { financeiro: +2, conformidade: +1, clientes: -1, processos: +1 },
        avaliacao: "media",
        ensinamento: "Negociar prazo com o banco é razoável — mas 12 meses sem relatório ESG em um contexto onde clientes já estão exigindo dados é perder a janela de vantagem competitiva. O relatório do estado atual da conversão, mesmo parcial, tem mais valor do que aguardar a perfeição para publicar."
      },
      {
        text: "Buscar uma segunda linha de crédito em outro banco que ainda não exige ESG — diversificar o financiamento e reduzir a dependência",
        risco: "medio",
        gestorEffects: { capitalPolitico: -1 },
        effects: { financeiro: +2, conformidade: -1, clientes: -1, reputacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Fugir da exigência ESG do banco buscando financiamento em instituição sem critério de sustentabilidade é a decisão que vai custar mais caro em 24 meses. Todos os bancos de médio e grande porte estão convergindo para políticas similares — e a empresa que adiou vai ter que se adequar de qualquer forma, mas agora sem relacionamento com o banco principal."
      },
      {
        text: "Usar a exigência do banco como argumento para o conselho aprovar o orçamento da auditoria ESG e do relatório de sustentabilidade — transformar pressão externa em decisão interna",
        risco: "baixo",
        effects: { conformidade: +4, financeiro: +4, clientes: +3, processos: +2, reputacao: +3 },
        avaliacao: "boa",
        ensinamento: "A exigência do banco é o argumento mais forte para aprovação de orçamento de sustentabilidade em um conselho resistente. 'O banco vai cortar 30% do capital de giro se não fizermos' é uma tradução financeira da agenda ESG que qualquer conselheiro entende — independentemente de quantos acreditam na causa."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R9 · PRESSÃO · O Concorrente Anuncia
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Concorrente Anuncia",
    description: "Um concorrente direto — a Embal Sul — anuncia em release à imprensa que completou a conversão de 100% das suas linhas para insumos reciclados e obteve certificação ISCC (International Sustainability & Carbon Certification). Dois dias depois, o Grupo Alimentar Nacional envia e-mail parabenizando a Embal Sul pelo anúncio e, na mesma mensagem, reforça o prazo da sua empresa: 'Reiteramos a importância do cronograma acordado.' O time comercial está inquieto. Como você responde internamente e externamente?",
    tags: ["industria"],
    fase: "pressao",
    choices: [
      {
        text: "Iniciar imediatamente o processo de certificação ISCC — se o concorrente chegou lá, o caminho está mapeado e a empresa não pode ficar sem a mesma credencial",
        risco: "baixo",
        effects: { conformidade: +5, clientes: +4, reputacao: +5, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Certificação ISCC é um diferencial que vai se tornar requisito de mercado em 12 a 24 meses. O concorrente que chegou primeiro abriu o caminho — e entrar no processo agora, com o benchmark já estabelecido, é mais fácil do que ser o primeiro a tentar. O timing é ruim emocionalmente mas bom tecnicamente."
      },
      {
        text: "Comunicar ao Grupo Alimentar Nacional o progresso real da conversão da linha A e o cronograma da linha B — não deixar que o anúncio do concorrente defina a narrativa sobre a empresa",
        risco: "baixo",
        effects: { clientes: +4, reputacao: +3, conformidade: +2, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Comunicação proativa após o anúncio do concorrente é mais eficaz do que silêncio ou reação defensiva. O cliente que recebe uma atualização de progresso da sua empresa no mesmo dia em que leu sobre o concorrente tem um ponto de comparação real — e a empresa que comunica com fatos constrói credibilidade que o release do concorrente não destrói."
      },
      {
        text: "Investigar se a certificação ISCC da Embal Sul é válida para os mesmos produtos que você fornece — pode ser um diferencial irrelevante para o portfólio do Grupo Alimentar",
        risco: "medio",
        effects: { processos: +2, clientes: +1, conformidade: +1 },
        avaliacao: "media",
        ensinamento: "Verificar a relevância real da certificação do concorrente é prudente — mas a investigação não pode ser a resposta visível. O cliente que viu o anúncio do concorrente precisa de uma resposta de postura, não de uma investigação técnica que pode parecer evasão. Investigar internamente e comunicar proativamente ao mesmo tempo é o equilíbrio certo."
      },
      {
        text: "Usar o anúncio do concorrente para urgenciar a aprovação do orçamento de conversão da linha B junto ao conselho — o mercado não vai esperar",
        risco: "baixo",
        effects: { conformidade: +3, producao: +2, financeiro: -3, clientes: +2 },
        avaliacao: "boa",
        ensinamento: "O anúncio do concorrente é o melhor argumento de urgência para aprovação de investimento em um conselho cauteloso. 'A Embal Sul acaba de certificar 100% — nossos clientes vão comparar' é uma frase que move orçamento de forma que meses de apresentação estratégica não conseguem."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R10 · PRESSÃO / GATILHO · A Decisão do Conselho do Cliente
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Decisão do Conselho do Cliente",
    description: "O conselho do Grupo Alimentar Nacional se reúne. A empresa apresentou o progresso da linha A, o cronograma da linha B e a certificação em andamento. A decisão chega 3 dias depois: a empresa foi mantida na base de fornecedores — mas com uma condição nova: os contratos para os próximos 3 anos virão com cláusula de performance ESG trimestral, incluindo metas de redução de emissão de carbono além da porcentagem de reciclado. 'Queremos um parceiro que cresça junto com nossa agenda, não apenas que cumpra o mínimo.' É uma vitória — e um novo nível de exigência. Como você responde?",
    tags: ["industria"],
    fase: "pressao",
    choices: [
      {
        text: "Aceitar as condições e propor co-construção das metas de carbono com o time técnico do cliente — as metas definidas em conjunto têm mais chance de serem realistas e de serem cumpridas",
        risco: "baixo",
        effects: { clientes: +6, conformidade: +4, processos: +3, reputacao: +4 },
        avaliacao: "boa",
        ensinamento: "Metas de carbono co-construídas com o cliente são duplamente estratégicas: são mais realistas do que metas impostas unilateralmente, e criam um nível de comprometimento do cliente com o sucesso da empresa que nenhum contrato padrão cria. O cliente que ajudou a definir a meta vai trabalhar junto para que ela seja atingida."
      },
      {
        text: "Aceitar as condições sem negociar — o contrato de 3 anos vale mais do que a discussão sobre as metas",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { clientes: +3, financeiro: +3, conformidade: -1, processos: -2 },
        avaliacao: "ruim",
        ensinamento: "Aceitar metas de carbono sem negociar o baseline e a metodologia de medição é criar um contrato com armadilha. Metas de emissão definidas unilateralmente pelo cliente podem ser tecnicamente impossíveis para a sua operação — e o trimestre em que você não cumpre aciona uma cláusula que você aceitou sem ler."
      },
      {
        text: "Contratar um consultor de carbono para calcular o baseline de emissões antes de aceitar qualquer meta — sem dados, não é possível negociar com responsabilidade",
        risco: "baixo",
        effects: { conformidade: +4, processos: +3, clientes: +3, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Baseline de carbono antes de aceitar metas de redução é o equivalente a fazer um diagnóstico antes de assinar um plano de tratamento. A empresa que negocia sem dados vai descobrir no primeiro trimestre que a meta era impossível — e perderá a cláusula e a credibilidade simultaneamente."
      },
      {
        text: "Propor que as metas de carbono comecem a valer a partir do contrato seguinte — o contrato atual já tem a meta de reciclado que foi o compromisso original",
        risco: "medio",
        effects: { clientes: -1, financeiro: +2, conformidade: +1, processos: +1 },
        avaliacao: "media",
        ensinamento: "Postergar metas de carbono para o próximo ciclo é defensável se apresentado com um plano de mensuração para o período atual. O cliente que acabou de manter a empresa na base de fornecedores com condições novas não vai aceitar que as condições novas comecem a valer no futuro sem nenhuma ação imediata visível."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R11 · DECISÃO CRÍTICA · A Linha B
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Linha B",
    description: "Com o contrato do Grupo Alimentar Nacional garantido e a Higiene Brasil exigindo resposta, é hora de decidir sobre a conversão da linha B. Três cenários financeiros estão na mesa: (A) Financiamento bancário de R$11,2M com 48 meses de amortização; (B) Leasing do equipamento convertido com opção de compra ao final de 5 anos — R$280k/mês; (C) Parceria com o Grupo Alimentar Nacional que co-investe R$5M em troca de exclusividade de 40% da capacidade da linha B por 3 anos.",
    tags: ["industria"],
    fase: "decisao",
    choices: [
      {
        text: "Opção A: financiamento bancário — total controle do ativo e flexibilidade de alocação de capacidade entre clientes",
        risco: "medio",
        effects: { producao: +4, conformidade: +3, clientes: +3, financeiro: -4 },
        avaliacao: "media",
        ensinamento: "Financiamento bancário com 48 meses é a opção de maior custo financeiro mas maior flexibilidade operacional. A pergunta é se a empresa tem capacidade de serviço da dívida sem comprometer investimentos em segurança e manutenção que também estão na agenda. Crescimento financiado por dívida em ambiente de câmbio volátil exige margem de segurança no fluxo de caixa."
      },
      {
        text: "Opção B: leasing — preservar caixa e transformar custo de capital em custo operacional previsível",
        risco: "baixo",
        effects: { producao: +4, conformidade: +3, financeiro: -2, clientes: +3 },
        avaliacao: "boa",
        ensinamento: "Leasing industrial com opção de compra é o modelo que melhor preserva caixa para investimentos operacionais simultâneos. A previsibilidade do custo mensal facilita o planejamento — e a opção de compra ao final garante que o ativo pode virar patrimônio quando a situação financeira estiver mais confortável."
      },
      {
        text: "Opção C: co-investimento com o cliente — capital externo sem dívida bancária e cliente garantido para 40% da capacidade",
        risco: "baixo",
        effects: { producao: +5, conformidade: +4, clientes: +5, financeiro: +2 },
        avaliacao: "boa",
        ensinamento: "Co-investimento do cliente principal na infraestrutura do fornecedor é um modelo de parceria estratégica que alinha incentivos de forma poderosa: o cliente que investiu quer que a linha funcione bem, que a qualidade seja excelente e que o fornecedor sobreviva. É capital sem dívida e com um cliente âncora garantido por 3 anos."
      },
      {
        text: "Adiar a conversão da linha B por 6 meses — estabilizar a operação da linha A e o fluxo de caixa antes de um segundo investimento de grande escala",
        risco: "medio",
        gestorEffects: { capitalPolitico: -1 },
        effects: { financeiro: +2, clientes: -3, conformidade: -2, producao: -1 },
        avaliacao: "ruim",
        ensinamento: "Seis meses de adiamento no contexto de dois clientes aguardando solução ESG e um concorrente que já certificou 100% das linhas é um risco de perda de contrato real. O tempo que parece de estabilização financeira é o mesmo tempo em que a Higiene Brasil vai para a Embal Sul."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R12 · DECISÃO CRÍTICA · O Relatório de Carbono
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Relatório de Carbono",
    description: "O consultor de carbono finaliza o inventário de emissões da empresa: escopo 1 e 2 estão mapeados. O resultado revela que 67% das emissões vêm do consumo de energia elétrica das linhas de produção. O consultor apresenta três caminhos para redução: (A) Migração para energia solar — investimento de R$3,1M, redução de 45% das emissões em 18 meses; (B) Compra de créditos de carbono para compensar as emissões atuais — R$380k/ano; (C) Negociação de contrato de energia renovável certificada com a concessionária — R$120k/ano adicional.",
    tags: ["industria"],
    fase: "decisao",
    choices: [
      {
        text: "Opção A: energia solar — o único caminho de redução real que vai resistir a auditorias mais rigorosas no futuro",
        risco: "medio",
        effects: { conformidade: +5, reputacao: +5, financeiro: -4, producao: +2, clientes: +4 },
        avaliacao: "boa",
        ensinamento: "Energia solar é a única opção que reduz emissão na fonte — não apenas na contabilidade. À medida que metodologias de carbono evoluem, créditos de compensação estão sendo questionados por grandes clientes e reguladores. A empresa que fez a redução real tem uma posição defensável que a que comprou crédito não tem."
      },
      {
        text: "Opção B: créditos de carbono — a solução mais rápida para cumprir a cláusula de performance ESG do contrato",
        risco: "alto",
        effects: { conformidade: +2, financeiro: -2, reputacao: -2, clientes: +1 },
        avaliacao: "ruim",
        ensinamento: "Créditos de carbono como estratégia principal de descarbonização estão sendo progressivamente rejeitados por clientes com metas ESG sérias. Empresas que usam compensação em vez de redução real são frequentemente criticadas por 'greenwashing' — e clientes como o Grupo Alimentar, que co-investiu na linha B, vão exigir redução real antes do próximo ciclo de contrato."
      },
      {
        text: "Opção C: energia renovável certificada — redução real de emissão a custo acessível, sem comprometer caixa para outras prioridades",
        risco: "baixo",
        effects: { conformidade: +4, reputacao: +3, financeiro: -1, clientes: +3, producao: +1 },
        avaliacao: "boa",
        ensinamento: "Contrato de energia renovável certificada com a concessionária é a opção de melhor custo-benefício imediato: redução real de emissão por R$120k/ano, contra R$380k em créditos sem redução real. Não tem o impacto de longo prazo da solar — mas pode ser a solução do curto prazo enquanto o planejamento de solar é estruturado."
      },
      {
        text: "Combinar C agora e planejar A para o próximo ciclo de investimento — solução imediata com roadmap de longo prazo",
        risco: "baixo",
        effects: { conformidade: +5, reputacao: +4, financeiro: -2, clientes: +4, producao: +2 },
        avaliacao: "boa",
        ensinamento: "Estratégia de curto prazo com energia renovável certificada + roadmap de solar é o posicionamento mais crível para clientes com agenda ESG de longo prazo. Demonstra compromisso real (redução agora) e visão estrutural (investimento em solar planejado) — sem comprometer o caixa que ainda está sendo usado na conversão da linha B."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R13 · DECISÃO CRÍTICA · O Mercado de Exportação
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Mercado de Exportação",
    description: "Um distribuidor europeu de embalagens sustentáveis visita a planta e apresenta uma proposta: exportar 15% da capacidade da linha A para o mercado europeu, onde embalagens com conteúdo reciclado certificado ISCC têm margem 35% maior do que no mercado doméstico. A condição: a certificação ISCC precisa estar concluída em 4 meses. O gerente de exportações diz: 'É a maior oportunidade de margem que já vi para esse produto.' O time de produção diz: 'Vai apertar a capacidade para os clientes nacionais.'",
    tags: ["industria"],
    fase: "decisao",
    choices: [
      {
        text: "Aceitar a oportunidade de exportação e expandir a capacidade da linha A em 15% — o investimento em expansão é justificado pela margem europeia",
        risco: "medio",
        effects: { financeiro: +5, clientes: +3, conformidade: +4, reputacao: +5, producao: +3 },
        avaliacao: "boa",
        ensinamento: "Expansão de capacidade em 15% para absorver exportação com margem 35% maior é um investimento com ROI claro. O mercado europeu de embalagens sustentáveis está crescendo e o diferencial de margem tende a aumentar com as novas regulamentações de embalagem da UE. Entrar agora com capacidade adicional é construir posição antes que o mercado fique mais competitivo."
      },
      {
        text: "Aceitar a exportação realocando 15% da capacidade atual — a margem europeia compensa a redução de volume doméstico",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { financeiro: +3, clientes: -3, conformidade: +3, producao: -1 },
        avaliacao: "ruim",
        ensinamento: "Realocar 15% da capacidade doméstica para exportação sem reposição vai apertar o atendimento a clientes como Grupo Alimentar e Higiene Brasil — que acabaram de ser reconquistados com esforço considerável. Perder espaço com cliente nacional por ganho de margem internacional é trocar relacionamento construído por receita nova, sem garantia de continuidade."
      },
      {
        text: "Completar primeiro a certificação ISCC e fazer um piloto de exportação com volume pequeno — validar o processo antes de comprometer capacidade",
        risco: "baixo",
        effects: { conformidade: +4, financeiro: +2, clientes: +2, producao: +1 },
        avaliacao: "boa",
        ensinamento: "Piloto de exportação com volume controlado é a forma inteligente de entrar em um mercado novo sem comprometer a operação que está sendo construída. A certificação ISCC em andamento abre a porta — e o piloto com o distribuidor europeu permite aprender as exigências específicas do mercado sem os riscos de um contrato em escala."
      },
      {
        text: "Recusar a exportação por ora — a empresa ainda está estabilizando a operação ESG doméstica e não tem capacidade gerencial para dois mercados simultâneos",
        risco: "medio",
        effects: { producao: +2, conformidade: +2, clientes: +1, financeiro: -1, reputacao: -2 },
        avaliacao: "media",
        ensinamento: "Recusar uma oportunidade de exportação com margem 35% maior por limitação gerencial é uma decisão honesta sobre capacidade — mas tem custo de oportunidade real. O distribuidor europeu que foi ao Brasil para fechar o negócio vai para um concorrente que está na mesma posição ESG mas diz sim. E oportunidades de exportação não costumam voltar com as mesmas condições."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R14 · DECISÃO CRÍTICA · O Modelo de Negócio ESG
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Modelo de Negócio ESG",
    description: "Com duas linhas convertidas, certificação ISCC em andamento e relatório de carbono publicado, o conselho discute uma questão estratégica: a empresa deve posicionar a conversão ESG como diferencial comercial e cobrar prêmio de preço, ou manter os mesmos preços e usar a sustentabilidade como argumento de retenção de clientes? O CFO apresenta os números: a conversão aumentou o custo unitário em R$0,043 por embalagem. O cliente paga o mesmo. A margem caiu 2,1 pontos percentuais.",
    tags: ["industria"],
    fase: "decisao",
    choices: [
      {
        text: "Implementar reajuste de preço justificado pelo custo adicional do insumo reciclado — o cliente que exigiu ESG deve pagar pelo ESG",
        risco: "medio",
        effects: { financeiro: +5, clientes: +2, conformidade: +2, reputacao: +3 },
        avaliacao: "boa",
        ensinamento: "Reajuste de preço por custo de insumo reciclado é defensável — especialmente para clientes que explicitamente exigiram a adequação. A negociação transparente de preço com dados de custo abertos é mais respeitada do que a margem comprimida silenciosa. O cliente que exigiu ESG sem pagar pela embalagem ESG tem responsabilidade compartilhada com a decisão de converter."
      },
      {
        text: "Absorver o custo adicional e usar a certificação ISCC como argumento para conquistar novos clientes com maior margem — crescimento compensa a compressão",
        risco: "medio",
        effects: { clientes: +4, conformidade: +3, reputacao: +4, financeiro: -1 },
        avaliacao: "media",
        ensinamento: "Absorver o custo de conversão para ganhar novos clientes é uma aposta de crescimento — que funciona se os novos clientes chegarem rápido o suficiente para compensar a margem comprimida. O risco é que a conquista de novos clientes leva de 6 a 12 meses enquanto a margem está sendo consumida desde já."
      },
      {
        text: "Criar dois SKUs: embalagem padrão (preço atual) e embalagem ESG certificada (preço com prêmio) — deixar o cliente escolher e precificar o valor da sustentabilidade",
        risco: "baixo",
        effects: { financeiro: +4, clientes: +4, conformidade: +4, reputacao: +4, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Dupla precificação com SKU ESG diferenciado é uma estratégia elegante que deixa o mercado revelar o valor que atribui à sustentabilidade. Clientes que exigem ESG por regulação vão ao SKU ESG. Clientes que não têm exigência formal mas querem se posicionar também. E a empresa recupera a margem sem impor o custo a quem não precisa do diferencial."
      },
      {
        text: "Buscar redução de custo na operação para compensar o aumento do insumo reciclado — a empresa não pode repassar indefinidamente custos de adequação ao cliente",
        risco: "baixo",
        effects: { financeiro: +3, processos: +4, producao: +2, qualidade: +2, conformidade: +1 },
        avaliacao: "boa",
        ensinamento: "Eficiência operacional para absorver custo de insumo mais caro é uma estratégia legítima — mas tem limite. O custo adicional de R$0,043 por embalagem representa uma decisão permanente de operação com insumo mais caro. Reduzir rejeição, aumentar produtividade e eliminar desperdício podem compensar parte — mas dificilmente compensam o total sem algum reajuste de preço."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R15 · DECISÃO FINAL · O Futuro da Embalagem
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Futuro da Embalagem",
    description: "Com as duas linhas convertidas, certificação ISCC e relatório de carbono publicado, a empresa está em posição estratégica que nenhum concorrente local atingiu. O conselho discute o posicionamento para os próximos 3 anos em um mercado que vai exigir mais, não menos, sustentabilidade.",
    tags: ["industria"],
    fase: "decisao",
    choices: [
      {
        text: "Liderança em embalagem circular: fechar o ciclo com coleta e reprocessamento do próprio resíduo pós-consumo — criar o insumo reciclado que a empresa usa",
        effects: { conformidade: +6, reputacao: +6, clientes: +5, financeiro: +3, processos: +4 },
        avaliacao: "boa",
        ensinamento: "Economia circular fechada — onde a empresa coleta, reprocessa e usa o próprio resíduo pós-consumo — é o modelo que vai diferenciar fornecedores no longo prazo. Eliminar a dependência de fornecedores de resina reciclada (com toda a variabilidade que já foi vivida) e controlar a cadeia do insumo é uma vantagem estrutural que poucos players de médio porte conseguem construir."
      },
      {
        text: "Expansão para embalagens biodegradáveis: complementar o portfólio reciclado com materiais que se degradam em compostagagem industrial",
        effects: { reputacao: +5, clientes: +4, conformidade: +4, financeiro: +3, producao: +2 },
        avaliacao: "boa",
        ensinamento: "Embalagens biodegradáveis para uso em alimentação e saúde são o próximo segmento de crescimento acelerado em embalagens sustentáveis. Empresas que chegaram primeiro no reciclado têm vantagem de processo e de relacionamento com clientes para liderar também nessa próxima onda — especialmente com clientes que já investiram no relacionamento ESG."
      },
      {
        text: "Plataforma de rastreabilidade de embalagem: tecnologia de QR code e blockchain para rastrear a cadeia completa da embalagem — do insumo reciclado ao descarte pelo consumidor final",
        effects: { conformidade: +5, reputacao: +5, clientes: +4, processos: +5, financeiro: +3 },
        avaliacao: "boa",
        ensinamento: "Rastreabilidade blockchain de embalagem é o próximo requisito de grandes varejistas e fabricantes de alimentos que precisam provar a cadeia ESG ao consumidor final. A empresa que oferece QR code com histórico verificável do insumo reciclado ao destino final da embalagem entrega um diferencial que o marketing de sustentabilidade do cliente não consegue replicar com outro fornecedor."
      },
      {
        text: "Crescimento por aquisição: comprar um concorrente menor que não conseguiu fazer a conversão ESG — ganhar market share e capacidade ao mesmo tempo",
        requisitos: { indicadorMinimo: { financeiro: 12, conformidade: 11 } },
        effects: { producao: +4, clientes: +3, financeiro: -3, rh: -3, processos: -3, qualidade: -2 },
        avaliacao: "media",
        ensinamento: "Aquisição de concorrente em dificuldade ESG pode ser uma oportunidade de mercado — mas integrar uma planta sem maturidade de conformidade enquanto a própria empresa ainda está consolidando a conversão é multiplicar os desafios sem multiplicar a capacidade de gestão. Crescimento por aquisição funciona quando a empresa compradora tem excesso de capacidade de gestão — não quando está usando toda ela."
      }
    ]
  }

],

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [2] · Química — Autuação IBAMA, planta em regime parcial
   Contexto: 280 funcionários, ABC paulista, R$71M faturamento,
   autuação IBAMA R$4,1M por descarte irregular, planta em
   regime parcial, responsável ambiental pediu demissão,
   dois clientes sinalizaram revisão de contrato.
══════════════════════════════════════════════════════════════════ */
[

  /* ═══════════════════════════════════════════════════════
     R1 · DIAGNÓSTICO · A Autuação no Dia 1
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Autuação no Dia 1",
    description: "Você assume a gestão com a autuação do IBAMA de R$4,1 milhões já formalizada e a planta operando em regime parcial. O responsável ambiental pediu demissão no dia seguinte à autuação — levando consigo o conhecimento de todos os processos de descarte. O gerente de produção é direto: 'Sem o ambiental, não sei o que posso ou não posso fazer. Metade da linha está parada por precaução.' Qual é o seu primeiro movimento?",
    tags: ["industria"],
    fase: "diagnostico",
    choices: [
      {
        text: "Contratar um consultor ambiental sênior em regime de urgência para assumir a gestão de conformidade imediatamente — não há decisão de retomada possível sem expertise técnica",
        risco: "baixo",
        effects: { conformidade: +5, producao: +3, processos: +3, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "A contratação emergencial de expertise ambiental técnica é o pré-requisito para qualquer outra decisão. Sem saber o que é permitido e o que está sob interdição, qualquer retomada de produção é um segundo risco de autuação. O consultor sênior que conhece o IBAMA e a legislação aplicável ao setor químico resolve em dias o que levaria semanas de aprendizado interno."
      },
      {
        text: "Convocar toda a liderança para mapear o que a empresa sabe sobre o processo de descarte antes de contratar alguém de fora",
        risco: "alto",
        effects: { processos: +1, producao: -2, conformidade: -2, financeiro: -1 },
        avaliacao: "ruim",
        ensinamento: "Mapeamento interno de processo de descarte em empresa que acabou de ser autuada por descarte irregular é como pedir ao paciente que diagnostique a própria doença. O conhecimento fragmentado que a equipe tem não substitui expertise regulatória — e o tempo de levantamento interno atrasa a retomada sem adicionar segurança."
      },
      {
        text: "Entrar em contato com o IBAMA imediatamente para entender o escopo exato da autuação e o que é necessário para retomar a operação plena",
        risco: "baixo",
        effects: { conformidade: +4, producao: +2, reputacao: +3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Contato proativo com o IBAMA logo após a autuação é a postura que mais diferencia empresas que regularizam rapidamente das que ficam meses em limbo. O fiscal que recebe uma ligação do novo gestor pedindo entender o caminho de retomada tem um interlocutor diferente do fiscal que precisa cobrar. Isso acelera o processo e muda o tom da relação."
      },
      {
        text: "Priorizar a retomada da produção das linhas que não estão relacionadas ao descarte autuado — recuperar receita enquanto o problema ambiental é resolvido",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2 },
        effects: { producao: +2, conformidade: -3, financeiro: +1, reputacao: -3 },
        avaliacao: "ruim",
        ensinamento: "Retomar produção sem mapear o que exatamente está sob interdição é correr o risco de uma segunda autuação que pode elevar a multa e, pior, resultar em embargo total. O IBAMA monitora empresas autuadas com atenção redobrada nas semanas seguintes — qualquer irregularidade adicional muda completamente o perfil do processo."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R2 · DIAGNÓSTICO · O Laudo Técnico
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Laudo Técnico",
    description: "O consultor ambiental contratado em emergência passa 5 dias na planta e entrega o diagnóstico: o descarte irregular não foi um evento isolado — foi prática sistemática por pelo menos 18 meses. O tanque de resíduo que era descartado na área de proteção era usado por três processos diferentes de produção. A restauração da área afetada vai custar entre R$800k e R$1,2M adicionais à multa de R$4,1M. 'O bom é que é reversível,' diz o consultor. 'O ruim é que vai levar de 12 a 18 meses.' Como você responde ao diagnóstico?",
    tags: ["industria"],
    fase: "diagnostico",
    choices: [
      {
        text: "Comunicar voluntariamente ao IBAMA o diagnóstico completo e propor um Termo de Ajuste de Conduta (TAC) com cronograma de restauração — transparência total como estratégia de regularização",
        risco: "baixo",
        effects: { conformidade: +6, reputacao: +4, financeiro: -2, clientes: +2 },
        avaliacao: "boa",
        ensinamento: "TAC com o IBAMA é o instrumento que transforma uma relação adversarial em um processo de regularização monitorado. Empresas que propõem o TAC voluntariamente — com diagnóstico completo e cronograma realista — frequentemente conseguem redução da multa original e suspensão das restrições operacionais enquanto cumprem o cronograma. É a estratégia com melhor custo-benefício disponível."
      },
      {
        text: "Contratar advogado ambiental para avaliar se a prática de 18 meses pode ser contestada — talvez o IBAMA não consiga provar a sistemática",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2 },
        effects: { conformidade: -3, reputacao: -4, financeiro: -2, clientes: -3 },
        avaliacao: "ruim",
        ensinamento: "Contestar uma prática documentada de 18 meses em vez de propor regularização é a estratégia que transforma um processo administrativo em um processo criminal. O IBAMA tem poder de lavrar autuação penal — que responsabiliza gestores pessoalmente — e a empresa que tenta contestar o óbvio enquanto a área de proteção continua afetada é a candidata natural a esse escalonamento."
      },
      {
        text: "Propor um cronograma de restauração mais agressivo — 8 meses em vez de 18 — para demonstrar comprometimento e negociar redução da multa",
        risco: "medio",
        effects: { conformidade: +4, reputacao: +3, financeiro: +1, processos: -1 },
        avaliacao: "media",
        ensinamento: "Proposta de cronograma mais agressivo demonstra urgência — mas prometer restauração em 8 meses quando o consultor avalia 12 a 18 é criar um novo risco de descumprimento. IBAMA que vê empresa prometer 8 meses e entregar 14 tem uma percepção muito pior do que se a empresa tivesse prometido 16 e entregado 14."
      },
      {
        text: "Comunicar aos dois clientes que sinalizaram revisão de contrato o diagnóstico e o plano de regularização antes que eles descubram por outro canal",
        risco: "baixo",
        effects: { clientes: +4, reputacao: +4, conformidade: +2, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Clientes que dependem de fornecedor químico em contexto de autuação ambiental têm próprio risco de reputação — eles precisam saber o que está acontecendo com o fornecedor antes que apareça na imprensa. A empresa que conta antes de ser cobrada coloca os clientes na posição de aliados no processo de regularização, não de fiscais."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R3 · DIAGNÓSTICO · A Imprensa Regional
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Imprensa Regional",
    description: "O jornal regional mais lido do ABC publica uma matéria com o título 'Indústria química descarta resíduo tóxico em área protegida há 18 meses'. A reportagem tem fotos do local, a cópia do auto de infração e a declaração de dois moradores da área que relatam odores. O portal de notícias da cidade já tem 340 compartilhamentos. O telefone do departamento de comunicação não para de tocar. Você não tem departamento de comunicação — a empresa nunca precisou de um. O que você faz?",
    tags: ["industria"],
    fase: "diagnostico",
    choices: [
      {
        text: "Publicar uma nota oficial imediatamente: reconhecer o problema, comunicar as ações já iniciadas e anunciar o compromisso de restauração — com prazo e evidência",
        risco: "baixo",
        effects: { reputacao: +4, clientes: +3, conformidade: +2, rh: +2 },
        avaliacao: "boa",
        ensinamento: "A nota que reconhece o problema e anuncia ações concretas já em andamento é o único tipo de comunicação que interrompe a escalada de uma crise de reputação. Silêncio após publicação em imprensa regional com 340 compartilhamentos vai dobrar os compartilhamentos em 24 horas. A nota que chega antes do segundo dia de cobertura define a narrativa."
      },
      {
        text: "Contratar uma agência de relações públicas de crise — a empresa não tem capacidade de gestão de mídia e precisa de especialistas",
        risco: "medio",
        effects: { reputacao: +3, financeiro: -2, clientes: +2, conformidade: +1 },
        avaliacao: "boa",
        ensinamento: "Agência de RP de crise tem valor real — mas o gap entre contratar a agência e ela produzir a primeira nota é de horas que a cobertura vai usar para escalar. A decisão correta é emitir uma nota própria imediatamente — simples, honesta e com prazo — e usar a agência para a estratégia de médio prazo, não para o primeiro dia."
      },
      {
        text: "Não responder à imprensa — qualquer declaração pode ser usada contra a empresa no processo do IBAMA",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2 },
        effects: { reputacao: -5, clientes: -4, rh: -3, conformidade: -2 },
        avaliacao: "ruim",
        ensinamento: "Silêncio de empresa em crise ambiental com cobertura de imprensa ativa é interpretado como confirmação de culpa. O argumento jurídico de 'não declarar para não prejudicar o processo' é correto para o processo do IBAMA — mas há uma diferença entre não fazer declaração jurídica e não ter nenhuma comunicação pública. A nota que reconhece e anuncia ação não precisa ser uma confissão legal."
      },
      {
        text: "Pedir ao IBAMA que faça uma declaração conjunta com a empresa sobre o plano de regularização — usar a autoridade do órgão para gerenciar a narrativa",
        risco: "medio",
        effects: { reputacao: +3, conformidade: +3, clientes: +2, processos: +2 },
        avaliacao: "media",
        ensinamento: "Declaração conjunta com o IBAMA é uma estratégia criativa que funciona quando o órgão já está em modo de regularização colaborativa — ou seja, quando a empresa já propôs o TAC. Pedir isso antes de ter estabelecido a postura de cooperação é improvável que o IBAMA aceite — e pode ser interpretado como tentativa de usar o órgão como escudo."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R4 · DIAGNÓSTICO · O Time Interno Desorientado
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Time Interno Desorientado",
    description: "Uma semana após a matéria, 12 funcionários pediram transferência de departamento ou mudança de função para não trabalhar nos processos ligados ao descarte. Três operadores seniores com 8 a 14 anos de casa pediram demissão, alegando 'vergonha de trabalhar na empresa'. O supervisor de turno mais respeitado da planta convoca você para uma conversa particular: 'As pessoas não sabem se a empresa vai fechar. Precisam ouvir algo.' O que você comunica ao time?",
    tags: ["industria"],
    fase: "diagnostico",
    choices: [
      {
        text: "Fazer uma assembleia com todos os funcionários: apresentar o diagnóstico honesto, o plano de regularização com o IBAMA e o comprometimento da empresa com a restauração — sem minimizar nem catastrofizar",
        risco: "baixo",
        effects: { rh: +6, reputacao: +3, processos: +3, conformidade: +2 },
        avaliacao: "boa",
        ensinamento: "Trabalhadores de empresa em crise ambiental pública têm duas necessidades básicas: entender o que aconteceu de verdade e saber que a empresa vai continuar. A assembleia que entrega ambas — com honestidade sobre o erro e clareza sobre o plano — é o que transforma funcionários prestes a sair em pessoas que decidem ficar e contribuir para a virada."
      },
      {
        text: "Criar um canal de comunicação interno semanal sobre o progresso do processo de regularização — manter o time informado sem expor detalhes sensíveis",
        risco: "baixo",
        effects: { rh: +4, processos: +2, conformidade: +2, clientes: +1 },
        avaliacao: "boa",
        ensinamento: "Comunicação interna regular durante uma crise é uma das ferramentas mais subestimadas de retenção de equipe. O funcionário que recebe atualização semanal sobre o progresso real do processo de regularização não precisa construir narrativas a partir de rumores — e o rumor é sempre mais assustador do que a realidade comunicada."
      },
      {
        text: "Oferecer bônus de retenção de 2 salários para os funcionários-chave que ficarem por pelo menos 12 meses",
        risco: "medio",
        effects: { rh: +3, financeiro: -3, processos: +1 },
        avaliacao: "media",
        ensinamento: "Bônus de retenção resolve o problema financeiro de quem está saindo por dinheiro — mas os três que pediram demissão por 'vergonha' não vão ficar por 2 salários. Retenção em crise de valores precisa de resposta de valores, não de resposta financeira. O dinheiro pode complementar, mas não substituir a comunicação honesta sobre o que aconteceu e o que vai mudar."
      },
      {
        text: "Demitir o gerente de produção que supervisionava os processos de descarte irregulares — demonstrar que há responsabilização interna",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -3 },
        effects: { rh: -4, processos: -3, conformidade: -1, producao: -2 },
        avaliacao: "ruim",
        ensinamento: "Demitir o gerente de produção como gesto de responsabilização pública quando o problema era sistêmico cria um precedente de bode expiatório que destrói a segurança psicológica da liderança inteira. O time de gestão que vê um colega ser demitido por um problema que todos conheciam e ninguém reportou vai se fechar — exatamente o oposto do que a empresa precisa para reconstruir sua cultura."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R5 · DIAGNÓSTICO · Os Clientes Pedem Posição
  ═══════════════════════════════════════════════════════ */
  {
    title: "Os Clientes Pedem Posição",
    description: "Os dois clientes que sinalizaram revisão de contrato pedem uma reunião formal. Eles querem entender: a empresa tem capacidade de entregar os produtos com regularidade? A situação ambiental vai gerar interdição total da planta? Há risco de embargo pelo IBAMA? Eles têm R$12,4M anuais em contratos com a empresa e precisam de resposta antes do fim do mês para suas próprias decisões de fornecimento. O que você apresenta nessa reunião?",
    tags: ["industria"],
    fase: "diagnostico",
    choices: [
      {
        text: "Apresentar o diagnóstico completo, o TAC em negociação com o IBAMA, o plano de retomada da produção plena e o cronograma de restauração — dados reais, sem eufemismo nem catastrophismo",
        risco: "baixo",
        effects: { clientes: +5, reputacao: +4, conformidade: +3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Clientes B2B em reunião formal de avaliação de risco de fornecedor querem dados, não emoção. A empresa que chega com o TAC em negociação, o cronograma de restauração e o plano de retomada documentado demonstra que tem controle do processo — e controle é exatamente o que o cliente precisa ver para não substituir o fornecedor."
      },
      {
        text: "Trazer o consultor ambiental para a reunião como testemunha técnica — a credibilidade do especialista pode compensar a vulnerabilidade da empresa",
        risco: "baixo",
        effects: { clientes: +4, conformidade: +3, reputacao: +3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "A presença do consultor ambiental sênior na reunião com clientes transforma o perfil da empresa: de empresa que causou o problema para empresa que contratou a melhor expertise disponível para resolvê-lo. O cliente que vê quem está gerenciando a crise fica mais tranquilo do que o cliente que só ouve o gestor descrever o que o consultor disse."
      },
      {
        text: "Oferecer desconto de 8% nos contratos durante o período de regularização — manter os clientes com incentivo financeiro",
        risco: "medio",
        effects: { clientes: +2, financeiro: -3, conformidade: -1, reputacao: -1 },
        avaliacao: "media",
        ensinamento: "Desconto em crise de reputação é lido como admissão de que a empresa tem algo a compensar — o que pode aumentar a percepção de risco em vez de reduzir. Clientes que ficam pelo desconto são clientes que estão dispostos a substituir o fornecedor assim que encontrarem preço equivalente em empresa sem o histórico de autuação."
      },
      {
        text: "Propor visita dos clientes à planta para ver o processo de regularização em andamento — transparência radical como argumento de retenção",
        risco: "baixo",
        effects: { clientes: +6, reputacao: +5, conformidade: +3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Visita à planta durante processo de regularização é a transparência mais convincente possível: o cliente que vê os tambores de resíduo devidamente acondicionados, o consultor ambiental presente e os processos em revisão percebe uma empresa que está enfrentando o problema de frente. É muito mais poderoso do que qualquer apresentação de slides."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R6 · PRESSÃO · O Embargo Parcial
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Embargo Parcial",
    description: "O IBAMA emite uma ordem de embargo parcial: os três processos que geravam o resíduo descartado irregularmente ficam suspensos até a conclusão do TAC. Esses três processos representam 38% da capacidade produtiva da planta. Você tem 5 dias para organizar a operação com 62% da capacidade e comunicar os clientes sobre os impactos de prazo e volume. Quatro contratos têm cláusula de penalidade por atraso. O que você prioriza?",
    tags: ["industria"],
    fase: "pressao",
    choices: [
      {
        text: "Comunicar imediatamente todos os clientes impactados com o novo cronograma e a justificativa — e identificar quais dos quatro contratos com penalidade têm mais risco",
        risco: "baixo",
        effects: { clientes: +4, conformidade: +3, processos: +3, reputacao: +2 },
        avaliacao: "boa",
        ensinamento: "Comunicação antecipada de atraso em contexto de embargo regulatório tem tratamento diferente do atraso por falha operacional. A maioria dos contratos tem cláusula de força maior que cobre interdição por órgão regulador — mas essa proteção só vale se a empresa comunicar antes do atraso acontecer, não depois."
      },
      {
        text: "Realocar a capacidade dos 62% restantes para priorizar os contratos com penalidade de atraso — minimizar o risco financeiro imediato",
        risco: "medio",
        effects: { financeiro: +3, clientes: +3, producao: +2, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Priorização de capacidade por risco contratual é a resposta operacional correta a uma redução forçada de capacidade. Os contratos com penalidade precisam ser atendidos primeiro — e os clientes que ficam em segundo plano precisam ser comunicados com antecedência. A decisão de prioridade precisa ser transparente, não silenciosa."
      },
      {
        text: "Subcontratar os três processos embargados para uma empresa química parceira durante o período do TAC — manter a entrega sem comprometer o embargo",
        risco: "medio",
        effects: { clientes: +3, producao: +2, financeiro: -3, conformidade: +1 },
        avaliacao: "media",
        ensinamento: "Subcontratação de processos embargados é tecnicamente possível — mas precisa ser comunicada ao IBAMA para que não seja interpretada como tentativa de contornar o embargo. A empresa que subcontrata sem informar o órgão pode ter o embargo transformado em embargo total. Transparência com o IBAMA é o padrão em TAC, não a exceção."
      },
      {
        text: "Reavaliar o portfólio de produtos e descontinuar os menos rentáveis produzidos pelos processos embargados — usar a crise para simplificar o mix",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { financeiro: +2, clientes: -3, producao: -2, rh: -2 },
        avaliacao: "ruim",
        ensinamento: "Descontinuar produtos em resposta a embargo, sem consultar os clientes que dependem desses produtos, é adicionar uma crise comercial a uma crise regulatória. O cliente que comprava o produto descontinuado vai para o concorrente — e quando o embargo terminar, o processo de reconquistar esse cliente vai custar muito mais do que manter o produto no portfólio durante a crise."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R7 · PRESSÃO · O Sindicato e a Segurança
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Sindicato e a Segurança",
    description: "O sindicato dos químicos convoca reunião formal e apresenta uma demanda: realização de laudo independente de segurança ocupacional em todos os setores da planta — não apenas nos embargados — antes de retomada da operação plena. 'Nossos associados têm direito de saber se estavam trabalhando em ambiente de risco há 18 meses,' diz o representante. O médico do trabalho da empresa alerta: 'Um laudo independente pode revelar outras irregularidades que não foram levantadas pelo IBAMA.' Como você responde?",
    tags: ["industria"],
    fase: "pressao",
    choices: [
      {
        text: "Aceitar o laudo independente e contratar a empresa de auditoria antes mesmo de ser exigido formalmente — proatividade como demonstração de seriedade com a saúde dos trabalhadores",
        risco: "baixo",
        effects: { seguranca: +5, rh: +5, conformidade: +4, reputacao: +3 },
        avaliacao: "boa",
        ensinamento: "Aceitar laudo independente antes de ser obrigado é o gesto que mais rapidamente restaura a confiança do sindicato e dos trabalhadores. O laudo que revela irregularidades adicionais é difícil de receber — mas é sempre melhor descobrir agora, com a empresa no controle do processo, do que em uma segunda fiscalização do IBAMA ou do MTE."
      },
      {
        text: "Negociar o escopo do laudo com o sindicato: restringir ao setores que usavam os processos de descarte embargados — limitar o alcance para controlar o risco de novas descobertas",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2 },
        effects: { rh: -3, seguranca: -2, conformidade: -2, reputacao: -3 },
        avaliacao: "ruim",
        ensinamento: "Tentar restringir o escopo do laudo independente em um contexto onde os trabalhadores já desconfiam da gestão ambiental vai ser interpretado como tentativa de esconder algo. O sindicato que aceitar um laudo restrito vai usar exatamente essa restrição como argumento em qualquer negociação futura. O custo de aceitar o laudo amplo é menor do que o custo de parecer que está escondendo."
      },
      {
        text: "Propor que o laudo seja conduzido pelo próprio SESMT com acompanhamento sindical — reduzir o custo e manter a confiança interna",
        risco: "medio",
        effects: { rh: +3, seguranca: +3, conformidade: +2, financeiro: +1 },
        avaliacao: "media",
        ensinamento: "Laudo conduzido pelo SESMT interno com acompanhamento sindical tem custo menor — mas o sindicato que pediu laudo independente geralmente tem uma razão específica para não confiar no SESMT interno. A proposta pode ser interpretada como evasão da independência pedida — e o acompanhamento sindical não equivale à independência técnica."
      },
      {
        text: "Antecipar o laudo de saúde ocupacional como iniciativa própria da empresa — realizando os exames antes mesmo da reunião formal com o sindicato",
        risco: "baixo",
        effects: { seguranca: +5, rh: +5, reputacao: +4, conformidade: +3 },
        avaliacao: "boa",
        ensinamento: "Antecipar os exames ocupacionais como iniciativa da empresa — antes de ser exigido pelo sindicato — é a resposta de uma gestão que coloca a saúde dos trabalhadores à frente da gestão de risco institucional. E o sindicato que chega à reunião formal e descobre que a empresa já iniciou o processo tem uma posição completamente diferente."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R8 · PRESSÃO · O Alto do Dólar
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Alto do Dólar",
    description: "O dólar atinge o maior nível histórico. Seus principais insumos — solventes e aditivos importados — encarecem 31% de um mês para o outro. A empresa já está operando a 62% da capacidade por causa do embargo. O CFO apresenta o cenário: 'Se não ajustarmos preço ou cortarmos custos em 30 dias, vamos ter o pior resultado trimestral da história da empresa.' Mas qualquer reajuste de preço precisa ser negociado com clientes que já estão avaliando sair. O que você decide?",
    tags: ["industria"],
    fase: "pressao",
    choices: [
      {
        text: "Apresentar aos clientes os dados de custo abertamente e propor reajuste graduado de 15% em 60 dias — transparência sobre a margem como base da negociação",
        risco: "medio",
        effects: { financeiro: +4, clientes: +2, reputacao: +2, processos: +1 },
        avaliacao: "boa",
        ensinamento: "Reajuste transparente baseado em dados reais de custo cambial é a única negociação defensável com clientes B2B sofisticados. A empresa que abre os números do impacto cambial transforma uma conversa de preço em uma conversa de parceria — e o cliente que entende o custo tem mais disposição para negociar do que o que recebe uma carta de reajuste sem contexto."
      },
      {
        text: "Buscar fornecedores de insumos nacionais como substitutos — reduzir a exposição cambial em vez de repassar ao cliente",
        risco: "medio",
        effects: { financeiro: +2, processos: +3, producao: +1, qualidade: -2 },
        avaliacao: "media",
        ensinamento: "Substituição de insumos importados por nacionais é estratégia de longo prazo válida — mas a qualidade técnica dos solventes nacionais pode ser diferente dos importados, impactando as formulações dos produtos finais. Em indústria química de especialidades, qualidade de insumo é parte do produto — e o cliente que compra pela especificação vai perceber a mudança."
      },
      {
        text: "Absorver o impacto cambial por 60 dias e usar o período para fechar novos contratos que compensem a margem — crescimento de receita como solução",
        risco: "alto",
        effects: { financeiro: -5, clientes: +2, producao: -1, rh: -1 },
        avaliacao: "ruim",
        ensinamento: "Absorver 31% de aumento de insumo com 62% de capacidade por 60 dias enquanto tenta fechar novos contratos é consumir reserva financeira que a empresa não tem em um cenário já pressionado pela multa do IBAMA. Crescimento de receita em momento de crise regulatória e câmbio alto é uma aposta de baixíssima probabilidade."
      },
      {
        text: "Revisitar o mix de produtos e descontinuar os de menor margem — focar nos produtos de maior valor onde o impacto do câmbio é proporcionalmente menor",
        risco: "baixo",
        effects: { financeiro: +3, producao: -1, clientes: -1, processos: +3, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "Foco em produtos de maior margem como resposta a pressão cambial é uma estratégia de mix que melhora o resultado sem precisar de reajuste imediato. A descontinuação dos produtos menos rentáveis, quando comunicada com antecedência e com indicação de alternativas, tem custo de relacionamento menor do que um reajuste generalizado."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R9 · PRESSÃO · O Responsável Ambiental Retorna
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Responsável Ambiental Retorna",
    description: "O responsável técnico ambiental que pediu demissão no dia seguinte à autuação entra em contato. Ele quer uma reunião. Você marca para o dia seguinte. Na reunião, ele é direto: 'Eu alertei a diretoria anterior sobre o risco do descarte há 11 meses. Tenho e-mails. Fui ignorado. Sai porque não me sentia responsável por algo que eu tinha tentado evitar.' Ele está aberto a retornar — mas com uma condição: quer que o episódio seja formalmente reconhecido pela empresa e que a área ambiental passe a ter poder de veto em decisões operacionais.",
    tags: ["industria"],
    fase: "pressao",
    choices: [
      {
        text: "Aceitar as condições integralmente: reconhecer formalmente o episódio e criar o poder de veto ambiental — a empresa precisa dele e ele está certo",
        risco: "baixo",
        effects: { conformidade: +6, rh: +5, reputacao: +4, processos: +4 },
        avaliacao: "boa",
        ensinamento: "Aceitar as condições de quem alertou e foi ignorado é o ato de governança mais importante disponível: cria o mecanismo que teria evitado a autuação e traz de volta a pessoa com mais conhecimento do processo de regularização. O poder de veto ambiental que ele pede é exatamente o que faltou nos 11 meses em que o alerta foi ignorado."
      },
      {
        text: "Aceitar o retorno mas negociar o poder de veto — uma área com poder de veto absoluto pode paralisar decisões operacionais críticas",
        risco: "medio",
        effects: { conformidade: +3, rh: +3, processos: +2, clientes: +1 },
        avaliacao: "media",
        ensinamento: "Negociar o escopo do poder de veto é razoável — um veto absoluto sem contrapartida de prazo para análise pode criar gargalos operacionais. Mas a negociação precisa ser genuína, não uma forma de esvaziar a condição. Um veto com prazo de 48 horas para análise técnica documentada é um modelo defensável que equilibra conformidade e operação."
      },
      {
        text: "Aceitar o retorno sem as condições — ele está pedindo mudanças de governança que precisam de aprovação do conselho e não podem ser decididas agora",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2 },
        effects: { rh: -2, conformidade: -2, reputacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Trazer de volta quem alertou sem reconhecer que o alerta foi correto e sem mudar o sistema que o ignorou é um gesto vazio. Ele vai perceber imediatamente que a estrutura não mudou — e a saída seguinte vai ser mais definitiva e mais pública. A governança que ele pede é exatamente o que o IBAMA vai exigir no TAC de qualquer forma."
      },
      {
        text: "Usar os e-mails que ele tem como base para um processo interno de responsabilização da diretoria anterior — a empresa precisa mostrar que lida com omissão gerencial",
        risco: "alto",
        gestorEffects: { capitalPolitico: -3, esgotamento: +2 },
        effects: { rh: -4, reputacao: -2, conformidade: -1, processos: -2 },
        avaliacao: "ruim",
        ensinamento: "Processo interno de responsabilização da diretoria anterior em momento de crise externa vai consumir energia gerencial que a empresa não tem disponível, criar conflito institucional e possivelmente escalar para o domínio público — com os e-mails que ele tem podendo virar matéria de imprensa antes de virar processo interno. A responsabilização vem depois da regularização, não durante."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R10 · PRESSÃO / GATILHO · O TAC é Assinado
  ═══════════════════════════════════════════════════════ */
  {
    title: "O TAC é Assinado",
    description: "O Termo de Ajuste de Conduta com o IBAMA é assinado: multa reduzida para R$2,6M (de R$4,1M), cronograma de restauração de 16 meses com vistorias trimestrais, e retomada gradual dos processos embargados a partir do 3º mês mediante comprovação de adequação. O embargo é suspenso. A planta pode retomar operação plena em 3 meses. Os dois clientes que sinalizaram saída confirmam que vão aguardar o retorno da capacidade plena. É uma virada — mas o que vem a seguir vai definir se a empresa realmente mudou ou se voltará ao mesmo padrão. O que você anuncia como próximo passo estratégico?",
    tags: ["industria"],
    fase: "pressao",
    choices: [
      {
        text: "Anunciar a criação de um Comitê de Conformidade Ambiental com reunião mensal, relatório público trimestral e o responsável ambiental retornado como presidente com poder de veto — tornar a mudança de governança pública e verificável",
        risco: "baixo",
        effects: { conformidade: +6, reputacao: +5, clientes: +5, rh: +4 },
        avaliacao: "boa",
        ensinamento: "A assinatura do TAC é o fim do começo — não o fim. O anúncio de uma estrutura de governança ambiental verificável e pública é o que transforma uma crise em uma mudança real. Clientes, reguladores e imprensa observam o que acontece depois da regularização para decidir se a empresa mudou de verdade."
      },
      {
        text: "Comunicar ao mercado o TAC assinado e o cronograma de retomada — o trabalho de relações externas é prioridade agora",
        risco: "medio",
        effects: { reputacao: +3, clientes: +4, conformidade: +2, processos: +1 },
        avaliacao: "media",
        ensinamento: "Comunicação do TAC é necessária — mas sem anúncio de mudança estrutural interna, o mercado vai interpretar como o fim de um capítulo difícil, não como o início de uma empresa diferente. A notícia do TAC sem a notícia da governança nova não constrói a confiança de longo prazo que os clientes e o regulador precisam ver."
      },
      {
        text: "Focar internamente nos 3 meses de retomada gradual — a comunicação externa vem depois, quando a operação plena estiver reestabelecida",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { producao: +2, conformidade: +2, clientes: -2, reputacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Silêncio externo durante os 3 meses de retomada vai ser preenchido pelas narrativas dos outros — imprensa, clientes, concorrentes. A empresa que assinou o TAC e sumiu da comunicação pública perde a janela de ouro para contar a história da sua transformação nos próprios termos."
      },
      {
        text: "Propor aos dois clientes que mantiveram o contrato uma visita guiada à planta nos primeiros 30 dias após o TAC — mostrar as mudanças antes de pedir o voto de confiança",
        risco: "baixo",
        effects: { clientes: +6, reputacao: +4, conformidade: +3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Visita guiada após o TAC para os clientes que ficaram é o gesto de parceria mais eficaz disponível: eles viram a crise de perto, suportaram a restrição de capacidade e merecem ver a transformação antes de qualquer outro público. A empresa que mostra o novo sistema de descarte, o responsável ambiental no cargo e o comitê funcionando cria o tipo de lealdade que não se compra com desconto."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R11 · DECISÃO CRÍTICA · O Sistema de Gestão Ambiental
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Sistema de Gestão Ambiental",
    description: "Com o TAC assinado e o responsável ambiental de volta, o consultor apresenta três caminhos para a gestão ambiental da planta: (A) ISO 14001 — certificação internacional de sistema de gestão ambiental, 12 meses, R$280k; (B) Sistema interno de gestão de resíduos com auditorias semestrais independentes — R$90k/ano sem certificação; (C) Certificação EMAS (europeia, mais exigente que a ISO) — 18 meses, R$420k, abre mercado de exportação para Europa.",
    tags: ["industria"],
    fase: "decisao",
    choices: [
      {
        text: "Opção A: ISO 14001 — o padrão mais reconhecido pelo mercado nacional, viável em 12 meses e com custo dentro do possível",
        risco: "baixo",
        effects: { conformidade: +6, clientes: +5, reputacao: +5, financeiro: -3 },
        avaliacao: "boa",
        ensinamento: "ISO 14001 é o certificado que clientes nacionais reconhecem e que reguladores respeitam. Para uma empresa que acabou de regularizar uma autuação ambiental, a certificação ISO 14001 é a demonstração mais clara disponível de que o sistema de gestão mudou — não apenas o evento pontual. É o diferencial que transforma um histórico negativo em evidência de evolução."
      },
      {
        text: "Opção B: sistema interno com auditoria independente — custo menor e agilidade maior para adaptar os processos sem a rigidez de uma norma certificada",
        risco: "medio",
        effects: { conformidade: +3, financeiro: +1, processos: +3, clientes: +2 },
        avaliacao: "media",
        ensinamento: "Sistema interno com auditoria independente é funcionalmente eficaz para gestão de resíduos — mas sem o peso de uma certificação reconhecida, clientes e reguladores têm apenas a palavra da empresa de que o sistema funciona. Depois de uma autuação por prática sistemática de 18 meses, a palavra da empresa sem certificação de terceiro tem credibilidade limitada."
      },
      {
        text: "Opção C: EMAS — ser o primeiro no setor a ter a certificação europeia é um diferencial de mercado que justifica o custo maior e o prazo mais longo",
        risco: "medio",
        effects: { conformidade: +5, reputacao: +6, clientes: +4, financeiro: -4 },
        avaliacao: "media",
        ensinamento: "EMAS é o posicionamento de longo prazo mais diferenciado — mas 18 meses e R$420k em uma empresa que acabou de pagar R$2,6M de multa e está retomando gradualmente a operação é um investimento que o caixa pode não suportar. O diferencial de ser o primeiro no setor vale mais quando a empresa está em posição financeira mais robusta."
      },
      {
        text: "Combinar A imediatamente com planejamento para C em 3 anos — construir a certificação progressivamente, com ISO 14001 como base e EMAS como destino",
        risco: "baixo",
        effects: { conformidade: +6, reputacao: +5, clientes: +5, processos: +4, financeiro: -3 },
        avaliacao: "boa",
        ensinamento: "Roadmap de certificação progressiva — ISO 14001 agora, EMAS como objetivo de médio prazo — é a estratégia que equilibra urgência, custo e diferenciação. A ISO 14001 resolve a credibilidade imediata; o caminho para EMAS serve como argumento de longo prazo para clientes europeus e como estrutura de melhoria contínua que o sistema exige."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R12 · DECISÃO CRÍTICA · A Tecnologia de Processo
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Tecnologia de Processo",
    description: "O responsável ambiental apresenta uma descoberta técnica durante o processo de revisão dos processos embargados: existe uma tecnologia de destilação a vácuo que recupera 78% dos solventes usados nos três processos, transformando resíduo em matéria-prima reaproveitável. O investimento: R$1,8M. O retorno estimado: redução de 65% no custo de descarte de resíduos e R$380k/ano em solventes recuperados. 'Além de resolver o problema ambiental, dá dinheiro,' resume ele.",
    tags: ["industria"],
    fase: "decisao",
    choices: [
      {
        text: "Aprovar o investimento imediatamente — a tecnologia resolve o problema que causou a autuação de forma estrutural e com ROI positivo",
        risco: "baixo",
        effects: { conformidade: +6, financeiro: +4, processos: +5, reputacao: +4, producao: +3 },
        avaliacao: "boa",
        ensinamento: "Tecnologia que transforma resíduo em matéria-prima é o tipo raro de investimento em compliance que tem ROI financeiro positivo além do ROI regulatório. A empresa que apresenta essa tecnologia ao IBAMA nas próximas vistorias do TAC demonstra que não está apenas cumprindo a obrigação — está inovando para eliminar o problema na fonte."
      },
      {
        text: "Fazer um piloto com escala de 30% antes de investir os R$1,8M completos — validar o retorno projetado antes de comprometer o capital",
        risco: "baixo",
        effects: { financeiro: +2, processos: +3, conformidade: +3, producao: +2 },
        avaliacao: "boa",
        ensinamento: "Piloto antes do investimento completo é uma gestão de risco prudente em tecnologia nova. A diferença entre piloto e postergação é que o piloto tem cronograma definido e critérios de decisão claros — enquanto a postergação é uma espera indefinida. Piloto de 30% em 90 dias com métrica de aprovação é a forma correta de validar sem atrasar."
      },
      {
        text: "Adiar o investimento para o próximo ciclo orçamentário — a empresa ainda está pagando a multa do IBAMA e não tem capital para novos investimentos",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { financeiro: +1, conformidade: -2, reputacao: -2, processos: -1 },
        avaliacao: "ruim",
        ensinamento: "Adiar a tecnologia que elimina o resíduo que causou a autuação, por restrição de caixa, enquanto o IBAMA realiza vistorias trimestrais do TAC é criar um risco de percepção grave. O IBAMA que vê a empresa sem tecnologia de destinação adequada 6 meses após o TAC pode questionar o comprometimento com o cronograma de adequação."
      },
      {
        text: "Usar o ROI da tecnologia como argumento para captação de financiamento verde com banco de desenvolvimento — projetos de recuperação de solvente são elegíveis a linhas especiais",
        risco: "baixo",
        effects: { financeiro: +3, conformidade: +4, reputacao: +4, processos: +4 },
        avaliacao: "boa",
        ensinamento: "Financiamento verde para tecnologia de recuperação de solvente é elegível em linhas do BNDES e de bancos privados com carteira ESG. O custo do financiamento é menor do que o crédito convencional, e a aprovação do projeto demonstra ao banco — e indiretamente ao IBAMA — que a empresa está investindo estruturalmente na solução, não apenas pagando a multa."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R13 · DECISÃO CRÍTICA · A Reconquista dos Clientes
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Reconquista dos Clientes",
    description: "Com a operação retomada e o TAC em andamento, é hora de trabalhar a carteira de clientes. O gerente comercial mapeia: os dois que ficaram precisam de confirmação de capacidade plena; há 4 clientes potenciais que foram abordados no passado mas recusaram por falta de certificação ambiental; e um ex-cliente — que saiu durante a crise — indicou que pode retornar se houver evidências de mudança real. Como você prioriza a estratégia comercial?",
    tags: ["industria"],
    fase: "decisao",
    choices: [
      {
        text: "Priorizar os dois que ficaram — consolidar a base antes de expandir, com contratos renovados e de prazo mais longo",
        risco: "baixo",
        effects: { clientes: +5, financeiro: +3, conformidade: +2, processos: +2 },
        avaliacao: "boa",
        ensinamento: "Os dois clientes que ficaram durante a crise merecem tratamento preferencial na retomada — eles assumiram um risco reputacional ao continuar comprando de uma empresa autuada, e esse lealdade precisa ser reconhecida com contratos mais longos e condições mais favoráveis. Cliente fiel em crise é o ativo mais valioso que uma empresa pode ter."
      },
      {
        text: "Abordar os 4 clientes potenciais que recusaram por falta de certificação — a ISO 14001 em andamento é o argumento que faltava",
        risco: "medio",
        effects: { clientes: +4, financeiro: +4, reputacao: +3, conformidade: +3 },
        avaliacao: "boa",
        ensinamento: "Clientes que recusaram por falta de certificação são os de mais rápida conversão quando a certificação chega — porque o motivo de recusa se tornou o motivo de atração. A abordagem desses 4 no momento em que a ISO 14001 está em andamento é o timing ideal: antes de ter o certificado, para que eles participem do processo de construção da relação."
      },
      {
        text: "Focar na reconquista do ex-cliente — recuperar quem saiu é a maior prova de que a mudança foi real",
        risco: "medio",
        effects: { clientes: +3, reputacao: +4, conformidade: +2, financeiro: +2 },
        avaliacao: "media",
        ensinamento: "Reconquistar um ex-cliente que saiu por crise de reputação é possível — mas é a venda mais complexa disponível porque exige convencer alguém que já formou uma opinião negativa. A janela existe porque ele indicou abertura — mas o argumento precisa ser evidência verificável de mudança, não promessa de mudança."
      },
      {
        text: "Criar uma estratégia de marketing de conteúdo sobre a jornada ESG da empresa — transformar a história da crise e da recuperação em diferencial de marca",
        risco: "baixo",
        effects: { reputacao: +5, clientes: +3, conformidade: +3, processos: +2 },
        avaliacao: "boa",
        ensinamento: "A história de uma empresa que foi autuada, reconheceu o problema e transformou a operação é genuinamente mais convincente do que a de uma empresa que nunca teve problemas — porque demonstra capacidade de autocrítica e de execução em condições adversas. Esse tipo de narrativa em B2B industrial gera credibilidade com clientes que sabem que toda empresa tem crise em algum momento."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R14 · DECISÃO CRÍTICA · A Oferta de Compra
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Oferta de Compra",
    description: "Um grupo químico multinacional de capital europeu apresenta uma proposta de aquisição de 60% da empresa por R$28M. A avaliação é 30% abaixo do que seria considerado justo antes da autuação — mas o grupo argumenta que está comprando 'o negócio e o problema, não o negócio sem o problema'. Em contrapartida, oferece acesso a tecnologia de processo, certificações europeias e uma carteira de clientes multinacionais. O sócio-fundador quer a sua posição.",
    tags: ["industria"],
    fase: "decisao",
    choices: [
      {
        text: "Recomendar aceitar com negociação: propor que 30% da diferença de valuation seja em earnout atrelado ao resultado dos próximos 3 anos — compartilhar o upside da recuperação",
        risco: "baixo",
        effects: { financeiro: +6, clientes: +4, conformidade: +4, reputacao: +4 },
        avaliacao: "boa",
        ensinamento: "Earnout atrelado à recuperação é o mecanismo mais inteligente disponível quando o vendedor acredita que o negócio vale mais do que a oferta atual. O grupo europeu que aceita earnout está dizendo implicitamente que também acredita na recuperação — e o acordo de earnout cria alinhamento entre acquirer e vendedor em vez de adversarialidade sobre o valuation presente."
      },
      {
        text: "Recomendar recusar — vender com 30% de desconto valida a narrativa de que a empresa foi gravemente danificada, e isso pode se tornar uma profecia autorrealizável",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { financeiro: -2, conformidade: +1, clientes: -1 },
        avaliacao: "media",
        ensinamento: "Recusar uma aquisição estratégica por questão de valuation em momento de crise exige um plano alternativo muito claro. A empresa que rejeita o grupo europeu sem ter outro caminho de capitalização e de acesso a tecnologia vai precisar construir tudo que a aquisição entregaria — mais caro, mais devagar e sem a rede de clientes multinacionais."
      },
      {
        text: "Recomendar aceitar as condições como estão — o acesso à tecnologia europeia e às certificações vale mais do que os R$8M de diferença de valuation",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +4, conformidade: +5, clientes: +4, reputacao: +3 },
        avaliacao: "boa",
        ensinamento: "Aceitar a oferta considerando o valor estratégico — tecnologia, certificações, carteira de multinacionais — em vez de apenas o valuation financeiro é uma leitura madura da situação. Para uma empresa que acabou de sair de autuação ambiental, ser adquirida por um grupo europeu com padrões ESG elevados é também uma prova pública de que a empresa é investível — o que vale mais do que os R$8M de diferença."
      },
      {
        text: "Usar a oferta do grupo europeu para abrir processo competitivo — buscar outros interessados antes de decidir",
        risco: "medio",
        effects: { financeiro: +2, conformidade: +1, processos: -1, clientes: -1 },
        avaliacao: "media",
        ensinamento: "Processo competitivo de M&A é válido — mas uma empresa com autuação ambiental recente tem um universo restrito de interessados. O grupo europeu que se dispôs a fazer a oferta após conhecer o passivo é um comprador estratégico raro. Procurar outros pode resultar em propostas ainda mais baixas ou na retirada da oferta atual."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R15 · DECISÃO FINAL · O Futuro da Química
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Futuro da Química",
    description: "Com o TAC em execução, a certificação ISO 14001 em andamento, a tecnologia de recuperação de solventes instalada e a carteira de clientes estabilizada, você precisa definir o posicionamento estratégico para os próximos 3 anos. A empresa que sobreviveu à autuação tem agora uma história e uma estrutura que a maioria dos concorrentes não tem. Onde você vai competir?",
    tags: ["industria"],
    fase: "decisao",
    choices: [
      {
        text: "Química sustentável: pioneirismo em formulações de baixo impacto ambiental com certificação de ciclo de vida — transformar a crise em identidade de marca",
        effects: { conformidade: +6, reputacao: +6, clientes: +5, financeiro: +4, processos: +4 },
        avaliacao: "boa",
        ensinamento: "A empresa que foi autuada e transformou sua operação tem uma credibilidade em sustentabilidade química que uma empresa sem histórico não consegue ter: demonstrou que o compromisso foi testado em condições reais. Pioneirismo em formulações de baixo impacto ambiental aproveita exatamente essa credibilidade como diferencial comercial."
      },
      {
        text: "Especialização em química para construção civil de alta performance: aditivos e solventes para tintas ESG e sistemas de vedação de nova geração",
        effects: { clientes: +5, financeiro: +4, processos: +4, reputacao: +4, conformidade: +3 },
        avaliacao: "boa",
        ensinamento: "Especialização em nicho de construção civil com crescimento acelerado de demanda por produtos sustentáveis combina o histórico técnico da empresa com a agenda ESG do setor imobiliário. Construtores e fabricantes de tinta que precisam de produtos de baixo VOC e certificados por ciclo de vida são exatamente o cliente que valoriza um fornecedor com ISO 14001 e histórico de transparência ambiental."
      },
      {
        text: "Serviços de gestão de resíduos químicos: usar a tecnologia de destilação a vácuo para recuperar solventes de outras empresas do setor — transformar competência interna em serviço",
        effects: { financeiro: +5, reputacao: +5, conformidade: +5, processos: +5, clientes: +3 },
        avaliacao: "boa",
        ensinamento: "Transformar a tecnologia de recuperação de solventes em um serviço para outras indústrias químicas é um modelo de negócio com crescimento acelerado à medida que a regulamentação de resíduos endurece. A empresa que domina o processo de destinação adequada de solventes — e tem a credibilidade de quem resolveu o próprio problema — é a mais confiável prestadora desse serviço para o mercado."
      },
      {
        text: "Expansão de capacidade: dobrar a planta nos próximos 3 anos aproveitando que o setor ainda tem poucos concorrentes com certificação ambiental",
        requisitos: { indicadorMinimo: { financeiro: 12, conformidade: 13 } },
        effects: { producao: +4, financeiro: +3, clientes: +3, rh: -2, conformidade: -1, processos: -2 },
        avaliacao: "media",
        ensinamento: "Expansão de capacidade antes de ter a operação em regime de excelência durante pelo menos 12 meses é repetir o padrão que levou à autuação: crescimento sem a base de conformidade solidificada. A empresa que dobra a planta carrega todos os novos processos para dentro de uma gestão ambiental que ainda está sendo construída."
      }
    ]
  }

]

]; // fim IndustriaRounds
