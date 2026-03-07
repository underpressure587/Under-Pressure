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
]; // fim IndustriaRounds

export default IndustriaRounds;
