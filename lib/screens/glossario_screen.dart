import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/app_widgets.dart';

// ═══════════════════════════════════════════════════════
//  GLOSSÁRIO · 64 termos portados do mainBeta.js
// ═══════════════════════════════════════════════════════

class GlossarioScreen extends StatefulWidget {
  const GlossarioScreen({super.key});

  @override
  State<GlossarioScreen> createState() => _GlossarioScreenState();
}

class _GlossarioScreenState extends State<GlossarioScreen> {
  final _search = TextEditingController();
  String _query = '';
  String _categoria = 'Todos';

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<_Termo> get _filtrados {
    var lista = _termos;
    if (_categoria != 'Todos') {
      lista = lista.where((t) => t.cat == _categoria).toList();
    }
    if (_query.isNotEmpty) {
      final q = _query.toLowerCase();
      lista = lista
          .where((t) =>
              t.termo.toLowerCase().contains(q) ||
              t.def.toLowerCase().contains(q))
          .toList();
    }
    return lista;
  }

  static final _categorias = [
    'Todos',
    'Jogo',
    'Finanças',
    'Tecnologia',
    'Operações',
    'RH',
    'Regulatório',
    'Estratégia',
  ];

  @override
  Widget build(BuildContext context) {
    final lista = _filtrados;

    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(children: [
          // ── Header ──────────────────────────────────
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppTheme.line)),
            ),
            child: Row(children: [
              const BackBtn(),
              const SizedBox(width: 10),
              const Text('📚', style: TextStyle(fontSize: 18)),
              const SizedBox(width: 6),
              Text('Glossário',
                  style: AppTheme.syne(
                      size: 16, weight: FontWeight.w700, color: AppTheme.t1)),
              const Spacer(),
              Text('${lista.length} termos',
                  style: AppTheme.inter(size: 11, color: AppTheme.t3)),
            ]),
          ),

          // ── Search ──────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: TextField(
              controller: _search,
              onChanged: (v) => setState(() => _query = v),
              style: AppTheme.inter(size: 14, color: AppTheme.t1),
              decoration: InputDecoration(
                hintText: 'Buscar termo...',
                hintStyle: AppTheme.inter(size: 14, color: AppTheme.t3),
                prefixIcon: const Icon(Icons.search_rounded,
                    size: 18, color: AppTheme.t3),
                suffixIcon: _query.isNotEmpty
                    ? GestureDetector(
                        onTap: () {
                          _search.clear();
                          setState(() => _query = '');
                        },
                        child: const Icon(Icons.close_rounded,
                            size: 16, color: AppTheme.t3),
                      )
                    : null,
                filled: true,
                fillColor: AppTheme.bg2,
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 10),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppTheme.line2)),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppTheme.line2)),
                focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                        color: AppTheme.primary, width: 1.5)),
              ),
            ),
          ),

          // ── Categorias ───────────────────────────────
          SizedBox(
            height: 40,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              itemCount: _categorias.length,
              separatorBuilder: (_, __) => const SizedBox(width: 6),
              itemBuilder: (_, i) {
                final cat    = _categorias[i];
                final active = _categoria == cat;
                return GestureDetector(
                  onTap: () => setState(() => _categoria = cat),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 2),
                    decoration: BoxDecoration(
                      color: active ? AppTheme.primary : AppTheme.bg3,
                      borderRadius: BorderRadius.circular(99),
                      border: Border.all(
                          color: active
                              ? AppTheme.primary
                              : AppTheme.line2),
                    ),
                    child: Text(cat,
                        style: AppTheme.inter(
                          size: 11,
                          weight: FontWeight.w600,
                          color: active ? Colors.black : AppTheme.t2,
                        )),
                  ),
                );
              },
            ),
          ),

          const Divider(color: AppTheme.line, height: 1),

          // ── Lista ────────────────────────────────────
          Expanded(
            child: lista.isEmpty
                ? Center(
                    child: Text('Nenhum termo encontrado.',
                        style: AppTheme.inter(color: AppTheme.t3)))
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: lista.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: 8),
                    itemBuilder: (_, i) =>
                        _TermoCard(termo: lista[i], query: _query),
                  ),
          ),
        ]),
      ),
    );
  }
}

