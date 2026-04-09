import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

const _projectId = 'under-pressure-49320';
const _fsBase = 'https://firestore.googleapis.com/v1/projects/$_projectId/databases/default/documents';

class FirestoreService {
  final _rtdb = FirebaseDatabase.instance;

  Future<String> _token() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) throw Exception('Não autenticado');
    final tok = await user.getIdToken();
    if (tok == null) throw Exception('Token nulo');
    return tok;
  }

  Future<Map<String, dynamic>> _get(String path) async {
    final tok = await _token();
    final r = await http.get(Uri.parse('$_fsBase/$path'), headers: {'Authorization': 'Bearer $tok'});
    debugPrint('[FS GET] $path → ${r.statusCode}');
    if (r.statusCode < 200 || r.statusCode >= 300) throw Exception('GET $path → ${r.statusCode}: ${r.body.substring(0, r.body.length.clamp(0, 300))}');
    return jsonDecode(r.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> _patch(String path, Map<String, dynamic> fields) async {
    final tok = await _token();
    final mask = fields.keys.map((k) => 'updateMask.fieldPaths=$k').join('&');
    final r = await http.patch(Uri.parse('$_fsBase/$path?$mask'),
      headers: {'Authorization': 'Bearer $tok', 'Content-Type': 'application/json'},
      body: jsonEncode({'fields': fields}));
    debugPrint('[FS PATCH] $path → ${r.statusCode}');
    if (r.statusCode < 200 || r.statusCode >= 300) throw Exception('PATCH $path → ${r.statusCode}: ${r.body}');
    return jsonDecode(r.body) as Map<String, dynamic>;
  }

  Future<void> _delete(String path) async {
    final tok = await _token();
    final r = await http.delete(Uri.parse('$_fsBase/$path'), headers: {'Authorization': 'Bearer $tok'});
    if (r.statusCode < 200 || r.statusCode >= 300) throw Exception('DELETE $path → ${r.statusCode}');
  }

  Future<List<Map<String, dynamic>>> _query(Map<String, dynamic> body) async {
    final tok = await _token();
    final r = await http.post(Uri.parse('$_fsBase:runQuery'),
      headers: {'Authorization': 'Bearer $tok', 'Content-Type': 'application/json'},
      body: jsonEncode(body));
    debugPrint('[FS QUERY] → ${r.statusCode} body: ${r.body.substring(0, r.body.length.clamp(0, 200))}');
    if (r.statusCode < 200 || r.statusCode >= 300) throw Exception('query → ${r.statusCode}');
    return (jsonDecode(r.body) as List).cast<Map<String, dynamic>>();
  }

  Future<List<Map<String, dynamic>>> _subQuery(String docPath, Map<String, dynamic> body) async {
    final tok = await _token();
    final r = await http.post(Uri.parse('$_fsBase/$docPath:runQuery'),
      headers: {'Authorization': 'Bearer $tok', 'Content-Type': 'application/json'},
      body: jsonEncode(body));
    if (r.statusCode < 200 || r.statusCode >= 300) throw Exception('subQuery → ${r.statusCode}');
    return (jsonDecode(r.body) as List).cast<Map<String, dynamic>>();
  }

  dynamic _val(dynamic v) {
    if (v == null) return null;
    if (v['stringValue']    != null) return v['stringValue'];
    if (v['integerValue']   != null) return int.tryParse(v['integerValue'].toString()) ?? 0;
    if (v['doubleValue']    != null) return (v['doubleValue'] as num).toDouble();
    if (v['booleanValue']   != null) return v['booleanValue'] as bool;
    if (v['timestampValue'] != null) return DateTime.parse(v['timestampValue']).millisecondsSinceEpoch;
    if (v['arrayValue']     != null) return ((v['arrayValue']['values'] ?? []) as List).map(_val).toList();
    if (v['mapValue']       != null) return _parseFields(v['mapValue']['fields'] ?? {});
    return null;
  }

  Map<String, dynamic> _parseFields(Map<String, dynamic> fields) {
    final obj = <String, dynamic>{};
    fields.forEach((k, v) => obj[k] = _val(v));
    return obj;
  }

  String _uid(Map<String, dynamic> doc) => (doc['name'] as String).split('/').last;

  Map<String, dynamic> _fsStr(String v)  => {'stringValue': v};
  Map<String, dynamic> _fsBool(bool v)   => {'booleanValue': v};
  Map<String, dynamic> _fsInt(int v)     => {'integerValue': v.toString()};

  // ADMIN via Realtime Database
  Future<bool> isAdmin(String uid, {void Function(String)? onStatus}) async {
    try {
      onStatus?.call('Verificando acesso...');
      final ref = _rtdb.ref('admins/$uid');
      final snapshot = await ref.get().timeout(const Duration(seconds: 10));
      return snapshot.exists && snapshot.value == true;
    } catch (e) {
      debugPrint('[ADMIN] ERRO: $e');
      rethrow;
    }
  }

  // VISÃO GERAL
  Future<Map<String, dynamic>> getVisaoGeral() async {
    final jogadores = await _query({'structuredQuery': {'from': [{'collectionId': 'usuarios'}], 'select': {'fields': [{'fieldPath': 'melhorScore'}]}}});
    final jDocs = jogadores.where((r) => r['document'] != null).toList();
    final total = jDocs.length;
    final scores = jDocs.map((r) => ((_val((r['document']['fields'] as Map?)?.cast<String,dynamic>()?['melhorScore']) ?? 0) as num).toInt()).toList();
    final mediaScore = total > 0 ? scores.reduce((a, b) => a + b) ~/ total : 0;

    final podioRes = await _query({'structuredQuery': {'from': [{'collectionId': 'podio'}], 'select': {'fields': [{'fieldPath': 'totalJogos'}, {'fieldPath': 'ultimaPartida'}]}}});
    final podioItems = podioRes.where((r) => r['document'] != null).map((r) => _parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})).toList();
    final totalPartidas = podioItems.fold<int>(0, (acc, p) => acc + ((p['totalJogos'] as num?)?.toInt() ?? 0));
    final agora = DateTime.now().millisecondsSinceEpoch;
    final ativosDia    = podioItems.where((p) => agora - ((p['ultimaPartida'] as num?)?.toInt() ?? 0) < 86400000).length;
    final ativosSemana = podioItems.where((p) => agora - ((p['ultimaPartida'] as num?)?.toInt() ?? 0) < 604800000).length;

    return {'totalJogadores': total, 'totalPartidas': totalPartidas, 'ativosDia': ativosDia, 'ativosSemana': ativosSemana, 'mediaScore': mediaScore};
  }

  // SESSÕES
  Future<List<Map<String, dynamic>>> getSessoesAoVivo() async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'sessoes'}], 'orderBy': [{'field': {'fieldPath': 'ts'}, 'direction': 'DESCENDING'}], 'limit': 20}});
    return res.where((r) => r['document'] != null).map((r) => _parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})).toList();
  }

  // JOGADORES
  Future<List<Map<String, dynamic>>> getJogadores() async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'usuarios'}], 'select': {'fields': [{'fieldPath': 'nome'}, {'fieldPath': 'email'}, {'fieldPath': 'mandatos'}, {'fieldPath': 'melhorScore'}, {'fieldPath': 'banido'}]}}});
    return res.where((r) => r['document'] != null).map((r) {
      final uid = _uid(r['document'] as Map<String, dynamic>);
      return {'uid': uid, ..._parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})};
    }).toList();
  }

  Future<List<Map<String, dynamic>>> getHistoricoJogador(String uid) async {
    final res = await _subQuery('usuarios/$uid', {'structuredQuery': {'from': [{'collectionId': 'historico'}], 'orderBy': [{'field': {'fieldPath': 'ts'}, 'direction': 'DESCENDING'}], 'limit': 30}});
    return res.where((r) => r['document'] != null).map((r) => _parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})).toList();
  }

  Future<void> banirJogador(String uid, bool banido, String motivo) async {
    await _patch('usuarios/$uid', {'banido': _fsBool(banido), 'motivoBan': _fsStr(banido ? motivo : '')});
  }

  // PÓDIO
  Future<List<Map<String, dynamic>>> getPodio() async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'podio'}], 'select': {'fields': [{'fieldPath': 'player'}, {'fieldPath': 'melhorScore'}, {'fieldPath': 'totalJogos'}, {'fieldPath': 'ultimaPartida'}]}}});
    final items = res.where((r) => r['document'] != null).map((r) {
      final uid = _uid(r['document'] as Map<String, dynamic>);
      return {'uid': uid, ..._parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})};
    }).toList();
    items.sort((a, b) => (((b['melhorScore'] as num?)?.toInt() ?? 0) - ((a['melhorScore'] as num?)?.toInt() ?? 0)));
    return items;
  }

  Future<void> removerDoPodio(String uid) async => _delete('podio/$uid');

  // CONFIG
  Future<Map<String, dynamic>> getConfigGlobal() async {
    final doc = await _get('config/global');
    return _parseFields((doc['fields'] as Map?)?.cast<String,dynamic>() ?? {});
  }

  Future<void> setManutencao(bool ativo) async => _patch('config/global', {'manutencao': _fsBool(ativo)});
  Future<void> salvarMensagemGlobal(String msg) async => _patch('config/global', {'mensagem': _fsStr(msg)});

  // HISTÓRIAS
  Future<Map<String, dynamic>> getHistorias() async {
    try {
      final doc = await _get('config/historias');
      return _parseFields((doc['fields'] as Map?)?.cast<String,dynamic>() ?? {});
    } catch (_) { return {}; }
  }

  Future<void> toggleHistoria(String chave, bool ativa) async => _patch('config/historias', {chave: _fsBool(ativa)});

  // ADMINS
  Future<List<String>> getAdmins() async {
    final doc = await _get('config/admins');
    final uids = _val((doc['fields'] as Map?)?.cast<String,dynamic>()?['uids']) ?? [];
    return List<String>.from(uids as List);
  }

  Future<void> adicionarAdmin(String uid, List<String> uidsAtuais) async {
    final uids = [...uidsAtuais, uid];
    await _patch('config/admins', {'uids': {'arrayValue': {'values': uids.map((u) => {'stringValue': u}).toList()}}});
  }

  Future<void> removerAdmin(String uid, List<String> uidsAtuais) async {
    final uids = uidsAtuais.where((u) => u != uid).toList();
    await _patch('config/admins', {'uids': {'arrayValue': {'values': uids.map((u) => {'stringValue': u}).toList()}}});
  }

  // LOGS
  Future<List<Map<String, dynamic>>> getLogs() async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'logs'}], 'orderBy': [{'field': {'fieldPath': 'ts'}, 'direction': 'DESCENDING'}], 'limit': 50}});
    return res.where((r) => r['document'] != null).map((r) => _parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})).toList();
  }

  // AUDITORIA
  Future<List<Map<String, dynamic>>> getAuditoria() async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'auditoria'}], 'orderBy': [{'field': {'fieldPath': 'ts'}, 'direction': 'DESCENDING'}], 'limit': 20}});
    return res.where((r) => r['document'] != null).map((r) => _parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})).toList();
  }

  Future<void> registrarAuditoria(String acao) async {
    final ts = DateTime.now().millisecondsSinceEpoch;
    await _patch('auditoria/$ts', {'acao': _fsStr(acao), 'uid': _fsStr('admin'), 'ts': _fsInt(ts)});
  }

  // FEEDBACKS
  Future<List<Map<String, dynamic>>> getFeedbacks() async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'feedbacks'}], 'orderBy': [{'field': {'fieldPath': 'ts'}, 'direction': 'DESCENDING'}], 'limit': 50}});
    return res.where((r) => r['document'] != null).map((r) => _parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})).toList();
  }

  // VERSÕES
  Future<List<Map<String, dynamic>>> getVersoes() async {
    try {
      final doc = await _get('versoes');
      final documents = (doc['documents'] as List? ?? []).cast<Map<String, dynamic>>();
      return documents.map((d) => _parseFields((d['fields'] as Map?)?.cast<String,dynamic>() ?? {})).toList();
    } catch (_) { return []; }
  }

  // DASHBOARD
  Future<List<Map<String, dynamic>>> getDashboard() async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'podio'}], 'select': {'fields': [{'fieldPath': 'melhorPorSetor'}, {'fieldPath': 'totalJogos'}, {'fieldPath': 'ultimaPartida'}]}}});
    return res.where((r) => r['document'] != null).map((r) => _parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})).toList();
  }
}