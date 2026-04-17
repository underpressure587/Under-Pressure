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
      { text:"Renegociar o contrato com desconto para garantir renovação de 3 anos antes da concorrência agir", effects:{financeiro:-4,clientes:+3,sla:+1}, avaliacao:"media", ensinamento:"Desconto para renovação antecipada sacrifica financeiro mas garante previsibilidade. Se o operacional melhorar até lá, você pode renegociar de posição de força no próximo ciclo." },
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
      { text:"Aceitar 10% de redução e comprometer-se com SLA de 40h — ponto de equilíbrio viável", effects:{financeiro:-3,clientes:+5,processos:+2,sla:+3}, avaliacao:"boa", ensinamento:"Negociação que encontra ponto de equilíbrio preserva o relacionamento sem destruir a financeiro. Aceitar 10% de redução é custo real, mas perder 38% da receita seria um choque impossível de absorver." },
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
    description: "Um e-commerce regional quer que você opere toda a logística deles com clientes branca. O contrato vale R$ 3,8M por 2 anos e exige exclusividade de atendimento em 3 cidades. Pode parecer bom, mas significa desviar capacidade dos seus próprios clientes.",
    tags: ["logistica"],
    choices: [
      { text:"Aceitar apenas se tiver capacidade ociosa real e sem impactar o SLA dos clientes atuais", effects:{financeiro:+4,clientes:+2,processos:+2,sla:+1}, avaliacao:"boa", ensinamento:"White label é financeiro adicional quando há capacidade disponível. Aceitá-lo às custas do SLA dos clientes atuais é trocar um relacionamento consolidado por um novo contrato que pode não renovar." },
      { text:"Aceitar e contratar os recursos adicionais necessários para atender sem impacto na operação atual", effects:{financeiro:+3,rh:-3,processos:-2,frota:-1}, avaliacao:"media", ensinamento:"Contratar para atender white label funciona se o prazo de contratação e treinamento for menor que o prazo de início do contrato." },
      { risco:"baixo", gestorEffects:{reputacaoInterna:+1}, text:"Recusar — white label dilui a clientes e desvia foco da operação principal", effects:{processos:+2,clientes:-1}, avaliacao:"media", ensinamento:"Recusar white label por princípio ignora R$ 3,8M de receita em contrato de 2 anos. O dilema da clientes é real, mas o impacto financeiro justifica análise séria." },
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+2}, text:"Criar subsidiária operacional dedicada ao white label para separar as marcas e os times", requisitos:{indicadorMinimo:{financeiro:10},semFlags:["crescimento_sem_caixa"]}, effects:{financeiro:-2,processos:+3,rh:-2,tecnologia:+1}, avaliacao:"media", ensinamento:"Subsidiária separada preserva a clientes e isola o risco operacional. O custo de criar e operar uma entidade jurídica separada precisa ser comparado com a financeiro do contrato." }
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

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [1] · Logística Refrigerada · Cadeia do Frio
   Contexto: 190 colaboradores, 87 veículos refrigerados, 3 armazéns
   R$38M receita. Sensor falhou → R$620k em medicamentos devolvidos.
   18% da frota com monitoramento desatualizado. Auditoria iminente.

   INDICADORES: financeiro:7, rh:6, clientes:7, processos:4,
                sla:5, frota:7, seguranca:8, tecnologia:4

   ATENÇÃO: tecnologia (4) é o indicador mais crítico.
   tecnologia≤4 → sla-2 automaticamente. sla≤4 → clientes-2.
   frota≤5 → seguranca-2 → rh-2.
