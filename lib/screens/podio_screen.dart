import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class PodioScreen extends StatefulWidget {
  const PodioScreen({super.key});
  @override
  State<PodioScreen> createState() => _PodioScreenState();
}

class _PodioScreenState extends State<PodioScreen> {
  final _fs = FirestoreService();
  List<Map<String, dynamic>> _items = [];
  bool _loading = true;
  String? _erro;
  String _setorFiltro = '';

  static const _setores = ['', 'tecnologia', 'varejo', 'logistica', 'industria'];
  static const _emojiSetor = {'tecnologia': '🚀', 'varejo': '🛒', 'logistica': '🚛', 'industria': '🏭'};

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() { _loading = true; _erro = null; });
    try {
      final p = await _fs.getPodio();
      setState(() { _items = p; _loading = false; });
    } catch (e) {
      setState(() { _erro = e.toString(); _loading = false; });
    }
  }

  Future<void> _resetarSetor() async {
    if (_setorFiltro.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Selecione um setor para resetar.')));
      return;
    }
    final ok = await showDialog<bool>(context: context, builder: (_) => AlertDialog(
      backgroundColor: const Color(0xFF1A1A1A),
      title: const Text('Resetar pódio por setor?'),
      content: Text('Remover todas as entradas de "${_setorFiltro}"?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
        TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Resetar', style: TextStyle(color: Colors.red))),
      ],
    ));
    if (ok != true) return;
    try {
      final count = await _fs.resetarPodioPorSetor(_setorFiltro);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$count entradas removidas!')));
      _carregar();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro: $e')));
    }
  }

  List<Map<String, dynamic>> get _filtrados {
    if (_setorFiltro.isEmpty) return _items;
    return _items.where((p) => (p['sector'] as String? ?? '') == _setorFiltro).toList();
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
    if (_items.isEmpty) return const Center(child: Text('Pódio vazio.'));

    final filtrados = _filtrados;

    return RefreshIndicator(
      onRefresh: _carregar,
      child: Column(children: [
        // Filtro por setor + botão de reset
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(children: [
            Expanded(child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: _setores.map((s) {
                final label = s.isEmpty ? 'Todos' : '${_emojiSetor[s] ?? ''} ${s[0].toUpperCase()}${s.substring(1)}';
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: ChoiceChip(
                    label: Text(label, style: const TextStyle(fontSize: 12)),
                    selected: _setorFiltro == s,
                    onSelected: (_) => setState(() => _setorFiltro = s),
                    selectedColor: const Color(0xFFE8A838),
                  ),
                );
              }).toList()),
            )),
            if (_setorFiltro.isNotEmpty)
              IconButton(
                icon: const Icon(Icons.delete_sweep, color: Colors.red),
                tooltip: 'Resetar setor',
                onPressed: _resetarSetor,
              ),
          ]),
        ),
        Expanded(
          child: filtrados.isEmpty
            ? const Center(child: Text('Nenhuma entrada.', style: TextStyle(color: Colors.grey)))
            : ListView.builder(
                itemCount: filtrados.length,
                itemBuilder: (ctx, i) {
                  final p = filtrados[i];
                  final posicaoGlobal = _items.indexOf(p);
                  final medal = posicaoGlobal == 0 ? '🥇' : posicaoGlobal == 1 ? '🥈' : posicaoGlobal == 2 ? '🥉' : '#${posicaoGlobal + 1}';
                  final setor = p['sector'] as String? ?? '';
                  return ListTile(
                    leading: Text(medal, style: const TextStyle(fontSize: 22)),
                    title: Text(p['player'] as String? ?? '—'),
                    subtitle: Text('${(p['totalJogos'] as num?)?.toInt() ?? 0} jogos${setor.isNotEmpty ? ' · ${_emojiSetor[setor] ?? ''}$setor' : ''}'),
                    trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                      Text('${(p['melhorScore'] as num?)?.toInt() ?? 0} pts',
                        style: const TextStyle(color: Color(0xFFE8A838), fontWeight: FontWeight.bold)),
                      IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () async {
                          final ok = await showDialog<bool>(context: context, builder: (_) => AlertDialog(
                            backgroundColor: const Color(0xFF1A1A1A),
                            title: const Text('Remover do pódio?'),
                            content: Text('Remover ${p['player']}?'),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
                              TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Remover', style: TextStyle(color: Colors.red))),
                            ],
                          ));
                          if (ok == true) { await _fs.removerDoPodio(p['uid'] as String); _carregar(); }
                        },
                      ),
                    ]),
                  );
                },
              ),
        ),
      ]),
    );
  }
}
