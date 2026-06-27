import 'package:flutter/material.dart';
import '../engine/models.dart';
import '../engine/game_engine.dart';
import '../engine/imprevisto_system.dart';
import '../data/sector_data.dart';
import '../theme/app_theme.dart';
import '../widgets/app_widgets.dart';
import 'game_screen.dart';
import 'result_screen.dart';

class FeedbackScreen extends StatelessWidget {
  final GameState state;
  final ChoiceResult result;

  const FeedbackScreen(
      {super.key, required this.state, required this.result});

  Color get _avaliacaoColor {
    switch (result.choice.avaliacao) {
      case Avaliacao.boa:     return AppTheme.ok;
      case Avaliacao.media:   return AppTheme.warn;
      case Avaliacao.omissao: return AppTheme.err;
      case Avaliacao.ruim:    return AppTheme.err;
    }
  }

  String get _avaliacaoLabel {
    switch (result.choice.avaliacao) {
      case Avaliacao.boa:     return '✅ Boa decisão';
      case Avaliacao.media:   return '⚠️ Decisão razoável';
      case Avaliacao.omissao: return '⏱️ Tempo esgotado — Omissão';
      case Avaliacao.ruim:    return '❌ Decisão arriscada';
    }
  }

  String get _avaliacaoIcon {
    switch (result.choice.avaliacao) {
      case Avaliacao.boa:     return '💡';
      case Avaliacao.media:   return '📌';
      case Avaliacao.omissao: return '⏱️';
      case Avaliacao.ruim:    return '⚠️';
    }
  }

  void _continuar(BuildContext context) {
    if (result.finished || result.gameOver) {
      final motivo = result.motivo.isNotEmpty ? result.motivo : 'fim';
      final gameResult = GameEngine.resultado(state, motivo);
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 350),
          pageBuilder: (_, __, ___) =>
              ResultScreen(result: gameResult, state: state),
          transitionsBuilder: (_, anim, __, child) =>
              FadeTransition(opacity: anim, child: child),
        ),
      );
    } else {
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 250),
          pageBuilder: (_, __, ___) =>
              GameScreen(state: state),
          transitionsBuilder: (_, anim, __, child) =>
              FadeTransition(opacity: anim, child: child),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final meta   = indicadoresMeta(state.sector);
    final hasInd = result.deltasInd.isNotEmpty;
    final hasGst = result.deltasGestor.isNotEmpty;
    final isEnd  = result.finished || result.gameOver;

    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ──────────────────────────────────
            _FeedbackHeader(
              avaliacao: result.choice.avaliacao,
              avaliacaoLabel: _avaliacaoLabel,
              avaliacaoColor: _avaliacaoColor,
              roundNum: state.currentRound,
              totalRounds: state.totalRounds,
            ),

            // ── Body ─────────────────────────────────────
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Decisão tomada
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.bg2,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.line2),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.format_quote_rounded,
                              color: AppTheme.t3, size: 16),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(result.choice.text,
                                style: AppTheme.inter(
                                    size: 13,
                                    color: AppTheme.t2,
                                    height: 1.5)),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Efeitos nos indicadores
                    if (hasInd) ...[
                      Text('Impacto nos Indicadores',
                          style: AppTheme.inter(
                              size: 11,
                              color: AppTheme.t3,
                              weight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: result.deltasInd.entries.map((e) {
                          final m = meta.firstWhere(
                              (m) => m.key == e.key,
                              orElse: () => IndicadorMeta(
                                  e.key, e.key, '📊'));
                          final pos = e.value > 0;
                          return _DeltaChip(
                            emoji: m.emoji,
                            label: m.label,
                            delta: e.value,
                            positive: pos,
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 14),
                    ],

                    // Efeitos no gestor
                    if (hasGst) ...[
                      Text('Impacto no Gestor',
                          style: AppTheme.inter(
                              size: 11,
                              color: AppTheme.t3,
                              weight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children:
                            result.deltasGestor.entries.map((e) {
                          final labels = {
                            'reputacaoInterna': ('⭐', 'Reputação'),
                            'capitalPolitico':  ('🏛️', 'Capital Pol.'),
                            'esgotamento':      ('😓', 'Esgotamento'),
                          };
                          final info = labels[e.key] ??
                              ('📊', e.key);
                          // esgotamento: positivo é ruim
                          final isGood = e.key == 'esgotamento'
                              ? e.value < 0
                              : e.value > 0;
                          return _DeltaChip(
                            emoji: info.$1,
                            label: info.$2,
                            delta: e.value,
                            positive: isGood,
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 14),
                    ],

                    // Ensinamento
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: _avaliacaoColor.withOpacity(0.06),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                            color: _avaliacaoColor.withOpacity(0.25)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(_avaliacaoIcon,
                                  style:
                                      const TextStyle(fontSize: 16)),
                              const SizedBox(width: 6),
                              Text('Ensinamento',
                                  style: AppTheme.syne(
                                      size: 12,
                                      weight: FontWeight.w700,
                                      color: _avaliacaoColor)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(result.choice.ensinamento,
                              style: AppTheme.inter(
                                  size: 13,
                                  color: AppTheme.t2,
                                  height: 1.65)),
                        ],
                      ),
                    ),

                    // Imprevisto que estava ativo
                    if (result.imprevisto != null) ...[
                      const SizedBox(height: 14),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.warn.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: AppTheme.warn.withOpacity(0.25)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.flash_on_rounded,
                                size: 14, color: AppTheme.warn),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'Imprevisto: ${result.imprevisto!.titulo}',
                                style: AppTheme.inter(
                                    size: 12, color: AppTheme.warn),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // Game over warning
                    if (result.gameOver) ...[
                      const SizedBox(height: 14),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppTheme.err.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color: AppTheme.err.withOpacity(0.3)),
                        ),
                        child: Text(
                          '🚨 Um ou mais indicadores chegaram a zero. O mandato foi encerrado.',
                          style: AppTheme.inter(
                              size: 13, color: AppTheme.err, height: 1.4),
                        ),
                      ),
                    ],

                    const SizedBox(height: 8),
                  ],
                ),
              ),
            ),

            // ── Footer CTA ────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: PrimaryButton(
                label: isEnd
                    ? '📊  Ver Resultado Final'
                    : 'Próxima decisão  →',
                onTap: () => _continuar(context),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Header ────────────────────────────────────────────
