/* ═══════════════════════════════════════════════════════
   BETA · LOGÍSTICA · ROUNDS v5.0
   8 indicadores: financeiro, rh, clientes, processos,
                  sla, frota, seguranca, tecnologia
═══════════════════════════════════════════════════════ */

const LogisticaRounds = [
[
  { title: "O SLA Está Quebrando",
    description: "Rafael, seu diretor de operações, apresenta os dados do último trimestre: 31% das entregas estão fora do prazo de 48h. O benchmark do setor é 12%. Os dois principais clientes têm cláusula de multa por SLA — e nenhum dos dois foi acionado ainda, mas estão monitorando.",
    tags: ["logistica"],
    choices: [
      { risco:"baixo", text:"Mapear os gargalos por etapa do processo: coleta, rota, CD e última milha", effects:{processos:+4,rh:+1,sla:+2}, avaliacao:"boa", ensinamento:"Diagnóstico por etapa identifica onde a ruptura real acontece. Em logística, o problema raramente está onde parece." },
      { risco:"medio", text:"Contratar consultoria especializada em supply chain para o diagnóstico", effects:{financeiro:-4,processos:+2,sla:+1}, avaliacao:"media", ensinamento:"Consultoria traz metodologia e benchmarks, mas o diagnóstico mais preciso vem de quem conhece as peculiaridades da operação local." },
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+1}, text:"Aumentar o quadro de entregadores em 20% imediatamente para cobrir o volume", effects:{financeiro:-5,rh:-2,processos:-1,sla:-1}, avaliacao:"ruim", ensinamento:"Contratar sem diagnóstico pode ampliar o problema. Se o gargalo está no CD ou na triagem, mais entregadores não resolvem." },
      { text:"Renegociar o SLA com os clientes para 72h enquanto resolve o problema operacional", effects:{clientes:-4,processos:+1,sla:-2}, avaliacao:"ruim", ensinamento:"Renegociar o SLA para baixo em vez de corrigir a operação é admitir incapacidade e cria precedente ruim." }
    ]
  },
  { title: "O Entregador Mais Produtivo Pediu Demissão",
    description: "Seu entregador de maior volume — 340 entregas por mês, zero acidentes, NPS do cliente 4,8/5 — pediu demissão citando 'falta de reconhecimento e plano de carreira'. É o quinto entregador acima da média a sair em 3 meses. A rotatividade da operação está em 68% ao ano.",
    tags: ["logistica"],
    choices: [
      { text:"Criar plano de carreira para entregadores: supervisor de rota, coordenador de CD, analista de operações", effects:{rh:+6,processos:+2,financeiro:-2,sla:+1}, avaliacao:"boa", ensinamento:"Entregadores de alta performance saem por falta de futuro, não de salário. Um plano de carreira claro retém os melhores e cria pipeline interno de liderança." },
      { text:"Oferecer bônus de R$ 500/mês para entregadores com performance acima de 300 entregas e NPS>4.5", effects:{rh:+5,financeiro:-3,sla:+2}, avaliacao:"boa", ensinamento:"Bônus por performance reconhece concretamente quem mais contribui. Vinculado ao NPS do cliente, alinha o incentivo individual ao resultado que o negócio precisa." },
      { text:"Fazer pesquisa de clima com todos os entregadores antes de tomar qualquer decisão", effects:{rh:+3,processos:+1}, avaliacao:"media", ensinamento:"Pesquisa antes de agir é prudente, mas com 5 saídas consecutivas de alta performance o padrão já está claro." },
      { text:"Contratar novos entregadores para compensar as saídas e manter o volume de operação", effects:{financeiro:-4,rh:-3,processos:-2,frota:-1}, avaliacao:"ruim", ensinamento:"Contratar para compensar a rotatividade sem atacar a causa é remar contra a maré. O custo de treinar um entregador novo para atingir 340 entregas/mês é significativo." }
    ]
  },
  { title: "O Centro de Distribuição Está no Limite",
    description: "O CD principal — responsável por 54% do volume — opera a 97% da capacidade. Em dias de pico, ocorrem gargalos de triagem que atrasam toda a operação em 4 a 6 horas. A ampliação do CD custaria R$ 2,8M. O aluguel de um galpão adicional custaria R$ 85k/mês.",
    tags: ["logistica"],
    choices: [
      { risco:"medio", text:"Alugar o galpão adicional como CD de overflow para os dias de pico imediatamente", effects:{financeiro:-3,processos:+4,clientes:+2,sla:+3}, avaliacao:"boa", ensinamento:"Galpão adicional resolve o pico com custo previsível sem comprometer capital em imobilizado." },
      { risco:"medio", text:"Implementar turnos noturnos no CD para desafogar o volume em 24h ao invés de 12h", effects:{rh:-3,processos:+5,financeiro:-2,sla:+2}, avaliacao:"media", ensinamento:"Turnos noturnos aumentam a capacidade sem capex adicional, mas têm custo de adicional noturno e impacto na saúde do time." },
      { text:"Investir R$ 2,8M na ampliação do CD — resolver definitivamente o problema de capacidade", effects:{financeiro:-7,processos:+7,clientes:+3,sla:+4}, avaliacao:"media", ensinamento:"Investimento em capacidade permanente é correto se o volume justifica. Mas R$ 2,8M de capex em operação com SLA quebrado exige projeção de crescimento sólida." },
      { text:"Redistribuir volume entre os 8 CDs para equilibrar a carga sem investimento adicional", effects:{processos:+3,clientes:-2,rh:-1,sla:+1}, avaliacao:"media", ensinamento:"Rebalancear entre CDs existentes é custo zero imediato, mas aumenta o custo de frete entre CDs. Redistribuição geográfica raramente é neutra em custo total." }
    ]
  },
  { title: "O TMS Está Desatualizado",
    description: "O sistema de gerenciamento de transporte (TMS) foi implementado em 2017 e não integra com o sistema dos clientes novos. Resultado: 40% dos pedidos ainda são inseridos manualmente, causando erros e atrasos de até 2 horas. O mercado tem soluções SaaS que integram em 2 semanas por R$ 18k/mês.",
    tags: ["logistica"],
    choices: [
      { text:"Contratar o TMS SaaS de mercado — integrar em 2 semanas e eliminar os erros manuais", effects:{processos:+6,financeiro:-3,rh:-1,tecnologia:+6,sla:+3}, avaliacao:"boa", ensinamento:"Modernizar o TMS com solução de mercado é quase sempre melhor do que manter sistema legado. O custo mensal de R$ 18k se paga com a eliminação dos erros e atrasos." },
      { text:"Desenvolver integração customizada no TMS atual para preservar o investimento histórico", effects:{financeiro:-5,processos:-2,rh:-2,tecnologia:-1}, avaliacao:"ruim", ensinamento:"Customizar sistema legado para integrar tecnologia moderna é caminho de alto custo e baixa velocidade. O investimento histórico no TMS de 2017 já foi." },
      { text:"Contratar desenvolvedores para construir API de integração entre os sistemas existentes e os dos clientes", effects:{financeiro:-4,processos:+2,rh:-1,tecnologia:+3}, avaliacao:"media", ensinamento:"API customizada é mais flexível mas mais lenta e cara. Para um problema operacional que está impactando SLA hoje, 2 semanas de implementação do SaaS supera meses de desenvolvimento." },
      { risco:"baixo", text:"Manter o processo manual com checklist reforçado para reduzir os erros humanos", effects:{processos:-3,rh:-2,sla:-2}, avaliacao:"ruim", ensinamento:"Checklist não resolve erro sistêmico de processo manual em escala. Adicionar controle manual sobre processo manual apenas aumenta a burocracia." }
    ]
  },
  { title: "O Cliente Principal Representa 38% da Receita",
    description: "A auditoria de carteira revela concentração preocupante: um único cliente representa 38% da receita. O contrato vence em 14 meses. O diretor de vendas alerta: eles estão em negociação com dois concorrentes.",
    tags: ["logistica"],
    choices: [
      { text:"Iniciar campanha ativa de vendas para reduzir a dependência antes da renovação do contrato", effects:{clientes:+4,financeiro:-2,rh:-1,sla:+1}, avaliacao:"boa", ensinamento:"Diversificação de carteira é o único antídoto estrutural para a concentração de receita. Começar 14 meses antes ainda dá tempo de construir alternativas." },
      { text:"Investir no cliente principal para garantir a renovação — propor expansão de escopo do serviço", effects:{clientes:+3,financeiro:-3,sla:+2}, avaliacao:"boa", ensinamento:"Expandir o escopo com o cliente principal aumenta o switching cost e a dependência mútua. Um cliente que usa 5 serviços seus é muito mais difícil de perder." },
      { text:"Renegociar o contrato com desconto para garantir renovação de 3 anos antes da concorrência agir", effects:{financeiro:-4,clientes:+3,sla:+1}, avaliacao:"media", ensinamento:"Desconto para renovação antecipada sacrifica margem mas garante previsibilidade. Se o operacional melhorar até lá, você pode renegociar de posição de força no próximo ciclo." },
      { text:"Aguardar — o cliente provavelmente está usando a negociação com concorrentes como pressão de preço", effects:{clientes:-5,financeiro:-3,sla:-1}, avaliacao:"ruim", ensinamento:"Assumir que a ameaça é só blefe é o risco mais caro em gestão de carteira de clientes. Com 38% da receita em jogo, qualquer estratégia é melhor que a inação." }
    ]
  },
  { title: "Acidente com Entregador em Moto",
    description: "Um entregador sofreu acidente grave com fratura de clavícula. O seguro cobre as despesas médicas, mas a investigação interna revelou que 23% da frota de motos tem manutenção atrasada há mais de 60 dias. O acidente viralizou nas redes com crítica à 'uberização' sem condições seguras de trabalho.",
    tags: ["logistica"],
    choices: [
      { text:"Suspender a frota com manutenção atrasada, regularizar tudo e implementar checklist semanal obrigatório", effects:{processos:+5,rh:+4,clientes:-2,financeiro:-3,frota:+4,seguranca:+5}, avaliacao:"boa", ensinamento:"Segurança da frota não é custo — é pré-requisito operacional. Suspender motos irregulares antes de um segundo acidente é a decisão certa mesmo com impacto no curto prazo." },
      { risco:"baixo", gestorEffects:{reputacaoInterna:+2}, text:"Comunicar publicamente o suporte ao entregador e o plano de manutenção da frota", effects:{rh:+3,clientes:+1,processos:+2,seguranca:+2}, avaliacao:"boa", ensinamento:"Transparência sobre ação corretiva em acidente de trabalho constrói reputação. O mercado de talento logístico é pequeno — como você trata um acidente é observado por todos." },
      { risco:"medio", gestorEffects:{capitalPolitico:-1}, text:"Investigar internamente por uma semana antes de tomar qualquer decisão pública", effects:{rh:-4,clientes:-3,processos:-2,seguranca:-2}, avaliacao:"ruim", ensinamento:"Em acidente de trabalho com repercussão pública, uma semana de silêncio é lida como omissão." },
      { text:"Migrar toda a frota para motoristas PJ para reduzir a responsabilidade trabalhista da empresa", effects:{rh:-6,financeiro:+2,clientes:-3,frota:-2,seguranca:-3}, avaliacao:"ruim", ensinamento:"Migrar para PJ como resposta a acidente de trabalho é percebido como precarização, não como solução. Aumenta o risco jurídico de vínculo empregatício disfarçado." }
    ]
  },
  { title: "Startup de Drone Delivery Propõe Parceria",
    description: "Uma startup de drone delivery com tecnologia homologada pela ANAC propõe parceria: você opera o hub de distribuição, eles operam os drones para última milha em dois bairros nobres de São Paulo. O custo por entrega cai 40% nessas zonas, mas a parceria exige exclusividade por 18 meses.",
    tags: ["logistica"],
    choices: [
      { text:"Aceitar a parceria como piloto em escala limitada — 2 bairros, sem exclusividade total", effects:{processos:+4,clientes:+3,financeiro:-2,tecnologia:+3}, avaliacao:"boa", ensinamento:"Pilotos com tecnologia emergente permitem aprender sem comprometer toda a operação. Negociar para reduzir a exclusividade mantém a flexibilidade de expandir para outros players." },
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+1}, text:"Aceitar com exclusividade total — ser pioneiro em drone delivery cria vantagem competitiva real", requisitos:{indicadorMinimo:{financeiro:9},semFlags:["crescimento_sem_caixa"]}, effects:{processos:+3,clientes:+4,financeiro:-4,rh:-2,tecnologia:+4}, avaliacao:"media", ensinamento:"Exclusividade com startup não consolidada trava a estratégia por 18 meses. Se o piloto falhar, você carrega o ônus sem alternativa." },
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+1}, text:"Adquirir participação na startup em vez de parceria operacional", effects:{financeiro:-6,processos:+3,clientes:+2,tecnologia:+5}, avaliacao:"media", ensinamento:"Investir na startup alinha os incentivos e dá acesso à tecnologia a longo prazo. O risco é a distração de gestão e o capital imobilizado numa empresa ainda em validação." },
      { text:"Recusar — drone delivery ainda não está regulamentado para escala e o risco operacional é alto", effects:{processos:+1,clientes:-2,tecnologia:-1}, avaliacao:"media", ensinamento:"Prudência com tecnologia não validada em escala é razoável. Mas recusar por completo perde a janela de aprendizado com custo baixo." }
    ]
  },
  { title: "Greve dos Entregadores por 48 Horas",
    description: "Entregadores de 3 CDs paralisaram por 48 horas reivindicando reajuste de 15% e seguro de acidentes melhorado. O cliente principal tem pedidos urgentes represados. O advogado diz que a paralisação é ilegal por falta de aviso prévio.",
    tags: ["logistica"],
    choices: [
      { text:"Entrar na negociação reconhecendo as demandas legítimas e propondo um acordo em 24 horas", effects:{rh:+5,clientes:-2,financeiro:-3,sla:-1,seguranca:+2}, avaliacao:"boa", ensinamento:"Negociar de boa fé com trabalhadores em greve é mais eficiente do que confrontação jurídica." },
      { text:"Acionar o advogado para impetrar interdito proibitório e retomar a operação por via judicial", effects:{rh:-6,clientes:-1,processos:+2,seguranca:-2}, avaliacao:"ruim", ensinamento:"Resolução judicial de greve gera ressentimento que dura anos. O custo do litígio e do clima organizacional deteriorado supera o ganho operacional de curto prazo." },
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+1}, text:"Atender o reajuste de 15% e o seguro — custará R$ 280k/ano mas encerra a crise", effects:{rh:+6,financeiro:-4,processos:+2,seguranca:+3,sla:+1}, avaliacao:"boa", ensinamento:"Custo de greve continuada supera o custo do acordo em operações de escala. R$ 280k/ano em reajuste e seguro é contabilmente justificável." },
      { text:"Propor reajuste de 8% e criar comitê de melhoria de condições para discutir o restante", effects:{rh:+3,financeiro:-2,processos:+1}, avaliacao:"media", ensinamento:"Proposta intermediária pode ser percebida como boa fé ou como procrastinação. Em greves, a percepção coletiva define se a paralisação continua." }
    ]
  },
  { title: "Concorrente Faz Dumping de Preço",
    description: "Um concorrente financiado por venture capital lançou operação na mesma praça com preço 35% abaixo do seu. O mercado sabe que o preço é insustentável — mas dois clientes médios já migraram. Seu time de vendas está pedindo autorização para reduzir o preço nos contratos em renovação.",
    tags: ["logistica"],
    choices: [
      { text:"Não reduzir o preço — mostrar aos clientes o custo total de mudança de operador e os riscos de SLA", effects:{clientes:+3,financeiro:+3,rh:+2,sla:+1}, avaliacao:"boa", ensinamento:"Competir em valor, não em preço, é a postura correta frente a dumping. O custo de migração de um operador logístico frequentemente supera o desconto oferecido." },
      { text:"Criar pacote premium com SLA garantido e rastreamento em tempo real para clientes que não querem risco", effects:{clientes:+4,processos:+3,financeiro:-2,sla:+3,tecnologia:+2}, avaliacao:"boa", ensinamento:"Diferenciação por nível de serviço é a resposta estratégica ao dumping de preço. Clientes que valorizam confiabilidade pagam prêmio por garantia." },
      { text:"Reduzir o preço para 15% abaixo do concorrente para recuperar os clientes perdidos", effects:{financeiro:-7,clientes:+2,sla:-1}, avaliacao:"ruim", ensinamento:"Entrar na guerra de preços com player capitalizado por VC é batalha que operadores tradicionais raramente vencem. Margem destruída hoje não volta quando o concorrente ajustar o modelo." },
      { text:"Propor contratos de longo prazo (3 anos) com cláusula de reajuste garantida para os clientes atuais", effects:{financeiro:+3,clientes:+4,processos:+2,sla:+2}, avaliacao:"boa", ensinamento:"Contratos longos criam estabilidade de receita e elevam o custo de saída para o cliente. Quem assina um contrato de 3 anos não migra para o concorrente mais barato no mês seguinte." }
    ]
  },
  { title: "O Contrato do Cliente Principal Entra em Renegociação",
    description: "O cliente que representa 38% da receita entrou oficialmente em processo de renegociação. Eles querem redução de 18% no preço e melhoria de SLA de 48h para 36h. Apresentaram proposta concorrente como argumento. Você tem 15 dias para responder.",
    tags: ["logistica"],
    choices: [
      { text:"Aceitar 10% de redução e comprometer-se com SLA de 40h — ponto de equilíbrio viável", effects:{financeiro:-3,clientes:+5,processos:+2,sla:+3}, avaliacao:"boa", ensinamento:"Negociação que encontra ponto de equilíbrio preserva o relacionamento sem destruir a margem. Aceitar 10% de redução é custo real, mas perder 38% da receita seria um choque impossível de absorver." },
      { text:"Recusar qualquer redução de preço mas oferecer melhorias operacionais como serviços adicionais", effects:{clientes:+2,processos:+3,financeiro:+2,sla:+1}, avaliacao:"media", ensinamento:"Defender o preço com valor adicionado é válido se os serviços propostos têm valor real para o cliente. Se o concorrente tem proposta concreta e você não move, o risco de perda é alto." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-1,capitalPolitico:+2}, text:"Aceitar as condições integralmente — perder esse cliente não é opção", effects:{financeiro:-5,clientes:+3,sla:+1}, avaliacao:"ruim", ensinamento:"Aceitar 18% de redução em 38% da receita é impacto de 6,8% no faturamento total. Além disso, cria precedente: o cliente sabe que pode extrair mais na próxima renovação." },
      { text:"Usar os 15 dias para fechar 3 novos contratos médios e renegociar do zero com mais alternativas", effects:{financeiro:-2,clientes:+4,processos:-2,sla:-1}, avaliacao:"media", ensinamento:"Diversificar antes de negociar melhora o poder de barganha estruturalmente. O risco é que 15 dias podem não ser suficientes para fechar novos contratos que compensem a perda potencial." }
    ]
  },
  { title: "Proposta de Expansão para Mais 3 Estados",
    description: "Um fundo de infraestrutura quer financiar a expansão para 3 novos estados com R$ 12M, em troca de 22% da empresa. A operação atual ainda está sob pressão de SLA. Expandir significa abrir 5 novos CDs, contratar 200 entregadores e replicar uma operação que ainda não está funcionando perfeitamente.",
    tags: ["logistica"],
    choices: [
      { text:"Recusar e resolver os problemas operacionais da operação atual antes de qualquer expansão", effects:{processos:+5,rh:+3,financeiro:-1,sla:+4,frota:+2}, avaliacao:"boa", ensinamento:"Expandir operação com SLA quebrado é exportar o problema para novos mercados. Crescer com disfunção operacional multiplica os custos de retrabalho." },
      { text:"Aceitar com condição de expansão apenas após 6 meses de SLA acima de 95% na operação atual", effects:{financeiro:+4,processos:+3,clientes:+2,sla:+2}, avaliacao:"boa", ensinamento:"Condicionar expansão a meta operacional protege a empresa e o investidor. Fundos sérios respeitam gestores que sabem dizer não ao capital prematuro." },
      { risco:"alto", gestorEffects:{capitalPolitico:+3,esgotamento:+3}, text:"Aceitar e expandir imediatamente — o capital resolve o problema de capacidade", requisitos:{faseEmpresa:["crescimento","consolidacao","expansao"],indicadorMinimo:{processos:9}}, effects:{financeiro:+6,processos:-6,rh:-4,clientes:-3,sla:-4}, avaliacao:"ruim", ensinamento:"Capital não resolve problema operacional — só o amplifica. Abrir 5 CDs e contratar 200 pessoas com SLA a 31% de descumprimento cria o caos em escala." },
      { risco:"medio", gestorEffects:{capitalPolitico:+1}, text:"Propor expansão para apenas 1 estado como piloto com R$ 4M e 12% da empresa", effects:{financeiro:+3,processos:-2,clientes:+2,sla:-1}, avaliacao:"media", ensinamento:"Piloto em um estado equilibra a oportunidade de crescimento com o risco operacional. O acordo menor testa a capacidade de replicação antes de comprometer o capital e a participação total." }
    ]
  },
  { title: "Automação dos CDs: Robôs ou Humanos?",
    description: "Uma empresa de automação industrial propõe instalar esteiras automatizadas e robôs de triagem nos 3 maiores CDs. Redução de 35% no custo por pacote triado. Investimento de R$ 4,2M. O projeto torna 47 postos de trabalho de triagem desnecessários.",
    tags: ["logistica"],
    choices: [
      { text:"Implementar automação com plano de requalificação: os 47 operadores migram para controle e manutenção", effects:{processos:+6,financeiro:-3,rh:-2,tecnologia:+4,sla:+3}, avaliacao:"boa", ensinamento:"Automação com requalificação ativa é a transição mais sustentável. Reduz o custo operacional e preserva o conhecimento institucional." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-3,capitalPolitico:+2}, text:"Implementar automação e desligar os 47 funcionários com indenização justa", effects:{processos:+7,financeiro:-5,rh:-6,tecnologia:+5,sla:+3}, avaliacao:"media", ensinamento:"Desligamento com indenização é juridicamente correto mas tem custo de reputação como empregador em mercado onde você precisa contratar constantemente." },
      { text:"Implementar automação apenas nos 2 CDs com maior custo operacional e avaliar antes de expandir", effects:{processos:+4,financeiro:-2,rh:-1,tecnologia:+3,sla:+2}, avaliacao:"boa", ensinamento:"Implementação faseada reduz o risco técnico e social da automação. Dois CDs como piloto provam o ROI antes de comprometer capital nos outros 6." },
      { text:"Recusar — automação cria dependência tecnológica e vulnerabilidade operacional em caso de falha", effects:{rh:+3,processos:-3,financeiro:-2,tecnologia:-1}, avaliacao:"ruim", ensinamento:"Recusar automação por medo de dependência tecnológica mantém estrutura de custo não competitiva. A vulnerabilidade existe no sistema humano também." }
    ]
  },
  { title: "Proposta de White Label para E-commerce",
    description: "Um e-commerce regional quer que você opere toda a logística deles com marca branca. O contrato vale R$ 3,8M por 2 anos e exige exclusividade de atendimento em 3 cidades. Pode parecer bom, mas significa desviar capacidade dos seus próprios clientes.",
    tags: ["logistica"],
    choices: [
      { text:"Aceitar apenas se tiver capacidade ociosa real e sem impactar o SLA dos clientes atuais", effects:{financeiro:+4,clientes:+2,processos:+2,sla:+1}, avaliacao:"boa", ensinamento:"White label é margem adicional quando há capacidade disponível. Aceitá-lo às custas do SLA dos clientes atuais é trocar um relacionamento consolidado por um novo contrato que pode não renovar." },
      { text:"Aceitar e contratar os recursos adicionais necessários para atender sem impacto na operação atual", effects:{financeiro:+3,rh:-3,processos:-2,frota:-1}, avaliacao:"media", ensinamento:"Contratar para atender white label funciona se o prazo de contratação e treinamento for menor que o prazo de início do contrato." },
      { risco:"baixo", gestorEffects:{reputacaoInterna:+1}, text:"Recusar — white label dilui a marca e desvia foco da operação principal", effects:{processos:+2,clientes:-1}, avaliacao:"media", ensinamento:"Recusar white label por princípio ignora R$ 3,8M de receita em contrato de 2 anos. O dilema da marca é real, mas o impacto financeiro justifica análise séria." },
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+2}, text:"Criar subsidiária operacional dedicada ao white label para separar as marcas e os times", requisitos:{indicadorMinimo:{financeiro:10},semFlags:["crescimento_sem_caixa"]}, effects:{financeiro:-2,processos:+3,rh:-2,tecnologia:+1}, avaliacao:"media", ensinamento:"Subsidiária separada preserva a marca e isola o risco operacional. O custo de criar e operar uma entidade jurídica separada precisa ser comparado com a margem do contrato." }
    ]
  },
  { title: "Oportunidade de Contrato com o Governo",
    description: "Uma secretaria estadual de saúde precisa de operador logístico para distribuir insumos médicos em 127 municípios. Contrato de R$ 8,4M por 3 anos. As exigências são complexas: rastreabilidade em tempo real, temperatura controlada e SLA de 24h mesmo em municípios remotos.",
    tags: ["logistica"],
    choices: [
      { risco:"medio", text:"Propor piloto em 30 municípios para validar a operação antes de assumir os 127", effects:{financeiro:+3,processos:+3,clientes:+2,tecnologia:+3,sla:+1}, avaliacao:"boa", ensinamento:"Piloto com governo é a forma mais segura de entrar em setor com exigências técnicas que você ainda não validou operacionalmente." },
      { text:"Aceitar o contrato completo e adquirir os equipamentos de temperatura controlada necessários", effects:{financeiro:+5,processos:-3,rh:-2,clientes:-2,frota:-1}, avaliacao:"media", ensinamento:"Insumos médicos com rastreabilidade e temperatura controlada exigem competência técnica específica. Entrar nos 127 municípios sem pilotar é exposição a multas contratuais." },
      { risco:"medio", gestorEffects:{capitalPolitico:-1}, text:"Recusar — logística de saúde é segmento especializado fora do core da empresa", effects:{processos:+2,financeiro:-2}, avaliacao:"media", ensinamento:"Disciplina estratégica em não entrar em segmentos que exigem competência não desenvolvida é válida. Contratos governamentais de saúde têm penalidades severas por descumprimento de SLA." },
      { text:"Aceitar em parceria com empresa especializada em logística de saúde — dividir receita e risco", effects:{financeiro:+3,processos:+4,clientes:+2,tecnologia:+2,sla:+2}, avaliacao:"boa", ensinamento:"Parceria para entrar em mercado com competência complementar é a forma mais inteligente de capturar a oportunidade sem assumir risco técnico solo." }
    ]
  },
  { title: "O Futuro da Operação: Qual Logística Você Quer Ser?",
    description: "Após um ciclo de transformação intensa, o mercado de logística continua mudando rápido. Você precisa definir o posicionamento estratégico para os próximos 3 anos.",
    tags: ["logistica"],
    choices: [
      { text:"Tech-first: investir em TMS próprio, roteirização por IA e dashboard em tempo real para os clientes", effects:{financeiro:-3,processos:+7,clientes:+5,rh:+2,tecnologia:+7,sla:+4}, avaliacao:"boa", ensinamento:"Logística orientada a tecnologia cria diferenciação difícil de replicar para operadores tradicionais. Visibilidade em tempo real e roteirização inteligente são diferenciais que clientes enterprise pagam prêmio para ter." },
      { text:"Especialista em nicho: focar em cold chain (temperatura controlada) para farmácias e alimentos", effects:{financeiro:+4,clientes:+4,processos:+5,rh:+2,frota:+3,sla:+3}, avaliacao:"boa", ensinamento:"Especialização em nicho com barreiras técnicas cria pricing power e relacionamentos mais longos. Cold chain exige certificação, equipamento e know-how." },
      { risco:"alto", gestorEffects:{capitalPolitico:+2,esgotamento:+3}, text:"Expansão geográfica agressiva: cobrir todos os estados antes de otimizar a operação existente", requisitos:{faseEmpresa:["crescimento","consolidacao","expansao"],semFlags:["crescimento_sem_caixa"]}, effects:{financeiro:+3,processos:-6,rh:-4,clientes:-3,sla:-4}, avaliacao:"ruim", ensinamento:"Expansão geográfica com operação não otimizada exporta os problemas em escala. O resultado é SLA ruim em mais mercados." },
      { text:"Plataforma de logística: criar marketplace que conecta CDs, frota e entregadores independentes", effects:{financeiro:-2,clientes:+4,processos:+4,rh:-1,tecnologia:+5,sla:+2}, avaliacao:"boa", ensinamento:"Marketplace logístico cria escalabilidade sem o custo de ativo fixo. O risco é o problema do ovo e da galinha — precisa de oferta e demanda simultâneas para funcionar." }
    ]
  }
]
]; // fim LogisticaRounds

export default LogisticaRounds;
