import '../engine/models.dart';

// ═══════════════════════════════════════════════════════
//  SECTOR DATA — Intros + IndicadorMeta por setor
//  Espelha EmpresaTecnologia/Varejo/Logistica/Industria JS
// ═══════════════════════════════════════════════════════

// ── Indicadores por setor ─────────────────────────────
const indicadoresTecnologia = <IndicadorMeta>[
  IndicadorMeta('financeiro',    'Financeiro',    '💰'),
  IndicadorMeta('clima',         'Clima RH',      '🧑‍💻'),
  IndicadorMeta('satisfacao',    'Clientes',      '⭐'),
  IndicadorMeta('qualidade',     'Qualidade',     '🛠️'),
  IndicadorMeta('produtividade', 'Produtividade', '⚡'),
  IndicadorMeta('reputacao',     'Reputação',     '📣'),
  IndicadorMeta('inovacao',      'Inovação',      '🔬'),
  IndicadorMeta('seguranca',     'Segurança',     '🔒'),
];

const indicadoresVarejo = <IndicadorMeta>[
  IndicadorMeta('financeiro', 'Financeiro', '💰'),
  IndicadorMeta('rh',         'RH',         '👥'),
  IndicadorMeta('clientes',   'Clientes',   '⭐'),
  IndicadorMeta('processos',  'Processos',  '⚙️'),
  IndicadorMeta('margem',     'Margem',     '📊'),
  IndicadorMeta('estoque',    'Estoque',    '📦'),
  IndicadorMeta('marca',      'Marca',      '📣'),
  IndicadorMeta('digital',    'Digital',    '💻'),
];

const indicadoresLogistica = <IndicadorMeta>[
  IndicadorMeta('financeiro', 'Financeiro', '💰'),
  IndicadorMeta('rh',         'RH',         '👥'),
  IndicadorMeta('clientes',   'Clientes',   '⭐'),
  IndicadorMeta('processos',  'Processos',  '⚙️'),
  IndicadorMeta('sla',        'SLA',        '📋'),
  IndicadorMeta('frota',      'Frota',      '🚚'),
  IndicadorMeta('seguranca',  'Segurança',  '🔒'),
  IndicadorMeta('tecnologia', 'Tecnologia', '💻'),
];

const indicadoresIndustria = <IndicadorMeta>[
  IndicadorMeta('financeiro',   'Financeiro',   '💰'),
  IndicadorMeta('rh',           'RH',           '👥'),
  IndicadorMeta('clientes',     'Clientes',     '⭐'),
  IndicadorMeta('processos',    'Processos',    '⚙️'),
  IndicadorMeta('seguranca',    'Segurança',    '🔒'),
  IndicadorMeta('manutencao',   'Manutenção',   '🔧'),
  IndicadorMeta('qualidade',    'Qualidade',    '🛠️'),
  IndicadorMeta('conformidade', 'Conformidade', '📋'),
];

// ── Indicadores iniciais por setor ────────────────────
Map<String, int> indicadoresBase(String sector, int introIndex) {
  switch (sector) {
    case 'tecnologia':
      const byHist = [
        {'financeiro': 9, 'clima': 7, 'satisfacao': 7, 'qualidade': 6,
         'produtividade': 7, 'reputacao': 8, 'inovacao': 7, 'seguranca': 6},
        {'financeiro': 9, 'clima': 4, 'satisfacao': 7, 'qualidade': 6,
         'produtividade': 5, 'reputacao': 8, 'inovacao': 7, 'seguranca': 6},
        {'financeiro': 9, 'clima': 6, 'satisfacao': 7, 'qualidade': 6,
         'produtividade': 6, 'reputacao': 8, 'inovacao': 7, 'seguranca': 6},
      ];
      return Map<String, int>.from(
          byHist[introIndex.clamp(0, 2)]);
    case 'varejo':
      return {
        'financeiro': 6, 'rh': 7, 'clientes': 8, 'processos': 5,
        'margem': 5, 'estoque': 7, 'marca': 8, 'digital': 4,
      };
    case 'logistica':
      return {
        'financeiro': 7, 'rh': 6, 'clientes': 7, 'processos': 4,
        'sla': 5, 'frota': 7, 'seguranca': 8, 'tecnologia': 4,
      };
    case 'industria':
      return {
        'financeiro': 8, 'rh': 6, 'clientes': 7, 'processos': 5,
        'seguranca': 4, 'manutencao': 5, 'qualidade': 7, 'conformidade': 8,
      };
    default:
      return {
        'financeiro': 7, 'rh': 6, 'clientes': 7, 'processos': 6,
        'qualidade': 7, 'reputacao': 7, 'inovacao': 6, 'seguranca': 6,
      };
  }
}

