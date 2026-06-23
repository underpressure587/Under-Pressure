import 'dart:math';
import 'models.dart';

// ═══════════════════════════════════════════════════════
//  IMPREVISTO SYSTEM
//  Portado de systems/imprevisto.js v5.0
//  Pool de 8 eventos com modifiers por setor e pesos
// ═══════════════════════════════════════════════════════

class Imprevisto {
  final String id;
  final String titulo;
  final String descricao;
  final Map<String, Map<String, double>> modifierPorSetor;
  final Map<String, int> gestorEffects;
  final int duracao;

  // Campos resolvidos ao sortear
  final Map<String, double>? modifier;
  final int? expiresAt;

  const Imprevisto({
    required this.id,
    required this.titulo,
    required this.descricao,
    required this.modifierPorSetor,
    required this.gestorEffects,
    required this.duracao,
    this.modifier,
    this.expiresAt,
  });

  Imprevisto resolvido(String sector, int currentRound) {
    final mod = modifierPorSetor[sector] ??
        modifierPorSetor['default'] ?? {};
    return Imprevisto(
      id: id, titulo: titulo, descricao: descricao,
      modifierPorSetor: modifierPorSetor,
      gestorEffects: gestorEffects, duracao: duracao,
      modifier: mod,
      expiresAt: currentRound + duracao - 1,
    );
  }
}

class ImprevistoSystem {
  static const _multCap = 2.0;
  final _usedIds = <String>{};

  // ── Pool ─────────────────────────────────────────────
  static final _pool = <Imprevisto>[
    Imprevisto(
      id: 'greve', titulo: '⚠️ Risco de Greve',
      descricao: 'A equipe está agitada. Decisões que prejudiquem RH têm impacto dobrado.',
      modifierPorSetor: {
        'tecnologia': {'clima': 2.0},
        'varejo':     {'rh': 2.0},
        'logistica':  {'rh': 2.0},
        'industria':  {'rh': 2.0},
      },
      gestorEffects: {'capitalPolitico': -1, 'esgotamento': 1},
      duracao: 2,
    ),
    Imprevisto(
      id: 'crise_cambial', titulo: '💱 Crise Cambial',
      descricao: 'Oscilação do câmbio amplifica os efeitos financeiros.',
      modifierPorSetor: {'default': {'financeiro': 1.5}},
      gestorEffects: {'esgotamento': 1},
      duracao: 2,
    ),
    Imprevisto(
      id: 'viral_positivo', titulo: '📣 Campanha Viral',
      descricao: 'A empresa ganhou atenção positiva. Ganhos com clientes são maiores.',
      modifierPorSetor: {
        'tecnologia': {'satisfacao': 1.5},
        'varejo':     {'clientes': 1.5, 'marca': 1.5},
        'logistica':  {'clientes': 1.5},
        'industria':  {'clientes': 1.5},
      },
      gestorEffects: {'capitalPolitico': 1},
      duracao: 1,
    ),
    Imprevisto(
      id: 'auditoria', titulo: '🔍 Auditoria Surpresa',
      descricao: 'Auditores na casa. Decisões que impactam processos têm efeito amplificado.',
      modifierPorSetor: {
        'tecnologia': {'processos': 2.0, 'qualidade': 2.0, 'seguranca': 1.5},
        'varejo':     {'processos': 2.0},
        'logistica':  {'processos': 2.0, 'seguranca': 1.5},
        'industria':  {'processos': 2.0, 'qualidade': 2.0, 'conformidade': 2.0},
      },
      gestorEffects: {'capitalPolitico': -1, 'esgotamento': 1},
      duracao: 2,
    ),
    Imprevisto(
      id: 'investidor', titulo: '💼 Visita de Investidor',
      descricao: 'Investidor presente. Ganhos financeiros são maiores, perdas também.',
      modifierPorSetor: {'default': {'financeiro': 2.0}},
      gestorEffects: {'capitalPolitico': 2},
      duracao: 1,
    ),
    Imprevisto(
      id: 'rotatividade', titulo: '🚪 Alta Rotatividade',
      descricao: 'Muitas saídas simultâneas. O indicador de pessoas está hipersensível.',
      modifierPorSetor: {
        'tecnologia': {'clima': 2.0},
        'varejo':     {'rh': 2.0},
        'logistica':  {'rh': 2.0},
        'industria':  {'rh': 2.0},
      },
      gestorEffects: {'reputacaoInterna': -1, 'esgotamento': 1},
      duracao: 2,
    ),
    Imprevisto(
      id: 'acidente_operacional', titulo: '🚨 Incidente Operacional',
      descricao: 'Ocorrência inesperada na operação. Decisões de segurança têm impacto dobrado.',
      modifierPorSetor: {
        'tecnologia': {'seguranca': 2.0, 'qualidade': 1.5},
        'varejo':     {'processos': 2.0, 'rh': 1.5},
        'logistica':  {'seguranca': 2.0, 'frota': 1.5},
        'industria':  {'seguranca': 2.0, 'manutencao': 1.5},
      },
      gestorEffects: {'capitalPolitico': -1, 'esgotamento': 1},
      duracao: 2,
    ),
    Imprevisto(
      id: 'reconhecimento_setor', titulo: '🏅 Reconhecimento do Setor',
      descricao: 'A empresa foi citada positivamente pela mídia especializada.',
      modifierPorSetor: {
        'tecnologia': {'reputacao': 1.5, 'satisfacao': 1.2},
        'varejo':     {'marca': 1.5, 'clientes': 1.2},
        'logistica':  {'clientes': 1.5, 'sla': 1.2},
        'industria':  {'clientes': 1.5, 'qualidade': 1.2},
      },
      gestorEffects: {'capitalPolitico': 1, 'reputacaoInterna': 1},
      duracao: 1,
    ),
  ];

