import 'dart:async';
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
  StreamSubscription? _sub;
  bool _loading = true;
  String? _erro;

  static const _emojiSetor = {'tecnologia': '🚀', 'varejo': '🛒', 'logistica': '🚛', 'industria': '🏭'};

  @override
  void initState() {
    super.initState();
    _carregar();
    // Sessões ao vivo via RTDB stream
    _sub = _fs.getSessoesStream().listen(
      (s) => setState(() => _sessoes = s),
      onError: (_) {},
    );
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  Future<void> _carregar() async {
    setState(() { _loading = true; _erro = null; });
    try {
      final dados = await _fs.getVisaoGeral();
      setState(() { _dados = dados; _loading = false; });
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

  String _detalhe(Map<String, dynamic> s) {
    final status = s['status'] as String? ?? '';
    final setor = s['setor'] as String? ?? '';
    if (status != 'home' && setor.isNotEmpty) {
      final emoji = _emojiSetor[setor] ?? '🏢';
      final nome = setor[0].toUpperCase() + setor.substring(1);
      final rodada = ((s['rodada'] as num?)?.toInt() ?? 0) + 1;
      return '$emoji $nome · Rodada $rodada';
    }
    return '🏠 Na tela inicial';
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
              _card('Score médio', '${d['mediaScore']}', Icons.bar_chart),
            ],
          ),
          const SizedBox(height: 16),
          // Online ao vivo via RTDB
          Row(children: [
            Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle)),
            const SizedBox(width: 8),
            Text('Ao Vivo (${_sessoes.length})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ]),
          const SizedBox(height: 8),
          if (_sessoes.isEmpty)
            const Card(color: Color(0xFF1A1A1A), child: Padding(padding: EdgeInsets.all(16), child: Center(child: Text('Sem jogadores online agora.', style: TextStyle(color: Colors.grey)))))
          else
            ..._sessoes.take(10).map((s) => Card(
              color: const Color(0xFF1A1A1A),
              child: ListTile(
                leading: const CircleAvatar(backgroundColor: Colors.green, radius: 6),
                title: Text(s['nome'] as String? ?? 'Jogador'),
                subtitle: Text(_detalhe(s), style: const TextStyle(fontSize: 12)),
                trailing: Text(
                  _tempoRelativo((s['ts'] as num?)?.toInt() ?? 0),
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ),
            )),
        ]),
      ),
    );
  }
}