// ── Meta por setor ────────────────────────────────────
List<IndicadorMeta> indicadoresMeta(String sector) {
  switch (sector) {
    case 'tecnologia': return indicadoresTecnologia;
    case 'varejo':     return indicadoresVarejo;
    case 'logistica':  return indicadoresLogistica;
    case 'industria':  return indicadoresIndustria;
    default:           return indicadoresTecnologia;
  }
}

// ── Intros por setor ──────────────────────────────────
final introsTecnologia = <IntroData>[
  IntroData(
    badge: 'Startup de Tecnologia · SaaS B2B',
    subtitulo: 'Você acaba de assumir a gestão. O relógio já está correndo.',
    alertaIcone: '🚨', alertaTitulo: 'Crise em Andamento',
    secoes: [
      IntroSectionData(icone: '🏢', titulo: 'A Empresa',
        corpo: 'Fundada há 4 anos num coworking em São Paulo, sua startup cresceu de 3 para 67 funcionários. Vocês desenvolvem uma plataforma SaaS de gestão para PMEs e já atingiram R\$ 4,2 milhões em ARR. O NPS do produto é 71 — acima da média do mercado.'),
      IntroSectionData(icone: '📉', titulo: 'Contexto de Mercado',
        corpo: 'O setor de SaaS B2B no Brasil cresceu 28% no último ano, mas a competição esquentou. Dois concorrentes bem financiados entraram no seu nicho com preços 20% abaixo dos seus.'),
      IntroSectionData(icone: '⚠️', titulo: 'Situação Atual',
        corpo: 'A dívida técnica acumulada nos últimos 18 meses está travando a velocidade de entrega. Três sêniores pediram demissão no último mês. O churn de clientes subiu de 2,1% para 3,8% mensais.'),
      IntroSectionData(icone: '🎯', titulo: 'Principal Desafio',
        corpo: 'Equilibrar a pressão por crescimento rápido com a necessidade urgente de estabilizar o time e a plataforma.'),
    ],
  ),
  IntroData(
    badge: 'EdTech · Ensino Digital B2C',
    subtitulo: 'O boom acabou. Agora é hora de construir um negócio de verdade.',
    alertaIcone: '🚨', alertaTitulo: 'Runway Crítico',
    secoes: [
      IntroSectionData(icone: '🏢', titulo: 'A Empresa',
        corpo: 'Sua plataforma de educação online chegou a 180 mil alunos ativos em 2021. Com R\$ 22 milhões em receita anual e 95 colaboradores, a empresa é referência em cursos de tecnologia e negócios.'),
      IntroSectionData(icone: '📉', titulo: 'Contexto de Mercado',
        corpo: 'A volta ao presencial reduziu a demanda por cursos online em 34%. Plataformas internacionais ampliaram presença no Brasil com preços agressivos.'),
      IntroSectionData(icone: '⚠️', titulo: 'Situação Atual',
        corpo: 'A base de assinantes caiu de 180 mil para 94 mil em 18 meses. O runway atual é de 8 meses — insuficiente para chegar ao break-even.'),
      IntroSectionData(icone: '🎯', titulo: 'Principal Desafio',
        corpo: 'Decidir entre pivotar para B2B corporativo ou focar no B2C com produto mais enxuto e preço competitivo.'),
    ],
  ),
  IntroData(
    badge: 'Scale-up de IA · Automação Corporativa',
    subtitulo: 'O produto funciona. O problema é que o mercado ainda não sabe disso.',
    alertaIcone: '🚨', alertaTitulo: 'Pipeline Travado',
    secoes: [
      IntroSectionData(icone: '🏢', titulo: 'A Empresa',
        corpo: 'Sua empresa desenvolve automação inteligente para RH e compliance. Fundada por ex-pesquisadores da USP, o produto tem NPS de 83 entre os 40 clientes atuais. Faturamento de R\$ 6,8M em ARR.'),
      IntroSectionData(icone: '📉', titulo: 'Contexto de Mercado',
        corpo: 'O hype de IA generativa fez grandes players anunciarem soluções similares. Clientes enterprise passaram a aguardar o mercado amadurecer.'),
      IntroSectionData(icone: '⚠️', titulo: 'Situação Atual',
        corpo: '60% das oportunidades estão em avaliação técnica há mais de 90 dias. A equipe de vendas não tem experiência enterprise.'),
      IntroSectionData(icone: '🎯', titulo: 'Principal Desafio',
        corpo: 'Transformar um produto tecnicamente superior em negócio comercialmente viável antes que os grandes players lancem suas soluções.'),
    ],
  ),
];

