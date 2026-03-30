import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class VisaoGeralScreen extends StatefulWidget {
  const VisaoGeralScreen({super.key});
  @override
  State<VisaoGeralScreen> createState() => _VisaoGeralScreenState();
}

class _VisaoGeralScreenState extends State<VisaoGeralScreen> {
  final _fs = FirestoreService();
  Map<String, dynamic>? _dados;
  List<Map<String, dynamic>> _sessoes = [];
  bool _loading = true;
  String? _erro;

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() { _loading = true; _erro = null; });
    try {
      final dados = await _fs.getVisaoGeral();
      final sessoes = await _fs.getSessoesAoVivo();
      setState(() { _dados = dados; _sessoes = sessoes; _loading = false; });
    } catch (e) {
      setState(() { _erro = e.toString(); _loading = false; });
    }
  }

  Widget _card(String label, String valor, IconData icon) => Card(
    color: const Color(0xFF1A1A1A),
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(children: [
        Icon(icon, color: const Color(0xFFE8A838), size: 28),
        const SizedBox(height: 8),
        Text(valor, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12), textAlign: TextAlign.center),
      ]),
    ),
  );

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
      const SizedBox(height: 16),
      ElevatedButton(onPressed: _carregar, child: const Text('Tentar novamente')),
    ]));

    final d = _dados!;
    final agora = DateTime.now().millisecondsSinceEpoch;
    final ativas = _sessoes.where((s) => agora - ((s['ts'] as num?)?.toInt() ?? 0) < 300000).toList();

    return RefreshIndicator(
      onRefresh: _carregar,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          GridView.count(
            crossAxisCount: 2, shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 8, crossAxisSpacing: 8,
            children: [
              _card('Jogadores', '${d['totalJogadores']}', Icons.people),
              _card('Partidas', '${d['totalPartidas']}', Icons.sports_esports),
              _card('Ativos hoje', '${d['ativosDia']}', Icons.today),
              _card('Ativos semana', '${d['ativosSemana']}', Icons.date_range),
            ],
          ),
          const SizedBox(height: 16),
          const Text('🟢 Ao Vivo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          if (ativas.isEmpty)
            const Card(color: Color(0xFF1A1A1A), child: Padding(padding: EdgeInsets.all(16), child: Center(child: Text('Sem sessões ativas agora.', style: TextStyle(color: Colors.grey))))),
          ...ativas.map((s) => Card(
            color: const Color(0xFF1A1A1A),
            child: ListTile(
              leading: const CircleAvatar(backgroundColor: Colors.green, radius: 6),
              title: Text(s['nome'] ?? 'Jogador'),
              subtitle: Text('${s['setor'] ?? '—'} · Rodada ${((s['rodada'] as num?)?.toInt() ?? 0) + 1}'),
              trailing: Text(_tempoRelativo((s['ts'] as num?)?.toInt() ?? 0), style: const TextStyle(color: Colors.grey, fontSize: 12)),
            ),
          )),
        ]),
      ),
    );
  }
}
