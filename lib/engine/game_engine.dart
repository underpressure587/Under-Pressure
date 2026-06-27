import 'dart:math';
import 'models.dart';
import 'imprevisto_system.dart';
import '../data/sector_data.dart';
import '../data/tecnologia_rounds.dart';
import '../data/varejo_rounds.dart';
import '../data/logistica_rounds.dart';
import '../data/industria_rounds.dart';

// ═══════════════════════════════════════════════════════
//  GAME ENGINE v2
//  Portado de engine.js v6 com todas as mecânicas:
//  • 10 rodadas sorteadas (3 diagnóstico + 4 pressão + 3 decisão)
//  • Interdependências por setor
//  • Efeitos gestor automáticos
//  • Omissão por timer (capitalPolitico -1, esgotamento +2)
//  • Game over: indicador=0, capitalPolitico=0, esgotamento≥10
//  • Motivos: fim | gameover | omissao_gameover |
//             mandato_conselho | mandato_burnout
//  • Benchmarks de mercado por setor
// ═══════════════════════════════════════════════════════

// ── Benchmarks (igual ao JS) ──────────────────────────
const benchmarks = <String, Map<String, int>>{
  'tecnologia': {'financeiro':11,'clima':11,'satisfacao':12,'qualidade':11,
                 'produtividade':10,'reputacao':10,'inovacao':9,'seguranca':10},
  'varejo':     {'financeiro':11,'rh':10,'clientes':12,'processos':10,
                 'margem':9,'estoque':11,'marca':10,'digital':9},
  'logistica':  {'financeiro':11,'rh':10,'clientes':12,'processos':11,
                 'sla':12,'frota':10,'seguranca':11,'tecnologia':9},
  'industria':  {'financeiro':11,'rh':10,'clientes':11,'processos':11,
                 'seguranca':10,'manutencao':10,'qualidade':12,'conformidade':11},
};

int? benchmarkFor(String sector, String key) =>
    benchmarks[sector]?[key];

class GameEngine {
  static final _impSys = ImprevistoSystem();

  // ── Todos os rounds por setor ─────────────────────────
  static List<List<GameRound>> _allRoundsForSector(String sector) {
    switch (sector) {
      case 'tecnologia': return tecnologiaRounds;
      case 'varejo':     return varejoRounds;
      case 'logistica':  return logisticaRounds;
      case 'industria':  return industriaRounds;
      default:           return tecnologiaRounds;
    }
  }

  // ── Sortear 10 rodadas (3 diag + 4 pressao + 3 decisao) ──
  static List<GameRound> _sortearRodadas(
      List<GameRound> pool, Random rng) {
    List<GameRound> _fase(String fase, int candidatas, int selecionar) {
      final p = pool.where((r) => r.fase == fase).toList()..shuffle(rng);
      return p.take(candidatas).toList()..shuffle(rng);
    }
    final diag   = _fase('diagnostico', 5, 3);
    final press  = _fase('pressao',     5, 4);
    final decis  = _fase('decisao',     5, 3);
    return [...diag, ...press, ...decis];
  }

  // ── Inicializar novo jogo ─────────────────────────────
  static GameState iniciar({
    required String sector,
    required String companyName,
    bool timerEnabled = false,
  }) {
    final rng        = Random();
    final allRounds  = _allRoundsForSector(sector);
    final introIndex = rng.nextInt(allRounds.length);

    // Pool flat de todas as rodadas da história sorteada
    final pool       = allRounds[introIndex];
    final rodadas    = _sortearRodadas(pool, rng);

    _impSys.resetar();

    return GameState(
      sector:       sector,
      companyName:  companyName,
      introIndex:   introIndex,
      indicators:   indicadoresBase(sector, introIndex),
      gestor:       Gestor(),
      gameRounds:   rodadas,
      timerEnabled: timerEnabled,
    );
  }

  // ── Rodada atual ──────────────────────────────────────
  static GameRound rodadaAtual(GameState state) {
    final idx = state.currentRound.clamp(
        0, state.gameRounds.length - 1);
    return state.gameRounds[idx];
  }

  // ── Sortear imprevisto ────────────────────────────────
  static Imprevisto? sortearImprevisto(GameState state) =>
      _impSys.sortear(
        currentRound: state.currentRound,
        sector:       state.sector,
        gestor:       state.gestor,
      );

