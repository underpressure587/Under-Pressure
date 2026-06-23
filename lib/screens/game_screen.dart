import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../engine/models.dart';
import '../engine/game_engine.dart';
import '../engine/imprevisto_system.dart';
import '../data/sector_data.dart';
import '../theme/app_theme.dart';
import 'feedback_screen.dart';

class GameScreen extends StatefulWidget {
  final GameState state;
  const GameScreen({super.key, required this.state});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen>
    with TickerProviderStateMixin {

  // ── Estado ────────────────────────────────────────────
  int? _escolhendo;
  bool _processando = false;
  Imprevisto? _imprevisto;
  bool _imprevistoVisto = false;

  // ── Timer ─────────────────────────────────────────────
  static const _timerTotal = 90;
  Timer? _timer;
  int _timerSegs = _timerTotal;
  bool get _timerDanger => _timerSegs <= 10;

  // ── Animações ─────────────────────────────────────────
  late AnimationController _slideCtrl;
  late AnimationController _pulseCtrl;
  late Animation<Offset>   _slideAnim;
  late Animation<double>   _pulseAnim;

  GameState get _s => widget.state;

  @override
  void initState() {
    super.initState();

    _slideCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 350));
    _slideAnim = Tween<Offset>(
            begin: const Offset(0.05, 0), end: Offset.zero)
        .animate(CurvedAnimation(
            parent: _slideCtrl, curve: Curves.easeOutCubic));
    _slideCtrl.forward();

