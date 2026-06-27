import 'firestore_service.dart';
import 'auth_service.dart';
import '../engine/game_engine.dart';

class GameService {
  // ── Salvar partida finalizada ─────────────────────────
  static Future<String?> salvarResultado(GameResult result) async {
    final uid  = AuthService.currentUser?.uid;
    final user = AuthService.currentUser;
    if (uid == null) return null;

    final nomeJogador = user?.displayName ?? 'Jogador';
    final scoreFinal  =
        ((result.scoreEmpresa + result.scoreGestor) / 2).round();

    final id = await FirestoreService.addDoc('partidas', {
      'uid':          uid,
      'nomeJogador':  nomeJogador,
      'nomeEmpresa':  result.companyName,
      'setor':        result.sector,
      'scoreEmpresa': result.scoreEmpresa,
      'scoreGestor':  result.scoreGestor,
      'score':        scoreFinal,
      'motivo':       result.motivo,
      'indicadores':  result.indicators,
      'gestor':       result.gestor.toMap(),
      'totalRodadas': result.history.length,
      'criadoEm':     DateTime.now().toIso8601String(),
    });

    await _atualizarPerfil(uid, scoreFinal);
    return id;
  }

  // ── Atualizar perfil ──────────────────────────────────
  static Future<void> _atualizarPerfil(String uid, int score) async {
    final data = await FirestoreService.getDoc('usuarios/$uid');
    if (data == null) return;

    final atual      = (data['melhorScore'] as num?)?.toInt() ?? 0;
    final totalJogos = ((data['totalJogos'] as num?)?.toInt() ?? 0) + 1;

    await FirestoreService.setDoc('usuarios/$uid', {
      'totalJogos':  totalJogos,
      'melhorScore': score > atual ? score : atual,
      'ultimoJogo':  DateTime.now().toIso8601String(),
    });
  }

  // ── Buscar histórico ──────────────────────────────────
  static Future<List<Map<String, dynamic>>> buscarHistorico() async {
    final uid = AuthService.currentUser?.uid;
    if (uid == null) return [];
    return FirestoreService.query('partidas',
        whereField: 'uid', whereValue: uid,
        orderBy: 'criadoEm', descending: true, limit: 30);
  }

  // ── Buscar pódio ──────────────────────────────────────
  static Future<List<Map<String, dynamic>>> buscarPodio({
    String? sector, int limit = 50,
  }) async {
    return FirestoreService.query('partidas',
        whereField: sector != null ? 'setor' : null,
        whereValue: sector,
        orderBy: 'score', descending: true, limit: limit);
  }

  // ── Buscar perfil ─────────────────────────────────────
  static Future<Map<String, dynamic>?> buscarPerfil() async =>
      AuthService.buscarPerfil();
}
