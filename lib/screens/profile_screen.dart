import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../services/game_service.dart';
import '../widgets/app_widgets.dart';

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
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final uid = AuthService.currentUser?.uid;
    if (uid == null) { setState(() => _loading = false); return; }
    final results = await Future.wait([
      FirestoreService.getDoc('usuarios/$uid'),
      GameService.buscarHistorico(),
    ]);
    if (mounted) setState(() {
      _data    = results[0] as Map<String, dynamic>?;
      _hist    = results[1] as List<Map<String, dynamic>>;
      _loading = false;
    });
  }

  String get _nome {
    if (_data?['nome'] != null) return _data!['nome'];
    return AuthService.currentUser?.displayName ?? 'Jogador';
  }

  String get _initial => _nome.isNotEmpty ? _nome[0].toUpperCase() : '?';
  bool get _isGuest   => AuthService.currentUser?.isAnonymous == true;

  // ── Stats calculados do histórico ──────────────────────
  int    get _total   => _hist.length;
  int    get _melhor  => _total > 0 ? _hist.map((h) => (h['score'] as num?)?.toInt() ?? 0).reduce(max) : 0;
  int    get _media   => _total > 0 ? (_hist.map((h) => (h['score'] as num?)?.toInt() ?? 0).reduce((a, b) => a + b) / _total).round() : 0;
  int    get _boas    => _hist.where((h) => ((h['score'] as num?)?.toInt() ?? 0) >= 70).length;

  String get _setorFavorito {
    if (_total == 0) return '—';
    final counts = <String, int>{};
    for (final h in _hist) {
      final s = h['sector'] as String? ?? '';
      if (s.isNotEmpty) counts[s] = (counts[s] ?? 0) + 1;
    }
    if (counts.isEmpty) return '—';
    final fav = counts.entries.reduce((a, b) => a.value >= b.value ? a : b).key;
    const icons = {'tecnologia': '🚀', 'varejo': '🛒', 'logistica': '🚚', 'industria': '🏭'};
    return '${icons[fav] ?? ''} $fav';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
              decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.line))),
              child: Row(children: [
                const BackBtn(),
                const SizedBox(width: 12),
                const Icon(Icons.person_outline_rounded, size: 15, color: AppTheme.t2),
                const SizedBox(width: 6),
                Text('Meu Perfil',
                    style: AppTheme.syne(size: 15, weight: FontWeight.w700, color: AppTheme.t1)),
              ]),
            ),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Avatar + nome + subtítulo
                          Center(child: Column(children: [
                            _Avatar(initial: _initial, photoUrl: _data?['fotoUrl']),
                            const SizedBox(height: 12),
                            Text(_nome,
                                style: AppTheme.syne(size: 20, weight: FontWeight.w700, color: AppTheme.t1)),
                            const SizedBox(height: 4),
                            Text('$_total mandato${_total != 1 ? 's' : ''} concluído${_total != 1 ? 's' : ''}',
                                style: AppTheme.inter(size: 13, color: AppTheme.t3)),
                            if (!_isGuest) ...[
                              const SizedBox(height: 6),
                              GestureDetector(
                                onTap: () {
                                  final uid = AuthService.currentUser?.uid ?? '';
                                  Clipboard.setData(ClipboardData(text: uid));
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('ID copiado!'), duration: Duration(seconds: 2)));
                                },
                                child: Text('ID: ${(AuthService.currentUser?.uid ?? '').substring(0, 8)}...',
                                    style: AppTheme.inter(size: 11, color: AppTheme.t3)),
                              ),
                            ],
                          ])),
                          const SizedBox(height: 20),

                          // Stats grid (igual ao site: 4 cards)
                          GridView.count(
                            crossAxisCount: 2,
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            crossAxisSpacing: 10,
                            mainAxisSpacing: 10,
                            childAspectRatio: 2.2,
                            children: [
                              _StatCard(val: _total > 0 ? '$_melhor' : '—', label: 'Melhor Score'),
                              _StatCard(val: _total > 0 ? '$_media'  : '—', label: 'Score Médio'),
                              _StatCard(val: '$_boas',                       label: 'Excelentes (70+)'),
                              _StatCard(val: _setorFavorito,                 label: 'Setor Favorito', small: true),
                            ],
                          ),
                          const SizedBox(height: 20),

                          // Gráfico de evolução
                          _SectionTitle('Evolução de Scores'),
                          const SizedBox(height: 10),
                          _GraficoEvolucao(hist: _hist),
                          const SizedBox(height: 20),

                          // Conquistas
                          _SectionTitle('Conquistas'),
                          const SizedBox(height: 10),
                          _isGuest
                              ? _GuestBanner()
                              : _Conquistas(hist: _hist),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Avatar ──────────────────────────────────────────────