final introsVarejo = <IntroData>[
  IntroData(
    badge: 'Rede de Varejo · Omnichannel',
    subtitulo: 'Você assumiu a gestão. As lojas físicas sangram e o digital ainda não compensou.',
    alertaIcone: '🚨', alertaTitulo: 'Margem em Queda',
    secoes: [
      IntroSectionData(icone: '🏢', titulo: 'A Empresa',
        corpo: 'Fundada há 22 anos no interior de São Paulo, sua rede cresceu para 38 lojas físicas. Com R\$ 180 milhões em receita e 820 funcionários, sempre foi referência em atendimento. O e-commerce representa 14% das vendas.'),
      IntroSectionData(icone: '📉', titulo: 'Contexto de Mercado',
        corpo: 'Marketplaces com entrega em 24h e discount stores pressionam o varejo regional. A margem bruta do setor caiu de 32% para 24% nos últimos 5 anos.'),
      IntroSectionData(icone: '⚠️', titulo: 'Situação Atual',
        corpo: 'A margem operacional caiu de 8,3% para 5,1% em 18 meses. Seis lojas têm resultado negativo. O estoque parado soma R\$ 4,2 milhões.'),
      IntroSectionData(icone: '🎯', titulo: 'Principal Desafio',
        corpo: 'Reestruturar a rede física sem destruir o atendimento personalizado, enquanto acelera a transformação digital.'),
    ],
  ),
  IntroData(
    badge: 'Rede de Farmácias · Varejo de Saúde',
    subtitulo: 'As redes nacionais chegaram na sua cidade. E trouxeram preços que você não consegue bater.',
    alertaIcone: '🚨', alertaTitulo: 'Concorrência Nacional Chegou',
    secoes: [
      IntroSectionData(icone: '🏢', titulo: 'A Empresa',
        corpo: 'Sua rede regional de farmácias foi fundada há 27 anos. Com 24 lojas, 360 funcionários e R\$ 110 milhões em receita, construiu base fiel graças ao atendimento humanizado.'),
      IntroSectionData(icone: '📉', titulo: 'Contexto de Mercado',
        corpo: 'Duas grandes redes nacionais abriram 31 lojas na região com preços até 15% abaixo. Digitalização acelerou: apps de comparação e delivery são o novo padrão.'),
      IntroSectionData(icone: '⚠️', titulo: 'Situação Atual',
        corpo: 'Receita caiu 11% no último semestre. Ticket médio recuou de R\$ 98 para R\$ 81. Sistema de gestão de estoque está desatualizado.'),
      IntroSectionData(icone: '🎯', titulo: 'Principal Desafio',
        corpo: 'Reposicionar para competir no que as grandes redes não conseguem replicar: proximidade, confiança e serviço personalizado.'),
    ],
  ),
  IntroData(
    badge: 'Atacarejo Regional · Autosserviço',
    subtitulo: 'Você dobrou o tamanho em 3 anos. Agora o crescimento rápido está cobrando a conta.',
    alertaIcone: '🚨', alertaTitulo: 'Expansão Desequilibrada',
    secoes: [
      IntroSectionData(icone: '🏢', titulo: 'A Empresa',
        corpo: 'Seu atacarejo cresceu de 2 para 7 lojas nos últimos 3 anos. Com 980 funcionários e R\$ 420 milhões em receita, é referência no interior de Minas Gerais.'),
      IntroSectionData(icone: '📉', titulo: 'Contexto de Mercado',
        corpo: 'Normalização da inflação reduziu o ímpeto do consumidor para atacarejo. Grandes redes expandem para o interior com preços de escala nacional.'),
      IntroSectionData(icone: '⚠️', titulo: 'Situação Atual',
        corpo: 'Três lojas operam abaixo do ponto de equilíbrio. A dívida representa 2,8x o EBITDA. Taxa de perdas subiu de 1,4% para 2,9%.'),
      IntroSectionData(icone: '🎯', titulo: 'Principal Desafio',
        corpo: 'Desacelerar o crescimento e colocar as lojas existentes no azul antes da chegada dos grandes concorrentes.'),
    ],
  ),
];

