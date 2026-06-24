import 'package:cloud_firestore/cloud_firestore.dart';
import 'auth_service.dart';
import '../engine/models.dart';
import '../engine/game_engine.dart';

// ═══════════════════════════════════════════════════════
//  GAME SERVICE
//  Usa as coleções existentes do projeto Firebase:
//  usuarios  → perfil do jogador
//  partidas  → resultados de cada jogo
//  config/global → manutenção e configurações
// ═══════════════════════════════════════════════════════

class GameService {
  static final _db = FirebaseFirestore.instance;

  static const _colUsers    = 'usuarios';
  static const _colPartidas = 'partidas';

  // ── Salvar partida finalizada ─────────────────────────
  static Future<String?> salvarResultado(GameResult result) async {
    final uid  = AuthService.currentUser?.uid;
    final user = AuthService.currentUser;
    if (uid == null) return null;

    final nomeJogador = user?.displayName ?? 'Jogador';
    final scoreFinal  =
        ((result.scoreEmpresa + result.scoreGestor) / 2).round();

    final data = {
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
      'criadoEm':     FieldValue.serverTimestamp(),
    };

    final ref = await _db.collection(_colPartidas).add(data);
    await _atualizarPerfil(uid, scoreFinal);
    return ref.id;
  }

  // ── Atualizar perfil ──────────────────────────────────
  static Future<void> _atualizarPerfil(String uid, int score) async {
    final ref = _db.collection(_colUsers).doc(uid);
    final doc = await ref.get();
    if (!doc.exists) return;

    final atual = (doc.data()?['melhorScore'] as num?)?.toInt() ?? 0;
    await ref.update({
      'totalJogos':  FieldValue.increment(1),
      'melhorScore': score > atual ? score : atual,
      'ultimoJogo':  FieldValue.serverTimestamp(),
    });
  }

  // ── Buscar histórico do jogador ───────────────────────
  static Future<List<Map<String, dynamic>>> buscarHistorico() async {
    final uid = AuthService.currentUser?.uid;
    if (uid == null) return [];

    final snap = await _db
        .collection(_colPartidas)
        .where('uid', isEqualTo: uid)
        .orderBy('criadoEm', descending: true)
        .limit(30)
        .get();

    return snap.docs.map((d) => d.data()).toList();
  }

  // ── Buscar pódio ──────────────────────────────────────
  static Future<List<Map<String, dynamic>>> buscarPodio({
    String? sector,
    int limit = 50,
  }) async {
    Query q = _db
        .collection(_colPartidas)
        .orderBy('score', descending: true);

    if (sector != null) {
      q = q.where('setor', isEqualTo: sector);
    }

    final snap = await q.limit(limit).get();
    return snap.docs
        .map((d) => d.data() as Map<String, dynamic>)
        .toList();
  }

  // ── Buscar perfil ─────────────────────────────────────
  static Future<Map<String, dynamic>?> buscarPerfil() async {
    return AuthService.buscarPerfil();
  }

  // ── Verificar manutenção ──────────────────────────────
  // Usa config/global que já existe nas regras do Firestore
  static Stream<bool> streamManutencao() {
    return _db
        .collection('config')
        .doc('global')
        .snapshots()
        .map((s) => s.data()?['manutencao'] == true);
  }
}
