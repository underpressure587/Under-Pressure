import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../services/firestore_service.dart';

class SessoesScreen extends StatelessWidget {
  const SessoesScreen({super.key});

  String _tempoRelativo(int ts) {
    final diff = DateTime.now().millisecondsSinceEpoch - ts;
    final seg = diff ~/ 1000;
    if (seg < 60) return '${seg}s atrás';
    if (seg < 3600) return '${seg ~/ 60}min atrás';
    return '${seg ~/ 3600}h atrás';
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirestoreService().getSessoes(),
      builder: (ctx, snap) {
        if (!snap.hasData) return const Center(child: CircularProgressIndicator());
        final docs = snap.data!.docs;
        if (docs.isEmpty) return const Center(child: Text('Sem sessões registradas.'));
        final agora = DateTime.now().millisecondsSinceEpoch;
        return ListView.builder(
          itemCount: docs.length,
          itemBuilder: (ctx, i) {
            final d = docs[i].data() as Map<String, dynamic>;
            final ts = d['ts'] as int? ?? 0;
            final ativa = agora - ts < 300000;
            return ListTile(
              leading: CircleAvatar(
                backgroundColor: ativa ? Colors.green : Colors.grey,
                radius: 6,
              ),
              title: Text(d['nome'] ?? 'Jogador'),
              subtitle: Text('${d['setor'] ?? '—'} · Rodada ${(d['rodada'] ?? 0) + 1} · ${d['companyName'] ?? ''}'),
              trailing: Text(
                ts > 0 ? _tempoRelativo(ts) : '—',
                style: const TextStyle(color: Colors.grey, fontSize: 12),
              ),
            );
          },
        );
      },
    );
  }
}
