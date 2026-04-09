import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _fs = FirestoreService();
  String _periodo = 'hoje';
  Map<String, int> _setores = {};
  int _partidas = 0;
  bool _loading = true;
  String? _erro;

  static const _emojiSetor = {'tecnologia': '🚀', 'varejo': '🛒', 'logistica': '🚛', 'industria': '🏭'};

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() { _loading = true; _erro = null; });
    try {
      final docs = await _fs.getDashboard();
      final agora = DateTime.now().millisecondsSinceEpoch;
      final limite = _periodo == 'hoje' ? 86400000 : _periodo == 'semana' ? 604800000 : 2592000000;
      final setores = <String, int>{};
      int partidas = 0;
      for (final d in docs) {
        final ultima = (d['ultimaPartida'] as num?)?.toInt() ?? 0;
        if (agora - ultima < limite) partidas += (d['totalJogos'] as num?)?.toInt() ?? 0;
        final mps = d['melhorPorSetor'];
        if (mps is Map) {
          for (final s in mps.keys) {
            setores[s] = (setores[s] ?? 0) + 1;
          }
        }
      }
      setState(() { _setores = Map.fromEntries(setores.entries.toList()..sort((a,b) => b.value - a.value)); _partidas = partidas; _loading = false; });
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

    final max = _setores.isEmpty ? 1 : _setores.values.first;

    return RefreshIndicator(
      onRefresh: _carregar,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Período
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            for (final p in [('hoje','Hoje'), ('semana','Semana'), ('mes','Mês')])
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: ChoiceChip(
                  label: Text(p.$2),
                  selected: _periodo == p.$1,
                  onSelected: (_) { setState(() => _periodo = p.$1); _carregar(); },
                  selectedColor: const Color(0xFFE8A838),
                ),
              ),
          ]),
          const SizedBox(height: 16),

          // Métricas
          Card(color: const Color(0xFF1A1A1A), child: Padding(padding: const EdgeInsets.all(16), child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              Column(children: [
                Text('$_partidas', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFFE8A838))),
                const Text('Partidas', style: TextStyle(color: Colors.grey, fontSize: 12)),
              ]),
              Column(children: [
                Text('${_setores.length}', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFFE8A838))),
                const Text('Setores', style: TextStyle(color: Colors.grey, fontSize: 12)),
              ]),
            ],
          ))),
          const SizedBox(height: 16),

          // Setores mais jogados
          const Text('Setores mais jogados', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 12),
          if (_setores.isEmpty)
            const Card(color: Color(0xFF1A1A1A), child: Padding(padding: EdgeInsets.all(16), child: Center(child: Text('Sem dados.', style: TextStyle(color: Colors.grey)))))
          else
            ..._setores.entries.map((e) {
              final pct = e.value / max;
              final nome = e.key[0].toUpperCase() + e.key.substring(1);
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Text('${_emojiSetor[e.key] ?? '🏢'} $nome', style: const TextStyle(fontSize: 13)),
                    Text('${e.value} jogadores', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  ]),
                  const SizedBox(height: 4),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: pct, minHeight: 8,
                      backgroundColor: const Color(0xFF2A2A2A),
                      valueColor: const AlwaysStoppedAnimation(Color(0xFFE8A838)),
                    ),
                  ),
                ]),
              );
            }),
        ]),
      ),
    );
  }
}