  // ── Processar escolha ─────────────────────────────────
  static ChoiceResult processarEscolha(
    GameState state,
    int choiceIndex, {
    Imprevisto? imprevisto,
  }) {
    final round  = rodadaAtual(state);
    final choice = round.choices[choiceIndex];

    final antes       = Map<String, int>.from(state.indicators);
    final antesGestor = Map<String, int>.from(state.gestor.toMap());

    // Aplicar modifier do imprevisto
    var effectsFinais = Map<String, int>.from(choice.effects);
    if (imprevisto?.modifier != null &&
        imprevisto!.modifier!.isNotEmpty) {
      effectsFinais = ImprevistoSystem.aplicarModifier(
          effectsFinais, imprevisto.modifier!);
    }

    state.applyEffects(effectsFinais);
    _aplicarInterdependencias(state.sector, state.indicators);
    _clampIndicadores(state.indicators);

    // Efeitos da choice no gestor
    if (choice.gestorEffects.isNotEmpty) {
      state.applyGestorEffects(choice.gestorEffects);
    }

    // Efeitos automáticos do gestor (calculados a partir dos impactos)
    final autoGestor = _calcularEfeitosGestorAutomatico(
        effectsFinais, choice.avaliacao, state);
    state.applyGestorEffects(autoGestor);

    // Efeito gestor do imprevisto (só na 1ª rodada ativa)
    if (imprevisto != null &&
        imprevisto.gestorEffects.isNotEmpty) {
      final firstRound = (imprevisto.expiresAt ?? 0) -
          (imprevisto.duracao - 1);
      if (state.currentRound == firstRound) {
        state.applyGestorEffects(imprevisto.gestorEffects);
      }
    }

    // Deltas
    final deltasInd = <String, int>{};
    for (final k in state.indicators.keys) {
      final d = state.indicators[k]! - (antes[k] ?? 0);
      if (d != 0) deltasInd[k] = d;
    }
    final deltasGestor = <String, int>{};
    for (final k in state.gestor.toMap().keys) {
      final d = state.gestor.toMap()[k]! - (antesGestor[k] ?? 0);
      if (d != 0) deltasGestor[k] = d;
    }

    state.history.add(HistoryEntry(
      round:     state.currentRound + 1,
      titulo:    round.title,
      escolha:   choice.text,
      efeitos:   effectsFinais,
      avaliacao: choice.avaliacao,
    ));

    state.currentRound++;

    final gameOver = _checkGameOver(state);
    final motivo   = gameOver ?? '';

    return ChoiceResult(
      round:        round,
      choice:       choice,
      deltasInd:    deltasInd,
      deltasGestor: deltasGestor,
      gameOver:     gameOver != null,
      finished:     state.currentRound >= state.totalRounds,
      motivo:       motivo,
      imprevisto:   imprevisto,
    );
  }

  // ── Processar omissão (timer expirou) ─────────────────
  static ChoiceResult processarOmissao(GameState state) {
    final round = rodadaAtual(state);

    // Efeitos fixos de omissão: drena os piores indicadores
    final inds = Map<String, int>.from(state.indicators);
    final sorted = inds.entries.toList()
      ..sort((a, b) => a.value.compareTo(b.value));
    final efeitos = <String, int>{};
    for (final e in sorted.take(3)) {
      efeitos[e.key] = -2;
    }

    state.applyEffects(efeitos);
    _aplicarInterdependencias(state.sector, state.indicators);
    _clampIndicadores(state.indicators);

    // Gestor: omissão penaliza capital político e aumenta esgotamento
    state.applyGestorEffects({'capitalPolitico': -1, 'esgotamento': 2});

    state.history.add(HistoryEntry(
      round:     state.currentRound + 1,
      titulo:    round.title,
      escolha:   '(Omissão — tempo esgotado)',
      efeitos:   efeitos,
      avaliacao: Avaliacao.omissao,
    ));

    state.currentRound++;

    final gameOver = _checkGameOver(state);
    final motivo   = gameOver == 'gameover'
        ? 'omissao_gameover'
        : gameOver ?? '';

    return ChoiceResult(
      round:        round,
      choice:       Choice(
        text:        '(Omissão)',
        risco:       'alto',
        effects:     efeitos,
        avaliacao:   Avaliacao.omissao,
        ensinamento: 'A paralisia decisória tem consequências. Decidir mal ainda é melhor que não decidir.',
      ),
      deltasInd:    efeitos,
      deltasGestor: {'capitalPolitico': -1, 'esgotamento': 2},
      gameOver:     gameOver != null,
      finished:     state.currentRound >= state.totalRounds,
      motivo:       motivo,
      isOmissao:    true,
    );
  }

