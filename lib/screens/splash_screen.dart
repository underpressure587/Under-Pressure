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
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 800));
    _fade = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _ctrl.forward();
    _check();
  }

  Future<void> _check() async {
    await Future.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;

    // Verificar modo manutenção
    Widget destino;
    try {
      final uid  = FirebaseAuth.instance.currentUser?.uid;
      final doc  = await FirebaseFirestore.instance
          .collection('config')
          .doc('global')
          .get();
      final ativo = doc.data()?['manutencao'] == true;
      final liberados = (doc.data()?['liberados'] as List?)
          ?.map((e) => e.toString())
          .toList() ?? [];
      final liberado = uid != null && liberados.contains(uid);

      if (ativo && !liberado) {
        destino = const ManutencaoScreen();
      } else {
        final user = FirebaseAuth.instance.currentUser;
        destino = user != null ? const HomeScreen() : const LoginScreen();
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
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: FadeTransition(
        opacity: _fade,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo estrela
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  gradient: AppTheme.goldGradient,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryGlow,
                      blurRadius: 32,
                      spreadRadius: 4,
                    )
                  ],
                ),
                child: const Icon(Icons.star_rounded,
                    color: Colors.black, size: 36),
              ),
              const SizedBox(height: 20),
              Text('Under Pressure',
                  style: AppTheme.syne(
                      size: 22, weight: FontWeight.w800, color: AppTheme.t1)),
              const SizedBox(height: 6),
              Text('Simulação Executiva · Beta',
                  style: AppTheme.inter(size: 12, color: AppTheme.t3)),
              const SizedBox(height: 48),
              // Loading bar
              SizedBox(
                width: 120,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(99),
                  child: const LinearProgressIndicator(
                    backgroundColor: AppTheme.bg3,
                    color: AppTheme.primary,
                    minHeight: 3,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
