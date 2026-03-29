import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class VisaoGeralScreen extends StatefulWidget {
  const VisaoGeralScreen({super.key});
  @override
  State<VisaoGeralScreen> createState() => _VisaoGeralScreenState();
}

class _VisaoGeralScreenState extends State<VisaoGeralScreen> {
  final _db = FirebaseFirestore.instance;
  int _totalJogadores = 0;
  int _totalPartidas = 0;
  int _ativosDia = 0;
  int _ativosSemana = 0;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    setState(() => _loading = true);
    try {
      final jogadores = await _db.collection('usuarios').get();
      final podio = await _db.collection('podio').get();
      final agora = DateTime.now().millisecondsSinceEpoch;
      int partidas = 0;
      int dia = 0;
      int semana = 0;
      for (final d in podio.docs) {
        partidas += (d.data()['totalJogos'] as int? ?? 0);
        final ts = d.data()['ultimaPartida'] as int? ?? 0;
        if (agora - ts < 86400000) dia++;
        if (agora - ts < 604800000) semana++;
      }
      setState(() {
        _totalJogadores = jogadores.size;
        _totalPartidas = partidas;
        _ativosDia = dia;
        _ativosSemana = semana;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Widget _card(String label, String valor, IconData icon) {
    return Card(
      color: const Color(0xFF1A1A1A),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          Icon(icon, color: const Color(0xFFE8A838), size: 28),
          const SizedBox(height: 8),
          Text(valor, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    return RefreshIndicator(
      onRefresh: _carregar,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            children: [
              _card('Jogadores', '$_totalJogadores', Icons.people),
              _card('Partidas', '$_totalPartidas', Icons.sports_esports),
              _card('Ativos hoje', '$_ativosDia', Icons.today),
              _card('Ativos semana', '$_ativosSemana', Icons.date_range),
            ],
          ),
        ]),
      ),
    );
  }
}
