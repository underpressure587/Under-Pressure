/* ═══════════════════════════════════════════════════════════════════
   BETA · TECNOLOGIA · ROUNDS EXCLUSIVOS — HISTÓRIA [0]
   Startup SaaS B2B · Dívida técnica, rotatividade e churn

   INDICADORES (8 — exclusivos do setor Tecnologia):
     financeiro    💰  Saúde do caixa / ARR / burn rate
     clima         🧑‍💻  Engajamento e moral do time
     satisfacao    ⭐  NPS / retenção / churn dos clientes
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
    description: "Seu primeiro dia como gestor responsável. Às 9h07, o sistema de monitoramento dispara: a plataforma está fora do ar. Duzentos e trinta clientes não conseguem acessar. O canal de suporte explode com mensagens. O CTO Pedro chega correndo: 'É o módulo de autenticação — o mesmo que está na nossa lista de dívida técnica há 14 meses. Estimamos 3 a 5 horas para restaurar.' Qual é a sua primeira decisão?",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Comunicar proativamente todos os clientes afetados com previsão de retorno e atualizações a cada 30 minutos",
        risco: "baixo",
        effects: { satisfacao: +4, reputacao: +3, clima: +2, qualidade: -1 },
        avaliacao: "boa",
        ensinamento: "Comunicação transparente durante incidentes transforma uma crise técnica em prova de maturidade operacional. Clientes que recebem atualizações frequentes cancelam 60% menos do que os que ficam no silêncio. A percepção de cuidado vale mais que a perfeição técnica."
      },
      {
        text: "Focar 100% do time na resolução técnica sem comunicar clientes — só falar quando estiver resolvido",
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
        text: "Acionar simultaneamente o time técnico para resolução e o CS para comunicação segmentada, priorizando os maiores clientes",
        risco: "baixo",
        effects: { satisfacao: +5, reputacao: +4, clima: +3, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "Paralelizar resolução técnica com comunicação comercial é a resposta de empresas maduras a incidentes. Priorizar os maiores clientes no atendimento reduz risco de churn imediato e demonstra que a empresa conhece o valor de cada relacionamento."
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
    description: "Marina, head de Customer Success, apresenta o relatório da semana: 31 clientes cancelaram em 7 dias — o maior número em 18 meses. Ela traz os motivos mapeados: 68% citam lentidão e instabilidade da plataforma; 19% citam que o concorrente ofereceu preço menor; 13% citam atendimento demorado. 'Temos um problema técnico que está gerando um problema comercial,' ela conclui. 'E se não agirmos em 30 dias, vamos perder mais 80 clientes.' Como você responde?",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Criar força-tarefa técnica dedicada exclusivamente aos gargalos que mais causam lentidão para os clientes em risco de churn",
        effects: { qualidade: +5, satisfacao: +4, produtividade: -2, clima: +2 },
        avaliacao: "boa",
        ensinamento: "Atacar a causa-raiz do churn — o problema técnico — com foco nos clientes mais vulneráveis é a decisão com maior retorno sobre investimento. Cada cliente retido custa 5-7× menos do que adquirir um novo. A força-tarefa cria urgência estruturada, não caos."
      },
      {
        text: "Lançar uma campanha agressiva de aquisição de novos clientes para compensar as perdas",
        effects: { financeiro: -4, satisfacao: -3, reputacao: -2, qualidade: -1 },
        avaliacao: "ruim",
        ensinamento: "Adquirir clientes para compensar churn é matematicamente insustentável: o CAC é 5-7× maior que o custo de retenção, e os novos clientes chegam para a mesma plataforma instável — acelerando o próximo ciclo de cancelamentos com mais pessoas no funil."
      },
      {
        text: "Contratar 3 gerentes de CS adicionais para atendimento personalizado e reduzir o tempo de resposta",
        effects: { financeiro: -4, satisfacao: +3, clima: +1, qualidade: -1 },
        avaliacao: "media",
        ensinamento: "CS adicional resolve o sintoma de atendimento lento (13% dos motivos), mas não toca o problema principal (68% — instabilidade técnica). É um investimento de baixo retorno quando a causa-raiz domina o motivo do churn."
      },
      {
        text: "Ligar pessoalmente para os 10 clientes de maior receita em risco e entender o que os faria ficar",
        effects: { satisfacao: +5, reputacao: +3, clima: +2, financeiro: +1 },
        avaliacao: "boa",
        ensinamento: "Contato direto da liderança com clientes estratégicos em risco demonstra comprometimento difícil de ignorar. A maioria dos clientes não quer apenas resolver o problema técnico — quer saber que a empresa se importa com eles. Essa ligação frequentemente compra as semanas necessárias para a correção técnica."
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
    description: "Um pesquisador de segurança independente envia um e-mail direto para você — não para o suporte: 'Encontrei uma vulnerabilidade de injeção SQL no endpoint de relatórios da sua API. Dados de aproximadamente 4.200 clientes podem ter sido expostos nos últimos 21 dias. Tenho as evidências. Dou 24 horas para uma resposta antes de publicar no meu blog.' Pedro confirma: a falha é real. O time de segurança estima 6 a 8 horas para corrigir completamente.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Responder ao pesquisador imediatamente agradecendo, pedir 72 horas para correção completa e comunicar os clientes afetados em paralelo com transparência total",
        effects: { seguranca: +5, reputacao: +3, satisfacao: +4, financeiro: -2, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "O programa de responsible disclosure existe exatamente para esse cenário. Agradecer pesquisadores de segurança que reportam vulnerabilidades — em vez de tratá-los como ameaças — cria uma relação que pode proteger a empresa no futuro. Clientes que recebem comunicação proativa sobre incidentes de segurança têm taxa de churn 40% menor do que os que descobrem pela imprensa."
      },
      {
        text: "Corrigir a vulnerabilidade nas próximas 6 horas sem comunicar clientes — só agir publicamente se o pesquisador publicar mesmo assim",
        effects: { seguranca: +3, satisfacao: -4, reputacao: -4, qualidade: +3 },
        avaliacao: "ruim",
        ensinamento: "Tratar a comunicação como condicional à publicação externa é uma aposta arriscada com probabilidade quase nula de sucesso. Quando a falha for publicada — e será — a omissão intencional será o maior dano. A LGPD exige notificação à ANPD em até 2 dias úteis após a ciência do incidente."
      },
      {
        text: "Consultar o jurídico antes de qualquer comunicação para entender as implicações legais da LGPD antes de agir",
        effects: { seguranca: +2, satisfacao: -3, reputacao: -2, financeiro: -2 },
        avaliacao: "media",
        ensinamento: "O jurídico precisa estar no loop, mas não pode ser a primeira etapa quando há 24 horas de prazo e dados expostos. Cada hora de atraso amplia a janela de exposição dos dados dos clientes. A sequência correta é: corrigir tecnicamente + comunicar clientes + notificar ANPD + alinhar com jurídico em paralelo."
      },
      {
        text: "Contratar imediatamente uma empresa especializada em resposta a incidentes de segurança para gerenciar o processo completo",
        effects: { seguranca: +4, reputacao: +4, satisfacao: +3, financeiro: -5, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "Especialistas em resposta a incidentes (DFIR) têm playbooks testados para esse cenário exato. O custo financeiro é real, mas o protocolo correto — com linguagem técnica e jurídica precisa, comunicação adequada à ANPD e análise pós-incidente estruturada — reduz significativamente o risco de multa e de perda de clientes enterprise."
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
        ensinamento: "Negociar condições reais com transparência é o que separa empresas que crescem de empresas que implodem em clients enterprise. O Mercato está comprando uma solução, não um número de SLA — e clientes sofisticados reconhecem e respeitam vendedores que não prometem o impossível."
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
     R10 · PRESSÃO · O Pivot para IA
     Contexto: 8ª semana. Uma proposta radical divide a liderança.
     Um dos sócios fundadores quer mudar tudo.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Pivot para IA",
    description: "Rafael, cofundador e diretor técnico sênior, apresenta em reunião de diretoria: 'Vamos perder para os concorrentes se continuarmos nesse produto. Minha proposta é pivotarmos para IA generativa nos próximos 6 meses — abandonar a plataforma atual e desenvolver um produto completamente novo. Tenho 3 clientes enterprise que já disseram que pagariam por isso.' Pedro é contra: 'Nossa equipe não tem expertise em IA. Vai precisar de contratações massivas que não temos dinheiro para fazer.' Beatriz concorda com Rafael. Você precisa decidir.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Rejeitar o pivot completo, mas criar um laboratório de IA interno com 2 engenheiros dedicados para explorar aplicações incrementais no produto atual",
        effects: { inovacao: +4, clima: +3, financeiro: -2, qualidade: +1, produtividade: +1 },
        avaliacao: "boa",
        ensinamento: "A versão inteligente de um pivot é a exploração estruturada: proteger o negócio atual enquanto investe em aprender o território novo. Um laboratório interno constrói expertise sem o risco de abandonar a receita existente. Os 3 clientes de Rafael podem financiar um piloto sem exigir abandono do core."
      },
      {
        text: "Apoiar o pivot completo — Rafael tem visão de produto e 3 clientes interessados é sinal de mercado suficiente",
        effects: { inovacao: +5, financeiro: -6, produtividade: -5, satisfacao: -4, clima: -3 },
        avaliacao: "ruim",
        ensinamento: "Pivots radicais com caixa pressionado, time fragilizado e produto principal gerando churn são apostas de sobrevivência — não de crescimento. Três clientes interessados é sinal de demanda, não de produto validado. O risco de ficar sem receita durante o pivot, com os custos de novo desenvolvimento, é existencial."
      },
      {
        text: "Propor um piloto de 90 dias: desenvolver um produto mínimo de IA para os 3 clientes de Rafael sem tocar no produto atual, e avaliar os resultados antes de decidir sobre o pivot",
        effects: { inovacao: +5, financeiro: -3, produtividade: -2, reputacao: +3, clima: +2 },
        avaliacao: "boa",
        ensinamento: "O piloto estruturado é a abordagem de menor risco para testar uma hipótese de pivot. Noventa dias com 3 clientes pagantes (mesmo a preço reduzido) gera dados reais sobre viabilidade, esforço e product-market fit antes de qualquer comprometimento definitivo de recursos."
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
    description: "A Autoridade Nacional de Proteção de Dados abre formalmente um processo administrativo referente ao incidente de segurança de três semanas atrás. O prazo para apresentar a defesa é de 15 dias úteis. Ao mesmo tempo, dois clientes enterprise recebem o aviso da ANPD diretamente e enviam notificações de rescisão contratual. O jurídico estima que a multa pode variar entre R$ 180 mil e R$ 1,2 milhão dependendo da qualidade da resposta apresentada. Pedro apresenta um plano técnico de adequação que custaria R$ 220 mil e levaria 8 semanas.",
    tags: ["tecnologia"],
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
        ensinamento: "Acordos de conformidade voluntária são reconhecidos pela ANPD como sinal de boa-fé e frequentemente resultam em penalidades menores e cronogramas mais flexíveis. A proatividade no acordo também cria precedente positivo no histórico regulatório da empresa — especialmente importante para contratos com órgãos públicos e clientes enterprise."
      },
      {
        text: "Comunicar publicamente nas redes sociais e no site que a empresa está colaborando totalmente com a ANPD para demonstrar transparência ao mercado",
        effects: { reputacao: -2, satisfacao: -1, seguranca: +1, clima: -1 },
        avaliacao: "ruim",
        ensinamento: "Comunicação pública sobre um processo administrativo em andamento — sem orientação jurídica — pode ser interpretada como reconhecimento de culpa e usado contra a empresa no processo. Transparência com clientes é essencial; publicidade em processo regulatório é perigosa sem protocolo legal cuidadoso."
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
    description: "A nova versão da plataforma — desenvolvida pelos últimos 10 semanas — está 85% concluída. O novo líder técnico Lucas apresenta o estado: 'Temos 43 bugs abertos, sendo 8 classificados como críticos. Com o time atual, precisamos de mais 5 semanas para fechar tudo com qualidade. Mas se lançarmos agora, os clientes vão sentir os problemas e vai parecer a versão anterior.' Os investidores já anunciaram o lançamento para os clientes enterprise como marco do plano. Beatriz diz que esperar mais 5 semanas vai custar 3 contratos que estão condicionados ao lançamento.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Adiar o lançamento geral por 5 semanas e corrigir todos os bugs críticos — comunicar honestamente aos investidores e clientes o motivo do atraso",
        effects: { qualidade: +6, reputacao: +3, satisfacao: +2, clima: +3, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Lançar com 8 bugs críticos é repetir o padrão que causou a crise atual — e desta vez com uma versão nova que os clientes têm expectativa elevada. O custo de 3 contratos adiados é real, mas mensurável. O custo de um lançamento malsucedido que reforça a reputação de instabilidade é muito mais alto e mais difícil de reverter."
      },
      {
        text: "Fazer um lançamento para primeiros adotantes — um grupo de 20 clientes selecionados — e usar o feedback deles para corrigir os últimos bugs antes do lançamento geral em 3 semanas",
        effects: { qualidade: +4, satisfacao: +3, reputacao: +4, produtividade: +2, clima: +2 },
        avaliacao: "boa",
        ensinamento: "O lançamento gradual — beta fechado com clientes selecionados — é uma das práticas mais eficazes em software. Transforma o risco técnico em diferencial comercial (ser cliente acesso antecipado). Os bugs críticos são encontrados em ambiente controlado. E o lançamento geral acontece com mais confiança e menos risco reputacional."
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
/* Histórias 1-9 removidas para teste beta — apenas história [0] ativa */

]; // fim TecnologiaRounds
