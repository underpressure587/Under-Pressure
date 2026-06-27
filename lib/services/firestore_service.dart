import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;

// ═══════════════════════════════════════════════════════
//  FIRESTORE SERVICE — REST HTTP (evita gRPC/região)
//  Idêntico à abordagem do app admin
// ═══════════════════════════════════════════════════════

const _projectId = 'under-pressure-49320';
const _fsBase =
    'https://firestore.googleapis.com/v1/projects/$_projectId/databases/default/documents';

class FirestoreService {
  // ── Token do usuário autenticado ──────────────────────
  static Future<String?> _token() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return null;
    return await user.getIdToken();
  }

  // ── GET documento ─────────────────────────────────────
  static Future<Map<String, dynamic>?> getDoc(String path) async {
    try {
      final tok = await _token();
      final headers = tok != null
          ? {'Authorization': 'Bearer $tok'}
          : <String, String>{};
      final r = await http
          .get(Uri.parse('$_fsBase/$path'), headers: headers)
          .timeout(const Duration(seconds: 10));
      if (r.statusCode == 200) {
        final body = jsonDecode(r.body) as Map<String, dynamic>;
        return _parseDoc(body);
      }
      if (r.statusCode == 404) return null;
    } catch (_) {}
    return null;
  }

  // ── SET documento (merge) ─────────────────────────────
  static Future<bool> setDoc(
      String path, Map<String, dynamic> data) async {
    try {
      final tok = await _token();
      if (tok == null) return false;
      final fields = _encodeFields(data);
      final mask = data.keys
          .map((k) => 'updateMask.fieldPaths=$k')
          .join('&');
      final r = await http
          .patch(
            Uri.parse('$_fsBase/$path?$mask'),
            headers: {
              'Authorization': 'Bearer $tok',
              'Content-Type': 'application/json',
            },
            body: jsonEncode({'fields': fields}),
          )
          .timeout(const Duration(seconds: 10));
      return r.statusCode >= 200 && r.statusCode < 300;
    } catch (_) {
      return false;
    }
  }

  // ── ADD documento (auto-id) ───────────────────────────
  static Future<String?> addDoc(
      String collection, Map<String, dynamic> data) async {
    try {
      final tok = await _token();
      if (tok == null) return null;
      final fields = _encodeFields(data);
      final r = await http
          .post(
            Uri.parse('$_fsBase/$collection'),
            headers: {
              'Authorization': 'Bearer $tok',
              'Content-Type': 'application/json',
            },
            body: jsonEncode({'fields': fields}),
          )
          .timeout(const Duration(seconds: 10));
      if (r.statusCode >= 200 && r.statusCode < 300) {
        final body = jsonDecode(r.body) as Map<String, dynamic>;
        final name = body['name'] as String? ?? '';
        return name.split('/').last;
      }
    } catch (_) {}
    return null;
  }

  // ── QUERY coleção ─────────────────────────────────────
  static Future<List<Map<String, dynamic>>> query(
    String collection, {
    String? whereField,
    String? whereOp,
    dynamic whereValue,
    String? orderBy,
    bool descending = false,
    int? limit,
  }) async {
    try {
      final tok = await _token();
      final headers = {
        'Content-Type': 'application/json',
        if (tok != null) 'Authorization': 'Bearer $tok',
      };

      // Monta structured query
      final Map<String, dynamic> query = {
        'from': [{'collectionId': collection}],
      };

      if (whereField != null && whereValue != null) {
        query['where'] = {
          'fieldFilter': {
            'field': {'fieldPath': whereField},
            'op': _mapOp(whereOp ?? '=='),
            'value': _encodeValue(whereValue),
          }
        };
      }

      if (orderBy != null) {
        query['orderBy'] = [
          {
            'field': {'fieldPath': orderBy},
            'direction': descending ? 'DESCENDING' : 'ASCENDING',
          }
        ];
      }

      if (limit != null) query['limit'] = limit;

      final r = await http
          .post(
            Uri.parse('$_fsBase:runQuery'),
            headers: headers,
            body: jsonEncode({'structuredQuery': query}),
          )
          .timeout(const Duration(seconds: 10));

      if (r.statusCode >= 200 && r.statusCode < 300) {
        final list = jsonDecode(r.body) as List;
        return list
            .where((e) => e is Map && e['document'] != null)
            .map((e) {
              final doc = e['document'] as Map<String, dynamic>;
              final parsed = _parseDoc(doc);
              // inclui o ID do documento
              final name = doc['name'] as String? ?? '';
              parsed['_id'] = name.split('/').last;
              return parsed;
            })
            .toList();
      }
    } catch (_) {}
    return [];
  }

  // ── Parse documento REST → mapa simples ──────────────
  static Map<String, dynamic> _parseDoc(Map<String, dynamic> doc) {
    final fields = doc['fields'] as Map<String, dynamic>? ?? {};
    return fields.map((k, v) => MapEntry(k, _decodeValue(v)));
  }

  static dynamic _decodeValue(dynamic v) {
    if (v is! Map) return v;
    if (v.containsKey('stringValue'))  return v['stringValue'];
    if (v.containsKey('integerValue')) return int.tryParse(v['integerValue'].toString()) ?? 0;
    if (v.containsKey('doubleValue'))  return (v['doubleValue'] as num).toDouble();
    if (v.containsKey('booleanValue')) return v['booleanValue'];
    if (v.containsKey('nullValue'))    return null;
    if (v.containsKey('timestampValue')) return v['timestampValue'];
    if (v.containsKey('arrayValue')) {
      final vals = (v['arrayValue']['values'] as List? ?? []);
      return vals.map(_decodeValue).toList();
    }
    if (v.containsKey('mapValue')) {
      final fields = v['mapValue']['fields'] as Map<String, dynamic>? ?? {};
      return fields.map((k, fv) => MapEntry(k, _decodeValue(fv)));
    }
    return v;
  }

  static Map<String, dynamic> _encodeFields(Map<String, dynamic> data) {
    return data.map((k, v) => MapEntry(k, _encodeValue(v)));
  }

  static dynamic _encodeValue(dynamic v) {
    if (v == null)         return {'nullValue': null};
    if (v is bool)         return {'booleanValue': v};
    if (v is int)          return {'integerValue': v.toString()};
    if (v is double)       return {'doubleValue': v};
    if (v is String)       return {'stringValue': v};
    if (v is List)         return {'arrayValue': {'values': v.map(_encodeValue).toList()}};
    if (v is Map)          return {'mapValue': {'fields': (v as Map<String, dynamic>).map((k, mv) => MapEntry(k, _encodeValue(mv)))}};
    return {'stringValue': v.toString()};
  }

  static String _mapOp(String op) {
    switch (op) {
      case '==': return 'EQUAL';
      case '<':  return 'LESS_THAN';
      case '<=': return 'LESS_THAN_OR_EQUAL';
      case '>':  return 'GREATER_THAN';
      case '>=': return 'GREATER_THAN_OR_EQUAL';
      default:   return 'EQUAL';
    }
  }
}