  // ── Verificar fim de jogo ─────────────────────────────
  static String? _checkGameOver(GameState state) {
    if (state.indicators.values.any((v) => v <= 0))
      return 'gameover';
    if (state.gestor.capitalPolitico <= 0)
      return 'mandato_conselho';
    if (state.gestor.esgotamento >= 10)
      return 'mandato_burnout';
    if (state.currentRound >= state.totalRounds)
      return 'fim';
    return null;
  }

  // ── Resultado final ───────────────────────────────────
  static GameResult resultado(GameState state, String motivo) {
    final total = state.totalRounds;

    // Score proporcional — penaliza quem saiu antes do fim
    final fator = motivo.contains('gameover') || motivo.contains('mandato')
        ? state.currentRound / (total == 0 ? 1 : total)
        : 1.0;

    final scoreEmpresa = (state.scoreEmpresa * fator).round()
        .clamp(0, 100);
    final scoreGestor  = (state.scoreGestor  * fator).round()
        .clamp(0, 100);

    final sorted = [...state.history]..sort((a, b) {
        final ia = a.efeitos.values.fold(0, (s, v) => s + v.abs());
        final ib = b.efeitos.values.fold(0, (s, v) => s + v.abs());
        return ib.compareTo(ia);
      });

    return GameResult(
      motivo:           motivo,
      scoreEmpresa:     scoreEmpresa,
      scoreGestor:      scoreGestor,
      indicators:       Map.from(state.indicators),
      gestor:           state.gestor,
      history:          List.from(state.history),
      sector:           state.sector,
      companyName:      state.companyName,
      decisoesCruciais: sorted.take(3).toList(),
    );
  }

  // ── Indicadores em perigo ─────────────────────────────
  static List<String> indicadoresEmPerigo(GameState state) =>
      state.indicators.entries
          .where((e) => e.value <= 4)
          .map((e) => e.key)
          .toList();

  // ── Fase labels ───────────────────────────────────────
  static String faseBadge(GameRound round, int roundNum, int total) {
    final fase = round.fase;
    switch (fase) {
      case 'diagnostico': return 'Rodada $roundNum · Diagnóstico';
      case 'pressao':     return 'Rodada $roundNum · Pressão';
      case 'decisao':     return 'Rodada $roundNum · Decisão Crítica';
      default:            return 'Rodada $roundNum';
    }
  }

  static String faseLabel(String fase) {
    switch (fase) {
      case 'diagnostico': return 'DIAGNÓSTICO';
      case 'pressao':     return 'PRESSÃO';
      case 'decisao':     return 'DECISÃO CRÍTICA';
      default:            return fase.toUpperCase();
    }
  }

  // ══════════════════════════════════════════════════════
  //  INTERDEPENDÊNCIAS POR SETOR
  // ══════════════════════════════════════════════════════

  static void _aplicarInterdependencias(
      String sector, Map<String, int> ind) {
    switch (sector) {
      case 'tecnologia': _interTecnologia(ind); break;
      case 'varejo':     _interVarejo(ind);     break;
      case 'logistica':  _interLogistica(ind);  break;
      case 'industria':  _interIndustria(ind);  break;
    }
  }

  static void _interTecnologia(Map<String, int> ind) {
    // Clima ruim → produtividade cai
    if ((ind['clima'] ?? 0) <= 5 && (ind['produtividade'] ?? 0) > 1)
      ind['produtividade'] = max(0, ind['produtividade']! - 2);
    // Produtividade baixa → qualidade cai
    if ((ind['produtividade'] ?? 0) <= 5 && (ind['qualidade'] ?? 0) > 1)
      ind['qualidade'] = max(0, ind['qualidade']! - 2);
    // Qualidade baixa → satisfação clientes cai
    if ((ind['qualidade'] ?? 0) <= 5 && (ind['satisfacao'] ?? 0) > 1)
      ind['satisfacao'] = max(0, ind['satisfacao']! - 2);
    // Satisfação baixa → financeiro cai
    if ((ind['satisfacao'] ?? 0) <= 5 && (ind['financeiro'] ?? 0) > 1)
      ind['financeiro'] = max(0, ind['financeiro']! - 2);
    // Inovação alta → reputação sobe
    if ((ind['inovacao'] ?? 0) >= 15 && (ind['reputacao'] ?? 0) < 20)
      ind['reputacao'] = min(20, ind['reputacao']! + 1);
    // Segurança crítica → reputação e satisfação colapsam
    if ((ind['seguranca'] ?? 0) <= 4) {
      if ((ind['reputacao']  ?? 0) > 1)
        ind['reputacao']  = max(0, ind['reputacao']!  - 3);
      if ((ind['satisfacao'] ?? 0) > 1)
        ind['satisfacao'] = max(0, ind['satisfacao']! - 2);
    }
  }

