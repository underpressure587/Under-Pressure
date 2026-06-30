import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../services/game_service.dart';
import '../widgets/app_widgets.dart';
import '../services/toast_service.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _data;
  List<Map<String, dynamic>> _hist = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final uid = AuthService.currentUser?.uid;
    if (uid == null) { setState(() => _loading = false); return; }
    final results = await Future.wait([
      FirestoreService.getDoc('usuarios/$uid'),
      GameService.buscarHistorico(),
    ]);
    if (mounted) setState(() {
      _data  = results[0] as Map<String, dynamic>?;
      _hist  = results[1] as List<Map<String, dynamic>>;
      _loading = false;
    });
  }

  String get _nome => (_data?['nome'] as String?) ?? AuthService.currentUser?.displayName ?? 'Jogador';
  String get _email => AuthService.currentUser?.email ?? '';
  String? get _photoUrl => _data?['fotoUrl'] as String?;
  bool   get _isGuest => AuthService.currentUser?.isAnonymous == true;
  String get _uid => AuthService.currentUser?.uid ?? '';
  String get _shortId => _uid.length >= 8 ? '#${_uid.substring(0, 8).toUpperCase()}' : '';

  int    get _total  => _hist.length;
  int    get _melhor => _total > 0 ? _hist.map((h) => (h['score'] as num?)?.toInt() ?? 0).reduce(max) : 0;
  int    get _media  => _total > 0 ? (_hist.map((h) => (h['score'] as num?)?.toInt() ?? 0).reduce((a,b) => a+b) / _total).round() : 0;
  int    get _boas   => _hist.where((h) => ((h['score'] as num?)?.toInt() ?? 0) >= 70).length;

  String get _setorFavorito {
    if (_total == 0) return '—';
    final counts = <String, int>{};
    for (final h in _hist) {
      final s = h['sector'] as String? ?? '';
      if (s.isNotEmpty) counts[s] = (counts[s] ?? 0) + 1;
    }
    if (counts.isEmpty) return '—';
    return counts.entries.reduce((a, b) => a.value >= b.value ? a : b).key;
  }

  String _setorEmoji(String s) {
    switch (s) { case 'tecnologia': return '🚀'; case 'varejo': return '🛒';
      case 'logistica': return '🚚'; case 'industria': return '🏭'; default: return ''; }
  }

  Future<void> _logout() async {
    final ok = await showDialog<bool>(context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.bg2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Sair da conta?', style: AppTheme.syne(size: 16, weight: FontWeight.w700, color: AppTheme.t1)),
        content: Text('Tem certeza?', style: AppTheme.inter(size: 14, color: AppTheme.t2)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text('Cancelar', style: AppTheme.inter(color: AppTheme.t2))),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text('Sair', style: AppTheme.inter(color: AppTheme.err))),
        ],
      ));
    if (ok == true) {
      await AuthService.logout();
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const LoginScreen()), (_) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(child: Column(children: [
        // Header
        Container(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
          decoration: const BoxDecoration(
            color: Color(0xE60D0F14),
            border: Border(bottom: BorderSide(color: AppTheme.line)),
          ),
          child: Row(children: [
            const BackBtn(),
            const SizedBox(width: 10),
            const Icon(Icons.person_outline_rounded, size: 15, color: AppTheme.t2),
            const SizedBox(width: 6),
            Text('Meu Perfil', style: AppTheme.syne(size: 15, weight: FontWeight.w700, color: AppTheme.t1)),
            const Spacer(),
            if (!_isGuest)
              GestureDetector(
                onTap: _logout,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.err.withOpacity(0.07),
                    borderRadius: BorderRadius.circular(99),
                    border: Border.all(color: AppTheme.err.withOpacity(0.2)),
                  ),
                  child: Text('Sair da conta',
                      style: AppTheme.inter(size: 11, weight: FontWeight.w700, color: AppTheme.err)),
                ),
              ),
          ]),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
              : SingleChildScrollView(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    _buildHero(),
                    _buildStats(),
                    const SizedBox(height: 4),
                    _buildGrafico(),
                    const SizedBox(height: 16),
                    _buildConquistas(),
                    const SizedBox(height: 24),
                  ]),
                ),
        ),
      ])),
    );
  }

  // ── Hero block ──────────────────────────────────────
  Widget _buildHero() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 28, 20, 24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter, end: Alignment.bottomCenter,
          colors: [AppTheme.primaryGlow.withOpacity(0.7), Colors.transparent],
          stops: const [0, 1],
        ),
      ),
      child: Column(children: [
        // Avatar
        Container(
          width: 92, height: 92,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppTheme.primary.withOpacity(0.15),
            border: Border.all(color: AppTheme.primaryBd, width: 3),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.6), blurRadius: 24, offset: const Offset(0, 8)),
              BoxShadow(color: AppTheme.primaryGlow, blurRadius: 40),
              BoxShadow(color: AppTheme.bg, blurRadius: 0, spreadRadius: 4),
              BoxShadow(color: AppTheme.primaryBd, blurRadius: 0, spreadRadius: 6),
            ],
          ),
          child: _photoUrl != null && _photoUrl!.isNotEmpty
              ? ClipOval(child: Image.network(_photoUrl!, fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Center(child: Text(_nome[0].toUpperCase(),
                      style: AppTheme.syne(size: 36, weight: FontWeight.w800, color: AppTheme.primary)))))
              : Center(child: Text(_nome.isNotEmpty ? _nome[0].toUpperCase() : '?',
                  style: AppTheme.syne(size: 36, weight: FontWeight.w800, color: AppTheme.primary))),
        ),
        const SizedBox(height: 12),
        // Nome
        Text(_nome, style: AppTheme.syne(size: 25, weight: FontWeight.w800, color: AppTheme.t1,
            letterSpacing: -0.02 * 25)),
        const SizedBox(height: 5),
        // Mandatos
        Text('${_total} MANDATO${_total != 1 ? 'S' : ''} CONCLUÍDO${_total != 1 ? 'S' : ''}',
            style: AppTheme.inter(size: 11, weight: FontWeight.w700,
                color: AppTheme.primary.withOpacity(0.65), letterSpacing: 0.14 * 11)),
        const SizedBox(height: 10),
        // ID badge
        if (!_isGuest && _shortId.isNotEmpty) GestureDetector(
          onTap: () {
            Clipboard.setData(ClipboardData(text: _uid));
            ToastService.sucesso('ID copiado!');
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
            decoration: BoxDecoration(
              color: AppTheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(99),
              border: Border.all(color: AppTheme.primaryBd),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Text(_shortId, style: const TextStyle(
                  fontFamily: 'monospace', fontSize: 11, fontWeight: FontWeight.w700,
                  color: AppTheme.primary, letterSpacing: 1)),
              const SizedBox(width: 6),
              const Icon(Icons.copy_rounded, size: 11, color: AppTheme.primary),
            ]),
          ),
        ),
        if (_email.isNotEmpty) ...[
          const SizedBox(height: 5),
          Text(_email, style: AppTheme.inter(size: 11, color: AppTheme.t3)),
        ],
      ]),
    );
  }

  // ── Stats grid ──────────────────────────────────────
  Widget _buildStats() {
    final fav = _setorFavorito;
    final favEmoji = _setorEmoji(fav);
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
      child: GridView.count(
        crossAxisCount: 2, shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 2.0,
        children: [
          _StatCard(val: _total > 0 ? '$_melhor' : '—', label: 'MELHOR SCORE'),
          _StatCard(val: _total > 0 ? '$_media' : '—', label: 'SCORE MÉDIO'),
          _StatCard(val: '$_boas', label: 'EXCELENTES (70+)'),
          _StatCard(
            val: fav == '—' ? '—' : '$favEmoji $fav',
            label: 'SETOR FAVORITO',
            isSetor: true,
          ),
        ],
      ),
    );
  }

  // ── Gráfico ─────────────────────────────────────────
  Widget _buildGrafico() {
    final ultimas = _hist.take(10).toList().reversed.toList();
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 16, 12, 0),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('EVOLUÇÃO DE SCORES',
            style: AppTheme.inter(size: 10, weight: FontWeight.w700,
                color: AppTheme.t3, letterSpacing: 0.12 * 10)),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppTheme.bg2, borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.line2),
          ),
          child: ultimas.length < 2
              ? Center(child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Text('Nenhum jogo registrado ainda.',
                      style: AppTheme.inter(size: 12, color: AppTheme.t3))))
              : Column(children: [
                  SizedBox(height: 100,
                      child: CustomPaint(size: const Size(double.infinity, 100),
                          painter: _GraficoPainter(ultimas))),
                  const SizedBox(height: 10),
                  Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    _Legenda(color: const Color(0xFF22c55e), label: 'Excelente'),
                    const SizedBox(width: 14),
                    _Legenda(color: const Color(0xFFf39c12), label: 'Regular'),
                    const SizedBox(width: 14),
                    _Legenda(color: AppTheme.err, label: 'Crítico'),
                  ]),
                ]),
        ),
      ]),
    );
  }

  // ── Conquistas ──────────────────────────────────────
  Widget _buildConquistas() {
    final melhor = _total > 0 ? _hist.map((h) => (h['score'] as num?)?.toInt() ?? 0).reduce(max) : 0;
    final lista = [
      {'icon': '🏆', 'nome': 'Primeiro Mandato',    'desc': 'Complete 1 jogo',             'unlocked': _total >= 1},
      {'icon': '⭐', 'nome': 'Gestão Excelente',    'desc': 'Score acima de 70',            'unlocked': melhor >= 70},
      {'icon': '🔥', 'nome': 'Veterano',             'desc': '5 mandatos concluídos',        'unlocked': _total >= 5},
      {'icon': '💼', 'nome': 'Executivo Sênior',    'desc': '10 mandatos concluídos',       'unlocked': _total >= 10},
      {'icon': '🚀', 'nome': 'Especialista Tech',   'desc': 'Vença com Tecnologia (70+)',   'unlocked': _hist.any((h) => h['sector'] == 'tecnologia' && ((h['score'] as num?)?.toInt() ?? 0) >= 70)},
      {'icon': '🏭', 'nome': 'Rei da Indústria',    'desc': 'Vença com Indústria (70+)',    'unlocked': _hist.any((h) => h['sector'] == 'industria'  && ((h['score'] as num?)?.toInt() ?? 0) >= 70)},
      {'icon': '🚚', 'nome': 'Mestre da Logística', 'desc': 'Vença com Logística (70+)',    'unlocked': _hist.any((h) => h['sector'] == 'logistica'  && ((h['score'] as num?)?.toInt() ?? 0) >= 70)},
      {'icon': '🛒', 'nome': 'Czar do Varejo',      'desc': 'Vença com Varejo (70+)',       'unlocked': _hist.any((h) => h['sector'] == 'varejo'     && ((h['score'] as num?)?.toInt() ?? 0) >= 70)},
      {'icon': '🌐', 'nome': 'Gestor Completo',     'desc': 'Vença nos 4 setores',          'unlocked': ['tecnologia','industria','logistica','varejo'].every((s) => _hist.any((h) => h['sector'] == s && ((h['score'] as num?)?.toInt() ?? 0) >= 70))},
      {'icon': '💯', 'nome': 'Mandato Perfeito',    'desc': 'Score 90 ou mais',             'unlocked': melhor >= 90},
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('CONQUISTAS',
            style: AppTheme.inter(size: 10, weight: FontWeight.w700,
                color: AppTheme.t3, letterSpacing: 0.12 * 10)),
        const SizedBox(height: 10),
        if (_isGuest)
          _GuestBanner()
        else
          GridView.count(
            crossAxisCount: 2, shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 2.4,
            children: lista.map((c) => _ConquistaCard(
              icon: c['icon'] as String,
              nome: c['nome'] as String,
              desc: c['desc'] as String,
              unlocked: c['unlocked'] as bool,
            )).toList(),
          ),
      ]),
    );
  }
}

