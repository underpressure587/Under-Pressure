/* ═══════════════════════════════════════════════════════════════════
   BETA · TECNOLOGIA · ROUNDS EXCLUSIVOS — HISTÓRIA [0]
   Startup SaaS B2B · Dívida técnica, rotatividade e churn

   INDICADORES (8 — exclusivos do setor Tecnologia):
     financeiro    💰  Saúde do caixa / ARR / burn rate
     clima         🧑‍💻  Engajamento e moral do time
     satisfacao    ⭐  NPS / retenção / churn dos satisfacao
     qualidade     🛠️   Estabilidade / bugs / dívida técnica
     produtividade ⚡  Velocidade de entrega / output
     reputacao     📣  Imagem no mercado / percepção de marca
     inovacao      🔬  P&D / diferenciais / roadmap técnico
     seguranca     🔒  LGPD / vulnerabilidades / compliance

   FASES NARRATIVAS:
     R1–R5   → Diagnóstico: você descobre a extensão real da crise
     R6–R10  → Pressão: as consequências chegam de fora e de dentro
     R11–R15 → Decisão crítica: o futuro da empresa é definido
═══════════════════════════════════════════════════════════════════ */

const TecnologiaRounds = [

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [0] · SaaS B2B — Dívida técnica, rotatividade e churn
   Contexto: startup de 67 pessoas, ARR R$4,2M, NPS 71 em queda,
   3 sêniores saíram em 30 dias, churn subindo de 2,1% para 3,8%,
   concorrentes entraram com preço 20% menor.
══════════════════════════════════════════════════════════════════ */
[

  /* ═══════════════════════════════════════════════════════
     R1 · DIAGNÓSTICO · O Crash de Segunda-Feira
     Contexto: primeiro dia útil após assumir a gestão.
     A plataforma cai às 9h — o pior horário possível.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Crash de Segunda-Feira",
    description: "Seu primeiro dia como gestor responsável. Às 9h07, o sistema de monitoramento dispara: a plataforma está fora do ar. Duzentos e trinta satisfacao não conseguem acessar. O canal de suporte explode com mensagens. O CTO Pedro chega correndo: 'É o módulo de autenticação — o mesmo que está na nossa lista de dívida técnica há 14 meses. Estimamos 3 a 5 horas para restaurar.' Qual é a sua primeira decisão?",
    tags: ["tecnologia"],
    fase: "diagnostico",
    choices: [
      {
        text: "Comunicar proativamente todos os satisfacao afetados com previsão de retorno e atualizações a cada 30 minutos",
        risco: "baixo",
        effects: { satisfacao: +4, reputacao: +3, clima: +2, qualidade: -1 },
        avaliacao: "boa",
        ensinamento: "Comunicação transparente durante incidentes transforma uma crise técnica em prova de maturidade operacional. Clientes que recebem atualizações frequentes cancelam 60% menos do que os que ficam no silêncio. A percepção de cuidado vale mais que a perfeição técnica."
      },
      {
        text: "Focar 100% do time na resolução técnica sem comunicar satisfacao — só falar quando estiver resolvido",
        risco: "medio",
        effects: { qualidade: +3, satisfacao: -5, reputacao: -3, clima: +1 },
        avaliacao: "ruim",
        ensinamento: "Silêncio durante crises amplifica a percepção negativa. Clientes tentando acessar sem explicação imaginam o pior — e o próximo passo é cancelar. Resolver o técnico sem gerenciar a percepção é metade de uma resposta a um incidente."
      },
      {
        text: "Escalar o incidente para o conselho de investidores e pedir orientação antes de agir",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2, esgotamento: +1 },
        effects: { satisfacao: -3, reputacao: -2, clima: -3, financeiro: -1 },
        avaliacao: "ruim",
        ensinamento: "Escalada prematura ao conselho antes de ter dados e plano sinaliza despreparo ao time e desgasta credibilidade com os investidores. A decisão operacional de um incidente precisa acontecer em minutos, não em horas de governança."
      },
      {
        text: "Acionar simultaneamente o time técnico para resolução e o CS para comunicação segmentada, priorizando os maiores satisfacao",
        risco: "baixo",
        effects: { satisfacao: +5, reputacao: +4, clima: +3, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "Paralelizar resolução técnica com comunicação comercial é a resposta de empresas maduras a incidentes. Priorizar os maiores satisfacao no atendimento reduz risco de churn imediato e demonstra que a empresa conhece o valor de cada relacionamento."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R2 · DIAGNÓSTICO · O Dev que Sabe Demais
     Contexto: 4 dias após o crash. O time ainda está abalado.
     O único engenheiro que domina o módulo crítico quer sair.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Dev que Sabe Demais",
    description: "André, o único engenheiro que conhece profundamente o módulo de pagamentos — responsável por 38% do ARR — bate à sua porta: 'Preciso de 3 semanas de férias. Estou esgotado desde o crash.' Você consulta o Pedro: 'Se André sair agora, qualquer problema nesse módulo vai nos parar por dias. Ele nunca documentou nada.' Você tem 24 horas para responder a André.",
    tags: ["tecnologia"],
    fase: "diagnostico",
    choices: [
      {
        text: "Aprovar as férias integrais — negar seria injusto e pioraria o clima geral do time",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1, esgotamento: 0 },
        effects: { clima: +3, produtividade: -4, qualidade: -3, satisfacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Aprovar férias sem transferência de conhecimento em módulo crítico é aceitar um risco operacional desnecessário. Cuidar do colaborador e proteger a operação não são excludentes — mas exigem negociação inteligente, não apenas aprovação ou negação."
      },
      {
        text: "Negar as férias até que o módulo esteja documentado — a empresa precisa estar segura primeiro",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2, esgotamento: +1 },
        effects: { clima: -5, produtividade: -2, qualidade: +2, satisfacao: +1 },
        avaliacao: "ruim",
        ensinamento: "Negar férias sem contrapartida gera ressentimento profundo e frequentemente acelera o pedido de demissão. Impor trabalho sem reconhecer o esgotamento cria o risco que você tentou evitar — agora com raiva adicionada à equação."
      },
      {
        text: "Negociar: André tira 1 semana agora e, ao retornar, vocês estruturam um plano de documentação de 2 semanas com dedicação exclusiva",
        risco: "baixo",
        gestorEffects: { reputacaoInterna: +1 },
        effects: { clima: +5, qualidade: +3, produtividade: +2, satisfacao: +1 },
        avaliacao: "boa",
        ensinamento: "Negociação que respeita o colaborador e a operação é o caminho mais sustentável. Uma semana de descanso reduz o risco de demissão iminente. A documentação estruturada ao retorno transforma conhecimento tácito em ativo da empresa — não mais refém de uma pessoa."
      },
      {
        text: "Aprovar as férias e contratar imediatamente um dev sênior externo para cobrir o módulo durante a ausência",
        effects: { financeiro: -5, clima: +2, produtividade: -1, qualidade: -2 },
        avaliacao: "media",
        ensinamento: "Cobertura externa é válida como contingência, mas perigosa para módulos críticos não documentados. O custo é alto e o tempo de onboarding em código legado complexo pode superar as 3 semanas de ausência. A solução real é a documentação — não a substituição."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R3 · DIAGNÓSTICO · Produto vs. Engenharia
     Contexto: 2ª semana. O conflito estrutural vem à tona.
     Roadmap travado entre novas features e dívida técnica.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Reunião que Virou uma Briga",
    description: "Reunião de planejamento quinzenal. Juliana, head de Produto, apresenta um roadmap com 11 novas features para os próximos 60 dias. Pedro interrompe: 'Impossível. Com a dívida técnica atual, cada nova feature vai demorar 3× mais e vai criar 2× mais bugs. Precisamos de pelo menos 6 semanas só para estabilizar.' Juliana rebate: 'Enquanto isso, o concorrente vai lançar 4 features e a gente vai perder mais deals.' A reunião para. Todo mundo olha para você.",
    tags: ["tecnologia"],
    fase: "diagnostico",
    choices: [
      {
        text: "Dar razão ao Pedro: bloquear todas as features por 6 semanas e focar 100% na estabilização técnica",
        effects: { qualidade: +6, produtividade: +2, satisfacao: -4, reputacao: -2, clima: +1 },
        avaliacao: "media",
        ensinamento: "Priorizar a saúde técnica é estrategicamente correto, mas bloquear totalmente o roadmap por 6 semanas cria pressão comercial real e sinaliza ao mercado que a empresa parou. A decisão certa é calibrar o ritmo, não paralisar completamente."
      },
      {
        text: "Apoiar Juliana: lançar as features no prazo e endereçar a dívida técnica em paralelo como puder",
        effects: { satisfacao: +3, qualidade: -5, produtividade: -3, clima: -2, reputacao: +1 },
        avaliacao: "ruim",
        ensinamento: "Ignorar o alerta do CTO para agradar o roadmap comercial é a receita clássica para colapso técnico. Cada feature nova sobre código degradado multiplica a dívida. O time sabe que está construindo em areia e a motivação cai junto com a qualidade."
      },
      {
        text: "Propor um modelo 70/30: 70% da capacidade do time para estabilização técnica, 30% para as 3 features de maior impacto comercial identificadas pelo Produto",
        effects: { qualidade: +4, satisfacao: +2, produtividade: +3, clima: +4, inovacao: +1 },
        avaliacao: "boa",
        ensinamento: "O modelo 70/30 entre dívida técnica e features novas é uma das práticas mais eficazes em engenharia de produto. Ele honra os dois problemas sem paralisar nenhum. E mais importante: demonstra ao time que a liderança tomou uma decisão, não evitou o conflito."
      },
      {
        text: "Encerrar a reunião sem decisão e marcar sessões separadas com Pedro e Juliana para entender melhor os números antes de decidir",
        effects: { clima: -3, produtividade: -2, satisfacao: -1, reputacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Adiar decisões estratégicas em reuniões onde o time espera liderança corroe a autoridade do gestor. O time interpreta a ausência de decisão como falta de preparo ou coragem. Dados podem ser levantados — mas a postura de quem decide também é um dado que o time avalia."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R4 · DIAGNÓSTICO · O Dashboard de Churn
     Contexto: fim da 2ª semana. Dados de cancelamento chegam.
     O CS mapeia os motivos com precisão cirúrgica.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Dashboard de Churn",
    description: "Marina, head de Customer Success, apresenta o relatório da semana: 31 satisfacao cancelaram em 7 dias — o maior número em 18 meses. Ela traz os motivos mapeados: 68% citam lentidão e instabilidade da plataforma; 19% citam que o concorrente ofereceu preço menor; 13% citam atendimento demorado. 'Temos um problema técnico que está gerando um problema comercial,' ela conclui. 'E se não agirmos em 30 dias, vamos perder mais 80 satisfacao.' Como você responde?",
    tags: ["tecnologia"],
    fase: "diagnostico",
    choices: [
      {
        text: "Criar força-tarefa técnica dedicada exclusivamente aos gargalos que mais causam lentidão para os satisfacao em risco de churn",
        effects: { qualidade: +5, satisfacao: +4, produtividade: -2, clima: +2 },
        avaliacao: "boa",
        ensinamento: "Atacar a causa-raiz do churn — o problema técnico — com foco nos satisfacao mais vulneráveis é a decisão com maior retorno sobre investimento. Cada cliente retido custa 5-7× menos do que adquirir um novo. A força-tarefa cria urgência estruturada, não caos."
      },
      {
        text: "Lançar uma campanha agressiva de aquisição de novos satisfacao para compensar as perdas",
        effects: { financeiro: -4, satisfacao: -3, reputacao: -2, qualidade: -1 },
        avaliacao: "ruim",
        ensinamento: "Adquirir satisfacao para compensar churn é matematicamente insustentável: o CAC é 5-7× maior que o custo de retenção, e os novos satisfacao chegam para a mesma plataforma instável — acelerando o próximo ciclo de cancelamentos com mais pessoas no funil."
      },
      {
        text: "Contratar 3 gerentes de CS adicionais para atendimento personalizado e reduzir o tempo de resposta",
        effects: { financeiro: -4, satisfacao: +3, clima: +1, qualidade: -1 },
        avaliacao: "media",
        ensinamento: "CS adicional resolve o sintoma de atendimento lento (13% dos motivos), mas não toca o problema principal (68% — instabilidade técnica). É um investimento de baixo retorno quando a causa-raiz domina o motivo do churn."
      },
      {
        text: "Ligar pessoalmente para os 10 satisfacao de maior receita em risco e entender o que os faria ficar",
        effects: { satisfacao: +5, reputacao: +3, clima: +2, financeiro: +1 },
        avaliacao: "boa",
        ensinamento: "Contato direto da liderança com satisfacao estratégicos em risco demonstra comprometimento difícil de ignorar. A maioria dos satisfacao não quer apenas resolver o problema técnico — quer saber que a empresa se importa com eles. Essa ligação frequentemente compra as semanas necessárias para a correção técnica."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R5 · DIAGNÓSTICO · Os Quatro que Querem Sair
     Contexto: 3ª semana. O sinal mais grave chega do time.
     Um dev sênior traz um alerta que ninguém quer ouvir.
  ═══════════════════════════════════════════════════════ */
  {
    title: "Os Quatro que Querem Sair",
    description: "Gabriel, um dos seus engenheiros mais antigos, pede uma conversa reservada. Ele é direto: 'Não vim pedir demissão — vim te avisar que quatro colegas estão olhando para fora. Dois já têm entrevistas marcadas. O problema não é salário. É que estamos mantendo um sistema que regride e não há sinal de que vai mudar.' Você tem a informação antes que se torne uma crise pública. O que você faz com ela?",
    tags: ["tecnologia"],
    fase: "diagnostico",
    choices: [
      {
        text: "Agradecer a Gabriel pela honestidade, convocá-lo como aliado e co-criar com ele um plano de melhoria técnica que você vai apresentar ao time esta semana",
        effects: { clima: +6, inovacao: +3, qualidade: +3, produtividade: +2, reputacao: +1 },
        avaliacao: "boa",
        ensinamento: "Transformar quem traz o problema em parte da solução é uma das estratégias mais poderosas de retenção técnica. Gabriel assumiu um risco pessoal ao te avisar — honrar esse risco com protagonismo real cria fidelidade genuína. E o plano co-criado tem mais chances de adesão do time."
      },
      {
        text: "Anunciar aumento salarial de 20% para todos os engenheiros sêniores ainda esta semana",
        effects: { financeiro: -6, clima: +3, produtividade: +1, qualidade: -1 },
        avaliacao: "media",
        ensinamento: "Salário resolve o problema quando o motivo é salário. Aqui, Gabriel foi explícito: o problema é técnico. Aumento imediato pode reter temporariamente, mas as pessoas que pensam em sair por razões não financeiras vão continuar olhando para fora — agora com mais dinheiro no bolso enquanto procuram."
      },
      {
        text: "Conversar individualmente com cada um dos quatro devs antes que tomem uma decisão",
        effects: { clima: +4, produtividade: +1, reputacao: +2 },
        avaliacao: "boa",
        ensinamento: "Conversas individuais identificam motivações específicas e demonstram que a liderança se importa com cada pessoa. O risco é não resolver o problema sistêmico — mas o gesto de escuta individual frequentemente abre espaço para negociação que um anúncio coletivo não consegue."
      },
      {
        text: "Não revelar que sabe da situação e aguardar os pedidos de demissão formais antes de agir",
        effects: { clima: -5, produtividade: -3, qualidade: -2, reputacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Ignorar um alerta antecipado é desperdiçar a única janela de intervenção antes da crise. Quando os pedidos chegarem formalmente, a narrativa já estará construída, outros colegas já terão ouvido os motivos, e a liderança terá perdido credibilidade por não ter agido quando podia."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R6 · PRESSÃO · O Recrutador da Concorrência
     Contexto: 4ª semana. A pressão vem de fora.
     A startup concorrente recruta ativamente seu time.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Recrutador da Concorrência",
    description: "Um recrutador da startup concorrente entrou em contato com seis engenheiros do seu time pelo LinkedIn — incluindo Pedro, seu CTO. As mensagens foram encaminhadas para você por dois deles. A proposta tem salário 35% maior e bônus de assinatura. O timing é cirúrgico: acontece exatamente na semana em que seu time está mais fragilizado. Pedro menciona casualmente que 'a mensagem chegou para ele também.'",
    tags: ["tecnologia"],
    fase: "pressao",
    choices: [
      {
        text: "Criar imediatamente um programa de retenção com stock options escalonados para os 10 talentos mais críticos do time técnico",
        effects: { clima: +5, financeiro: -3, produtividade: +3, inovacao: +2, reputacao: +2 },
        avaliacao: "boa",
        ensinamento: "Stock options criam alinhamento de longo prazo que salário não consegue replicar. Um programa estruturado — não reativo — demonstra que a empresa pensa no futuro dos seus talentos. Para engenheiros sêniores, a participação no crescimento da empresa frequentemente supera qualquer bônus de curto prazo."
      },
      {
        text: "Convocar reunião de time e ser transparente: 'Eu sei que o concorrente está recrutando. Vou falar sobre os nossos planos.'",
        effects: { clima: +6, reputacao: +2, produtividade: +2, satisfacao: +1 },
        avaliacao: "boa",
        ensinamento: "Transparência proativa sobre uma ameaça conhecida desmonta a narrativa do concorrente antes que ela se consolide. A reunião transforma um problema de bastidores em diálogo aberto — e o time avalia: líderes que falam a verdade antes de serem forçados a isso constroem confiança real."
      },
      {
        text: "Ignorar formalmente — interferir nas escolhas de carreira do time seria invasivo e vai piorar o clima",
        effects: { clima: -4, produtividade: -2, inovacao: -2, reputacao: -1 },
        avaliacao: "ruim",
        ensinamento: "A omissão numa crise de retenção é lida pelo time como indiferença. Se a liderança não age quando o concorrente recruta ativamente, o time interpreta como permissão ou como sinal de que a empresa não luta pelos seus talentos. A inação aqui não é neutra — é uma mensagem."
      },
      {
        text: "Conversar privadamente apenas com Pedro para garantir que o CTO está retido antes de qualquer outra ação",
        effects: { clima: +2, produtividade: +1, qualidade: +2, financeiro: -2 },
        avaliacao: "media",
        ensinamento: "Reter o CTO é urgente e correto — mas fazer isso privadamente enquanto o restante do time percebe o problema gera ressentimento. Os outros cinco engenheiros sabem que foram contatados. A ausência de uma resposta visível da liderança para o grupo alimenta a sensação de que apenas os 'importantes' são valorizados."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R7 · PRESSÃO · A Falha de Segurança
     Contexto: 5ª semana. Chega o alerta mais crítico até agora.
     Uma vulnerabilidade real, com janela de 24 horas para decidir.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Falha de Segurança",
    description: "Um pesquisador de segurança independente envia um e-mail direto para você — não para o suporte: 'Encontrei uma vulnerabilidade de injeção SQL no endpoint de relatórios da sua API. Dados de aproximadamente 4.200 satisfacao podem ter sido expostos nos últimos 21 dias. Tenho as evidências. Dou 24 horas para uma resposta antes de publicar no meu blog.' Pedro confirma: a falha é real. O time de segurança estima 6 a 8 horas para corrigir completamente.",
    tags: ["tecnologia"],
    fase: "pressao",
    choices: [
      {
        text: "Responder ao pesquisador imediatamente agradecendo, pedir 72 horas para correção completa e comunicar os satisfacao afetados em paralelo com transparência total",
        effects: { seguranca: +5, reputacao: +3, satisfacao: +4, financeiro: -2, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "O programa de responsible disclosure existe exatamente para esse cenário. Agradecer pesquisadores de segurança que reportam vulnerabilidades — em vez de tratá-los como ameaças — cria uma relação que pode proteger a empresa no futuro. Clientes que recebem comunicação proativa sobre incidentes de segurança têm taxa de churn 40% menor do que os que descobrem pela imprensa."
      },
      {
        text: "Corrigir a vulnerabilidade nas próximas 6 horas sem comunicar satisfacao — só agir publicamente se o pesquisador publicar mesmo assim",
        effects: { seguranca: +3, satisfacao: -4, reputacao: -4, qualidade: +3 },
        avaliacao: "ruim",
        ensinamento: "Tratar a comunicação como condicional à publicação externa é uma aposta arriscada com probabilidade quase nula de sucesso. Quando a falha for publicada — e será — a omissão intencional será o maior dano. A LGPD exige notificação à ANPD em até 2 dias úteis após a ciência do incidente."
      },
      {
        text: "Consultar o jurídico antes de qualquer comunicação para entender as implicações legais da LGPD antes de agir",
        effects: { seguranca: +2, satisfacao: -3, reputacao: -2, financeiro: -2 },
        avaliacao: "media",
        ensinamento: "O jurídico precisa estar no loop, mas não pode ser a primeira etapa quando há 24 horas de prazo e dados expostos. Cada hora de atraso amplia a janela de exposição dos dados dos satisfacao. A sequência correta é: corrigir tecnicamente + comunicar satisfacao + notificar ANPD + alinhar com jurídico em paralelo."
      },
      {
        text: "Contratar imediatamente uma empresa especializada em resposta a incidentes de segurança para gerenciar o processo completo",
        effects: { seguranca: +4, reputacao: +4, satisfacao: +3, financeiro: -5, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "Especialistas em resposta a incidentes (DFIR) têm playbooks testados para esse cenário exato. O custo financeiro é real, mas o protocolo correto — com linguagem técnica e jurídica precisa, comunicação adequada à ANPD e análise pós-incidente estruturada — reduz significativamente o risco de multa e de perda de satisfacao enterprise."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R8 · PRESSÃO · O Contrato que Muda Tudo
     Contexto: 6ª semana. Uma oportunidade enorme aparece.
     Mas o timing é o pior possível.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Contrato que Muda Tudo",
    description: "Beatriz, sua head comercial, chega eufórica: 'A rede Mercato Varejo quer assinar um contrato de R$ 900 mil anuais — nosso maior deal em toda a história. Mas eles exigem 3 customizações profundas na plataforma entregues em 90 dias e um SLA de 99,9% de uptime garantido por contrato.' Pedro é categórico: 'Com a plataforma nesse estado, 99,9% de uptime é impossível. E as customizações levam no mínimo 120 dias com qualidade. Se prometemos e não entregamos, vira processo.' O prazo para responder ao Mercato é amanhã.",
    tags: ["tecnologia"],
    fase: "pressao",
    choices: [
      {
        text: "Aceitar o contrato com as condições exatas — uma receita de R$ 900K justifica o risco e vai financiar a melhoria técnica",
        effects: { financeiro: +5, qualidade: -5, produtividade: -4, clima: -3, seguranca: -2 },
        avaliacao: "ruim",
        ensinamento: "Assinar um contrato com SLA que a tecnologia atual não suporta é vender algo que você não tem. Quando o uptime não for atingido — e não vai ser — as multas contratuais, o desgaste jurídico e o dano reputacional superam em muito a receita do deal. Comprometer o time com prazos impossíveis cria a próxima onda de burnout."
      },
      {
        text: "Negociar: aceitar o contrato com SLA de 99,5% e prazo de 120 dias para as customizações, sendo transparente sobre as limitações atuais",
        effects: { financeiro: +4, reputacao: +4, satisfacao: +3, clima: +2, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "Negociar condições reais com transparência é o que separa empresas que crescem de empresas que implodem em clients enterprise. O Mercato está comprando uma solução, não um número de SLA — e satisfacao sofisticados reconhecem e respeitam vendedores que não prometem o impossível."
      },
      {
        text: "Recusar o negócio e comunicar ao Mercato que a empresa não está em condições técnicas de atender às exigências no momento",
        effects: { reputacao: +2, qualidade: +2, clima: +2, financeiro: -1 },
        avaliacao: "media",
        ensinamento: "Recusar um negócio honestamente é uma decisão corajosa e estrategicamente defensável. Preserva a integridade da empresa e evita um contrato destrutivo. O risco é perder uma janela de mercado que pode não voltar — mas a honestidade com o Mercato agora pode abrir a porta para uma relação futura mais sólida."
      },
      {
        text: "Aceitar o negócio e colocar toda a empresa em modo de guerra pelos próximos 90 dias para entregar o que foi prometido",
        requisitos: { semFlags: ["lideranca_toxica"] },
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +2 },
        effects: { financeiro: +3, clima: -6, produtividade: -3, qualidade: -2, satisfacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Modo de guerra com um time já fragilizado é a receita para o colapso humano que você estava tentando evitar. O resultado mais provável é: entregas parciais, SLA não cumprido, multa contratual, e perda dos melhores engenheiros no processo — que usarão o burnout do Mercato como gatilho definitivo para sair."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R9 · PRESSÃO · O Ultimato dos Investidores
     Contexto: 7ª semana. A pressão financeira chega formalmente.
     Os investidores da Série A estabelecem condição para a Série B.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Ultimato dos Investidores",
    description: "Você recebe um memo formal dos investidores da Série A: 'Monitoramos os números de churn com preocupação crescente. Nossa condição para participar da Série B é clara: o churn mensal precisa cair para abaixo de 2,5% em 60 dias. Se não, não renovamos nossa posição e indicaremos ao conselho a contratação de um CEO profissional.' É a primeira vez que a palavra 'substituição' aparece num documento formal. Pedro e Beatriz estão com você. Como você responde?",
    tags: ["tecnologia"],
    fase: "pressao",
    choices: [
      {
        text: "Responder com um plano estruturado de 60 dias com metas específicas por semana, mostrando exatamente como o churn vai cair para 2,5%",
        effects: { reputacao: +4, satisfacao: +2, clima: +3, financeiro: +2, produtividade: +2 },
        avaliacao: "boa",
        ensinamento: "Investidores que estabelecem condições querem evidências de que o gestor entende o problema e tem um plano realista. Um plano estruturado com indicadores semanais transforma uma ameaça em contrato implícito de confiança. A especificidade do plano comunica competência; a honestidade sobre os riscos comunica maturidade."
      },
      {
        text: "Solicitar reunião urgente com os investidores para apresentar pessoalmente o estado atual e negociar os termos do ultimato",
        effects: { reputacao: +3, clima: +2, financeiro: +1, satisfacao: +1 },
        avaliacao: "boa",
        ensinamento: "Reuniões presenciais com investidores em crise criam contexto que e-mails e memos não conseguem. A linguagem corporal, a profundidade das respostas e a capacidade de responder em tempo real constroem ou destroem credibilidade. Negociar os termos em pessoa é mais eficaz do que aceitar ou rejeitar por escrito."
      },
      {
        text: "Aceitar integralmente o ultimato e comunicar ao time que todos os projetos não-churn são cancelados pelos próximos 60 dias",
        requisitos: { comFlags: ["crescimento_sem_caixa"] },
        effects: { satisfacao: +2, clima: -5, inovacao: -3, produtividade: -2, qualidade: -1 },
        avaliacao: "ruim",
        ensinamento: "Cancelar todos os projetos por pressão de investidores sinaliza ao time que as decisões da empresa são ditadas de fora — não pela liderança interna. O clima despenca, os melhores engenheiros (que têm opções) começam a sair, e o foco obcecado no churn sem endereçar a causa-raiz produz ações paliativas de baixo impacto."
      },
      {
        text: "Contratar uma consultoria de crescimento para montar um plano de retenção que impressione os investidores",
        effects: { financeiro: -4, reputacao: -1, satisfacao: +1, clima: -2 },
        avaliacao: "ruim",
        ensinamento: "Terceirizar a resposta a um ultimato estratégico passa aos investidores a mensagem de que o CEO não tem convicção própria sobre o caminho. Consultoria pode complementar, mas o plano precisa sair da liderança da empresa — ou a crise de confiança se aprofunda."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R10 · DECISÃO CRÍTICA · O Pivot para IA
     Contexto: 8ª semana. Uma proposta radical divide a liderança.
     Um dos sócios fundadores quer mudar tudo.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Pivot para IA",
    description: "Rafael, cofundador e diretor técnico sênior, apresenta em reunião de diretoria: 'Vamos perder para os concorrentes se continuarmos nesse produto. Minha proposta é pivotarmos para IA generativa nos próximos 6 meses — abandonar a plataforma atual e desenvolver um produto completamente novo. Tenho 3 satisfacao enterprise que já disseram que pagariam por isso.' Pedro é contra: 'Nossa equipe não tem expertise em IA. Vai precisar de contratações massivas que não temos dinheiro para fazer.' Beatriz concorda com Rafael. Você precisa decidir.",
    tags: ["tecnologia"],
    fase: "decisao",
    choices: [
      {
        text: "Rejeitar o pivot completo, mas criar um laboratório de IA interno com 2 engenheiros dedicados para explorar aplicações incrementais no produto atual",
        effects: { inovacao: +4, clima: +3, financeiro: -2, qualidade: +1, produtividade: +1 },
        avaliacao: "boa",
        ensinamento: "A versão inteligente de um pivot é a exploração estruturada: proteger o negócio atual enquanto investe em aprender o território novo. Um laboratório interno constrói expertise sem o risco de abandonar a receita existente. Os 3 satisfacao de Rafael podem financiar um piloto sem exigir abandono do core."
      },
      {
        text: "Apoiar o pivot completo — Rafael tem visão de produto e 3 satisfacao interessados é sinal de mercado suficiente",
        effects: { inovacao: +5, financeiro: -6, produtividade: -5, satisfacao: -4, clima: -3 },
        avaliacao: "ruim",
        ensinamento: "Pivots radicais com caixa pressionado, time fragilizado e produto principal gerando churn são apostas de sobrevivência — não de crescimento. Três satisfacao interessados é sinal de demanda, não de produto validado. O risco de ficar sem receita durante o pivot, com os custos de novo desenvolvimento, é existencial."
      },
      {
        text: "Propor um piloto de 90 dias: desenvolver um produto mínimo de IA para os 3 satisfacao de Rafael sem tocar no produto atual, e avaliar os resultados antes de decidir sobre o pivot",
        effects: { inovacao: +5, financeiro: -3, produtividade: -2, reputacao: +3, clima: +2 },
        avaliacao: "boa",
        ensinamento: "O piloto estruturado é a abordagem de menor risco para testar uma hipótese de pivot. Noventa dias com 3 satisfacao pagantes (mesmo a preço reduzido) gera dados reais sobre viabilidade, esforço e product-market fit antes de qualquer comprometimento definitivo de recursos."
      },
      {
        text: "Solicitar análise financeira completa de quanto tempo de runway a empresa tem para executar um pivot antes de decidir qualquer coisa",
        effects: { financeiro: +2, clima: -2, inovacao: -1, produtividade: -1 },
        avaliacao: "media",
        ensinamento: "Entender o runway é essencial, mas solicitá-lo como resposta à reunião — sem uma posição clara sobre a direção — atrasa uma decisão que o time espera. Dados financeiros devem ser levantados em paralelo, não como pré-requisito para ter uma posição estratégica."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R11 · DECISÃO CRÍTICA · A Oferta de Aquisição
     Contexto: 9ª semana. Uma empresa americana entra em cena.
     Decisão com impacto permanente no futuro da empresa.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Oferta de Aquisição",
    description: "Um email chega diretamente para você — enviado pelo CEO da TechBridge, uma empresa americana de software com presença em 14 países: 'Temos acompanhado o crescimento de vocês no mercado brasileiro de SaaS B2B. Gostaríamos de propor uma conversa sobre aquisição. Nossa oferta indicativa é de R$ 28 milhões por 100% da empresa.' O múltiplo é de 6,7× o ARR atual — acima da média do mercado. Rafael quer aceitar imediatamente. Pedro quer rejeitar. Os investidores querem discutir.",
    tags: ["tecnologia"],
    fase: "pressao",
    choices: [
      {
        text: "Entrar nas conversas de due diligence com a TechBridge sem compromisso, para entender a oferta real antes de qualquer decisão",
        effects: { financeiro: +3, reputacao: +2, clima: -2, inovacao: -1 },
        avaliacao: "boa",
        ensinamento: "Due diligence sem compromisso é a postura correta para uma oferta indicativa — que quase nunca reflete o valor final. O processo revela o real interesse do comprador, a qualidade da proposta e eventuais cláusulas restritivas antes que você assuma qualquer posição pública. Não entrar nas conversas é deixar dinheiro e informação na mesa."
      },
      {
        text: "Rejeitar formalmente a oferta — vender agora, numa fase de crise, seria vender pelo preço errado e pelo motivo errado",
        effects: { clima: +3, inovacao: +2, produtividade: +2, financeiro: -1, reputacao: +1 },
        avaliacao: "media",
        ensinamento: "Rejeitar durante uma crise pode ser a decisão certa se o fundador tem convicção de que o valor futuro supera o múltiplo atual. Mas rejeitá-la sem due diligence priva a liderança de dados valiosos sobre como o mercado avalia a empresa — e pode fechar uma janela que não volta."
      },
      {
        text: "Aceitar a oferta imediatamente — R$ 28 milhões é um resultado excelente dado o estado atual da empresa",
        requisitos: { faseEmpresa: ["crise"], indicadorMaximo: { financeiro: 9 } },
        risco: "alto",
        gestorEffects: { capitalPolitico: +3, reputacaoInterna: -2 },
        effects: { financeiro: +8, clima: -5, inovacao: -4, produtividade: -4, reputacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Aceitar uma oferta indicativa sem due diligence é vender antes de saber o que você tem. Indicativas raramente se transformam em contratos no mesmo valor — e a pressa em aceitar sinaliza desespero que o comprador vai usar para renegociar para baixo. O time que descobre a venda por e-mail entra em colapso de moral."
      },
      {
        text: "Contratar um banco de investimento especializado em M&A para gerenciar o processo e criar um leilão competitivo com outros interessados",
        requisitos: { indicadorMinimo: { financeiro: 8 }, semFlags: ["crescimento_sem_caixa"] },
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +5, reputacao: +4, clima: -1, inovacao: +1, satisfacao: +1 },
        avaliacao: "boa",
        ensinamento: "Um processo de M&A competitivo conduzido por especialistas aumenta o valor final da transação em média 20-35% em relação a negociações bilaterais diretas. O banco cria urgência competitiva, protege os fundadores das assimetrias jurídicas do processo e libera o CEO para continuar gerindo a empresa durante as negociações."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R12 · DECISÃO CRÍTICA · A Investigação da ANPD
     Contexto: 10ª semana. A falha de segurança tem consequências.
     A regulação chega com peso institucional.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Investigação da ANPD",
    description: "A Autoridade Nacional de Proteção de Dados abre formalmente um processo administrativo referente ao incidente de segurança de três semanas atrás. O prazo para apresentar a defesa é de 15 dias úteis. Ao mesmo tempo, dois satisfacao enterprise recebem o aviso da ANPD diretamente e enviam notificações de rescisão contratual. O jurídico estima que a multa pode variar entre R$ 180 mil e R$ 1,2 milhão dependendo da qualidade da resposta apresentada. Pedro apresenta um plano técnico de adequação que custaria R$ 220 mil e levaria 8 semanas.",
    tags: ["tecnologia"],
    fase: "decisao",
    choices: [
      {
        text: "Investir imediatamente no plano técnico de Pedro e apresentar à ANPD um programa completo de adequação com cronograma detalhado e DPO nomeado",
        effects: { seguranca: +6, reputacao: +4, satisfacao: +3, financeiro: -4, qualidade: +3 },
        avaliacao: "boa",
        ensinamento: "A ANPD avalia a boa-fé e a qualidade do programa de adequação ao determinar o valor das multas. Empresas que apresentam planos estruturados com DPO nomeado, cronograma de implementação e evidências de comprometimento recebem penalidades significativamente menores do que as que respondem defensivamente. O investimento de R$ 220K pode economizar R$ 1M em multa."
      },
      {
        text: "Focar na defesa jurídica para minimizar a multa sem investir no plano técnico — o processo pode durar anos",
        requisitos: { comFlags: ["ignorou_seguranca"] },
        effects: { financeiro: -2, seguranca: -2, reputacao: -4, satisfacao: -3 },
        avaliacao: "ruim",
        ensinamento: "Uma estratégia puramente defensiva sem evidências de adequação técnica raramente reduz multas da ANPD — e constrói um histórico regulatório negativo que complica futuras captações, contratos enterprise e auditorias de due diligence. A defesa jurídica precisa ser acompanhada de adequação real."
      },
      {
        text: "Negociar acordo de conformidade voluntária com a ANPD, propondo metas de adequação em troca de redução de penalidades",
        effects: { seguranca: +4, reputacao: +3, financeiro: -3, satisfacao: +2, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "Acordos de conformidade voluntária são reconhecidos pela ANPD como sinal de boa-fé e frequentemente resultam em penalidades menores e cronogramas mais flexíveis. A proatividade no acordo também cria precedente positivo no histórico regulatório da empresa — especialmente importante para contratos com órgãos públicos e satisfacao enterprise."
      },
      {
        text: "Comunicar publicamente nas redes sociais e no site que a empresa está colaborando totalmente com a ANPD para demonstrar transparência ao mercado",
        effects: { reputacao: -2, satisfacao: -1, seguranca: +1, clima: -1 },
        avaliacao: "ruim",
        ensinamento: "Comunicação pública sobre um processo administrativo em andamento — sem orientação jurídica — pode ser interpretada como reconhecimento de culpa e usado contra a empresa no processo. Transparência com satisfacao é essencial; publicidade em processo regulatório é perigosa sem protocolo legal cuidadoso."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R13 · DECISÃO CRÍTICA · O CTO Vai Embora
     Contexto: 11ª semana. A perda mais crítica possível.
     Pedro anuncia que vai criar a própria startup.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O CTO Vai Embora",
    description: "Pedro pede uma reunião reservada. Ele é direto: 'Tenho um cofounder, uma ideia que valida uma hipótese de mercado que eu acredito muito, e um angel que já confirmou R$ 500 mil de seed. Vou sair para criar essa startup. Meu prazo é 30 dias.' Pedro está há 3 anos na empresa. Ele é o principal arquiteto de tudo que vocês construíram. Sem ele, o conhecimento técnico da plataforma cai dramaticamente. Você tem 30 dias para reagir.",
    tags: ["tecnologia"],
    fase: "decisao",
    choices: [
      {
        text: "Aceitar a decisão com elegância, negociar um período de transição de 60 dias com documentação estruturada e promover o dev sênior mais preparado a líder técnico interino",
        effects: { clima: +4, qualidade: +3, produtividade: +1, reputacao: +2, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "A saída digna de um CTO cofundador define como o time inteiro processa a mudança. Negociar uma transição estruturada com documentação transforma a saída em fortalecimento institucional. Promover internamente sinaliza ao time que há trajetória real na empresa — o que é o oposto do que fez os outros deixarem."
      },
      {
        text: "Fazer uma proposta de cofundador retroativo para Pedro — participação de 8% e assento no conselho em troca de ficar",
        effects: { clima: +2, financeiro: -3, inovacao: +2, produtividade: +1, qualidade: +1 },
        avaliacao: "media",
        ensinamento: "Oferecer participação retroativa quando a pessoa já tomou a decisão de sair raramente funciona — e cria precedente questionável de que o reconhecimento só vem quando alguém ameaça sair. Se Pedro está comprometido com a própria startup, nenhum nível de equity vai genuinamente mudar sua decisão."
      },
      {
        text: "Contratar imediatamente um recrutador especializado em tecnologia para encontrar um novo CTO no mercado antes que Pedro saia",
        effects: { financeiro: -5, clima: -2, produtividade: -3, qualidade: -2 },
        avaliacao: "ruim",
        ensinamento: "Buscar um substituto externo como primeira reação comunica ao time que o conhecimento interno não é suficiente. Um novo CTO externo leva 3 a 6 meses para entender a arquitetura que Pedro conhece de cor — e esse vácuo, sem transição planejada, é o período de maior risco técnico da empresa."
      },
      {
        text: "Propor a Pedro um modelo de advisory: ele sai para a startup dele, mas dedica 8 horas mensais como advisor técnico durante 12 meses",
        effects: { qualidade: +3, inovacao: +2, clima: +3, produtividade: +2, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Um acordo de advisory mantém o canal de conhecimento técnico aberto durante o período crítico de transição. Para Pedro, é uma forma de honrar o relacionamento sem abrir mão da própria startup. Para a empresa, é acesso privilegiado ao arquiteto original durante o período em que o substituto ainda está subindo a curva de aprendizado."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R14 · DECISÃO CRÍTICA · O Lançamento que Não Está Pronto
     Contexto: 13ª semana. A nova versão da plataforma quase pronta.
     A pressão por lançar conflita com a qualidade necessária.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Lançamento que Não Está Pronto",
    description: "A nova versão da plataforma — desenvolvida pelos últimos 10 semanas — está 85% concluída. O novo líder técnico Lucas apresenta o estado: 'Temos 43 bugs abertos, sendo 8 classificados como críticos. Com o time atual, precisamos de mais 5 semanas para fechar tudo com qualidade. Mas se lançarmos agora, os satisfacao vão sentir os problemas e vai parecer a versão anterior.' Os investidores já anunciaram o lançamento para os satisfacao enterprise como marco do plano. Beatriz diz que esperar mais 5 semanas vai custar 3 contratos que estão condicionados ao lançamento.",
    tags: ["tecnologia"],
    fase: "decisao",
    choices: [
      {
        text: "Adiar o lançamento geral por 5 semanas e corrigir todos os bugs críticos — comunicar honestamente aos investidores e satisfacao o motivo do atraso",
        effects: { qualidade: +6, reputacao: +3, satisfacao: +2, clima: +3, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Lançar com 8 bugs críticos é repetir o padrão que causou a crise atual — e desta vez com uma versão nova que os satisfacao têm expectativa elevada. O custo de 3 contratos adiados é real, mas mensurável. O custo de um lançamento malsucedido que reforça a reputação de instabilidade é muito mais alto e mais difícil de reverter."
      },
      {
        text: "Fazer um lançamento para primeiros adotantes — um grupo de 20 satisfacao selecionados — e usar o feedback deles para corrigir os últimos bugs antes do lançamento geral em 3 semanas",
        effects: { qualidade: +4, satisfacao: +3, reputacao: +4, produtividade: +2, clima: +2 },
        avaliacao: "boa",
        ensinamento: "O lançamento gradual — beta fechado com satisfacao selecionados — é uma das práticas mais eficazes em software. Transforma o risco técnico em diferencial comercial (ser cliente acesso antecipado). Os bugs críticos são encontrados em ambiente controlado. E o lançamento geral acontece com mais confiança e menos risco reputacional."
      },
      {
        text: "Lançar conforme o prazo — a pressão dos investidores e os 3 contratos condicionados justificam aceitar os riscos dos bugs",
        effects: { financeiro: +3, qualidade: -5, satisfacao: -4, reputacao: -3, clima: -3, seguranca: -2 },
        avaliacao: "ruim",
        ensinamento: "Lançar com bugs críticos conhecidos para atender pressão externa é exatamente o que criou a dívida técnica original. O time que construiu a nova versão com cuidado vê a liderança repetir o mesmo erro — e a motivação para a próxima iteração de qualidade colapsa junto com o lançamento."
      },
      {
        text: "Terceirizar a correção dos 8 bugs críticos para uma empresa de QA especializada para entregar em 2 semanas",
        effects: { financeiro: -4, qualidade: +3, produtividade: +2, satisfacao: +1 },
        avaliacao: "media",
        ensinamento: "QA especializada pode acelerar a correção de bugs críticos com metodologia e ferramentas que o time interno pode não ter. O risco é o tempo de onboarding no código novo — bugs críticos frequentemente exigem compreensão profunda da arquitetura para serem corrigidos com segurança."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R15 · DECISÃO CRÍTICA · O Board Meeting Final
     Contexto: 15ª semana. Tudo culmina aqui.
     A direção dos próximos 2 anos precisa ser definida hoje.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Board Meeting Final",
    description: "Reunião do conselho. Na sala: os dois investidores da Série A, Rafael (cofundador), Lucas (novo líder técnico), Beatriz (comercial) e você. Os investidores colocam a questão diretamente na mesa: 'A empresa sobreviveu à crise. Mas o mercado não vai esperar por uma empresa em modo de recuperação indefinidamente. Precisamos definir hoje: qual é a estratégia dos próximos 24 meses?' Quatro caminhos foram apresentados previamente em documento. Agora é a hora da decisão.",
    tags: ["tecnologia"],
    fase: "decisao",
    choices: [
      {
        text: "Crescimento sustentável: atingir break-even em 14 meses com expansão orgânica da base atual, e negociar Série B apenas quando a empresa estiver em posição de força técnica e operacional",
        effects: { financeiro: +5, qualidade: +5, clima: +5, satisfacao: +3, reputacao: +4, produtividade: +4 },
        avaliacao: "boa",
        ensinamento: "Crescimento sustentável — rentabilidade antes de nova captação — é o único caminho que preserva o controle estratégico do fundador e do time. Uma empresa no break-even negocia com investidores como parceiro, não como dependente. O aprendizado de 15 semanas de crise não pode ser desperdiçado na próxima pressão por crescimento acelerado."
      },
      {
        text: "Expansão acelerada: aceitar Série B com as condições mais favoráveis disponíveis agora e escalar o time de 67 para 130 pessoas nos próximos 12 meses",
        requisitos: { faseEmpresa: ["crescimento", "consolidacao", "expansao"], semFlags: ["crescimento_sem_caixa", "lideranca_toxica"] },
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +2 },
        effects: { financeiro: +5, clima: -5, qualidade: -4, produtividade: -4, seguranca: -2, reputacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Escalar um time em recuperação de crise antes de consolidar os processos é o padrão que destrói empresas que sobreviveram a crises. Dobrar o headcount sem cultura técnica sólida dilui a qualidade, reproduz os problemas de conhecimento tácito e cria a próxima geração de dívida técnica — desta vez com mais pessoas no caos."
      },
      {
        text: "Especialização: focar os próximos 24 meses exclusivamente no segmento de varejo — o setor onde o produto tem melhor fit e onde o Mercato Varejo pode ser referência",
        effects: { satisfacao: +4, reputacao: +5, qualidade: +3, financeiro: +3, inovacao: +2, clima: +3 },
        avaliacao: "boa",
        ensinamento: "Verticalização estratégica é uma das formas mais eficazes de criar diferencial defensável em SaaS B2B. Um produto 'feito para varejo' cria barreiras de entrada que um produto horizontal nunca consegue. O Mercato Varejo como caso de referência âncora credibilidade para toda a estratégia de go-to-market do setor."
      },
      {
        text: "Venda estratégica: reabrir as negociações com a TechBridge americana em condições mais favoráveis após a estabilização operacional",
        effects: { financeiro: +7, clima: -4, inovacao: -3, produtividade: -3, satisfacao: +2 },
        avaliacao: "media",
        ensinamento: "A venda estratégica é uma decisão legítima quando o contexto dos fundadores e do mercado se alinha. Negociar após a estabilização — não durante a crise — é o timing correto: o múltiplo melhora, a due diligence encontra menos problemas e os fundadores negociam de força, não de necessidade. O custo humano de uma aquisição mal conduzida, porém, é real e precisa ser endereçado no processo."
      }
    ]
  }

]
/* Histórias [1] e [2] adicionadas abaixo */


/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [1] · EdTech · Ensino Digital B2C
   Contexto: plataforma de 94k assinantes (era 180k), R$22M ARR,
   95 colaboradores, 8 meses de runway, CAC triplicou, LTV encolheu.
   Pivô B2C→B2B em análise. Time de conteúdo sobrecarregado.

   INDICADORES: financeiro:9, clima:4, satisfacao:7, qualidade:6,
                produtividade:5, reputacao:8, inovacao:7, seguranca:6

   ATENÇÃO: clima já começa em 4 (baixo). Qualquer decisão que ignore
   o time de conteúdo pode desencadear a interdependência:
   clima≤5 → produtividade-2 → qualidade-2 → satisfacao-2 → financeiro-2
══════════════════════════════════════════════════════════════════ */
[

  /* ═══════════════════════════════════════════════════════
     R1 · DIAGNÓSTICO · O Relatório dos 8 Meses
     Contexto: primeiro dia focado nos números reais.
     O CFO apresenta o runway e o cenário.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Relatório dos 8 Meses",
    description: "Carla, sua CFO, coloca os números na mesa: runway de 8 meses, CAC de R$187 por assinante (era R$62 há 18 meses), LTV médio caído de R$940 para R$410. A base saiu de 180k para 94k assinantes. 'Temos duas opções estruturais', ela diz. 'Cortar custos para chegar ao break-even no B2C — ou pivotar para B2B corporativo, onde o ticket é 12x maior mas o ciclo de venda é de 90 dias.' Por onde você começa?",
    tags: ["tecnologia"],
    fase: "diagnostico",
    choices: [
      {
        text: "Fazer um diagnóstico cirúrgico: entrevistar os 20 maiores satisfacao que cancelaram e os 20 mais fiéis antes de qualquer decisão",
        risco: "baixo",
        effects: { satisfacao: +2, qualidade: +2, financeiro: -1, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Decisões estratégicas baseadas em dados de satisfacao reais são infinitamente mais seguras do que projeções internas. Os cancelamentos e as permanências carregam a resposta sobre o que o produto precisa ser."
      },
      {
        text: "Anunciar imediatamente o pivô para B2B e iniciar prospecção de empresas ainda este mês",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1, esgotamento: +1 },
        effects: { financeiro: -2, clima: -2, satisfacao: -2, inovacao: +2 },
        avaliacao: "ruim",
        ensinamento: "Pivôs anunciados antes de serem validados criam expectativa sem entrega. O mercado B2B exige produto, processo de vendas e cases — nenhum deles existe ainda. Pivotar sem preparação acelera a queima de caixa."
      },
      {
        text: "Reduzir a equipe de conteúdo de 22 para 12 pessoas agora para estender o runway imediatamente",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2, capitalPolitico: +1 },
        effects: { financeiro: +3, clima: -4, qualidade: -3, produtividade: -3, satisfacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Cortar o time de conteúdo destrói o ativo central de uma EdTech. Conteúdo é o produto — demitir quem o produz é equivalente a uma fábrica desligar a linha de produção para economizar energia."
      },
      {
        text: "Montar um grupo de trabalho com CFO, head de produto e head de conteúdo para apresentar um plano em 2 semanas",
        risco: "baixo",
        effects: { financeiro: -1, clima: +2, produtividade: +2, qualidade: +1 },
        avaliacao: "boa",
        ensinamento: "Incluir as lideranças-chave na análise estratégica aumenta a qualidade da decisão e o comprometimento de execução. Duas semanas para planejar é um custo mínimo diante de uma decisão que define o futuro da empresa."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R2 · DIAGNÓSTICO · O Time de Conteúdo no Limite
     Contexto: clima em 4. O head de conteúdo pede reunião urgente.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Time de Conteúdo no Limite",
    description: "Rafael, head de conteúdo e um dos fundadores originais, pede reunião. 'O time está produzindo 4 cursos por mês com a estrutura de 1 curso por mês. Três pessoas estão de atestado por ansiedade. Se não contratar ou redistribuir, vou perder mais dois sêniors até o final do mês.' O clima já está em nível crítico. Qualquer nova queda vai arrastar produtividade e qualidade junto.",
    tags: ["tecnologia"],
    fase: "diagnostico",
    choices: [
      {
        text: "Contratar 4 produtores de conteúdo freelancers para aliviar a sobrecarga imediatamente",
        risco: "medio",
        effects: { clima: +3, produtividade: +3, qualidade: +2, financeiro: -3 },
        avaliacao: "boa",
        ensinamento: "Freelancers são a válvula de alívio mais rápida para um time sobrecarregado. O custo é real, mas perder dois sêniors custa muito mais — em tempo de reposição, curva de aprendizado e moral do restante da equipe."
      },
      {
        text: "Reduzir o ritmo de produção de 4 para 2 cursos por mês para aliviar o time sem contratar",
        risco: "baixo",
        effects: { clima: +2, produtividade: +2, satisfacao: -2, inovacao: -2, financeiro: -1 },
        avaliacao: "media",
        ensinamento: "Reduzir o ritmo protege o time mas encolhe o portfólio — que é o principal argumento de renovação de assinatura. O trade-off precisa ser consciente e comunicado para o time."
      },
      {
        text: "Implementar método de produção em blocos — gravar em lote para otimizar o tempo de cada especialista",
        risco: "baixo",
        effects: { clima: +1, produtividade: +4, qualidade: +1, financeiro: 0 },
        avaliacao: "boa",
        ensinamento: "Reorganização do fluxo de produção é a solução mais eficiente: não custa dinheiro e aumenta a capacidade. Produção em blocos é padrão em Netflix, Masterclass e os maiores players de conteúdo do mundo."
      },
      {
        text: "Dizer ao Rafael que a empresa está em momento crítico e que todos precisam aguentar mais 3 meses",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2 },
        effects: { clima: -3, produtividade: -2, qualidade: -2, satisfacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Pedir aguardo a um time já no limite sem nenhuma ação concreta é a receita para perder exatamente as pessoas que você mais precisa. Líderes em crise não pedem paciência — oferecem soluções."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R3 · DIAGNÓSTICO · O Cliente que Cancela e Explica
     Contexto: entrevistas de cancelamento revelam padrão claro.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Cliente que Cancela e Explica",
    description: "As entrevistas de cancelamento revelaram três padrões dominantes: 60% cancela por 'falta de tempo para estudar' (conteúdo muito longo), 25% por 'não consigo aplicar no trabalho' (teoria sem prática), 15% por preço frente a alternativas gratuitas. O head de produto propõe reformular os cursos em módulos de 8 minutos com projetos práticos. O time de conteúdo estima 4 meses de trabalho para reformular o catálogo atual.",
    tags: ["tecnologia"],
    fase: "diagnostico",
    choices: [
      {
        text: "Reformular os 20 cursos mais populares em módulos curtos com projetos práticos — priorizar impacto máximo",
        risco: "medio",
        effects: { qualidade: +4, satisfacao: +3, produtividade: -2, financeiro: -2, inovacao: +2 },
        avaliacao: "boa",
        ensinamento: "Reformular o produto com base em feedback real de cancelamento é a alocação mais eficiente de esforço de produto. Focar nos 20 cursos mais populares entrega 80% do impacto com 30% do trabalho."
      },
      {
        text: "Criar uma nova trilha de microlearning sem mexer no catálogo existente — adicionar sem reformar",
        risco: "medio",
        effects: { inovacao: +3, satisfacao: +2, financeiro: -3, produtividade: -3, qualidade: 0 },
        avaliacao: "media",
        ensinamento: "Adicionar sem reformar fragmenta o portfólio e o foco do time. Os novos microconteúdos precisam competir por atenção com o catálogo antigo que tem os mesmos problemas apontados nos cancelamentos."
      },
      {
        text: "Reformular o catálogo inteiro nos próximos 4 meses — fazer certo de uma vez",
        risco: "alto",
        gestorEffects: { esgotamento: +1 },
        effects: { qualidade: -2, produtividade: -4, clima: -2, financeiro: -3, satisfacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Reformular 100% do catálogo em paralelo com a operação normal sobrecarrega o time além do limite. Com o clima já crítico, essa decisão pode quebrar o time que está segurando a empresa."
      },
      {
        text: "Criar uma feature de 'modo rápido' que corta os cursos existentes automaticamente em clips de 10 minutos",
        risco: "baixo",
        effects: { satisfacao: +2, inovacao: +2, qualidade: -1, financeiro: -1, produtividade: +1 },
        avaliacao: "media",
        ensinamento: "A solução tecnológica compensa o curto prazo, mas a edição automática não substitui a reformulação pedagógica. Clips gerados por IA de conteúdo longo raramente capturam os momentos mais relevantes."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R4 · DIAGNÓSTICO · A Plataforma Que Ficou Para Trás
     Contexto: a tecnologia da plataforma tem 3 anos sem refactor.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Plataforma Que Ficou Para Trás",
    description: "O relatório técnico chega: a plataforma tem performance média de 4,8 segundos para carregar no mobile — o benchmark do setor é 1,8s. O app iOS tem nota 3,2 na App Store. O CTO Eduardo estima 3 meses de refatoração para atingir o padrão atual do mercado. 'É dívida técnica que acumulamos quando crescemos rápido durante a pandemia', ele explica. 'Cada semana que postergamos custa mais para resolver depois.'",
    tags: ["tecnologia"],
    fase: "diagnostico",
    choices: [
      {
        text: "Alocar 40% da equipe de engenharia para refatoração e manter 60% em novas features — equilibrar débito e produto",
        risco: "medio",
        effects: { qualidade: +3, seguranca: +2, produtividade: -2, satisfacao: +2, inovacao: -1 },
        avaliacao: "boa",
        ensinamento: "Alocar parcialmente para tech debt enquanto mantém entregas de produto é a prática recomendada. Pagar 100% da dívida técnica de uma vez paralisa o produto; ignorar 100% cria um produto que o time não consegue mais evoluir."
      },
      {
        text: "Pausar todas as novas features pelos 3 meses de refatoração total",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { qualidade: +5, seguranca: +3, produtividade: -4, satisfacao: -3, inovacao: -3, financeiro: -2 },
        avaliacao: "media",
        ensinamento: "Refatoração total entrega a maior melhoria técnica, mas 3 meses sem novas features em uma empresa com 8 meses de runway e assinantes cancelando é um risco real de mercado."
      },
      {
        text: "Focar apenas nas melhorias de performance do mobile — o problema mais visível para o assinante",
        risco: "baixo",
        effects: { satisfacao: +3, qualidade: +2, financeiro: -1, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Priorizar pelo impacto no cliente é a escolha certa quando os recursos são escassos. Performance mobile afeta diretamente a experiência de 68% dos usuários que acessam pelo celular."
      },
      {
        text: "Adiar a refatoração — com o runway de 8 meses, sobrevivência financeira precede qualidade técnica",
        risco: "medio",
        effects: { financeiro: +1, qualidade: -2, seguranca: -2, satisfacao: -2, produtividade: -1 },
        avaliacao: "ruim",
        ensinamento: "Ignorar débito técnico é emprestar dinheiro com juros compostos. Cada mês sem refatoração aumenta o custo de correção futura e deteriora a experiência do usuário — acelerando exatamente o churn que drena o caixa."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R5 · DIAGNÓSTICO · O Fundo de Corporate Venture
     Contexto: oportunidade de capital surge com exigências.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Fundo de Corporate Venture",
    description: "O fundo de corporate venture de um grande grupo educacional quer investir R$8M por 25% da empresa. A condição: a empresa precisa pivotar para B2B e atender prioritariamente o grupo controlador por 3 anos. O cheque resolve o runway, mas o pivô forçado pode desalinhar o time e limitar o mercado endereçável no futuro. Seu investidor-anjo atual aconselha cautela.",
    tags: ["tecnologia"],
    fase: "diagnostico",
    choices: [
      {
        text: "Negociar as condições: aceitar os R$8M mas reduzir a exclusividade para 18 meses e o stake para 18%",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +6, inovacao: -1, satisfacao: -1, clima: +2 },
        avaliacao: "boa",
        ensinamento: "Negociar os termos de um cheque grande é a responsabilidade do CEO. Reduzir a exclusividade e a diluição preserva a flexibilidade estratégica sem recusar capital que resolve o problema de sobrevivência."
      },
      {
        text: "Aceitar as condições integralmente — R$8M agora vale mais do que qualquer flexibilidade futura",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +1 },
        effects: { financeiro: +8, inovacao: -3, satisfacao: -2, clima: -2, reputacao: -1 },
        avaliacao: "media",
        ensinamento: "Capital resolve o runway, mas 3 anos de exclusividade com um único cliente pode engessar completamente a estratégia. Fundos corporate geralmente querem muito mais do que o dinheiro inicial sugere."
      },
      {
        text: "Recusar e buscar investidores sem condicionantes de pivô nos próximos 60 dias",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1, esgotamento: +2 },
        effects: { financeiro: -3, inovacao: +2, clima: -1, reputacao: +1 },
        avaliacao: "media",
        ensinamento: "Recusar capital ruim pode ser a decisão certa — mas exige que a alternativa exista. Com 8 meses de runway, 60 dias buscando investidor sem garantia de cheque é um risco calculado que precisa de plano B."
      },
      {
        text: "Aceitar metade do valor (R$4M) em troca de condições mais brandas — meio a meio",
        risco: "baixo",
        effects: { financeiro: +4, inovacao: 0, satisfacao: 0, clima: +1, produtividade: +1 },
        avaliacao: "boa",
        ensinamento: "Cheque menor com menos restrições muitas vezes é melhor negócio do que cheque maior com cláusulas que limitam o futuro. R$4M estende o runway em 4 meses — tempo suficiente para validar o B2B sem se prender a ele."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R6 · PRESSÃO · O Head de Produto Quer Sair
     Contexto: pressão externa começa. Liderança ameaçada.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Head de Produto Quer Sair",
    description: "Tatiana, sua head de produto, pede uma conversa difícil: 'Recebi uma oferta de uma startup financiada para ser CPO. Salário 40% acima. Posso ficar se houver um caminho claro para o produto daqui — mas não consigo trabalhar com a incerteza atual.' Tatiana tem 4 anos de empresa e domina toda a visão de produto. Reposicioná-la levaria meses.",
    tags: ["tecnologia"],
    fase: "pressao",
    choices: [
      {
        text: "Apresentar o roadmap estratégico dos próximos 12 meses e oferecer participação societária como retenção",
        risco: "medio",
        gestorEffects: { reputacaoInterna: +2 },
        effects: { financeiro: -2, clima: +3, produtividade: +2, inovacao: +2, qualidade: +1 },
        avaliacao: "boa",
        ensinamento: "Equity como instrumento de retenção alinha o interesse da liderança ao futuro da empresa. Além do dinheiro, a Tatiana quer pertencer ao projeto — e um roadmap claro é o que ela está pedindo."
      },
      {
        text: "Aumentar o salário em 25% e criar o cargo de CPO formalmente",
        risco: "medio",
        effects: { financeiro: -3, clima: +2, produtividade: +2, qualidade: +1, inovacao: +1 },
        avaliacao: "media",
        ensinamento: "Contraproposta salarial resolve o imediato mas não o problema real: a incerteza estratégica. Se o caminho do produto continuar nebuloso, a retenção financeira é temporária."
      },
      {
        text: "Desejar boa sorte e iniciar a busca imediata por um novo head de produto no mercado",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -1 },
        effects: { clima: -3, produtividade: -4, qualidade: -3, inovacao: -2, satisfacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Perder o head de produto com 4 anos de empresa em um momento de incerteza estratégica é um dos eventos mais custosos para uma startup. O custo de reposição é alto — mas o custo de conhecimento perdido é incalculável."
      },
      {
        text: "Propor que ela lidere a decisão de pivô como projeto estratégico principal — dar protagonismo à incerteza",
        risco: "baixo",
        effects: { clima: +4, produtividade: +3, inovacao: +3, financeiro: -1, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "Transformar o problema em missão é uma das ferramentas mais poderosas de retenção de talento. Líderes de produto engajam quando sentem que têm impacto real na direção da empresa."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R7 · PRESSÃO · Coursera Anuncia Expansão no Brasil
     Contexto: competidor internacional entra com força.
  ═══════════════════════════════════════════════════════ */
  {
    title: "Coursera Anuncia Expansão no Brasil",
    description: "O Coursera anunciou parceria com 8 universidades brasileiras e planos de localizar todo o catálogo em português até o próximo semestre. A precificação será de R$59/mês — R$40 abaixo da sua assinatura atual. A imprensa especializada já faz comparações diretas. Três investidores-anjos que você está prospectando enviaram o artigo com a pergunta: 'Como vocês respondem a isso?'",
    tags: ["tecnologia"],
    fase: "pressao",
    choices: [
      {
        text: "Posicionar publicamente o diferencial: instrutores brasileiros, contexto local e projetos aplicados ao mercado nacional",
        risco: "baixo",
        effects: { reputacao: +4, satisfacao: +2, inovacao: +1, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Diferenciação clara é a única resposta sustentável à entrada de um player global capitalizado. Instrutores e casos locais são um moat que plataformas internacionais demoram anos para construir."
      },
      {
        text: "Reduzir o preço para R$69/mês para competir mais diretamente com o Coursera",
        risco: "alto",
        effects: { satisfacao: +2, satisfacao: +1, financeiro: -5, financeiro: -3 },
        avaliacao: "ruim",
        ensinamento: "Guerra de preços com empresa capitalizada é batalha perdida antes de começar. Reduzir preço comprime financeiro sem garantir diferencial — e abre um precedente que é difícil de reverter."
      },
      {
        text: "Acelerar o desenvolvimento de features que o Coursera não tem: certificações reconhecidas por empresas brasileiras",
        risco: "medio",
        effects: { inovacao: +4, reputacao: +3, financeiro: -3, produtividade: -2 },
        avaliacao: "boa",
        ensinamento: "Criar features que um global não consegue replicar rapidamente é a estratégia correta para startups locais contra gigantes. Certificações reconhecidas por RHs brasileiros exigem anos de parcerias locais."
      },
      {
        text: "Ignorar o anúncio — o Coursera ainda não está operando e o mercado reage a fatos, não a anúncios",
        risco: "medio",
        effects: { reputacao: -3, satisfacao: -1, financeiro: 0 },
        avaliacao: "ruim",
        ensinamento: "Silêncio frente a um anúncio competitivo é lido pelo mercado como ausência de estratégia. Investidores, talentos e satisfacao observam como a empresa reage à pressão — e o silêncio é uma resposta."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R8 · PRESSÃO · O Resultado do Piloto B2B
     Contexto: 3 empresas testaram a plataforma para treinamento.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Resultado do Piloto B2B",
    description: "O piloto B2B com 3 empresas terminou. Os resultados são mistos: a empresa A vai contratar (R$180k/ano, 200 licenças), a empresa B quer mais customização antes de decidir, a empresa C achou 'caro para o que entrega'. O ticket médio do B2B seria 11x o do B2C, mas o ciclo de venda foi de 4 meses. Com o runway atual, quantos ciclos de 4 meses você consegue financiar?",
    tags: ["tecnologia"],
    fase: "pressao",
    choices: [
      {
        text: "Assinar o contrato com a empresa A, usar como caso de referência e montar equipe de 2 vendedores B2B especializados",
        risco: "medio",
        effects: { financeiro: +4, reputacao: +3, satisfacao: +2, inovacao: +1, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Primeiro cliente B2B convertido é o ativo mais valioso da transição de modelo. Um case real com resultado mensurável é a ferramenta de vendas mais eficiente para os próximos contratos."
      },
      {
        text: "Investir na customização exigida pela empresa B — um contrato maior vale o investimento",
        risco: "medio",
        effects: { financeiro: -4, qualidade: +2, inovacao: +2, produtividade: -2, satisfacao: +1 },
        avaliacao: "media",
        ensinamento: "Customização para fechar um contrato B2B pode criar um produto melhor — ou um produto engessado em torno de uma necessidade específica que não escala. A decisão precisa avaliar se a customização tem valor para outros satisfacao."
      },
      {
        text: "Desistir do B2B — o ciclo de 4 meses é incompatível com o runway e os resultados foram decepcionantes",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2 },
        effects: { financeiro: -1, inovacao: -3, reputacao: -2, satisfacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Abandonar o B2B depois de 1 ciclo com 33% de conversão (empresa A) é prematura. Vendas B2B têm curva de aprendizado e os primeiros ciclos raramente são representativos da maturidade do canal."
      },
      {
        text: "Pivotar completamente para B2B: desligar o plano B2C e migrar o time inteiro para atendimento corporativo",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +2 },
        effects: { financeiro: +2, satisfacao: -4, clima: -3, reputacao: -2, inovacao: +2 },
        avaliacao: "ruim",
        ensinamento: "Pivô completo sem validação suficiente é o erro clássico de startups em crise. Desligar 94k assinantes B2C antes de garantir receita B2B suficiente pode zerar o caixa mais rápido do que a queima atual."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R9 · PRESSÃO · A Crise de Retenção Chega ao Pico
     Contexto: churn mensal subindo. Dados de coorte preocupam.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Crise de Retenção Chega ao Pico",
    description: "Os dados de coorte mostram que o churn no 3º mês de assinatura está em 41% — era 18% há dois anos. O head de CS Marcos propõe uma iniciativa de 'sucesso do aluno': check-ins semanais automatizados, trilhas personalizadas e gamificação de progresso. Custo de implementação: R$340k em tecnologia e 3 meses de trabalho. Impacto estimado: redução de 12% no churn mensal.",
    tags: ["tecnologia"],
    fase: "pressao",
    choices: [
      {
        text: "Aprovar o projeto de sucesso do aluno — reduzir o churn é a prioridade mais urgente",
        risco: "medio",
        effects: { satisfacao: +4, inovacao: +3, financeiro: -4, produtividade: -2, reputacao: +2 },
        avaliacao: "boa",
        ensinamento: "Em modelo de assinatura, reduzir churn tem ROI garantido — cada ponto percentual de retenção a mais vale meses de crescimento de CAC. Investir em sucesso do cliente é investir no LTV."
      },
      {
        text: "Implementar apenas a gamificação — a parte mais barata e com impacto mais visível para o assinante",
        risco: "baixo",
        effects: { satisfacao: +2, inovacao: +2, financeiro: -1, produtividade: 0 },
        avaliacao: "media",
        ensinamento: "Gamificação cria engajamento de curto prazo, mas não resolve as causas estruturais do churn identificadas nas entrevistas: falta de tempo e conteúdo pouco aplicável. É um analgésico, não um tratamento."
      },
      {
        text: "Criar uma equipe de CS humano — 4 pessoas que entram em contato com assinantes no 2º mês",
        risco: "medio",
        effects: { satisfacao: +3, qualidade: +1, financeiro: -3, clima: +1, reputacao: +2 },
        avaliacao: "boa",
        ensinamento: "CS humano em modelo de assinatura cria uma camada de relacionamento que a tecnologia não replica. Contato no 2º mês — antes do pico de churn no 3º — intercepta o abandono no momento certo."
      },
      {
        text: "Aguardar os resultados das reformulações de conteúdo antes de investir em CS — resolver a causa antes do sintoma",
        risco: "baixo",
        effects: { satisfacao: -2, financeiro: +1, produtividade: +1, inovacao: 0 },
        avaliacao: "media",
        ensinamento: "Sequenciar as iniciativas pode fazer sentido — mas cada mês de churn alto queima assinantes que não voltam. O ideal é endereçar causa e sintoma em paralelo, mesmo que com recursos menores para cada frente."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R10 · DECISÃO CRÍTICA · O Investidor Anjo Cobra Uma Posição
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Investidor Anjo Cobra Uma Posição",
    description: "Seu principal investidor-anjo, Henrique, que aportou R$1,2M na fundação, pede uma reunião. Ele é direto: 'Você tem 5 meses de runway. Eu posso participar de um bridge de R$3M se você me apresentar uma estratégia clara — B2C reformulado com métricas de retenção, ou B2B com pipeline documentado. Não posso apostar em 'ainda estamos descobrindo'.' Você tem 7 dias para responder.",
    tags: ["tecnologia"],
    fase: "decisao",
    choices: [
      {
        text: "Apresentar uma estratégia dual clara: B2C enxuto com foco em retenção + B2B como canal secundário crescente",
        risco: "medio",
        gestorEffects: { capitalPolitico: +2 },
        effects: { financeiro: +4, satisfacao: +1, reputacao: +2, inovacao: +1 },
        avaliacao: "boa",
        ensinamento: "Estratégia dual bem documentada com métricas claras é o que investidores experientes querem ver. A honestidade sobre ter dois caminhos em exploração — com dados — é mais confiante do que um pivô forçado."
      },
      {
        text: "Apresentar o B2B como estratégia única — é o que ele quer ouvir e tem o maior potencial de ticket",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +1 },
        effects: { financeiro: +3, satisfacao: -2, reputacao: -1, inovacao: +1 },
        avaliacao: "ruim",
        ensinamento: "Apresentar uma estratégia que você não está 100% comprometido para agradar o investidor é uma armadilha. O desalinhamento aparece em 60 dias — e a confiança que se perde é muito mais cara do que o cheque."
      },
      {
        text: "Recusar o bridge e focar nos próximos 5 meses em chegar ao break-even no B2C com cortes cirúrgicos",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1, esgotamento: +2 },
        effects: { financeiro: +2, satisfacao: -2, clima: -2, produtividade: -1 },
        avaliacao: "media",
        ensinamento: "Break-even sem capital externo exige cortes que podem matar o produto que você está tentando salvar. É viável — mas precisa de um plano de corte muito preciso para não destruir as métricas de retenção que o B2B vai exigir."
      },
      {
        text: "Aceitar o bridge imediatamente e apresentar a estratégia depois — o dinheiro é mais urgente do que o plano",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2 },
        effects: { financeiro: +5, reputacao: -3, satisfacao: 0, inovacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Receber investimento sem apresentar a estratégia é trair a confiança do investidor antes mesmo de começar. Investidores experientes reconhecem quando estão sendo usados como fonte de caixa, não como parceiros."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R11 · DECISÃO CRÍTICA · O Momento do Pivô
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Momento do Pivô",
    description: "Com o bridge aprovado e 9 meses de runway restantes, você precisa definir a alocação dos recursos. O board tem duas posições: metade quer 80% do time focado no B2B para chegar a R$500k MRR em 8 meses. A outra metade quer reformar o produto B2C e recuperar a base. O head de produto alerta: 'Não temos gente para os dois com excelência. Qualquer que seja a escolha, precisamos de 100% de comprometimento.'",
    tags: ["tecnologia"],
    fase: "pressao",
    choices: [
      {
        text: "B2B como prioridade: realocar 70% do time para construir o canal corporativo com o pipeline atual",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +1 },
        effects: { financeiro: +3, inovacao: +3, satisfacao: -3, clima: -1, reputacao: +2 },
        avaliacao: "boa",
        ensinamento: "Quando os recursos são escassos, clareza de prioridade é mais valiosa do que equilíbrio. B2B com ticket 11x maior e receita previsível é a transformação que cria uma empresa sustentável — desde que executado com foco."
      },
      {
        text: "B2C reformulado: investir os recursos na correção de churn e reativação de ex-assinantes",
        risco: "medio",
        effects: { satisfacao: +4, reputacao: +2, inovacao: +2, financeiro: -2, clima: +2 },
        avaliacao: "boa",
        ensinamento: "Recuperar uma base existente custa menos do que construir um novo canal do zero. Se o churn foi por problemas de produto — e não por falta de interesse — a reformulação pode reativar uma base que já confiou na empresa."
      },
      {
        text: "Modelo híbrido: 50% B2B, 50% B2C — não descartar nenhuma aposta enquanto os dados não são conclusivos",
        risco: "medio",
        effects: { financeiro: -1, inovacao: +1, produtividade: -2, qualidade: -2, satisfacao: 0 },
        avaliacao: "ruim",
        ensinamento: "Dividir o time ao meio entre dois modelos opostos garante que nenhum dos dois seja executado com a excelência necessária. Em um momento de decisão estratégica, 'metade de tudo' é o caminho mais seguro para o fracasso em ambas as frentes."
      },
      {
        text: "Vender a base de 94k assinantes para um player maior e usar o caixa para construir o B2B sem pressão de runway",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +2 },
        requisitos: { indicadorMinimo: { financeiro: 7 } },
        effects: { financeiro: +6, satisfacao: -5, reputacao: -3, clima: -2, inovacao: +2 },
        avaliacao: "media",
        ensinamento: "Vender um ativo para financiar uma transição é uma opção legítima — mas sinaliza ao mercado que a empresa desistiu do B2C. O impacto na marca e no time é real e precisa ser gerenciado ativamente."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R12 · DECISÃO CRÍTICA · A Plataforma ou o Conteúdo?
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Plataforma ou o Conteúdo?",
    description: "O orçamento de produto para o próximo semestre precisa ser alocado. O CTO quer R$1,2M para refatorar a plataforma e lançar um app nativo. O head de conteúdo quer R$1M para produzir 40 novos cursos com instrutores de referência. O CFO diz que há R$1,5M disponível para produto no total — não para os dois. Cada área garante que o sucesso da empresa depende da sua prioridade.",
    tags: ["tecnologia"],
    fase: "decisao",
    choices: [
      {
        text: "Investir R$1M na plataforma — sem produto técnico confiável, o conteúdo não chega ao usuário",
        risco: "medio",
        effects: { qualidade: +5, seguranca: +3, produtividade: +2, satisfacao: +2, inovacao: -1, financeiro: -3 },
        avaliacao: "boa",
        ensinamento: "Em uma plataforma digital, a experiência técnica é o produto. Conteúdo excelente em uma plataforma com 4,8s de carregamento perde para conteúdo mediano em uma plataforma rápida e confiável."
      },
      {
        text: "Investir R$900k no conteúdo — os 40 novos cursos ampliam o catálogo e reduzem churn por obsolescência",
        risco: "medio",
        effects: { qualidade: +2, inovacao: +4, satisfacao: +3, reputacao: +2, produtividade: -1, financeiro: -3 },
        avaliacao: "boa",
        ensinamento: "Catálogo relevante e atualizado é o principal driver de retenção em EdTech. Um usuário que encontra cursos novos toda vez que acessa tem razão para continuar pagando."
      },
      {
        text: "Dividir: R$750k para plataforma e R$750k para conteúdo — cobrir os dois com menos",
        risco: "medio",
        effects: { qualidade: +2, inovacao: +2, satisfacao: +1, produtividade: -1, financeiro: -3 },
        avaliacao: "media",
        ensinamento: "Divisão pode ser o caminho quando os dois investimentos são estratégicos e nenhum precisa de resultado imediato. O risco é que R$750k para plataforma e R$750k para conteúdo podem ser insuficientes para gerar o impacto que o negócio precisa."
      },
      {
        text: "Terceirizar o desenvolvimento de plataforma para uma agência e usar o time interno 100% em conteúdo",
        risco: "alto",
        gestorEffects: { esgotamento: +1 },
        effects: { qualidade: -2, inovacao: +3, satisfacao: +2, financeiro: -2, produtividade: -3 },
        avaliacao: "ruim",
        ensinamento: "Terceirizar a plataforma core de uma empresa de tecnologia é ceder o controle do principal ativo técnico. Agências entregam o que você especifica — e especificar bem exige o time técnico que você desviou para conteúdo."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R13 · DECISÃO CRÍTICA · O Acordo com Empresa de RH
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Acordo com Empresa de RH",
    description: "A maior empresa de consultoria de RH do Brasil quer fazer uma parceria de distribuição: eles incluem sua plataforma nos pacotes de benefícios de 80 satisfacao corporativos. Em troca, desconto de 40% no valor da licença e split de receita de 30% para eles. O volume potencial é de 12.000 usuários novos — mas a financeiro por usuário cai para 42% do atual.",
    tags: ["tecnologia"],
    fase: "decisao",
    choices: [
      {
        text: "Aceitar a parceria com limite de volume: máximo de 4.000 usuários para testar o canal antes de escalar",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +3, satisfacao: +3, reputacao: +2, inovacao: +1 },
        avaliacao: "boa",
        ensinamento: "Pilotar uma parceria de distribuição com volume limitado é a abordagem correta. Validar o canal antes de se comprometer com 12.000 usuários protege contra surpresas de comportamento de uso e de custo de suporte."
      },
      {
        text: "Aceitar a parceria integralmente — 12.000 usuários novos resolve o problema de base de uma vez",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +1 },
        effects: { financeiro: +5, satisfacao: +4, reputacao: +3, qualidade: -3, produtividade: -3, clima: -2 },
        avaliacao: "media",
        ensinamento: "12.000 usuários novos em um produto ainda com problemas de plataforma e churn alto é um risco operacional real. Suporte para essa base pode colapsar um time já sobrecarregado."
      },
      {
        text: "Recusar — 40% de desconto e 30% de split destroem a financeiro por usuário",
        risco: "medio",
        effects: { financeiro: 0, reputacao: -1, satisfacao: -1, inovacao: +1 },
        avaliacao: "media",
        ensinamento: "Recusar uma parceria de distribuição por financeiro pode ser correto se a empresa tiver canais alternativos com custo de aquisição menor. Com CAC triplicado no B2C, a parceria pode ser mais eficiente mesmo com a financeiro reduzida."
      },
      {
        text: "Negociar: aceitar com split de 20% (não 30%) e desconto de 30% (não 40%)",
        risco: "baixo",
        effects: { financeiro: +4, satisfacao: +3, reputacao: +2, inovacao: +1, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Toda proposta inicial de parceria tem gordura para negociar. 10 pontos percentuais de split e 10 de desconto a menos podem representar R$200k adicionais de receita por ano — vale a negociação."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R14 · DECISÃO CRÍTICA · A Reestruturação do Time
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Reestruturação do Time",
    description: "Com a direção estratégica definida, é hora de alinhar o time ao novo modelo. O CEO de RH sugere reestruturação: desligar 18 pessoas que não fazem parte do caminho escolhido e contratar 12 perfis específicos para B2B. O CFO aponta que o custo da reestruturação (indenizações + seleção) é de R$820k — mas a economia anual é de R$600k.",
    tags: ["tecnologia"],
    fase: "decisao",
    choices: [
      {
        text: "Fazer a reestruturação com cuidado: comunicação clara, indenizações generosas e suporte de recolocação",
        risco: "medio",
        gestorEffects: { reputacaoInterna: +1, esgotamento: +2 },
        effects: { financeiro: -2, clima: -2, produtividade: +3, qualidade: +2, inovacao: +2 },
        avaliacao: "boa",
        ensinamento: "Reestruturação bem conduzida — com humanidade e transparência — é percebida pelo time que fica como sinal de liderança responsável. O contrário cria trauma cultural que persiste por anos."
      },
      {
        text: "Adiar a reestruturação e realocar internamente as pessoas que não têm perfil B2B",
        risco: "medio",
        effects: { financeiro: -1, clima: +2, produtividade: -2, qualidade: -1, inovacao: -1 },
        avaliacao: "media",
        ensinamento: "Realocação interna preserva as pessoas mas pode colocar profissionais em funções que não são seu ponto forte. O custo humano é menor, mas o custo de performance pode ser maior no longo prazo."
      },
      {
        text: "Fazer a reestruturação rapidamente para minimizar a incerteza — comunicar e executar em 48 horas",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -3, capitalPolitico: -1 },
        effects: { financeiro: +1, clima: -5, produtividade: -3, qualidade: -2, satisfacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Reestruturação executada em 48 horas é percebida como frieza e descaso. O time que fica processa a saída dos colegas — e a forma como foi feita — como sinal de como eles mesmos serão tratados no futuro."
      },
      {
        text: "Contratar os 12 novos perfis antes de desligar os 18 — garantir continuidade antes da transição",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +2 },
        effects: { financeiro: -4, clima: -1, produtividade: +2, inovacao: +3, qualidade: +2 },
        avaliacao: "media",
        ensinamento: "Contratar antes de desligar garante continuidade mas aumenta temporariamente o custo de folha. Com runway apertado, 3 meses de time duplo pode comprometer o plano financeiro."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R15 · DECISÃO FINAL · O Futuro da EdTech
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Futuro da EdTech",
    description: "Você chegou ao final do ciclo estratégico. A empresa sobreviveu à crise de runway, tomou decisões difíceis e precisa agora definir como crescer de forma sustentável. Os dados do último trimestre mostram sinais de estabilização. O board pede uma visão para os próximos 3 anos.",
    tags: ["tecnologia"],
    fase: "decisao",
    choices: [
      {
        text: "Empresa de aprendizagem corporativa: B2B como motor principal, B2C como funil de entrada para empresas",
        effects: { financeiro: +5, reputacao: +4, inovacao: +3, satisfacao: +3, qualidade: +2, clima: +2 },
        avaliacao: "boa",
        ensinamento: "B2B com B2C como funil é o modelo mais eficiente em EdTech: a marca de consumo alimenta a credibilidade corporativa, e o ticket B2B financia a qualidade que retém o B2C. É assim que Coursera e LinkedIn Learning cresceram."
      },
      {
        text: "Plataforma de conteúdo premium: aumentar o preço para R$149/mês e focar em uma base menor e mais engajada",
        effects: { reputacao: +3, satisfacao: +2, inovacao: +4, financeiro: +3, qualidade: +3, clima: +2 },
        avaliacao: "boa",
        ensinamento: "Modelos premium com base menor funcionam quando o produto justifica o preço. Assinantes que pagam mais cancelam menos — a seleção por preço garante uma base com comprometimento real com o aprendizado."
      },
      {
        text: "Marketplace de instrutores: abrir a plataforma para qualquer instrutor brasileiro, focando no volume e na comissão",
        effects: { financeiro: +2, inovacao: +5, satisfacao: -2, qualidade: -4, reputacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Marketplace aberto sem curadoria destrói a consistência de qualidade que é o principal diferencial frente ao Coursera. O modelo Udemy — com mais de 200k cursos de qualidade variável — é difícil de competir no Brasil sem escala massiva."
      },
      {
        text: "Venda estratégica: buscar um acquirer que valorize a base, a tecnologia e o time",
        requisitos: { indicadorMinimo: { reputacao: 10, financeiro: 9 } },
        effects: { financeiro: +7, inovacao: +2, reputacao: +3, satisfacao: +2, clima: +1 },
        avaliacao: "boa",
        ensinamento: "A venda estratégica é uma decisão legítima quando a empresa construiu ativos reais — base de usuários, tecnologia e marca — que têm valor para um acquirer com mais escala. Não é fracasso; é realização de valor construído."
      }
    ]
  }

],

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [2] · Scale-up de IA · Automação Corporativa
   Contexto: 40 satisfacao, R$6,8M ARR, 58 funcionários (maioria
   cientistas de dados), pipeline travado — 60% em "avaliação técnica"
   há mais de 90 dias, 4 vendedores sem experiência enterprise.

   INDICADORES: financeiro:9, clima:4, satisfacao:7, qualidade:6,
                produtividade:5, reputacao:8, inovacao:7, seguranca:6

   ATENÇÃO: inovacao alta (7) é o principal ativo.
   Clima baixo (4) é o principal risco.
   O maior perigo é deixar o produto técnico sobrecarregar as vendas.
══════════════════════════════════════════════════════════════════ */
[

  /* ═══════════════════════════════════════════════════════
     R1 · DIAGNÓSTICO · O Pipeline Travado
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Pipeline Travado",
    description: "Marcos, seu head de vendas, apresenta o mapa do pipeline: 24 oportunidades em negociação, R$4,2M em valor potencial. Mas 60% está em 'avaliação técnica' há mais de 90 dias sem avançar. Ele explica: 'As demos são boas tecnicamente, mas os decisores de negócio — CFOs e CHROs — saem sem entender o ROI concreto. Eles precisam de números, não de arquitetura de IA.' Qual é o diagnóstico e o plano?",
    tags: ["tecnologia"],
    fase: "diagnostico",
    choices: [
      {
        text: "Criar um framework de ROI personalizado para cada oportunidade — calcular o retorno específico para cada cliente antes da próxima reunião",
        risco: "baixo",
        effects: { satisfacao: +3, reputacao: +3, produtividade: -1, financeiro: +1 },
        avaliacao: "boa",
        ensinamento: "Em vendas B2B enterprise, o comprador precisa justificar internamente a decisão. ROI documentado com os números do próprio cliente é o argumento mais poderoso — e diferencia empresas que vendem tecnologia de empresas que vendem resultado."
      },
      {
        text: "Contratar um diretor de vendas enterprise com experiência em SAP ou Oracle para liderar o pipeline",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: -3, satisfacao: +2, reputacao: +2, produtividade: +2 },
        avaliacao: "boa",
        ensinamento: "Vendas enterprise exige um perfil específico que raramente é desenvolvido internamente em startups de produto técnico. Um diretor com rolodex enterprise pode desbloquear o pipeline em semanas."
      },
      {
        text: "Colocar os cientistas de dados nas reuniões de vendas para explicar melhor a tecnologia",
        risco: "medio",
        effects: { qualidade: +2, satisfacao: -2, produtividade: -3, inovacao: -1 },
        avaliacao: "ruim",
        ensinamento: "CFOs e CHROs não tomam decisões baseadas em explicações técnicas mais detalhadas — eles precisam de ROI e cases de sucesso similares. Cientistas de dados em reuniões de negócio geralmente aprofundam o problema que você está tentando resolver."
      },
      {
        text: "Desqualificar as 14 oportunidades mais antigas e focar os recursos nas 10 mais aquecidas",
        risco: "baixo",
        effects: { financeiro: +1, produtividade: +2, satisfacao: 0, reputacao: -1 },
        avaliacao: "media",
        ensinamento: "Foco no pipeline quente é uma tática válida, mas desqualificar sem tentar desbloquear descarta R$2,4M em potencial. O problema não é o prospect — é a abordagem de vendas."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R2 · DIAGNÓSTICO · A Demo que Afasta
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Demo que Afasta",
    description: "Você assiste a uma gravação de demo. O que vê: 45 minutos de arquitetura de IA, gráficos de acurácia de modelos e terminologia técnica que o CHRO da empresa claramente não acompanhou. No final, ele pergunta: 'Isso funciona com o nosso sistema de RH?' A resposta do cientista de dados foi uma explicação de 10 minutos sobre APIs de integração. O CHRO agradeceu e nunca mais respondeu.",
    tags: ["tecnologia"],
    fase: "diagnostico",
    choices: [
      {
        text: "Reformular a demo completamente: começar pelo problema do cliente, mostrar o antes e o depois em 15 minutos",
        risco: "baixo",
        effects: { satisfacao: +4, reputacao: +3, produtividade: -1, inovacao: +1 },
        avaliacao: "boa",
        ensinamento: "A melhor demo começa pelo dor do cliente, não pelo produto. Em 15 minutos mostrando o problema que o cliente reconhece e a solução que ele pode explicar para o board, você fecha mais do que em 45 minutos de arquitetura técnica."
      },
      {
        text: "Criar um deck de casos de uso com ROI por indústria — entregar antes da demo para preparar o decisor",
        risco: "baixo",
        effects: { satisfacao: +3, reputacao: +2, inovacao: +1, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Material de preparação posiciona a conversa antes de acontecer. Um CFO que chega à demo sabendo que empresas similares reduziram custo de processo em 32% já está em modo de avaliação — não de ceticismo."
      },
      {
        text: "Treinar os cientistas de dados em técnicas de storytelling de vendas",
        risco: "medio",
        effects: { produtividade: -2, satisfacao: +1, inovacao: -1, qualidade: -1 },
        avaliacao: "ruim",
        ensinamento: "Treinar técnicos para vender é possível, mas leva meses e raramente atinge a naturalidade de um vendedor experiente. O tempo de treinamento é tempo que o pipeline fica parado."
      },
      {
        text: "Contratar um SE (Sales Engineer) que faz a ponte entre a tecnologia e o negócio nas demos",
        risco: "medio",
        effects: { satisfacao: +3, financeiro: -3, reputacao: +2, produtividade: +1 },
        avaliacao: "boa",
        ensinamento: "O Sales Engineer é o papel mais subestimado em startups de IA. Ele traduz a complexidade técnica em valor de negócio — e é o que estava faltando no seu processo."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R3 · DIAGNÓSTICO · O Concorrente Enterprise Chega
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Concorrente Enterprise Chega",
    description: "Um prospect que estava em negociação avançada informa que vai assinar com a Workday, que acaba de lançar um módulo de automação de RH com IA generativa integrado ao ERP deles. 'É mais caro, mas elimina o risco de integração,' explica o CPO da empresa prospect. Dois outros prospects enviaram mensagens similares na semana. O mercado está observando como você posiciona a empresa diante dos grandes players.",
    tags: ["tecnologia"],
    fase: "diagnostico",
    choices: [
      {
        text: "Posicionar a empresa como especialista vertical — o produto mais profundo para automação de RH do que qualquer ERP generalista",
        risco: "baixo",
        effects: { reputacao: +4, inovacao: +3, satisfacao: +2, financeiro: +1 },
        avaliacao: "boa",
        ensinamento: "ERPs generalistas com IA adicionada são profundos no ERP e rasos na IA. Um especialista vertical tem 10x mais profundidade no problema específico — e essa diferença é defensável e mensurável."
      },
      {
        text: "Oferecer integração nativa com Workday e SAP como feature de diferenciação — 'trabalha com o que você já tem'",
        risco: "medio",
        effects: { satisfacao: +4, inovacao: +2, qualidade: +2, financeiro: -3, produtividade: -3 },
        avaliacao: "boa",
        ensinamento: "Integração com os ERPs do mercado elimina o principal objeção de risco técnico. Empresas que conseguem dizer 'funciona com o seu SAP atual' removem o argumento mais frequente de não-decisão."
      },
      {
        text: "Reduzir o preço para competir com os módulos dos ERPs — ser mais barato é o único diferencial restante",
        risco: "alto",
        effects: { financeiro: -4, reputacao: -3, satisfacao: -1, inovacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Competir com ERP por preço é uma batalha impossível. A Workday tem financeiro para precificar abaixo do custo por anos para ganhar participação de mercado. Startups que entram em guerra de preço com enterprise geralmente saem de caixa, não de market share."
      },
      {
        text: "Focar em empresas que não usam os ERPs grandes — mid-market sem SAP ou Workday é o segmento mais defensável",
        risco: "medio",
        effects: { satisfacao: +3, reputacao: +2, inovacao: +2, financeiro: +1, produtividade: +1 },
        avaliacao: "boa",
        ensinamento: "Segmentação defensável é o maior ativo de uma startup em mercado dominado por grandes players. Mid-market sem ERP é um mercado enorme, menos competitivo e com ciclo de venda mais curto."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R4 · DIAGNÓSTICO · O Cientista de Dados que Quer Mudar
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Cientista de Dados que Quer Mudar",
    description: "Felipe, seu melhor cientista de dados, pede uma conversa: 'Passamos 3 anos construindo modelos que funcionam — e a empresa não consegue vender. Estou recebendo proposta do Mercado Livre para trabalhar em escala real. Aqui sinto que o meu trabalho não chega ao cliente.' Dois outros cientistas demonstram frustração similar em reuniões. O clima está em nível crítico e a produtividade do time técnico ameaça cair.",
    tags: ["tecnologia"],
    fase: "diagnostico",
    choices: [
      {
        text: "Criar um programa interno de 'cientista de dados no cliente' — visitas mensais aos satisfacao para ver o produto em uso",
        risco: "baixo",
        gestorEffects: { reputacaoInterna: +2 },
        effects: { clima: +4, produtividade: +3, qualidade: +2, inovacao: +2 },
        avaliacao: "boa",
        ensinamento: "Conectar o time técnico com o impacto real do trabalho deles é a forma mais eficaz de retenção para cientistas de dados. Ver o modelo rodando no cliente e conversando com o usuário final transforma abstração em propósito."
      },
      {
        text: "Criar trilha de carreira técnica com títulos e salários progressivos independentes de gestão de pessoas",
        risco: "medio",
        effects: { clima: +3, financeiro: -2, produtividade: +2, qualidade: +1 },
        avaliacao: "boa",
        ensinamento: "Cientistas de dados não querem ser gerentes — querem reconhecimento técnico. Trilha dual de carreira (técnica e de gestão) resolve o teto de crescimento sem forçar a migração para funções que não são sua vocação."
      },
      {
        text: "Oferecer equity para os 5 técnicos mais sêniors como retenção de curto prazo",
        risco: "medio",
        effects: { clima: +2, financeiro: -1, produtividade: +1, inovacao: +1 },
        avaliacao: "media",
        ensinamento: "Equity retém no curto prazo mas não resolve a causa: falta de impacto percebido. Se o trabalho continuar parecendo sem resultado, o vesting vira apenas um motivo para adiar a saída — não para ficar."
      },
      {
        text: "Criar um time de skunkworks: Felipe lidera um projeto de IA generativa como lado B — mais liberdade técnica",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { clima: +3, inovacao: +5, produtividade: -3, financeiro: -2, qualidade: -1 },
        avaliacao: "media",
        ensinamento: "Skunkworks pode ser a válvula que mantém o talento — mas tira capacidade do produto principal no pior momento. A inovação dentro de uma empresa em crise precisa de governança para não se tornar distração."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R5 · DIAGNÓSTICO · O Cliente que Cancelou com Dados
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Cliente que Cancelou com Dados",
    description: "A empresa Lógica RH, uma das primeiras satisfacao, notificou cancelamento após 18 meses. O motivo surpreende: 'A acurácia dos modelos é ótima. O problema é que não conseguimos usar o produto no dia a dia — a interface é complexa demais para os nossos analistas de RH.' O relatório interno revela que 60% das features do produto nunca foram usadas pelos satisfacao existentes.",
    tags: ["tecnologia"],
    fase: "diagnostico",
    choices: [
      {
        text: "Reformular a interface priorizando os 40% de features mais usadas — produto mais simples, adoção maior",
        risco: "medio",
        effects: { satisfacao: +4, qualidade: +3, inovacao: -1, produtividade: -2, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Produto complexo que ninguém usa é tecnologia sem valor entregue. Simplificar a interface — com base em dados de uso real — aumenta a adoção que é o único indicador de sucesso do cliente que importa."
      },
      {
        text: "Criar um programa de onboarding estruturado: 4 semanas de treinamento presencial para cada novo cliente",
        risco: "medio",
        effects: { satisfacao: +3, qualidade: +2, financeiro: -3, reputacao: +1, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Onboarding estruturado compensa a complexidade no curto prazo — mas não a elimina. A melhor solução é um produto que não precise de 4 semanas de treinamento para ser usado."
      },
      {
        text: "Manter o produto como está e focar em satisfacao com time técnico de RH mais avançado",
        risco: "medio",
        effects: { satisfacao: -2, reputacao: -1, inovacao: +2, financeiro: 0 },
        avaliacao: "ruim",
        ensinamento: "Segmentar para satisfacao que toleram complexidade é uma estratégia — mas limita severamente o mercado endereçável. RH é uma função que na maioria das empresas não tem time técnico dedicado."
      },
      {
        text: "Contratar um time de UX especializado em produto enterprise para liderar a reformulação de interface",
        risco: "medio",
        effects: { satisfacao: +3, qualidade: +3, financeiro: -4, produtividade: -1, inovacao: +1 },
        avaliacao: "boa",
        ensinamento: "UX enterprise é uma disciplina específica — projetar para analistas de RH que usam o produto por obrigação é completamente diferente de projetar para early adopters entusiastas. A contratação especializada paga dividendos."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R6 · PRESSÃO · A Vertical Certa
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Vertical Certa",
    description: "O board pede uma decisão sobre verticalização. O produto atual atende RH e compliance em qualquer setor — mas sem profundidade em nenhum. Três verticais emergem como candidatas: varejo (maior volume de satisfacao, ticket menor), financeiro (ticket maior, ciclo de venda mais longo, regulação complexa) e manufatura (cadeia de conformidade trabalhista intensa, menor concorrência de IA).",
    tags: ["tecnologia"],
    fase: "pressao",
    choices: [
      {
        text: "Manufatura: menor concorrência, conformidade trabalhista é problema crítico e recorrente, menos sujeito ao hype de IA generativa",
        risco: "baixo",
        effects: { satisfacao: +3, reputacao: +3, inovacao: +2, financeiro: +2, produtividade: +1 },
        avaliacao: "boa",
        ensinamento: "Verticalizar em segmento com menos IA concorrente e problema estrutural crítico é construir um moat defensável. Conformidade trabalhista em manufatura tem consequências regulatórias que forçam a adoção — diferente de 'nice-to-have'."
      },
      {
        text: "Financeiro: ticket maior e as empresas desse setor pagam mais por conformidade e automação",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +2 },
        effects: { financeiro: +3, reputacao: +2, inovacao: +3, satisfacao: -2, produtividade: -3 },
        avaliacao: "media",
        ensinamento: "Financeiro tem o maior ticket — mas também o ciclo de venda mais longo, os processos de compliance mais exigentes e o maior grau de ceticismo com startups de IA. O risco de burn sem converter é real."
      },
      {
        text: "Varejo: volume maior compensa o ticket menor e o ciclo de vendas é mais curto",
        risco: "medio",
        effects: { satisfacao: +2, financeiro: +2, produtividade: +2, reputacao: +1, inovacao: -1 },
        avaliacao: "media",
        ensinamento: "Volume de contratos menores tem valor — mas exige estrutura de CS e suporte que não existe ainda. Varejo tem alta rotatividade de pessoal que cria demanda real, mas o ticket pequeno pode não cobrir o custo de atendimento."
      },
      {
        text: "Não verticalizar — manter o produto horizontal e competir por breadth, não por depth",
        risco: "medio",
        effects: { inovacao: +2, satisfacao: -2, reputacao: -2, produtividade: +1, financeiro: -1 },
        avaliacao: "ruim",
        ensinamento: "Produto horizontal em IA é o espaço que os ERPs gigantes vão ocupar primeiro. Startups de IA que ganham são aquelas que fazem uma coisa melhor do que qualquer empresa grande consegue — e isso requer foco vertical."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R7 · PRESSÃO · SAP Anuncia Módulo Concorrente
  ═══════════════════════════════════════════════════════ */
  {
    title: "SAP Anuncia Módulo Concorrente",
    description: "A SAP anunciou o SAP SuccessFactors AI Automation — módulo que automatiza compliance trabalhista e processos de RH, integrado nativamente ao ERP. Preço: incluído nos contratos enterprise existentes. Seis dos seus 40 satisfacao usam SAP. Três já enviaram e-mail perguntando se faz sentido continuar com você. A imprensa especializada publicou: 'SAP torna startups de automação de RH obsoletas?'",
    tags: ["tecnologia"],
    fase: "pressao",
    choices: [
      {
        text: "Responder com dados: publicar benchmark comparativo mostrando acurácia superior e funcionalidades exclusivas",
        risco: "baixo",
        effects: { reputacao: +4, satisfacao: +3, inovacao: +2, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Dados públicos comparativos são a resposta mais eficiente a anúncios de concorrentes grandes. Comparações objetivas e verificáveis estabelecem credibilidade técnica — e candidatos que pesquisam a categoria confiam mais em benchmarks do que em marketing."
      },
      {
        text: "Ligar para os 6 satisfacao SAP proativamente antes que eles cancelem",
        risco: "baixo",
        gestorEffects: { reputacaoInterna: +1 },
        effects: { satisfacao: +4, reputacao: +2, financeiro: +1, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Contato proativo antes da reclamação é o melhor sinal de parceria que uma empresa de software pode dar. A maioria dos satisfacao não cancela imediatamente — eles esperam ver se a empresa vai reagir."
      },
      {
        text: "Buscar parceria com a SAP para complementar o módulo deles com a profundidade técnica do seu produto",
        risco: "medio",
        gestorEffects: { capitalPolitico: +2 },
        effects: { reputacao: +3, inovacao: +2, financeiro: +2, satisfacao: +2, produtividade: -2 },
        avaliacao: "boa",
        ensinamento: "Parceria com o concorrente-anunciante pode parecer contraintuitivo — mas grandes plataformas precisam de parceiros especializados para preencher lacunas de profundidade. 'Built on SAP' é um posicionamento mais forte do que 'alternativa ao SAP'."
      },
      {
        text: "Ignorar o anúncio — módulos de ERP demoram 2 anos para estar prontos de verdade, o hype é maior que a realidade",
        risco: "alto",
        effects: { satisfacao: -3, reputacao: -3, inovacao: 0, financeiro: -1 },
        avaliacao: "ruim",
        ensinamento: "Ignorar o anúncio da SAP é deixar satisfacao sem resposta quando eles precisam de uma. Mesmo que o produto da SAP leve 2 anos para madurecer, o silêncio da sua empresa hoje é interpretado como confirmação da ameaça."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R8 · PRESSÃO · O Cliente Âncora Quer Mais
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Cliente Âncora Quer Mais",
    description: "A Construtora Andrade, seu maior cliente (R$780k/ano), quer expandir o uso para mais 3 plantas industriais — mas em troca pede desconto de 35% no contrato expandido e features exclusivas de compliance para o setor de construção civil. A expansão geraria R$1,4M adicionais por ano, mas as features exclusivas exigem 4 meses de desenvolvimento dedicado.",
    tags: ["tecnologia"],
    fase: "pressao",
    choices: [
      {
        text: "Aceitar a expansão com desconto de 20% (não 35%) e features que beneficiem todos os satisfacao de manufatura",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +5, satisfacao: +3, reputacao: +2, produtividade: -2, inovacao: +2 },
        avaliacao: "boa",
        ensinamento: "Negociar o desconto e condicionar o desenvolvimento ao benefício de múltiplos satisfacao é a resposta certa. Features exclusivas para um cliente criam dívida técnica que prejudica toda a plataforma — e você paga o custo sem o benefício de escala."
      },
      {
        text: "Aceitar as condições integralmente — R$1,4M adicionais resolve problemas maiores do que o custo de features exclusivas",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +1 },
        effects: { financeiro: +6, satisfacao: +2, reputacao: +1, qualidade: -3, produtividade: -4, inovacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Features exclusivas para o maior cliente é uma armadilha clássica em SaaS. Em 12 meses, o produto está fragmentado entre o que o cliente âncora precisa e o que o mercado precisa — e os dois raramente convergem."
      },
      {
        text: "Recusar o desconto de 35% mas aceitar as features — manter a financeiro mesmo perdendo o deal",
        risco: "medio",
        effects: { financeiro: -1, reputacao: -1, inovacao: +2, produtividade: -2, qualidade: +1 },
        avaliacao: "media",
        ensinamento: "Manter disciplina de preço protege a financeiro e o posicionamento, mas perder R$1,4M em expansão de um cliente satisfeito é custoso. A negociação é o caminho — não a recusa."
      },
      {
        text: "Propor uma joint venture para desenvolver as features: cliente financia, startup entrega e compartilha IP",
        risco: "baixo",
        effects: { financeiro: +3, inovacao: +3, satisfacao: +3, reputacao: +2, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Co-desenvolvimento financiado pelo cliente distribui o risco e cria um case de sucesso conjunto. O cliente se torna co-autor da solução — o que aumenta a adoção e reduz o risco de cancelamento futuro."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R9 · PRESSÃO · O Modelo de IA Generativa Entra em Cena
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Modelo de IA Generativa Entra em Cena",
    description: "O mercado está em euforia com IA generativa e satisfacao potenciais estão perguntando se o produto usa 'ChatGPT' ou algo similar. Sua tecnologia usa modelos preditivos clássicos — mais confiáveis para compliance, mas menos 'sexy' no pitch. O CTO propõe integrar um modelo de linguagem para criar uma interface conversacional. Custo: R$520k e 3 meses. O risco: latência e alucinações do LLM em contexto de compliance.",
    tags: ["tecnologia"],
    fase: "pressao",
    choices: [
      {
        text: "Integrar IA generativa apenas na interface — o usuário conversa com o produto, mas as decisões são dos modelos preditivos confiáveis",
        risco: "medio",
        effects: { inovacao: +4, reputacao: +4, satisfacao: +3, financeiro: -3, seguranca: -1 },
        avaliacao: "boa",
        ensinamento: "Usar IA generativa como interface e modelos preditivos como motor é o design correto para casos de uso críticos. O usuário ganha a experiência conversacional sem os riscos de alucinação em contexto de compliance regulatório."
      },
      {
        text: "Adotar IA generativa completa — é o que o mercado pede e a diferenciação que vai desbloquear o pipeline",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +1 },
        effects: { inovacao: +5, reputacao: +3, seguranca: -4, satisfacao: -2, financeiro: -4 },
        avaliacao: "ruim",
        ensinamento: "IA generativa em compliance trabalhista sem camadas de verificação é um risco regulatório grave. Um erro de LLM que resulta em descumprimento de NR ou não conformidade trabalhista pode destruir a reputação do produto com um único incidente."
      },
      {
        text: "Não integrar — posicionar ativamente a confiabilidade dos modelos preditivos como diferencial frente à euforia do generativo",
        risco: "baixo",
        effects: { inovacao: -1, reputacao: +2, seguranca: +3, satisfacao: +1, financeiro: +1 },
        avaliacao: "boa",
        ensinamento: "Contracorrente inteligente: posicionar-se como 'IA confiável para compliance' em um mercado de hype é uma diferenciação real. Empresas que precisam de auditoria preferem previsibilidade à capacidade generativa."
      },
      {
        text: "Criar um produto separado com IA generativa — manter o produto core intacto e testar o novo em paralelo",
        risco: "medio",
        effects: { inovacao: +3, financeiro: -4, produtividade: -3, qualidade: -1, reputacao: +2 },
        avaliacao: "media",
        ensinamento: "Produto paralelo distribui o risco mas fragmenta o foco e o time. Com os recursos limitados de uma scale-up, dois produtos raramente atingem a excelência que um produto focado consegue."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R10 · DECISÃO CRÍTICA · O Round de Investimento Bate à Porta
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Round de Investimento Bate à Porta",
    description: "Um fundo de venture capital especializado em IA B2B quer liderar uma rodada Serie A de R$18M com valuation de R$60M. A due diligence vai começar em 2 semanas. Os pontos de atenção que o fundo levantou: pipeline com baixa taxa de conversão, clima do time em nível baixo e concentração de receita nos 5 maiores satisfacao (64% do ARR). Você tem 2 semanas para preparar as respostas.",
    tags: ["tecnologia"],
    fase: "decisao",
    choices: [
      {
        text: "Ser completamente transparente com o fundo — apresentar os problemas e o plano de solução",
        risco: "baixo",
        gestorEffects: { capitalPolitico: +2, reputacaoInterna: +1 },
        effects: { reputacao: +4, satisfacao: +1, financeiro: +2 },
        avaliacao: "boa",
        ensinamento: "Fundos de venture experientes valorizam founders que conhecem seus problemas e têm plano claro mais do que founders que escondem as fraquezas. A due diligence vai encontrar tudo de qualquer forma — melhor liderar a narrativa."
      },
      {
        text: "Acelerar 3 conversões de pipeline antes da due diligence para melhorar as métricas",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +2 },
        effects: { financeiro: +3, satisfacao: +2, reputacao: +1, produtividade: -3, qualidade: -2 },
        avaliacao: "media",
        ensinamento: "Converter pipeline acelerando o processo pode criar contratos com expectativas desalinhadas. Clientes que entram por pressão de timing geralmente têm churn mais alto — o que aparece nos próximos relatórios que o fundo vai pedir."
      },
      {
        text: "Negociar com os 5 maiores satisfacao expansões de contrato para diluir a concentração de receita",
        risco: "medio",
        effects: { financeiro: +4, satisfacao: +3, produtividade: -1, reputacao: +2 },
        avaliacao: "boa",
        ensinamento: "Expansão de contratos existentes é a forma mais rápida e confiável de melhorar a concentração de receita. Clientes satisfeitos que expandem sinalizam retenção forte — o dado que fundos de SaaS mais valorizam."
      },
      {
        text: "Pedir mais 4 semanas de due diligence para preparar melhor a empresa",
        risco: "medio",
        effects: { reputacao: -1, financeiro: 0, clima: +2, produtividade: +2 },
        avaliacao: "media",
        ensinamento: "Pedir mais tempo na due diligence raramente é visto negativamente por fundos sérios. O risco é que o fundo pode interpretar como falta de preparo — ou pode ter outros deals na fila."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R11 · DECISÃO CRÍTICA · O Partnership Estratégico
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Partnership Estratégico",
    description: "A consultoria EY quer fazer um partnership de go-to-market: eles indicam a sua plataforma para os satisfacao deles em troca de 15% de comissão e exclusividade de integração com os projetos de transformação de RH deles. Volume potencial: 30 novos satisfacao por ano. A exclusividade, porém, impede parcerias com outras consultorias pelo prazo de 2 anos.",
    tags: ["tecnologia"],
    fase: "pressao",
    choices: [
      {
        text: "Aceitar sem exclusividade — 15% de comissão sim, exclusividade não",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +4, satisfacao: +3, reputacao: +3, inovacao: +1 },
        avaliacao: "boa",
        ensinamento: "Exclusividade de canal por 2 anos é uma das concessões mais perigosas para uma startup em crescimento. As melhores parcerias de distribuição não exigem exclusividade — elas ganham sua lealdade pelo volume."
      },
      {
        text: "Aceitar com exclusividade — 30 satisfacao por ano resolve o problema de pipeline de uma vez",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +1 },
        effects: { financeiro: +5, satisfacao: +4, reputacao: +2, inovacao: -2, produtividade: -1 },
        avaliacao: "media",
        ensinamento: "EY como canal exclusivo é poderoso — até o dia em que eles lançarem seu próprio produto ou deixarem de priorizar o seu. 2 anos de exclusividade é tempo demais para ficar refém de um canal único."
      },
      {
        text: "Recusar e investir em construção de canal próprio de parcerias — menos dependência de um único parceiro",
        risco: "medio",
        effects: { financeiro: -2, inovacao: +2, reputacao: +1, produtividade: -1, satisfacao: 0 },
        avaliacao: "media",
        ensinamento: "Canal próprio de parcerias demora mais para construir mas é mais resiliente. O risco é o tempo — em um mercado que está se consolidando, cada mês sem volume de vendas importa."
      },
      {
        text: "Propor um modelo de parceiro preferencial: EY tem acesso antecipado a features e suporte dedicado sem exclusividade",
        risco: "baixo",
        effects: { financeiro: +3, satisfacao: +3, reputacao: +3, inovacao: +2, produtividade: 0 },
        avaliacao: "boa",
        ensinamento: "Parceiro preferencial dá os benefícios da exclusividade para quem recebe — sem as restrições para quem oferece. É um modelo que consultorias experientes reconhecem como justo e frequentemente aceitam."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R12 · DECISÃO CRÍTICA · A Simplificação do Produto
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Simplificação do Produto",
    description: "O diagnóstico de UX confirmou: 60% das features nunca são usadas. O head de produto propõe uma reformulação radical — reduzir o produto para as 40% de features mais usadas e criar uma experiência completamente nova e intuitiva. O CTO alerta: 'A reformulação vai gerar breaking changes para 8 satisfacao que usam as features que vamos remover.' O head de produto responde: '8 satisfacao em 40 é o custo de evoluir.'",
    tags: ["tecnologia"],
    fase: "decisao",
    choices: [
      {
        text: "Aprovar a reformulação e conversar com os 8 satisfacao afetados antes de executar",
        risco: "medio",
        gestorEffects: { reputacaoInterna: +1 },
        effects: { qualidade: +5, satisfacao: +3, inovacao: +3, produtividade: -2, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Produto mais simples e focado é quase sempre mais adotado do que produto com muitas features. Conversar com os 8 afetados antes — não depois — é a diferença entre um cliente que participa da mudança e um cliente que cancela por surpresa."
      },
      {
        text: "Manter todas as features e criar uma camada de UX mais simples por cima — não remover, simplificar a descoberta",
        risco: "medio",
        effects: { qualidade: +2, satisfacao: +2, inovacao: +1, produtividade: -2, financeiro: -2 },
        avaliacao: "media",
        ensinamento: "UX sobre feature bloat é um compromisso que não resolve a causa. O produto continua complexo por baixo — e a dívida técnica de manter features não usadas continua crescendo."
      },
      {
        text: "Fazer a reformulação apenas para novos satisfacao — manter a versão atual para os satisfacao existentes indefinidamente",
        risco: "alto",
        effects: { qualidade: -1, inovacao: +2, produtividade: -4, financeiro: -3, satisfacao: 0 },
        avaliacao: "ruim",
        ensinamento: "Manter duas versões do produto em paralelo é a decisão mais cara tecnicamente. O time vai gastar o dobro de esforço em cada mudança — e os satisfacao existentes nunca vão migrar por conta própria."
      },
      {
        text: "Fazer um teste A/B: metade dos novos satisfacao usa a versão reformulada por 3 meses antes de decidir",
        risco: "baixo",
        effects: { qualidade: +2, inovacao: +2, satisfacao: +1, produtividade: -1, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Teste controlado antes de breaking change é a abordagem científica correta. 3 meses de dados reais valem mais do que qualquer projeção interna de adoção."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R13 · DECISÃO CRÍTICA · A Equipe de Customer Success
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Equipe de Customer Success",
    description: "O churn dos últimos 6 meses foi de 14% — muito acima dos 7% que o modelo financeiro suporta. O head de CS identifica a causa: satisfacao contratam animados mas ficam sem suporte depois do onboarding. 'Precisamos de 4 CSMs dedicados. Hoje atendo 40 satisfacao sozinho.' A contratação custa R$520k/ano. O CFO apresenta o contra-argumento: 'Cada cliente que sai tira R$170k do ARR. 14% de churn custa R$950k/ano.'",
    tags: ["tecnologia"],
    fase: "decisao",
    choices: [
      {
        text: "Contratar os 4 CSMs e estruturar playbooks de sucesso do cliente para os primeiros 90 dias",
        risco: "medio",
        effects: { satisfacao: +5, reputacao: +3, financeiro: -3, clima: +2, produtividade: +1 },
        avaliacao: "boa",
        ensinamento: "O math é simples: R$520k em CS elimina R$950k de churn. Em SaaS B2B, CS não é um custo — é a função que protege a receita que a empresa já conquistou. Cada cliente retido financia a aquisição do próximo."
      },
      {
        text: "Contratar 2 CSMs e um gerente de CS para estruturar o processo antes de escalar",
        risco: "baixo",
        effects: { satisfacao: +3, reputacao: +2, financeiro: -2, clima: +2, produtividade: +1 },
        avaliacao: "boa",
        ensinamento: "Escalar CS gradualmente com estrutura de gestão é a abordagem correta. Contratar 4 CSMs sem processo os transforma em bombeiros — apagando incêndios sem sistema para preveni-los."
      },
      {
        text: "Criar programa de health score automatizado — identificar satisfacao em risco antes que cancelem",
        risco: "baixo",
        effects: { satisfacao: +2, inovacao: +3, qualidade: +2, financeiro: -1, produtividade: -1 },
        avaliacao: "media",
        ensinamento: "Health score é uma ferramenta poderosa — mas alertar sobre risco sem capacidade de agir não resolve o churn. Precisam das duas coisas: dados para identificar e CS para intervir."
      },
      {
        text: "Não contratar CS — usar o produto para ser tão simples que não precise de suporte humano",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -1 },
        effects: { satisfacao: -3, financeiro: +1, qualidade: +1, inovacao: +1, reputacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Produto self-service é um objetivo nobre — mas em SaaS B2B enterprise, humanos no sucesso do cliente são o padrão do mercado, não uma falha de produto. Clientes que pagam R$100k/ano por contrato esperam relacionamento."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R14 · DECISÃO CRÍTICA · A Aquisição Surge
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Aquisição Surge",
    description: "A Totvs, maior empresa de software de gestão da América Latina, fez uma proposta de aquisição: R$42M por 80% da empresa, com earnout de R$12M se as metas dos próximos 2 anos forem atingidas. A oferta é 6,2x o ARR atual. Os fundadores originais têm posições diferentes: dois querem vender (o produto escala com a base de satisfacao da Totvs), um quer manter a independência.",
    tags: ["tecnologia"],
    fase: "decisao",
    choices: [
      {
        text: "Negociar contra-proposta: 70% de participação a R$50M com earnout maior — manter algum controle e upside",
        risco: "medio",
        gestorEffects: { capitalPolitico: +2 },
        effects: { financeiro: +6, reputacao: +3, inovacao: +2, satisfacao: +2, clima: +1 },
        avaliacao: "boa",
        ensinamento: "Toda proposta de aquisição tem gordura. Negociar participação menor e earnout maior com métricas que você controla é preservar upside sem recusar um exit que pode não voltar."
      },
      {
        text: "Recusar — a Totvs vai engessar o produto nas necessidades dos satisfacao de ERP deles",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1, esgotamento: +2 },
        effects: { financeiro: -1, inovacao: +3, reputacao: +1, clima: -1, produtividade: +2 },
        avaliacao: "media",
        ensinamento: "Recusar aquisição estratégica por medo de perder independência é válido — se você tem um plano claro para criar mais valor sozinho. Sem o plano, a independência pode custar mais do que o controle que você está preservando."
      },
      {
        text: "Aceitar as condições da Totvs integralmente — o acesso à base de 40k satisfacao deles acelera o crescimento em 10x",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +1 },
        effects: { financeiro: +8, satisfacao: +3, reputacao: +2, inovacao: -3, clima: -2 },
        avaliacao: "media",
        ensinamento: "A base de satisfacao da Totvs é o maior ativo estratégico dessa aquisição — mas 80% de uma empresa dentro de uma grande corporação muda radicalmente a cultura e a velocidade. Os 20% que ficam raramente têm a influência que imaginavam."
      },
      {
        text: "Usar a oferta da Totvs como alavanca para reabrir negociações com o fundo de VC que propôs a Serie A",
        risco: "medio",
        effects: { financeiro: +4, reputacao: +3, inovacao: +2, satisfacao: +1, clima: +1 },
        avaliacao: "boa",
        ensinamento: "Uma oferta de aquisição é o melhor argumento de negociação para uma rodada de venture. Ela prova o valor de mercado da empresa e cria urgência real para o investidor — exatamente o que transforma uma conversa em cheque."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R15 · DECISÃO FINAL · O Futuro da IA Corporativa
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Futuro da IA Corporativa",
    description: "O pipeline desbloqueou, o time está mais engajado e o produto ganhou clareza. Você precisa agora definir a estratégia de longo prazo: onde quer estar em 3 anos e como chegar lá.",
    tags: ["tecnologia"],
    fase: "decisao",
    choices: [
      {
        text: "Plataforma vertical de IA para RH e compliance: líder técnico no segmento com os modelos mais precisos do mercado",
        effects: { financeiro: +4, reputacao: +5, inovacao: +5, satisfacao: +3, qualidade: +3, clima: +2 },
        avaliacao: "boa",
        ensinamento: "Liderança técnica vertical é o caminho mais defensável para uma startup de IA. Ser o melhor em um problema específico cria barreiras de dados, de conhecimento de domínio e de relacionamento que os grandes players demoram anos para replicar."
      },
      {
        text: "Marketplace de IA para RH: abrir a plataforma para outros modelos e criar ecossistema de parceiros",
        effects: { inovacao: +5, reputacao: +4, financeiro: +3, satisfacao: +2, qualidade: +1, produtividade: +2 },
        avaliacao: "boa",
        ensinamento: "Plataforma de ecossistema multiplica o valor sem multiplicar o custo de desenvolvimento. Cada parceiro que integra no marketplace traz casos de uso que você não teria capacidade de construir sozinho."
      },
      {
        text: "Expansão internacional: validar o produto no Chile e na Colômbia antes de entrar no México",
        requisitos: { indicadorMinimo: { financeiro: 11, reputacao: 12 } },
        effects: { financeiro: +3, reputacao: +4, inovacao: +3, produtividade: -2, qualidade: -1 },
        avaliacao: "boa",
        ensinamento: "Expansão gradual por mercados com regulação trabalhista similar ao Brasil é a rota correta. Chile e Colômbia têm compliance trabalhista menos complexo — ideal para validar o produto antes do México, que exige localização profunda."
      },
      {
        text: "Infraestrutura de IA: transformar os modelos internos em APIs que qualquer empresa pode usar",
        effects: { inovacao: +5, financeiro: +2, qualidade: +3, satisfacao: -2, reputacao: +2, produtividade: -3 },
        avaliacao: "media",
        ensinamento: "APIs de modelo é uma estratégia de infraestrutura que requer volume massivo para ser sustentável. Empresas que tentam ser 'AWS da IA' sem a escala necessária terminam com produto sem foco e sem cliente dominante."
      }
    ]
  }

]

]; // fim TecnologiaRounds

