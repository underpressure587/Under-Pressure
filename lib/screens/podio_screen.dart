import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../services/firestore_service.dart';

class PodioScreen extends StatelessWidget {
  const PodioScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final fs = FirestoreService();
    return StreamBuilder<QuerySnapshot>(
      stream: fs.getPodio(),
      builder: (ctx, snap) {
        if (!snap.hasData) return const Center(child: CircularProgressIndicator());
        final docs = snap.data!.docs;
        if (docs.isEmpty) return const Center(child: Text('Pódio vazio.'));
        return ListView.builder(
          itemCount: docs.length,
          itemBuilder: (ctx, i) {
            final d = docs[i].data() as Map<String, dynamic>;
            final uid = docs[i].id;
            final medal = i == 0 ? '🥇' : i == 1 ? '🥈' : i == 2 ? '🥉' : '${i+1}.';
            return ListTile(
              leading: Text(medal, style: const TextStyle(fontSize: 24)),
              title: Text(d['player'] ?? '—'),
              subtitle: Text('${d['totalJogos'] ?? 0} jogos'),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('${d['melhorScore'] ?? 0} pts',
                    style: const TextStyle(color: Color(0xFFE8A838), fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.delete, color: Colors.red),
                    onPressed: () async {
                      final confirma = await showDialog<bool>(
                        context: ctx,
                        builder: (_) => AlertDialog(
                          backgroundColor: const Color(0xFF1A1A1A),
                          title: const Text('Remover do pódio?'),
                          content: Text('Remover ${d['player']}?'),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
                            TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Remover', style: TextStyle(color: Colors.red))),
                          ],
                        ),
                      );
                      if (confirma == true) await fs.removerDoPodio(uid);
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