final introsLogistica = <IntroData>[
  IntroData(
    badge: 'Operadora Last-Mile · Logística Urbana',
    subtitulo: 'Você gerencia 380 mil pacotes por mês. O SLA está quebrando.',
    alertaIcone: '🚨', alertaTitulo: 'SLA em Colapso',
    secoes: [
      IntroSectionData(icone: '🏢', titulo: 'A Empresa',
        corpo: 'Fundada há 11 anos, sua operadora conta com 420 entregadores e 8 centros de distribuição, movimentando 380 mil pacotes por mês. Faturamento de R\$ 46 milhões.'),
      IntroSectionData(icone: '📉', titulo: 'Contexto de Mercado',
        corpo: 'O e-commerce acelerou a demanda por last-mile, mas também criou padrões impossíveis: entrega em 24h, rastreamento em tempo real, política de devolução sem atrito.'),
      IntroSectionData(icone: '⚠️', titulo: 'Situação Atual',
        corpo: 'O SLA de 48h está sendo cumprido em apenas 69% das entregas — o benchmark do setor é 88%. Um cliente representa 38% da receita com contrato vencendo em 14 meses.'),
      IntroSectionData(icone: '🎯', titulo: 'Principal Desafio',
        corpo: 'Recuperar o SLA sem destruir a margem, retendo o cliente âncora enquanto diversifica a base.'),
    ],
  ),
  IntroData(
    badge: 'Transportadora Regional · Carga Fracionada',
    subtitulo: 'A frota está envelhecendo. Os concorrentes chegaram com caminhões novos.',
    alertaIcone: '🚨', alertaTitulo: 'Frota Obsoleta',
    secoes: [
      IntroSectionData(icone: '🏢', titulo: 'A Empresa',
        corpo: 'Sua transportadora opera há 18 anos no corredor SP-MG-RJ. Com 180 caminhões e 340 motoristas, transporta carga fracionada para 1.200 clientes ativos.'),
      IntroSectionData(icone: '📉', titulo: 'Contexto de Mercado',
        corpo: 'Plataformas de frete digital conectam embarcadores diretamente a transportadores autônomos, pressionando as margens das transportadoras tradicionais.'),
      IntroSectionData(icone: '⚠️', titulo: 'Situação Atual',
        corpo: '60% da frota tem mais de 10 anos. O custo de manutenção representa 18% da receita — o dobro do benchmark. Três acidentes no último trimestre elevaram o prêmio do seguro.'),
      IntroSectionData(icone: '🎯', titulo: 'Principal Desafio',
        corpo: 'Renovar a frota de forma financeiramente viável enquanto mantém a competitividade operacional e a segurança.'),
    ],
  ),
  IntroData(
    badge: 'Centro de Distribuição · Fulfillment B2B',
    subtitulo: 'Você opera o maior CD da região. A automação chegou — e exige uma decisão.',
    alertaIcone: '🚨', alertaTitulo: 'Pressão por Automação',
    secoes: [
      IntroSectionData(icone: '🏢', titulo: 'A Empresa',
        corpo: 'Seu centro de distribuição processa 2,4 milhões de itens por mês para 85 clientes B2B. Com 680 operadores e 42 mil m² de área, é referência em acuracidade de inventário.'),
      IntroSectionData(icone: '📉', titulo: 'Contexto de Mercado',
        corpo: 'Grandes players do setor estão investindo pesado em automação: robôs de picking, WMS de última geração e IA para previsão de demanda. O custo por unidade processada está caindo para quem automatiza.'),
      IntroSectionData(icone: '⚠️', titulo: 'Situação Atual',
        corpo: 'Dois clientes que representam 28% da receita solicitaram cotação de concorrentes automatizados. O custo por unidade está 23% acima do novo benchmark do setor.'),
      IntroSectionData(icone: '🎯', titulo: 'Principal Desafio',
        corpo: 'Decidir como e quando investir em automação sem comprometer a operação atual nem destruir o caixa da empresa.'),
    ],
  ),
];

