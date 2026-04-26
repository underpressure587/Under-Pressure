import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
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

  Future<void> _limpar() async {
    final ok = await showDialog<bool>(context: context, builder: (_) => AlertDialog(
      backgroundColor: const Color(0xFF1A1A1A),
      title: const Text('Limpar log de auditoria?'),
      content: const Text('Esta ação não pode ser desfeita.'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
        TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Limpar', style: TextStyle(color: Colors.red))),
      ],
    ));
    if (ok != true) return;
    try {
      await _fs.limparAuditLog();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Log de auditoria limpo.')));
      _carregar();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro: $e')));
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

    return RefreshIndicator(
      onRefresh: _carregar,
      child: Column(children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('${_logs.length} registro${_logs.length != 1 ? 's' : ''}', style: const TextStyle(color: Colors.grey, fontSize: 13)),
            TextButton.icon(
              onPressed: _limpar,
              icon: const Icon(Icons.delete_outline, color: Colors.red, size: 18),
              label: const Text('Limpar log', style: TextStyle(color: Colors.red, fontSize: 13)),
            ),
          ]),
        ),
        Expanded(
          child: _logs.isEmpty
            ? const Center(child: Text('Sem registros de auditoria.'))
            : ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                itemCount: _logs.length,
                itemBuilder: (ctx, i) {
                  final l = _logs[i];
                  final uid = l['uid'] as String? ?? 'admin';
                  final uidCurto = uid.length > 8 ? uid.substring(0, 8) : uid;
                  final nome = l['nome'] as String? ?? '';
                  return Card(
                    color: const Color(0xFF1A1A1A),
                    margin: const EdgeInsets.only(bottom: 6),
                    child: Padding(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10), child: Row(children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(color: const Color(0xFF2A2A2A), borderRadius: BorderRadius.circular(4)),
                        child: Text(nome.isNotEmpty ? nome : uidCurto,
                          style: const TextStyle(color: Color(0xFFE8A838), fontSize: 10, fontFamily: 'monospace')),
                      ),
                      const SizedBox(width: 10),
                      Expanded(child: Text(l['acao'] as String? ?? '—', style: const TextStyle(fontSize: 13))),
                      Text(_formatarTs(l['ts']), style: const TextStyle(color: Colors.grey, fontSize: 11)),
                    ])),
                  );
                },
              ),
        ),
      ]),
    );
  }
}