  // ── Sortear ───────────────────────────────────────────
  Imprevisto? sortear({
    required int currentRound,
    required String sector,
    required Gestor gestor,
    List<String> flags = const [],
  }) {
    final rng  = Random();
    final prob = (0.15 + currentRound * 0.01).clamp(0.0, 0.40);
    if (rng.nextDouble() > prob) return null;

    var disponiveis = _pool.where((e) => !_usedIds.contains(e.id)).toList();
    if (disponiveis.isEmpty) {
      _usedIds.clear();
      disponiveis = List.from(_pool);
    }

    // Pesos
    final ponderado = <({Imprevisto ev, double peso})>[];
    for (final ev in disponiveis) {
      double peso = 1.0;
      if (flags.contains('lideranca_toxica')      && ev.id == 'rotatividade')          peso = 4;
      if (flags.contains('rh_negligenciado')       && ev.id == 'greve')                 peso = 3;
      if (flags.contains('ignorou_seguranca')      && ev.id == 'auditoria')             peso = 4;
      if (flags.contains('ignorou_seguranca')      && ev.id == 'acidente_operacional')  peso = 3;
      if (flags.contains('crescimento_sem_caixa')  && ev.id == 'investidor')            peso = 0.2;
      if (flags.contains('crescimento_saudavel')   && ev.id == 'investidor')            peso = 3;
      if (flags.contains('investiu_em_inovacao')   && ev.id == 'viral_positivo')        peso = 3;
      if (gestor.esgotamento >= 7 && ev.id == 'greve')    peso *= 1.5;
      if (gestor.capitalPolitico <= 3 && ev.id == 'auditoria') peso *= 2;
      if (peso > 0) ponderado.add((ev: ev, peso: peso));
    }

    if (ponderado.isEmpty) return null;

    final totalPeso = ponderado.fold(0.0, (a, b) => a + b.peso);
    var rand = rng.nextDouble() * totalPeso;
    Imprevisto escolhido = ponderado.last.ev;
    for (final item in ponderado) {
      rand -= item.peso;
      if (rand <= 0) { escolhido = item.ev; break; }
    }

    _usedIds.add(escolhido.id);
    return escolhido.resolvido(sector, currentRound);
  }

  void resetar() => _usedIds.clear();

  // ── Aplicar modifier do imprevisto nos efeitos ────────
  // Chamado pelo engine ao processar uma escolha com evento ativo
  static Map<String, int> aplicarModifier(
      Map<String, int> effects, Map<String, double> modifier) {
    final result = <String, int>{};
    for (final e in effects.entries) {
      final mult = (modifier[e.key] ?? 1.0).clamp(0.0, _multCap);
      result[e.key] = (e.value * mult).round();
    }
    return result;
  }

  // ── Label dos indicadores amplificados ────────────────
  static String descricaoIndicadores(Imprevisto ev, String sector) {
    final mod = ev.modifier ?? {};
    if (mod.isEmpty) return '';
    return mod.entries
        .map((e) => '${e.key} ×${e.value.toStringAsFixed(1)}')
        .join(' · ');
  }

  // ── Label dos efeitos no gestor ───────────────────────
  static String descricaoGestor(Imprevisto ev) {
    if (ev.gestorEffects.isEmpty) return '';
    final labels = {
      'reputacaoInterna': 'Rep.',
      'capitalPolitico':  'Cap. Pol.',
      'esgotamento':      'Esgot.',
    };
    return ev.gestorEffects.entries
        .map((e) {
          final sign = e.value > 0 ? '+' : '';
          return '${labels[e.key] ?? e.key} $sign${e.value}';
        })
        .join(' · ');
  }
}