    _pulseCtrl = AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 800))
      ..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.9, end: 1.1)
        .animate(CurvedAnimation(
            parent: _pulseCtrl, curve: Curves.easeInOut));

    _imprevisto = GameEngine.sortearImprevisto(_s);
    if (_s.timerEnabled) _iniciarTimer();
  }

  void _iniciarTimer() {
    _timerSegs = _timerTotal;
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() {
        _timerSegs--;
        if (_timerSegs <= 0) {
          _timer?.cancel();
          if (!_processando) _escolher(0);
        }
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _slideCtrl.dispose();
    _pulseCtrl.dispose();
    super.dispose();
  }

  Color _indColor(int v) {
    if (v <= 4)  return AppTheme.err;
    if (v <= 8)  return AppTheme.warn;
    if (v <= 12) return AppTheme.primary;
    return AppTheme.ok;
  }

  Future<void> _escolher(int idx) async {
    if (_processando) return;
    _timer?.cancel();
    setState(() { _escolhendo = idx; _processando = true; });
    await Future.delayed(const Duration(milliseconds: 180));
    if (!mounted) return;

    final result = GameEngine.processarEscolha(
        _s, idx, imprevisto: _imprevisto);

    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 300),
        pageBuilder: (_, __, ___) =>
            FeedbackScreen(state: _s, result: result),
        transitionsBuilder: (_, a, __, child) =>
            FadeTransition(opacity: a, child: child),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final round     = GameEngine.rodadaAtual(_s);
    final meta      = indicadoresMeta(_s.sector);
    final perigo    = GameEngine.indicadoresEmPerigo(_s);

    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(children: [
          _buildHeader(),
          _GestorStrip(gestor: _s.gestor),
          _buildIndicadores(meta, perigo),
          if (_imprevisto != null && !_imprevistoVisto)
            _ImprevistoBanner(
              imprevisto: _imprevisto!,
              onDismiss: () =>
                  setState(() => _imprevistoVisto = true),
            ),
          Expanded(child: _buildBody(round)),
        ]),
      ),
    );
  }

  // ── Header ────────────────────────────────────────────
  Widget _buildHeader() {
    final cur   = _s.currentRound + 1;
    final total = _s.totalRounds;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
      decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AppTheme.line))),
      child: Column(children: [
        Row(children: [
          Expanded(
            child: Text(_s.companyName,
                style: AppTheme.syne(
                    size: 13, weight: FontWeight.w700, color: AppTheme.t1),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
          ),
          // Timer circular
          if (_s.timerEnabled) ...[
            const SizedBox(width: 8),
            _CircularTimer(
              segs:   _timerSegs,
              total:  _timerTotal,
              danger: _timerDanger,
              pulse:  _pulseAnim,
            ),
          ],
          const SizedBox(width: 8),
          // Round pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.bg3,
              borderRadius: BorderRadius.circular(99),
              border: Border.all(color: AppTheme.line2),
            ),
            child: Text('R$cur/$total',
                style: AppTheme.syne(
                    size: 12, weight: FontWeight.w700, color: AppTheme.t1)),
          ),
        ]),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(99),
          child: LinearProgressIndicator(
            value: _s.progresso,
            minHeight: 4,
            backgroundColor: AppTheme.bg3,
            valueColor:
                const AlwaysStoppedAnimation<Color>(AppTheme.primary),
          ),
        ),
      ]),
    );
  }

  // ── Indicadores ───────────────────────────────────────
  Widget _buildIndicadores(
      List<IndicadorMeta> meta, List<String> perigo) {
    return Container(
      height: 66,
      decoration: const BoxDecoration(
        color: AppTheme.bg1,
        border: Border(bottom: BorderSide(color: AppTheme.line)),
      ),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        itemCount: meta.length,
        separatorBuilder: (_, __) => const SizedBox(width: 6),
        itemBuilder: (_, i) {
          final m      = meta[i];
          final val    = _s.indicators[m.key] ?? 0;
          final col    = _indColor(val);
          final danger = perigo.contains(m.key);

          return AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            width: 52,
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 3),
            decoration: BoxDecoration(
              color: danger
                  ? AppTheme.err.withOpacity(0.08)
                  : AppTheme.bg3,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: danger
                    ? AppTheme.err.withOpacity(0.5)
                    : AppTheme.line2,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(m.emoji,
                    style: const TextStyle(fontSize: 12)),
                const SizedBox(height: 1),
                Text('$val',
                    style: AppTheme.syne(
                        size: 13, weight: FontWeight.w800, color: col)),
                const SizedBox(height: 2),
                ClipRRect(
                  borderRadius: BorderRadius.circular(99),
                  child: LinearProgressIndicator(
                    value: val / 20,
                    minHeight: 2,
                    backgroundColor: AppTheme.bg4,
                    valueColor: AlwaysStoppedAnimation<Color>(col),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // ── Round body ────────────────────────────────────────
  Widget _buildBody(GameRound round) {
    return SlideTransition(
      position: _slideAnim,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Fase badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppTheme.primaryBg,
                borderRadius: BorderRadius.circular(99),
                border: Border.all(color: AppTheme.primaryBd),
              ),
              child: Text(
                GameEngine.faseBadge(_s.currentRound),
                style: AppTheme.inter(
                    size: 11, color: AppTheme.primary, weight: FontWeight.w600),
              ),
            ),
            const SizedBox(height: 10),

            // Título
            Text(round.title,
                style: AppTheme.syne(
                    size: 17, weight: FontWeight.w700, color: AppTheme.t1)),
            const SizedBox(height: 10),

            // Descrição
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.bg2,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.line2),
              ),
              child: Text(round.description,
                  style: AppTheme.inter(
                      size: 13, color: AppTheme.t2, height: 1.65)),
            ),
            const SizedBox(height: 16),

            Text('O que você decide?',
                style: AppTheme.inter(
                    size: 11,
                    color: AppTheme.primary,
                    weight: FontWeight.w600)),
            const SizedBox(height: 8),

            // Choices
            ...round.choices.asMap().entries.map((e) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: _ChoiceCard(
                    index:    e.key,
                    choice:   e.value,
                    selected: _escolhendo == e.key,
                    disabled: _processando && _escolhendo != e.key,
                    onTap:    () => _escolher(e.key),
                  ),
                )),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

// ══ TIMER CIRCULAR ════════════════════════════════════
class _CircularTimer extends StatelessWidget {
  final int segs;
  final int total;
  final bool danger;
  final Animation<double> pulse;

  const _CircularTimer({
    required this.segs,
    required this.total,
    required this.danger,
    required this.pulse,
  });

  @override
  Widget build(BuildContext context) {
    final frac = (segs / total).clamp(0.0, 1.0);
    final col  = danger ? AppTheme.err : AppTheme.primary;

    return AnimatedBuilder(
      animation: pulse,
      builder: (_, child) => Transform.scale(
        scale: danger ? pulse.value : 1.0,
        child: SizedBox(
          width: 38,
          height: 38,
          child: Stack(
            alignment: Alignment.center,
            children: [
              CustomPaint(
                size: const Size(38, 38),
                painter: _TimerPainter(frac: frac, color: col),
              ),
              Text('$segs',
                  style: AppTheme.syne(
                      size: 11, weight: FontWeight.w800, color: col)),
            ],
          ),
        ),
      ),
    );
  }
}

class _TimerPainter extends CustomPainter {
  final double frac;
  final Color color;

  const _TimerPainter({required this.frac, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final r  = cx - 2;
    final bg  = Paint()
      ..color = AppTheme.bg4
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    final fg = Paint()
      ..color = color
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(Offset(cx, cy), r, bg);
    canvas.drawArc(
      Rect.fromCircle(center: Offset(cx, cy), radius: r),
      -math.pi / 2,
      2 * math.pi * frac,
      false,
      fg,
    );
  }

  @override
  bool shouldRepaint(_TimerPainter old) =>
      old.frac != frac || old.color != color;
}

// ══ GESTOR STRIP ══════════════════════════════════════
class _GestorStrip extends StatelessWidget {
  final Gestor gestor;
  const _GestorStrip({required this.gestor});

  @override
  Widget build(BuildContext context) {
    final repCol = gestor.reputacaoInterna <= 2
        ? AppTheme.err
        : AppTheme.pur;
    final capCol = gestor.capitalPolitico <= 2
        ? AppTheme.err
        : AppTheme.pur;
    final esgCol = gestor.esgotamento >= 7
        ? AppTheme.err
        : gestor.esgotamento >= 5
            ? AppTheme.warn
            : AppTheme.ok;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
      decoration: const BoxDecoration(
        color: AppTheme.bg1,
        border: Border(bottom: BorderSide(color: AppTheme.line)),
      ),
      child: Row(children: [
        const Text('👔', style: TextStyle(fontSize: 13)),
        const SizedBox(width: 8),
        _GestorStat(
            label: 'Reputação',
            val: gestor.reputacaoInterna,
            max: 10,
            color: repCol),
        const SizedBox(width: 10),
        _GestorStat(
            label: 'Capital Pol.',
            val: gestor.capitalPolitico,
            max: 10,
            color: capCol),
        const SizedBox(width: 10),
        _GestorStat(
            label: 'Esgotamento',
            val: gestor.esgotamento,
            max: 10,
            color: esgCol,
            inverse: true),
      ]),
    );
  }
}

class _GestorStat extends StatelessWidget {
  final String label;
  final int val;
  final int max;
  final Color color;
  final bool inverse;

  const _GestorStat({
    required this.label,
    required this.val,
    required this.max,
    required this.color,
    this.inverse = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(children: [
          Text(label,
              style: AppTheme.inter(size: 9, color: AppTheme.t3)),
          const SizedBox(width: 3),
          Text('$val',
              style: AppTheme.syne(
                  size: 10, weight: FontWeight.w700, color: color)),
        ]),
        const SizedBox(height: 2),
        SizedBox(
          width: 64,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(99),
            child: LinearProgressIndicator(
              value: val / max,
              minHeight: 3,
              backgroundColor: AppTheme.bg4,
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
        ),
      ],
    );
  }
}

// ══ IMPREVISTO BANNER ═════════════════════════════════
class _ImprevistoBanner extends StatefulWidget {
  final Imprevisto imprevisto;
  final VoidCallback onDismiss;

  const _ImprevistoBanner(
      {required this.imprevisto, required this.onDismiss});

  @override
  State<_ImprevistoBanner> createState() => _ImprevistoBannerState();
}

class _ImprevistoBannerState extends State<_ImprevistoBanner>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 300));
    _fade = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _ctrl.forward();
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  void _dismiss() async {
    await _ctrl.reverse();
    widget.onDismiss();
  }

  @override
  Widget build(BuildContext context) {
    final imp       = widget.imprevisto;
    final modDesc   = ImprevistoSystem.descricaoIndicadores(imp, '');
    final gestDesc  = ImprevistoSystem.descricaoGestor(imp);

    return FadeTransition(
      opacity: _fade,
      child: Container(
        margin: const EdgeInsets.fromLTRB(12, 6, 12, 0),
        padding: const EdgeInsets.fromLTRB(12, 10, 10, 10),
        decoration: BoxDecoration(
          color: AppTheme.warn.withOpacity(0.07),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.warn.withOpacity(0.35)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(imp.titulo,
                      style: AppTheme.syne(
                          size: 12, weight: FontWeight.w700,
                          color: AppTheme.warn)),
                  const SizedBox(height: 2),
                  Text(imp.descricao,
                      style: AppTheme.inter(
                          size: 11, color: AppTheme.t2, height: 1.4)),
                  if (modDesc.isNotEmpty || gestDesc.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Wrap(spacing: 6, children: [
                      if (modDesc.isNotEmpty)
                        _Chip(label: modDesc, color: AppTheme.warn),
                      if (gestDesc.isNotEmpty)
                        _Chip(label: gestDesc, color: AppTheme.pur),
                    ]),
                  ],
                ],
              ),
            ),
            GestureDetector(
              onTap: _dismiss,
              child: const Padding(
                padding: EdgeInsets.only(left: 6),
                child: Icon(Icons.close_rounded,
                    size: 16, color: AppTheme.t3),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final Color color;
  const _Chip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(99),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(label,
          style: AppTheme.inter(
              size: 10, color: color, weight: FontWeight.w600)),
    );
  }
}