  static void _interVarejo(Map<String, int> ind) {
    if ((ind['estoque'] ?? 0) <= 5 && (ind['financeiro'] ?? 0) > 1)
      ind['financeiro'] = max(0, ind['financeiro']! - 1);
    if ((ind['estoque'] ?? 0) <= 4 && (ind['clientes'] ?? 0) > 1)
      ind['clientes'] = max(0, ind['clientes']! - 2);
    if ((ind['margem'] ?? 0) <= 4 && (ind['financeiro'] ?? 0) > 1)
      ind['financeiro'] = max(0, ind['financeiro']! - 2);
    if ((ind['marca'] ?? 0) <= 5 && (ind['digital'] ?? 0) > 1)
      ind['digital'] = max(0, ind['digital']! - 1);
    if ((ind['digital'] ?? 0) <= 4 && (ind['clientes'] ?? 0) > 1)
      ind['clientes'] = max(0, ind['clientes']! - 2);
    if ((ind['marca'] ?? 0) <= 3 && (ind['clientes'] ?? 0) > 1)
      ind['clientes'] = max(0, ind['clientes']! - 2);
    if ((ind['rh'] ?? 0) <= 4 && (ind['clientes'] ?? 0) > 1)
      ind['clientes'] = max(0, ind['clientes']! - 1);
    if ((ind['digital'] ?? 0) >= 15 && (ind['marca'] ?? 0) >= 14 &&
        (ind['clientes'] ?? 0) < 20)
      ind['clientes'] = min(20, ind['clientes']! + 1);
    if ((ind['margem'] ?? 0) >= 16 && (ind['processos'] ?? 0) < 20)
      ind['processos'] = min(20, ind['processos']! + 1);
  }

  static void _interLogistica(Map<String, int> ind) {
    if ((ind['frota'] ?? 0) <= 5 && (ind['seguranca'] ?? 0) > 1)
      ind['seguranca'] = max(0, ind['seguranca']! - 2);
    if ((ind['frota'] ?? 0) <= 4 && (ind['sla'] ?? 0) > 1)
      ind['sla'] = max(0, ind['sla']! - 2);
    if ((ind['seguranca'] ?? 0) <= 4 && (ind['rh'] ?? 0) > 1)
      ind['rh'] = max(0, ind['rh']! - 2);
    if ((ind['seguranca'] ?? 0) <= 3 && (ind['financeiro'] ?? 0) > 1)
      ind['financeiro'] = max(0, ind['financeiro']! - 2);
    if ((ind['tecnologia'] ?? 0) <= 4 && (ind['sla'] ?? 0) > 1)
      ind['sla'] = max(0, ind['sla']! - 2);
    if ((ind['sla'] ?? 0) <= 4 && (ind['clientes'] ?? 0) > 1)
      ind['clientes'] = max(0, ind['clientes']! - 2);
    if ((ind['sla'] ?? 0) <= 3 && (ind['financeiro'] ?? 0) > 1)
      ind['financeiro'] = max(0, ind['financeiro']! - 1);
    if ((ind['tecnologia'] ?? 0) >= 15 && (ind['sla'] ?? 0) < 20)
      ind['sla'] = min(20, ind['sla']! + 1);
    if ((ind['frota'] ?? 0) >= 14 && (ind['tecnologia'] ?? 0) >= 12 &&
        (ind['processos'] ?? 0) < 20)
      ind['processos'] = min(20, ind['processos']! + 1);
  }

