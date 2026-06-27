import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import 'login_screen.dart';
import 'sector_screen.dart';
import 'profile_screen.dart';
import 'podio_screen.dart';
import 'historico_screen.dart';
import 'glossario_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Map<String, dynamic>? _playerData;

  @override
  void initState() {
    super.initState();
    _loadPlayer();
  }

  Future<void> _loadPlayer() async {
    final user = AuthService.currentUser;
    if (user == null) return;
    final uid = user.uid;

    var data = await FirestoreService.getDoc('usuarios/$uid');

    // Perfil não existe — cria agora com token fresco
    if (data == null) {
      final token = await user.getIdToken(true);
      if (token != null) {
        final nome = user.isAnonymous
            ? 'Convidado'
            : (user.displayName ?? user.email ?? 'Jogador');
        await FirestoreService.setDocWithToken(
          'usuarios/$uid',
          {
            'nome':        nome,
            'email':       user.email ?? '',
            'fotoUrl':     user.photoURL ?? '',
            'totalJogos':  0,
            'melhorScore': 0,
            'criadoEm':    DateTime.now().toIso8601String(),
          },
          token,
        );
        data = await FirestoreService.getDoc('usuarios/$uid');
      }
    }

    if (mounted && data != null) {
      setState(() => _playerData = data);
    }
  }

  String get _playerName {
    final user = AuthService.currentUser;
    if (_playerData?['nome'] != null) return _playerData!['nome'];
    if (user?.displayName != null) return user!.displayName!;
    if (user?.isAnonymous == true) return 'Convidado';
    return 'JOGADOR';
  }

  String get _playerInitial {
    final n = _playerName;
    return n.isNotEmpty ? n[0].toUpperCase() : '?';
  }

  Future<void> _logout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.bg2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Sair da conta?',
            style: AppTheme.syne(size: 16, color: AppTheme.t1)),
        content: Text('Tem certeza que deseja sair?',
            style: AppTheme.inter(size: 14, color: AppTheme.t2)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: Text('Cancelar', style: AppTheme.inter(color: AppTheme.t2))),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: Text('Sair', style: AppTheme.inter(color: AppTheme.err))),
        ],
      ),
    );
    if (confirm == true) {
      await AuthService.logout();
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  void _irParaSector() {
    Navigator.push(
      context,
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 300),
        pageBuilder: (_, __, ___) => const SectorScreen(),
        transitionsBuilder: (_, anim, __, child) => SlideTransition(
          position: Tween(begin: const Offset(0, 1), end: Offset.zero)
              .animate(CurvedAnimation(parent: anim, curve: Curves.easeOut)),
          child: child,
        ),
      ),
    ).then((_) => _loadPlayer());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(
          children: [
            _Header(
              playerName: _playerName,
              playerInitial: _playerInitial,
              photoUrl: _playerData?['fotoUrl'],
              onProfile: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const ProfileScreen()))
                  .then((_) => _loadPlayer()),
              onLogout: _logout,
            ),
            Expanded(child: Center(child: _StartButton(onTap: _irParaSector))),
            _BottomBar(
              onPerfil: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const ProfileScreen()))
                  .then((_) => _loadPlayer()),
              onPodio: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const PodioScreen())),
              onHistorico: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const HistoricoScreen())),
              onGlossario: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const GlossarioScreen())),
            ),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final String playerName;
  final String playerInitial;
  final String? photoUrl;
  final VoidCallback onProfile;
  final VoidCallback onLogout;

  const _Header({
    required this.playerName,
    required this.playerInitial,
    this.photoUrl,
    required this.onProfile,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AppTheme.line))),
      child: Row(
        children: [
          GestureDetector(
            onTap: onProfile,
            child: Row(
              children: [
                _Avatar(initial: playerInitial, photoUrl: photoUrl),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Gestor', style: AppTheme.inter(size: 10, color: AppTheme.t3)),
                    Text(playerName.toUpperCase(),
                        style: AppTheme.syne(size: 13, weight: FontWeight.w700, color: AppTheme.t1)),
                  ],
                ),
              ],
            ),
          ),
          const Spacer(),
          _IconBtn(icon: Icons.logout_rounded, onTap: onLogout),
        ],
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  final String initial;
  final String? photoUrl;
  const _Avatar({required this.initial, this.photoUrl});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36, height: 36,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: AppTheme.goldGradient,
        border: Border.all(color: AppTheme.primaryBd, width: 1.5),
      ),
      child: photoUrl != null && photoUrl!.isNotEmpty
          ? ClipOval(
              child: Image.network(photoUrl!, fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Center(
                      child: Text(initial,
                          style: AppTheme.syne(size: 14, weight: FontWeight.w700, color: Colors.black)))),
            )
          : Center(
              child: Text(initial,
                  style: AppTheme.syne(size: 14, weight: FontWeight.w700, color: Colors.black))),
    );
  }
}

class _IconBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _IconBtn({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36, height: 36,
        decoration: BoxDecoration(
          color: AppTheme.bg3,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppTheme.line2),
        ),
        child: Icon(icon, size: 16, color: AppTheme.t2),
      ),
    );
  }
}

class _StartButton extends StatefulWidget {
  final VoidCallback onTap;
  const _StartButton({required this.onTap});

  @override
  State<_StartButton> createState() => _StartButtonState();
}

class _StartButtonState extends State<_StartButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulse;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1800))
      ..repeat(reverse: true);
    _scale = Tween(begin: 1.0, end: 1.04)
        .animate(CurvedAnimation(parent: _pulse, curve: Curves.easeInOut));
  }

  @override
  void dispose() { _pulse.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scale,
      child: GestureDetector(
        onTap: widget.onTap,
        child: Container(
          width: 140, height: 140,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppTheme.goldGradient,
            boxShadow: [BoxShadow(color: AppTheme.primaryGlow, blurRadius: 48, spreadRadius: 8)],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.play_arrow_rounded, color: Colors.black, size: 40),
              const SizedBox(height: 2),
              Text('Iniciar', style: AppTheme.syne(size: 13, weight: FontWeight.w700, color: Colors.black)),
              Text('Mandato', style: AppTheme.syne(size: 13, weight: FontWeight.w700, color: Colors.black)),
            ],
          ),
        ),
      ),
    );
  }
}

class _BottomBar extends StatelessWidget {
  final VoidCallback onPerfil, onPodio, onHistorico, onGlossario;
  const _BottomBar({
    required this.onPerfil, required this.onPodio,
    required this.onHistorico, required this.onGlossario,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(0, 8, 0, 8),
      decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppTheme.line))),
      child: Row(children: [
        Expanded(child: _BarBtn(icon: Icons.person_outline_rounded, label: 'Perfil', onTap: onPerfil)),
        Expanded(child: _BarBtn(icon: Icons.emoji_events_outlined, label: 'Pódio', onTap: onPodio)),
        Expanded(child: Center(child: Text('UP', style: AppTheme.syne(size: 11, weight: FontWeight.w800, color: AppTheme.t3, letterSpacing: 1)))),
        Expanded(child: _BarBtn(icon: Icons.assignment_outlined, label: 'Histórico', onTap: onHistorico)),
        Expanded(child: _BarBtn(icon: Icons.menu_book_rounded, label: 'Glossário', onTap: onGlossario)),
      ]),
    );
  }
}

class _BarBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _BarBtn({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18, color: AppTheme.t3),
            const SizedBox(height: 3),
            Text(label, style: AppTheme.inter(size: 10, color: AppTheme.t3)),
          ],
        ),
      ),
    );
  }
}
