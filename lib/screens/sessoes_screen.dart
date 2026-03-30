import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class SessoesScreen extends StatefulWidget {
  const SessoesScreen({super.key});
  @override
  State<SessoesScreen> createState() => _SessoesScreenState();
}

class _SessoesScreenState extends State<SessoesScreen> {
  final _fs = FirestoreService();
  List<Map<String, dynamic>> _sessoes = [];
  bool _loading = true;
  String? _erro;

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() { _loading = true; _erro = null; });
    try {
      final s = await _fs.getSessoesAoVivo();
      setState(() { _sessoes = s; _loading = false; });
    } catch (e) {
      setState(() { _erro = e.toString(); _loading = false; });
    }
  }

  String _tempoRelativo(int ts) {
    final diff = (DateTime.now().millisecondsSinceEpoch - ts) ~/ 1000;
    if (diff < 60) return '${diff}s atrás';
    if (diff < 3600) return '${diff ~/ 60}min atrás';
    return '${diff ~/ 3600}h atrás';
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

    final agora = DateTime.now().millisecondsSinceEpoch;
    final ativas = _sessoes.where((s) => agora - ((s['ts'] as num?)?.toInt() ?? 0) < 300000).length;

    return RefreshIndicator(
      onRefresh: _carregar,
      child: Column(children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('$ativas ativa${ativas != 1 ? 's' : ''}', style: const TextStyle(color: Colors.grey)),
            Text('${_sessoes.length} total', style: const TextStyle(color: Colors.grey)),
          ]),
        ),
        Expanded(
          child: _sessoes.isEmpty
            ? const Center(child: Text('Sem sessões registradas.'))
            : ListView.builder(
                itemCount: _sessoes.length,
                itemBuilder: (ctx, i) {
                  final s = _sessoes[i];
                  final ts = (s['ts'] as num?)?.toInt() ?? 0;
                  final ativa = agora - ts < 300000;
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: ativa ? Colors.green : Colors.grey,
                      radius: 6,
                    ),
                    title: Text(s['nome'] ?? 'Jogador'),
                    subtitle: Text('${s['setor'] ?? '—'} · Rodada ${((s['rodada'] as num?)?.toInt() ?? 0) + 1} · ${s['companyName'] ?? ''}'),
                    trailing: Text(ts > 0 ? _tempoRelativo(ts) : '—', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  );
                },
              ),
        ),
      ]),
    );
  }
}
