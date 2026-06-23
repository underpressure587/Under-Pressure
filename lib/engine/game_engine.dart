import 'dart:math';
import 'models.dart';
import 'imprevisto_system.dart';
import '../data/sector_data.dart';
import '../data/tecnologia_rounds.dart';
import '../data/varejo_rounds.dart';
import '../data/logistica_rounds.dart';
import '../data/industria_rounds.dart';

// ═══════════════════════════════════════════════════════
//  GAME ENGINE
//  Orquestra o fluxo completo do jogo solo.
//  Espelha engine.js v5.1 com fixes de bugs aplicados.
// ═══════════════════════════════════════════════════════

class GameEngine {
  static final _impSys = ImprevistoSystem();

  // ── Rounds por setor ─────────────────────────────────
  static List<List<GameRound>> roundsForSector(String sector) {
    switch (sector) {
      case 'tecnologia': return tecnologiaRounds;
      case 'varejo':     return varejoRounds;
      case 'logistica':  return logisticaRounds;
      case 'industria':  return industriaRounds;
      default:           return tecnologiaRounds;
    }
  }

  // ── Inicializar novo jogo ─────────────────────────────
  static GameState iniciar({
    required String sector,
    required String companyName,
    bool timerEnabled = false,
  }) {
    final rng        = Random();
    final allRounds  = roundsForSector(sector);
    final introIndex = rng.nextInt(allRounds.length);
    _impSys.resetar();

    return GameState(
      sector:       sector,
      companyName:  companyName,
      introIndex:   introIndex,
      indicators:   indicadoresBase(sector, introIndex),
      gestor:       Gestor(),
      totalRounds:  15,
      timerEnabled: timerEnabled,
    );
  }

  // ── Rodada atual ──────────────────────────────────────
  static GameRound rodadaAtual(GameState state) {
    final rounds   = roundsForSector(state.sector);
    final historia = rounds[state.introIndex];
    final idx      = state.currentRound.clamp(0, historia.length - 1);
    return historia[idx];
  }

  // ── Sortear imprevisto para a rodada atual ────────────
  // Deve ser chamado ANTES de exibir a rodada ao jogador
  static Imprevisto? sortearImprevisto(GameState state) {
    return _impSys.sortear(
      currentRound: state.currentRound,
      sector:       state.sector,
      gestor:       state.gestor,
    );
  }

  // ── Processar escolha ─────────────────────────────────
  static ChoiceResult processarEscolha(
    GameState state,
    int choiceIndex, {
    Imprevisto? imprevisto,
  }) {
    final round  = rodadaAtual(state);
    final choice = round.choices[choiceIndex];

    // Snapshots antes
    final antes       = Map<String, int>.from(state.indicators);
    final antesGestor = Map<String, int>.from(state.gestor.toMap());

    // Aplicar modifier do imprevisto sobre os efeitos da choice
    var effectsFinais = Map<String, int>.from(choice.effects);
    if (imprevisto?.modifier != null && imprevisto!.modifier!.isNotEmpty) {
      effectsFinais = ImprevistoSystem.aplicarModifier(
          effectsFinais, imprevisto.modifier!);
    }

    // Aplicar na empresa
    state.applyEffects(effectsFinais);

    // Aplicar efeitos do gestor da choice
    if (choice.gestorEffects.isNotEmpty) {
      state.applyGestorEffects(choice.gestorEffects);
    }

    // BUG B FIX (igual ao JS): gestorEffects do imprevisto só na
    // PRIMEIRA rodada ativa (expiresAt - duracao + 1 == currentRound)
    if (imprevisto != null && imprevisto.gestorEffects.isNotEmpty) {
      final firstRound = (imprevisto.expiresAt ?? 0) -
          (imprevisto.duracao - 1);
      if (state.currentRound == firstRound) {
        state.applyGestorEffects(imprevisto.gestorEffects);
      }
    }

    // Calcular deltas reais
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

    // Registrar no histórico
    state.history.add(HistoryEntry(
      round:     state.currentRound + 1,
      titulo:    round.title,
      escolha:   choice.text,
      efeitos:   effectsFinais,
      avaliacao: choice.avaliacao,
    ));

    // Avançar rodada
    state.currentRound++;

    // Verificar game over por gestor (capitalPolitico=0 ou esgotamento>=10)
    final gestorKO = state.gestor.capitalPolitico <= 0 ||
        state.gestor.esgotamento >= 10;

    return ChoiceResult(
      round:        round,
      choice:       choice,
      deltasInd:    deltasInd,
      deltasGestor: deltasGestor,
      gameOver:     state.isGameOver || gestorKO,
      finished:     state.currentRound >= state.totalRounds,
      imprevisto:   imprevisto,
    );
  }

  // ── Resultado final ───────────────────────────────────
  static GameResult resultado(GameState state, String motivo) {
    final sorted = [...state.history]..sort((a, b) {
        final ia = a.efeitos.values.fold(0, (s, v) => s + v.abs());
        final ib = b.efeitos.values.fold(0, (s, v) => s + v.abs());
        return ib.compareTo(ia);
      });
    return GameResult(
      motivo:          motivo,
      scoreEmpresa:    state.scoreEmpresa,
      scoreGestor:     state.scoreGestor,
      indicators:      Map.from(state.indicators),
      gestor:          state.gestor,
      history:         List.from(state.history),
      sector:          state.sector,
      companyName:     state.companyName,
      decisoesCruciais: sorted.take(3).toList(),
    );
  }

  // ── Indicadores em perigo (≤4) ────────────────────────
  static List<String> indicadoresEmPerigo(GameState state) =>
      state.indicators.entries
          .where((e) => e.value <= 4)
          .map((e) => e.key)
          .toList();

  // ── Fase labels ───────────────────────────────────────
  static String faseLabel(int r) {
    if (r < 5)  return 'Diagnóstico';
    if (r < 10) return 'Pressão';
    return 'Decisão Crítica';
  }

  static String faseBadge(int r) {
    if (r < 5)  return '🔍 Diagnóstico';
    if (r < 10) return '⚡ Pressão';
    return '🎯 Decisão Crítica';
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
  final Imprevisto? imprevisto;

  const ChoiceResult({
    required this.round,
    required this.choice,
    required this.deltasInd,
    required this.deltasGestor,
    required this.gameOver,
    required this.finished,
    this.imprevisto,
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
