import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class PodioScreen extends StatefulWidget {
  const PodioScreen({super.key});
  @override
  State<PodioScreen> createState() => _PodioScreenState();
}

class _PodioScreenState extends State<PodioScreen> {
  final _fs = FirestoreService();
  List<Map<String, dynamic>> _items = [];
  bool _loading = true;
  String? _erro;

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() { _loading = true; _erro = null; });
    try {
      final p = await _fs.getPodio();
      setState(() { _items = p; _loading = false; });
    } catch (e) {
      setState(() { _erro = e.toString(); _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_erro != null) return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      const Icon(Icons.error_outline, color: Colors.red, size: 48),
      const SizedBox(height: 8),
      Text(_erro!, style: const TextStyle(color: Colors.red), textAlign: TextAlign.center),
      ElevatedButton(onPressed: _carregar, child: const Text('Tentar novamente')),
    ]));
    if (_items.isEmpty) return const Center(child: Text('Pódio vazio.'));

    return RefreshIndicator(
      onRefresh: _carregar,
      child: ListView.builder(
        itemCount: _items.length,
        itemBuilder: (ctx, i) {
          final p = _items[i];
          final medal = i == 0 ? '🥇' : i == 1 ? '🥈' : i == 2 ? '🥉' : '${i+1}.';
          return ListTile(
            leading: Text(medal, style: const TextStyle(fontSize: 24)),
            title: Text(p['player'] ?? '—'),
            subtitle: Text('${(p['totalJogos'] as num?)?.toInt() ?? 0} jogos'),
            trailing: Row(mainAxisSize: MainAxisSize.min, children: [
              Text('${(p['melhorScore'] as num?)?.toInt() ?? 0} pts',
                style: const TextStyle(color: Color(0xFFE8A838), fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.delete, color: Colors.red),
                onPressed: () async {
                  final ok = await showDialog<bool>(context: context, builder: (_) => AlertDialog(
                    backgroundColor: const Color(0xFF1A1A1A),
                    title: const Text('Remover do pódio?'),
                    content: Text('Remover ${p['player']}?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
                      TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Remover', style: TextStyle(color: Colors.red))),
                    ],
                  ));
                  if (ok == true) { await _fs.removerDoPodio(p['uid']); _carregar(); }
                },
              ),
            ]),
          );
        },
      ),
    );
  }
}
