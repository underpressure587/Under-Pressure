import 'dart:async';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import 'login_screen.dart';
import 'sector_screen.dart';
import 'profile_screen.dart';
import 'podio_screen.dart';
import 'historico_screen.dart';
import 'glossario_screen.dart';

enum _FbStatus { connecting, online, offline }

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {

  Map<String, dynamic>? _playerData;
  _FbStatus _fbStatus = _FbStatus.connecting;
  int? _fbPing;
  Timer? _pingTimer;
  bool _showSession = false;
  String _sessionText = '';

  late AnimationController _ringCtrl;
  late Animation<double> _ring1, _ring2;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _loadPlayer();
    _checkSession();
    _doPing();
    _pingTimer = Timer.periodic(
        const Duration(seconds: 30), (_) => _doPing());
  }

  void _setupAnimations() {
    _ringCtrl = AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 3500))
      ..repeat(reverse: true);
    _ring1 = Tween(begin: 0.35, end: 0.80).animate(
        CurvedAnimation(parent: _ringCtrl, curve: Curves.easeInOut));
    _ring2 = Tween(begin: 0.80, end: 0.35).animate(
        CurvedAnimation(parent: _ringCtrl, curve: Curves.easeInOut));
  }

  Future<void> _loadPlayer() async {
    final user = AuthService.currentUser;
    if (user == null) return;
    final data =
        await FirestoreService.getDoc('usuarios/${user.uid}');
    if (mounted) setState(() => _playerData = data);
  }

  Future<void> _checkSession() async {
    final prefs = await SharedPreferences.getInstance();
    final s = prefs.getString('sessao_ativa');
    if (s != null && s.isNotEmpty && mounted) {
      setState(() { _showSession = true; _sessionText = s; });
    }
  }

  Future<void> _doPing() async {
    try {
      final sw = Stopwatch()..start();
      final r = await http.get(Uri.parse(
        'https://firestore.googleapis.com/v1/projects/'
        'under-pressure-49320/databases/default/documents/config/global',
      )).timeout(const Duration(seconds: 6));
      sw.stop();
      if (mounted) setState(() {
        _fbStatus = r.statusCode < 500
            ? _FbStatus.online
            : _FbStatus.offline;
        _fbPing = sw.elapsedMilliseconds;
      });
    } catch (_) {
      if (mounted) setState(() {
        _fbStatus = _FbStatus.offline;
        _fbPing = null;
      });
    }
  }

  @override
  void dispose() {
    _ringCtrl.dispose();
    _pingTimer?.cancel();
    super.dispose();
  }

  // ── Dados do jogador ──────────────────────────────────
  String get _playerName {
    if (_playerData?['nome'] != null)
      return (_playerData!['nome'] as String).toUpperCase();
    final u = AuthService.currentUser;
    if (u?.displayName != null) return u!.displayName!.toUpperCase();
    if (u?.isAnonymous == true) return 'CONVIDADO';
    return 'JOGADOR';
  }

  String get _initial =>
      _playerName.isNotEmpty ? _playerName[0] : '?';

  String? get _photoUrl => _playerData?['fotoUrl'] as String?;

  // ── Navegação ─────────────────────────────────────────
  void _push(Widget screen, {bool reload = false}) =>
      Navigator.push(context,
              MaterialPageRoute(builder: (_) => screen))
          .then((_) {
        if (reload) { _loadPlayer(); _checkSession(); }
      });

  void _irParaSector() =>
      Navigator.push(context,
              PageRouteBuilder(
                transitionDuration: const Duration(milliseconds: 300),
                pageBuilder: (_, __, ___) => const SectorScreen(),
                transitionsBuilder: (_, a, __, c) =>
                    FadeTransition(opacity: a, child: c),
              ))
          .then((_) { _loadPlayer(); _checkSession(); });

  Future<void> _logout() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.bg2,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16)),
        title: Text('Sair da conta?',
            style: AppTheme.syne(
                size: 16,
                color: AppTheme.t1,
                weight: FontWeight.w700)),
        content: Text('Tem certeza que deseja sair?',
            style: AppTheme.inter(size: 14, color: AppTheme.t2)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: Text('Cancelar',
                  style: AppTheme.inter(color: AppTheme.t2))),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: Text('Sair',
                  style: AppTheme.inter(color: AppTheme.err))),
        ],
      ),
    );
    if (ok == true) {
      await AuthService.logout();
      if (!mounted) return;
      Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (_) => const LoginScreen()));
    }
  }

  Future<void> _restaurarSessao() async {
    setState(() => _showSession = false);
    _push(const SectorScreen(), reload: true);
  }

  Future<void> _descartarSessao() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('sessao_ativa');
    if (mounted) setState(() => _showSession = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(children: [
          _buildHeader(),
          if (_showSession) _buildSessionBanner(),
          Expanded(child: _buildCenter()),
          _buildTabBar(),
        ]),
      ),
    );
  }

  // ══ HEADER ═══════════════════════════════════════════
  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: const Color(0xD90D0F14),
        border: const Border(
            bottom: BorderSide(color: AppTheme.line)),
      ),
      child: Stack(children: [
        // Linha dourada no bottom (::after do CSS)
        Positioned(
          bottom: -14, left: 0, right: 0,
          child: Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [
                Colors.transparent,
                AppTheme.primaryBd.withOpacity(0.6),
                AppTheme.primaryBd.withOpacity(0.6),
                Colors.transparent,
              ], stops: const [0, 0.35, 0.65, 1]),
            ),
          ),
        ),
        Row(children: [
          // ── Avatar + nome ──────────────────────────
          Flexible(
            child: GestureDetector(
              onTap: () => _push(const ProfileScreen(), reload: true),
              child: Row(children: [
                _Avatar(
                    initial: _initial, photoUrl: _photoUrl),
                const SizedBox(width: 12),
                Flexible(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('GESTOR',
                          style: AppTheme.inter(
                              size: 8,
                              weight: FontWeight.w700,
                              color: AppTheme.primary
                                  .withOpacity(0.7),
                              letterSpacing: 0.18 * 8)),
                      Text('OLÁ, $_playerName',
                          style: AppTheme.syne(
                              size: 13,
                              weight: FontWeight.w800,
                              color: AppTheme.t1),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
              ]),
            ),
          ),

          const SizedBox(width: 8),

          // ── Tools ─────────────────────────────────
          Row(mainAxisSize: MainAxisSize.min, children: [
            _StatusBadge(status: _fbStatus, ping: _fbPing),
            const SizedBox(width: 6),
            _GhostBtn(
                onTap: () {},
                child: const Icon(Icons.mail_outline_rounded,
                    size: 16, color: AppTheme.t2)),
            const SizedBox(width: 6),
            _GhostBtn(
                onTap: () =>
                    _push(const GlossarioScreen()),
                child: Text('?',
                    style: AppTheme.syne(
                        size: 13,
                        weight: FontWeight.w700,
                        color: AppTheme.t2))),
            const SizedBox(width: 6),
            _GhostBtn(
                onTap: _logout,
                child: const Icon(Icons.logout_rounded,
                    size: 16, color: AppTheme.t2)),
          ]),
        ]),
      ]),
    );
  }

  // ══ SESSION BANNER ═══════════════════════════════════
  Widget _buildSessionBanner() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.bg2,
        borderRadius: BorderRadius.circular(10),
        border: Border(
          left:   BorderSide(color: AppTheme.primary, width: 3),
          top:    BorderSide(color: AppTheme.primaryBd),
          right:  BorderSide(color: AppTheme.primaryBd),
          bottom: BorderSide(color: AppTheme.primaryBd),
        ),
        boxShadow: [
          BoxShadow(
              color: AppTheme.primaryGlow, blurRadius: 20),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('↺  SESSÃO EM ABERTO',
              style: AppTheme.inter(
                  size: 9,
                  weight: FontWeight.w800,
                  color: AppTheme.primary,
                  letterSpacing: 0.14 * 9)),
          const SizedBox(height: 5),
          Text(_sessionText,
              style: AppTheme.inter(
                  size: 13, color: AppTheme.t2, height: 1.6)),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(
              child: GestureDetector(
                onTap: _restaurarSessao,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    gradient: AppTheme.goldGradient,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                          color: AppTheme.primaryGlow,
                          blurRadius: 12)
                    ],
                  ),
                  child: Center(
                    child: Text('Continuar',
                        style: AppTheme.inter(
                            size: 12,
                            weight: FontWeight.w800,
                            color: Colors.black,
                            letterSpacing: 0.06 * 12)),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: GestureDetector(
                onTap: _descartarSessao,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                        color: AppTheme.err.withOpacity(0.3)),
                  ),
                  child: Center(
                    child: Text('Descartar',
                        style: AppTheme.inter(
                            size: 12,
                            weight: FontWeight.w600,
                            color: AppTheme.err)),
                  ),
                ),
              ),
            ),
          ]),
        ],
      ),
    );
  }

  // ══ CENTER ═══════════════════════════════════════════
  Widget _buildCenter() {
    return Container(
      // Radial glow de fundo idêntico ao web
      decoration: BoxDecoration(
        gradient: RadialGradient(
          center: Alignment.center,
          radius: 0.75,
          colors: [
            AppTheme.primaryGlow.withOpacity(0.18),
            Colors.transparent,
          ],
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // "UNDER PRESSURE" acima
          Text(
            'UNDER PRESSURE',
            style: AppTheme.syne(
              size: 9,
              weight: FontWeight.w700,
              color: AppTheme.primary.withOpacity(0.45),
              letterSpacing: 0.35 * 9,
            ),
          ),
          const SizedBox(height: 18),

          // Botão circular com anéis
          GestureDetector(
            onTap: _irParaSector,
            child: AnimatedBuilder(
              animation: _ringCtrl,
              builder: (_, __) => SizedBox(
                width: 196,
                height: 196,
                child: Stack(
                    alignment: Alignment.center,
                    children: [
                  // Anel exterior
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: AppTheme.primary
                            .withOpacity(_ring1.value * 0.55),
                        width: 1.5,
                      ),
                    ),
                  ),
                  // Anel interior reverso
                  Positioned(
                    left: 12, right: 12,
                    top: 12, bottom: 12,
                    child: Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppTheme.primaryBd
                              .withOpacity(_ring2.value * 0.3),
                          width: 1,
                        ),
                      ),
                    ),
                  ),
                  // Botão principal
                  Container(
                    width: 172, height: 172,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        center: const Alignment(0, -0.3),
                        colors: [
                          Colors.white.withOpacity(0.07),
                          AppTheme.bg2,
                          Colors.black.withOpacity(0.3),
                        ],
                        stops: const [0, 0.45, 1],
                      ),
                      border: Border.all(
                          color: Colors.white.withOpacity(0.06)),
                      boxShadow: [
                        BoxShadow(
                            color: AppTheme.primaryGlow,
                            blurRadius: 50),
                        const BoxShadow(
                            color: Color(0xB3000000),
                            blurRadius: 40,
                            offset: Offset(0, 12)),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment:
                          MainAxisAlignment.center,
                      children: [
                        ShaderMask(
                          shaderCallback: (b) =>
                              AppTheme.goldGradient
                                  .createShader(b),
                          child: const Icon(
                              Icons.play_arrow_rounded,
                              size: 40,
                              color: Colors.white),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'INICIAR\nMANDATO',
                          textAlign: TextAlign.center,
                          style: AppTheme.syne(
                            size: 11,
                            weight: FontWeight.w800,
                            color: AppTheme.t2,
                            letterSpacing: 0.14 * 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ]),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ══ TAB BAR ══════════════════════════════════════════
  Widget _buildTabBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
      decoration: const BoxDecoration(
        color: Color(0xE60D0F14),
        border:
            Border(top: BorderSide(color: AppTheme.line)),
      ),
      child: Row(children: [
        Expanded(
          child: _TabBtn(
            icon: Icons.person_outline_rounded,
            label: 'Perfil',
            onTap: () =>
                _push(const ProfileScreen(), reload: true),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _TabBtn(
            icon: Icons.emoji_events_outlined,
            label: 'Pódio',
            onTap: () => _push(const PodioScreen()),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _TabBtn(
            icon: Icons.assignment_outlined,
            label: 'Histórico',
            onTap: () => _push(const HistoricoScreen()),
          ),
        ),
      ]),
    );
  }
}

// ══ WIDGETS ════════════════════════════════════════════

class _Avatar extends StatelessWidget {
  final String initial;
  final String? photoUrl;
  const _Avatar({required this.initial, this.photoUrl});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 42, height: 42,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: AppTheme.bg3,
        border: Border.all(color: AppTheme.primaryBd, width: 2),
        boxShadow: [
          BoxShadow(
              color: AppTheme.primaryGlow, blurRadius: 16),
          const BoxShadow(
              color: Color(0x80000000),
              blurRadius: 8,
              offset: Offset(0, 2)),
        ],
      ),
      child: photoUrl != null && photoUrl!.isNotEmpty
          ? ClipOval(
              child: Image.network(
              photoUrl!,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => _Initial(initial),
            ))
          : _Initial(initial),
    );
  }
}

class _Initial extends StatelessWidget {
  final String text;
  const _Initial(this.text);
  @override
  Widget build(BuildContext context) => Center(
        child: Text(text,
            style: AppTheme.syne(
                size: 16,
                weight: FontWeight.w700,
                color: AppTheme.primary)),
      );
}

class _StatusBadge extends StatelessWidget {
  final _FbStatus status;
  final int? ping;
  const _StatusBadge({required this.status, this.ping});

  Color get _dotColor {
    switch (status) {
      case _FbStatus.online:     return const Color(0xFF22C55E);
      case _FbStatus.offline:    return AppTheme.err;
      case _FbStatus.connecting: return AppTheme.t3;
    }
  }

  String get _label {
    switch (status) {
      case _FbStatus.online:     return 'Online';
      case _FbStatus.offline:    return 'Offline';
      case _FbStatus.connecting: return 'Conectando';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(99),
        border: Border.all(color: AppTheme.line),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        _Dot(color: _dotColor,
            pulse: status == _FbStatus.connecting),
        const SizedBox(width: 5),
        Text(_label,
            style: AppTheme.inter(
                size: 9,
                weight: FontWeight.w700,
                color: AppTheme.t3,
                letterSpacing: 0.1 * 9)),
        if (ping != null && status == _FbStatus.online) ...[
          const SizedBox(width: 4),
          Text('${ping}ms',
              style: AppTheme.inter(
                  size: 9, color: AppTheme.t3)),
        ],
      ]),
    );
  }
}