class _FeedbackHeader extends StatelessWidget {
  final Avaliacao avaliacao;
  final String avaliacaoLabel;
  final Color avaliacaoColor;
  final int roundNum;
  final int totalRounds;

  const _FeedbackHeader({
    required this.avaliacao,
    required this.avaliacaoLabel,
    required this.avaliacaoColor,
    required this.roundNum,
    required this.totalRounds,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      decoration: BoxDecoration(
        color: avaliacaoColor.withOpacity(0.06),
        border: Border(
          bottom: BorderSide(color: avaliacaoColor.withOpacity(0.2)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Rodada $roundNum de $totalRounds',
              style: AppTheme.inter(
                  size: 11, color: AppTheme.t3)),
          const SizedBox(height: 4),
          Text(avaliacaoLabel,
              style: AppTheme.syne(
                  size: 17,
                  weight: FontWeight.w800,
                  color: avaliacaoColor)),
        ],
      ),
    );
  }
}

// ── Delta chip ────────────────────────────────────────
class _DeltaChip extends StatelessWidget {
  final String emoji;
  final String label;
  final int delta;
  final bool positive;

  const _DeltaChip({
    required this.emoji,
    required this.label,
    required this.delta,
    required this.positive,
  });

  @override
  Widget build(BuildContext context) {
    final col = positive ? AppTheme.ok : AppTheme.err;
    final sign = delta > 0 ? '+' : '';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: col.withOpacity(0.08),
        borderRadius: BorderRadius.circular(99),
        border: Border.all(color: col.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 12)),
          const SizedBox(width: 4),
          Text('$label $sign$delta',
              style: AppTheme.inter(
                  size: 12,
                  weight: FontWeight.w600,
                  color: col)),
        ],
      ),
    );
  }
}
