import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class JogadoresScreen extends StatefulWidget {
  const JogadoresScreen({super.key});
  @override
  State<JogadoresScreen> createState() => _JogadoresScreenState();
}

class _JogadoresScreenState extends State<JogadoresScreen> {
  final _fs = FirestoreService();
  final _busca = TextEditingController();
  List<Map<String, dynamic>> _todos = [];
  String _filtro = 'todos';
  bool _loading = true;
  String? _erro;

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() { _loading = true; _erro = null; });
    try {
      final j = await _fs.getJogadores();
      j.sort((a, b) => (((b['melhorScore'] as num?)?.toInt() ?? 0) - ((a['melhorScore'] as num?)?.toInt() ?? 0)));
      setState(() { _todos = j; _loading = false; });
    } catch (e) {
      setState(() { _erro = e.toString(); _loading = false; });
    }
  }

  List<Map<String, dynamic>> get _filtrados {
    var lista = _todos;
    final busca = _busca.text.toLowerCase();
    if (busca.isNotEmpty) lista = lista.where((j) =>
      (j['nome'] ?? '').toLowerCase().contains(busca) ||
      (j['email'] ?? '').toLowerCase().contains(busca)).toList();
    if (_filtro == 'banidos') lista = lista.where((j) => j['banido'] == true).toList();
    if (_filtro == 'ativos')  lista = lista.where((j) => j['banido'] != true).toList();
    return lista;
  }

  Future<void> _toggleBan(Map<String, dynamic> j) async {
    final banido = j['banido'] == true;
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
    await _fs.banirJogador(j['uid'], !banido, motivo);
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(banido ? '${j['nome']} desbanido!' : '${j['nome']} banido!')));
    _carregar();
  }

  void _verHistorico(Map<String, dynamic> j) {
    showModalBottomSheet(context: context, backgroundColor: const Color(0xFF1A1A1A), isScrollControlled: true,
      builder: (_) => _HistoricoSheet(uid: j['uid'], nome: j['nome'] ?? 'Jogador', fs: _fs));
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

    final filtrados = _filtrados;
    final totalBanidos = _todos.where((j) => j['banido'] == true).length;

    return RefreshIndicator(
      onRefresh: _carregar,
      child: Column(children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: TextField(
            controller: _busca,
            decoration: const InputDecoration(hintText: 'Buscar por nome ou e-mail...', prefixIcon: Icon(Icons.search), border: OutlineInputBorder()),
            onChanged: (_) => setState(() {}),
          ),
        ),
        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          for (final f in ['todos', 'ativos', 'banidos'])
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: ChoiceChip(
                label: Text(f == 'todos' ? 'Todos (${_todos.length})' : f == 'ativos' ? 'Ativos (${_todos.length - totalBanidos})' : 'Banidos ($totalBanidos)'),
                selected: _filtro == f,
                onSelected: (_) => setState(() => _filtro = f),
                selectedColor: const Color(0xFFE8A838),
              ),
            ),
        ]),
        const SizedBox(height: 8),
        Expanded(
          child: filtrados.isEmpty
            ? const Center(child: Text('Nenhum jogador encontrado.'))
            : ListView.builder(
                itemCount: filtrados.length,
                itemBuilder: (ctx, i) {
                  final j = filtrados[i];
                  final banido = j['banido'] == true;
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: banido ? Colors.red : const Color(0xFFE8A838),
                      child: Text(((j['nome'] ?? '?') as String)[0].toUpperCase()),
                    ),
                    title: Text(j['nome'] ?? 'Sem nome'),
                    subtitle: Text('${j['email'] ?? 'Convidado'} · ${(j['mandatos'] as num?)?.toInt() ?? 0} mandatos'),
                    trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                      IconButton(icon: const Icon(Icons.history, color: Colors.grey), onPressed: () => _verHistorico(j)),
                      IconButton(
                        icon: Icon(banido ? Icons.check_circle : Icons.block, color: banido ? Colors.green : Colors.red),
                        onPressed: () => _toggleBan(j),
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

class _HistoricoSheet extends StatefulWidget {
  final String uid, nome;
  final FirestoreService fs;
  const _HistoricoSheet({required this.uid, required this.nome, required this.fs});
  @override
  State<_HistoricoSheet> createState() => _HistoricoSheetState();
}

class _HistoricoSheetState extends State<_HistoricoSheet> {
  List<Map<String, dynamic>> _hist = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    widget.fs.getHistoricoJogador(widget.uid).then((h) => setState(() { _hist = h; _loading = false; })).catchError((_) => setState(() => _loading = false));
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.6, maxChildSize: 0.9, minChildSize: 0.3, expand: false,
      builder: (_, ctrl) => Column(children: [
        Padding(padding: const EdgeInsets.all(16), child: Text('Histórico — ${widget.nome}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
        if (_loading) const Expanded(child: Center(child: CircularProgressIndicator()))
        else if (_hist.isEmpty) const Expanded(child: Center(child: Text('Nenhuma partida registrada.')))
        else Expanded(child: ListView.builder(
          controller: ctrl, itemCount: _hist.length,
          itemBuilder: (_, i) {
            final h = _hist[i];
            final ts = (h['ts'] as num?)?.toInt() ?? 0;
            return ListTile(
              title: Text('${h['companyName'] ?? '—'} · ${h['sector'] ?? '—'}'),
              subtitle: Text(ts > 0 ? DateTime.fromMillisecondsSinceEpoch(ts).toLocal().toString().substring(0, 16) : '—'),
              trailing: Text('${(h['score'] as num?)?.toInt() ?? 0} pts', style: const TextStyle(color: Color(0xFFE8A838), fontWeight: FontWeight.bold)),
            );
          },
        )),
      ]),
    );
  }
}
