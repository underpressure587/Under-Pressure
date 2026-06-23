// ═══════════════════════════════════════════════════════
//  UNDER PRESSURE · MODELS
//  Espelha exatamente BetaState + estrutura dos rounds JS
// ═══════════════════════════════════════════════════════

// ── Avaliação de escolha ─────────────────────────────
enum Avaliacao { boa, media, ruim }

Avaliacao avaliacaoFromString(String s) {
  switch (s) {
    case 'boa':   return Avaliacao.boa;
    case 'media': return Avaliacao.media;
    default:      return Avaliacao.ruim;
  }
}

// ── Uma opção de escolha numa rodada ─────────────────
class Choice {
  final String text;
  final String risco;
  final Map<String, int> effects;
  final Map<String, int> gestorEffects;
  final Avaliacao avaliacao;
  final String ensinamento;

  const Choice({
    required this.text,
    required this.risco,
    required this.effects,
    this.gestorEffects = const {},
    required this.avaliacao,
    required this.ensinamento,
  });
}

// ── Uma rodada ────────────────────────────────────────
class GameRound {
  final String title;
  final String description;
  final String fase; // 'diagnostico' | 'pressao' | 'critica'
  final List<Choice> choices;

  const GameRound({
    required this.title,
    required this.description,
    required this.fase,
    required this.choices,
  });
}

// ── Seção de intro ────────────────────────────────────
class IntroSectionData {
  final String icone;
  final String titulo;
  final String corpo;

  const IntroSectionData({
    required this.icone,
    required this.titulo,
    required this.corpo,
  });
}

// ── Intro de uma história ─────────────────────────────
class IntroData {
  final String badge;
  final String subtitulo;
  final List<IntroSectionData> secoes;
  final String alertaIcone;
  final String alertaTitulo;

  const IntroData({
    required this.badge,
    required this.subtitulo,
    required this.secoes,
    required this.alertaIcone,
    required this.alertaTitulo,
  });
}

// ── Empresa (setor) ───────────────────────────────────
class EmpresaData {
  final String id;
  final String icon;
  final String nome;
  final String desc;
  final String dica;
  final List<IntroData> intros;
  final List<List<GameRound>> rounds; // [historiaIndex][roundIndex]

  const EmpresaData({
    required this.id,
    required this.icon,
    required this.nome,
    required this.desc,
    required this.dica,
    required this.intros,
    required this.rounds,
  });
}

// ── Indicadores por setor ─────────────────────────────
class IndicadorMeta {
  final String key;
  final String label;
  final String emoji;

  const IndicadorMeta(this.key, this.label, this.emoji);
}

// ── Gestor ────────────────────────────────────────────
class Gestor {
  int reputacaoInterna;
  int capitalPolitico;
  int esgotamento;

  Gestor({
    this.reputacaoInterna = 5,
    this.capitalPolitico  = 7,
    this.esgotamento      = 0,
  });

  Gestor copyWith({int? rep, int? cap, int? esg}) => Gestor(
    reputacaoInterna: rep ?? reputacaoInterna,
    capitalPolitico:  cap ?? capitalPolitico,
    esgotamento:      esg ?? esgotamento,
  );

  Map<String, int> toMap() => {
    'reputacaoInterna': reputacaoInterna,
    'capitalPolitico':  capitalPolitico,
    'esgotamento':      esgotamento,
  };

  factory Gestor.fromMap(Map<String, dynamic> m) => Gestor(
    reputacaoInterna: (m['reputacaoInterna'] as num?)?.toInt() ?? 5,
    capitalPolitico:  (m['capitalPolitico']  as num?)?.toInt() ?? 7,
    esgotamento:      (m['esgotamento']      as num?)?.toInt() ?? 0,
  );
}

// ── Entrada do histórico de escolhas ─────────────────
class HistoryEntry {
  final int round;
  final String titulo;
  final String escolha;
  final Map<String, int> efeitos;
  final Avaliacao avaliacao;

  const HistoryEntry({
    required this.round,
    required this.titulo,
    required this.escolha,
    required this.efeitos,
    required this.avaliacao,
  });
}

// ── Estado completo do jogo ───────────────────────────
class GameState {
  final String sector;
  final String companyName;
  final int introIndex;

  Map<String, int> indicators;
  Gestor gestor;
  int currentRound;
  final int totalRounds;
  final bool timerEnabled;
  List<HistoryEntry> history;

  GameState({
    required this.sector,
    required this.companyName,
    required this.introIndex,
    required this.indicators,
    required this.gestor,
    this.currentRound  = 0,
    this.totalRounds   = 15,
    this.timerEnabled  = false,
    List<HistoryEntry>? history,
  }) : history = history ?? [];

  // ── Score empresa ─────────────────────────────────
  int get scoreEmpresa {
    if (indicators.isEmpty) return 0;
    final soma = indicators.values.fold(0, (a, b) => a + b);
    final max  = indicators.length * 20;
    return ((soma / max) * 100).round();
  }

  // ── Score gestor ──────────────────────────────────
  int get scoreGestor {
    final bruto = gestor.reputacaoInterna * 5
        + gestor.capitalPolitico * 5
        + (10 - gestor.esgotamento) * 3;
    return (bruto / 1.30).round().clamp(0, 100);
  }

  // ── Fase da rodada ────────────────────────────────
  String get faseAtual {
    if (currentRound < 5)  return 'diagnostico';
    if (currentRound < 10) return 'pressao';
    return 'critica';
  }

  // ── Game over se qualquer indicador zerou ─────────
  bool get isGameOver =>
      indicators.values.any((v) => v <= 0) || gestor.esgotamento >= 10;

  // ── Percentual de progresso ───────────────────────
  double get progresso => currentRound / totalRounds;

  // ── Aplicar efeitos numa cópia dos indicadores ────
  void applyEffects(Map<String, int> effects) {
    for (final e in effects.entries) {
      if (indicators.containsKey(e.key)) {
        indicators[e.key] =
            (indicators[e.key]! + e.value).clamp(0, 20);
      }
    }
  }

  void applyGestorEffects(Map<String, int> effects) {
    for (final e in effects.entries) {
      switch (e.key) {
        case 'reputacaoInterna':
          gestor.reputacaoInterna =
              (gestor.reputacaoInterna + e.value).clamp(0, 10);
        case 'capitalPolitico':
          gestor.capitalPolitico =
              (gestor.capitalPolitico + e.value).clamp(0, 10);
        case 'esgotamento':
          gestor.esgotamento =
              (gestor.esgotamento + e.value).clamp(0, 10);
      }
    }
  }

  Map<String, dynamic> toMap() => {
    'sector':        sector,
    'companyName':   companyName,
    'introIndex':    introIndex,
    'indicators':    indicators,
    'gestor':        gestor.toMap(),
    'currentRound':  currentRound,
    'totalRounds':   totalRounds,
  };

  factory GameState.fromMap(Map<String, dynamic> m,
      Map<String, int> defaultIndicators) =>
      GameState(
        sector:       m['sector'] as String,
        companyName:  m['companyName'] as String,
        introIndex:   (m['introIndex'] as num?)?.toInt() ?? 0,
        indicators:   (m['indicators'] as Map?)
            ?.map((k, v) => MapEntry(k as String, (v as num).toInt()))
            ?? defaultIndicators,
        gestor:       Gestor.fromMap(
            (m['gestor'] as Map?)?.cast<String, dynamic>() ?? {}),
        currentRound: (m['currentRound'] as num?)?.toInt() ?? 0,
        totalRounds:  (m['totalRounds']  as num?)?.toInt() ?? 15,
      );
}
