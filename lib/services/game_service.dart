import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import '../engine/game_engine.dart';

const _projectId = 'under-pressure-49320';
const _fsBase =
    'https://firestore.googleapis.com/v1/projects/$_projectId/databases/default/documents';

class GameService {

  static Future<String?> _token() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return null;
    return user.getIdToken(true);
  }

  // ── Salvar resultado completo (espelha o site) ────────
  static Future<void> salvarResultado(GameResult result) async {
    final uid = AuthService.currentUser?.uid;
    if (uid == null) return;
    final token = await _token();
    if (token == null) return;

    final score = ((result.scoreEmpresa + result.scoreGestor) / 2).round();
    final player = AuthService.currentUser?.displayName ?? 'Jogador';

    final entrada = {
      'player':      player,
      'score':       score,
      'scoreGestor': result.scoreGestor,
      'sector':      result.sector,
      'companyName': result.companyName,
      'uid':         uid,
      'ts':          DateTime.now().toUtc().toIso8601String(),
    };

    await Future.wait([
      _salvarHistorico(uid, token, entrada),
      _atualizarPerfil(uid, token, score),
      _salvarNoPodio(uid, token, entrada),
    ]);
  }

  // 1. Salva em usuarios/{uid}/historico (subcoleção)
  static Future<void> _salvarHistorico(
      String uid, String token, Map<String, dynamic> entrada) async {
    try {
      final url = '$_fsBase/usuarios/$uid/historico';
      await http.post(
        Uri.parse(url),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
        body: jsonEncode({'fields': {
          'player':      {'stringValue':  entrada['player']},
          'score':       {'integerValue': entrada['score'].toString()},
          'scoreGestor': {'integerValue': entrada['scoreGestor'].toString()},
          'sector':      {'stringValue':  entrada['sector']},
          'companyName': {'stringValue':  entrada['companyName']},
          'uid':         {'stringValue':  entrada['uid']},
          'ts':          {'timestampValue': entrada['ts']},
        }}),
      ).timeout(const Duration(seconds: 10));
    } catch (_) {}
  }

  // 2. Atualiza mandatos e melhorScore em usuarios/{uid}
  static Future<void> _atualizarPerfil(
      String uid, String token, int score) async {
    try {
      final url = '$_fsBase/usuarios/$uid';
      final getRes = await http.get(
        Uri.parse(url),
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 10));

      int mandatosAtual = 0;
      int melhorScoreAtual = 0;
      if (getRes.statusCode == 200) {
        final f = (jsonDecode(getRes.body)['fields'] as Map? ?? {});
        mandatosAtual    = int.tryParse(f['mandatos']?['integerValue']?.toString() ?? '0') ?? 0;
        melhorScoreAtual = int.tryParse(f['melhorScore']?['integerValue']?.toString() ?? '0') ?? 0;
      }

      final novoMandatos    = mandatosAtual + 1;
      final novoMelhorScore = score > melhorScoreAtual ? score : melhorScoreAtual;

      await http.patch(
        Uri.parse('$url?updateMask.fieldPaths=mandatos&updateMask.fieldPaths=melhorScore'),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
        body: jsonEncode({'fields': {
          'mandatos':    {'integerValue': novoMandatos.toString()},
          'melhorScore': {'integerValue': novoMelhorScore.toString()},
        }}),
      ).timeout(const Duration(seconds: 10));
    } catch (_) {}
  }

  // 3. Salva/atualiza em podio/{uid}
  static Future<void> _salvarNoPodio(
      String uid, String token, Map<String, dynamic> entrada) async {
    try {
      final url = '$_fsBase/podio/$uid';
      final setor = entrada['sector'] as String;
      final score = entrada['score'] as int;

      int melhorScore = score;
      int totalJogos  = 1;
      Map<String, dynamic> melhorPorSetor = {};
      String playerNome = entrada['player'] as String;

      final getRes = await http.get(
        Uri.parse(url),
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 10));

      if (getRes.statusCode == 200) {
        final f = (jsonDecode(getRes.body)['fields'] as Map? ?? {});
        melhorScore  = int.tryParse(f['melhorScore']?['integerValue']?.toString() ?? '0') ?? 0;
        if (score > melhorScore) melhorScore = score;
        totalJogos   = (int.tryParse(f['totalJogos']?['integerValue']?.toString() ?? '0') ?? 0) + 1;
        playerNome   = f['player']?['stringValue'] ?? playerNome;

        final raw = f['melhorPorSetor']?['mapValue']?['fields'] as Map? ?? {};
        for (final e in raw.entries) {
          final mf = e.value['mapValue']?['fields'] as Map? ?? {};
          melhorPorSetor[e.key] = {
            'score':       int.tryParse(mf['score']?['integerValue']?.toString() ?? '0') ?? 0,
            'scoreGestor': int.tryParse(mf['scoreGestor']?['integerValue']?.toString() ?? '0') ?? 0,
            'companyName': mf['companyName']?['stringValue'] ?? '',
          };
        }
      }

      // Atualiza melhor por setor
      final scoreGestor = entrada['scoreGestor'] as int;
      final companyName = entrada['companyName'] as String;
      if (!melhorPorSetor.containsKey(setor) ||
          score > (melhorPorSetor[setor]?['score'] ?? 0)) {
        melhorPorSetor[setor] = {
          'score': score, 'scoreGestor': scoreGestor, 'companyName': companyName
        };
      }

      // Monta melhorPorSetor no formato Firestore
      final melhorPorSetorFields = <String, dynamic>{};
      for (final e in melhorPorSetor.entries) {
        melhorPorSetorFields[e.key] = {'mapValue': {'fields': {
          'score':       {'integerValue': e.value['score'].toString()},
          'scoreGestor': {'integerValue': e.value['scoreGestor'].toString()},
          'companyName': {'stringValue':  e.value['companyName']},
        }}};
      }

      await http.patch(
        Uri.parse(url),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
        body: jsonEncode({'fields': {
          'uid':           {'stringValue':   uid},
          'player':        {'stringValue':   playerNome},
          'melhorScore':   {'integerValue':  melhorScore.toString()},
          'totalJogos':    {'integerValue':  totalJogos.toString()},
          'ultimaPartida': {'timestampValue': DateTime.now().toUtc().toIso8601String()},
          'melhorPorSetor':{'mapValue': {'fields': melhorPorSetorFields}},
        }}),
      ).timeout(const Duration(seconds: 10));
    } catch (_) {}
  }

  // ── Buscar histórico (subcoleção usuarios/{uid}/historico) ──
  static Future<List<Map<String, dynamic>>> buscarHistorico() async {
    final uid   = AuthService.currentUser?.uid;
    final token = await _token();
    if (uid == null || token == null) return [];
    try {
      final url = '$_fsBase/usuarios/$uid:runQuery';
      final res = await http.post(
        Uri.parse(url),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
        body: jsonEncode({'structuredQuery': {
          'from':    [{'collectionId': 'historico'}],
          'orderBy': [{'field': {'fieldPath': 'ts'}, 'direction': 'DESCENDING'}],
          'limit':   30,
        }}),
      ).timeout(const Duration(seconds: 10));

      if (res.statusCode != 200) return [];
      final rows = jsonDecode(res.body) as List;
      return rows.where((r) => r['document'] != null).map((r) {
        final f = r['document']['fields'] as Map? ?? {};
        return {
          '_id':         r['document']['name'].toString().split('/').last,
          'player':      f['player']?['stringValue']      ?? '',
          'score':       int.tryParse(f['score']?['integerValue']?.toString() ?? '0') ?? 0,
          'scoreGestor': int.tryParse(f['scoreGestor']?['integerValue']?.toString() ?? '0') ?? 0,
          'sector':      f['sector']?['stringValue']      ?? '',
          'companyName': f['companyName']?['stringValue'] ?? '',
          'ts':          f['ts']?['timestampValue']       ?? '',
        };
      }).toList();
    } catch (_) { return []; }
  }

  // ── Buscar pódio (coleção podio/) ─────────────────────
  static Future<List<Map<String, dynamic>>> buscarPodio({String? sector}) async {
    final token = await _token();
    try {
      final headers = <String, String>{'Content-Type': 'application/json'};
      if (token != null) headers['Authorization'] = 'Bearer $token';

      final res = await http.post(
        Uri.parse('$_fsBase:runQuery'),
        headers: headers,
        body: jsonEncode({'structuredQuery': {
          'from':  [{'collectionId': 'podio'}],
          'limit': 50,
        }}),
      ).timeout(const Duration(seconds: 10));

      if (res.statusCode != 200) return [];
      final rows = jsonDecode(res.body) as List;
      final items = rows.where((r) => r['document'] != null).map((r) {
        final f = r['document']['fields'] as Map? ?? {};
        return {
          'uid':         f['uid']?['stringValue']         ?? '',
          'player':      f['player']?['stringValue']      ?? '',
          'melhorScore': int.tryParse(f['melhorScore']?['integerValue']?.toString() ?? '0') ?? 0,
          'totalJogos':  int.tryParse(f['totalJogos']?['integerValue']?.toString() ?? '0') ?? 0,
          'melhorPorSetor': _parseMelhorPorSetor(f['melhorPorSetor']),
        };
      }).toList();

      // Filtra por setor se necessário
      if (sector != null && sector != 'all') {
        final filtrado = items.where((p) {
          final mps = p['melhorPorSetor'] as Map? ?? {};
          return mps.containsKey(sector);
        }).map((p) {
          final mps = p['melhorPorSetor'] as Map;
          return {...p, 'melhorScore': mps[sector]?['score'] ?? 0};
        }).toList();
        filtrado.sort((a, b) => (b['melhorScore'] as int).compareTo(a['melhorScore'] as int));
        return filtrado;
      }

      items.sort((a, b) => (b['melhorScore'] as int).compareTo(a['melhorScore'] as int));
      return items;
    } catch (_) { return []; }
  }

  static Map<String, dynamic> _parseMelhorPorSetor(dynamic raw) {
    if (raw == null) return {};
    final fields = raw['mapValue']?['fields'] as Map? ?? {};
    final result = <String, dynamic>{};
    for (final e in fields.entries) {
      final mf = e.value['mapValue']?['fields'] as Map? ?? {};
      result[e.key] = {
        'score':       int.tryParse(mf['score']?['integerValue']?.toString() ?? '0') ?? 0,
        'scoreGestor': int.tryParse(mf['scoreGestor']?['integerValue']?.toString() ?? '0') ?? 0,
        'companyName': mf['companyName']?['stringValue'] ?? '',
      };
    }
    return result;
  }
}
