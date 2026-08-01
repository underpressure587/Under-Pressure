import 'dart:async';
import 'firestore_service.dart';

// ═══════════════════════════════════════════════════════
//  MAINTENANCE SERVICE — espelha maintenance.js do site
//  Polling em config/global: manutencao (bool), mensagem
//  (String), liberados (lista de uids que passam direto)
// ═══════════════════════════════════════════════════════

class MaintenanceState {
  final bool manutencao;
  final String mensagem;
  final List<String> liberados;

  const MaintenanceState({
    required this.manutencao,
    required this.mensagem,
    required this.liberados,
  });

  bool bloqueiaUid(String? uid) =>
      manutencao && !(uid != null && liberados.contains(uid));
}

class MaintenanceService {
  MaintenanceService._();

  static final _controller = StreamController<MaintenanceState>.broadcast();
  static Stream<MaintenanceState> get stream => _controller.stream;

  static Timer? _timer;

  static void start() {
    _tick();
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 5), (_) => _tick());
  }

  static void stop() {
    _timer?.cancel();
    _timer = null;
  }

  static Future<void> _tick() async {
    try {
      final doc = await FirestoreService.getDoc('config/global');
      if (doc == null) return;

      final liberadosRaw = doc['liberados'];
      final liberados = liberadosRaw is List
          ? liberadosRaw.whereType<String>().toList()
          : <String>[];

      _controller.add(MaintenanceState(
        manutencao: doc['manutencao'] == true,
        mensagem: (doc['mensagem'] as String?) ?? '',
        liberados: liberados,
      ));
    } catch (_) {
      // Falha de rede: ignora, mantém o último estado conhecido
    }
  }
}