══════════════════════════════════════════════════════════════════ */
,
[
  {
    title: "A Falha que Expôs Tudo",
    description: "Você assume a gestão 72 horas após o incidente. O cliente farmacêutico acionou a cláusula de auditoria. O relatório interno de diagnóstico revela: 18% da frota tem sensores desatualizados, 3 armazéns com registro de temperatura manual (não automatizado), e o último treinamento de cold chain foi há 2 anos. O auditor chega em 15 dias. Por onde você começa?",
    tags: ["logistica"],
    choices: [
      { text: "Mapear os 87 veículos e classificar por criticidade de monitoramento — priorizar os que transportam medicamentos", risco: "baixo", effects: { processos: +4, tecnologia: +2, frota: +2, seguranca: +1 }, avaliacao: "boa", ensinamento: "Diagnóstico cirúrgico por prioridade é a primeira ação certa em qualquer crise operacional. Tratar todos os veículos igualmente desperdiça recursos que precisam ir para onde o risco é maior." },
      { text: "Suspender imediatamente todos os veículos com sensores desatualizados — zero risco de novo incidente", risco: "alto", gestorEffects: { capitalPolitico: +1 }, effects: { sla: -3, clientes: -3, financeiro: -3, seguranca: +4, tecnologia: +1 }, avaliacao: "media", ensinamento: "Suspensão total elimina o risco mas paralisa a operação. Com 87 veículos e 18% afetados, suspender 16 veículos de uma vez pressiona o SLA. A solução equilibrada é substituição escalonada com prioridade nos medicamentos." },
      { text: "Contratar empresa de monitoramento IoT para instalar sensores em toda a frota antes da auditoria", risco: "medio", effects: { tecnologia: +4, frota: +2, seguranca: +2, financeiro: -4, processos: +2 }, avaliacao: "boa", ensinamento: "Atualização completa de monitoramento é a solução estrutural. Investir antes da auditoria demonstra comprometimento real com a mudança — e sensores IoT têm custo marginal frente ao custo de um novo incidente." },
      { text: "Focar na preparação para a auditoria — apresentar um plano de ação detalhado mesmo sem ter executado", risco: "alto", gestorEffects: { capitalPolitico: -2 }, effects: { clientes: -3, processos: +1, seguranca: -2 }, avaliacao: "ruim", ensinamento: "Auditores farmacêuticos são treinados para distinguir plano de ação de ação em andamento. Apresentar plano sem execução concreta em uma auditoria de causa é percebido como gestão de aparências." }
    ]
  },
  {
    title: "A Auditoria do Cliente Farmacêutico",
    description: "O auditor passou 2 dias na operação. Relatório preliminar: 4 não-conformidades críticas — monitoramento de temperatura, rastreabilidade de lote, treinamento de operadores e documentação de desvios de temperatura. O cliente deu 30 dias para plano de ação com evidências de implementação. Se não aprovado, rescisão antecipada do contrato (R$9,2M/ano).",
    tags: ["logistica"],
    choices: [
      { text: "Responder às 4 não-conformidades em paralelo com times dedicados a cada uma — entregar evidências em 25 dias", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { processos: +5, tecnologia: +3, seguranca: +3, financeiro: -3, rh: -1 }, avaliacao: "boa", ensinamento: "Resposta paralela às não-conformidades demonstra capacidade de gestão de crise e comprometimento real. Entregar antes do prazo com evidências concretas reverte a percepção de risco do cliente." },
      { text: "Priorizar as 2 não-conformidades mais fáceis de resolver e pedir extensão de prazo para as outras 2", risco: "medio", effects: { processos: +2, seguranca: +2, clientes: -2, tecnologia: +1 }, avaliacao: "ruim", ensinamento: "Pedir extensão de prazo em auditoria de causa é sinal de gestão fraca. O cliente farmacêutico tem cronograma de processos de fornecedores — qualquer desvio vai para o relatório de risco de supply chain." },
      { text: "Contratar consultoria especializada em boas práticas de armazenamento farmacêutico para liderar o plano", risco: "medio", effects: { processos: +4, tecnologia: +2, seguranca: +2, financeiro: -4 }, avaliacao: "boa", ensinamento: "Consultoria especializada em GDP (Good Distribution Practices) farmacêutico traz credibilidade com o auditor e acelera a implementação. O custo é marginal frente ao contrato de R$9,2M em risco." },
      { text: "Reunir-se com o cliente para negociar a manutenção do contrato enquanto as não-conformidades são resolvidas", risco: "baixo", effects: { clientes: +3, processos: +2, financeiro: +1 }, avaliacao: "boa", ensinamento: "Comunicação proativa com o cliente durante o processo de correção transforma uma auditoria adversarial em uma parceria de melhoria. Clientes que veem comprometimento genuíno raramente exercem cláusulas de rescisão imediatamente." }
    ]
  },
  {
    title: "A Frota Que Envelhece",
    description: "O relatório técnico da frota chega: dos 87 veículos refrigerados, 34 têm mais de 8 anos de uso — acima do recomendado para manutenção preventiva de sistemas de refrigeração. Renovar toda a frota custaria R$12M. Renovar apenas os 34 mais críticos custaria R$4,8M. Cada falha de temperatura não detectada pode resultar em descarte de carga e multa contratual.",
    tags: ["logistica"],
    choices: [
      { text: "Renovar os 12 veículos mais críticos (acima de 10 anos) e implementar manutenção preventiva reforçada para os outros 22", risco: "medio", effects: { frota: +5, seguranca: +3, financeiro: -3, sla: +2 }, avaliacao: "boa", ensinamento: "Renovação priorizada pelo risco real é a alocação mais eficiente. Veículos acima de 10 anos têm falha de compressor 4x mais frequente — substituí-los elimina a maior concentração de risco com metade do investimento." },
      { text: "Fazer leasing de 20 veículos novos para substituir os mais velhos — custo mensal menor, frota mais nova", risco: "medio", effects: { frota: +4, financeiro: -2, seguranca: +3, sla: +2 }, avaliacao: "boa", ensinamento: "Leasing de frota distribui o custo de renovação sem comprometer o capital de giro. Para operações de cold chain com financeiro pressionada, lease é frequentemente superior à compra." },
      { text: "Adiar a renovação e intensificar a manutenção preventiva de toda a frota", risco: "alto", effects: { frota: +2, financeiro: +1, seguranca: -2, sla: -1 }, avaliacao: "ruim", ensinamento: "Manutenção preventiva intensificada em veículo velho reduz a frequência de falha — mas não elimina o risco de colapso de sistema de refrigeração em rota. Para cold chain farmacêutico, 'reduzir risco' não é suficiente." },
      { text: "Vender os 34 veículos mais velhos como sucata e usar o recurso para financiar a renovação", risco: "baixo", effects: { frota: +3, financeiro: +2, seguranca: +2, sla: -1 }, avaliacao: "media", ensinamento: "Venda de frota velha como parcial do financiamento da nova é razoável — mas o gap de tempo entre a venda e a chegada dos novos veículos pode pressionar o SLA se não for planejado." }
    ]
  },
  {
    title: "O Responsável Técnico que Sumiu",
    description: "O responsável técnico de qualidade e rastreabilidade, que detinha todas as certificações ANVISA da operação, pediu demissão 3 dias após o incidente. Com ele foram: o conhecimento dos procedimentos de desvio, os contatos regulatórios e a memória dos processos de certificação. A renovação anual das licenças de operação farmacêutica vence em 4 meses.",
    tags: ["logistica"],
    choices: [
      { text: "Contratar imediatamente um consultor regulatório farmacêutico para cobrir o gap enquanto busca substituto permanente", risco: "medio", effects: { processos: +3, seguranca: +2, tecnologia: +1, financeiro: -2 }, avaliacao: "boa", ensinamento: "Consultor regulatório é a solução mais rápida para o gap de conhecimento. Um profissional com experiência em ANVISA pode cobrir as certificações em tempo menor que qualquer contratação CLT." },
      { text: "Promover internamente o assistente de qualidade mais experiente e pagar a certificação dele urgentemente", risco: "baixo", effects: { rh: +3, processos: +2, seguranca: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Promoção interna preserva o conhecimento institucional já existente. O assistente que trabalhava com o responsável técnico conhece os processos — falta apenas a certificação formal que pode ser obtida em semanas." },
      { text: "Documentar todos os processos existentes em 2 semanas antes de contratar alguém novo", risco: "medio", effects: { processos: +4, tecnologia: +2, financeiro: -1, sla: -1 }, avaliacao: "media", ensinamento: "Documentação antes da contratação garante que o conhecimento não está concentrado numa única pessoa de novo. O risco é o tempo — 2 semanas de documentação em paralelo com a auditoria pode sobrecarregar o time." },
      { text: "Contratar no mercado o perfil mais qualificado disponível com salário acima da média para fechar rápido", risco: "alto", gestorEffects: { capitalPolitico: +1 }, effects: { financeiro: -4, rh: +1, processos: +2, seguranca: +1 }, avaliacao: "media", ensinamento: "Pagar prêmio de urgência por profissional regulatório é justificável com licença ANVISA vencendo em 4 meses. O custo da contratação é marginal frente à multa e suspensão de licença." }
    ]
  },
  {
    title: "O Segundo Cliente Pede Auditoria",
    description: "O cliente de alimentos perecíveis — que representa R$6,8M/ano — leu sobre o incidente farmacêutico no setor e também acionou cláusula de auditoria. 'Não é que a gente desconfie de vocês', diz o diretor de supply chain deles. 'É que temos obrigação com nossos próprios auditores de verificar todos os fornecedores de frio.' Você ainda está gerenciando a auditoria farmacêutica.",
    tags: ["logistica"],
    choices: [
      { text: "Agendar a auditoria de alimentos para 45 dias — depois que a farmacêutica for concluída — e comunicar proativamente o cronograma", risco: "baixo", gestorEffects: { reputacaoInterna: +1 }, effects: { clientes: +3, processos: +1, sla: +1 }, avaliacao: "boa", ensinamento: "Gerenciar o timing das duas auditorias evita a sobrecarga do time de qualidade. Comunicar proativamente o cronograma mostra organização e respeito ao cliente." },
      { text: "Aceitar as duas auditorias em paralelo — mostrar que a empresa tem capacidade de gestão sob pressão", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { processos: -3, rh: -2, sla: -1, seguranca: +1 }, avaliacao: "ruim", ensinamento: "Duas auditorias simultâneas sobrecarregam o mesmo time de qualidade que está tentando corrigir os problemas. O risco de execução ruim nas duas é maior do que o benefício de demonstrar capacidade." },
      { text: "Transformar a auditoria de alimentos em visita de parceria — mostrar as melhorias implementadas pós-incidente", risco: "baixo", effects: { clientes: +4, clientes: +2, processos: +2, tecnologia: +1 }, avaliacao: "boa", ensinamento: "Converter uma auditoria defensiva em demonstração de melhoria muda a dinâmica do relacionamento. O cliente que vem para verificar e sai impressionado com as mudanças se torna um defensor da empresa." },
      { text: "Oferecer ao cliente de alimentos acesso ao relatório e plano de ação da auditoria farmacêutica como transparência", risco: "medio", effects: { clientes: +4, processos: +1, sla: +1 }, avaliacao: "boa", ensinamento: "Transparência radical com clientes em crise constrói confiança que anos de relacionamento normal não criam. Compartilhar o relatório completo demonstra que você não tem nada a esconder." }
    ]
  },
  {
    title: "A Tecnologia de Rastreabilidade em Tempo Real",
    description: "O CTO apresenta a proposta: R$1,1M para implementar rastreabilidade em tempo real com IoT em toda a frota e armazéns — temperatura, localização e umidade com alertas automáticos para desvios. O sistema integra diretamente com o dashboard dos clientes. O ROI projetado: redução de 90% nos incidentes de temperatura e eliminação de R$2M/ano em perdas de carga.",
    tags: ["logistica"],
    choices: [
      { text: "Aprovar o investimento completo — rastreabilidade em tempo real é o novo padrão do mercado farmacêutico", risco: "medio", effects: { tecnologia: +6, seguranca: +3, frota: +2, clientes: +3, financeiro: -4 }, avaliacao: "boa", ensinamento: "Tecnologia de rastreabilidade em cold chain farmacêutico migrou de diferencial para requisito de entrada. Empresas que não implementam em 24 meses perdem acesso a contratos de distribuição de medicamentos regulados." },
      { text: "Implementar apenas nos veículos que atendem clientes farmacêuticos — R$380k em vez de R$1,1M", risco: "baixo", effects: { tecnologia: +3, seguranca: +2, frota: +1, clientes: +2, financeiro: -2 }, avaliacao: "boa", ensinamento: "Implementação faseada por criticidade do cliente entrega 80% do resultado com 35% do custo. Os veículos de alimentos podem ser integrados numa segunda fase quando o ROI da primeira fase for validado." },
      { text: "Buscar financiamento de fornecedor de IoT via contrato de serviço mensal — sem capex inicial", risco: "baixo", effects: { tecnologia: +4, seguranca: +3, financeiro: -2, frota: +2, sla: +2 }, avaliacao: "boa", ensinamento: "Modelo SaaS de monitoramento IoT existe no mercado — você paga por dispositivo por mês sem capex. Para empresas com fluxo de caixa pressionado, opex é preferível a capex." },
      { text: "Adiar — a prioridade agora é passar nas auditorias com o que temos, tecnologia é próximo passo", risco: "alto", effects: { tecnologia: -1, seguranca: -2, clientes: -2, sla: -1 }, avaliacao: "ruim", ensinamento: "Passar na auditoria sem implementar rastreabilidade em tempo real é uma contradição. O auditor vai perguntar exatamente o que você está fazendo para evitar o próximo incidente — 'plano para o próximo passo' não é uma resposta satisfatória." }
    ]
  },
  {
    title: "A Proposta do Concorrente ao Seu Cliente",
    description: "Você soube por um contato no mercado que dois concorrentes estão prospectando ativamente o seu cliente farmacêutico, aproveitando o momento de vulnerabilidade. Um deles apresentou proposta com preço 12% abaixo do seu e frota 100% com rastreabilidade IoT. O contrato do cliente vence em 8 meses.",
    tags: ["logistica"],
    choices: [
      { text: "Antecipar a renovação: propor contrato de 3 anos com as melhorias implementadas como argumento principal", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { clientes: +4, financeiro: +3, sla: +2, tecnologia: +1 }, avaliacao: "boa", ensinamento: "Renovação antecipada com empresa em processo de melhoria visível é estratégia correta. O cliente que assina agora está apostando na trajetória — e você está demonstrando que a trajetória é positiva." },
      { text: "Reduzir o preço em 10% para tornar a proposta do concorrente menos atraente", risco: "alto", effects: { clientes: +2, financeiro: -4, sla: 0 }, avaliacao: "ruim", ensinamento: "Redução de preço sem argumento de valor é mensagem de desespero. O cliente farmacêutico toma decisão de fornecedor de cold chain por confiabilidade, não por preço — especialmente após um incidente." },
      { text: "Apresentar ao cliente o roadmap de tecnologia dos próximos 6 meses como demonstração de comprometimento", risco: "baixo", effects: { clientes: +3, tecnologia: +2, sla: +1, processos: +1 }, avaliacao: "boa", ensinamento: "Roadmap de investimento é o argumento mais poderoso para retenção de cliente em momento de crise. Ele demonstra que a empresa aprendeu com o incidente e está investindo — não apenas prometendo." },
      { text: "Buscar informações sobre as propostas dos concorrentes antes de reagir", risco: "baixo", effects: { processos: +2, clientes: +1 }, avaliacao: "media", ensinamento: "Inteligência competitiva antes de reagir é prudente — mas com contrato vencendo em 8 meses e concorrentes ativos, o tempo de espera tem custo. Cada semana sem ação é semana que o concorrente usa para construir relacionamento." }
    ]
  },
  {
    title: "A Certificação ANVISA em Risco",
    description: "O responsável técnico substituto identifica um problema grave: dois dos três armazéns frigorificados têm procedimentos de controle de temperatura que não atendem mais a RDC 430/2020 da ANVISA. A renovação da licença sanitária é em 3 meses. Sem ela, você não pode operar distribuição de medicamentos.",
    tags: ["logistica"],
    choices: [
      { text: "Contratar consultoria regulatória para adequação imediata dos dois armazéns — prioridade máxima", risco: "medio", effects: { seguranca: +4, processos: +4, tecnologia: +2, financeiro: -3, processos: +3 }, avaliacao: "boa", ensinamento: "Adequação regulatória com prazo fixo não tem alternativa: ou você implementa ou perde a licença. A consultoria especializada reduz o risco de interpretar incorretamente a regulação e reprovar na inspeção." },
      { text: "Fazer as adequações internamente com a equipe atual para economizar o custo da consultoria", risco: "alto", effects: { processos: +2, seguranca: +2, financeiro: +1, tecnologia: -1 }, avaliacao: "ruim", ensinamento: "Adequação regulatória farmacêutica sem especialista é alto risco. A RDC 430 tem especificidades técnicas que exigem profissional habilitado — uma interpretação errada pode resultar em reprovação na inspeção sanitária." },
      { text: "Contatar a ANVISA proativamente para apresentar o plano de adequação antes da inspeção", risco: "baixo", gestorEffects: { capitalPolitico: +2 }, effects: { processos: +3, seguranca: +3, clientes: +2 }, avaliacao: "boa", ensinamento: "Órgãos regulatórios respondem positivamente a empresas que buscam orientação antes de serem autuadas. Contato proativo transforma a relação de policiamento em parceria de processos." },
      { text: "Migrar temporariamente as operações farmacêuticas para o armazém já adequado enquanto faz as reformas", risco: "medio", effects: { sla: -2, processos: +2, seguranca: +2, clientes: -1 }, avaliacao: "media", ensinamento: "Concentração temporária das operações farmacêuticas reduz a exposição regulatória — mas aumenta o volume no único armazém adequado, pressionando o SLA dos clientes farmacêuticos." }
    ]
  },
  {
    title: "O Treinamento que Nunca Aconteceu",
    description: "A auditoria identificou que 67% dos motoristas e 82% dos operadores de armazém nunca fizeram treinamento em cadeia do frio. O último treinamento foi há 2 anos para um grupo de 12 pessoas. Com 190 colaboradores, o treinamento completo leva 3 semanas e custa R$85k. O auditor incluiu o treinamento como não-processos crítica.",
    tags: ["logistica"],
    choices: [
      { text: "Contratar empresa de treinamento especializada em GDP para capacitar toda a equipe em 3 semanas", risco: "medio", effects: { rh: +5, seguranca: +4, processos: +3, financeiro: -2 }, avaliacao: "boa", ensinamento: "Treinamento de GDP (Good Distribution Practices) não é custo — é a única forma de garantir que todos os colaboradores tomem as decisões corretas no momento certo. 190 pessoas treinadas são 190 barreiras contra o próximo incidente." },
      { text: "Treinar primeiro os 40 colaboradores que operam os veículos e armazéns farmacêuticos", risco: "baixo", effects: { rh: +3, seguranca: +3, processos: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Treinamento priorizado por exposição ao risco é a alocação correta. Os 40 que operam diretamente com medicamentos são os que mais precisam do treinamento — e são os que o auditor vai verificar." },
      { text: "Criar um e-learning interno com o conteúdo básico de cold chain — mais rápido e mais barato", risco: "medio", effects: { rh: +2, seguranca: +1, processos: +1, financeiro: 0 }, avaliacao: "ruim", ensinamento: "E-learning genérico em cold chain não substitui treinamento presencial com simulações de desvio de temperatura. Auditores farmacêuticos sabem a diferença — e o e-learning sem aplicação prática raramente muda comportamento." },
      { text: "Implementar sistema de multiplicadores internos — treinar 10 líderes que replicam para toda a equipe", risco: "baixo", effects: { rh: +4, seguranca: +2, processos: +3, financeiro: -1 }, avaliacao: "boa", ensinamento: "Multiplicadores internos criam capacidade de treinamento contínuo, não apenas pontual. Operação de cold chain muda com a equipe — multiplicadores garantem que os novos colaboradores sejam treinados no padrão." }
    ]
  },
  {
    title: "O Novo Cliente de Vacinas",
    description: "O Ministério da Saúde abriu licitação para distribuição de vacinas em 4 estados — contrato de R$14M por 2 anos. Os requisitos são os mais rigorosos da cadeia do frio: temperatura entre 2°C e 8°C com desvio máximo de 0,5°C, rastreabilidade em tempo real obrigatória e certificação ANVISA específica para vacinas. Você ainda está em processo de adequação.",
    tags: ["logistica"],
    choices: [
      { text: "Não participar da licitação — as adequações atuais precisam ser concluídas antes de assumir um contrato mais exigente", risco: "baixo", gestorEffects: { capitalPolitico: -1 }, effects: { processos: +2, seguranca: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Disciplina de não assumir contratos acima da capacidade atual é sinal de maturidade operacional. Um contrato de vacinas com falha é muito mais danoso do que não participar da licitação." },
      { text: "Participar da licitação com proposta condicional: contrato inicia em 6 meses quando as adequações estiverem concluídas", risco: "medio", effects: { clientes: +2, financeiro: +1, processos: +1 }, avaliacao: "boa", ensinamento: "Proposta condicional com cronograma honesto é melhor do que proposta que você não pode cumprir. Alguns órgãos públicos aceitam prazos escalonados de implementação quando a justificativa é técnica e documentada." },
      { text: "Participar da licitação em parceria com empresa já certificada para vacinas — dividir receita e risco", risco: "medio", effects: { clientes: +3, financeiro: +3, tecnologia: +2, sla: +1 }, avaliacao: "boa", ensinamento: "Parceria para capturar contrato que exige certificação que você ainda não tem é a forma mais inteligente de crescer no segmento. O parceiro certifica, você opera — e os dois aprendem juntos." },
      { text: "Assumir o compromisso e acelerar as adequações para cumprir os requisitos até o início do contrato", risco: "alto", gestorEffects: { capitalPolitico: +2, esgotamento: +2 }, effects: { financeiro: -4, processos: -2, seguranca: +2, sla: -2 }, avaliacao: "ruim", ensinamento: "Assumir contrato de vacinas antes de estar pronto cria risco sanitário real. Uma falha na cadeia do frio de vacinas tem impacto de saúde pública — não apenas financeiro." }
    ]
  },
  {
    title: "O Motoboy que Filma a Operação",
    description: "Um colaborador publicou um vídeo nas redes sociais mostrando um veículo refrigerado descarregando caixas de medicamentos ao sol por 8 minutos em frente a uma farmácia. O vídeo atingiu 340k visualizações em 12 horas. O cliente farmacêutico ligou na mesma hora. O colaborador estava correto no procedimento — a entrega em farmácias pequenas sem doca exige exposição breve ao ambiente.",
    tags: ["logistica"],
    choices: [
      { text: "Responder publicamente com explicação técnica do procedimento e demonstração das temperaturas registradas no momento", risco: "baixo", gestorEffects: { reputacaoInterna: +1 }, effects: { clientes: +3, rh: +1, tecnologia: +1, seguranca: +1 }, avaliacao: "boa", ensinamento: "Transparência com dados técnicos é a resposta correta a críticas de operação baseadas em aparência. Se o procedimento está correto e a temperatura foi mantida, os dados da rastreabilidade são a prova mais eficiente." },
      { text: "Criar procedimento formal de entrega com cobertura térmica para todos os pontos sem doca", risco: "baixo", effects: { seguranca: +3, processos: +3, frota: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Mesmo que o procedimento estivesse correto, criar um padrão mais rigoroso visível é a resposta proativa que demonstra liderança em qualidade. Coberturas térmicas para entrega custam R$180 por veículo." },
      { text: "Acionar a equipe jurídica para avaliar a publicação do colaborador como falta grave", risco: "alto", gestorEffects: { reputacaoInterna: -3 }, effects: { rh: -5, clientes: -2, sla: -1 }, avaliacao: "ruim", ensinamento: "Punir colaborador por expor uma prática operacional real — mesmo que correta — cria clima de medo e silêncio que é muito mais perigoso do que o vídeo. Problemas reais que ninguém reporta são os mais caros." },
      { text: "Contatar o colaborador para entender a motivação e resolver internamente antes de qualquer ação pública", risco: "baixo", effects: { rh: +2, clientes: +1 }, avaliacao: "media", ensinamento: "Entender o colaborador antes de agir é prudente — mas com 340k visualizações em 12h, o público externo já está formando opinião. A resposta interna precisa ser acompanhada de uma posição pública." }
    ]
  },
  {
    title: "A Proposta de Fusão com Operador de Frio",
    description: "O maior operador de frio da região Sul quer fusão: eles têm 140 veículos refrigerados e 5 armazéns, mas estão com problemas financeiros por má gestão. A fusão criaria a maior operação de cold chain do Sul e Sudeste com R$92M de receita combinada. Mas eles têm R$8M em dívida e cultura operacional diferente da sua.",
    tags: ["logistica"],
    choices: [
      { text: "Recusar a fusão e propor aquisição apenas dos ativos físicos — comprar frota e armazéns sem a dívida", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { frota: +4, tecnologia: +2, financeiro: -3, sla: +2 }, avaliacao: "boa", ensinamento: "Comprar ativos sem a dívida é a forma mais inteligente de crescer em operações com problemas financeiros. Frota e armazéns têm valor sem o passivo do vendedor." },
      { text: "Aceitar a fusão com due diligence completa e plano de integração de 12 meses", risco: "alto", gestorEffects: { capitalPolitico: +2, esgotamento: +2 }, effects: { financeiro: -4, frota: +5, clientes: +3, processos: -3, sla: -1 }, avaliacao: "media", ensinamento: "Fusão com empresa com problemas financeiros pode criar escala — ou dobrar os problemas. A due diligence precisa avaliar não apenas os números, mas a cultura operacional de cold chain." },
      { text: "Propor aliança operacional sem fusão societária — compartilhar frota e CD em picos sem assumir dívida", risco: "baixo", effects: { frota: +2, sla: +2, clientes: +2, financeiro: +1 }, avaliacao: "boa", ensinamento: "Aliança operacional captura a escala nos momentos que importam sem os riscos de integração. É o caminho mais eficiente quando as culturas e as situações financeiras são muito diferentes." },
      { text: "Recusar completamente — você está em processo de adequação e uma fusão agora compromete o foco", risco: "baixo", effects: { processos: +2, seguranca: +1, financeiro: +1 }, avaliacao: "media", ensinamento: "Recusar durante um processo de adequação ativa é razoável. Integrar outra empresa enquanto você está corrigindo problemas internos pode comprometer os dois processos." }
    ]
  },
  {
    title: "O Reconhecimento de Mercado",
    description: "Depois de 12 meses de trabalho intenso, a operação está transformada. O cliente farmacêutico renovou o contrato por 3 anos. A ABRAFRIO (associação do setor) convidou você para apresentar o case de recuperação em evento nacional. Dois novos prospectos de clientes farmacêuticos entraram em contato espontaneamente. O time pergunta: 'O que vem a seguir?'",
    tags: ["logistica"],
    choices: [
      { text: "Aceitar o convite da ABRAFRIO e publicar o case — posicionar a empresa como referência em recuperação de qualidade", risco: "baixo", gestorEffects: { capitalPolitico: +2 }, effects: { clientes: +4, clientes: +3, rh: +2, tecnologia: +1 }, avaliacao: "boa", ensinamento: "Um case de recuperação bem documentado é ativo de marketing poderoso. Empresas que transformaram crise em excelência têm credibilidade superior às que nunca passaram por crises." },
      { text: "Priorizar os dois novos prospectos antes do evento — converter em contratos enquanto o momentum é alto", risco: "medio", effects: { clientes: +4, financeiro: +3, sla: +1 }, avaliacao: "boa", ensinamento: "Converter prospectos inbound enquanto a reputação está em alta é a janela de menor custo de aquisição. Clientes que chegam até você por indicação ou reputação têm ciclo de venda 60% menor." },
      { text: "Certificar a operação na ISO 13485 (dispositivos médicos) para ampliar o portfólio de segmentos atendíveis", risco: "medio", effects: { tecnologia: +3, seguranca: +3, financeiro: -3, processos: +3, clientes: +2 }, avaliacao: "boa", ensinamento: "ISO 13485 abre o mercado de dispositivos médicos e materiais hospitalares — segmento com margens mais altas e contratos mais longos do que medicamentos. A base de qualidade que você construiu é a fundação." },
      { text: "Focar exclusivamente em consolidar a operação atual por mais 6 meses antes de qualquer expansão", risco: "baixo", effects: { processos: +2, sla: +2, rh: +1, seguranca: +1 }, avaliacao: "media", ensinamento: "Consolidação antes de expansão é prudente — mas com dois prospectos inbound e o contrato renovado, a janela de crescimento está aberta. Esperar 6 meses pode significar perder o timing de mercado." }
    ]
  },
  {
    title: "A Decisão de Precificação",
    description: "Com a operação recuperada e certificada, você tem poder de precificação que não tinha antes. Dois novos clientes farmacêuticos propõem contratos — um aceita seu preço atual, outro pede 8% de desconto argumentando volume. A consultoria financeira indica que você poderia aumentar a tabela em 15% para novos contratos sem perder competitividade, dado o diferencial técnico construído.",
    tags: ["logistica"],
    choices: [
      { text: "Reajustar a tabela de preços em 12% para novos contratos — capturar o valor do diferencial construído", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { financeiro: +5, financeiro: +3, clientes: +1, sla: +1 }, avaliacao: "boa", ensinamento: "Pricing power é o resultado de diferenciação real. Uma operação com rastreabilidade IoT, equipe certificada e histórico de recuperação de crise vale mais do que uma operação genérica. Cobrar mais é legítimo e necessário para sustentar o investimento feito." },
      { text: "Manter o preço atual e focar em volume — crescer a carteira antes de reajustar", risco: "baixo", effects: { clientes: +3, financeiro: +2, sla: +1, frota: +1 }, avaliacao: "media", ensinamento: "Volume antes de preço é uma estratégia válida para construir case de escala. O risco é que o custo de operação em cold chain farmacêutico de alta qualidade não se sustenta indefinidamente com preço pré-diferenciação." },
      { text: "Aceitar o desconto de 8% do cliente de volume e compensar no ticket médio geral", risco: "medio", effects: { financeiro: +2, clientes: +4, sla: +1, frota: +2 }, avaliacao: "media", ensinamento: "Desconto por volume é aceitável quando o contrato tem escala suficiente para compensar na financeiro absoluta. O risco é criar precedente de que seu preço é negociável." },
      { text: "Reajustar em 18% apenas para contratos de maior risco técnico — vacinas e medicamentos controlados", risco: "baixo", effects: { financeiro: +4, financeiro: +4, clientes: +1, seguranca: +1 }, avaliacao: "boa", ensinamento: "Precificação diferenciada por complexidade e risco técnico é o modelo correto para cold chain especializado. Quem exige mais paga mais — e o cliente que entende o risco aceita o prêmio de preço." }
    ]
  },
  {
    title: "O Futuro da Cadeia do Frio",
    description: "Após um ciclo de transformação profunda, você precisa definir a direção estratégica dos próximos 3 anos. O setor de cold chain farmacêutico cresce 18% ao ano no Brasil. O board quer saber qual posicionamento vai sustentar o crescimento.",
    tags: ["logistica"],
    choices: [
      { text: "Especialista em cold chain farmacêutico e hospitalar: ser a referência técnica no segmento mais exigente do setor", effects: { financeiro: +5, clientes: +5, seguranca: +5, tecnologia: +4, rh: +3, sla: +3 }, avaliacao: "boa", ensinamento: "Especialização no segmento mais exigente cria barreiras de entrada que protegem a financeiro. Certificações, know-how e reputação construídos levam anos para um concorrente replicar." },
      { text: "Expansão nacional: replicar o modelo de cold chain certificado para outras regiões do Brasil", requisitos: { indicadorMinimo: { tecnologia: 10, seguranca: 12 } }, effects: { financeiro: +4, clientes: +4, sla: +2, frota: +3, rh: +2 }, avaliacao: "boa", ensinamento: "Expansão com modelo certificado e comprovado é mais segura do que a maioria das expansões logísticas. A certificação ANVISA é federal — o que você construiu no Sudeste replica para outros estados com ajustes menores." },
      { text: "Plataforma de cold chain as-a-service: abrir a infraestrutura para outros operadores menores como B2B", effects: { tecnologia: +5, financeiro: +3, processos: +3, clientes: +2, sla: +1 }, avaliacao: "boa", ensinamento: "Infraestrutura como serviço multiplica o retorno do investimento em tecnologia e armazéns. Outros operadores que não têm condições de certificar sozinhos pagam pelo acesso à sua infraestrutura." },
      { text: "Diversificação para alimentos premium: ampliar o mix de clientes além do farmacêutico", effects: { clientes: +3, financeiro: +3, sla: +2, frota: +2, seguranca: -1 }, avaliacao: "media", ensinamento: "Alimentos premium têm requisitos de cold chain rigorosos mas diferentes dos farmacêuticos. A diversificação reduz a concentração de receita em um setor — ao custo de diluir um pouco a especialização que é o principal diferencial." }
    ]
  }
],

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [2] · Fulfillment E-commerce · Operação Omnichannel
   Contexto: 310 funcionários, 2 CDs em Campinas, 18k pedidos/dia,
   R$45M faturamento. Volume cresceu 62% com novo marketplace.
   Índice de problema: 1,2% → 4,7% (limite contratual: 2%).
   Marketplace emitiu alerta formal com cláusula de rescisão.

   INDICADORES: financeiro:7, rh:6, clientes:7, processos:4,
                sla:5, frota:7, seguranca:8, tecnologia:4

   ATENÇÃO: processos (4) e tecnologia (4) já estão no limite.
   A operação foi projetada para 11k pedidos — está em 18k.
   tecnologia≤4 → sla-2. sla≤3 → financeiro-1.
══════════════════════════════════════════════════════════════════ */
,
[
  {
    title: "O Volume que Ninguém Esperava",
    description: "O contrato com o marketplace entrou em vigor há 45 dias. Em vez dos 6.500 pedidos/dia projetados, chegaram 10.800 no primeiro mês. O CD principal opera a 118% da capacidade. A taxa de erro está em 4,7% — 2,35x acima do limite contratual de 2%. Você tem 30 dias antes de o marketplace acionar a cláusula de rescisão. O que você faz primeiro?",
    tags: ["logistica"],
    choices: [
      { text: "Implementar triplo turno de operação nos dois CDs — maximizar capacidade antes de qualquer outra solução", risco: "medio", effects: { sla: +3, rh: -3, financeiro: -2, processos: +2 }, avaliacao: "boa", ensinamento: "Triplo turno é a solução mais rápida para aumentar capacidade sem investimento de capital. O custo humano é real — adicional noturno e desgaste do time — mas a alternativa é perder R$14M de contrato." },
      { text: "Alugar um terceiro CD de emergência para distribuir o volume excedente imediatamente", risco: "medio", effects: { sla: +2, processos: +2, financeiro: -4, clientes: +2 }, avaliacao: "boa", ensinamento: "CD adicional elimina o gargalo físico que é a causa raiz do problema de SLA. R$80-120k/mês de aluguel é custo marginal frente ao contrato do marketplace." },
      { text: "Negociar com o marketplace uma rampa de crescimento mais gradual — limitar o volume nos próximos 60 dias", risco: "baixo", effects: { sla: +3, clientes: -2, financeiro: -1 }, avaliacao: "media", ensinamento: "Renegociar o volume com o marketplace pode ser possível se a comunicação for proativa e o plano de expansão de capacidade for crível. O risco é que o marketplace pode preferir rescindir a aceitar limitação de volume." },
      { text: "Focar na redução do erro nos 18k pedidos atuais antes de pensar em capacidade — qualidade antes de volume", risco: "alto", effects: { processos: +2, sla: -2, clientes: -2, financeiro: -1 }, avaliacao: "ruim", ensinamento: "Focar em qualidade sem resolver o gargalo de capacidade é gerenciar o sintoma da doença. Com CD a 118%, o erro é estrutural — não operacional. Mais atenção com o mesmo gargalo não reduz o índice de 4,7%." }
    ]
  },
  {
    title: "Os Clientes Originais Reclamam",
    description: "Os 37 clientes que operavam com você antes do contrato do marketplace estão reclamando que o SLA deles piorou. Três enviaram carta formal. Dois ameaçam migrar para outro operador. Eles representam R$31M em receita — 69% do faturamento total. O novo marketplace representa R$14M — mas a atenção operacional está toda nele.",
    tags: ["logistica"],
    choices: [
      { text: "Criar SLA dedicado para os clientes originais: time separado, área do CD reservada, não competem com o marketplace pelo recurso", risco: "medio", gestorEffects: { reputacaoInterna: +1 }, effects: { clientes: +4, processos: +2, financeiro: -2, sla: +2 }, avaliacao: "boa", ensinamento: "Segregação de operação por cliente é a solução estrutural para conflito de capacidade. Clientes que pagam mais não podem perder SLA por causa de um cliente maior em volume." },
      { text: "Reunir-se pessoalmente com os 3 clientes que enviaram carta formal e apresentar plano de recuperação", risco: "baixo", gestorEffects: { capitalPolitico: +1 }, effects: { clientes: +3, sla: +1 }, avaliacao: "boa", ensinamento: "Clientes que se deram ao trabalho de escrever uma carta formal querem atenção, não apenas solução técnica. A presença do gestor na reunião comunica que o relacionamento importa." },
      { text: "Oferecer desconto temporário de 10% para os clientes originais como compensação pelo período de queda de SLA", risco: "alto", effects: { clientes: +2, financeiro: -3, sla: 0 }, avaliacao: "ruim", ensinamento: "Desconto como compensação de SLA é a solução mais cara e menos eficiente. Você paga pela falha operacional sem corrigi-la — e cria precedente de que queda de SLA tem preço, não solução." },
      { text: "Priorizar temporariamente o marketplace para estabilizar o SLA mais urgente e voltar aos clientes originais em 30 dias", risco: "alto", effects: { clientes: -3, sla: +1, financeiro: +1 }, avaliacao: "ruim", ensinamento: "Priorizar o novo cliente em detrimento dos clientes que construíram sua empresa é uma troca que raramente compensa. Os clientes originais têm memória longa — e as cartas formais indicam que a paciência já acabou." }
    ]
  },
  {
    title: "O Sistema WMS Sobrecarregado",
    description: "O WMS (Warehouse Management System) foi dimensionado para 12k pedidos/dia. Com 18k, o sistema trava 3 a 5 vezes por turno, causando filas de triagem de até 90 minutos. O fornecedor do WMS diz que a atualização para suportar 25k pedidos/dia custa R$380k e leva 6 semanas de implementação. Nas 6 semanas, a operação continua no WMS atual.",
    tags: ["logistica"],
    choices: [
      { text: "Aprovar a atualização do WMS e implementar workarounds manuais para os próximos 6 weeks", risco: "medio", effects: { tecnologia: +5, processos: +4, sla: +2, financeiro: -4, rh: -2 }, avaliacao: "boa", ensinamento: "Atualização de WMS é investimento estrutural necessário. Os 6 weeks de implementação são inevitáveis — quanto mais você adia, mais a operação degrada. Os workarounds manuais são o custo da transição." },
      { text: "Migrar para WMS SaaS de novo fornecedor — implementação mais rápida (3 semanas) mas R$520k/ano", risco: "alto", gestorEffects: { esgotamento: +1 }, effects: { tecnologia: +4, processos: +3, sla: +3, financeiro: -3, rh: -3 }, avaliacao: "media", ensinamento: "Troca de WMS em operação a 118% de capacidade é risco extremamente alto. Migrações de sistema em operação plena frequentemente resultam em perdas de dados e paralisação parcial." },
      { text: "Implementar processamento em fila — o WMS processa em batches de 2h em vez de tempo real", risco: "baixo", effects: { tecnologia: +2, processos: +1, sla: -1, rh: +1 }, avaliacao: "media", ensinamento: "Processamento em batch reduz a sobrecarga do WMS sem custo de atualização — mas aumenta a latência de cada pedido. Para e-commerce com SLA de 4h para despacho, batches de 2h podem comprometer o timing de expedição." },
      { text: "Dividir o volume entre os dois CDs manualmente para reduzir a pressão no WMS principal", risco: "medio", effects: { processos: +2, sla: +1, rh: -2, financeiro: -1 }, avaliacao: "media", ensinamento: "Distribuição manual de volume entre CDs alivia o WMS sem custo de sistema — mas cria outro gargalo: coordenação humana de volume em dois locais sem sistema integrado é fonte de erro." }
    ]
  },
  {
    title: "A Qualidade dos Entregadores Terceirizados",
    description: "O relatório de incidentes revela: 73% dos erros de entrega (endereço errado, produto trocado, embalagem danificada) ocorrem nos 18 transportadores terceirizados que o marketplace exige usar. Você não tem controle sobre eles — são parceiros do marketplace. Os clientes reclamam na sua empresa, não no marketplace.",
    tags: ["logistica"],
    choices: [
      { text: "Documentar os incidentes por transportador e apresentar relatório formal ao marketplace solicitando substituição dos piores", risco: "baixo", gestorEffects: { capitalPolitico: +1 }, effects: { clientes: +3, sla: +2, processos: +2 }, avaliacao: "boa", ensinamento: "Dados concretos de performance por transportador são o argumento correto para forçar mudança. O marketplace não quer incidentes — ele vai agir se você provar com dados qual transportador está destruindo a experiência do cliente final." },
      { text: "Adicionar uma etapa extra de verificação antes da saída do CD — double-check em 100% dos pedidos do marketplace", risco: "medio", effects: { sla: +2, processos: +3, rh: -3, financeiro: -1 }, avaliacao: "boa", ensinamento: "Double-check antes da expedição captura os erros de embalagem e produto antes de sair do seu controle. O custo em tempo de processamento é real — mas a taxa de erro cai para um nível que você pode defender." },
      { text: "Tentar absorver os transportadores terceirizados como frota própria — assumir o controle da entrega", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { financeiro: -5, sla: +3, rh: -3, frota: +3, clientes: +2 }, avaliacao: "media", ensinamento: "Trazer para frota própria dá controle mas requer capital para compra de veículos e contratação em escala. Com a operação já sobrecarregada, absorver 18 transportadores pode ser uma sobrecarga operacional adicional." },
      { text: "Negociar com o marketplace a possibilidade de usar transportadores próprios nos corredores com pior performance", risco: "medio", effects: { clientes: +3, sla: +2, financeiro: -2, processos: +1 }, avaliacao: "boa", ensinamento: "Substituição gradual em corredores específicos é a negociação mais razoável com o marketplace. Você demonstra capacidade onde o terceirizado falha — e o marketplace tem dados para justificar a mudança." }
    ]
  },
  {
    title: "O Pico de Black Friday se Aproxima",
    description: "Black Friday em 60 dias. No ano passado, o volume triplicou em 24 horas. Com o volume base atual de 18k pedidos/dia, o pico pode chegar a 54k pedidos/dia. O marketplace exige que você mantenha o SLA durante o pico. O plano operacional precisa ser apresentado em 2 semanas. Você ainda está resolvendo os problemas do volume atual.",
    tags: ["logistica"],
    choices: [
      { text: "Apresentar plano realista ao marketplace: capacidade máxima de 32k pedidos/dia no pico — solicitar limite de volume acima disso", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { clientes: +2, processos: +3, sla: +2, financeiro: +1 }, avaliacao: "boa", ensinamento: "Honestidade sobre a capacidade máxima é melhor do que comprometer um SLA impossível. O marketplace prefere um operador que sabe seus limites a um que promete 54k e entrega 18k com 8% de erro." },
      { text: "Contratar 80 operadores temporários e alugar um terceiro CD por 45 dias para o pico", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { sla: +3, financeiro: -5, rh: -2, processos: +2 }, avaliacao: "media", ensinamento: "Operação de pico com temporários e CD extra é viável — mas o tempo de treinamento para 80 pessoas é de 2 a 3 semanas. Com 60 dias, a janela é apertada e o risco de erro de temporário no pico é alto." },
      { text: "Propor ao marketplace cobrança por pedido no pico (acima de 25k/dia) para financiar a capacidade adicional necessária", risco: "medio", effects: { financeiro: +3, clientes: +1, processos: +2 }, avaliacao: "boa", ensinamento: "Precificação por demanda em pico é prática normal em logística de e-commerce. O marketplace sabe que o custo operacional de Black Friday é diferente — a maioria aceita precificação diferenciada para volume acima da capacidade contratada." },
      { text: "Terceirizar o excesso de volume acima de 25k pedidos/dia para outro operador de fulfillment parceiro", risco: "medio", effects: { sla: +2, financeiro: -2, clientes: +1, processos: -1 }, avaliacao: "media", ensinamento: "Overflow para parceiro de fulfillment é solução que os maiores players usam no pico. O risco é a inconsistência de padrão entre operadores — e o cliente final não vê a diferença entre o seu serviço e o do parceiro." }
    ]
  },
  {
    title: "A Automação que Transforma o CD",
    description: "Uma empresa de automação propõe instalar esteiras automatizadas e sorters no CD principal: capacidade sobe de 12k para 28k pedidos/dia, taxa de erro cai de 4,7% para 0,8%, e o custo por pedido cai 38%. Investimento: R$3,2M. Prazo de implantação: 4 meses. Durante os 4 meses, a operação convive com obras e pode cair para 9k pedidos/dia.",
    tags: ["logistica"],
    choices: [
      { text: "Aprovar a automação e negociar com o marketplace uma redução temporária de volume pelos 4 meses de obras", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { tecnologia: +6, processos: +5, financeiro: -4, sla: -2, clientes: -1 }, avaliacao: "boa", ensinamento: "Automação com negociação proativa de impacto temporário é a decisão estrategicamente correta. A degradação de 4 meses é real — mas a plataforma automatizada entrega vantagem competitiva permanente." },
      { text: "Automatizar primeiro o CD secundário como piloto antes de comprometer o CD principal", risco: "baixo", effects: { tecnologia: +3, processos: +3, financeiro: -2, sla: +1 }, avaliacao: "boa", ensinamento: "Pilotar no CD menor protege a operação principal durante a validação. Se a automação funcionar como prometido, o argumento para automatizar o CD principal é muito mais forte — com dados reais." },
      { text: "Negociar com a empresa de automação uma implantação faseada por área do CD para manter a operação", risco: "medio", effects: { tecnologia: +4, processos: +4, financeiro: -3, rh: -1, sla: 0 }, avaliacao: "boa", ensinamento: "Implantação faseada por área é padrão em automação de CD em operação. Área por área, você mantém o volume total enquanto parte do CD vai para automação — sem o risco de queda para 9k pedidos." },
      { text: "Adiar a automação para depois que a operação estiver estabilizada", risco: "alto", effects: { tecnologia: -1, processos: -1, sla: -1, financeiro: +1 }, avaliacao: "ruim", ensinamento: "Adiar automação que resolve o problema estrutural de capacidade e erro é postergar a solução definitiva. Com 4,7% de erro e SLA em risco, a operação não vai 'estabilizar' com o modelo manual atual." }
    ]
  },
  {
    title: "O Contrato do Marketplace em Renegociação",
    description: "Após 6 meses difíceis, o marketplace quer renegociar o contrato. Eles pedem: redução de 15% no preço, SLA de 2h para despacho (hoje é 4h), e expansão para mais 3 estados. Em troca, garantem volume mínimo de R$18M/ano por 2 anos. O CFO calcula: a redução de 15% no preço com o volume garantido resulta em receita líquida 8% maior do que o contrato atual.",
    tags: ["logistica"],
    choices: [
      { text: "Aceitar com condicionante: o SLA de 2h entra em vigor em 6 meses após a automação do CD", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { clientes: +3, financeiro: +4, sla: +2, processos: +2 }, avaliacao: "boa", ensinamento: "Aceitar com prazo condicionado à automação é o equilíbrio correto. Você garante o volume e a receita sem comprometer um SLA que ainda não tem infraestrutura para suportar." },
      { text: "Aceitar integralmente — volume mínimo garantido de R$18M é o que a empresa precisa para crescer", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { financeiro: +5, sla: -3, processos: -2, rh: -2, clientes: -1 }, avaliacao: "ruim", ensinamento: "Aceitar SLA de 2h sem ter a infraestrutura para cumprir é criar um novo ciclo de crise. O volume garantido não compensa a multa contratual de descumprimento de SLA — que agora você aceita sendo 2h." },
      { text: "Recusar a expansão para 3 estados e aceitar o restante — crescimento que não temos capacidade de suportar", risco: "medio", effects: { financeiro: +3, processos: +1, sla: +1, clientes: +2 }, avaliacao: "boa", ensinamento: "Disciplina de não crescer além da capacidade real é a lição mais importante da crise que você acabou de passar. O marketplace vai respeitar um operador que conhece seus limites — especialmente depois de terem operado juntos sob pressão." },
      { text: "Usar a proposta como alavanca para renegociar com os clientes originais — mostrar que tem opções", risco: "baixo", effects: { clientes: +2, financeiro: +2, processos: +1 }, avaliacao: "media", ensinamento: "Ter alternativas de receita melhora sua posição em todas as negociações simultâneas. Clientes originais que veem que você tem demanda suficiente para escolher têm incentivo de renovar em condições melhores." }
    ]
  },
  {
    title: "O Problema das Devoluções",
    description: "Em e-commerce, devoluções são parte da operação. Mas a taxa de devolução do marketplace chegou a 12,3% — a média do setor é 8%. O custo de processamento de cada devolução é de R$18. Com 18k pedidos/dia, isso representa R$398k/mês em custo de devolução. O marketplace tem uma política de devolução sem custo para o comprador — você absorve tudo.",
    tags: ["logistica"],
    choices: [
      { text: "Criar área dedicada de reverse logistics com processo automatizado para reduzir o custo por devolução", risco: "medio", effects: { processos: +4, financeiro: +3, tecnologia: +2, rh: -1 }, avaliacao: "boa", ensinamento: "Reverse logistics eficiente transforma custo em processo. Área dedicada com fluxo automatizado reduz o custo por devolução de R$18 para R$9-11 e o tempo de reprocessamento de dias para horas." },
      { text: "Negociar com o marketplace compartilhamento do custo de devolução acima de 9% de taxa", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { financeiro: +4, clientes: +1, processos: +1 }, avaliacao: "boa", ensinamento: "Custo de devolução acima da média do setor é um argumento legítimo de renegociação. O marketplace tem interesse em reduzir a taxa de devolução — compartilhar o custo cria incentivo mútuo." },
      { text: "Analisar as causas das devoluções e apresentar ao marketplace relatório de produto com maior incidência", risco: "baixo", effects: { processos: +3, clientes: +2, tecnologia: +1 }, avaliacao: "boa", ensinamento: "Dados de devolução por produto são valiosos para o marketplace — eles revelam problemas na descrição, no packaging ou na qualidade do produto do vendedor. Você se posiciona como parceiro estratégico, não apenas operador." },
      { text: "Absorver o custo e focar em outros problemas mais urgentes", risco: "medio", effects: { financeiro: -2, processos: -1 }, avaliacao: "ruim", ensinamento: "R$398k/mês de custo de devolução não é um problema que se pode ignorar com outros pendentes. Em financeiro de fulfillment, esse custo pode ser a diferença entre a operação lucrativa e deficitária." }
    ]
  },
  {
    title: "A Expansão para São Paulo Capital",
    description: "Um grande varejista de moda quer que você opere o fulfillment das lojas físicas deles em São Paulo — ship-from-store. O modelo é diferente do fulfillment de CD: você opera dentro das 12 lojas deles, separando pedidos online diretamente do estoque de loja. Volume: 4.200 pedidos/dia adicionais. Receita: R$8,4M/ano. Requer contratar 48 operadores e abrir uma célula de gestão dedicada.",
    tags: ["logistica"],
    choices: [
      { text: "Aceitar com início em 3 meses — tempo para contratar e treinar antes de iniciar a operação", risco: "medio", effects: { clientes: +3, financeiro: +4, rh: -2, processos: +2, sla: +1 }, avaliacao: "boa", ensinamento: "Aceitar com prazo adequado de implementação é a diferença entre o crescimento sustentável e o que gerou a crise atual. 3 meses para contratar 48 pessoas e desenvolver o processo de ship-from-store é um prazo honesto." },
      { text: "Recusar — ship-from-store é um modelo operacional diferente do fulfillment de CD que você domina", risco: "baixo", effects: { financeiro: -1, processos: +1 }, avaliacao: "media", ensinamento: "Recusar modelo novo quando você ainda está consolidando o atual é uma decisão conservadora mas defensável. Ship-from-store exige gestão de microestoque em 12 pontos diferentes — uma complexidade nova." },
      { text: "Aceitar e adaptar o processo de CD para o ship-from-store com a equipe atual", risco: "alto", gestorEffects: { esgotamento: +2 }, effects: { financeiro: +3, rh: -4, processos: -3, sla: -2, clientes: -1 }, avaliacao: "ruim", ensinamento: "Adaptar equipe atual sobrecarregada para um modelo operacional diferente é a mesma decisão que criou a crise do marketplace. Crescimento sem capacidade adequada cria o próximo ciclo de problema." },
      { text: "Aceitar como piloto em 3 lojas por 60 dias antes de comprometer as 12 lojas inteiras", risco: "baixo", effects: { financeiro: +2, processos: +3, clientes: +2, rh: -1 }, avaliacao: "boa", ensinamento: "Piloto em escala menor valida o modelo operacional antes de comprometer toda a capacidade. Se as 3 lojas funcionarem, você aceita as outras 9 com dados reais de custo e processo." }
    ]
  },
  {
    title: "A Liderança que Pediu Demissão",
    description: "Bruno, seu gerente de operações — que coordenou a crise dos últimos meses com dedicação total — pediu demissão. 'Trabalhei 14 horas por dia por 6 meses. Preciso de um trabalho que me dê vida fora do trabalho.' Ele tem todo o conhecimento operacional do crescimento recente. Dois coordenadores de turno demonstraram interesse no cargo.",
    tags: ["logistica"],
    choices: [
      { text: "Tentar reter o Bruno com equilíbrio de vida melhor: redução de jornada, home office nas tarefas estratégicas e bônus", risco: "medio", gestorEffects: { reputacaoInterna: +2 }, effects: { rh: +3, processos: +2, financeiro: -2 }, avaliacao: "boa", ensinamento: "Reter talento que identificou o problema correto (desequilíbrio de vida) com a solução correspondente demonstra que a empresa aprendeu. Um gestor de operações que pediu demissão por sobrecarga precisa de menos carga, não apenas de mais dinheiro." },
      { text: "Aceitar a demissão e promover o coordenador mais experiente com programa de mentoria acelerado", risco: "medio", effects: { rh: +2, processos: -1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Sucessão interna preserva parte do conhecimento e envia mensagem de que há crescimento de carreira. O gap de experiência do coordenador é real mas recuperável com mentoria estruturada." },
      { text: "Contratar um novo gerente de operações sênior no mercado — aproveitar a oportunidade de upgrading", risco: "alto", gestorEffects: { capitalPolitico: +1 }, effects: { rh: -2, processos: -2, financeiro: -3 }, avaliacao: "media", ensinamento: "Contratação externa em posição crítica de operação tem custo de adaptação alto. Um novo gerente leva 3-6 meses para dominar a operação — tempo em que você está vulnerável." },
      { text: "Criar uma estrutura de gestão compartilhada com os dois coordenadores em vez de um único gerente", risco: "baixo", effects: { rh: +2, processos: +1, financeiro: 0 }, avaliacao: "media", ensinamento: "Co-gestão distribui a carga que quebrou o Bruno — mas pode criar conflito de decisão em operação que precisa de comando único nos momentos de crise." }
    ]
  },
  {
    title: "A Concorrência do Fulfillment dos Marketplaces",
    description: "Dois grandes marketplaces anunciaram que vão oferecer fulfillment próprio para todos os vendedores da plataforma deles — concorrendo diretamente com operadores independentes como você. Eles têm CDs próprios em 12 estados e capacidade ilimitada de escala. O mercado pergunta: qual é o futuro dos fulfillments independentes?",
    tags: ["logistica"],
    choices: [
      { text: "Especializar em clientes fora dos grandes marketplaces — varejistas próprios e D2C que não querem depender de marketplace", risco: "medio", effects: { clientes: +3, processos: +3, sla: +2, financeiro: +2 }, avaliacao: "boa", ensinamento: "O cliente D2C que não quer depender de marketplace é exatamente aquele que precisa de um operador de fulfillment independente de confiança. Esse segmento cresce à medida que os marketplaces avançam." },
      { text: "Criar oferta de valor superior: personalização, relatórios avançados e integração com múltiplos canais que os marketplaces não oferecem", risco: "medio", effects: { tecnologia: +4, clientes: +3, processos: +3, financeiro: -2 }, avaliacao: "boa", ensinamento: "Fulfillment como plataforma de dados e personalização compete em dimensão diferente do fulfillment de commodity dos grandes marketplaces. Clientes que precisam de visibilidade e flexibilidade pagam prêmio por isso." },
      { text: "Fazer parceria com os marketplaces — ser o operador regional de fulfillment para eles nos mercados que eles não chegam", risco: "baixo", effects: { clientes: +2, financeiro: +3, sla: +2, processos: +2 }, avaliacao: "boa", ensinamento: "Ser o fulfillment regional dos grandes marketplaces é uma estratégia de sobrevivência e crescimento. Você não compete com eles — você opera onde eles não querem construir CD próprio." },
      { text: "Vender a operação enquanto o negócio ainda tem valor — antes que os marketplaces destruam a financeiro do setor", risco: "alto", gestorEffects: { capitalPolitico: +2, esgotamento: +1 }, requisitos: { indicadorMinimo: { financeiro: 10, clientes: 10 } }, effects: { financeiro: +8, rh: -3, clientes: -2 }, avaliacao: "media", ensinamento: "A janela de venda de operações de fulfillment independente pode estar se fechando com a verticalização dos grandes marketplaces. Se o timing é favorável e o valuation é justo, a saída pode ser a decisão mais inteligente." }
    ]
  },
  {
    title: "A Inteligência Artificial na Operação",
    description: "O CTO apresenta um projeto de IA para otimização de rotas, previsão de volume e alocação de operadores: R$680k de investimento, 4 meses de implementação. Os resultados projetados: redução de 22% no custo por pedido, aumento de 15% na produtividade dos operadores e redução de 40% no tempo de resposta a picos de demanda.",
    tags: ["logistica"],
    choices: [
      { text: "Aprovar o projeto de IA como investimento estratégico para 2025 — a eficiência operacional é o próximo diferencial", risco: "medio", effects: { tecnologia: +5, processos: +4, financeiro: -3, sla: +3, rh: +1 }, avaliacao: "boa", ensinamento: "IA em operações de fulfillment já é realidade nos maiores players do setor. Previsão de volume e alocação dinâmica de operadores eliminam os dois maiores drivers de custo variável em e-commerce." },
      { text: "Testar IA primeiro apenas na otimização de rotas — o impacto mais mensurável e de menor risco", risco: "baixo", effects: { tecnologia: +3, processos: +2, financeiro: -1, sla: +2 }, avaliacao: "boa", ensinamento: "Começar pela aplicação de IA com ROI mais previsível e risco menor é a abordagem científica correta. Rotas otimizadas têm resultado medido em 30 dias — não em 4 meses de implementação completa." },
      { text: "Adiar para depois da automação do CD — não sobrecarregar o time com dois projetos tecnológicos simultâneos", risco: "baixo", effects: { tecnologia: -1, processos: +1, financeiro: +1 }, avaliacao: "media", ensinamento: "Sequenciar projetos tecnológicos grandes é razoável quando os dois projetos competem pela mesma equipe técnica e de operações. O risco é que o atraso na IA deixa espaço para concorrentes que já implementaram." },
      { text: "Usar solução de IA SaaS em vez do desenvolvimento próprio — implementação em 6 semanas com R$8k/mês", risco: "baixo", effects: { tecnologia: +4, processos: +3, financeiro: -1, sla: +2 }, avaliacao: "boa", ensinamento: "SaaS de IA logística existe no mercado a preços acessíveis — você não precisa construir o que já existe. Soluções como Intelipost, Beepe ou LogGI têm APIs de IA para roteirização e previsão de demanda." }
    ]
  },
  {
    title: "O Futuro do Fulfillment",
    description: "A operação foi estabilizada, os contratos estão renovados e o time está mais estruturado. O board quer a visão para os próximos 3 anos em um setor que está mudando rapidamente.",
    tags: ["logistica"],
    choices: [
      { text: "Tech-enabled fulfillment: ser o operador mais tecnológico do mercado mid-market com IA, rastreabilidade total e dashboard em tempo real", effects: { tecnologia: +6, processos: +5, clientes: +4, sla: +4, financeiro: +3, rh: +2 }, avaliacao: "boa", ensinamento: "Differenciação por tecnologia em fulfillment cria vantagem defensável. O operador que oferece visibilidade em tempo real, previsão de demanda e integração omnichannel retém clientes que querem crescer — não apenas um serviço de caixa." },
      { text: "Especialista em nicho premium: fashion, beleza e produtos delicados que exigem manuseio especializado e embalagem premium", effects: { clientes: +4, financeiro: +4, processos: +4, rh: +3, financeiro: +3 }, avaliacao: "boa", ensinamento: "Fulfillment especializado em nicho premium tem financeiro 30-50% superior ao fulfillment de commodity. Fashion e beleza têm embalagem, manuseio e devolução com especificidades que operadores generalistas não atendem bem." },
      { text: "Plataforma de fulfillment: abrir a infraestrutura para outros pequenos varejistas se beneficiarem da sua escala", effects: { tecnologia: +4, financeiro: +3, processos: +3, clientes: +3, rh: +1 }, avaliacao: "boa", ensinamento: "Modelo de plataforma multiplica a receita da infraestrutura já construída. Pequenos varejistas que precisam de fulfillment profissional mas não têm volume para negociar sozinhos pagam pelo acesso à sua escala." },
      { text: "Expansão geográfica: cobrir todos os estados com CDs próprios antes que os marketplaces fechem o mercado", requisitos: { indicadorMinimo: { financeiro: 11, processos: 9 } }, effects: { financeiro: +3, clientes: +4, sla: +2, rh: -2, processos: -2 }, avaliacao: "media", ensinamento: "Expansão geográfica com a operação estabilizada é muito diferente da expansão desordenada que criou a crise. Com modelo comprovado e processos documentados, a replicação tem chance real de sucesso." }
    ]
  }
]

]; // fim LogisticaRounds
