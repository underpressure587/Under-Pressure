import 'dart:async';
import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class SessoesScreen extends StatefulWidget {
  const SessoesScreen({super.key});
  @override
  State<SessoesScreen> createState() => _SessoesScreenState();
}

class _SessoesScreenState extends State<SessoesScreen> {
  final _fs = FirestoreService();
  StreamSubscription? _sub;
  List<Map<String, dynamic>> _sessoes = [];
  bool _loading = true;
  String? _erro;

  static const _emojiSetor = {'tecnologia': '🚀', 'varejo': '🛒', 'logistica': '🚛', 'industria': '🏭'};

  @override
  void initState() {
    super.initState();
    _assinar();
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  void _assinar() {
    setState(() { _loading = true; _erro = null; });
    _sub = _fs.getSessoesStream().listen(
      (sessoes) => setState(() { _sessoes = sessoes; _loading = false; }),
      onError: (e) => setState(() { _erro = e.toString(); _loading = false; }),
    );
  }

  String _tempoRelativo(int ts) {
    final diff = (DateTime.now().millisecondsSinceEpoch - ts) ~/ 1000;
    if (diff < 60) return '${diff}s atrás';
    if (diff < 3600) return '${diff ~/ 60}min atrás';
    return '${diff ~/ 3600}h atrás';
  }

  String _detalhe(Map<String, dynamic> s) {
    final status = s['status'] as String? ?? '';
    final setor = s['setor'] as String? ?? '';
    if (status != 'home' && setor.isNotEmpty) {
      final emoji = _emojiSetor[setor] ?? '🏢';
      final nome = setor[0].toUpperCase() + setor.substring(1);
      final rodada = ((s['rodada'] as num?)?.toInt() ?? 0) + 1;
      final company = s['companyName'] as String? ?? '';
      return '$emoji $nome · Rodada $rodada${company.isNotEmpty ? ' · $company' : ''}';
    }
    return '🏠 Na tela inicial';
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_erro != null) return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      const Icon(Icons.error_outline, color: Colors.red, size: 48),
      const SizedBox(height: 8),
      Text(_erro!, style: const TextStyle(color: Colors.red), textAlign: TextAlign.center),
      ElevatedButton(onPressed: () { _sub?.cancel(); _assinar(); }, child: const Text('Reconectar')),
    ]));

    final total = _sessoes.length;

    return Column(children: [
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        color: const Color(0xFF1A1A1A),
        child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Row(children: [
            Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle)),
            const SizedBox(width: 8),
            Text('Ao vivo — RTDB', style: const TextStyle(color: Colors.grey, fontSize: 12)),
          ]),
          Text('$total online${total != 1 ? 's' : ''}', style: const TextStyle(color: Colors.grey, fontSize: 13)),
        ]),
      ),
      Expanded(
        child: total == 0
          ? const Center(child: Text('Nenhum jogador online no momento.', style: TextStyle(color: Colors.grey)))
          : ListView.builder(
              itemCount: total,
              itemBuilder: (ctx, i) {
                final s = _sessoes[i];
                final ts = (s['ts'] as num?)?.toInt() ?? 0;
                return Card(
                  color: const Color(0xFF1A1A1A),
                  margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  child: ListTile(
                    leading: const CircleAvatar(backgroundColor: Colors.green, radius: 6),
                    title: Text(s['nome'] as String? ?? 'Jogador'),
                    subtitle: Text(_detalhe(s), style: const TextStyle(fontSize: 12)),
                    trailing: Text(ts > 0 ? _tempoRelativo(ts) : '—', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  ),
                );
              },
            ),
      ),
    ]);
  }
}