// ── Termo card ────────────────────────────────────────
class _TermoCard extends StatefulWidget {
  final _Termo termo;
  final String query;

  const _TermoCard({required this.termo, required this.query});

  @override
  State<_TermoCard> createState() => _TermoCardState();
}

class _TermoCardState extends State<_TermoCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _expanded = !_expanded),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: _expanded ? AppTheme.primaryBg : AppTheme.bg2,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: _expanded ? AppTheme.primaryBd : AppTheme.line2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              // Categoria badge
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: _catColor(widget.termo.cat).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Text(widget.termo.cat,
                    style: AppTheme.inter(
                        size: 9,
                        weight: FontWeight.w600,
                        color: _catColor(widget.termo.cat))),
              ),
              const Spacer(),
              Icon(
                _expanded
                    ? Icons.keyboard_arrow_up_rounded
                    : Icons.keyboard_arrow_down_rounded,
                size: 18,
                color: AppTheme.t3,
              ),
            ]),
            const SizedBox(height: 6),
            _HighlightText(
              text: widget.termo.termo,
              query: widget.query,
              style: AppTheme.syne(
                  size: 14, weight: FontWeight.w700, color: AppTheme.t1),
            ),
            if (_expanded) ...[
              const SizedBox(height: 8),
              const Divider(color: AppTheme.line2, height: 1),
              const SizedBox(height: 8),
              _HighlightText(
                text: widget.termo.def,
                query: widget.query,
                style: AppTheme.inter(
                    size: 13, color: AppTheme.t2, height: 1.6),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _catColor(String cat) {
    switch (cat) {
      case 'Jogo':       return AppTheme.primary;
      case 'Finanças':   return AppTheme.ok;
      case 'Tecnologia': return const Color(0xFF5B8DEF);
      case 'Operações':  return const Color(0xFF1FB885);
      case 'RH':         return AppTheme.pur;
      case 'Regulatório':return AppTheme.warn;
      case 'Estratégia': return const Color(0xFFE8711A);
      default:           return AppTheme.t3;
    }
  }
}

// ── Highlight text ─────────────────────────────────────
class _HighlightText extends StatelessWidget {
  final String text;
  final String query;
  final TextStyle style;

  const _HighlightText(
      {required this.text, required this.query, required this.style});

  @override
  Widget build(BuildContext context) {
    if (query.isEmpty) {
      return Text(text, style: style);
    }

    final lower = text.toLowerCase();
    final q     = query.toLowerCase();
    final spans = <TextSpan>[];
    int start   = 0;

    while (true) {
      final idx = lower.indexOf(q, start);
      if (idx == -1) {
        spans.add(TextSpan(text: text.substring(start)));
        break;
      }
      if (idx > start) {
        spans.add(TextSpan(text: text.substring(start, idx)));
      }
      spans.add(TextSpan(
        text: text.substring(idx, idx + q.length),
        style: style.copyWith(
          backgroundColor: AppTheme.primary.withOpacity(0.3),
          color: AppTheme.t1,
        ),
      ));
      start = idx + q.length;
    }

    return RichText(
        text: TextSpan(style: style, children: spans));
  }
}

// ── Data ──────────────────────────────────────────────
class _Termo {
  final String termo;
  final String def;
  final String cat;
  const _Termo(this.termo, this.def, this.cat);
}

const _termos = <_Termo>[
  // ── Jogo ─────────────────────────────────────────
  _Termo('SLA', 'Acordo de Nível de Serviço (Service Level Agreement). Define metas de prazo e qualidade entre fornecedor e cliente. Ex: entregar 95% dos pedidos em até 48h.', 'Jogo'),
  _Termo('NPS', "Nota de lealdade dos clientes (Net Promoter Score). Calculado pela pergunta: 'De 0 a 10, quanto você recomendaria esta empresa?' Acima de 70 é excelente.", 'Jogo'),
  _Termo('Benchmark', 'Referência média do mercado para um indicador. Exibido abaixo das barras durante o jogo — serve para comparar seu desempenho com o do setor.', 'Jogo'),
  _Termo('Capital Político', 'Credibilidade do gestor junto ao conselho e parceiros estratégicos. Cai com decisões precipitadas ou resultados ruins. Sobe com alinhamento e entregas consistentes.', 'Jogo'),
  _Termo('Esgotamento', 'Nível de desgaste pessoal do gestor. Ao atingir 10, é necessário se afastar por colapso e o mandato é encerrado antecipadamente.', 'Jogo'),
  _Termo('Flag', 'Padrão de comportamento registrado ao longo do mandato. Influencia quais eventos aparecem e o desfecho final. Ex: Liderança Tóxica, Crescimento sem Caixa.', 'Jogo'),
  _Termo('Imprevisto', 'Evento inesperado que altera os efeitos das decisões durante aquela rodada. Pode ser positivo ou negativo, e é influenciado pelo estado atual dos indicadores.', 'Jogo'),
  _Termo('Margem Operacional', 'Quanto de cada real de receita sobra como lucro operacional. Ex: margem de 8% significa que a empresa lucra R\$8 para cada R\$100 vendidos.', 'Jogo'),
  _Termo('Mandato', 'Uma partida completa do jogo, com 15 rodadas de decisões organizadas em três fases (Diagnóstico, Pressão e Decisão Crítica). O gestor conduz a empresa do início ao fim e recebe uma pontuação pelo resultado.', 'Jogo'),
  _Termo('Interdependência', 'Relação causal entre indicadores. Ex: na logística, frota deteriorada → segurança cai → RH cai → resultado financeiro cai.', 'Jogo'),

  // ── Finanças ──────────────────────────────────────
  _Termo('ARR', 'Receita Recorrente Anual (Annual Recurring Revenue). Total de contratos ativos que a empresa recebe por ano. Principal métrica de saúde de empresas SaaS.', 'Finanças'),
  _Termo('Churn', 'Taxa de cancelamento de clientes. Churn de 3,8% ao mês significa que 3,8% da base cancela todo mês — o que elimina metade da base em menos de 2 anos.', 'Finanças'),
  _Termo('CAC', 'Custo de Aquisição de Cliente. Quanto a empresa gasta em marketing e vendas para conquistar um novo cliente. Quanto menor, melhor.', 'Finanças'),
  _Termo('Runway', "Tempo que a empresa sobrevive com o caixa atual, sem nova receita. Ex: 'temos 8 meses de runway' significa que o dinheiro acaba em 8 meses.", 'Finanças'),
  _Termo('Break-even', 'Ponto de equilíbrio: quando receitas e custos se igualam. A empresa deixa de ter prejuízo e começa a lucrar a partir desse ponto.', 'Finanças'),
  _Termo('Capex', 'Investimento em bens de capital fixo (Capital Expenditure). Ex: comprar máquinas, construir um galpão, instalar painéis solares. Diferente de custo operacional.', 'Finanças'),
  _Termo('Hedge Cambial', 'Instrumento financeiro que trava o custo do dólar, protegendo empresas que têm custos em moeda estrangeira mas receita em reais.', 'Finanças'),
  _Termo('Payback', 'Prazo em que um investimento se paga com a economia ou receita gerada. Ex: painéis solares com payback de 4,5 anos se pagam em 4 anos e 6 meses.', 'Finanças'),
  _Termo('IPO', 'Abertura de capital na bolsa de valores (Initial Public Offering). A empresa vende ações ao público para captar dinheiro e cresce com capital dos investidores.', 'Finanças'),
  _Termo('M&A', 'Fusões e Aquisições (Mergers & Acquisitions). Processo de compra, fusão ou incorporação de uma empresa por outra.', 'Finanças'),
  _Termo('Due Diligence', 'Análise detalhada feita antes de uma aquisição ou investimento. Verifica riscos financeiros, jurídicos, trabalhistas e operacionais da empresa-alvo.', 'Finanças'),
  _Termo('Série A / Série B', 'Rodadas de investimento numeradas. Série A é a primeira rodada significativa (geralmente R\$5M a R\$30M). Série B é a seguinte, para escalar o que foi validado.', 'Finanças'),
  _Termo('Angel (Investidor-Anjo)', 'Pessoa física que investe capital próprio em startups em estágio inicial, geralmente em troca de uma participação pequena na empresa.', 'Finanças'),
  _Termo('Venture Capital', 'Fundo de capital de risco que investe em startups com alto potencial de crescimento. Em troca, recebe participação societária.', 'Finanças'),
  _Termo('Private Equity', 'Fundo que investe em empresas maiores e mais maduras (não startups), buscando eficiência operacional e retorno na venda futura.', 'Finanças'),
  _Termo('Stock Options', 'Opção de compra de ações da empresa por um preço fixo. Benefício que alinha o interesse do colaborador com o crescimento da empresa a longo prazo.', 'Finanças'),
  _Termo('Switching Cost', 'Custo que o cliente teria ao trocar de fornecedor — tempo de integração, retreinamento, risco de falha. Quanto maior, mais difícil é perder o cliente.', 'Finanças'),

  // ── Tecnologia ────────────────────────────────────
  _Termo('SaaS', 'Software como Serviço (Software as a Service). Modelo em que o software é cobrado mensalmente por assinatura, sem instalação local. Ex: Google Drive, Salesforce.', 'Tecnologia'),
  _Termo('Dívida Técnica', 'Atalhos no código que aceleram a entrega hoje, mas criam problemas no futuro. Quanto maior a dívida, mais lento e instável o sistema fica com o tempo.', 'Tecnologia'),
  _Termo('Pivot', 'Mudança radical de direção estratégica ou de modelo de negócio. Ex: uma startup de SaaS que decide virar plataforma de IA generativa.', 'Tecnologia'),
  _Termo('Product-Market Fit', 'Encaixe produto-mercado. O momento em que o produto resolve tão bem um problema real que os clientes o recomendam naturalmente e o churn cai.', 'Tecnologia'),
  _Termo('Roadmap', 'Plano de funcionalidades e melhorias do produto ordenado no tempo. Define o que será desenvolvido e em que sequência.', 'Tecnologia'),
  _Termo('ERP', 'Sistema integrado de gestão empresarial (Enterprise Resource Planning). Centraliza finanças, estoque, RH e produção em um único sistema.', 'Tecnologia'),
  _Termo('IoT', 'Internet das Coisas (Internet of Things). Sensores e equipamentos conectados à internet que enviam dados em tempo real. Ex: sensor de temperatura em câmara fria.', 'Tecnologia'),
  _Termo('DPO', 'Encarregado de Proteção de Dados (Data Protection Officer). Profissional responsável pela conformidade com a LGPD. Nomeação obrigatória para empresas que tratam dados pessoais em escala.', 'Tecnologia'),
  _Termo('TMS', 'Sistema de Gerenciamento de Transporte (Transportation Management System). Controla rotas, rastreamento e custos de frota em operações logísticas.', 'Tecnologia'),
  _Termo('Injeção SQL', 'Tipo de ataque hacker que insere comandos maliciosos em campos de texto para acessar o banco de dados e roubar informações.', 'Tecnologia'),

  // ── Operações ─────────────────────────────────────
  _Termo('Lead Time', 'Tempo total desde o pedido até a entrega ao cliente. Reduzir o lead time é um dos principais objetivos da gestão de operações.', 'Operações'),
  _Termo('Kanban', 'Sistema de produção puxada. Produz apenas o que foi vendido ou consumido, reduzindo estoque intermediário e tempo de entrega.', 'Operações'),
  _Termo('Lean Manufacturing', 'Manufatura enxuta. Filosofia que elimina desperdícios no processo produtivo — tempo ocioso, estoque excessivo, defeitos, movimentação desnecessária.', 'Operações'),
  _Termo('Cold Chain', 'Cadeia do frio. Transporte e armazenagem de produtos que precisam de temperatura controlada, como alimentos perecíveis e medicamentos.', 'Operações'),
  _Termo('White Label', 'Produto fabricado por uma empresa e vendido por outra com a sua própria marca. Ex: supermercado que vende arroz com a marca própria fabricado por terceiro.', 'Operações'),
  _Termo('Dark Store', 'Loja física convertida em mini-centro de distribuição para e-commerce, sem atendimento presencial. Foco em separação e envio rápido de pedidos.', 'Operações'),
  _Termo('Click-and-Collect', 'Modelo onde o cliente compra online e retira na loja física. Elimina o custo de frete e gera tráfego para o ponto físico.', 'Operações'),
  _Termo('SKU', 'Código único de produto (Stock Keeping Unit). Cada variação de produto (tamanho, cor, sabor) tem um SKU diferente para controle de estoque.', 'Operações'),
  _Termo('Omnichannel', 'Estratégia que integra todos os canais de venda e atendimento (loja física, site, app, telefone) em uma experiência única para o cliente.', 'Operações'),

  // ── RH ────────────────────────────────────────────
  _Termo('Burnout', 'Síndrome de esgotamento profissional causada por estresse crônico no trabalho. Pode levar ao afastamento. No jogo, representa colapso do gestor.', 'RH'),
  _Termo('Onboarding', 'Processo de integração de um novo colaborador ou cliente. Inclui treinamentos, apresentações e adaptação à cultura e ferramentas da empresa.', 'RH'),
  _Termo('Rotatividade (Turnover)', 'Percentual de funcionários que saem e precisam ser substituídos no ano. Alta rotatividade sinaliza problemas de gestão, cultura ou remuneração.', 'RH'),

  // ── Regulatório ───────────────────────────────────
  _Termo('LGPD', 'Lei Geral de Proteção de Dados. Regula o uso de dados pessoais no Brasil. Multas podem chegar a 2% do faturamento ou R\$50 milhões por infração.', 'Regulatório'),
  _Termo('ANPD', 'Autoridade Nacional de Proteção de Dados. Órgão do governo que fiscaliza o cumprimento da LGPD e aplica penalidades em caso de violação.', 'Regulatório'),
  _Termo('ISO 9001', 'Norma internacional de gestão da qualidade. Certifica que a empresa tem processos controlados e rastreáveis. Exigida por grandes clientes industriais.', 'Regulatório'),
  _Termo('ESG', 'Critérios ambientais, sociais e de governança (Environmental, Social, Governance). Avaliados por investidores e clientes para decidir com quem fazer negócio.', 'Regulatório'),
  _Termo('IFA', 'Índice de Frequência de Acidentes. Mede o número de acidentes com afastamento por milhão de horas trabalhadas. Benchmark nacional: 8,2.', 'Regulatório'),
  _Termo('EPI', 'Equipamento de Proteção Individual. Capacete, luva, óculos, bota e outros itens obrigatórios por lei para proteção do trabalhador.', 'Regulatório'),
  _Termo('CIPA', 'Comissão Interna de Prevenção de Acidentes. Grupo de funcionários e gestores que acompanha as condições de segurança. Obrigatória em empresas com 20+ funcionários.', 'Regulatório'),
  _Termo('CAT', 'Comunicação de Acidente de Trabalho. Documento obrigatório emitido pelo empregador quando um funcionário sofre acidente ou doença ocupacional.', 'Regulatório'),
  _Termo('MTE', 'Ministério do Trabalho e Emprego. Órgão federal que fiscaliza as condições de trabalho, pode autuar empresas e interditar operações inseguras.', 'Regulatório'),

  // ── Estratégia ────────────────────────────────────
  _Termo('B2B', 'Business to Business. Empresa que vende para outras empresas (não para o consumidor final). Ex: software de gestão vendido para PMEs.', 'Estratégia'),
  _Termo('B2C', 'Business to Consumer. Empresa que vende diretamente ao consumidor final. Ex: loja de varejo, aplicativo de delivery.', 'Estratégia'),
  _Termo('PME', 'Pequena e Média Empresa. No Brasil, classificadas por faturamento anual: pequena até R\$4,8M, média até R\$300M.', 'Estratégia'),
  _Termo('Pipeline Comercial', "Conjunto de oportunidades de venda em andamento. 'Pipeline cheio' significa muitos negócios potenciais sendo negociados.", 'Estratégia'),
  _Termo('Indústria 4.0', 'Quarta revolução industrial. Integração de automação, robótica, IoT e inteligência artificial nos processos industriais para maior eficiência e rastreabilidade.', 'Estratégia'),
  _Termo('Verticalização', 'Estratégia de especializar a empresa em um setor ou nicho específico, ao invés de atender mercados variados. Cria diferencial técnico e relacionamentos mais profundos.', 'Estratégia'),
];
