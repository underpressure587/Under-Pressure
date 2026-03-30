import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';

class FirestoreService {
  final _db = FirebaseFirestore.instance;

  Future<bool> isAdmin(String uid) async {
    try {
      debugPrint('[ADMIN] Verificando UID: $uid');
      final doc = await _db.collection('config').doc('admins').get();
      debugPrint('[ADMIN] Doc existe: ${doc.exists}');
      debugPrint('[ADMIN] Data: ${doc.data()}');
      final uids = List<String>.from(doc.data()?['uids'] ?? []);
      debugPrint('[ADMIN] UIDs: $uids');
      final result = uids.contains(uid);
      debugPrint('[ADMIN] É admin: $result');
      return result;
    } catch (e) {
      debugPrint('[ADMIN] ERRO: $e');
      return false;
    }
  }

  Stream<QuerySnapshot> getJogadores() =>
      _db.collection('usuarios').snapshots();

  Stream<QuerySnapshot> getPodio() =>
      _db.collection('podio').orderBy('melhorScore', descending: true).snapshots();

  Stream<QuerySnapshot> getSessoes() =>
      _db.collection('sessoes').orderBy('ts', descending: true).limit(20).snapshots();

  Stream<QuerySnapshot> getLogs() =>
      _db.collection('logs').orderBy('ts', descending: true).limit(50).snapshots();

  Future<DocumentSnapshot> getConfigGlobal() =>
      _db.collection('config').doc('global').get();

  Future<void> setManutencao(bool ativo) =>
      _db.collection('config').doc('global').update({'manutencao': ativo});

  Future<void> banirJogador(String uid, bool banido, String motivo) =>
      _db.collection('usuarios').doc(uid).update({
        'banido': banido,
        'motivoBan': banido ? motivo : '',
      });

  Future<void> removerDoPodio(String uid) =>
      _db.collection('podio').doc(uid).delete();

  Stream<QuerySnapshot> getVersoes() =>
      _db.collection('versoes').orderBy('savedAt', descending: true).snapshots();

  Future<void> salvarChangelog(String hash, String changelog, bool critica) =>
      _db.collection('versoes').doc(hash).set({
        'hash': hash,
        'changelog': changelog,
        'critica': critica,
        'savedAt': DateTime.now().toIso8601String(),
      }, SetOptions(merge: true));
}