class _Avatar extends StatelessWidget {
  final String initial;
  final String? photoUrl;
  const _Avatar({required this.initial, this.photoUrl});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 76, height: 76,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: AppTheme.goldGradient,
        border: Border.all(color: AppTheme.primaryBd, width: 2),
      ),
      child: photoUrl != null && (photoUrl!).isNotEmpty
          ? ClipOval(child: Image.network(photoUrl!, fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Center(child: Text(initial,
                  style: AppTheme.syne(size: 30, weight: FontWeight.w700, color: Colors.black)))))
          : Center(child: Text(initial,
              style: AppTheme.syne(size: 30, weight: FontWeight.w700, color: Colors.black))),
    );
  }
}

// ── Stat Card ────────────────────────────────────────────
class _StatCard extends StatelessWidget {
  final String val, label;
  final bool small;
  const _StatCard({required this.val, required this.label, this.small = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppTheme.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.line2),
      ),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Text(val,
            style: AppTheme.syne(
                size: small ? 13 : 22,
                weight: FontWeight.w800,
                color: AppTheme.primary),
            maxLines: 1,
            overflow: TextOverflow.ellipsis),
        const SizedBox(height: 2),
        Text(label,
            style: AppTheme.inter(size: 10, color: AppTheme.t3),
            textAlign: TextAlign.center),
      ]),
    );
  }
}

// ── Section title ────────────────────────────────────────
class _SectionTitle extends StatelessWidget {
  final String text;
  const _SectionTitle(this.text);
  @override
  Widget build(BuildContext context) =>
      Text(text, style: AppTheme.syne(size: 13, weight: FontWeight.w700, color: AppTheme.t1));
}

// ── Gráfico SVG de evolução ──────────────────────────────
class _GraficoEvolucao extends StatelessWidget {
  final List<Map<String, dynamic>> hist;
  const _GraficoEvolucao({required this.hist});

  @override
  Widget build(BuildContext context) {
    final ultimas = hist.take(10).toList().reversed.toList();

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.line2),
      ),
      child: ultimas.length < 2
          ? Center(child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Text('Jogue ao menos 2 partidas para ver a evolução.',
                  style: AppTheme.inter(size: 12, color: AppTheme.t3),
                  textAlign: TextAlign.center)))
          : Column(children: [
              SizedBox(
                height: 90,
                child: CustomPaint(
                  size: const Size(double.infinity, 90),
                  painter: _GraficoPainter(ultimas),
                ),
              ),
              const SizedBox(height: 8),
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                _Leg(color: const Color(0xFF2ecc71), label: 'Excelente'),
                const SizedBox(width: 12),
                _Leg(color: const Color(0xFFf39c12), label: 'Regular'),
                const SizedBox(width: 12),
                _Leg(color: const Color(0xFFe74c3c), label: 'Crítico'),
              ]),
            ]),
    );
  }
}

class _Leg extends StatelessWidget {
  final Color color;
  final String label;
  const _Leg({required this.color, required this.label});
  @override
  Widget build(BuildContext context) => Row(mainAxisSize: MainAxisSize.min, children: [
    Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
    const SizedBox(width: 4),
    Text(label, style: AppTheme.inter(size: 10, color: AppTheme.t3)),
  ]);
}

class _GraficoPainter extends CustomPainter {
  final List<Map<String, dynamic>> pts;
  _GraficoPainter(this.pts);

  Color _cor(int score) {
    if (score >= 70) return const Color(0xFF2ecc71);
    if (score >= 45) return const Color(0xFFf39c12);
    return const Color(0xFFe74c3c);
  }

