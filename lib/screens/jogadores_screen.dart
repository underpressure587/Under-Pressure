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

  static const _motivosBan = [
    'Comportamento inadequado',
    'Uso indevido do sistema',
    'Violação dos termos de uso',
    'Linguagem ofensiva',
    'Exploração de bugs',
    'Outro',
  ];

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
      // Selecionar motivo predefinido com opção de detalhe livre
      motivo = await showDialog<String>(context: context, builder: (ctx) {
        String selecionado = '';
        final detCtrl = TextEditingController();
        return StatefulBuilder(builder: (ctx, setS) => AlertDialog(
          backgroundColor: const Color(0xFF1A1A1A),
          title: const Text('🚫 Motivo do banimento'),
          content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
            ..._motivosBan.map((m) => RadioListTile<String>(
              value: m, groupValue: selecionado,
              onChanged: (v) => setS(() => selecionado = v!),
              title: Text(m, style: const TextStyle(fontSize: 13)),
              activeColor: const Color(0xFFE8A838),
            )),
            if (selecionado == 'Outro')
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: TextField(controller: detCtrl, maxLength: 200, decoration: const InputDecoration(hintText: 'Especifique...', border: OutlineInputBorder()), style: const TextStyle(fontSize: 13)),
              ),
          ])),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, ''), child: const Text('Cancelar')),
            TextButton(
              onPressed: selecionado.isEmpty ? null : () {
                final m = selecionado == 'Outro' && detCtrl.text.trim().isNotEmpty ? detCtrl.text.trim() : selecionado;
                Navigator.pop(ctx, m);
              },
              child: const Text('Banir', style: TextStyle(color: Colors.red)),
            ),
          ],
        ));
      }) ?? '';
      if (motivo.isEmpty) return;
    }

    try {
      await _fs.banirJogador(j['uid'] as String, !banido, motivo);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(banido ? '✅ ${j['nome']} desbanido!' : '🚫 ${j['nome']} banido!')));
      _carregar();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro: $e')));
    }
  }

  void _verHistorico(Map<String, dynamic> j) {
    showModalBottomSheet(context: context, backgroundColor: const Color(0xFF1A1A1A), isScrollControlled: true,
      builder: (_) => _HistoricoSheet(uid: j['uid'] as String, nome: j['nome'] as String? ?? 'Jogador', fs: _fs));
  }

  void _enviarMensagem(Map<String, dynamic> j) {
    final ctrl = TextEditingController();
    String categoria = 'geral';
    bool fixada = false;
    bool confirmar = false;
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1A1A1A),
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(builder: (ctx, setS) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 16, right: 16, top: 24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('✉️ Mensagem para ${j['nome'] ?? 'Jogador'}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 12),
          TextField(controller: ctrl, maxLines: 4, decoration: const InputDecoration(hintText: 'Mensagem...', border: OutlineInputBorder())),
          const SizedBox(height: 10),
          Row(children: ['geral', 'aviso', 'conquista'].map((c) => Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(label: Text(c, style: const TextStyle(fontSize: 12)), selected: categoria == c,
              onSelected: (_) => setS(() => categoria = c), selectedColor: const Color(0xFFE8A838)),
          )).toList()),
          const SizedBox(height: 8),
          Row(children: [
            const Text('Fixada', style: TextStyle(fontSize: 13)), const SizedBox(width: 8),
            Switch(value: fixada, activeColor: const Color(0xFFE8A838), onChanged: (v) => setS(() => fixada = v)),
            const SizedBox(width: 16),
            const Text('Confirmar', style: TextStyle(fontSize: 13)), const SizedBox(width: 8),
            Switch(value: confirmar, activeColor: const Color(0xFFE8A838), onChanged: (v) => setS(() => confirmar = v)),
          ]),
          const SizedBox(height: 12),
          SizedBox(width: double.infinity, child: ElevatedButton(
            onPressed: () async {
              final texto = ctrl.text.trim();
              if (texto.isEmpty) return;
              Navigator.pop(ctx);
              try {
                await _fs.enviarMensagemParaJogador(j['uid'] as String, j['nome'] as String? ?? '', texto, categoria: categoria, fixada: fixada, exigirConfirmacao: confirmar);
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('✅ Mensagem enviada para ${j['nome']}!')));
              } catch (e) {
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro: $e')));
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE8A838), minimumSize: const Size.fromHeight(44)),
            child: const Text('Enviar', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          )),
          const SizedBox(height: 16),
        ]),
      )),
    );
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
                label: Text(
                  f == 'todos'   ? 'Todos (${_todos.length})'
                  : f == 'ativos'  ? 'Ativos (${_todos.length - totalBanidos})'
                  : 'Banidos ($totalBanidos)',
                  style: const TextStyle(fontSize: 12),
                ),
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
                      child: Text(((j['nome'] ?? '?') as String)[0].toUpperCase(), style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                    ),
                    title: Row(children: [
                      Expanded(child: Text(j['nome'] as String? ?? 'Sem nome')),
                      if (banido) Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: Colors.red.withOpacity(0.2), borderRadius: BorderRadius.circular(4)),
                        child: const Text('BANIDO', style: TextStyle(color: Colors.red, fontSize: 9, fontWeight: FontWeight.bold)),
                      ),
                    ]),
                    subtitle: Text('${j['email'] ?? 'Convidado'} · ${(j['mandatos'] as num?)?.toInt() ?? 0} mandatos · ${(j['melhorScore'] as num?)?.toInt() ?? 0} pts',
                      style: const TextStyle(fontSize: 11)),
                    trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                      IconButton(icon: const Icon(Icons.history, color: Colors.grey, size: 20), onPressed: () => _verHistorico(j), tooltip: 'Histórico'),
                      IconButton(icon: const Icon(Icons.mail_outline, color: Colors.grey, size: 20), onPressed: () => _enviarMensagem(j), tooltip: 'Enviar mensagem'),
                      IconButton(
                        icon: Icon(banido ? Icons.check_circle : Icons.block, color: banido ? Colors.green : Colors.red, size: 20),
                        onPressed: () => _toggleBan(j),
                        tooltip: banido ? 'Desbanir' : 'Banir',
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
    widget.fs.getHistoricoJogador(widget.uid)
      .then((h) => setState(() { _hist = h; _loading = false; }))
      .catchError((_) => setState(() => _loading = false));
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
