/* ═══════════════════════════════════════════════════════
   BETA · INDÚSTRIA · ROUNDS v5.0
   8 indicadores: financeiro, rh, clientes, processos,
                  seguranca, manutencao, qualidade, conformidade
═══════════════════════════════════════════════════════ */

const IndustriaRounds = [
[
  { title: "O Relatório de Segurança",
    description: "Márcio, seu gerente de segurança do trabalho, apresenta dados alarmantes: 14 acidentes com afastamento no último ano — o dobro da média do setor. O IFA está em 18,4 quando o benchmark nacional é 8,2. O Ministério do Trabalho pode iniciar fiscalização a qualquer momento.",
    tags: ["industria"],
    choices: [
      { text:"Mapear as causas-raiz de cada acidente com análise de árvore de falhas antes de qualquer ação", effects:{processos:+4,rh:+2,seguranca:+3}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+1}, ensinamento:"Análise de causa-raiz é o único caminho para eliminar acidentes estruturalmente. Sem entender por que os acidentes acontecem, qualquer investimento em segurança é paliativo." },
      { text:"Contratar empresa de consultoria em segurança do trabalho para auditoria completa", effects:{financeiro:-3,processos:+3,seguranca:+2,conformidade:+2}, avaliacao:"media", ensinamento:"Auditoria externa traz imparcialidade e benchmark de melhores práticas. O risco é o tempo de contratação e diagnóstico — durante o qual o IFA continua elevado." },
      { text:"Investir R$ 800k em EPIs novos e sinalização de segurança imediatamente", effects:{financeiro:-4,processos:+2,rh:-1,seguranca:+2}, avaliacao:"media", gestorEffects:{esgotamento:+1}, ensinamento:"EPIs e sinalização são necessários, mas atacam os sintomas. Se o problema é comportamental, de processo ou de equipamento, o investimento em EPI não muda o IFA estruturalmente." },
      { text:"Aumentar os treinamentos de segurança para toda a força de trabalho", effects:{rh:+3,processos:+2,financeiro:-2,seguranca:+2,conformidade:+1}, avaliacao:"media", ensinamento:"Treinamento é necessário mas não suficiente quando o IFA é o dobro do mercado. Acidentes frequentemente acontecem por falha de processo ou equipamento inadequado." }
    ]
  },
  { title: "A Máquina Mais Crítica Parou",
    description: "A prensa hidráulica principal — responsável por 60% da produção — parou por falha no sistema hidráulico. A peça para reparo tem 45 dias de prazo de importação. A alternativa é um reparo provisório que dura estimados 30 dias, custando R$ 95k, com risco de parada total novamente.",
    tags: ["industria"],
    choices: [
      { text:"Pedir o reparo provisório e pedir a peça original simultaneamente para garantir continuidade", effects:{financeiro:-4,processos:+5,clientes:+2,manutencao:+3}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+1}, ensinamento:"Solução em paralelo garante produção enquanto a peça correta chega. Em indústria, parar a linha é a decisão mais cara — mesmo um reparo provisório com custo extra vale para manter os contratos." },
      { text:"Aguardar os 45 dias pela peça original sem fazer o reparo provisório", effects:{clientes:-5,financeiro:-3,rh:-2,manutencao:-2}, avaliacao:"ruim", gestorEffects:{capitalPolitico:-1,esgotamento:+1}, ensinamento:"Parar 60% da produção por 45 dias para esperar a peça certa destrói contratos e moral do time. O custo de manter a linha rodando com reparo provisório é sempre menor que o custo de parar." },
      { text:"Subcontratar a produção das peças para um concorrente durante os 45 dias de espera", effects:{financeiro:-5,clientes:+4,processos:-1,qualidade:-1}, avaliacao:"boa", ensinamento:"Subcontratação emergencial mantém os clientes abastecidos mesmo sem capacidade própria. O custo é maior, mas preserva o relacionamento e a receita dos contratos críticos." },
      { text:"Comunicar os clientes sobre a parada e negociar atraso no prazo de entrega", effects:{clientes:-3,financeiro:-2,conformidade:-1}, avaliacao:"media", ensinamento:"Transparência com clientes industriais é positiva, mas entrega atrasada em indústria frequentemente gera penalidade contratual e abre a porta para o cliente buscar fornecedores alternativos." }
    ]
  },
  { title: "A ISO 9001 Está em Risco",
    description: "A auditoria de manutenção da ISO 9001 identificou 4 não-conformidades críticas: rastreabilidade de matéria-prima incompleta, registros de calibração em atraso em 3 equipamentos, e procedimentos de inspeção desatualizados. A certificadora deu 90 dias para correção ou a certificação será suspensa. Dois clientes exigem ISO como condição de contrato.",
    tags: ["industria"],
    choices: [
      { risco:"baixo", text:"Montar força-tarefa interna com os responsáveis de cada área para corrigir em 60 dias", effects:{processos:+6,rh:+2,financeiro:-1,qualidade:+4,conformidade:+5}, avaliacao:"boa", ensinamento:"Força-tarefa com prazo claro e responsáveis definidos é a forma mais eficiente de corrigir não-conformidades de ISO. O engajamento interno cria conhecimento que consultoria externa não deixa." },
      { risco:"medio", text:"Contratar consultoria de qualidade para corrigir as não-conformidades e preparar a reauditoria", effects:{financeiro:-4,processos:+5,qualidade:+3,conformidade:+4}, avaliacao:"media", ensinamento:"Consultoria de qualidade é mais rápida na correção mas cria dependência. Se as pessoas internas não aprendem os requisitos, a próxima auditoria vai encontrar os mesmos problemas." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-1,capitalPolitico:-2}, text:"Comunicar os dois clientes sobre o risco e propor contrato de qualidade alternativo temporário", effects:{clientes:-4,processos:+1,conformidade:-3}, avaliacao:"ruim", ensinamento:"Informar clientes que exigem ISO de que a certificação está em risco antes de resolver o problema é antecipar a crise sem solução. Corrija primeiro, comunique depois." },
      { text:"Terceirizar o processo de documentação de qualidade para resolver as não-conformidades burocráticas", effects:{processos:+3,financeiro:-3,rh:-2,qualidade:+1,conformidade:+2}, avaliacao:"media", ensinamento:"Terceirizar documentação de qualidade resolve o papel, mas não o processo. A certificadora vai auditar a operação real, não os documentos." }
    ]
  },
  { title: "Custo de Energia em Alta Histórica",
    description: "A conta de energia elétrica subiu 68% nos últimos 18 meses, representando agora 23% do custo de produção. O time de engenharia identificou que os equipamentos mais antigos consomem 40% mais energia que os equivalentes modernos.",
    tags: ["industria"],
    choices: [
      { text:"Investir em energia solar — 1.200 painéis cobrem 55% do consumo atual com payback de 4,5 anos", effects:{financeiro:-6,processos:+5,clientes:+2,conformidade:+2}, avaliacao:"boa", ensinamento:"Energia solar em indústria tem payback comprovado e cria previsibilidade de custo. A volatilidade tarifária desaparece para a parcela coberta pelos painéis." },
      { text:"Migrar para o mercado livre de energia elétrica e negociar contrato de 5 anos com gerador próprio", effects:{financeiro:+3,processos:+3,clientes:+1,manutencao:+1}, avaliacao:"boa", gestorEffects:{capitalPolitico:+1}, ensinamento:"Mercado livre de energia é a alavanca mais rápida para redução de custo de eletricidade em grandes consumidores industriais. A redução média é de 15 a 25% em relação à tarifa cativa." },
      { text:"Substituir os 5 equipamentos mais antigos por versões modernas 40% mais eficientes", effects:{financeiro:-5,processos:+4,rh:-1,manutencao:+4}, avaliacao:"boa", ensinamento:"Equipamentos modernos pagam a diferença de energia em 3 a 5 anos na maioria dos casos industriais. A substituição ataca a causa-raiz do consumo excessivo." },
      { text:"Reduzir o turno de produção para horários de tarifa reduzida e aumentar estoque", effects:{financeiro:+2,processos:-3,rh:-3,qualidade:-1}, avaliacao:"ruim", gestorEffects:{reputacaoInterna:-1,esgotamento:+1}, ensinamento:"Adaptar o horário de produção à tarifa cria rigidez operacional e deteriora o time. O custo de estoque adicional e horas extras frequentemente supera a economia de energia." }
    ]
  },
  { title: "O Maior Cliente Exige Certificação de Sustentabilidade",
    description: "Seu maior cliente industrial comunicou que, a partir de 2026, exige de todos os fornecedores certificação de sustentabilidade ESG. O prazo é 14 meses. Sem a certificação, o contrato de R$ 4,2M/ano não será renovado.",
    tags: ["industria"],
    choices: [
      { risco:"medio", text:"Iniciar o processo de certificação ESG imediatamente com consultoria especializada", effects:{processos:+5,financeiro:-4,clientes:+3,conformidade:+4}, avaliacao:"boa", ensinamento:"14 meses é prazo apertado para certificação ESG em indústria. Iniciar agora com consultoria especializada é a decisão correta — cada mês de atraso comprime o prazo de um processo que não perdoa atalhos." },
      { risco:"baixo", gestorEffects:{reputacaoInterna:+1}, text:"Mapear internamente os requisitos e construir o sistema de gestão com a equipe própria", effects:{processos:+3,financeiro:-2,rh:+2,conformidade:+3}, avaliacao:"boa", ensinamento:"Construção interna cria conhecimento duradouro e engajamento do time. O risco é a inexperiência em certificação ESG gerar retrabalho e perder o prazo do contrato." },
      { risco:"medio", gestorEffects:{capitalPolitico:-1}, text:"Negociar com o cliente uma extensão de 6 meses do prazo para adequação", effects:{clientes:-2,processos:+2,conformidade:+1}, avaliacao:"media", ensinamento:"Pedir prazo adicional demonstra boa fé, mas em ESG, o cliente está atendendo pressão dos próprios investidores. Clientes frequentemente não têm flexibilidade para conceder extensões nessas condições." },
      { text:"Avaliar se o custo de certificação justifica o contrato ou se é melhor buscar novos clientes sem exigência ESG", effects:{clientes:-4,financeiro:-2,conformidade:-2}, avaliacao:"ruim", ensinamento:"ESG está se tornando requisito universal no mercado industrial, não diferencial de clientes específicos. Fugir da certificação hoje é perder mais contratos amanhã." }
    ]
  },
  { title: "Acidente Grave com Afastamento de 60 Dias",
    description: "Um funcionário do setor de prensagem sofreu acidente grave com amputação parcial de dois dedos. O CIPA foi acionado, a CAT foi emitida e o processo de investigação está em curso. A operação da prensa foi suspensa preventivamente. O Ministério do Trabalho comunicou inspeção em 72 horas.",
    tags: ["industria"],
    choices: [
      { text:"Suspender toda a linha de prensagem, acionar a investigação interna e preparar a documentação para o MTE", effects:{processos:+5,rh:+3,financeiro:-3,clientes:-2,seguranca:+4,conformidade:+3}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+1}, ensinamento:"Cooperação total com o Ministério do Trabalho é a postura que reduz o risco de autuação severa. Suspender a linha proativamente demonstra compromisso com segurança além do mínimo legal." },
      { text:"Retomar a operação com reforço de supervisão enquanto a investigação corre", effects:{clientes:+1,processos:-5,rh:-5,seguranca:-4,conformidade:-3}, avaliacao:"ruim", gestorEffects:{reputacaoInterna:-2,capitalPolitico:-1}, ensinamento:"Retomar operação no equipamento envolvido no acidente antes da investigação é imprudente juridicamente e moralmente. O MTE pode multar e interditar a planta inteira se perceber negligência pós-acidente." },
      { text:"Contratar advogado trabalhista e preparar defesa antes da inspeção do MTE", effects:{financeiro:-3,processos:+2,rh:-2,conformidade:+1}, avaliacao:"media", ensinamento:"Suporte jurídico é necessário, mas a postura não pode ser apenas defensiva. O MTE avalia o comportamento pós-acidente — empresa que se prepara para se defender antes de investigar a causa envia o sinal errado." },
      { text:"Comunicar ao funcionário e à família o suporte integral da empresa e anunciar revisão de todo o processo produtivo", effects:{rh:+6,processos:+3,clientes:+1,financeiro:-2,seguranca:+3}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+2}, ensinamento:"Suporte genuíno ao trabalhador acidentado e comprometimento público com mudança são as atitudes que constroem cultura de segurança real. Empresas que tratam acidentes com burocracia têm o próximo acidente mais cedo." }
    ]
  },
  { title: "O Principal Engenheiro Quer Aposentar em 6 Meses",
    description: "Roberto, engenheiro sênior com 26 anos de empresa, é o único que domina completamente a manutenção dos equipamentos mais antigos. Ele quer se aposentar em 6 meses. O conhecimento que ele carrega não está documentado em nenhum lugar.",
    tags: ["industria"],
    choices: [
      { text:"Criar programa de mentoria intensiva: Roberto treina 2 engenheiros júnior nos próximos 6 meses", effects:{rh:+5,processos:+5,financeiro:-2,manutencao:+3}, avaliacao:"boa", ensinamento:"Mentoria intensiva é a forma mais eficiente de transferir conhecimento tácito. Conhecimento de manutenção industrial não se documenta — se demonstra e pratica." },
      { text:"Contratar engenheiro sênior externo para absorver o conhecimento de Roberto nos 6 meses", effects:{financeiro:-4,processos:+3,rh:+1,manutencao:+2}, avaliacao:"media", ensinamento:"Contratar experiência externa é mais rápido que treinar do zero, mas absorver 26 anos de conhecimento específico daquela planta em 6 meses é ambicioso." },
      { text:"Propor à Roberto estender por mais 2 anos com aumento de 30% e redução para 20h semanais", effects:{financeiro:-3,rh:+3,processos:+4,manutencao:+4}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+1}, ensinamento:"Regime de meio período como consultor-sênior é solução elegante para especialistas próximos da aposentadoria. Preserva o acesso ao conhecimento enquanto a transferência acontece com menos urgência." },
      { text:"Mapear e documentar os procedimentos de manutenção em vídeo e manual antes que ele saia", effects:{processos:+3,rh:-1,manutencao:+1}, avaliacao:"media", ensinamento:"Documentação é necessária mas não suficiente para conhecimento técnico profundo. Manutenção industrial tem dimensão tácita que vídeo não captura — a decisão em campo vem da experiência acumulada." }
    ]
  },
  { title: "Cliente Exige Redução de Prazo de Entrega de 30 para 15 Dias",
    description: "O cliente que representa 28% da receita exige redução do prazo de entrega de 30 para 15 dias a partir do próximo contrato. A produção atual não suporta esse ritmo sem investimento em capacidade ou redesenho do processo produtivo.",
    tags: ["industria"],
    choices: [
      { text:"Investir em sistema de produção puxada (kanban) para reduzir o lead time de 30 para 18 dias", effects:{processos:+6,financeiro:-3,clientes:+3,qualidade:+2}, avaliacao:"boa", gestorEffects:{capitalPolitico:+1}, ensinamento:"Lean manufacturing e kanban são o padrão para redução de lead time em indústria. A produção puxada elimina o estoque intermediário e reduz o tempo de ciclo sem necessariamente aumentar a capacidade total." },
      { text:"Manter estoque avançado dos produtos mais pedidos pelo cliente para entrega em 5 dias", effects:{financeiro:-4,clientes:+5,processos:+2,qualidade:+1}, avaliacao:"boa", ensinamento:"Estoque avançado dedicado é solução rápida para redução de prazo percebido pelo cliente. O custo de capital imobilizado em estoque precisa ser comparado ao valor do contrato que será mantido ou perdido." },
      { text:"Recusar a redução de prazo e apresentar benchmark do mercado para demonstrar que 30 dias é competitivo", effects:{clientes:-5,financeiro:-3,conformidade:-1}, avaliacao:"ruim", gestorEffects:{capitalPolitico:-1,esgotamento:+1}, ensinamento:"Argumentar com benchmark em vez de buscar a solução é postura que deteriora o relacionamento. O cliente sabe o que o mercado dele exige melhor do que qualquer benchmark setorial." },
      { text:"Aceitar os 15 dias para o próximo contrato e iniciar urgentemente o redesenho do processo produtivo", effects:{processos:-3,clientes:+3,rh:-3,financeiro:-2,qualidade:-2}, avaliacao:"media", ensinamento:"Aceitar sem estar pronto cria risco de descumprimento. Se o redesenho do processo levar mais tempo do que o prazo do contrato, você entrega atrasado e ainda perde a confiança do cliente." }
    ]
  },
  { title: "Greve Geral na Categoria",
    description: "O sindicato dos metalúrgicos decretou greve geral na categoria por 5 dias, exigindo reajuste de 12% acima da inflação. A câmara de arbitragem mediará em 72 horas. Sua empresa tem 310 funcionários — se eles aderirem, 40% da produção do mês estará comprometida.",
    tags: ["industria"],
    choices: [
      { text:"Participar ativamente da negociação patronal coletiva pela câmara de arbitragem", effects:{rh:+4,processos:+3,financeiro:-2,conformidade:+1}, avaliacao:"boa", ensinamento:"Negociação coletiva com mediação é mais eficiente que gestão individual de greve. Acordos coletivos têm mais legitimidade junto ao sindicato e ao time." },
      { text:"Antecipar acordo interno com os funcionários antes que a greve chegue à sua planta", effects:{rh:+6,financeiro:-4,processos:+2,seguranca:+1}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+2}, ensinamento:"Antecipar o acordo individualmente cria um sinal de valorização do time que vai além do salário. Funcionários que percebem que a empresa foi ao seu encontro antes da pressão têm nível de lealdade muito maior." },
      { text:"Aguardar o resultado da câmara sem ação prévia — mover antes é pagar mais desnecessariamente", effects:{rh:-3,clientes:-2,financeiro:+1}, avaliacao:"media", ensinamento:"Aguardar o resultado coletivo é financeiramente racional, mas o time percebe que a empresa só cedeu por pressão — não por reconhecimento. O custo de engajamento da passividade é real." },
      { text:"Declarar serviços essenciais e exigir manutenção de 60% da operação com base jurídica", effects:{rh:-6,processos:-3,financeiro:-2,conformidade:-2}, avaliacao:"ruim", gestorEffects:{reputacaoInterna:-2,esgotamento:+1}, ensinamento:"Em indústria metalúrgica, caracterizar serviços essenciais é juridicamente controverso e cria confronto que dura além da greve. Times que se sentem tratados como adversários entregam menos depois do conflito." }
    ]
  },
  { title: "Matéria-Prima Importada com Dólar em Alta",
    description: "O dólar subiu 34% em 8 meses. O aço importado que você usa em 40% dos produtos subiu junto. Seu custo de matéria-prima aumentou R$ 1,1M/mês. Os contratos com clientes têm preço fixo pelos próximos 6 meses.",
    tags: ["industria"],
    choices: [
      { text:"Negociar com os clientes uma cláusula de reajuste por variação cambial nos próximos 30 dias", effects:{clientes:-2,financeiro:+4,processos:+3,conformidade:+1}, avaliacao:"boa", gestorEffects:{capitalPolitico:+1}, ensinamento:"Cláusula de variação cambial é prática de mercado em contratos industriais de longo prazo. Clientes industriais entendem a dinâmica — a negociação é mais viável do que parece quando o argumento é transparente." },
      { text:"Buscar substitutos nacionais de aço para reduzir a exposição cambial", effects:{financeiro:+3,processos:-2,clientes:-1,qualidade:-1}, avaliacao:"boa", ensinamento:"Diversificação de matéria-prima reduz exposição cambial estruturalmente. O custo de desenvolvimento do fornecedor nacional é real, mas a independência do câmbio vale o investimento." },
      { text:"Contratar hedge cambial para travar o custo do dólar pelos próximos 12 meses", effects:{financeiro:+2,processos:+3,conformidade:+1}, avaliacao:"boa", ensinamento:"Hedge cambial é ferramenta padrão para empresas com custos em dólar e receita em real. O custo do hedge é previsível — muito melhor do que absorver a volatilidade cambial na margem operacional." },
      { text:"Absorver o custo por 6 meses e recuperar a margem na renovação dos contratos", effects:{financeiro:-6,processos:-1,manutencao:-1}, avaliacao:"ruim", gestorEffects:{esgotamento:+1}, ensinamento:"Absorver R$ 1,1M/mês por 6 meses são R$ 6,6M de caixa queimado. Em indústria, margem operacional negativa por um trimestre pode comprometer investimentos em segurança, manutenção e pessoal." }
    ]
  },
  { title: "Proposta de Automação Total da Linha de Prensagem",
    description: "Uma integradora industrial apresentou proposta de automação completa da linha de prensagem com braços robóticos: elimina 45 postos de operação, reduz o custo por peça em 38%, aumenta a precisão em 62% e elimina o risco de acidente nessa linha. Investimento de R$ 6,8M com payback projetado de 5 anos.",
    tags: ["industria"],
    choices: [
      { text:"Aceitar com plano de requalificação: os 45 operadores migram para manutenção, qualidade e programação", effects:{processos:+7,financeiro:-4,rh:-2,clientes:+3,seguranca:+5,qualidade:+4}, avaliacao:"boa", ensinamento:"Automação com requalificação é o caminho mais sustentável. Operadores que conhecem a linha são os mais rápidos de treinar para manutenção dos robôs." },
      { text:"Implementar automação apenas nas 3 operações com maior índice de acidente, não a linha completa", effects:{processos:+4,financeiro:-3,rh:-1,clientes:+1,seguranca:+4}, avaliacao:"boa", ensinamento:"Automação seletiva dos pontos críticos de segurança equilibra investimento e resultado. Reduz o risco de acidente onde ele é mais frequente sem comprometer o modelo de emprego atual integralmente." },
      { text:"Recusar — R$ 6,8M é capital que pode ser usado para ampliação de capacidade e novos contratos", effects:{financeiro:+2,processos:-3,rh:+3,seguranca:-1}, avaliacao:"media", ensinamento:"Recusar automação industrial em linha crítica por alocação de capital é decisão que precisa de análise rigorosa. 5 anos de payback com 38% de redução de custo e zero acidente é difícil de superar." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-3,capitalPolitico:+2}, text:"Implementar a automação e desligar os 45 operadores com pacote de indenização", requisitos:{semFlags:["lideranca_toxica","demissao_em_massa"]}, effects:{processos:+7,rh:-7,financeiro:-6,clientes:+2,seguranca:+4}, avaliacao:"ruim", ensinamento:"Desligamento em massa sem requalificação tem custo jurídico, de reputação e operacional. Indenizações de 45 trabalhadores com tempo de casa elevado podem consumir parte significativa da economia projetada." }
    ]
  },
  { title: "Oportunidade de Exportar para a América Latina",
    description: "Um distribuidor argentino quer importar seus produtos para Argentina, Chile e Paraguai. Potencial de R$ 2,8M adicionais por ano. A operação exige adaptação de embalagem, certificações de conformidade em cada país e capacidade produtiva adicional de 18%.",
    tags: ["industria"],
    choices: [
      { text:"Aceitar com piloto de 12 meses só para Argentina — o menor dos três mercados com menor complexidade", effects:{financeiro:+3,clientes:+3,processos:+2,conformidade:+2}, avaliacao:"boa", gestorEffects:{capitalPolitico:+1}, ensinamento:"Piloto em um mercado antes de comprometer toda a operação de exportação é a forma mais inteligente de aprender. Argentina tem complexidade regulatória menor que os outros dois para metalúrgica." },
      { risco:"alto", gestorEffects:{capitalPolitico:+2,esgotamento:+2}, text:"Aceitar os três mercados e contratar a integradora para ampliar a capacidade em 18%", requisitos:{indicadorMinimo:{financeiro:9},semFlags:["crescimento_sem_caixa"]}, effects:{financeiro:-4,clientes:+5,processos:-3,rh:-2,qualidade:-1}, avaliacao:"media", ensinamento:"Ampliar capacidade para exportar sem ter validado o canal de distribuição é risco real. Contratos de exportação frequentemente enfrentam barreiras regulatórias e logísticas que projeções não capturam." },
      { text:"Recusar — a operação atual tem problemas suficientes para focar antes de exportar", effects:{processos:+3,clientes:-2,manutencao:+1}, avaliacao:"media", ensinamento:"Disciplina de não expandir antes de resolver operação existente é válida. Mas exportação pode trazer receita em dólar que contrabalance os custos de importação de matéria-prima." },
      { text:"Aceitar e usar parte da receita de exportação para financiar a modernização dos equipamentos", effects:{financeiro:+4,processos:+3,clientes:+3,rh:-1,manutencao:+3}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+1}, ensinamento:"Usar receita incremental de exportação para financiar modernização cria ciclo virtuoso sem comprometer o caixa operacional. A disciplina de alocar a receita nova para investimento evita que ela se dissolva no custo corrente." }
    ]
  },
  { title: "Fusão com Metalúrgica Complementar",
    description: "Uma metalúrgica da região produz os componentes que você hoje compra de terceiros a preço de mercado. O dono quer se aposentar e vender por R$ 4,5M. A integração vertical elimina R$ 780k/ano de custo de aquisição. Mas a empresa tem 85 funcionários, equipamentos de qualidade mista e cultura muito diferente da sua.",
    tags: ["industria"],
    choices: [
      { text:"Adquirir apenas os ativos produtivos (equipamentos e patentes) sem incorporar toda a empresa", effects:{financeiro:-3,processos:+4,rh:-1,manutencao:+2}, avaliacao:"boa", ensinamento:"Aquisição de ativos sem a empresa elimina o custo de integração cultural e trabalhista. O risco é perder os operadores que conhecem como operar esses ativos de forma eficiente." },
      { text:"Fazer due diligence rigorosa por 60 dias antes de qualquer decisão", effects:{processos:+3,financeiro:-1,conformidade:+2}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+1}, ensinamento:"Due diligence em metalúrgica precisa avaliar passivo trabalhista, ambiental e de segurança — não apenas os ativos. Empresas do setor frequentemente têm contingências que não aparecem no balanço." },
      { text:"Aceitar a fusão completa e integrar as culturas ao longo de 12 meses", effects:{financeiro:-5,processos:-3,rh:-4,qualidade:-1,seguranca:-1}, avaliacao:"media", gestorEffects:{esgotamento:+2}, ensinamento:"Fusão completa é a solução mais rápida para a integração vertical, mas integrar 85 funcionários com cultura diferente enquanto a sua operação está em transformação é risco alto de disfunção nos dois lados." },
      { text:"Propor parceria de fornecimento preferencial sem aquisição — exclusividade por 5 anos", effects:{financeiro:+2,processos:+3,clientes:+1,qualidade:+1}, avaliacao:"boa", ensinamento:"Parceria de fornecimento exclusivo captura parte do benefício de integração vertical sem o custo e o risco da aquisição. O risco é o fornecedor ser vendido para terceiro que desfaz a exclusividade." }
    ]
  },
  { title: "Investidor Propõe Transformação em Indústria 4.0",
    description: "Um fundo de infraestrutura quer investir R$ 9M em troca de 30% da empresa para transformar a planta em referência de Indústria 4.0: sensores IoT em todos os equipamentos, manutenção preditiva, ERP integrado e dashboard em tempo real. O projeto levaria 18 meses para estar operacional.",
    tags: ["industria"],
    choices: [
      { text:"Aceitar com condição de 18% da empresa e plano de governança que preserve a autonomia operacional", effects:{financeiro:+6,processos:+6,rh:+2,clientes:+3,manutencao:+4,conformidade:+3}, avaliacao:"boa", gestorEffects:{capitalPolitico:+1}, ensinamento:"Negociar a participação e a governança antes de aceitar capital é a postura correta. Indústria 4.0 com capital externo pode transformar completamente a competitividade — se os termos protegerem a operação." },
      { text:"Aceitar as condições integralmente — R$ 9M resolve todos os problemas de uma vez", effects:{financeiro:+7,processos:+4,rh:-3,clientes:+2,manutencao:+3}, avaliacao:"media", ensinamento:"Capital resolve investimento mas não resolve cultura e execução. 30% de participação com fundo de infraestrutura geralmente vem com exigências de resultado que podem conflitar com a realidade operacional de 18 meses." },
      { text:"Recusar e implementar IoT em etapas com recursos próprios nos próximos 3 anos", effects:{financeiro:-3,processos:+3,rh:+1,manutencao:+2}, avaliacao:"media", ensinamento:"Implementação própria preserva o controle mas é mais lenta e fragmentada. Em mercados industriais competitivos, 3 anos sem transformação digital é tempo suficiente para perder clientes que exigem rastreabilidade." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-4,capitalPolitico:+2}, text:"Aceitar e demitir 40% do time para pagar o retorno esperado pelo fundo em 5 anos", requisitos:{semFlags:["gestor_de_crise"]}, effects:{financeiro:+3,rh:-8,processos:-3,clientes:-2,seguranca:-3}, avaliacao:"ruim", ensinamento:"Corte de pessoal para pagar retorno de fundo é a sequência mais destrutiva em transformação industrial. A Indústria 4.0 precisa de pessoas que entendem os equipamentos para operar e manter os sistemas inteligentes." }
    ]
  },
  { title: "O Legado Industrial: Que Empresa Você Quer Deixar?",
    description: "Após um ciclo de transformações intensas, você precisa definir a estratégia para os próximos 5 anos. O mercado industrial está em ponto de inflexão: automação, ESG e digitalização estão redefinindo quem sobrevive.",
    tags: ["industria"],
    choices: [
      { text:"Indústria de precisão: especializando em componentes de alta complexidade com margem premium", effects:{financeiro:+5,clientes:+5,processos:+6,rh:+3,qualidade:+5,conformidade:+3}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+1,capitalPolitico:+1}, ensinamento:"Especialização em componentes de alta precisão cria barreiras técnicas que commodities não têm. Clientes que precisam de peças críticas de qualidade certificada têm baixa elasticidade de preço e alta fidelidade." },
      { text:"Fornecedora sustentável: certificação ESG completa como diferencial competitivo em contratos públicos e multinacionais", effects:{financeiro:+3,clientes:+4,processos:+5,rh:+4,seguranca:+3,conformidade:+5}, avaliacao:"boa", ensinamento:"ESG como estratégia central de posicionamento abre portas para clientes multinacionais e licitações públicas. A certificação antecipada vira vantagem enquanto os concorrentes correm para se adequar." },
      { risco:"alto", gestorEffects:{capitalPolitico:+2,esgotamento:+3}, text:"Crescimento por aquisição: comprar metalúrgicas menores para criar escala regional", requisitos:{faseEmpresa:["consolidacao","expansao"],indicadorMinimo:{financeiro:11}}, effects:{financeiro:-2,clientes:+2,processos:-4,rh:-3,manutencao:-2}, avaliacao:"ruim", ensinamento:"Estratégia de crescimento por aquisição exige time de M&A, integração cultural e caixa que metalúrgicas em transformação raramente têm simultaneamente." },
      { text:"Excelência em gestão de pessoas: se tornar a referência regional em segurança, treinamento e desenvolvimento humano", effects:{financeiro:+2,rh:+7,processos:+4,clientes:+3,seguranca:+4}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+2}, ensinamento:"Excelência em gestão de pessoas em indústria pesada é diferencial escasso. Empresas com reputação de segurança e desenvolvimento atraem os melhores técnicos, reduzem a rotatividade e entregam qualidade consistentemente superior." }
    ]
  }
]

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [1] · Indústria de Embalagens · ESG Urgente
   Contexto: 430 funcionários, 2 plantas, R$94M receita.
   Clientes exigem 30% insumos reciclados até próximo ano.
   Conversão de linha: R$8-12M, 6-10 meses. Cliente âncora
   enviou carta formal com prazo.

   INDICADORES: financeiro:8, rh:6, clientes:7, processos:5,
                seguranca:4, manutencao:5, qualidade:7, conformidade:8

   ATENÇÃO: segurança (4) já está crítica. qualidade≤5 → conformidade-2.
   conformidade≤3 → clientes-2 e financeiro-1.
   manutencao≤4 → seguranca-2 automaticamente.
