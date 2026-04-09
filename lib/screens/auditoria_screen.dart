import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class AuditoriaScreen extends StatefulWidget {
  const AuditoriaScreen({super.key});
  @override
  State<AuditoriaScreen> createState() => _AuditoriaScreenState();
}

class _AuditoriaScreenState extends State<AuditoriaScreen> {
  final _fs = FirestoreService();
  List<Map<String, dynamic>> _logs = [];
  bool _loading = true;
  String? _erro;

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() { _loading = true; _erro = null; });
    try {
      final a = await _fs.getAuditoria();
      setState(() { _logs = a; _loading = false; });
    } catch (e) {
      setState(() { _erro = e.toString(); _loading = false; });
    }
  }

  String _formatarTs(dynamic ts) {
    if (ts == null) return '—';
    try {
      final dt = DateTime.fromMillisecondsSinceEpoch((ts as num).toInt()).toLocal();
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
    if (_logs.isEmpty) return const Center(child: Text('Sem registros de auditoria.'));

    return RefreshIndicator(
      onRefresh: _carregar,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _logs.length,
        itemBuilder: (ctx, i) {
          final l = _logs[i];
          final uid = (l['uid'] as String? ?? 'admin');
          final uidCurto = uid.length > 8 ? uid.substring(0, 8) : uid;
          return Card(
            color: const Color(0xFF1A1A1A),
            margin: const EdgeInsets.only(bottom: 6),
            child: Padding(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10), child: Row(children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                decoration: BoxDecoration(color: const Color(0xFF2A2A2A), borderRadius: BorderRadius.circular(4)),
                child: Text(uidCurto, style: const TextStyle(color: Color(0xFFE8A838), fontSize: 10, fontFamily: 'monospace')),
              ),
              const SizedBox(width: 10),
              Expanded(child: Text(l['acao'] ?? '—', style: const TextStyle(fontSize: 13))),
              Text(_formatarTs(l['ts']), style: const TextStyle(color: Colors.grey, fontSize: 11)),
            ])),
          );
        },
      ),
    );
  }
}
