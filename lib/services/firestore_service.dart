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
    if (r.statusCode < 200 || r.statusCode >= 300) throw Exception('GET $path -> ${r.statusCode}');
    return jsonDecode(r.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> _patch(String path, Map<String, dynamic> fields) async {
    final tok = await _token();
    final mask = fields.keys.map((k) => 'updateMask.fieldPaths=$k').join('&');
    final r = await http.patch(Uri.parse('$_fsBase/$path?$mask'),
      headers: {'Authorization': 'Bearer $tok', 'Content-Type': 'application/json'},
      body: jsonEncode({'fields': fields}));
    if (r.statusCode < 200 || r.statusCode >= 300) throw Exception('PATCH $path -> ${r.statusCode}: ${r.body}');
    return jsonDecode(r.body) as Map<String, dynamic>;
  }

  Future<void> _delete(String path) async {
    final tok = await _token();
    final r = await http.delete(Uri.parse('$_fsBase/$path'), headers: {'Authorization': 'Bearer $tok'});
    if (r.statusCode < 200 || r.statusCode >= 300) throw Exception('DELETE $path -> ${r.statusCode}');
  }

  Future<List<Map<String, dynamic>>> _query(Map<String, dynamic> body) async {
    final tok = await _token();
    final r = await http.post(Uri.parse('$_fsBase:runQuery'),
      headers: {'Authorization': 'Bearer $tok', 'Content-Type': 'application/json'},
      body: jsonEncode(body));
    if (r.statusCode < 200 || r.statusCode >= 300) throw Exception('query -> ${r.statusCode}');
    return (jsonDecode(r.body) as List).cast<Map<String, dynamic>>();
  }

  Future<List<Map<String, dynamic>>> _subQuery(String docPath, Map<String, dynamic> body) async {
    final tok = await _token();
    final r = await http.post(Uri.parse('$_fsBase/$docPath:runQuery'),
      headers: {'Authorization': 'Bearer $tok', 'Content-Type': 'application/json'},
      body: jsonEncode(body));
    if (r.statusCode < 200 || r.statusCode >= 300) throw Exception('subQuery -> ${r.statusCode}');
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

  // ADMIN — espelha admin.js: config/admins no RTDB com fallback Firestore
  Future<bool> isAdmin(String uid, {void Function(String)? onStatus}) async {
    try {
      onStatus?.call('Verificando via Realtime Database...');
      final snapshot = await _rtdb.ref('config/admins').get().timeout(const Duration(seconds: 10));
      if (snapshot.exists && snapshot.value != null) {
        final data = Map<String, dynamic>.from(snapshot.value as Map);
        final uids = data['uids'];
        final owner = data['owner'] as String? ?? '';
        final uidsList = uids is List ? List<String>.from(uids.whereType<String>()) : <String>[];
        final isAdm = uidsList.contains(uid) || uid == owner;
        onStatus?.call('RTDB OK. Admin: $isAdm');
        return isAdm;
      }
      onStatus?.call('RTDB vazio — tentando Firestore...');
    } catch (e) {
      onStatus?.call('RTDB falhou: $e');
    }
    try {
      final doc = await _get('config/admins');
      final fields = _parseFields((doc['fields'] as Map?)?.cast<String, dynamic>() ?? {});
      final uids = ((fields['uids'] as List?) ?? []).whereType<String>().toList();
      final owner = fields['owner'] as String? ?? '';
      final isAdm = uids.contains(uid) || uid == owner;
      onStatus?.call('Firestore OK. Admin: $isAdm');
      return isAdm;
    } catch (e) {
      onStatus?.call('Firestore falhou: $e');
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

  // SESSOES — usa RTDB presence/ (igual ao site)
  Stream<List<Map<String, dynamic>>> getSessoesStream() {
    return _rtdb.ref('presence').onValue.map((event) {
      final data = event.snapshot.value;
      if (data == null) return [];
      final map = Map<String, dynamic>.from(data as Map);
      final list = map.values.map((v) => Map<String, dynamic>.from(v as Map)).toList();
      list.sort((a, b) => ((b['ts'] as num?)?.toInt() ?? 0) - ((a['ts'] as num?)?.toInt() ?? 0));
      return list;
    });
  }

  Future<List<Map<String, dynamic>>> getSessoesAoVivo() async {
    try {
      final snapshot = await _rtdb.ref('presence').get().timeout(const Duration(seconds: 10));
      if (snapshot.exists && snapshot.value != null) {
        final map = Map<String, dynamic>.from(snapshot.value as Map);
        final list = map.values.map((v) => Map<String, dynamic>.from(v as Map)).toList();
        list.sort((a, b) => ((b['ts'] as num?)?.toInt() ?? 0) - ((a['ts'] as num?)?.toInt() ?? 0));
        return list;
      }
      return [];
    } catch (_) {
      final res = await _query({'structuredQuery': {'from': [{'collectionId': 'sessoes'}], 'orderBy': [{'field': {'fieldPath': 'ts'}, 'direction': 'DESCENDING'}], 'limit': 20}});
      return res.where((r) => r['document'] != null).map((r) => _parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})).toList();
    }
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
    List<Map<String, dynamic>> banHistory = [];
    try {
      final docAtual = await _get('usuarios/$uid');
      final hist = _val((docAtual['fields'] as Map?)?.cast<String,dynamic>()?['banHistory']);
      if (hist is List) banHistory = hist.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
    } catch (_) {}

    banHistory.add({'tipo': banido ? 'ban' : 'unban', 'motivo': banido ? motivo : '', 'ts': DateTime.now().millisecondsSinceEpoch});
    final tok = await _token();
    final fields = <String, dynamic>{
      'banido':    _fsBool(banido),
      'motivoBan': _fsStr(banido ? motivo : ''),
      'banHistory': {'arrayValue': {'values': banHistory.map((e) => {'mapValue': {'fields': {
        'tipo':   _fsStr(e['tipo'] as String? ?? ''),
        'motivo': _fsStr(e['motivo'] as String? ?? ''),
        'ts':     _fsInt((e['ts'] as num? ?? 0).toInt()),
      }}}).toList()}},
    };
    final mask = fields.keys.map((k) => 'updateMask.fieldPaths=$k').join('&');
    final r = await http.patch(Uri.parse('$_fsBase/usuarios/$uid?$mask'),
      headers: {'Authorization': 'Bearer $tok', 'Content-Type': 'application/json'},
      body: jsonEncode({'fields': fields}));
    if (r.statusCode < 200 || r.statusCode >= 300) throw Exception('banir -> ${r.statusCode}');
  }

  // PODIO
  Future<List<Map<String, dynamic>>> getPodio() async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'podio'}], 'select': {'fields': [{'fieldPath': 'player'}, {'fieldPath': 'melhorScore'}, {'fieldPath': 'totalJogos'}, {'fieldPath': 'ultimaPartida'}, {'fieldPath': 'sector'}]}}});
    final items = res.where((r) => r['document'] != null).map((r) {
      final uid = _uid(r['document'] as Map<String, dynamic>);
      return {'uid': uid, ..._parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})};
    }).toList();
    items.sort((a, b) => (((b['melhorScore'] as num?)?.toInt() ?? 0) - ((a['melhorScore'] as num?)?.toInt() ?? 0)));
    return items;
  }

  Future<void> removerDoPodio(String uid) async => _delete('podio/$uid');

  Future<int> resetarPodioPorSetor(String setor) async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'podio'}], 'where': {'fieldFilter': {'field': {'fieldPath': 'sector'}, 'op': 'EQUAL', 'value': {'stringValue': setor}}}}});
    final docs = res.where((r) => r['document'] != null).toList();
    for (final d in docs) {
      await _delete('podio/${_uid(d['document'] as Map<String, dynamic>)}');
    }
    return docs.length;
  }

  // CONFIG GLOBAL
  Future<Map<String, dynamic>> getConfigGlobal() async {
    final doc = await _get('config/global');
    return _parseFields((doc['fields'] as Map?)?.cast<String,dynamic>() ?? {});
  }

  Future<void> salvarConfigGlobal({
    required bool manutencao,
    required bool modoSalaAtivo,
    required String manutencaoInicio,
    required String manutencaoFim,
    required String mensagem,
  }) async {
    await _patch('config/global', {
      'manutencao':       _fsBool(manutencao),
      'manutencaoInicio': _fsStr(manutencaoInicio),
      'manutencaoFim':    _fsStr(manutencaoFim),
      'modoSalaAtivo':    _fsBool(modoSalaAtivo),
      'mensagem':         _fsStr(mensagem),
    });
  }

  Future<void> setManutencao(bool ativo) async => _patch('config/global', {'manutencao': _fsBool(ativo)});
  Future<void> salvarMensagemGlobal(String msg) async => _patch('config/global', {'mensagem': _fsStr(msg)});

  Future<void> toggleLiberado(String uid, bool adicionar) async {
    final snap = await _get('config/global');
    final fields = _parseFields((snap['fields'] as Map?)?.cast<String,dynamic>() ?? {});
    final liberados = ((fields['liberados'] as List?) ?? []).whereType<String>().toList();
    final atualizado = adicionar ? ({...liberados, uid}.toList()) : liberados.where((u) => u != uid).toList();
    await _patch('config/global', {'liberados': {'arrayValue': {'values': atualizado.map((u) => {'stringValue': u}).toList()}}});
  }

  // HISTORIAS
  Future<Map<String, dynamic>> getHistorias() async {
    try {
      final doc = await _get('config/historias');
      return _parseFields((doc['fields'] as Map?)?.cast<String,dynamic>() ?? {});
    } catch (_) { return {}; }
  }

  Future<void> toggleHistoria(String chave, bool ativa) async => _patch('config/historias', {chave: _fsBool(ativa)});

  // ADMINS
  Future<Map<String, dynamic>> getAdminsCompleto() async {
    final doc = await _get('config/admins');
    final fields = _parseFields((doc['fields'] as Map?)?.cast<String,dynamic>() ?? {});
    return {
      'uids': ((fields['uids'] as List?) ?? []).whereType<String>().toList(),
      'owner': fields['owner'] as String? ?? '',
      'permissoes': (fields['permissoes'] as Map?)?.cast<String, dynamic>() ?? {},
    };
  }

  Future<List<String>> getAdmins() async {
    final data = await getAdminsCompleto();
    return List<String>.from(data['uids'] as List);
  }

  Future<void> adicionarAdmin(String uid, List<String> uidsAtuais) async {
    final uids = [...uidsAtuais, uid];
    await _patch('config/admins', {'uids': {'arrayValue': {'values': uids.map((u) => {'stringValue': u}).toList()}}});
    try { await _rtdb.ref('config/admins/uids').set(uids); } catch (_) {}
  }

  Future<void> removerAdmin(String uid, List<String> uidsAtuais) async {
    final uids = uidsAtuais.where((u) => u != uid).toList();
    await _patch('config/admins', {'uids': {'arrayValue': {'values': uids.map((u) => {'stringValue': u}).toList()}}});
    try { await _rtdb.ref('config/admins/uids').set(uids); } catch (_) {}
  }

  // MENSAGENS
  Future<List<Map<String, dynamic>>> getMensagensLog() async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'mensagens_log'}], 'orderBy': [{'field': {'fieldPath': 'ts'}, 'direction': 'DESCENDING'}], 'limit': 50}});
    return res.where((r) => r['document'] != null).map((r) {
      final id = _uid(r['document'] as Map<String, dynamic>);
      return {'id': id, ..._parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})};
    }).toList();
  }

  Future<void> enviarMensagemParaJogador(String uid, String nomeJogador, String texto, {String categoria = 'geral', bool fixada = false, bool exigirConfirmacao = false}) async {
    final msgId = 'msg_${DateTime.now().millisecondsSinceEpoch}_${uid.substring(0, uid.length.clamp(0, 4))}';
    final campos = {
      'texto': _fsStr(texto), 'de': _fsStr('admin'),
      'ts': _fsInt(DateTime.now().millisecondsSinceEpoch), 'lida': _fsBool(false),
      'confirmada': _fsBool(false), 'categoria': _fsStr(categoria),
      'fixada': _fsBool(fixada), 'exigirConfirmacao': _fsBool(exigirConfirmacao),
      'broadcast': _fsBool(false), 'expiraEm': _fsInt(DateTime.now().millisecondsSinceEpoch + 30 * 24 * 60 * 60 * 1000),
    };
    await _patch('usuarios/$uid/mensagens/$msgId', campos);
    await _patch('mensagens_log/$msgId', {...campos, 'destUid': _fsStr(uid), 'destNome': _fsStr(nomeJogador), 'lidoPor': _fsInt(0), 'totalEnviado': _fsInt(1)});
  }

  Future<int> enviarBroadcast(String texto, {String categoria = 'aviso', bool fixada = false, bool exigirConfirmacao = false}) async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'usuarios'}], 'select': {'fields': [{'fieldPath': 'nome'}]}}});
    final uids = res.where((r) => r['document'] != null).map((r) => _uid(r['document'] as Map<String, dynamic>)).toList();
    final msgId = 'bcast_${DateTime.now().millisecondsSinceEpoch}';
    final campos = {
      'texto': _fsStr(texto), 'de': _fsStr('admin'),
      'ts': _fsInt(DateTime.now().millisecondsSinceEpoch), 'lida': _fsBool(false),
      'confirmada': _fsBool(false), 'categoria': _fsStr(categoria),
      'fixada': _fsBool(fixada), 'exigirConfirmacao': _fsBool(exigirConfirmacao),
      'broadcast': _fsBool(true), 'expiraEm': _fsInt(DateTime.now().millisecondsSinceEpoch + 30 * 24 * 60 * 60 * 1000),
    };
    int ok = 0;
    for (final uid in uids) {
      try { await _patch('usuarios/$uid/mensagens/$msgId', campos); ok++; } catch (_) {}
    }
    await _patch('mensagens_log/$msgId', {...campos, 'destUid': _fsStr(''), 'destNome': _fsStr(''), 'lidoPor': _fsInt(0), 'totalEnviado': _fsInt(ok)});
    return ok;
  }

  Future<void> apagarMensagemLog(String id) async => _delete('mensagens_log/$id');

  // LOGS
  Future<List<Map<String, dynamic>>> getLogs() async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'logs'}], 'orderBy': [{'field': {'fieldPath': 'ts'}, 'direction': 'DESCENDING'}], 'limit': 50}});
    return res.where((r) => r['document'] != null).map((r) => _parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})).toList();
  }

  // AUDITORIA
  Future<List<Map<String, dynamic>>> getAuditoria() async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'auditoria'}], 'orderBy': [{'field': {'fieldPath': 'ts'}, 'direction': 'DESCENDING'}], 'limit': 20}});
    return res.where((r) => r['document'] != null).map((r) => ({..._parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {}), '_id': _uid(r['document'] as Map<String, dynamic>)})).toList();
  }

  Future<void> registrarAuditoria(String acao, {String nomeAdmin = 'Admin', String uidAdmin = 'desconhecido'}) async {
    final ts = DateTime.now().millisecondsSinceEpoch;
    await _patch('auditoria/$ts', {'acao': _fsStr(acao), 'uid': _fsStr(uidAdmin), 'nome': _fsStr(nomeAdmin), 'ts': _fsInt(ts)});
  }

  Future<void> limparAuditLog() async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'auditoria'}], 'limit': 100}});
    final tok = await _token();
    final ids = res.where((r) => r['document'] != null).map((r) => _uid(r['document'] as Map<String, dynamic>)).toList();
    await Future.wait(ids.map((id) => http.delete(Uri.parse('$_fsBase/auditoria/$id'), headers: {'Authorization': 'Bearer $tok'})));
  }

  // FEEDBACKS
  Future<List<Map<String, dynamic>>> getFeedbacks() async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'feedbacks'}], 'orderBy': [{'field': {'fieldPath': 'ts'}, 'direction': 'DESCENDING'}], 'limit': 50}});
    return res.where((r) => r['document'] != null).map((r) => _parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})).toList();
  }

  // VERSOES
  Future<List<Map<String, dynamic>>> getVersoes() async {
    try {
      final res = await _query({'structuredQuery': {'from': [{'collectionId': 'versoes'}]}});
      return res.where((r) => r['document'] != null).map((r) => _parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})).toList();
    } catch (_) { return []; }
  }

  Future<void> salvarChangelog(String hash, String versao, String deployedAt, String changelog, bool critica) async {
    await _patch('versoes/$hash', {
      'changelog': _fsStr(changelog), 'critica': _fsBool(critica),
      'versao': _fsStr(versao), 'hash': _fsStr(hash),
      'deployedAt': _fsStr(deployedAt), 'savedAt': _fsStr(DateTime.now().toIso8601String()),
    });
  }

  Future<void> forcarAtualizacaoGlobal(String hash) async {
    await _patch('config/global', {
      'forcarAtualizacao':   _fsStr(hash.isNotEmpty ? hash : DateTime.now().millisecondsSinceEpoch.toString()),
      'forcarAtualizacaoTs': _fsStr(DateTime.now().toIso8601String()),
    });
  }

  // DASHBOARD
  Future<List<Map<String, dynamic>>> getDashboard() async {
    final res = await _query({'structuredQuery': {'from': [{'collectionId': 'podio'}], 'select': {'fields': [{'fieldPath': 'melhorPorSetor'}, {'fieldPath': 'totalJogos'}, {'fieldPath': 'ultimaPartida'}]}}});
    return res.where((r) => r['document'] != null).map((r) => _parseFields((r['document']['fields'] as Map?)?.cast<String,dynamic>() ?? {})).toList();
  }
}