// ── Stat Card ─────────────────────────────────────────
class _StatCard extends StatelessWidget {
  final String val, label;
  final bool isSetor;
  const _StatCard({required this.val, required this.label, this.isSetor = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.line2),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center, children: [
        isSetor
            ? Text(val, style: AppTheme.syne(size: 16, weight: FontWeight.w800, color: AppTheme.primary),
                overflow: TextOverflow.ellipsis)
            : ShaderMask(
                shaderCallback: (b) => AppTheme.goldGradient.createShader(b),
                child: Text(val, style: AppTheme.syne(size: 22, weight: FontWeight.w800, color: Colors.white)),
              ),
        const SizedBox(height: 4),
        Text(label, style: AppTheme.inter(size: 9, weight: FontWeight.w700,
            color: AppTheme.t3, letterSpacing: 0.10 * 9)),
      ]),
    );
  }
}

// ── Legenda ───────────────────────────────────────────
class _Legenda extends StatelessWidget {
  final Color color; final String label;
  const _Legenda({required this.color, required this.label});
  @override
  Widget build(BuildContext context) => Row(mainAxisSize: MainAxisSize.min, children: [
    Container(width: 7, height: 7, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
    const SizedBox(width: 4),
    Text(label, style: AppTheme.inter(size: 10, color: AppTheme.t3)),
  ]);
}

// ── Gráfico Painter ───────────────────────────────────
class _GraficoPainter extends CustomPainter {
  final List<Map<String, dynamic>> pts;
  _GraficoPainter(this.pts);

