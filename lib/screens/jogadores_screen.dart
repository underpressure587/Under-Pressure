import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../services/firestore_service.dart';

class JogadoresScreen extends StatefulWidget {
  const JogadoresScreen({super.key});
  @override
  State<JogadoresScreen> createState() => _JogadoresScreenState();
}

class _JogadoresScreenState extends State<JogadoresScreen> {
  final _busca = TextEditingController();
  String _filtro = 'todos';
  final _fs = FirestoreService();

  Future<void> _toggleBan(String uid, String nome, bool banido) async {
    String motivo = '';
    if (!banido) {
      motivo = await showDialog<String>(context: context, builder: (ctx) {
        final ctrl = TextEditingController();
        return AlertDialog(
          backgroundColor: const Color(0xFF1A1A1A),
          title: const Text('Motivo do banimento'),
          content: TextField(controller: ctrl, decoration: const InputDecoration(hintText: 'Digite o motivo...')),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, ''), child: const Text('Cancelar')),
            TextButton(onPressed: () => Navigator.pop(ctx, ctrl.text), child: const Text('Banir', style: TextStyle(color: Colors.red))),
          ],
        );
      }) ?? '';
      if (motivo.isEmpty) return;
    }
    await _fs.banirJogador(uid, !banido, motivo);
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(banido ? '$nome desbanido!' : '$nome banido!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Padding(
        padding: const EdgeInsets.all(12),
        child: TextField(
          controller: _busca,
          decoration: const InputDecoration(
            hintText: 'Buscar por nome ou e-mail...',
            prefixIcon: Icon(Icons.search),
            border: OutlineInputBorder(),
          ),
          onChanged: (_) => setState(() {}),
        ),
      ),
      Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: ['todos', 'ativos', 'banidos'].map((f) =>
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: ChoiceChip(
              label: Text(f[0].toUpperCase() + f.substring(1)),
              selected: _filtro == f,
              onSelected: (_) => setState(() => _filtro = f),
              selectedColor: const Color(0xFFE8A838),
            ),
          )
        ).toList(),
      ),
      Expanded(
        child: StreamBuilder<QuerySnapshot>(
          stream: _fs.getJogadores(),
          builder: (ctx, snap) {
            if (!snap.hasData) return const Center(child: CircularProgressIndicator());
            var docs = snap.data!.docs;
            final busca = _busca.text.toLowerCase();
            if (busca.isNotEmpty) {
              docs = docs.where((d) {
                final data = d.data() as Map;
                return (data['nome'] ?? '').toLowerCase().contains(busca) ||
                       (data['email'] ?? '').toLowerCase().contains(busca);
              }).toList();
            }
            if (_filtro == 'banidos') docs = docs.where((d) => (d.data() as Map)['banido'] == true).toList();
            if (_filtro == 'ativos') docs = docs.where((d) => (d.data() as Map)['banido'] != true).toList();
            if (docs.isEmpty) return const Center(child: Text('Nenhum jogador encontrado.'));
            return ListView.builder(
              itemCount: docs.length,
              itemBuilder: (ctx, i) {
                final d = docs[i].data() as Map<String, dynamic>;
                final uid = docs[i].id;
                final banido = d['banido'] == true;
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: banido ? Colors.red : const Color(0xFFE8A838),
                    child: Text((d['nome'] ?? '?')[0].toUpperCase()),
                  ),
                  title: Text(d['nome'] ?? 'Sem nome'),
                  subtitle: Text('${d['email'] ?? 'Convidado'} · ${d['mandatos'] ?? 0} mandatos'),
                  trailing: IconButton(
                    icon: Icon(banido ? Icons.check_circle : Icons.block, color: banido ? Colors.green : Colors.red),
                    onPressed: () => _toggleBan(uid, d['nome'] ?? '', banido),
                  ),
                );
              },
            );
          },
        ),
      ),
    ]);
  }
}