  static void _interIndustria(Map<String, int> ind) {
    if ((ind['manutencao'] ?? 0) <= 4 && (ind['seguranca'] ?? 0) > 1)
      ind['seguranca'] = max(0, ind['seguranca']! - 2);
    if ((ind['manutencao'] ?? 0) <= 5 && (ind['qualidade'] ?? 0) > 1)
      ind['qualidade'] = max(0, ind['qualidade']! - 1);
    if ((ind['seguranca'] ?? 0) <= 4 && (ind['rh'] ?? 0) > 1)
      ind['rh'] = max(0, ind['rh']! - 2);
    if ((ind['seguranca'] ?? 0) <= 3 && (ind['financeiro'] ?? 0) > 1)
      ind['financeiro'] = max(0, ind['financeiro']! - 2);
    if ((ind['qualidade'] ?? 0) <= 5 && (ind['conformidade'] ?? 0) > 1)
      ind['conformidade'] = max(0, ind['conformidade']! - 2);
    if ((ind['conformidade'] ?? 0) <= 3 && (ind['clientes'] ?? 0) > 1)
      ind['clientes'] = max(0, ind['clientes']! - 2);
    if ((ind['conformidade'] ?? 0) <= 3 && (ind['financeiro'] ?? 0) > 1)
      ind['financeiro'] = max(0, ind['financeiro']! - 1);
    if ((ind['seguranca'] ?? 0) >= 15 && (ind['qualidade'] ?? 0) >= 14 &&
        (ind['clientes'] ?? 0) < 20)
      ind['clientes'] = min(20, ind['clientes']! + 1);
    if ((ind['manutencao'] ?? 0) >= 14 && (ind['processos'] ?? 0) < 20)
      ind['processos'] = min(20, ind['processos']! + 1);
  }

  // ── Clamp 0-20 ───────────────────────────────────────
  static void _clampIndicadores(Map<String, int> ind) {
    for (final k in ind.keys) {
      ind[k] = ind[k]!.clamp(0, 20);
    }
  }

  // ── Efeitos gestor automáticos ────────────────────────
  static Map<String, int> _calcularEfeitosGestorAutomatico(
      Map<String, int> efeitosEmpresa,
      Avaliacao avaliacao,
      GameState state) {
    final efeitos = {'reputacaoInterna': 0, 'capitalPolitico': 0, 'esgotamento': 0};

    final impactoRH = (efeitosEmpresa['rh']       ?? 0)
                    + (efeitosEmpresa['seguranca'] ?? 0) * 0.5
                    + (efeitosEmpresa['frota']     ?? 0) * 0.3;

    if      (impactoRH <= -5) efeitos['reputacaoInterna'] = -2;
    else if (impactoRH <= -3) efeitos['reputacaoInterna'] = -1;
    else if (impactoRH >=  3) efeitos['reputacaoInterna'] = 1;

    final impactoFin = efeitosEmpresa['financeiro'] ?? 0;
    if      (impactoFin >=  3) efeitos['capitalPolitico'] = 1;
    else if (impactoFin <= -3) efeitos['capitalPolitico'] = -1;

    // Crise aumenta esgotamento
    final mediaInd = state.indicators.values.isEmpty ? 10.0
        : state.indicators.values.reduce((a, b) => a + b) /
          state.indicators.length;
    if (mediaInd <= 7) efeitos['esgotamento'] = 1;
    if (avaliacao == Avaliacao.ruim && mediaInd <= 7)
      efeitos['esgotamento'] = (efeitos['esgotamento'] ?? 0) + 1;

    return efeitos;
  }
}

// ── Resultado de uma escolha ──────────────────────────
class ChoiceResult {
  final GameRound round;
  final Choice choice;
  final Map<String, int> deltasInd;
  final Map<String, int> deltasGestor;
  final bool gameOver;
  final bool finished;
  final String motivo;
  final Imprevisto? imprevisto;
  final bool isOmissao;

  const ChoiceResult({
    required this.round,
    required this.choice,
    required this.deltasInd,
    required this.deltasGestor,
    required this.gameOver,
    required this.finished,
    this.motivo = '',
    this.imprevisto,
    this.isOmissao = false,
  });
}

// ── Resultado final da partida ────────────────────────
class GameResult {
  final String motivo;
  final int scoreEmpresa;
  final int scoreGestor;
  final Map<String, int> indicators;
  final Gestor gestor;
  final List<HistoryEntry> history;
  final String sector;
  final String companyName;
  final List<HistoryEntry> decisoesCruciais;

  const GameResult({
    required this.motivo,
    required this.scoreEmpresa,
    required this.scoreGestor,
    required this.indicators,
    required this.gestor,
    required this.history,
    required this.sector,
    required this.companyName,
    required this.decisoesCruciais,
  });
}