  Color _cor(int s) {
    if (s >= 70) return const Color(0xFF22c55e);
    if (s >= 45) return const Color(0xFFf39c12);
    return const Color(0xFFef4444);
  }

  @override
  void paint(Canvas canvas, Size size) {
    if (pts.length < 2) return;
    const pad = 12.0;
    final w = size.width; final h = size.height;
    final scores = pts.map((p) => (p['score'] as num?)?.toDouble() ?? 0).toList();

    Offset toOffset(int i) {
      final x = pad + (i / (pts.length - 1)) * (w - pad * 2);
      final y = h - pad - (scores[i] / 100) * (h - pad * 2);
      return Offset(x, y);
    }
    final offsets = List.generate(pts.length, toOffset);

    // Grid
    final gp = Paint()..color = const Color(0xFF2A2D35)..strokeWidth = 0.5;
    for (final v in [0.0, 50.0, 100.0]) {
      final y = h - pad - (v / 100) * (h - pad * 2);
      canvas.drawLine(Offset(pad, y), Offset(w - pad, y), gp);
      // Labels
      final tp = TextPainter(
        text: TextSpan(text: '${v.toInt()}',
            style: const TextStyle(fontSize: 8, color: Color(0xFF6B7280))),
        textDirection: TextDirection.ltr)..layout();
      tp.paint(canvas, Offset(0, y - 5));
    }

    // Area
    final path = Path()..moveTo(offsets[0].dx, h - pad);
    for (final o in offsets) path.lineTo(o.dx, o.dy);
    path..lineTo(offsets.last.dx, h - pad)..close();
    canvas.drawPath(path, Paint()
      ..shader = LinearGradient(
          begin: Alignment.topCenter, end: Alignment.bottomCenter,
          colors: [AppTheme.primary.withOpacity(0.35), Colors.transparent])
          .createShader(Rect.fromLTWH(0, 0, w, h))
      ..style = PaintingStyle.fill);

    // Line
    final lp = Path()..moveTo(offsets[0].dx, offsets[0].dy);
    for (var i = 1; i < offsets.length; i++) lp.lineTo(offsets[i].dx, offsets[i].dy);
    canvas.drawPath(lp, Paint()
      ..color = AppTheme.primary..strokeWidth = 2
      ..style = PaintingStyle.stroke..strokeCap = StrokeCap.round..strokeJoin = StrokeJoin.round);

    // Dots
    for (var i = 0; i < offsets.length; i++) {
      canvas.drawCircle(offsets[i], 4.5, Paint()..color = _cor(scores[i].toInt()));
      canvas.drawCircle(offsets[i], 4.5, Paint()
        ..color = AppTheme.bg2..style = PaintingStyle.stroke..strokeWidth = 1.5);
    }
  }

