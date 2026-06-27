import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
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

  late AnimationController _pulseCtrl;
  late Animation<double>   _pulseScale;
  late Animation<double>   _pulseGlow;
  late List<AnimationController> _barCtrls;
  late List<Animation<double>>   _barHeights;

  double _progress  = 0;
  String _msg       = 'Iniciando...';
  bool   _erro      = false;
  String _erroTitulo = '';
  String _erroDesc  = '';
  bool   _tentando  = false;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _runChecks();
  }

  void _setupAnimations() {
    _pulseCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 2200))
      ..repeat(reverse: true);
    _pulseScale = Tween(begin: 1.0, end: 1.06).animate(
        CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut));
    _pulseGlow  = Tween(begin: 18.0, end: 30.0).animate(
        CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut));

    final delays = [0, 120, 240, 360, 480];
    _barCtrls = List.generate(5, (i) {
      final ctrl = AnimationController(
          vsync: this, duration: const Duration(milliseconds: 1100));
      Future.delayed(Duration(milliseconds: delays[i]), () {
        if (mounted) ctrl.repeat(reverse: true);
      });
      return ctrl;
    });
    _barHeights = _barCtrls
        .map((c) => Tween(begin: 8.0, end: 28.0)
            .animate(CurvedAnimation(parent: c, curve: Curves.easeInOut)))
        .toList();
  }

  Future<void> _runChecks() async {
    if (mounted) setState(() { _erro = false; _tentando = true; });

    // Passo 1: Firebase Core
    _setMsg('Verificando Firebase...', 0.15);
    await Future.delayed(const Duration(milliseconds: 400));

    try {
      if (Firebase.apps.isEmpty) {
        _setErro('Firebase não inicializado', 'Firebase.apps está vazio.');
        return;
      }
    } catch (e) {
      _setErro('Erro ao inicializar', 'STEP1: ${e.runtimeType}: $e');
      return;
    }

    // Passo 2: Firestore
    _setMsg('Verificando conexão...', 0.35);
    await Future.delayed(const Duration(milliseconds: 300));

    try {
      await FirebaseFirestore.instance
          .collection('config')
          .doc('global')
          .get()
          .timeout(
            const Duration(seconds: 8),
            onTimeout: () => throw Exception('timeout'),
          );
    } on FirebaseException catch (e) {
      // Mostra o código real em vez de esconder
      if (e.code == 'unavailable' || e.code == 'network-request-failed') {
        _setErro(
          'Sem conexão [${e.code}]',
          'STEP2 FirebaseException\ncode: ${e.code}\nmsg: ${e.message}',
        );
        return;
      }
      // permission-denied e outros — agora mostra em vez de ignorar
      _setErro(
        'Erro Firestore [${e.code}]',
        'STEP2 FirebaseException\ncode: ${e.code}\nmsg: ${e.message}',
      );
      return;
    } catch (e) {
      _setErro(
        'Erro conexão',
        'STEP2 ${e.runtimeType}: $e',
      );
      return;
    }

    // Passo 3: Auth
    _setMsg('Verificando autenticação...', 0.55);
    await Future.delayed(const Duration(milliseconds: 300));

    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user != null) {
        await user.reload().timeout(
          const Duration(seconds: 6),
          onTimeout: () => throw Exception('auth_timeout'),
        );
      }
    } on FirebaseAuthException catch (e) {
      if (e.code == 'network-request-failed') {
        _setErro('Sem conexão [auth]', 'STEP3: ${e.code}: ${e.message}');
        return;
      }
      await FirebaseAuth.instance.signOut();
    } catch (_) {}

    // Passo 4: Manutenção
    _setMsg('Verificando status do servidor...', 0.75);
    await Future.delayed(const Duration(milliseconds: 300));

    Widget destino;
    try {
      final uid = FirebaseAuth.instance.currentUser?.uid;
      final doc = await FirebaseFirestore.instance
          .collection('config')
          .doc('global')
          .get()
          .timeout(const Duration(seconds: 5));

      final manut     = doc.data()?['manutencao'] == true;
      final liberados = (doc.data()?['liberados'] as List?)
          ?.map((e) => e.toString()).toList() ?? [];
      final liberado  = uid != null && liberados.contains(uid);

      if (manut && !liberado) {
        destino = const ManutencaoScreen();
      } else {
        destino = FirebaseAuth.instance.currentUser != null
            ? const HomeScreen()
            : const LoginScreen();
      }
    } catch (_) {
      destino = FirebaseAuth.instance.currentUser != null
          ? const HomeScreen()
          : const LoginScreen();
    }

    _setMsg('Pronto!', 1.0);
    await Future.delayed(const Duration(milliseconds: 350));

    if (!mounted) return;
    setState(() => _tentando = false);

    await Future.delayed(const Duration(milliseconds: 200));
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

  void _setMsg(String msg, double progress) {
    if (!mounted) return;
    setState(() { _msg = msg; _progress = progress; });
  }

  void _setErro(String titulo, String desc) {
    if (!mounted) return;
    setState(() {
      _erro       = true;
      _tentando   = false;
      _erroTitulo = titulo;
      _erroDesc   = desc;
    });
  }

  void _tentar() {
    setState(() { _progress = 0; _msg = 'Tentando novamente...'; });
    _runChecks();
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
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          child: _erro ? _buildError() : _buildLoading(),
        ),
      ),
    );
  }

  Widget _buildLoading() {
    return Column(
      key: const ValueKey('loading'),
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        AnimatedBuilder(
          animation: Listenable.merge([_pulseScale, _pulseGlow]),
          builder: (_, __) => Transform.scale(
            scale: _pulseScale.value,
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(
                  color: AppTheme.primary.withOpacity(0.5),
                  blurRadius: _pulseGlow.value,
                  spreadRadius: 4,
                )],
              ),
              child: ClipOval(
                child: Image.asset(
                  'assets/logo.jpg',
                  width: 88, height: 88,
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        Text('UNDER PRESSURE',
            style: AppTheme.syne(
                size: 18,
                weight: FontWeight.w800,
                color: AppTheme.t1,
                letterSpacing: 0.08 * 18)),
        const SizedBox(height: 20),
        SizedBox(
          height: 32,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(5, (i) => AnimatedBuilder(
              animation: _barHeights[i],
              builder: (_, __) => Container(
                width: 5,
                height: _barHeights[i].value,
                margin: const EdgeInsets.symmetric(horizontal: 2.5),
                decoration: BoxDecoration(
                  gradient: AppTheme.goldGradient,
                  borderRadius: BorderRadius.circular(3),
                  boxShadow: [BoxShadow(
                    color: AppTheme.primary.withOpacity(0.4),
                    blurRadius: 8,
                  )],
                ),
              ),
            )),
          ),
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: 220,
          child: Container(
            height: 3,
            decoration: BoxDecoration(
              color: AppTheme.bg3,
              borderRadius: BorderRadius.circular(3),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: AnimatedFractionallySizedBox(
                duration: const Duration(milliseconds: 450),
                curve: Curves.easeInOut,
                widthFactor: _progress,
                alignment: Alignment.centerLeft,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: AppTheme.goldGradient,
                    borderRadius: BorderRadius.circular(3),
                    boxShadow: [BoxShadow(
                      color: AppTheme.primary.withOpacity(0.4),
                      blurRadius: 8,
                    )],
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 10),
        Text(_msg,
            style: AppTheme.inter(
                size: 11,
                color: AppTheme.t3,
                letterSpacing: 0.02 * 11)),
      ],
    );
  }

  Widget _buildError() {
    return Padding(
      key: const ValueKey('error'),
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72, height: 72,
            decoration: BoxDecoration(
              color: AppTheme.err.withOpacity(0.08),
              shape: BoxShape.circle,
              border: Border.all(
                  color: AppTheme.err.withOpacity(0.3), width: 1.5),
            ),
            child: const Icon(Icons.wifi_off_rounded,
                color: AppTheme.err, size: 30),
          ),
          const SizedBox(height: 20),
          ClipOval(
            child: Image.asset(
              'assets/logo.jpg',
              width: 44, height: 44, fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 16),
          Text(_erroTitulo,
              textAlign: TextAlign.center,
              style: AppTheme.syne(
                  size: 16,
                  weight: FontWeight.w800,
                  color: AppTheme.t1)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.bg2,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppTheme.line2),
            ),
            child: Text(
              _erroDesc,
              textAlign: TextAlign.left,
              style: AppTheme.inter(
                  size: 12, color: AppTheme.t2, height: 1.65),
            ),
          ),
          const SizedBox(height: 28),
          GestureDetector(
            onTap: _tentando ? null : _tentar,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: double.infinity,
              height: 52,
              decoration: BoxDecoration(
                gradient: _tentando ? null : AppTheme.goldGradient,
                color: _tentando ? AppTheme.bg3 : null,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Center(
                child: Text(
                  _tentando ? 'Verificando...' : 'Tentar novamente',
                  style: AppTheme.syne(
                      size: 14,
                      weight: FontWeight.w700,
                      color: _tentando ? AppTheme.t3 : Colors.black),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
