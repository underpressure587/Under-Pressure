import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'firestore_service.dart';

/// Um termo do glossário do jogo.
class TermoGlossario {
  final String termo;
  final String def;
  final String cat;
  const TermoGlossario(this.termo, this.def, this.cat);

  Map<String, dynamic> toJson() => {'termo': termo, 'def': def, 'cat': cat};

  factory TermoGlossario.fromJson(Map<String, dynamic> j) => TermoGlossario(
        j['termo'] as String? ?? '',
        j['def'] as String? ?? '',
        j['cat'] as String? ?? '',
      );
}

/// Glossário técnico do jogo — mesma lógica híbrida usada no site:
///
///   1. Ao iniciar o app, carrega o que estiver salvo em cache local
///      (SharedPreferences), pra já ter algo pronto sem depender de rede.
///   2. Toda vez que a tela do glossário é aberta, busca de novo no
///      Firestore (leitura pública, não exige login — funciona inclusive
///      para convidados):
///        • Achou termos diferentes do que já está na tela → troca.
///        • Achou exatamente igual → não faz nada.
///        • Nuvem sem seções ou sem termos (zerada no Painel de Controle)
///          → volta pro conjunto padrão embarcado no app, e limpa o cache.
///        • Falhou (sem internet, erro de rede) → mantém o que já estava.
class GlossarioService {
  static const _chaveCache = 'gsp_glossario_cache_v1';

  /// Lista atualmente ativa. A tela escuta isso (ValueListenableBuilder)
  /// pra redesenhar sozinha sempre que os dados mudarem.
  static final ValueNotifier<List<TermoGlossario>> termos =
      ValueNotifier<List<TermoGlossario>>(termosPadrao);

  static bool _cacheJaCarregado = false;

  /// Chamado uma vez, no boot do app (main.dart) — aplica o último cache
  /// salvo, se existir, antes mesmo do jogador abrir qualquer tela.
  static Future<void> carregarCache() async {
    if (_cacheJaCarregado) return;
    _cacheJaCarregado = true;
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_chaveCache);
      if (raw == null) return;
      final lista = (jsonDecode(raw) as List)
          .map((e) => TermoGlossario.fromJson(e as Map<String, dynamic>))
          .toList();
      if (lista.isNotEmpty) termos.value = lista;
    } catch (_) {
      // Cache corrompido ou inexistente — segue com o padrão embarcado.
    }
  }

  /// Busca a versão mais atual no Firestore. Chamado toda vez que a tela
  /// do glossário é aberta — sempre busca de novo, na hora.
  static Future<void> sincronizar() async {
    try {
      final docSecoes =
          await FirestoreService.getDoc('config/glossarioSecoes');
      final nomesSecoes = ((docSecoes?['nomes'] as List?) ?? const [])
          .whereType<String>()
          .toList();

      final linhas =
          await FirestoreService.query('glossario', orderBy: 'termo');
      final termosPlano = linhas
          .map((f) => TermoGlossario(
                (f['termo'] as String? ?? '').trim(),
                (f['def'] as String? ?? '').trim(),
                (f['categoria'] as String? ?? '').trim(),
              ))
          .where((t) => t.termo.isNotEmpty && t.def.isNotEmpty)
          .toList();

      List<TermoGlossario> novoConjunto;
      if (nomesSecoes.isEmpty || termosPlano.isEmpty) {
        // Nuvem zerada (sem seções ou sem termos) — volta pro padrão.
        novoConjunto = termosPadrao;
      } else {
        final ordenado = <TermoGlossario>[];
        for (final secao in nomesSecoes) {
          ordenado.addAll(termosPlano.where((t) => t.cat == secao));
        }
        // Termos cuja categoria não bate com nenhuma seção conhecida (ex:
        // seção renomeada/removida no painel) ainda entram, só que no
        // final — pra não sumir silenciosamente.
        final orfaos = termosPlano.where((t) => !nomesSecoes.contains(t.cat));
        ordenado.addAll(orfaos);
        novoConjunto = ordenado.isNotEmpty ? ordenado : termosPadrao;
      }

      // Só troca (e só notifica a tela) se for realmente diferente do que
      // já está ativo.
      if (_listasIguais(novoConjunto, termos.value)) return;

      termos.value = novoConjunto;

      final prefs = await SharedPreferences.getInstance();
      if (identical(novoConjunto, termosPadrao)) {
        await prefs.remove(_chaveCache);
      } else {
        await prefs.setString(
          _chaveCache,
          jsonEncode(novoConjunto.map((t) => t.toJson()).toList()),
        );
      }
    } catch (_) {
      // Offline ou erro de rede — silencioso, mantém o que já estava.
    }
  }

  static bool _listasIguais(List<TermoGlossario> a, List<TermoGlossario> b) {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (a[i].termo != b[i].termo ||
          a[i].def != b[i].def ||
          a[i].cat != b[i].cat) {
        return false;
      }
    }
    return true;
  }
}

