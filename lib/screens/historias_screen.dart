import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class HistoriasScreen extends StatefulWidget {
  const HistoriasScreen({super.key});
  @override
  State<HistoriasScreen> createState() => _HistoriasScreenState();
}

class _HistoriasScreenState extends State<HistoriasScreen> {
  final _fs = FirestoreService();
  Map<String, dynamic> _estado = {};
  bool _loading = true;
  String? _erro;

  static const _config = {
    'tecnologia': [
      {'id': 0, 'nome': 'SaaS B2B', 'sub': 'Dívida técnica e rotatividade'},
      {'id': 1, 'nome': 'EdTech B2C', 'sub': 'Pós-pandemia e pivot'},
      {'id': 2, 'nome': 'Scale-up de IA', 'sub': 'Pipeline travado'},
    ],
    'varejo': [
      {'id': 0, 'nome': 'Rede Omnichannel', 'sub': 'Margem em queda'},
      {'id': 1, 'nome': 'Rede de Farmácias', 'sub': 'Concorrência nacional'},
      {'id': 2, 'nome': 'Atacarejo Regional', 'sub': 'Expansão desequilibrada'},
    ],
    'logistica': [
      {'id': 0, 'nome': 'Last-Mile Delivery', 'sub': 'SLA em descumprimento'},
      {'id': 1, 'nome': 'Cadeia do Frio', 'sub': 'Falha no monitoramento'},
      {'id': 2, 'nome': 'Fulfillment E-commerce', 'sub': 'Volume no limite'},
    ],
    'industria': [
      {'id': 0, 'nome': 'Metalúrgica', 'sub': 'Segurança e ISO em risco'},
      {'id': 1, 'nome': 'Embalagens ESG', 'sub': 'Adequação urgente'},
      {'id': 2, 'nome': 'Química Ambiental', 'sub': 'Autuação do IBAMA'},
    ],
  };

  static const _emojiSetor = {'tecnologia': '🚀', 'varejo': '🛒', 'logistica': '🚛', 'industria': '🏭'};

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() { _loading = true; _erro = null; });
    try {
      final estado = await _fs.getHistorias();
      setState(() { _estado = estado; _loading = false; });
    } catch (e) {
      setState(() { _erro = e.toString(); _loading = false; });
    }
  }

  Future<void> _toggle(String chave, bool ativa) async {
    try {
      await _fs.toggleHistoria(chave, ativa);
      setState(() => _estado[chave] = ativa);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(ativa ? '✅ História ativada!' : '⏸ Desativada!')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro: $e')));
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

    return RefreshIndicator(
      onRefresh: _carregar,
      child: ListView(padding: const EdgeInsets.all(16), children: [
        for (final entry in _config.entries) ...[
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Text('${_emojiSetor[entry.key]} ${entry.key[0].toUpperCase()}${entry.key.substring(1)}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          ),
          for (final h in entry.value) Builder(builder: (_) {
            final chave = '${entry.key}_${h['id']}';
            final ativa = _estado[chave] != false;
            return Card(
              color: const Color(0xFF1A1A1A),
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                title: Text(h['nome'] as String),
                subtitle: Text(h['sub'] as String, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: ativa ? const Color(0xFF1A3A1A) : const Color(0xFF2A2A2A),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(ativa ? 'Ativa' : 'Inativa',
                      style: TextStyle(color: ativa ? Colors.green : Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 8),
                  Switch(value: ativa, activeColor: const Color(0xFFE8A838), onChanged: (v) => _toggle(chave, v)),
                ]),
              ),
            );
          }),
        ],
      ]),
    );
  }
}
