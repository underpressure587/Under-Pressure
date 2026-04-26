import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class MensagensScreen extends StatefulWidget {
  const MensagensScreen({super.key});
  @override
  State<MensagensScreen> createState() => _MensagensScreenState();
}

class _MensagensScreenState extends State<MensagensScreen> {
  final _fs = FirestoreService();
  List<Map<String, dynamic>> _msgs = [];
  bool _loading = true;
  String? _erro;

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() { _loading = true; _erro = null; });
    try {
      final m = await _fs.getMensagensLog();
      setState(() { _msgs = m; _loading = false; });
    } catch (e) {
      setState(() { _erro = e.toString(); _loading = false; });
    }
  }

  void _abrirBroadcast() {
    final ctrl = TextEditingController();
    String categoria = 'aviso';
    bool fixada = false;
    bool confirmar = false;
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1A1A1A),
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(builder: (ctx, setS) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 16, right: 16, top: 24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('📢 Broadcast para todos', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 12),
          TextField(controller: ctrl, maxLines: 4, decoration: const InputDecoration(hintText: 'Mensagem...', border: OutlineInputBorder())),
          const SizedBox(height: 10),
          // Categoria
          Row(children: ['aviso', 'geral', 'conquista'].map((c) => Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(label: Text(c), selected: categoria == c, onSelected: (_) => setS(() => categoria = c), selectedColor: const Color(0xFFE8A838)),
          )).toList()),
          const SizedBox(height: 8),
          Row(children: [
            const Text('Fixada'), const SizedBox(width: 8),
            Switch(value: fixada, activeColor: const Color(0xFFE8A838), onChanged: (v) => setS(() => fixada = v)),
            const SizedBox(width: 16),
            const Text('Exigir confirmação'), const SizedBox(width: 8),
            Switch(value: confirmar, activeColor: const Color(0xFFE8A838), onChanged: (v) => setS(() => confirmar = v)),
          ]),
          const SizedBox(height: 12),
          SizedBox(width: double.infinity, child: ElevatedButton(
            onPressed: () async {
              final texto = ctrl.text.trim();
              if (texto.isEmpty) return;
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enviando...')));
              try {
                final ok = await _fs.enviarBroadcast(texto, categoria: categoria, fixada: fixada, exigirConfirmacao: confirmar);
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('✅ Enviado para $ok jogadores!')));
                _carregar();
              } catch (e) {
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro: $e')));
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE8A838), minimumSize: const Size.fromHeight(44)),
            child: const Text('📢 Enviar para todos', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          )),
          const SizedBox(height: 16),
        ]),
      )),
    );
  }

  Future<void> _apagar(String id) async {
    try {
      await _fs.apagarMensagemLog(id);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mensagem removida do log.')));
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

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _abrirBroadcast,
        backgroundColor: const Color(0xFFE8A838),
        icon: const Icon(Icons.campaign, color: Colors.black),
        label: const Text('Broadcast', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
      ),
      body: RefreshIndicator(
        onRefresh: _carregar,
        child: _msgs.isEmpty
          ? const Center(child: Text('Nenhuma mensagem enviada ainda.', style: TextStyle(color: Colors.grey)))
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 80),
              itemCount: _msgs.length,
              itemBuilder: (ctx, i) {
                final m = _msgs[i];
                final dest = m['broadcast'] == true ? 'Todos' : (m['destNome'] as String? ?? m['destUid'] as String? ?? '—');
                final lidos = m['lidoPor'];
                final total = m['totalEnviado'];
                final categoria = m['categoria'] as String? ?? 'geral';
                return Card(
                  color: const Color(0xFF1A1A1A),
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      Expanded(child: Text('${_formatarTs(m['ts'])} · Para: $dest',
                        style: const TextStyle(color: Colors.grey, fontSize: 11), overflow: TextOverflow.ellipsis)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: const Color(0xFF2A2A2A), borderRadius: BorderRadius.circular(10)),
                        child: Text(categoria, style: const TextStyle(color: Colors.grey, fontSize: 10)),
                      ),
                    ]),
                    const SizedBox(height: 6),
                    Text(m['texto'] as String? ?? '', style: const TextStyle(fontSize: 13)),
                    const SizedBox(height: 6),
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      Text('👁 ${lidos ?? '—'}${total != null ? ' / $total' : ''}', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                      TextButton.icon(
                        onPressed: () => _apagar(m['id'] as String),
                        icon: const Icon(Icons.delete_outline, size: 14, color: Colors.grey),
                        label: const Text('Apagar', style: TextStyle(color: Colors.grey, fontSize: 11)),
                        style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero),
                      ),
                    ]),
                  ])),
                );
              },
            ),
      ),
    );
  }
}