// ── Conjunto padrão, embarcado no app ──────────────────────────────────
// Funciona 100% offline — usado enquanto a versão da nuvem (editável pelo
// Painel de Controle) ainda não foi baixada/cacheada, ou quando a nuvem
// está zerada.
const termosPadrao = <TermoGlossario>[
  // ── Jogo ─────────────────────────────────────────
  TermoGlossario('SLA', 'Acordo de Nível de Serviço (Service Level Agreement). Define metas de prazo e qualidade entre fornecedor e cliente. Ex: entregar 95% dos pedidos em até 48h.', 'Jogo'),
  TermoGlossario('NPS', "Nota de lealdade dos clientes (Net Promoter Score). Calculado pela pergunta: 'De 0 a 10, quanto você recomendaria esta empresa?' Acima de 70 é excelente.", 'Jogo'),
  TermoGlossario('Benchmark', 'Referência média do mercado para um indicador. Exibido abaixo das barras durante o jogo — serve para comparar seu desempenho com o do setor.', 'Jogo'),
  TermoGlossario('Capital Político', 'Credibilidade do gestor junto ao conselho e parceiros estratégicos. Cai com decisões precipitadas ou resultados ruins. Sobe com alinhamento e entregas consistentes.', 'Jogo'),
  TermoGlossario('Esgotamento', 'Nível de desgaste pessoal do gestor. Ao atingir 10, é necessário se afastar por colapso e o mandato é encerrado antecipadamente.', 'Jogo'),
  TermoGlossario('Flag', 'Padrão de comportamento registrado ao longo do mandato. Influencia quais eventos aparecem e o desfecho final. Ex: Liderança Tóxica, Crescimento sem Caixa.', 'Jogo'),
  TermoGlossario('Imprevisto', 'Evento inesperado que altera os efeitos das decisões durante aquela rodada. Pode ser positivo ou negativo, e é influenciado pelo estado atual dos indicadores.', 'Jogo'),
  TermoGlossario('Margem Operacional', 'Quanto de cada real de receita sobra como lucro operacional. Ex: margem de 8% significa que a empresa lucra R\$8 para cada R\$100 vendidos.', 'Jogo'),
  TermoGlossario('Mandato', 'Uma partida completa do jogo, com 15 rodadas de decisões organizadas em três fases (Diagnóstico, Pressão e Decisão Crítica). O gestor conduz a empresa do início ao fim e recebe uma pontuação pelo resultado.', 'Jogo'),
  TermoGlossario('Interdependência', 'Relação causal entre indicadores. Ex: na logística, frota deteriorada → segurança cai → RH cai → resultado financeiro cai.', 'Jogo'),

  // ── Finanças ──────────────────────────────────────
  TermoGlossario('ARR', 'Receita Recorrente Anual (Annual Recurring Revenue). Total de contratos ativos que a empresa recebe por ano. Principal métrica de saúde de empresas SaaS.', 'Finanças'),
  TermoGlossario('Churn', 'Taxa de cancelamento de clientes. Churn de 3,8% ao mês significa que 3,8% da base cancela todo mês — o que elimina metade da base em menos de 2 anos.', 'Finanças'),
  TermoGlossario('CAC', 'Custo de Aquisição de Cliente. Quanto a empresa gasta em marketing e vendas para conquistar um novo cliente. Quanto menor, melhor.', 'Finanças'),
  TermoGlossario('Runway', "Tempo que a empresa sobrevive com o caixa atual, sem nova receita. Ex: 'temos 8 meses de runway' significa que o dinheiro acaba em 8 meses.", 'Finanças'),
  TermoGlossario('Break-even', 'Ponto de equilíbrio: quando receitas e custos se igualam. A empresa deixa de ter prejuízo e começa a lucrar a partir desse ponto.', 'Finanças'),
  TermoGlossario('Capex', 'Investimento em bens de capital fixo (Capital Expenditure). Ex: comprar máquinas, construir um galpão, instalar painéis solares. Diferente de custo operacional.', 'Finanças'),
  TermoGlossario('Hedge Cambial', 'Instrumento financeiro que trava o custo do dólar, protegendo empresas que têm custos em moeda estrangeira mas receita em reais.', 'Finanças'),
  TermoGlossario('Payback', 'Prazo em que um investimento se paga com a economia ou receita gerada. Ex: painéis solares com payback de 4,5 anos se pagam em 4 anos e 6 meses.', 'Finanças'),
  TermoGlossario('IPO', 'Abertura de capital na bolsa de valores (Initial Public Offering). A empresa vende ações ao público para captar dinheiro e cresce com capital dos investidores.', 'Finanças'),
  TermoGlossario('M&A', 'Fusões e Aquisições (Mergers & Acquisitions). Processo de compra, fusão ou incorporação de uma empresa por outra.', 'Finanças'),
  TermoGlossario('Due Diligence', 'Análise detalhada feita antes de uma aquisição ou investimento. Verifica riscos financeiros, jurídicos, trabalhistas e operacionais da empresa-alvo.', 'Finanças'),
  TermoGlossario('Série A / Série B', 'Rodadas de investimento numeradas. Série A é a primeira rodada significativa (geralmente R\$5M a R\$30M). Série B é a seguinte, para escalar o que foi validado.', 'Finanças'),
  TermoGlossario('Angel (Investidor-Anjo)', 'Pessoa física que investe capital próprio em startups em estágio inicial, geralmente em troca de uma participação pequena na empresa.', 'Finanças'),
  TermoGlossario('Venture Capital', 'Fundo de capital de risco que investe em startups com alto potencial de crescimento. Em troca, recebe participação societária.', 'Finanças'),
  TermoGlossario('Private Equity', 'Fundo que investe em empresas maiores e mais maduras (não startups), buscando eficiência operacional e retorno na venda futura.', 'Finanças'),
  TermoGlossario('Stock Options', 'Opção de compra de ações da empresa por um preço fixo. Benefício que alinha o interesse do colaborador com o crescimento da empresa a longo prazo.', 'Finanças'),
  TermoGlossario('Switching Cost', 'Custo que o cliente teria ao trocar de fornecedor — tempo de integração, retreinamento, risco de falha. Quanto maior, mais difícil é perder o cliente.', 'Finanças'),

  // ── Tecnologia ────────────────────────────────────
  TermoGlossario('SaaS', 'Software como Serviço (Software as a Service). Modelo em que o software é cobrado mensalmente por assinatura, sem instalação local. Ex: Google Drive, Salesforce.', 'Tecnologia'),
  TermoGlossario('Dívida Técnica', 'Atalhos no código que aceleram a entrega hoje, mas criam problemas no futuro. Quanto maior a dívida, mais lento e instável o sistema fica com o tempo.', 'Tecnologia'),
  TermoGlossario('Pivot', 'Mudança radical de direção estratégica ou de modelo de negócio. Ex: uma startup de SaaS que decide virar plataforma de IA generativa.', 'Tecnologia'),
  TermoGlossario('Product-Market Fit', 'Encaixe produto-mercado. O momento em que o produto resolve tão bem um problema real que os clientes o recomendam naturalmente e o churn cai.', 'Tecnologia'),
  TermoGlossario('Roadmap', 'Plano de funcionalidades e melhorias do produto ordenado no tempo. Define o que será desenvolvido e em que sequência.', 'Tecnologia'),
  TermoGlossario('ERP', 'Sistema integrado de gestão empresarial (Enterprise Resource Planning). Centraliza finanças, estoque, RH e produção em um único sistema.', 'Tecnologia'),
  TermoGlossario('IoT', 'Internet das Coisas (Internet of Things). Sensores e equipamentos conectados à internet que enviam dados em tempo real. Ex: sensor de temperatura em câmara fria.', 'Tecnologia'),
  TermoGlossario('DPO', 'Encarregado de Proteção de Dados (Data Protection Officer). Profissional responsável pela conformidade com a LGPD. Nomeação obrigatória para empresas que tratam dados pessoais em escala.', 'Tecnologia'),
  TermoGlossario('TMS', 'Sistema de Gerenciamento de Transporte (Transportation Management System). Controla rotas, rastreamento e custos de frota em operações logísticas.', 'Tecnologia'),
  TermoGlossario('Injeção SQL', 'Tipo de ataque hacker que insere comandos maliciosos em campos de texto para acessar o banco de dados e roubar informações.', 'Tecnologia'),

  // ── Operações ─────────────────────────────────────
  TermoGlossario('Lead Time', 'Tempo total desde o pedido até a entrega ao cliente. Reduzir o lead time é um dos principais objetivos da gestão de operações.', 'Operações'),
  TermoGlossario('Kanban', 'Sistema de produção puxada. Produz apenas o que foi vendido ou consumido, reduzindo estoque intermediário e tempo de entrega.', 'Operações'),
  TermoGlossario('Lean Manufacturing', 'Manufatura enxuta. Filosofia que elimina desperdícios no processo produtivo — tempo ocioso, estoque excessivo, defeitos, movimentação desnecessária.', 'Operações'),
  TermoGlossario('Cold Chain', 'Cadeia do frio. Transporte e armazenagem de produtos que precisam de temperatura controlada, como alimentos perecíveis e medicamentos.', 'Operações'),
  TermoGlossario('White Label', 'Produto fabricado por uma empresa e vendido por outra com a sua própria marca. Ex: supermercado que vende arroz com a marca própria fabricado por terceiro.', 'Operações'),
  TermoGlossario('Dark Store', 'Loja física convertida em mini-centro de distribuição para e-commerce, sem atendimento presencial. Foco em separação e envio rápido de pedidos.', 'Operações'),
  TermoGlossario('Click-and-Collect', 'Modelo onde o cliente compra online e retira na loja física. Elimina o custo de frete e gera tráfego para o ponto físico.', 'Operações'),
  TermoGlossario('SKU', 'Código único de produto (Stock Keeping Unit). Cada variação de produto (tamanho, cor, sabor) tem um SKU diferente para controle de estoque.', 'Operações'),
  TermoGlossario('Omnichannel', 'Estratégia que integra todos os canais de venda e atendimento (loja física, site, app, telefone) em uma experiência única para o cliente.', 'Operações'),

  // ── RH ────────────────────────────────────────────
  TermoGlossario('Burnout', 'Síndrome de esgotamento profissional causada por estresse crônico no trabalho. Pode levar ao afastamento. No jogo, representa colapso do gestor.', 'RH'),
  TermoGlossario('Onboarding', 'Processo de integração de um novo colaborador ou cliente. Inclui treinamentos, apresentações e adaptação à cultura e ferramentas da empresa.', 'RH'),
  TermoGlossario('Rotatividade (Turnover)', 'Percentual de funcionários que saem e precisam ser substituídos no ano. Alta rotatividade sinaliza problemas de gestão, cultura ou remuneração.', 'RH'),

  // ── Regulatório ───────────────────────────────────
  TermoGlossario('LGPD', 'Lei Geral de Proteção de Dados. Regula o uso de dados pessoais no Brasil. Multas podem chegar a 2% do faturamento ou R\$50 milhões por infração.', 'Regulatório'),
  TermoGlossario('ANPD', 'Autoridade Nacional de Proteção de Dados. Órgão do governo que fiscaliza o cumprimento da LGPD e aplica penalidades em caso de violação.', 'Regulatório'),
  TermoGlossario('ISO 9001', 'Norma internacional de gestão da qualidade. Certifica que a empresa tem processos controlados e rastreáveis. Exigida por grandes clientes industriais.', 'Regulatório'),
  TermoGlossario('ESG', 'Critérios ambientais, sociais e de governança (Environmental, Social, Governance). Avaliados por investidores e clientes para decidir com quem fazer negócio.', 'Regulatório'),
  TermoGlossario('IFA', 'Índice de Frequência de Acidentes. Mede o número de acidentes com afastamento por milhão de horas trabalhadas. Benchmark nacional: 8,2.', 'Regulatório'),
  TermoGlossario('EPI', 'Equipamento de Proteção Individual. Capacete, luva, óculos, bota e outros itens obrigatórios por lei para proteção do trabalhador.', 'Regulatório'),
  TermoGlossario('CIPA', 'Comissão Interna de Prevenção de Acidentes. Grupo de funcionários e gestores que acompanha as condições de segurança. Obrigatória em empresas com 20+ funcionários.', 'Regulatório'),
  TermoGlossario('CAT', 'Comunicação de Acidente de Trabalho. Documento obrigatório emitido pelo empregador quando um funcionário sofre acidente ou doença ocupacional.', 'Regulatório'),
  TermoGlossario('MTE', 'Ministério do Trabalho e Emprego. Órgão federal que fiscaliza as condições de trabalho, pode autuar empresas e interditar operações inseguras.', 'Regulatório'),

  // ── Estratégia ────────────────────────────────────
  TermoGlossario('B2B', 'Business to Business. Empresa que vende para outras empresas (não para o consumidor final). Ex: software de gestão vendido para PMEs.', 'Estratégia'),
  TermoGlossario('B2C', 'Business to Consumer. Empresa que vende diretamente ao consumidor final. Ex: loja de varejo, aplicativo de delivery.', 'Estratégia'),
  TermoGlossario('PME', 'Pequena e Média Empresa. No Brasil, classificadas por faturamento anual: pequena até R\$4,8M, média até R\$300M.', 'Estratégia'),
  TermoGlossario('Pipeline Comercial', "Conjunto de oportunidades de venda em andamento. 'Pipeline cheio' significa muitos negócios potenciais sendo negociados.", 'Estratégia'),
  TermoGlossario('Indústria 4.0', 'Quarta revolução industrial. Integração de automação, robótica, IoT e inteligência artificial nos processos industriais para maior eficiência e rastreabilidade.', 'Estratégia'),
  TermoGlossario('Verticalização', 'Estratégia de especializar a empresa em um setor ou nicho específico, ao invés de atender mercados variados. Cria diferencial técnico e relacionamentos mais profundos.', 'Estratégia'),
];
