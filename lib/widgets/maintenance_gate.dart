import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/maintenance_service.dart';
import '../screens/manutencao_screen.dart';

// ═══════════════════════════════════════════════════════
//  MAINTENANCE GATE — envolve o app inteiro (via
//  MaterialApp.builder). Mostra a tela de manutenção já
//  existente (ManutencaoScreen) por cima de qualquer tela
//  quando `manutencao` está ativa no Firestore, em tempo
//  real (polling a cada 5s) — exceto para uids na lista
//  `liberados`.
// ═══════════════════════════════════════════════════════

class MaintenanceGate extends StatefulWidget {
  final Widget child;
  const MaintenanceGate({super.key, required this.child});

  @override
  State<MaintenanceGate> createState() => _MaintenanceGateState();
}

class _MaintenanceGateState extends State<MaintenanceGate> {
  MaintenanceState? _estado;

  @override
  void initState() {
    super.initState();
    MaintenanceService.start();
    MaintenanceService.stream.listen((s) {
      if (mounted) setState(() => _estado = s);
    });
  }

  @override
  void dispose() {
    MaintenanceService.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final uid = AuthService.currentUser?.uid;
    final bloqueado = _estado?.bloqueiaUid(uid) ?? false;

    return Stack(
      children: [
        widget.child,
        if (bloqueado)
          const Positioned.fill(child: ManutencaoScreen()),
      ],
    );
  }
}
