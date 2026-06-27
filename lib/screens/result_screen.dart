import 'package:flutter/material.dart';
import '../engine/models.dart';
import '../engine/game_engine.dart';
import '../data/sector_data.dart';
import '../services/game_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_widgets.dart';
import 'home_screen.dart';

class ResultScreen extends StatefulWidget {
  final GameResult result;
  final GameState state;

  const ResultScreen(
      {super.key, required this.result, required this.state});

  @override
  State<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends State<ResultScreen> {
  bool _salvando = true;
  String? _erro;

  @override
  void initState() {
    super.initState();
    _salvar();
  }

  Future<void> _salvar() async {
    try {
      await GameService.salvarResultado(widget.result);
      if (mounted) setState(() => _salvando = false);
    } catch (e) {
      if (mounted) setState(() {
        _salvando = false;
        _erro = 'Não foi possível salvar o resultado.';
      });
    }
  }

  Color _scoreColor(int score) {
    if (score >= 75) return AppTheme.ok;
    if (score >= 50) return AppTheme.primary;
    if (score >= 30) return AppTheme.warn;
    return AppTheme.err;
  }

  String _scoreLabel(int score) {
    if (score >= 80) return 'Excelente';
    if (score >= 65) return 'Bom';
    if (score >= 45) return 'Regular';
    if (score >= 30) return 'Abaixo do esperado';
    return 'Crítico';
  }

  GameResult get r => widget.result;

  int get _scoreFinal =>
      ((r.scoreEmpresa + r.scoreGestor) / 2).round();

  void _voltarHome() {
    Navigator.pushAndRemoveUntil(
      context,
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 350),
        pageBuilder: (_, __, ___) => const HomeScreen(),
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
      ),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final meta     = indicadoresMeta(r.sector);
    final sf       = _scoreFinal;
    final sfColor  = _scoreColor(sf);
    final sfLabel  = _scoreLabel(sf);
    final isGO     = r.motivo == 'game_over';

    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ──────────────────────────────────
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isGO
                    ? AppTheme.err.withOpacity(0.05)
                    : AppTheme.primaryBg,
                border: Border(
                  bottom: BorderSide(
                    color: isGO
                        ? AppTheme.err.withOpacity(0.2)
                        : AppTheme.primaryBd,
                  ),
                ),
              ),
              child: Column(
                children: [
                  Text(
                    isGO ? '💥 Mandato Encerrado' : '🏁 Mandato Concluído',
                    style: AppTheme.syne(
                        size: 11,
                        weight: FontWeight.w700,
                        color: isGO
                            ? AppTheme.err
                            : AppTheme.primary,
                        letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    r.companyName,
                    style: AppTheme.syne(
                        size: 22,
                        weight: FontWeight.w800,
                        color: AppTheme.t1),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${sectorIcon(r.sector)} ${sectorName(r.sector)}',
                    style:
                        AppTheme.inter(size: 13, color: AppTheme.t2),
                  ),
                  const SizedBox(height: 20),

                  // Score final
                  Text(
                    '$sf',
                    style: AppTheme.syne(
                        size: 60,
                        weight: FontWeight.w900,
                        color: sfColor),
                  ),
                  Text(sfLabel,
                      style: AppTheme.inter(
                          size: 14,
                          color: sfColor,
                          weight: FontWeight.w600)),

                  // Saving indicator
                  if (_salvando)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Row(
                        mainAxisAlignment:
                            MainAxisAlignment.center,
                        children: [
                          const SizedBox(
                              width: 12,
                              height: 12,
                              child: CircularProgressIndicator(
                                  strokeWidth: 1.5,
                                  color: AppTheme.t3)),
                          const SizedBox(width: 6),
                          Text('Salvando...',
                              style: AppTheme.inter(
                                  size: 11, color: AppTheme.t3)),
                        ],
                      ),
                    ),
                  if (_erro != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(_erro!,
                          style: AppTheme.inter(
                              size: 11, color: AppTheme.err)),
                    ),
                ],
              ),
            ),

            // ── Body ─────────────────────────────────────
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Scores detalhados
                    Row(
                      children: [
                        Expanded(
                          child: _ScoreCard(
                            label: 'Score Empresa',
                            value: r.scoreEmpresa,
                            color: _scoreColor(r.scoreEmpresa),
                            icon: '🏢',
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _ScoreCard(
                            label: 'Score Gestor',
                            value: r.scoreGestor,
                            color: _scoreColor(r.scoreGestor),
                            icon: '👤',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Indicadores finais
                    Text('Indicadores Finais',
                        style: AppTheme.inter(
                            size: 11,
                            color: AppTheme.t3,
                            weight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    ...meta.map((m) {
                      final val = r.indicators[m.key] ?? 0;
                      final col = val <= 4
                          ? AppTheme.err
                          : val <= 8
                              ? AppTheme.warn
                              : val <= 12
                                  ? AppTheme.primary
                                  : AppTheme.ok;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: _IndRow(
                            meta: m, value: val, color: col),
                      );
                    }),
                    const SizedBox(height: 16),

                    // Decisões cruciais
                    if (r.decisoesCruciais.isNotEmpty) ...[
                      Text('Decisões de Maior Impacto',
                          style: AppTheme.inter(
                              size: 11,
                              color: AppTheme.t3,
                              weight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      ...r.decisoesCruciais.take(3).map((h) =>
                          Padding(
                            padding:
                                const EdgeInsets.only(bottom: 6),
                            child: _HistoryChip(entry: h),
                          )),
                      const SizedBox(height: 8),
                    ],
                  ],
                ),
              ),
            ),

            // ── Footer ───────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(
                children: [
                  PrimaryButton(
                    label: '🔄  Jogar Novamente',
                    onTap: _voltarHome,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Score card ────────────────────────────────────────
class _ScoreCard extends StatelessWidget {
  final String label;
  final int value;
  final Color color;
  final String icon;

  const _ScoreCard({
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.line2),
      ),
      child: Column(
        children: [
          Text(icon, style: const TextStyle(fontSize: 20)),
          const SizedBox(height: 6),
          Text('$value',
              style: AppTheme.syne(
                  size: 28,
                  weight: FontWeight.w800,
                  color: color)),
          Text(label,
              style:
                  AppTheme.inter(size: 11, color: AppTheme.t3)),
        ],
      ),
    );
  }
}

// ── Indicator row ─────────────────────────────────────
class _IndRow extends StatelessWidget {
  final IndicadorMeta meta;
  final int value;
  final Color color;

  const _IndRow(
      {required this.meta, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(meta.emoji, style: const TextStyle(fontSize: 16)),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(meta.label,
                        style: AppTheme.inter(
                            size: 12, color: AppTheme.t2)),
                  ),
                  Text('$value/20',
                      style: AppTheme.syne(
                          size: 11,
                          weight: FontWeight.w700,
                          color: color)),
                ],
              ),
              const SizedBox(height: 3),
              ClipRRect(
                borderRadius: BorderRadius.circular(99),
                child: LinearProgressIndicator(
                  value: value / 20,
                  minHeight: 5,
                  backgroundColor: AppTheme.bg4,
                  valueColor: AlwaysStoppedAnimation<Color>(color),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── History chip ──────────────────────────────────────
class _HistoryChip extends StatelessWidget {
  final HistoryEntry entry;

  const _HistoryChip({required this.entry});

  Color get _col {
    switch (entry.avaliacao) {
      case Avaliacao.boa:     return AppTheme.ok;
      case Avaliacao.media:   return AppTheme.warn;
      case Avaliacao.ruim:    return AppTheme.err;
      case Avaliacao.omissao: return AppTheme.t3;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.bg2,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: _col.withOpacity(0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 4,
            height: 36,
            decoration: BoxDecoration(
              color: _col,
              borderRadius: BorderRadius.circular(99),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('R${entry.round} · ${entry.titulo}',
                    style: AppTheme.inter(
                        size: 11, color: AppTheme.t3)),
                const SizedBox(height: 2),
                Text(entry.escolha,
                    style: AppTheme.inter(
                        size: 12, color: AppTheme.t2),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
