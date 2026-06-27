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

  // ── Abas ─────────────────────────────────────────────
  int _tabIndex = 0; // 0=contexto 1=escolher 2=progresso 3=empresa
  static const _tabs = ['CONTEXTO', 'ESCOLHER', 'PROGRESSO', 'EMPRESA'];

  // ── Estado ────────────────────────────────────────────
  int? _escolhendo;
  bool _processando = false;
  Imprevisto? _imprevisto;
  bool _imprevistoVisto = false;

  // ── Timer ─────────────────────────────────────────────
  static const _timerTotal = 90;
  Timer? _timer;
  int _timerSegs = _timerTotal;
  bool get _danger => _timerSegs <= 10;

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
            begin: const Offset(0.04, 0), end: Offset.zero)
        .animate(CurvedAnimation(
            parent: _slideCtrl, curve: Curves.easeOutCubic));
    _slideCtrl.forward();

    _pulseCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 800))
      ..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.92, end: 1.08).animate(
        CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut));

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
          if (!_processando) _processarOmissao();
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
    await Future.delayed(const Duration(milliseconds: 200));
    if (!mounted) return;

    final result = GameEngine.processarEscolha(
        _s, idx, imprevisto: _imprevisto);

    Navigator.pushReplacement(context,
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 300),
        pageBuilder: (_, __, ___) =>
            FeedbackScreen(state: _s, result: result),
        transitionsBuilder: (_, a, __, child) =>
            FadeTransition(opacity: a, child: child),
      ),
    );
  }

  Future<void> _processarOmissao() async {
    if (_processando) return;
    setState(() => _processando = true);
    await Future.delayed(const Duration(milliseconds: 100));
    if (!mounted) return;

    final result = GameEngine.processarOmissao(_s);
    Navigator.pushReplacement(context,
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 300),
        pageBuilder: (_, __, ___) =>
            FeedbackScreen(state: _s, result: result),
        transitionsBuilder: (_, a, __, child) =>
            FadeTransition(opacity: a, child: child),
      ),
    );
  }

  void _changeTab(int i) {
    setState(() => _tabIndex = i);
    _slideCtrl
      ..reset()
      ..forward();
  }

  @override
  Widget build(BuildContext context) {
    final round  = GameEngine.rodadaAtual(_s);
    final meta   = indicadoresMeta(_s.sector);
    final perigo = GameEngine.indicadoresEmPerigo(_s);

    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(children: [
          _buildTopBar(round),
          _buildIndicadoresGrid(meta, perigo),
          _buildGestorStrip(),
          if (_imprevisto != null && !_imprevistoVisto)
            _ImprevistoBanner(
              imp: _imprevisto!,
              onDismiss: () => setState(() => _imprevistoVisto = true),
            ),
          Expanded(
            child: SlideTransition(
              position: _slideAnim,
              child: _buildTabBody(round, meta),
            ),
          ),
          _buildTabBar(),
        ]),
      ),
    );
  }

  // ══ TOP BAR ══════════════════════════════════════════
  Widget _buildTopBar(GameRound round) {
    final cur   = _s.currentRound + 1;
    final total = _s.totalRounds;
    final badge = GameEngine.faseBadge(round, cur, total);

    return Container(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 8),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppTheme.line))),
      child: Column(children: [
        Row(children: [
          // Nome empresa
          Flexible(
            child: Text(_s.companyName,
                style: AppTheme.syne(
                    size: 14, weight: FontWeight.w800, color: AppTheme.t1),
                maxLines: 1, overflow: TextOverflow.ellipsis),
          ),
          const SizedBox(width: 8),
          // Badge fase
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.bg3,
              borderRadius: BorderRadius.circular(99),
              border: Border.all(color: AppTheme.line2),
            ),
            child: Text(badge,
                style: AppTheme.inter(
                    size: 11, weight: FontWeight.w600,
                    color: AppTheme.primary)),
          ),
          const Spacer(),
          // Timer
          if (_s.timerEnabled) ...[
            _CircularTimer(
              segs: _timerSegs, total: _timerTotal,
              danger: _danger, pulse: _pulseAnim),
            const SizedBox(width: 8),
          ],
          // ? botão
          _HeaderBtn(icon: Icons.help_outline_rounded, onTap: () {}),
          const SizedBox(width: 6),
          // Config
          _HeaderBtn(icon: Icons.settings_outlined, onTap: () {}),
        ]),
        const SizedBox(height: 8),
        // Barra de progresso com linha azul (diagnóstico) → laranja → dourado
        ClipRRect(
          borderRadius: BorderRadius.circular(99),
          child: LinearProgressIndicator(
            value: _s.progresso,
            minHeight: 3,
            backgroundColor: AppTheme.bg3,
            valueColor: AlwaysStoppedAnimation<Color>(
              round.fase == 'diagnostico'
                  ? const Color(0xFF5B8DEF)
                  : round.fase == 'pressao'
                      ? AppTheme.warn
                      : AppTheme.primary,
            ),
          ),
        ),
      ]),
    );
  }

  // ══ INDICADORES 2×4 GRID ═════════════════════════════
  Widget _buildIndicadoresGrid(
      List<IndicadorMeta> meta, List<String> perigo) {
    return Container(
      color: AppTheme.bg1,
      padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 6,
        mainAxisSpacing: 6,
        childAspectRatio: 2.8,
        children: meta.map((m) {
          final val    = _s.indicators[m.key] ?? 0;
          final col    = _indColor(val);
          final bench  = benchmarkFor(_s.sector, m.key);
          final danger = perigo.contains(m.key);

          return AnimatedContainer(
            duration: const Duration(milliseconds: 350),
            padding: const EdgeInsets.fromLTRB(8, 6, 8, 6),
            decoration: BoxDecoration(
              color: danger
                  ? AppTheme.err.withOpacity(0.07)
                  : AppTheme.bg2,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: danger
                    ? AppTheme.err.withOpacity(0.5)
                    : AppTheme.line2,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Text(m.emoji,
                      style: const TextStyle(fontSize: 11)),
                  const SizedBox(width: 5),
                  Expanded(
                    child: Text(m.label,
                        style: AppTheme.inter(
                            size: 10,
                            weight: FontWeight.w600,
                            color: AppTheme.t2),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                  ),
                  Text('$val',
                      style: AppTheme.syne(
                          size: 15,
                          weight: FontWeight.w800,
                          color: col)),
                ]),
                const SizedBox(height: 3),
                ClipRRect(
                  borderRadius: BorderRadius.circular(99),
                  child: TweenAnimationBuilder<double>(
                    duration: const Duration(milliseconds: 400),
                    tween: Tween(begin: 0, end: val / 20),
                    builder: (_, v, __) => LinearProgressIndicator(
                      value: v, minHeight: 3,
                      backgroundColor: AppTheme.bg4,
                      valueColor: AlwaysStoppedAnimation<Color>(col),
                    ),
                  ),
                ),
                const SizedBox(height: 2),
                Row(children: [
                  if (bench != null)
                    Text('Méd: $bench',
                        style: AppTheme.inter(
                            size: 9, color: AppTheme.t3)),
                  const Spacer(),
                  Text('$val/20',
                      style: AppTheme.inter(
                          size: 9,
                          color: col,
                          weight: FontWeight.w700)),
                ]),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  // ══ GESTOR STRIP ═════════════════════════════════════
  Widget _buildGestorStrip() {
    final g = _s.gestor;
    final repCol = g.reputacaoInterna <= 2 ? AppTheme.err : AppTheme.pur;
    final capCol = g.capitalPolitico  <= 2 ? AppTheme.err : AppTheme.pur;
    final esgCol = g.esgotamento >= 7 ? AppTheme.err
        : g.esgotamento >= 5 ? AppTheme.warn : AppTheme.ok;

    return Container(
      padding: const EdgeInsets.fromLTRB(10, 6, 10, 6),
      decoration: const BoxDecoration(
        color: AppTheme.bg1,
        border: Border(
          top:    BorderSide(color: AppTheme.line),
          bottom: BorderSide(color: AppTheme.line),
        ),
      ),
      child: Row(children: [
        _GestorStat(
            label: 'REPUTAÇÃO',
            value: '${g.reputacaoInterna}/10',
            color: repCol),
        _Divider(),
        _GestorStat(
            label: 'CAP. POLÍTICO',
            value: '${g.capitalPolitico}/10',
            color: capCol),
        _Divider(),
        _GestorStat(
            label: 'ESGOTAMENTO',
            value: '${g.esgotamento}/10',
            color: esgCol),
      ]),
    );
  }

  // ══ TAB BODY ═════════════════════════════════════════
  Widget _buildTabBody(GameRound round, List<IndicadorMeta> meta) {
    switch (_tabIndex) {
      case 0: return _buildContextoTab(round);
      case 1: return _buildEscolherTab(round);
      case 2: return _buildProgressoTab(meta);
      case 3: return _buildEmpresaTab(meta);
      default: return _buildContextoTab(round);
    }
  }

  // ── ABA CONTEXTO ─────────────────────────────────────
  Widget _buildContextoTab(GameRound round) {
    final faseTrad = GameEngine.faseLabel(round.fase);
    final cur = _s.currentRound + 1;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Fase badge
          Container(
            padding: const EdgeInsets.symmetric(
                horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.bg3,
              borderRadius: BorderRadius.circular(99),
              border: Border.all(color: AppTheme.line2),
            ),
            child: Text('RODADA $cur · $faseTrad',
                style: AppTheme.syne(
                    size: 10,
                    weight: FontWeight.w700,
                    color: AppTheme.primary,
                    letterSpacing: 0.08 * 10)),
          ),
          const SizedBox(height: 14),

          // Título grande
          Text(round.title,
              style: AppTheme.syne(
                  size: 22,
                  weight: FontWeight.w900,
                  color: AppTheme.t1,
                  letterSpacing: -0.01 * 22)),
          const SizedBox(height: 16),

          // Descrição
          Text(round.description,
              style: AppTheme.inter(
                  size: 14, color: AppTheme.t2, height: 1.75)),
          const SizedBox(height: 28),

          // Botão "Ver opções →"
          GestureDetector(
            onTap: () => _changeTab(1),
            child: Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 20, vertical: 13),
              decoration: BoxDecoration(
                color: AppTheme.bg3,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.primaryBd),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Ver opções',
                      style: AppTheme.syne(
                          size: 13,
                          weight: FontWeight.w700,
                          color: AppTheme.primary)),
                  const SizedBox(width: 6),
                  const Icon(Icons.arrow_forward_rounded,
                      size: 14, color: AppTheme.primary),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── ABA ESCOLHER ─────────────────────────────────────
  Widget _buildEscolherTab(GameRound round) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('O que você decide?',
              style: AppTheme.inter(
                  size: 11,
                  weight: FontWeight.w700,
                  color: AppTheme.t3,
                  letterSpacing: 0.06 * 11)),
          const SizedBox(height: 10),

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
        ],
      ),
    );
  }

  // ── ABA PROGRESSO ─────────────────────────────────────
  Widget _buildProgressoTab(List<IndicadorMeta> meta) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Progresso do Mandato',
              style: AppTheme.inter(
                  size: 11, weight: FontWeight.w700, color: AppTheme.t3)),
          const SizedBox(height: 12),

          // Scores
          Row(children: [
            Expanded(
              child: _ScoreTile(
                  label: 'Score Empresa',
                  value: _s.scoreEmpresa,
                  icon: '🏢'),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _ScoreTile(
                  label: 'Score Gestor',
                  value: _s.scoreGestor,
                  icon: '👤'),
            ),
          ]),
          const SizedBox(height: 16),

          // Rodadas
          Text('Histórico de decisões',
              style: AppTheme.inter(
                  size: 11, weight: FontWeight.w700, color: AppTheme.t3)),
          const SizedBox(height: 8),

          if (_s.history.isEmpty)
            Text('Nenhuma decisão registrada ainda.',
                style: AppTheme.inter(size: 13, color: AppTheme.t3))
          else
            ..._s.history.reversed.map((h) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: _HistItem(entry: h),
                )),
        ],
      ),
    );
  }

  // ── ABA EMPRESA ───────────────────────────────────────
  Widget _buildEmpresaTab(List<IndicadorMeta> meta) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cabeçalho empresa
          Row(children: [
            Text(sectorIcon(_s.sector),
                style: const TextStyle(fontSize: 22)),
            const SizedBox(width: 10),
            Column(crossAxisAlignment: CrossAxisAlignment.start,
                children: [
              Text(_s.companyName,
                  style: AppTheme.syne(
                      size: 15,
                      weight: FontWeight.w800,
                      color: AppTheme.t1)),
              Text(sectorName(_s.sector),
                  style: AppTheme.inter(
                      size: 11, color: AppTheme.t3)),
            ]),
          ]),
          const SizedBox(height: 16),

          Text('Indicadores detalhados',
              style: AppTheme.inter(
                  size: 11, weight: FontWeight.w700, color: AppTheme.t3)),
          const SizedBox(height: 8),

          ...meta.map((m) {
            final val   = _s.indicators[m.key] ?? 0;
            final col   = val <= 4 ? AppTheme.err
                : val <= 8 ? AppTheme.warn
                    : val <= 12 ? AppTheme.primary : AppTheme.ok;
            final bench = benchmarkFor(_s.sector, m.key);

            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.bg2,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.line2),
                ),
                child: Column(children: [
                  Row(children: [
                    Text(m.emoji,
                        style: const TextStyle(fontSize: 16)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(m.label,
                          style: AppTheme.inter(
                              size: 13,
                              weight: FontWeight.w500,
                              color: AppTheme.t1)),
                    ),
                    Text('$val/20',
                        style: AppTheme.syne(
                            size: 14,
                            weight: FontWeight.w800,
                            color: col)),
                  ]),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(99),
                    child: LinearProgressIndicator(
                      value: val / 20, minHeight: 5,
                      backgroundColor: AppTheme.bg4,
                      valueColor: AlwaysStoppedAnimation<Color>(col),
                    ),
                  ),
                  if (bench != null) ...[
                    const SizedBox(height: 4),
                    Row(children: [
                      Text('Benchmark do setor: $bench/20',
                          style: AppTheme.inter(
                              size: 10, color: AppTheme.t3)),
                      const Spacer(),
                      Text(
                        val >= bench ? '▲ acima' : '▼ abaixo',
                        style: AppTheme.inter(
                            size: 10,
                            color: val >= bench
                                ? AppTheme.ok
                                : AppTheme.err,
                            weight: FontWeight.w600),
                      ),
                    ]),
                  ],
                ]),
              ),
            );
          }),
        ],
      ),
    );
  }

  // ══ TAB BAR ══════════════════════════════════════════
  Widget _buildTabBar() {
    final icons = [
      Icons.menu_book_outlined,
      Icons.bolt_outlined,
      Icons.bar_chart_rounded,
      Icons.business_outlined,
    ];

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.bg1,
        border: Border(
            top: BorderSide(
                color: AppTheme.primary.withOpacity(0.12))),
      ),
      child: Row(
        children: List.generate(4, (i) {
          final active = _tabIndex == i;
          return Expanded(
            child: GestureDetector(
              onTap: () => _changeTab(i),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  border: Border(
                    top: BorderSide(
                      color: active
                          ? AppTheme.primary
                          : Colors.transparent,
                      width: 2,
                    ),
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(icons[i],
                        size: 16,
                        color: active
                            ? AppTheme.primary
                            : AppTheme.t3),
                    const SizedBox(height: 3),
                    Text(_tabs[i],
                        style: AppTheme.inter(
                            size: 9,
                            weight: FontWeight.w700,
                            color: active
                                ? AppTheme.primary
                                : AppTheme.t3,
                            letterSpacing: 0.05 * 9)),
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

// ══ WIDGETS ════════════════════════════════════════════

class _HeaderBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _HeaderBtn({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      width: 34, height: 34,
      decoration: BoxDecoration(
        color: AppTheme.bg3,
        borderRadius: BorderRadius.circular(9),
        border: Border.all(color: AppTheme.line2),
      ),
      child: Icon(icon, size: 15, color: AppTheme.t2),
    ),
  );
}

class _CircularTimer extends StatelessWidget {
  final int segs;
  final int total;
  final bool danger;
  final Animation<double> pulse;
  const _CircularTimer({
    required this.segs, required this.total,
    required this.danger, required this.pulse,
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
          width: 36, height: 36,
          child: Stack(alignment: Alignment.center, children: [
            CustomPaint(
                size: const Size(36, 36),
                painter: _TimerPainter(frac: frac, color: col)),
            Text('$segs',
                style: AppTheme.syne(
                    size: 10, weight: FontWeight.w800, color: col)),
          ]),
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
    final bg = Paint()
      ..color = AppTheme.bg4
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke;
    final fg = Paint()
      ..color = color
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    canvas.drawCircle(Offset(cx, cy), r, bg);
    canvas.drawArc(
      Rect.fromCircle(center: Offset(cx, cy), radius: r),
      -math.pi / 2,
      2 * math.pi * frac,
      false, fg,
    );
  }

  @override
  bool shouldRepaint(_TimerPainter old) =>
      old.frac != frac || old.color != color;
}

class _GestorStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _GestorStat(
      {required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) => Expanded(
    child: Column(children: [
      Text(label,
          style: AppTheme.inter(
              size: 8, color: AppTheme.t3, weight: FontWeight.w700,
              letterSpacing: 0.06 * 8)),
      const SizedBox(height: 2),
      Text(value,
          style: AppTheme.syne(
              size: 14, weight: FontWeight.w800, color: color)),
    ]),
  );
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(
    width: 1, height: 28,
    margin: const EdgeInsets.symmetric(horizontal: 6),
    color: AppTheme.line,
  );
}

class _ImprevistoBanner extends StatefulWidget {
  final Imprevisto imp;
  final VoidCallback onDismiss;
  const _ImprevistoBanner({required this.imp, required this.onDismiss});

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
    final gestDesc = ImprevistoSystem.descricaoGestor(widget.imp);
    return FadeTransition(
      opacity: _fade,
      child: Container(
        margin: const EdgeInsets.fromLTRB(10, 6, 10, 0),
        padding: const EdgeInsets.fromLTRB(12, 8, 10, 8),
        decoration: BoxDecoration(
          color: AppTheme.warn.withOpacity(0.07),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppTheme.warn.withOpacity(0.3)),
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start,
            children: [
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(widget.imp.titulo,
                  style: AppTheme.syne(
                      size: 11, weight: FontWeight.w700,
                      color: AppTheme.warn)),
              const SizedBox(height: 2),
              Text(widget.imp.descricao,
                  style: AppTheme.inter(
                      size: 10, color: AppTheme.t2, height: 1.4)),
              if (gestDesc.isNotEmpty) ...[
                const SizedBox(height: 3),
                Text(gestDesc,
                    style: AppTheme.inter(
                        size: 10, color: AppTheme.pur,
                        weight: FontWeight.w600)),
              ],
            ],
          )),
          GestureDetector(
            onTap: _dismiss,
            child: const Padding(
              padding: EdgeInsets.only(left: 6),
              child: Icon(Icons.close_rounded,
                  size: 15, color: AppTheme.t3),
            ),
          ),
        ]),
      ),
    );
  }
}

class _ChoiceCard extends StatelessWidget {
  final int index;
  final Choice choice;
  final bool selected;
  final bool disabled;
  final VoidCallback onTap;
  const _ChoiceCard({
    required this.index, required this.choice,
    required this.selected, required this.disabled,
    required this.onTap,
  });

  static const _letters = ['A', 'B', 'C', 'D'];

  Color get _riscoColor {
    switch (choice.risco) {
      case 'alto':  return AppTheme.err;
      case 'medio': return AppTheme.warn;
      default:      return AppTheme.ok;
    }
  }

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
              : disabled ? AppTheme.bg2.withOpacity(0.45) : AppTheme.bg2,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
              color: selected ? AppTheme.primary : AppTheme.line2,
              width: selected ? 1.5 : 1),
          boxShadow: selected
              ? [BoxShadow(
                  color: AppTheme.primaryGlow,
                  blurRadius: 14, spreadRadius: 1)]
              : null,
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start,
            children: [
          // Badge letra
          AnimatedContainer(
            duration: const Duration(milliseconds: 160),
            width: 28, height: 28,
            decoration: BoxDecoration(
              color: selected ? AppTheme.primary : AppTheme.bg4,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Text(_letters[index],
                  style: AppTheme.syne(
                      size: 12, weight: FontWeight.w800,
                      color: selected ? Colors.black : AppTheme.t3)),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                children: [
              Text(choice.text,
                  style: AppTheme.inter(
                      size: 13,
                      color: disabled && !selected
                          ? AppTheme.t3 : AppTheme.t1,
                      height: 1.5)),
              const SizedBox(height: 4),
              // Badge de risco
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: _riscoColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Text(
                  'Risco ${choice.risco}',
                  style: AppTheme.inter(
                      size: 9,
                      color: _riscoColor,
                      weight: FontWeight.w700),
                ),
              ),
            ]),
          ),
          if (selected)
            const Padding(
              padding: EdgeInsets.only(left: 8, top: 2),
              child: Icon(Icons.check_circle_rounded,
                  color: AppTheme.primary, size: 18),
            ),
        ]),
      ),
    );
  }
}