  @override
  void paint(Canvas canvas, Size size) {
    if (pts.length < 2) return;
    const pad = 10.0;
    final w = size.width, h = size.height;

    final scores = pts.map((p) => (p['score'] as num?)?.toDouble() ?? 0).toList();
    const minV = 0.0, maxV = 100.0;

    Offset toOffset(int i) {
      final x = pad + (i / (pts.length - 1)) * (w - pad * 2);
      final y = h - pad - ((scores[i] - minV) / (maxV - minV)) * (h - pad * 2);
      return Offset(x, y);
    }

    final offsets = List.generate(pts.length, toOffset);

    // Grid lines
    final gridPaint = Paint()
      ..color = const Color(0xFF2A2D35)
      ..strokeWidth = 0.5
      ..style = PaintingStyle.stroke;
    for (final v in [0, 50, 100]) {
      final y = h - pad - ((v - minV) / (maxV - minV)) * (h - pad * 2);
      canvas.drawLine(Offset(pad, y), Offset(w - pad, y), gridPaint);
    }

    // Area fill
    final areaPath = Path()..moveTo(offsets[0].dx, h - pad);
    for (final o in offsets) areaPath.lineTo(o.dx, o.dy);
    areaPath..lineTo(offsets.last.dx, h - pad)..close();
    canvas.drawPath(areaPath, Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter, end: Alignment.bottomCenter,
        colors: [AppTheme.primary.withOpacity(0.35), AppTheme.primary.withOpacity(0)],
      ).createShader(Rect.fromLTWH(0, 0, w, h))
      ..style = PaintingStyle.fill);

    // Line
    final linePath = Path()..moveTo(offsets[0].dx, offsets[0].dy);
    for (var i = 1; i < offsets.length; i++) linePath.lineTo(offsets[i].dx, offsets[i].dy);
    canvas.drawPath(linePath, Paint()
      ..color = AppTheme.primary
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round);

    // Dots
    for (var i = 0; i < offsets.length; i++) {
      canvas.drawCircle(offsets[i], 4, Paint()..color = _cor(scores[i].toInt()));
      canvas.drawCircle(offsets[i], 4, Paint()
        ..color = AppTheme.bg2
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5);
    }
  }

  @override
  bool shouldRepaint(_GraficoPainter old) => old.pts != pts;
}

// ── Conquistas ───────────────────────────────────────────
class _Conquistas extends StatelessWidget {
  final List<Map<String, dynamic>> hist;
  const _Conquistas({required this.hist});

  List<Map<String, dynamic>> get _lista {
    final total  = hist.length;
    final melhor = total > 0 ? hist.map((h) => (h['score'] as num?)?.toInt() ?? 0).reduce(max) : 0;
    return [
      {'icon': '🏆', 'nome': 'Primeiro Mandato',   'desc': 'Complete 1 jogo',         'unlocked': total >= 1},
      {'icon': '⭐', 'nome': 'Gestão Excelente',   'desc': 'Score acima de 70',        'unlocked': melhor >= 70},
      {'icon': '🔥', 'nome': 'Veterano',            'desc': '5 mandatos concluídos',   'unlocked': total >= 5},
      {'icon': '💼', 'nome': 'Executivo Sênior',   'desc': '10 mandatos concluídos',  'unlocked': total >= 10},
      {'icon': '🌟', 'nome': 'Lenda Corporativa',  'desc': '25 mandatos concluídos',  'unlocked': total >= 25},
      {'icon': '💯', 'nome': 'Score Perfeito',      'desc': 'Score acima de 90',       'unlocked': melhor >= 90},
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: _lista.map((c) {
        final unlocked = c['unlocked'] as bool;
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: unlocked ? AppTheme.primary.withOpacity(0.07) : AppTheme.bg2,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
                color: unlocked ? AppTheme.primary.withOpacity(0.3) : AppTheme.line2),
          ),
          child: Row(children: [
            Text(unlocked ? c['icon'] as String : '🔒',
                style: const TextStyle(fontSize: 22)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(c['nome'] as String,
                  style: AppTheme.syne(size: 13, weight: FontWeight.w600,
                      color: unlocked ? AppTheme.t1 : AppTheme.t3)),
              Text(c['desc'] as String,
                  style: AppTheme.inter(size: 11, color: AppTheme.t3)),
            ])),
            if (unlocked)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Text('✓',
                    style: AppTheme.inter(size: 11, color: AppTheme.primary,
                        weight: FontWeight.w700)),
              ),
          ]),
        );
      }).toList(),
    );
  }
}

// ── Guest Banner ─────────────────────────────────────────
class _GuestBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.line2),
      ),
      child: Column(children: [
        const Text('🏆', style: TextStyle(fontSize: 28)),
        const SizedBox(height: 8),
        Text('Conquistas bloqueadas',
            style: AppTheme.syne(size: 14, weight: FontWeight.w700, color: AppTheme.t1)),
        const SizedBox(height: 4),
        Text('Crie uma conta para desbloquear conquistas e salvar seu progresso.',
            style: AppTheme.inter(size: 12, color: AppTheme.t3),
            textAlign: TextAlign.center),
      ]),
    );
  }
}
