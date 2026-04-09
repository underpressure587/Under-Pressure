import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class VersaoScreen extends StatefulWidget {
  const VersaoScreen({super.key});
  @override
  State<VersaoScreen> createState() => _VersaoScreenState();
}

class _VersaoScreenState extends State<VersaoScreen> {
  final _fs = FirestoreService();
  List<Map<String, dynamic>> _versoes = [];
  bool _loading = true;
  String? _erro;

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() { _loading = true; _erro = null; });
    try {
      final v = await _fs.getVersoes();
      v.sort((a, b) => ((b['savedAt'] ?? '') as String).compareTo((a['savedAt'] ?? '') as String));
      setState(() { _versoes = v; _loading = false; });
    } catch (e) {
      setState(() { _erro = e.toString(); _loading = false; });
    }
  }

  String _formatarData(String? iso) {
    if (iso == null || iso.isEmpty) return '—';
    try {
      final d = DateTime.parse(iso).toLocal();
      return '${d.day.toString().padLeft(2,'0')}/${d.month.toString().padLeft(2,'0')}/${d.year} ${d.hour.toString().padLeft(2,'0')}:${d.minute.toString().padLeft(2,'0')}';
    } catch (_) { return iso; }
  }

  Future<void> _forcarAtualizacao() async {
    final ok = await showDialog<bool>(context: context, builder: (_) => AlertDialog(
      backgroundColor: const Color(0xFF1A1A1A),
      title: const Text('Forçar atualização?'),
      content: const Text('Todos os jogadores conectados serão forçados a atualizar.'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
        TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Confirmar', style: TextStyle(color: Color(0xFFE8A838)))),
      ],
    ));
    if (ok != true) return;
    try {
      await _fs.salvarMensagemGlobal('🔄 Nova versão disponível! Atualize a página.');
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('📢 Atualização forçada enviada!')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro: $e')));
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

    return RefreshIndicator(
      onRefresh: _carregar,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          ElevatedButton.icon(
            onPressed: _forcarAtualizacao,
            icon: const Icon(Icons.refresh, color: Colors.black),
            label: const Text('Forçar atualização global', style: TextStyle(color: Colors.black)),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE8A838), minimumSize: const Size.fromHeight(44)),
          ),
          const SizedBox(height: 20),
          const Text('Histórico de versões', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          if (_versoes.isEmpty)
            const Card(color: Color(0xFF1A1A1A), child: Padding(padding: EdgeInsets.all(16), child: Center(child: Text('Nenhuma versão registrada.', style: TextStyle(color: Colors.grey)))))
          else
            ..._versoes.map((v) {
              final critica = v['critica'] == true;
              final hash = (v['hash'] as String? ?? '').length > 7 ? (v['hash'] as String).substring(0, 7) : (v['hash'] ?? '—');
              return Card(
                color: const Color(0xFF1A1A1A),
                margin: const EdgeInsets.only(bottom: 10),
                child: Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: critica ? Colors.red.withOpacity(0.2) : const Color(0xFF2A2A2A),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text('${critica ? '⚠️ ' : ''}${v['versao'] ?? hash}',
                        style: TextStyle(color: critica ? Colors.red : Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                    const Spacer(),
                    Text(_formatarData(v['deployedAt'] as String?), style: const TextStyle(color: Colors.grey, fontSize: 11)),
                  ]),
                  if (v['changelog'] != null && (v['changelog'] as String).isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(v['changelog'] as String, style: const TextStyle(color: Colors.grey, fontSize: 13)),
                  ],
                  if (hash.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(hash, style: const TextStyle(color: Color(0xFF444444), fontSize: 10, fontFamily: 'monospace')),
                  ],
                ])),
              );
            }),
        ]),
      ),
    );
  }
}