class _ScoreTile extends StatelessWidget {
  final String label;
  final int value;
  final String icon;
  const _ScoreTile(
      {required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    final col = value >= 65 ? AppTheme.ok
        : value >= 45 ? AppTheme.primary
            : value >= 30 ? AppTheme.warn : AppTheme.err;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.line2),
      ),
      child: Column(children: [
        Text(icon, style: const TextStyle(fontSize: 18)),
        const SizedBox(height: 6),
        Text('$value',
            style: AppTheme.syne(
                size: 26, weight: FontWeight.w900, color: col)),
        Text(label,
            style: AppTheme.inter(size: 10, color: AppTheme.t3),
            textAlign: TextAlign.center),
      ]),
    );
  }
}

class _HistItem extends StatelessWidget {
  final HistoryEntry entry;
  const _HistItem({required this.entry});

  Color get _col {
    switch (entry.avaliacao) {
      case Avaliacao.boa:     return AppTheme.ok;
      case Avaliacao.media:   return AppTheme.warn;
      case Avaliacao.omissao: return AppTheme.err;
      default:                return AppTheme.err;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: AppTheme.bg2,
        borderRadius: BorderRadius.circular(8),
        border: Border(left: BorderSide(color: _col, width: 3)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start,
          children: [
        Text('R${entry.round} · ${entry.titulo}',
            style: AppTheme.inter(size: 10, color: AppTheme.t3)),
        const SizedBox(height: 2),
        Text(entry.escolha,
            style: AppTheme.inter(size: 12, color: AppTheme.t2),
            maxLines: 2, overflow: TextOverflow.ellipsis),
      ]),
    );
  }
}
