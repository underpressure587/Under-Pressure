import 'package:cloud_firestore/cloud_firestore.dart';
import '../services/auth_service.dart';
import '../engine/models.dart';
import '../engine/game_engine.dart';

// ═══════════════════════════════════════════════════════
//  GAME SERVICE
//  Salva/carrega estado e resultados no Firestore
//  Espelha a estrutura de coleções do jogo web
// ═══════════════════════════════════════════════════════

class GameService {
  static final _db = FirebaseFirestore.instance;

  // ── Salvar partida finalizada ─────────────────────────
  static Future<String?> salvarResultado(GameResult result) async {
    final uid  = AuthService.currentUser?.uid;
    final user = AuthService.currentUser;
    if (uid == null) return null;

    final nomeJogador = user?.displayName ?? 'Jogador';
    final scoreFinal  = ((result.scoreEmpresa + result.scoreGestor) / 2).round();

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

    final ref = await _db.collection('games').add(data);

    // Atualiza perfil do jogador
    await _atualizarPerfil(uid, scoreFinal);

    return ref.id;
  }

  // ── Atualizar perfil do jogador ───────────────────────
  static Future<void> _atualizarPerfil(String uid, int score) async {
    final ref = _db.collection('players').doc(uid);
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
        .collection('games')
        .where('uid', isEqualTo: uid)
        .orderBy('criadoEm', descending: true)
        .limit(30)
        .get();

    return snap.docs.map((d) => d.data()).toList();
  }

  // ── Buscar pódio geral ────────────────────────────────
  static Future<List<Map<String, dynamic>>> buscarPodio({
    String? sector,
    int limit = 50,
  }) async {
    Query q = _db.collection('games').orderBy('score', descending: true);

    if (sector != null) {
      q = q.where('setor', isEqualTo: sector);
    }

    final snap = await q.limit(limit).get();
    return snap.docs.map((d) => d.data() as Map<String, dynamic>).toList();
  }

  // ── Buscar dados do jogador ───────────────────────────
  static Future<Map<String, dynamic>?> buscarPerfil() async {
    final uid = AuthService.currentUser?.uid;
    if (uid == null) return null;

    final doc = await _db.collection('players').doc(uid).get();
    return doc.exists ? doc.data() : null;
  }

  // ── Verificar manutenção ──────────────────────────────
  static Stream<bool> streamManutencao() {
    return _db
        .collection('config')
        .doc('manutencao')
        .snapshots()
        .map((s) => s.data()?['ativo'] == true);
  }
}
