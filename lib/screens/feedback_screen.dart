import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key});
  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  final _fs = FirestoreService();
  List<Map<String, dynamic>> _feedbacks = [];
  bool _loading = true;
  String? _erro;

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() { _loading = true; _erro = null; });
    try {
      final f = await _fs.getFeedbacks();
      setState(() { _feedbacks = f; _loading = false; });
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
    if (_feedbacks.isEmpty) return const Center(child: Text('Sem feedbacks ainda.'));

    final notas = _feedbacks.where((f) => f['nota'] != null).map((f) => (f['nota'] as num).toDouble()).toList();
    final media = notas.isEmpty ? 0.0 : notas.reduce((a, b) => a + b) / notas.length;
    final comTexto = _feedbacks.where((f) => f['texto'] != null && (f['texto'] as String).isNotEmpty).toList();

    // Por história
    final porHist = <String, List<double>>{};
    for (final f in _feedbacks) {
      final k = f['historiaId'] as String? ?? 'geral';
      if (f['nota'] != null) (porHist[k] ??= []).add((f['nota'] as num).toDouble());
    }

    return RefreshIndicator(
      onRefresh: _carregar,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Média geral
          Card(color: const Color(0xFF1A1A1A), child: Padding(padding: const EdgeInsets.all(20), child: Column(children: [
            Text(media.toStringAsFixed(1), style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Color(0xFFE8A838))),
            Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(5, (i) =>
              Icon(i < media.round() ? Icons.star : Icons.star_border, color: const Color(0xFFE8A838), size: 20))),
            const SizedBox(height: 4),
            Text('${notas.length} avaliações', style: const TextStyle(color: Colors.grey, fontSize: 12)),
          ]))),
          const SizedBox(height: 16),

          // Por história
          const Text('Por história', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          ...porHist.entries.map((e) {
            final m = e.value.reduce((a,b) => a+b) / e.value.length;
            return Card(
              color: const Color(0xFF1A1A1A),
              margin: const EdgeInsets.only(bottom: 6),
              child: ListTile(
                title: Text(e.key),
                trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                  Text(m.toStringAsFixed(1), style: const TextStyle(color: Color(0xFFE8A838), fontWeight: FontWeight.bold)),
                  const Icon(Icons.star, color: Color(0xFFE8A838), size: 16),
                  const SizedBox(width: 8),
                  Text('${e.value.length}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                ]),
              ),
            );
          }),
          const SizedBox(height: 16),

          // Recentes com texto
          if (comTexto.isNotEmpty) ...[
            const Text('Comentários recentes', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            ...comTexto.take(10).map((f) => Card(
              color: const Color(0xFF1A1A1A),
              margin: const EdgeInsets.only(bottom: 8),
              child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text(f['nomeJogador'] ?? 'Jogador', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  Row(children: List.generate(f['nota'] as int? ?? 0, (_) => const Icon(Icons.star, color: Color(0xFFE8A838), size: 14))),
                ]),
                const SizedBox(height: 6),
                Text('"${f['texto']}"', style: const TextStyle(color: Colors.grey, fontSize: 13, fontStyle: FontStyle.italic)),
              ])),
            )),
          ],
        ]),
      ),
    );
  }
}