final introsIndustria = <IntroData>[
  IntroData(
    badge: 'Indústria Metalúrgica · Peças de Precisão',
    subtitulo: 'Parque fabril envelhecido. ISO vencendo. Acidentes em alta.',
    alertaIcone: '🚨', alertaTitulo: 'Segurança em Alerta',
    secoes: [
      IntroSectionData(icone: '🏢', titulo: 'A Empresa',
        corpo: 'Fundada em 1987, a metalúrgica emprega 310 funcionários e produz peças de precisão para os setores automotivo e de construção civil. Faturamento de R\$ 72 milhões.'),
      IntroSectionData(icone: '📉', titulo: 'Contexto de Mercado',
        corpo: 'A indústria automotiva passa por uma transformação acelerada: eletrificação, novos entrantes asiáticos e exigências crescentes de ESG dos grandes montadores.'),
      IntroSectionData(icone: '⚠️', titulo: 'Situação Atual',
        corpo: '60% das máquinas têm mais de 15 anos. A certificação ISO 9001 vence em 6 meses. O IFA (Índice de Frequência de Acidentes) está 2× acima do benchmark nacional.'),
      IntroSectionData(icone: '🎯', titulo: 'Principal Desafio',
        corpo: 'Modernizar o parque fabril e zerar os acidentes sem paralisar a produção que sustenta os contratos atuais.'),
    ],
  ),
  IntroData(
    badge: 'Indústria Alimentícia · Processados Regionais',
    subtitulo: 'A vigilância sanitária está na porta. E os clientes exigem rastreabilidade total.',
    alertaIcone: '🚨', alertaTitulo: 'Compliance em Risco',
    secoes: [
      IntroSectionData(icone: '🏢', titulo: 'A Empresa',
        corpo: 'Sua indústria alimentícia processa 1.200 toneladas de alimentos por mês. Com 520 funcionários e R\$ 94 milhões em receita, distribui para 3.400 pontos de venda em 8 estados.'),
      IntroSectionData(icone: '📉', titulo: 'Contexto de Mercado',
        corpo: 'A ANVISA intensificou as inspeções após escândalos no setor. Grandes redes de varejo passaram a exigir rastreabilidade total da cadeia produtiva como condição contratual.'),
      IntroSectionData(icone: '⚠️', titulo: 'Situação Atual',
        corpo: 'Uma inspeção recente resultou em 14 notificações. O sistema de rastreabilidade atual só cobre 60% da produção. Dois contratos com grandes redes dependem de adequação nos próximos 90 dias.'),
      IntroSectionData(icone: '🎯', titulo: 'Principal Desafio',
        corpo: 'Implementar rastreabilidade total e regularizar as pendências sanitárias sem paralisar a operação nem perder os grandes contratos.'),
    ],
  ),
  IntroData(
    badge: 'Indústria Química · Especialidades',
    subtitulo: 'O mercado quer produtos sustentáveis. Sua planta foi projetada para outra era.',
    alertaIcone: '🚨', alertaTitulo: 'Transição ESG',
    secoes: [
      IntroSectionData(icone: '🏢', titulo: 'A Empresa',
        corpo: 'Sua indústria química produz especialidades para os setores de construção civil, tintas e adesivos. Com 240 funcionários e R\$ 58 milhões em receita, é fornecedora homologada de 6 multinacionais.'),
      IntroSectionData(icone: '📉', titulo: 'Contexto de Mercado',
        corpo: 'As multinacionais clientes estabeleceram metas de redução de carbono para sua cadeia de fornecedores. Certificações ambientais passaram de diferencial a requisito obrigatório.'),
      IntroSectionData(icone: '⚠️', titulo: 'Situação Atual',
        corpo: 'Duas multinacionais comunicaram que renovarão contratos apenas com fornecedores com certificação ambiental ISO 14001. O prazo é de 18 meses. A planta atual não está adequada.'),
      IntroSectionData(icone: '🎯', titulo: 'Principal Desafio',
        corpo: 'Conduzir a transição ambiental dentro do prazo e do orçamento sem comprometer a operação produtiva que sustenta os contratos existentes.'),
    ],
  ),
];

// ── Função de lookup ───────────────────────────────────
List<IntroData> introsForSector(String sector) {
  switch (sector) {
    case 'tecnologia': return introsTecnologia;
    case 'varejo':     return introsVarejo;
    case 'logistica':  return introsLogistica;
    case 'industria':  return introsIndustria;
    default:           return introsTecnologia;
  }
}

String sectorIcon(String sector) {
  switch (sector) {
    case 'tecnologia': return '🚀';
    case 'varejo':     return '🛒';
    case 'logistica':  return '🚚';
    case 'industria':  return '🏭';
    default:           return '🏢';
  }
}

String sectorName(String sector) {
  switch (sector) {
    case 'tecnologia': return 'Tecnologia';
    case 'varejo':     return 'Varejo';
    case 'logistica':  return 'Logística';
    case 'industria':  return 'Indústria';
    default:           return sector;
  }
}