  @override
  bool shouldRepaint(_GraficoPainter o) => o.pts != pts;
}

// ── Conquista Card ────────────────────────────────────
class _ConquistaCard extends StatelessWidget {
  final String icon, nome, desc;
  final bool unlocked;
  const _ConquistaCard({required this.icon, required this.nome,
      required this.desc, required this.unlocked});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(
        color: unlocked ? AppTheme.primary.withOpacity(0.08) : AppTheme.bg2,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
            color: unlocked ? AppTheme.primaryBd : AppTheme.line2),
      ),
      child: Row(children: [
        Text(unlocked ? icon : '🔒', style: const TextStyle(fontSize: 18)),
        const SizedBox(width: 8),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center, children: [
          Text(nome, style: AppTheme.syne(size: 11, weight: FontWeight.w700,
              color: unlocked ? AppTheme.t1 : AppTheme.t3),
              overflow: TextOverflow.ellipsis),
          Text(desc, style: AppTheme.inter(size: 9, color: AppTheme.t3),
              overflow: TextOverflow.ellipsis),
        ])),
      ]),
    );
  }
}

// ── Guest Banner ──────────────────────────────────────
class _GuestBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity, padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(color: AppTheme.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.line2)),
    child: Column(children: [
      const Text('🏆', style: TextStyle(fontSize: 28)),
      const SizedBox(height: 8),
      Text('Conquistas bloqueadas',
          style: AppTheme.syne(size: 14, weight: FontWeight.w700, color: AppTheme.t1)),
      const SizedBox(height: 4),
      Text('Crie uma conta para desbloquear conquistas.',
          style: AppTheme.inter(size: 12, color: AppTheme.t3), textAlign: TextAlign.center),
    ]),
  );
}