// ══ CHOICE CARD ══════════════════════════════════════
class _ChoiceCard extends StatelessWidget {
  final int index;
  final Choice choice;
  final bool selected;
  final bool disabled;
  final VoidCallback onTap;

  const _ChoiceCard({
    required this.index,
    required this.choice,
    required this.selected,
    required this.disabled,
    required this.onTap,
  });

  static const _letters = ['A', 'B', 'C', 'D'];

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: disabled ? null : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: selected
              ? AppTheme.primaryBg
              : disabled
                  ? AppTheme.bg2.withOpacity(0.45)
                  : AppTheme.bg2,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: selected ? AppTheme.primary : AppTheme.line2,
            width: selected ? 1.5 : 1,
          ),
          boxShadow: selected
              ? [BoxShadow(
                  color: AppTheme.primaryGlow,
                  blurRadius: 14,
                  spreadRadius: 1)]
              : null,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 160),
              width: 26,
              height: 26,
              decoration: BoxDecoration(
                color: selected ? AppTheme.primary : AppTheme.bg4,
                borderRadius: BorderRadius.circular(7),
              ),
              child: Center(
                child: Text(_letters[index],
                    style: AppTheme.syne(
                        size: 12,
                        weight: FontWeight.w800,
                        color: selected ? Colors.black : AppTheme.t3)),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(choice.text,
                  style: AppTheme.inter(
                      size: 13,
                      color: disabled && !selected
                          ? AppTheme.t3
                          : AppTheme.t1,
                      height: 1.5)),
            ),
            if (selected)
              const Padding(
                padding: EdgeInsets.only(left: 8, top: 2),
                child: Icon(Icons.check_circle_rounded,
                    color: AppTheme.primary, size: 18),
              ),
          ],
        ),
      ),
    );
  }
}
