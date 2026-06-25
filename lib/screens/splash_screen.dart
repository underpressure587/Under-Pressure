import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../theme/app_theme.dart';
import 'login_screen.dart';
import 'home_screen.dart';
import 'manutencao_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {

  // Logo pulse
  late AnimationController _pulseCtrl;
  late Animation<double>   _pulseScale;
  late Animation<double>   _pulseGlow;

  // Mini-bars (5 barras como no web)
  late List<AnimationController> _barCtrls;
  late List<Animation<double>>   _barHeights;

  // Barra de progresso
  double _progress = 0;
  String _msg = 'Carregando...';

  @override
  void initState() {
    super.initState();

    // ── Logo pulse ───────────────────────────────────
    _pulseCtrl = AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 2200))
      ..repeat(reverse: true);
    _pulseScale = Tween(begin: 1.0, end: 1.06).animate(
        CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut));
    _pulseGlow = Tween(begin: 18.0, end: 30.0).animate(
        CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut));

    // ── Mini-bars com delays escalonados ─────────────
    final delays = [0, 120, 240, 360, 480];
    _barCtrls = List.generate(5, (i) {
      final ctrl = AnimationController(
          vsync: this,
          duration: const Duration(milliseconds: 1100));
      Future.delayed(Duration(milliseconds: delays[i]), () {
        if (mounted) ctrl.repeat(reverse: true);
      });
      return ctrl;
    });
    _barHeights = _barCtrls
        .map((c) => Tween(begin: 8.0, end: 28.0)
            .animate(CurvedAnimation(parent: c, curve: Curves.easeInOut)))
        .toList();

    _runLoading();
  }

  Future<void> _runLoading() async {
    // Progresso animado
    final steps = [
      (0.3,  300,  'Iniciando Firebase...'),
      (0.6,  400,  'Verificando sessão...'),
      (0.85, 300,  'Preparando mandato...'),
      (1.0,  200,  'Pronto!'),
    ];

    for (final s in steps) {
      await Future.delayed(Duration(milliseconds: s.$2));
      if (mounted) setState(() { _progress = s.$1; _msg = s.$3; });
    }

    await Future.delayed(const Duration(milliseconds: 300));
    if (!mounted) return;

    // Verificar manutenção e sessão
    Widget destino;
    try {
      final uid = FirebaseAuth.instance.currentUser?.uid;
      final doc = await FirebaseFirestore.instance
          .collection('config').doc('global').get();
      final manut    = doc.data()?['manutencao'] == true;
      final liberados = (doc.data()?['liberados'] as List?)
          ?.map((e) => e.toString()).toList() ?? [];
      final liberado = uid != null && liberados.contains(uid);

      if (manut && !liberado) {
        destino = const ManutencaoScreen();
      } else {
        final user = FirebaseAuth.instance.currentUser;
        final isReturn = user != null;
        destino = isReturn
            ? const HomeScreen()
            : const LoginScreen();
      }
    } catch (_) {
      final user = FirebaseAuth.instance.currentUser;
      destino = user != null ? const HomeScreen() : const LoginScreen();
    }

    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 400),
        pageBuilder: (_, __, ___) => destino,
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
      ),
    );
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    for (final c in _barCtrls) c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // ── Logo pulsante ─────────────────────────
            AnimatedBuilder(
              animation: Listenable.merge([_pulseScale, _pulseGlow]),
              builder: (_, __) => Transform.scale(
                scale: _pulseScale.value,
                child: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primary.withOpacity(0.5),
                        blurRadius: _pulseGlow.value,
                        spreadRadius: 4,
                      ),
                    ],
                  ),
                  child: ClipOval(
                    child: Image.asset(
                      'assets/logo.jpg',
                      width: 88,
                      height: 88,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // ── Título ────────────────────────────────
            Text(
              'UNDER PRESSURE',
              style: AppTheme.syne(
                size: 18,
                weight: FontWeight.w800,
                color: AppTheme.t1,
                letterSpacing: 0.08 * 18,
              ),
            ),
            const SizedBox(height: 20),

            // ── Mini-bars (5 barras animadas) ─────────
            SizedBox(
              height: 32,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: List.generate(5, (i) {
                  return AnimatedBuilder(
                    animation: _barHeights[i],
                    builder: (_, __) => Container(
                      width: 5,
                      height: _barHeights[i].value,
                      margin: const EdgeInsets.symmetric(horizontal: 2.5),
                      decoration: BoxDecoration(
                        gradient: AppTheme.goldGradient,
                        borderRadius: BorderRadius.circular(3),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary.withOpacity(0.4),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ),
            ),
            const SizedBox(height: 20),

            // ── Barra de progresso ────────────────────
            SizedBox(
              width: 200,
              child: Column(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(3),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 450),
                      curve: Curves.easeInOut,
                      width: 200 * _progress,
                      height: 3,
                      decoration: BoxDecoration(
                        gradient: AppTheme.goldGradient,
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary.withOpacity(0.4),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                    ),
                  ),
                  // Track
                ],
              ),
            ),
            const SizedBox(height: 8),

            // ── Mensagem ──────────────────────────────
            Text(
              _msg,
              style: AppTheme.inter(
                size: 11,
                color: AppTheme.t3,
                letterSpacing: 0.02 * 11,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
