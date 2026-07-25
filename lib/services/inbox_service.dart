import 'dart:async';
import 'package:flutter/foundation.dart';
import 'auth_service.dart';
import 'firestore_service.dart';

/// Uma mensagem/comunicado recebido pelo jogador.
class Mensagem {
  final String id;
  final String texto;
  final String de;
  final int ts; // milissegundos desde epoch
  final bool lida;
  final bool confirmada;
  final String categoria;
  final bool fixada;
  final bool exigirConfirmacao;
  final int expiraEm; // 0 = sem expiração

  const Mensagem({
    required this.id,
    required this.texto,
    required this.de,
    required this.ts,
    required this.lida,
    required this.confirmada,
    required this.categoria,
    required this.fixada,
    required this.exigirConfirmacao,
    required this.expiraEm,
  });

  Mensagem copyWith({bool? lida, bool? confirmada}) => Mensagem(
        id: id,
        texto: texto,
        de: de,
        ts: ts,
        lida: lida ?? this.lida,
        confirmada: confirmada ?? this.confirmada,
        categoria: categoria,
        fixada: fixada,
        exigirConfirmacao: exigirConfirmacao,
        expiraEm: expiraEm,
      );

  factory Mensagem.fromMap(Map<String, dynamic> f) => Mensagem(
        id: f['_id'] as String? ?? '',
        texto: f['texto'] as String? ?? '',
        de: f['de'] as String? ?? 'admin',
        ts: (f['ts'] as num?)?.toInt() ?? 0,
        lida: f['lida'] as bool? ?? false,
        confirmada: f['confirmada'] as bool? ?? false,
        categoria: f['categoria'] as String? ?? 'geral',
        fixada: f['fixada'] as bool? ?? false,
        exigirConfirmacao: f['exigirConfirmacao'] as bool? ?? false,
        expiraEm: (f['expiraEm'] as num?)?.toInt() ?? 0,
      );
}

/// Caixa de entrada — mensagens/comunicados enviados pelo admin, guardados
/// em `usuarios/{uid}/mensagens/{id}`. Faz polling (mesmo intervalo do
/// site: a cada 5s) enquanto ativo, mantendo `mensagens` atualizado; a
/// tela (e o badge no ícone de envelope) escutam esse ValueNotifier.
class InboxService {
  static final ValueNotifier<List<Mensagem>> mensagens =
      ValueNotifier<List<Mensagem>>([]);

  static Timer? _timer;

  static int get naoLidas =>
      mensagens.value.where((m) => !m.lida).length;

  static void iniciar() {
    if (_timer != null) return; // já rodando
    _buscar();
    _timer = Timer.periodic(const Duration(seconds: 5), (_) => _buscar());
  }

  static void parar() {
    _timer?.cancel();
    _timer = null;
  }

  static Future<void> _buscar() async {
    final uid = AuthService.currentUser?.uid;
    if (uid == null) return;
    final rows =
        await FirestoreService.querySubcollection('usuarios/$uid', 'mensagens', limit: 100);
    final agora = DateTime.now().millisecondsSinceEpoch;
    final docs = rows
        .map(Mensagem.fromMap)
        .where((m) => m.expiraEm == 0 || m.expiraEm > agora)
        .toList()
      ..sort((a, b) {
        if (a.fixada && !b.fixada) return -1;
        if (!a.fixada && b.fixada) return 1;
        return b.ts.compareTo(a.ts);
      });
    mensagens.value = docs;
  }

  static Future<void> marcarLida(String id) async {
    final uid = AuthService.currentUser?.uid;
    if (uid == null) return;
    final idx = mensagens.value.indexWhere((m) => m.id == id);
    if (idx == -1 || mensagens.value[idx].lida) return;
    final nova = [...mensagens.value];
    nova[idx] = nova[idx].copyWith(lida: true);
    mensagens.value = nova;
    await FirestoreService.setDoc(
        'usuarios/$uid/mensagens/$id', {'lida': true});
  }

  static Future<void> confirmarLeitura(String id) async {
    final uid = AuthService.currentUser?.uid;
    if (uid == null) return;
    final idx = mensagens.value.indexWhere((m) => m.id == id);
    if (idx == -1) return;
    final nova = [...mensagens.value];
    nova[idx] = nova[idx].copyWith(lida: true, confirmada: true);
    mensagens.value = nova;
    await FirestoreService.setDoc('usuarios/$uid/mensagens/$id',
        {'lida': true, 'confirmada': true});
  }

  static Future<void> apagar(String id) async {
    final uid = AuthService.currentUser?.uid;
    if (uid == null) return;
    mensagens.value =
        mensagens.value.where((m) => m.id != id).toList();
    await FirestoreService.deleteDoc('usuarios/$uid/mensagens/$id');
  }

  static Future<void> apagarTodas() async {
    final uid = AuthService.currentUser?.uid;
    if (uid == null) return;
    final ids = mensagens.value.map((m) => m.id).toList();
    mensagens.value = [];
    for (final id in ids) {
      FirestoreService.deleteDoc('usuarios/$uid/mensagens/$id');
    }
  }

  static Future<void> marcarTodasLidas() async {
    final uid = AuthService.currentUser?.uid;
    if (uid == null) return;
    final naoLidasIds =
        mensagens.value.where((m) => !m.lida).map((m) => m.id).toList();
    mensagens.value =
        mensagens.value.map((m) => m.lida ? m : m.copyWith(lida: true)).toList();
    for (final id in naoLidasIds) {
      FirestoreService.setDoc('usuarios/$uid/mensagens/$id', {'lida': true});
    }
  }

  /// Marca como lidas só as mensagens simples (que não exigem confirmação)
  /// — chamado ao abrir a caixa de entrada, igual ao site.
  static Future<void> marcarLidasSimples() async {
    final uid = AuthService.currentUser?.uid;
    if (uid == null) return;
    final simples = mensagens.value
        .where((m) => !m.lida && !m.exigirConfirmacao)
        .map((m) => m.id)
        .toList();
    if (simples.isEmpty) return;
    mensagens.value = mensagens.value
        .map((m) => simples.contains(m.id) ? m.copyWith(lida: true) : m)
        .toList();
    for (final id in simples) {
      FirestoreService.setDoc('usuarios/$uid/mensagens/$id', {'lida': true});
    }
  }
}