class _Dot extends StatefulWidget {
  final Color color;
  final bool pulse;
  const _Dot({required this.color, this.pulse = false});
  @override
  State<_Dot> createState() => _DotState();
}

class _DotState extends State<_Dot>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 1400))
      ..repeat(reverse: true);
    _anim = Tween(begin: 0.35, end: 1.0).animate(
        CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final dot = Container(
      width: 6, height: 6,
      decoration: BoxDecoration(
        color: widget.color, shape: BoxShape.circle,
        boxShadow: widget.pulse
            ? null
            : [BoxShadow(
                color: widget.color.withOpacity(0.7),
                blurRadius: 8)],
      ),
    );
    if (!widget.pulse) return dot;
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => Opacity(opacity: _anim.value, child: dot),
    );
  }
}

class _GhostBtn extends StatelessWidget {
  final VoidCallback onTap;
  final Widget child;
  const _GhostBtn({required this.onTap, required this.child});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38, height: 38,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppTheme.line2),
        ),
        child: Center(child: child),
      ),
    );
  }
}

class _TabBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _TabBtn({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(
            vertical: 11, horizontal: 6),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppTheme.line),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 15, color: AppTheme.t3),
            const SizedBox(width: 5),
            Text(label,
                style: AppTheme.inter(
                    size: 12,
                    weight: FontWeight.w600,
                    color: AppTheme.t3)),
          ],
        ),
      ),
    );
  }
}