══════════════════════════════════════════════════════════════════ */
,
[
  {
    title: "A Carta Que Mudou Tudo",
    description: "A carta do cliente âncora — responsável por 31% da receita — chegou com prazo formal de 8 meses para apresentar cronograma de adequação ESG: 30% de insumos reciclados nas embalagens fornecidas. O diretor de operações apresenta o dilema: converter a linha A (maior volume, R$8M, 7 meses) ou a linha B (menor volume mas cliente âncora usa, R$5,5M, 5 meses). Caixa disponível: R$6M.",
    tags: ["industria"],
    choices: [
      { text: "Priorizar a linha B — menor custo, prazo menor e atende diretamente o cliente que enviou a carta", risco: "medio", effects: { clientes: +4, conformidade: +3, financeiro: -4, processos: +2 }, avaliacao: "boa", ensinamento: "Priorizar a conversão que atende o cliente mais urgente é a decisão estratégica correta. Proteger o contrato de 31% da receita vale o investimento focado — e R$5,5M cabe no caixa disponível." },
      { text: "Buscar financiamento para converter as duas linhas simultaneamente nos próximos 12 meses", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +1 }, effects: { clientes: +3, conformidade: +4, financeiro: -3, processos: -2 }, avaliacao: "media", ensinamento: "Converter as duas simultaneamente maximiza o impacto ESG — mas exige capital que a empresa não tem e gestão de projeto que dois projetos paralelos de R$13-20M raramente entregam no prazo." },
      { text: "Apresentar ao cliente âncora um cronograma em fases — 20% até 8 meses, 30% até 14 meses", risco: "medio", effects: { clientes: +2, conformidade: +2, financeiro: +1, processos: +1 }, avaliacao: "media", ensinamento: "Cronograma faseado transparente demonstra comprometimento sem overpromising. Clientes que exigem adequação ESG geralmente preferem um parceiro honesto sobre os prazos a um parceiro que promete o impossível." },
      { text: "Terceirizar a compra de insumos reciclados de outro fornecedor enquanto prepara a conversão própria", risco: "baixo", effects: { clientes: +3, conformidade: +3, financeiro: -2, qualidade: -1, processos: +1 }, avaliacao: "boa", ensinamento: "Terceirizar insumos reciclados para cumprir o prazo imediato enquanto converte a linha própria é uma estratégia de ponte válida. O custo do material terceirizado é maior — mas protege o contrato." }
    ]
  },
  {
    title: "O Fornecedor de Insumo Reciclado",
    description: "A busca por fornecedores de resina reciclada pós-consumo revelou um problema: no Brasil, há apenas 3 fornecedores certificados com volume suficiente. O maior deles, a Recicla Sul, exige contrato de 36 meses com volume mínimo. O preço da resina reciclada é 28% maior que a virgem. Seus concorrentes já assinaram com o Recicla Sul — e o fornecedor pode aceitar apenas mais um cliente grande.",
    tags: ["industria"],
    choices: [
      { text: "Assinar com o Recicla Sul imediatamente para garantir o fornecimento antes dos concorrentes fecharem a capacidade", risco: "alto", gestorEffects: { capitalPolitico: +2 }, effects: { conformidade: +4, clientes: +3, financeiro: -3, margem: -2, processos: +2 }, avaliacao: "boa", ensinamento: "Garantir fornecimento de insumo crítico antes que a capacidade do mercado seja totalmente tomada é decisão de supply chain estratégica. Em mercado emergente de reciclados, quem chega primeiro garante o acesso." },
      { text: "Negociar contrato de 18 meses em vez de 36 para reduzir o compromisso", risco: "medio", effects: { conformidade: +3, clientes: +2, financeiro: -2, processos: +1 }, avaliacao: "boa", ensinamento: "Contrato mais curto reduz o risco de prêmio de preço em mercado que tende a se equalizar com o aumento da oferta de reciclados. Se a resina reciclada cair de preço em 2 anos, você não está preso." },
      { text: "Buscar fornecedores internacionais de resina reciclada como alternativa ao Recicla Sul", risco: "medio", effects: { conformidade: +2, financeiro: -4, processos: -2, clientes: +1 }, avaliacao: "ruim", ensinamento: "Importação de resina reciclada tem custo de frete, câmbio e lead time que tornam a operação mais cara e mais frágil do que o fornecedor nacional. Além disso, certificação de origem reciclada internacional pode não ser aceita pelos clientes." },
      { text: "Desenvolver programa próprio de coleta de embalagens pós-consumo como fonte de insumo reciclado", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { conformidade: +2, processos: -3, financeiro: -3, clientes: +2, inovacao: +3 }, avaliacao: "media", ensinamento: "Programa próprio de coleta é a solução mais sustentável de longo prazo — e cria um diferencial de storytelling ESG que nenhum concorrente que terceiriza tem. O prazo de 8 meses, porém, é incompatível com implantar um programa de logística reversa do zero." }
    ]
  },
  {
    title: "A Segurança que Cobra o Preço",
    description: "Com segurança já em nível crítico (4), o engenheiro de segurança alerta: a linha de produção que vai receber a resina reciclada tem equipamentos de mistura sem o guarda-corpo exigido pela NR-12. A adequação custa R$180k e leva 3 semanas. A conversão não pode começar com a não-conformidade ativa — o risco de acidente com novo insumo e linha não-certificada é inaceitável.",
    tags: ["industria"],
    choices: [
      { text: "Fazer a adequação de NR-12 antes de iniciar a conversão — segurança não é negociável", risco: "baixo", gestorEffects: { reputacaoInterna: +2 }, effects: { seguranca: +4, processos: +2, manutencao: +2, financeiro: -2 }, avaliacao: "boa", ensinamento: "Iniciar processo de conversão de linha sem adequação de segurança é expor os trabalhadores a risco real. Além do aspecto humano, um acidente durante a conversão paralisa o processo e expõe a empresa a multa do MTE." },
      { text: "Realizar a adequação em paralelo com o início da conversão para ganhar tempo", risco: "alto", effects: { seguranca: +2, processos: -2, manutencao: +1, financeiro: -2, rh: -2 }, avaliacao: "ruim", ensinamento: "Adequação de segurança em paralelo com operação ativa em linha em conversão é o cenário de maior risco de acidente. O ganho de 3 semanas não justifica o risco de um acidente que pode paralisar a operação por meses." },
      { text: "Contratar empresa especializada em NR-12 para fazer a adequação em 10 dias com equipe dedicada", risco: "medio", effects: { seguranca: +4, processos: +3, manutencao: +2, financeiro: -3 }, avaliacao: "boa", ensinamento: "Especialista em NR-12 com equipe dedicada comprime o prazo de 3 semanas para 10 dias. O custo adicional da equipe especializada é marginal frente ao tempo ganho no cronograma de conversão." },
      { text: "Mapear todos os demais equipamentos da fábrica com não-conformidades de NR-12 enquanto faz a adequação desta linha", risco: "baixo", effects: { seguranca: +5, processos: +3, manutencao: +3, financeiro: -2 }, avaliacao: "boa", ensinamento: "Aproveitar a mobilização de segurança para mapear toda a fábrica é o uso mais inteligente do momento. Um diagnóstico completo de NR-12 previne autuações futuras e demonstra comprometimento genuíno com segurança." }
    ]
  },
  {
    title: "O Cliente Secundário Pergunta Sobre ESG",
    description: "Dois dos seus 5 maiores clientes — que juntos representam 24% da receita — enviaram questionário ESG seguindo o padrão GRI: pegada de carbono, índice de acidentes, percentual de insumo reciclado e política de diversidade. O prazo de resposta é 30 dias. A empresa nunca mediu nenhum desses indicadores formalmente. Não responder pode resultar em desclassificação como fornecedor.",
    tags: ["industria"],
    choices: [
      { text: "Contratar consultoria de ESG para medir e documentar os indicadores existentes e responder com dados reais", risco: "medio", effects: { conformidade: +4, clientes: +3, financeiro: -3, processos: +2 }, avaliacao: "boa", ensinamento: "Responder com dados reais, mesmo que os números não sejam ótimos, é sempre melhor do que não responder. Clientes que pedem questionário ESG sabem que fornecedores estão em processo — eles querem comprometimento, não perfeição." },
      { text: "Responder o questionário com estimativas e dados parciais em vez de não responder", risco: "alto", gestorEffects: { capitalPolitico: -1 }, effects: { conformidade: +1, clientes: +1 }, avaliacao: "ruim", ensinamento: "Estimativas em questionário GRI que depois são auditadas criam risco de greenwashing. Se os dados forem contestados, a perda de credibilidade é muito maior do que não ter respondido." },
      { text: "Implementar um sistema básico de coleta de indicadores ESG para responder com dados reais mesmo que parciais", risco: "baixo", effects: { conformidade: +3, processos: +3, financeiro: -2, clientes: +2 }, avaliacao: "boa", ensinamento: "Criar a capacidade de medição interna é investimento necessário. Empresas que implementam um sistema básico de coleta de ESG respondem ao questionário atual e a todos os próximos — que virão com certeza." },
      { text: "Contatar os clientes e explicar que estão em processo de implementação ESG — pedir 90 dias adicionais", risco: "medio", effects: { clientes: +2, conformidade: +1, processos: +1 }, avaliacao: "media", ensinamento: "Transparência sobre o estágio de implementação é mais honesta do que inventar dados. O risco é que alguns clientes com política rígida de fornecedores não aceitam prazo — mas a maioria respeita honestidade." }
    ]
  },
  {
    title: "A Conversão em Andamento",
    description: "A conversão da linha B está na semana 3 de 5 meses planejados. O engenheiro de processo revela um problema: a resina reciclada tem 12% mais umidade do que a virgem — o que aumenta o tempo de ciclo de moldagem em 18% e reduz a produtividade da linha em 1.100 peças/turno. O cliente âncora já perguntou sobre o cronograma de entrega do primeiro lote certificado.",
    tags: ["industria"],
    choices: [
      { text: "Instalar secadores de resina adicionais para compensar a umidade antes da moldagem", risco: "medio", effects: { qualidade: +3, processos: +2, financeiro: -2, manutencao: +1 }, avaliacao: "boa", ensinamento: "Secagem adicional de resina reciclada é uma adaptação técnica padrão. O custo do equipamento é amortizado pelo volume de produção e pela manutenção do cronograma prometido ao cliente." },
      { text: "Renegociar o prazo com o cliente âncora — apresentar o problema técnico com transparência", risco: "baixo", effects: { clientes: +2, processos: +1, conformidade: +1 }, avaliacao: "boa", ensinamento: "Transparência técnica com o cliente sobre um problema genuíno de processo é sempre preferível ao cumprimento de prazo com qualidade comprometida. Clientes que pedem ESG entendem que a transição tem curva de aprendizado." },
      { text: "Aumentar o turno de trabalho para compensar a queda de produtividade e manter o cronograma", risco: "alto", gestorEffects: { reputacaoInterna: -1 }, effects: { processos: +1, rh: -4, seguranca: -2, financeiro: -2 }, avaliacao: "ruim", ensinamento: "Aumentar turno para compensar problema técnico com insumo novo é a solução mais arriscada. Operadores sobrecarregados com um processo novo que ainda está sendo calibrado têm índice de erro e acidente elevado." },
      { text: "Ajustar o parâmetro de temperatura do molde para compensar a umidade da resina reciclada", risco: "baixo", effects: { qualidade: +2, processos: +3, financeiro: 0 }, avaliacao: "boa", ensinamento: "Ajuste de parâmetro de processo é a solução de menor custo e maior velocidade. A equipe técnica que domina o processo de moldagem geralmente consegue compensar as características do novo insumo com calibração adequada." }
    ]
  },
  {
    title: "O Auditor de Carbono",
    description: "O maior cliente varejista do portfólio — 18% da receita — informou que a partir do próximo ano vai exigir LCA (Life Cycle Assessment) completa das embalagens. O custo de uma LCA certificada é R$85k. Se aprovada, sua embalagem reciclada pode ganhar um selo verde que o varejista usa para marketing. Se reprovada ou não apresentada, você perde acesso ao edital de fornecimento.",
    tags: ["industria"],
    choices: [
      { text: "Contratar a LCA imediatamente — é investimento de R$85k para proteger um contrato de R$17M", risco: "baixo", effects: { conformidade: +4, clientes: +3, financeiro: -2 }, avaliacao: "boa", ensinamento: "ROI de R$85k para proteger R$17M de contrato é trivialmente positivo. A LCA além de proteger o contrato abre portas para outros clientes que exigem rastreabilidade de ciclo de vida." },
      { text: "Negociar com o varejista aceitar uma declaração ambiental intermediária enquanto a LCA completa é preparada", risco: "medio", effects: { clientes: +2, conformidade: +2, financeiro: 0 }, avaliacao: "media", ensinamento: "Declaração ambiental intermediária (como EPD simplificado) pode ser aceita por varejistas com política ESG em desenvolvimento. O risco é que o edital já tenha critérios específicos que a declaração intermediária não atende." },
      { text: "Formar consórcio com outros fornecedores para dividir o custo da LCA por categoria de embalagem", risco: "baixo", effects: { clientes: +2, conformidade: +3, financeiro: -1, processos: +1 }, avaliacao: "boa", ensinamento: "LCA compartilhada por categoria de produto é uma prática emergente que distribui o custo sem perder a validade certificada. Fornecedores que colaboram para atender exigência ESG de cliente comum criam uma rede de conformidade." },
      { text: "Incluir a LCA no orçamento do próximo ano e comunicar ao varejista que estará pronta em 14 meses", risco: "alto", effects: { clientes: -3, conformidade: -1, financeiro: +1 }, avaliacao: "ruim", ensinamento: "Comunicar 14 meses de prazo para exigência do próximo edital é arriscar perder o contrato por falta de conformidade. O edital provavelmente vai ter prazo mais curto — e concorrentes que já têm a LCA vão ganhar o espaço." }
    ]
  },
  {
    title: "O Processo que Gera Resíduo",
    description: "O diagnóstico ambiental revelou: as duas plantas geram 380 toneladas de resíduo plástico por mês — aparas e rejeitos de processo. Hoje, 60% vai para aterro (custo de R$45/ton), 30% é vendido como sucata de baixo valor, e 10% é reprocessado internamente. Uma empresa de reciclagem propõe comprar todo o resíduo por R$28/ton — mas exige exclusividade.",
    tags: ["industria"],
    choices: [
      { text: "Aceitar a proposta sem exclusividade — vender apenas o resíduo que hoje vai para aterro", risco: "baixo", effects: { conformidade: +3, financeiro: +2, processos: +2 }, avaliacao: "boa", ensinamento: "Transformar custo de aterro em receita de venda de resíduo é uma melhoria imediata de margem e de credencial ESG. A exclusividade pode ser negociada — você não precisa dar o que não pediu." },
      { text: "Aceitar com exclusividade — R$28/ton em todo o volume é melhor do que o modelo atual fragmentado", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { conformidade: +3, financeiro: +3, processos: +3 }, avaliacao: "boa", ensinamento: "Exclusividade em troca de preço garantido é um trade-off razoável. O comprador de resíduo com exclusividade tem incentivo de desenvolver processo para resíduos mais complexos que hoje vão para aterro." },
      { text: "Investir para aumentar o reprocessamento interno de 10% para 40% — usar o próprio resíduo como insumo reciclado", risco: "medio", effects: { conformidade: +4, qualidade: +2, financeiro: -3, processos: +3, manutencao: +1 }, avaliacao: "boa", ensinamento: "Fechar o loop de resíduo internamente é a estratégia de maior valor ESG e de maior independência de fornecedor externo. Resíduo interno reprocessado tem custo de logística zero e rastreabilidade total de origem." },
      { text: "Manter o modelo atual — não assinar exclusividade com nenhum comprador", risco: "baixo", effects: { conformidade: -1, financeiro: -1, processos: 0 }, avaliacao: "ruim", ensinamento: "Manter 60% do resíduo em aterro enquanto há demanda de compra é uma decisão que deteriora a credencial ESG sem benefício. O custo de aterro é real — e cada tonelada em aterro é uma tonelada no relatório de impacto ambiental." }
    ]
  },
  {
    title: "O Segundo Cliente Que Exige ESG",
    description: "Uma multinacional de higiene pessoal — potencial cliente novo com R$8M/ano de volume — colocou a empresa no processo seletivo de fornecedores. A condição: aprovação na auditoria ESG deles em 60 dias. Os critérios: zero acidentes nos últimos 12 meses, 25% de insumo reciclado e política de diversidade de gênero documentada. Você tem 1 acidente nos últimos 12 meses e 15% de insumo reciclado até agora.",
    tags: ["industria"],
    choices: [
      { text: "Ser transparente com a multinacional sobre os critérios que ainda não atende e apresentar o cronograma de adequação", risco: "baixo", effects: { clientes: +2, conformidade: +2, processos: +1 }, avaliacao: "boa", ensinamento: "Transparência no processo seletivo de ESG é a postura que multinacionais com departamento de sustainability valorizam. Quem mente nos critérios para ganhar o contrato enfrenta auditoria periódica que vai encontrar a realidade." },
      { text: "Participar da auditoria com os dados atuais — 15% de reciclado e 1 acidente podem ser aceitos com plano", risco: "medio", effects: { clientes: +3, conformidade: +2, processos: +1, seguranca: +1 }, avaliacao: "boa", ensinamento: "Multinacionais experientes em ESG de fornecedores sabem que poucos fornecedores atendem 100% dos critérios. A auditoria avalia a trajetória — não apenas o snapshot atual." },
      { text: "Recusar o processo seletivo por ora e candidatar-se quando atender todos os critérios", risco: "baixo", effects: { clientes: -1, conformidade: +1, processos: +2 }, avaliacao: "media", ensinamento: "Recusar para candidatar depois é uma opção conservadora — mas processos seletivos de fornecedores não ficam abertos indefinidamente. A multinacional pode fechar a seleção antes de você estar pronto." },
      { text: "Contratar 30% do time operacional com diversidade de gênero rapidamente para atender o critério de política de diversidade", risco: "alto", gestorEffects: { reputacaoInterna: -2 }, effects: { rh: -2, conformidade: +1, clientes: +1 }, avaliacao: "ruim", ensinamento: "Contratar por cota para passar em auditoria ESG é a forma mais eficiente de criar uma política de diversidade inautêntica. Auditores de ESG verificam rotatividade e plano de desenvolvimento — não apenas o headcount." }
    ]
  },
  {
    title: "A Conversão da Segunda Linha",
    description: "A linha B está convertida e funcionando com 28% de insumo reciclado — abaixo da meta de 30%, mas suficiente para satisfazer o cliente âncora que aceitou o cronograma. A diretoria discute agora a conversão da linha A (maior volume, R$8M de investimento): ela representa 60% da produção, mas os clientes dessa linha ainda não exigiram ESG formalmente.",
    tags: ["industria"],
    choices: [
      { text: "Converter a linha A antecipadamente — posicionar-se como liderança ESG antes de ser exigido pelos clientes", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { conformidade: +4, clientes: +3, financeiro: -5, processos: +2, qualidade: +1 }, avaliacao: "boa", ensinamento: "Converter antes da exigência transforma o ESG de custo reativo em diferencial proativo. Clientes que ainda não exigiram formalmente estão recebendo pressão internamente — quem chega com a solução pronta ganha o contrato seguinte." },
      { text: "Aguardar exigência formal dos clientes da linha A antes de investir — R$8M é capital escasso", risco: "medio", effects: { financeiro: +2, conformidade: -1, clientes: -1, processos: +1 }, avaliacao: "media", ensinamento: "Aguardar a exigência formal é conservador — mas o lead time de conversão é de 6-10 meses. Quando o cliente exigir, você vai estar 6 meses atrás do prazo. A decisão hoje determina se você entrega no prazo amanhã." },
      { text: "Buscar financiamento verde (BNDES Mais Inovação ou banco de desenvolvimento) para conversão da linha A", risco: "baixo", effects: { financeiro: +1, conformidade: +3, processos: +2, clientes: +1 }, avaliacao: "boa", ensinamento: "Linhas de crédito para ESG têm custo 2-4% menor do que crédito convencional. BNDES tem programas específicos para modernização industrial com componente ambiental — e a conversão para insumo reciclado se enquadra." },
      { text: "Converter gradualmente a linha A: 15% de reciclado primeiro, subindo 5% por trimestre para gerenciar o capex", risco: "baixo", effects: { conformidade: +2, financeiro: -3, processos: +2, qualidade: +1 }, avaliacao: "boa", ensinamento: "Conversão gradual distribui o investimento ao longo do tempo e permite calibrar o processo por etapas. Para linha de maior volume, a abordagem gradual reduz o risco de parada de produção por problema técnico em escala." }
    ]
  },
  {
    title: "O Prêmio ESG do Setor",
    description: "A ABIPLAST (associação da indústria de plástico) lançou o Prêmio ESG Embalagem Sustentável. Candidatar-se exige documentação completa, auditoria externa e apresentação de case. O custo de participação é R$45k. O benefício: caso vença, o logotipo é usado pelo maior varejista do Brasil como endosso de fornecedor sustentável — acesso a uma audiência de 200 fornecedores potenciais.",
    tags: ["industria"],
    choices: [
      { text: "Candidatar-se — o investimento de R$45k tem potencial de geração de leads de R$8M em novos contratos", risco: "baixo", effects: { clientes: +3, conformidade: +2, processos: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Prêmio ESG setorial é uma das formas mais eficientes de marketing B2B para indústria. A credibilidade de um prêmio externo independente vale mais do que qualquer materiel de marketing próprio." },
      { text: "Participar apenas da etapa documental para benchmark interno — sem a auditoria cara", risco: "baixo", effects: { processos: +2, conformidade: +1, financeiro: 0 }, avaliacao: "media", ensinamento: "Benchmark interno com os critérios do prêmio tem valor de diagnóstico — mas não gera a visibilidade que a candidatura completa oferece. É usar metade do potencial do investimento." },
      { text: "Preparar a candidatura para o próximo ciclo — usar este ciclo para documentar melhor o case", risco: "baixo", effects: { processos: +2, conformidade: +1 }, avaliacao: "media", ensinamento: "Preparação cuidadosa para o próximo ciclo pode resultar em candidatura mais forte — mas perde a janela atual onde você tem o case fresco da conversão. Juízes de prêmios avaliam trajetória recente." },
      { text: "Candidatar-se e convidar os principais clientes para participarem como referência na documentação do case", risco: "baixo", gestorEffects: { reputacaoInterna: +1 }, effects: { clientes: +4, conformidade: +3, processos: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Incluir clientes no case do prêmio transforma a candidatura em uma parceria de visibilidade. O cliente âncora que forçou a adequação ESG agora é co-autor do sucesso — e isso fortalece o relacionamento." }
    ]
  },
  {
    title: "A Decisão de Pricing Verde",
    description: "Com a conversão concluída e os custos de resina reciclada 28% mais caros, a embalagem sustentável custa R$0,08/unidade a mais para produzir. O mercado pergunta: repassar aos clientes, absorver na margem ou criar um diferencial de preço premium? Seus clientes mais exigentes (que forçaram a mudança) esperam absorção. Os demais clientes não sabem a diferença.",
    tags: ["industria"],
    choices: [
      { text: "Criar duas linhas de preço: embalagem certificada com 5% de prêmio e embalagem padrão pelo preço atual", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { financeiro: +3, clientes: +2, conformidade: +2, margem: +2 }, avaliacao: "boa", ensinamento: "Segmentação por produto (certificado vs padrão) captura o prêmio de quem valoriza e não afasta quem ainda não exige. É a estratégia de precificação mais inteligente para mercados em transição ESG." },
      { text: "Absorver o custo na margem — o ESG é o novo custo de fazer negócio neste mercado", risco: "medio", effects: { margem: -3, clientes: +3, conformidade: +2, financeiro: -2 }, avaliacao: "ruim", ensinamento: "Absorver indefinidamente 28% de custo adicional de insumo na margem não é sustentável. O ESG precisa ter valor percebido e preço correspondente — a indústria que subsidia a transição verde dos clientes eventualmente quebra." },
      { text: "Repassar o custo integralmente a todos os clientes com documentação transparente da origem do aumento", risco: "alto", effects: { financeiro: +3, clientes: -3, conformidade: +1, margem: +1 }, avaliacao: "media", ensinamento: "Repasse transparente com documentação é mais honesto do que absorção — mas pode afastar clientes que ainda não veem valor no ESG. A comunicação precisa ser cuidadosa para não parecer punição." },
      { text: "Negociar compartilhamento do custo: 50% absorvido pela empresa, 50% repassado aos clientes que exigiram", risco: "baixo", effects: { financeiro: +1, clientes: +2, conformidade: +2, margem: 0 }, avaliacao: "boa", ensinamento: "Divisão de custo com os clientes que exigiram a mudança é a postura mais justa e mais sustentável. Clientes que forçaram a adequação ESG geralmente aceitam dividir o custo quando apresentado com transparência." }
    ]
  },
  {
    title: "A Expansão da Linha de Embalagens Biodegradáveis",
    description: "Uma empresa de cosméticos naturais quer comprar 2M de unidades/ano de embalagens biodegradáveis — mercado que você não atende hoje. O investimento para criar essa linha seria R$4,2M. O segmento cresce 34% ao ano e o ticket médio é 60% superior ao das embalagens convencionais. Seu atual banco de desenvolvimento sinalizou interesse em financiar até 70% com linha verde.",
    tags: ["industria"],
    choices: [
      { text: "Desenvolver a linha biodegradável com financiamento verde — é a próxima fronteira do mercado ESG de embalagens", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { clientes: +4, conformidade: +4, financeiro: -2, inovacao: +4, qualidade: +2 }, avaliacao: "boa", ensinamento: "Biodegradável é onde o mercado de embalagens sustentáveis vai em 5 anos. Entrar agora com cliente âncora e financiamento favorável é o timing ideal — você lidera a transição em vez de segui-la." },
      { text: "Fazer parceria com empresa especializada em materiais biodegradáveis em vez de desenvolver internamente", risco: "baixo", effects: { clientes: +3, conformidade: +3, financeiro: -1, inovacao: +2 }, avaliacao: "boa", ensinamento: "Parceria com especialista em materiais reduz o risco técnico e o tempo de desenvolvimento. Você traz o processo de fabricação e a capacidade produtiva — o parceiro traz o know-how de material." },
      { text: "Recusar — consolidar a linha de reciclados antes de entrar num segundo mercado novo", risco: "baixo", effects: { conformidade: +1, financeiro: +1, processos: +2 }, avaliacao: "media", ensinamento: "Consolidação antes de expansão é prudente — mas rejeitar um cliente âncora e financiamento favorable para uma categoria de crescimento de 34% é difícil de justificar. A janela não fica aberta indefinidamente." },
      { text: "Aceitar o pedido e terceirizar a produção de biodegradáveis com um fornecedor enquanto avalia o investimento", risco: "medio", effects: { clientes: +3, conformidade: +2, financeiro: -1, qualidade: -1 }, avaliacao: "media", ensinamento: "Terceirizar para não perder o cliente âncora é uma estratégia de bridge válida. O risco é a dependência de qualidade e prazo de um terceiro em um produto novo que ainda não foi validado com o cliente final." }
    ]
  },
  {
    title: "O Relatório ESG Anual",
    description: "O CFO apresenta o primeiro relatório ESG da empresa. Os resultados são mistos: insumo reciclado chegou a 23% (meta: 30%), acidentes caíram 40% (mas ainda há 2 no ano), e o resíduo para aterro caiu de 60% para 38%. O cliente âncora quer o relatório publicado no site deles como prova de comprometimento. O time de comunicação alerta: publicar com metas não atingidas pode gerar crítica.",
    tags: ["industria"],
    choices: [
      { text: "Publicar o relatório com os dados reais, incluindo as metas não atingidas e o cronograma revisado", risco: "baixo", gestorEffects: { capitalPolitico: +2 }, effects: { conformidade: +4, clientes: +3, processos: +2 }, avaliacao: "boa", ensinamento: "Transparência ESG com metas não atingidas é mais valorizada do que silêncio ou relatório editado. O GRI e a ISO 14001 exigem divulgação completa — empresas que relatam honestamente constroem reputação de sustentabilidade genuína." },
      { text: "Aguardar mais 6 meses para publicar quando os indicadores estiverem mais próximos das metas", risco: "medio", effects: { conformidade: -1, clientes: -1 }, avaliacao: "ruim", ensinamento: "Atrasar o relatório ESG para esperar melhores números é a definição de greenwashing por omissão. O cliente âncora que pediu o relatório vai perguntar por que está atrasado — e a resposta real vai ser pior do que os números." },
      { text: "Publicar o relatório com foco na trajetória de melhoria — os dados de 40% de redução de acidentes são impactantes", risco: "baixo", effects: { conformidade: +3, clientes: +3, processos: +2 }, avaliacao: "boa", ensinamento: "Enquadrar o relatório na trajetória de melhoria é comunicação legítima — desde que os dados absolutos também estejam presentes. Mostrar que você saiu de zero para 23% de reciclado em 18 meses é uma narrativa poderosa." },
      { text: "Publicar apenas os indicadores que atingiram a meta e omitir os que ficaram abaixo", risco: "alto", gestorEffects: { capitalPolitico: -3 }, effects: { conformidade: -4, clientes: -3 }, avaliacao: "ruim", ensinamento: "Relatório ESG seletivo é greenwashing documentado. Se o cliente âncora ou qualquer stakeholder descobrir a seleção, o dano à reputação é irreversível — e crescentemente há ferramenta de verificação cruzada de dados ESG." }
    ]
  },
  {
    title: "O Futuro da Embalagem Sustentável",
    description: "A empresa atravessou a maior transformação de sua história. O mercado reconhece o progresso. O board pede a visão para os próximos 3 anos.",
    tags: ["industria"],
    choices: [
      { text: "Líder ESG do setor: 100% insumo reciclado até 2027, zero resíduo para aterro e emissão net-zero na operação", effects: { conformidade: +5, clientes: +5, financeiro: +3, qualidade: +3, processos: +4, seguranca: +3 }, avaliacao: "boa", ensinamento: "Liderança ESG total é um posicionamento defensável e crescentemente lucrativo. Empresas com embalagem net-zero têm acesso a editais de multinacionais que competidores com pegada maior não conseguem participar." },
      { text: "Inovação em materiais: criar laboratório de P&D de embalagens biodegradáveis e compostáveis como próxima geração", effects: { inovacao: +5, clientes: +4, conformidade: +4, financeiro: -2, qualidade: +4 }, avaliacao: "boa", ensinamento: "P&D em materiais do futuro transforma uma empresa de manufatura em empresa de tecnologia de materiais. A propriedade intelectual de novos materiais de embalagem tem valor muito superior ao da capacidade produtiva." },
      { text: "Expansão em mercados internacionais: Europa exige ESG mais rigoroso e paga 40% mais por embalagem certificada", requisitos: { indicadorMinimo: { conformidade: 12, qualidade: 10 } }, effects: { financeiro: +5, clientes: +4, conformidade: +4, processos: +3, qualidade: +2 }, avaliacao: "boa", ensinamento: "Exportação para Europa com embalagem certificada ESG é um caminho de margem significativamente superior. O mercado europeu já tem as exigências que o Brasil vai ter em 3-5 anos — você estaria à frente da curva." },
      { text: "Plataforma circular: criar sistema de logística reversa próprio para coletar as embalagens pós-uso e reprocessar internamente", effects: { conformidade: +5, processos: +4, clientes: +3, financeiro: -3, inovacao: +3 }, avaliacao: "boa", ensinamento: "Economia circular completa — da resina reciclada à coleta pós-uso para reprocessar novamente — é o modelo de negócio mais defensável e mais alinhado com a regulação que vem. É o futuro da indústria de embalagens." }
    ]
  }
],

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [2] · Indústria Química · Crise Ambiental
   Contexto: 280 funcionários, R$71M receita, ABC paulista.
   IBAMA autuou: R$4,1M de multa, planta em regime parcial,
   responsável técnico ambiental demitiu, imprensa noticiou,
   2 clientes sinalizaram revisão de contrato.

   INDICADORES: financeiro:8, rh:6, clientes:7, processos:5,
                seguranca:4, manutencao:5, qualidade:7, conformidade:8

   ATENÇÃO: segurança (4) e conformidade (8) são os indicadores
   centrais desta história. conformidade≤3 → clientes-2 e financeiro-1.
   A crise requer reconstrução de conformidade que demanda processos.
══════════════════════════════════════════════════════════════════ */
,
[
  {
    title: "A Crise no Dia Seguinte",
    description: "Você assume a gestão 48 horas após a autuação. O IBAMA está monitorando. A planta opera em 60% da capacidade. O responsável técnico ambiental que pediu demissão levou consigo a documentação dos processos de descarte. A imprensa regional publicou o caso. Dois clientes ligaram. Você tem 72 horas para apresentar ao IBAMA o Termo de Ajustamento de Conduta inicial. Por onde começa?",
    tags: ["industria"],
    choices: [
      { text: "Contratar advogado ambiental especializado para liderar o TAC com o IBAMA — urgência máxima", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { conformidade: +4, processos: +2, financeiro: -3 }, avaliacao: "boa", ensinamento: "O TAC é um instrumento técnico-jurídico que define os compromissos da empresa com o órgão ambiental. Advogado especializado em direito ambiental é indispensável para negociar prazos e obrigações que a empresa consegue cumprir." },
      { text: "Ligar para os dois clientes que sinalizaram revisão antes de qualquer comunicação pública", risco: "baixo", gestorEffects: { reputacaoInterna: +1 }, effects: { clientes: +3, conformidade: +1, processos: +1 }, avaliacao: "boa", ensinamento: "Clientes que sinalizaram revisão ainda não decidiram. Contato proativo antes da decisão deles — com compromisso claro de regularização — é a janela mais estreita e mais valiosa para preservar o relacionamento." },
      { text: "Emitir nota pública reconhecendo o problema e anunciando o plano de regularização", risco: "medio", effects: { conformidade: +2, clientes: +2, processos: +1 }, avaliacao: "boa", ensinamento: "Nota pública proativa controla a narrativa antes que a imprensa construa uma por conta própria. Empresas que reconhecem e apresentam plano têm cobertura jornalística significativamente mais equilibrada." },
      { text: "Paralisar completamente a planta por 30 dias para investigar e regularizar tudo antes de qualquer comunicação", risco: "alto", gestorEffects: { capitalPolitico: -2 }, effects: { financeiro: -5, conformidade: -1, rh: -2, clientes: -3 }, avaliacao: "ruim", ensinamento: "Paralisação total sem negociação prévia com o IBAMA cria mais problemas do que resolve. O TAC define as condições de operação durante a regularização — você não precisa parar para negociar." }
    ]
  },
  {
    title: "O Responsável Técnico que Sumiu",
    description: "O ex-responsável técnico ambiental era o único que conhecia os procedimentos de descarte, o histórico de licenças e os contatos do IBAMA. Com ele foram os documentos físicos. O sindicato da categoria informou que ele está disposto a retornar como consultor por R$35k/mês por 3 meses para apoiar a regularização. Sem ele, a regularização pode levar o dobro do tempo.",
    tags: ["industria"],
    choices: [
      { text: "Contratar o ex-responsável como consultor pelos 3 meses — o conhecimento dele é crítico para o TAC", risco: "medio", effects: { conformidade: +3, processos: +3, financeiro: -2 }, avaliacao: "boa", ensinamento: "R$105k em consultoria para um processo de regularização que pode custar R$4,1M de multa é uma decisão de ROI óbvio. O conhecimento específico do processo de licenciamento tem valor de mercado real." },
      { text: "Recusar e contratar consultoria ambiental especializada que não tem o conflito de interesse do ex-funcionário", risco: "medio", effects: { conformidade: +2, processos: +2, financeiro: -3 }, avaliacao: "boa", ensinamento: "Consultoria ambiental independente traz metodologia padronizada e relacionamento com o IBAMA sem o histórico de conflito. O ex-funcionário pode ter motivação de lentidão — um consultor independente não." },
      { text: "Nomear internamente um engenheiro químico como responsável técnico e contratar apoio jurídico para complementar", risco: "baixo", effects: { conformidade: +2, rh: +2, financeiro: -2, processos: +1 }, avaliacao: "boa", ensinamento: "Responsável técnico interno com apoio jurídico é a solução mais duradoura. A empresa não pode ficar dependente de um único profissional externo para o próximo ciclo de licenciamento também." },
      { text: "Solicitar ao IBAMA extensão do prazo do TAC citando a saída do responsável técnico como circunstância atenuante", risco: "alto", effects: { conformidade: -2, clientes: -2, processos: +1 }, avaliacao: "ruim", ensinamento: "IBAMA raramente concede extensão de TAC por saída voluntária de funcionário. A autarquia pode interpretar a saída como possível destruição de evidências — o que agrava a situação em vez de atenuar." }
    ]
  },
  {
    title: "A Multa de R$4,1 Milhões",
    description: "O advogado ambiental avaliou a multa: há dois caminhos. (A) Pagar a multa integral em 30 dias com desconto de 30% (R$2,87M). (B) Recorrer administrativamente — processo leva 18 a 36 meses, pode reduzir para R$1,8M ou manter em R$4,1M. Durante o recurso, a planta segue em operação parcial. O CFO alerta: pagar R$2,87M agora deixa o caixa em R$5,1M — suficiente para operar, mas sem margem.",
    tags: ["industria"],
    choices: [
      { text: "Pagar com desconto de 30% e usar o TAC para negociar a retomada da operação plena rapidamente", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { conformidade: +3, financeiro: -4, processos: +2, clientes: +2 }, avaliacao: "boa", ensinamento: "Pagar com desconto elimina a incerteza e demonstra comprometimento com a regularização. O IBAMA tende a ser mais colaborativo na negociação do TAC com empresas que pagam a multa sem contestar." },
      { text: "Recorrer administrativamente — 18 meses de processo pode resultar em multa 56% menor", risco: "alto", gestorEffects: { capitalPolitico: -1 }, effects: { conformidade: -2, clientes: -2, financeiro: +1, processos: -1 }, avaliacao: "ruim", ensinamento: "Recorrer enquanto a planta está em operação parcial prolonga a instabilidade por 18-36 meses. Clientes que sinalizaram revisão e imprensa que noticiou o caso não vão esperar o recurso — eles tomam decisões nos próximos 30 dias." },
      { text: "Propor parcelamento da multa em 12 vezes com o IBAMA como parte do TAC", risco: "medio", effects: { conformidade: +2, financeiro: +2, processos: +1 }, avaliacao: "boa", ensinamento: "Parcelamento de multa ambiental é negociável no TAC. Preservar o caixa para as obras de regularização é estrategicamente mais importante do que quitar a multa de uma vez." },
      { text: "Buscar financiamento bancário para pagar a multa com desconto sem comprometer o caixa operacional", risco: "medio", effects: { conformidade: +3, financeiro: -2, processos: +1 }, avaliacao: "boa", ensinamento: "Financiar o pagamento da multa com desconto é matematicamente vantajoso se a taxa de juros do crédito for menor que o desconto de 30%. Preserva o caixa e demonstra capacidade de crédito ao mercado." }
    ]
  },
  {
    title: "A Planta em Operação Parcial",
    description: "Com a planta a 60% da capacidade, você não consegue atender o volume contratado de 4 clientes. O COO apresenta as opções: (A) Priorizar os 2 maiores por receita, deixando os 2 menores sem atendimento. (B) Reduzir o volume proporcionalmente para todos os 4. (C) Terceirizar a produção faltante com indústria parceira temporariamente.",
    tags: ["industria"],
    choices: [
      { text: "Terceirizar a produção faltante com parceiro industrial — manter o compromisso com todos os clientes", risco: "medio", effects: { clientes: +4, qualidade: -1, financeiro: -3, processos: +1 }, avaliacao: "boa", ensinamento: "Terceirização preserva o relacionamento com todos os clientes ao custo de margem menor. A alternativa — deixar clientes sem produto — cria risco de rescisão contratual que é muito mais caro do que a terceirização." },
      { text: "Ser transparente com todos os clientes sobre a situação e negociar redução proporcional temporária", risco: "baixo", effects: { clientes: +2, conformidade: +1, processos: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Transparência com os clientes sobre a capacidade real evita surpresas e permite que eles se planejem. Clientes que recebem aviso antecipado têm maior tolerância do que clientes que descobrem o problema no dia da entrega." },
      { text: "Priorizar os 2 maiores clientes e comunicar aos menores que o fornecimento está suspenso temporariamente", risco: "alto", gestorEffects: { reputacaoInterna: -1 }, effects: { clientes: -3, financeiro: +1, processos: -1 }, avaliacao: "ruim", ensinamento: "Priorizar por receita sem avisar os menores é garantir que eles busquem alternativa permanente. Em indústria química, onde a homologação de fornecedor leva meses, perder a homologação de um cliente pequeno tem custo real." },
      { text: "Acelerar a regularização para retornar a 100% da capacidade o mais rápido possível — não terceirizar", risco: "medio", effects: { conformidade: +2, processos: +2, clientes: -2, financeiro: -2 }, avaliacao: "media", ensinamento: "Acelerar a regularização é a solução definitiva — mas enquanto a planta não está a 100%, os clientes continuam sem produto. A aceleração e a terceirização não são mutuamente exclusivas." }
    ]
  },
  {
    title: "A Imprensa Voltou",
    description: "Um portal de notícias regional publicou uma matéria de acompanhamento 30 dias após a autuação. A jornalista ligou para pedir posicionamento. O texto provisório que ela compartilhou é equilibrado mas menciona que a empresa 'ainda não demonstrou ações concretas de regularização'. O advogado recomenda não comentar. O time de comunicação quer uma entrevista completa.",
    tags: ["industria"],
    choices: [
      { text: "Dar a entrevista completa com os dados concretos de regularização já implementados", risco: "baixo", gestorEffects: { capitalPolitico: +2 }, effects: { conformidade: +3, clientes: +2, processos: +1 }, avaliacao: "boa", ensinamento: "Uma entrevista com dados concretos de ação — TAC assinado, obras iniciadas, responsável técnico contratado — muda a narrativa de 'empresa na crise' para 'empresa em recuperação'. Silêncio confirma a percepção negativa." },
      { text: "Enviar nota escrita com os principais pontos de regularização em vez de entrevista presencial", risco: "baixo", effects: { conformidade: +2, clientes: +1 }, avaliacao: "boa", ensinamento: "Nota escrita controla a mensagem sem exposição a perguntas fora do escopo. É menos impactante do que entrevista — mas é melhor do que silêncio ou 'sem comentários'." },
      { text: "Seguir o conselho do advogado e não comentar — a matéria vai sair de qualquer forma", risco: "alto", effects: { conformidade: -2, clientes: -2 }, avaliacao: "ruim", ensinamento: "Jornalistas que não recebem posicionamento publicam a matéria com 'empresa não se pronunciou' — que é percebido pelo leitor como confirmação da culpa. Em crise de reputação, silêncio raramente é neutro." },
      { text: "Convidar a jornalista para uma visita à planta para ver as obras de regularização em andamento", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { conformidade: +4, clientes: +3, processos: +1 }, avaliacao: "boa", ensinamento: "Visita à planta transforma a matéria de apuração em reportagem de acompanhamento positivo. Ver as obras fisicamente é mais convincente do que qualquer nota — e jornalistas raramente recusam acesso exclusivo." }
    ]
  },
  {
    title: "O Programa de Gestão de Resíduos",
    description: "O advogado ambiental identificou a causa raiz do descarte irregular: a empresa não tinha programa formal de gestão de resíduos — os descartes eram feitos por decisão ad-hoc dos supervisores de turno. Para o TAC, o IBAMA exige um PGRS (Programa de Gestão de Resíduos Sólidos) implementado e auditável. Você precisa implantar em 90 dias.",
    tags: ["industria"],
    choices: [
      { text: "Contratar empresa especializada em PGRS para implementar o programa completo nos 90 dias", risco: "medio", effects: { conformidade: +5, processos: +4, seguranca: +2, financeiro: -3 }, avaliacao: "boa", ensinamento: "PGRS implementado por especialista tem documentação técnica que o IBAMA aceita e credibilidade de auditoria que equipe interna raramente tem. O custo da consultoria é a garantia de aprovação no prazo." },
      { text: "Desenvolver o PGRS internamente com a equipe de engenharia química — eles conhecem o processo", risco: "alto", effects: { conformidade: +3, processos: +2, financeiro: -1, rh: -2 }, avaliacao: "media", ensinamento: "PGRS desenvolvido internamente tem o risco de não atender os requisitos formais do IBAMA. Regulação ambiental tem linguagem específica — um documento tecnicamente correto mas formalmente inadequado pode ser reprovado." },
      { text: "Implementar o PGRS em parceria com a associação da indústria química local — dividir o custo e os recursos", risco: "baixo", effects: { conformidade: +3, processos: +3, financeiro: -1, clientes: +1 }, avaliacao: "boa", ensinamento: "Programa conjunto com a associação setorial distribui o custo e cria credibilidade adicional. O IBAMA tende a reconhecer positivamente programas de gestão que têm suporte setorial — indica mudança de cultura, não apenas reação individual." },
      { text: "Terceirizar completamente o descarte de resíduos para empresa especializada e evitar gestão interna", risco: "medio", effects: { conformidade: +2, processos: +2, financeiro: -2 }, avaliacao: "media", ensinamento: "Terceirização do descarte é uma solução — mas o IBAMA exige que a empresa geradora tenha seu próprio PGRS mesmo terceirizando o descarte. Você ainda precisa do programa, mesmo com terceiro para a execução." }
    ]
  },
  {
    title: "Os Clientes que Ficaram",
    description: "Um mês após a autuação, os dois clientes que sinalizaram revisão comunicaram: um manterá o contrato por mais 6 meses aguardando a regularização. O outro rescindiu. A perda do cliente rescindido representa R$6,8M/ano — 9,6% da receita. O diretor comercial alerta que há 3 outros clientes em 'observação passiva' — podem ou não revisar o contrato dependendo da evolução.",
    tags: ["industria"],
    choices: [
      { text: "Visitar pessoalmente os 3 clientes em 'observação passiva' com o plano de regularização documentado", risco: "baixo", gestorEffects: { capitalPolitico: +2 }, effects: { clientes: +4, conformidade: +2, processos: +1 }, avaliacao: "boa", ensinamento: "Clientes em observação passiva estão esperando um sinal. A visita pessoal com documentação concreta transforma a dúvida em confiança — ou revela que a relação já estava frágil antes da crise ambiental." },
      { text: "Prospectar 3 novos clientes para compensar a perda de receita do contrato rescindido", risco: "medio", effects: { clientes: +2, financeiro: +1, processos: -1 }, avaliacao: "media", ensinamento: "Prospecção durante crise de reputação é o momento mais difícil para vender. Novos clientes pesquisam o histórico do fornecedor — e a autuação do IBAMA vai aparecer. A proteção dos clientes existentes tem prioridade." },
      { text: "Oferecer aos 3 clientes em observação um SLA estendido com garantia de qualidade como incentivo de permanência", risco: "medio", effects: { clientes: +3, qualidade: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "SLA estendido é um benefício tangível que transforma a permanência do cliente em decisão racional. A empresa demonstra que a crise ambiental não afetou a qualidade do produto — e assume uma posição de compromisso maior." },
      { text: "Aceitar a perda do cliente rescindido e focar 100% na regularização para proteger o restante da carteira", risco: "baixo", effects: { clientes: +1, conformidade: +2, processos: +2, financeiro: -1 }, avaliacao: "media", ensinamento: "Foco na regularização é o que vai proteger os clientes restantes no longo prazo. A perda de R$6,8M é dolorosa — mas um segundo cliente rescindindo por falta de ação vai custar mais do que o primeiro." }
    ]
  },
  {
    title: "A Regularização da Área Contaminada",
    description: "O laudo técnico do IBAMA identificou contaminação de solo na área de descarte. A remediação está incluída no TAC: descontaminação da área, análise de água subterrânea por 24 meses e revegetação da zona de proteção permanente. Custo estimado: R$1,9M nos próximos 36 meses. Uma empresa de remediação propõe fazer a obra por R$1,4M com garantia de resultado.",
    tags: ["industria"],
    choices: [
      { text: "Contratar a empresa de remediação pela R$1,4M com garantia de resultado — transferir o risco técnico", risco: "medio", effects: { conformidade: +4, seguranca: +3, financeiro: -3, processos: +2 }, avaliacao: "boa", ensinamento: "Contratar remediação com garantia de resultado é a abordagem mais segura. Se o processo não atender os parâmetros do IBAMA, o contratado é responsável pela execução adicional — não você." },
      { text: "Fazer a remediação com equipe própria para economizar R$500k e ter controle total do processo", risco: "alto", effects: { conformidade: +2, seguranca: +2, financeiro: -2, rh: -2, processos: -2 }, avaliacao: "ruim", ensinamento: "Remediação de solo contaminado por resíduo químico exige expertise técnica específica e equipamentos que uma indústria de embalagens não tem. A economia de R$500k pode virar R$2M+ se a remediação falhar na auditoria do IBAMA." },
      { text: "Negociar com o IBAMA um plano de remediação mais longo (48 meses) para diluir o custo sem comprometer o caixa", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { conformidade: +2, financeiro: +2, processos: +1 }, avaliacao: "boa", ensinamento: "Prazo mais longo no TAC é negociável quando acompanhado de cronograma detalhado e garantias de monitoramento. O IBAMA aceita prazos de remediação realistas — o que ele não aceita é ausência de ação." },
      { text: "Buscar seguro ambiental retroativo que cubra o custo de remediação", risco: "alto", effects: { conformidade: -1, financeiro: +1 }, avaliacao: "ruim", ensinamento: "Seguros ambientais não cobrem retroativamente eventos já ocorridos e já autuados. A contratação de seguro ambiental agora é para proteger eventos futuros — não o custo de remediação atual." }
    ]
  },
  {
    title: "O Engenheiro Ambiental Novo",
    description: "O novo responsável técnico ambiental — Rodrigo, 32 anos, mestrado em engenharia ambiental — apresenta um diagnóstico completo após 30 dias na empresa. Sua conclusão: 'O problema não foi o descarte pontual que o IBAMA autuou. A empresa tem 7 pontos de não-conformidade ambiental que ainda não foram detectados pelo órgão. Se não corrigirmos, a chance de nova autuação em 12 meses é alta.'",
    tags: ["industria"],
    choices: [
      { text: "Autorizar Rodrigo a corrigir todos os 7 pontos imediatamente — proatividade protege de futuras autuações", risco: "medio", effects: { conformidade: +5, seguranca: +3, processos: +3, financeiro: -3 }, avaliacao: "boa", ensinamento: "Corrigir proativamente 7 pontos de não-conformidade antes de nova autuação é a decisão de menor custo e maior proteção. Cada não-conformidade adicional autuada tem o mesmo potencial de dano que a primeira." },
      { text: "Priorizar os 3 pontos com maior risco de autuação e planejar os outros 4 para o próximo ano", risco: "baixo", effects: { conformidade: +3, seguranca: +2, processos: +2, financeiro: -2 }, avaliacao: "boa", ensinamento: "Priorização por risco é a alocação correta de recursos limitados. Os 3 pontos de maior risco de autuação corrigidos primeiro protegem a empresa dos danos mais prováveis." },
      { text: "Comunicar voluntariamente os 7 pontos ao IBAMA como ato de boa fé antes de corrigir", risco: "alto", gestorEffects: { capitalPolitico: +1 }, effects: { conformidade: +3, clientes: +2, financeiro: -1 }, avaliacao: "media", ensinamento: "Autodeclaração ao IBAMA demonstra boa fé e pode ser tratada como atenuante em futuras autuações. O risco é que o IBAMA pode incluir os 7 pontos no TAC atual com prazos mais apertados." },
      { text: "Não comunicar ao IBAMA e corrigir em silêncio para não chamar atenção para os outros pontos", risco: "medio", effects: { conformidade: +2, processos: +2, seguranca: +1 }, avaliacao: "media", ensinamento: "Corrigir sem comunicar é tecnicamente correto — você não é obrigado a autodeclarar. O risco é que se o IBAMA inspecionar e encontrar registros dos problemas antes da correção, a intenção de ocultação agrava a situação." }
    ]
  },
  {
    title: "A Pressão dos Colaboradores",
    description: "O sindicato dos químicos convocou assembleia. Os trabalhadores estão preocupados com o futuro da empresa após a autuação e a operação parcial. O presidente do sindicato pede reunião urgente: 'Nossos associados precisam saber se a empresa vai fechar, cortar salários ou demitir.' O RH alerta que o absenteísmo subiu 22% nas últimas 3 semanas.",
    tags: ["industria"],
    choices: [
      { text: "Realizar assembleia aberta com todos os colaboradores — transparência total sobre a situação e o plano", risco: "baixo", gestorEffects: { reputacaoInterna: +3 }, effects: { rh: +5, conformidade: +1, processos: +1 }, avaliacao: "boa", ensinamento: "Transparência com colaboradores em crise é a única forma de combater o rumor. Um colaborador que entende a situação real e acredita no plano é um aliado. Um colaborador com medo e desinformação é fonte de absenteísmo e pedido de demissão." },
      { text: "Reunir-se apenas com as lideranças e os representantes sindicais — não fazer assembleia geral", risco: "medio", effects: { rh: +3, processos: +1 }, avaliacao: "media", ensinamento: "Reunião com lideranças e sindicato é o canal correto para informação oficial — mas as lideranças levam a mensagem para os trabalhadores com o filtro delas. Assembleia direta elimina o filtro." },
      { text: "Comunicar por escrito que a empresa está em regularização e não há previsão de demissões", risco: "medio", effects: { rh: +2, conformidade: +1 }, avaliacao: "media", ensinamento: "Comunicado escrito é o mínimo — mas em contexto de crise, papel não substitui presença. Colaboradores querem olhar nos olhos de quem está gerindo a situação e sentir que alguém está no controle." },
      { text: "Usar o absenteísmo elevado como argumento para demitir os colaboradores que mais faltaram", risco: "alto", gestorEffects: { reputacaoInterna: -4, capitalPolitico: -2 }, effects: { rh: -6, processos: -3, conformidade: -2 }, avaliacao: "ruim", ensinamento: "Demitir em crise por absenteísmo que tem origem na própria gestão da crise é o erro de liderança mais grave possível. O sindicato vai reagir, a imprensa vai noticiar, e o IBAMA pode interpretar como instabilidade da empresa." }
    ]
  },
  {
    title: "A Certificação ISO 14001",
    description: "O responsável técnico Rodrigo recomenda buscar a certificação ISO 14001 (sistema de gestão ambiental) como demonstração de mudança estrutural. Dois clientes já perguntaram se a empresa vai buscar a certificação. O processo leva 12-18 meses e custa R$280k entre consultoria e auditoria. A certificação transforma a crise em caso de transformação.",
    tags: ["industria"],
    choices: [
      { text: "Iniciar o processo de ISO 14001 imediatamente como parte da resposta à crise", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { conformidade: +5, clientes: +3, processos: +3, financeiro: -3 }, avaliacao: "boa", ensinamento: "ISO 14001 em resposta a uma autuação transforma a crise em catalisador de maturidade. A certificação demonstra que a empresa não apenas corrigiu o problema — mudou o sistema que permitiu o problema." },
      { text: "Aguardar a conclusão da regularização do TAC antes de iniciar a ISO 14001", risco: "medio", effects: { conformidade: +2, processos: +2, financeiro: +1 }, avaliacao: "media", ensinamento: "Sequenciar TAC antes da ISO é razoável — mas os dois processos têm mais de 50% de sobreposição de atividades. Iniciar a ISO durante o TAC elimina trabalho duplicado e compressa o prazo total." },
      { text: "Buscar ISO 14001 apenas depois de perguntar formalmente se os clientes valorizam a certificação", risco: "baixo", effects: { clientes: +2, conformidade: +1, processos: +1 }, avaliacao: "media", ensinamento: "Perguntar antes de investir é prudente — mas dois clientes já perguntaram sobre a certificação. O sinal está dado. Mais pesquisa pode parecer hesitação em vez de planejamento." },
      { text: "Criar um sistema de gestão ambiental próprio sem buscar a certificação externa — resultado similar sem o custo de auditoria", risco: "medio", effects: { conformidade: +3, processos: +3, financeiro: -1, clientes: +1 }, avaliacao: "media", ensinamento: "Sistema interno sem certificação tem valor operacional real — mas não tem o valor de mercado da ISO 14001. Para clientes que exigem a certificação em edital, o sistema próprio não substitui o certificado externo." }
    ]
  },
  {
    title: "A Retomada Completa da Operação",
    description: "O IBAMA aprovou as obras de remediação e o PGRS implementado. A planta pode retornar a 100% da capacidade em 30 dias. O diretor comercial quer anunciar ao mercado a retomada. O time de comunicação propõe uma campanha de relançamento da empresa com o tema 'Química com Responsabilidade'.",
    tags: ["industria"],
    choices: [
      { text: "Fazer o relançamento com campanha, convite para visita de clientes e parceiros e publicação dos indicadores ambientais", risco: "baixo", gestorEffects: { capitalPolitico: +3 }, effects: { clientes: +4, conformidade: +3, rh: +2, financeiro: -2 }, avaliacao: "boa", ensinamento: "Relançamento com dados concretos e convite para validação in loco é a forma mais eficiente de restaurar a reputação. Ninguém vai acreditar na transformação por comunicado — vendo, acreditam." },
      { text: "Retornar à operação sem anúncio público — deixar os resultados falarem ao longo do tempo", risco: "medio", effects: { conformidade: +2, processos: +2, financeiro: +1 }, avaliacao: "media", ensinamento: "Retorno silencioso é modesto — mas em mercados B2B onde a reputação importa, o silêncio pode ser interpretado como vergonha. Um anúncio estruturado com dados de regularização é mais profissional do que humilde demais." },
      { text: "Contatar individualmente os 5 maiores clientes antes do anúncio público — dar a eles a primícia da retomada", risco: "baixo", effects: { clientes: +4, conformidade: +2, rh: +1 }, avaliacao: "boa", ensinamento: "Dar a primícia da retomada aos clientes mais importantes antes do anúncio geral demonstra que o relacionamento é prioritário. Clientes que souberam diretamente de você têm uma experiência diferente de quem soube pela imprensa." },
      { text: "Convidar o IBAMA para uma visita de verificação antes do anúncio — obter endosso do órgão regulador", risco: "baixo", effects: { conformidade: +5, clientes: +3, processos: +2 }, avaliacao: "boa", ensinamento: "Visita do IBAMA antes do relançamento — e menção ao resultado positivo dela no comunicado — é o endosso mais valioso possível. O regulador que autuou e depois visita a planta regularizada é a prova mais crível de transformação." }
    ]
  },
  {
    title: "O Futuro da Indústria Química Responsável",
    description: "A empresa superou a crise mais grave de sua história. O board pede a visão estratégica para os próximos 3 anos.",
    tags: ["industria"],
    choices: [
      { text: "Química verde: migrar progressivamente para solventes e insumos com menor impacto ambiental, antecipando regulação futura", effects: { conformidade: +5, clientes: +4, qualidade: +4, financeiro: +3, processos: +3, seguranca: +3 }, avaliacao: "boa", ensinamento: "Química verde não é apenas ESG — é antecipação regulatória. A regulação europeia REACH e as tendências do mercado brasileiro sinalizam restrição progressiva de compostos. Migrar antes da obrigação garante vantagem de 3-5 anos." },
      { text: "Centro de excelência ambiental: transformar o conhecimento de gestão ambiental em serviço para outras indústrias", effects: { inovacao: +4, financeiro: +3, conformidade: +4, clientes: +3, processos: +4 }, avaliacao: "boa", ensinamento: "A expertise ambiental construída na crise tem valor comercial. Outras indústrias químicas precisam de consultoria, PGRS e suporte regulatório — e quem já passou pela experiência e saiu do outro lado tem credibilidade única." },
      { text: "Expansão para química de alta especialidade: produtos com margem 5x maior e regulação mais estrita", requisitos: { indicadorMinimo: { conformidade: 13, qualidade: 11 } }, effects: { financeiro: +5, qualidade: +4, conformidade: +4, clientes: +3, inovacao: +3 }, avaliacao: "boa", ensinamento: "Alta especialidade química requer conformidade ambiental exemplar — que você agora tem. Margens de 40-60% em produtos especializados versus 12-18% em commodities justificam o investimento em P&D e certificação." },
      { text: "Parceria com startups de cleantech: ser a planta de referência para novos processos de química sustentável", effects: { inovacao: +5, conformidade: +4, processos: +3, clientes: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Ser planta de referência para cleantech cria fluxo de inovação que uma empresa tradicional não consegue desenvolver internamente. A parceria traz tecnologia — você traz a escala industrial e o know-how de processo." }
    ]
  }
]

]; // fim IndustriaRounds
