import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class LogsScreen extends StatefulWidget {
  const LogsScreen({super.key});
  @override
  State<LogsScreen> createState() => _LogsScreenState();
}

class _LogsScreenState extends State<LogsScreen> {
  final _fs = FirestoreService();
  List<Map<String, dynamic>> _todos = [];
  String _filtro = 'todos';
  bool _loading = true;
  String? _erro;

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() { _loading = true; _erro = null; });
    try {
      final l = await _fs.getLogs();
      setState(() { _todos = l; _loading = false; });
    } catch (e) {
      setState(() { _erro = e.toString(); _loading = false; });
    }
  }

  List<Map<String, dynamic>> get _filtrados =>
    _filtro == 'todos' ? _todos : _todos.where((l) => l['tipo'] == _filtro).toList();

  Color _corTipo(String? tipo) {
    switch (tipo) {
      case 'erro': return Colors.red;
      case 'aviso': return Colors.orange;
      case 'info': return Colors.blue;
      default: return Colors.grey;
    }
  }

  String _formatarTs(dynamic ts) {
    if (ts == null) return '—';
    try {
      final dt = DateTime.fromMillisecondsSinceEpoch((ts as num).toInt());
      return '${dt.day.toString().padLeft(2,'0')}/${dt.month.toString().padLeft(2,'0')} ${dt.hour.toString().padLeft(2,'0')}:${dt.minute.toString().padLeft(2,'0')}';
    } catch (_) { return '—'; }
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

    final filtrados = _filtrados;

    return RefreshIndicator(
      onRefresh: _carregar,
      child: Column(children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            for (final f in ['todos', 'erro', 'aviso', 'info'])
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 3),
                child: ChoiceChip(
                  label: Text(f[0].toUpperCase() + f.substring(1), style: const TextStyle(fontSize: 12)),
                  selected: _filtro == f,
                  onSelected: (_) => setState(() => _filtro = f),
                  selectedColor: const Color(0xFFE8A838),
                ),
              ),
          ]),
        ),
        Expanded(
          child: filtrados.isEmpty
            ? const Center(child: Text('Sem logs.'))
            : ListView.builder(
                itemCount: filtrados.length,
                itemBuilder: (ctx, i) {
                  final l = filtrados[i];
                  final tipo = l['tipo'] as String? ?? 'aviso';
                  return Card(
                    color: const Color(0xFF1A1A1A),
                    margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: _corTipo(tipo).withOpacity(0.2), borderRadius: BorderRadius.circular(4)),
                          child: Text(tipo.toUpperCase(), style: TextStyle(color: _corTipo(tipo), fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                        Text(_formatarTs(l['ts']), style: const TextStyle(color: Colors.grey, fontSize: 11)),
                      ]),
                      const SizedBox(height: 6),
                      Text(l['msg'] ?? '—', style: const TextStyle(fontSize: 13)),
                      if (l['nomeJogador'] != null || l['setor'] != null) ...[
                        const SizedBox(height: 4),
                        Text('${l['nomeJogador'] ?? ''} ${l['setor'] != null ? '· ${l['setor']}' : ''}',
                          style: const TextStyle(color: Colors.grey, fontSize: 11)),
                      ],
                    ])),
                  );
                },
              ),
        ),
      ]),
    );
  }
}
