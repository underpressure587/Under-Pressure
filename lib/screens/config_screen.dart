import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class ConfigScreen extends StatefulWidget {
  const ConfigScreen({super.key});
  @override
  State<ConfigScreen> createState() => _ConfigScreenState();
}

class _ConfigScreenState extends State<ConfigScreen> {
  final _fs = FirestoreService();
  bool _manutencao = false;
  bool _loading = true;
  String? _erro;
  final _msgCtrl = TextEditingController();
  List<String> _admins = [];
  final _adminCtrl = TextEditingController();

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() { _loading = true; _erro = null; });
    try {
      final cfg = await _fs.getConfigGlobal();
      final admins = await _fs.getAdmins();
      setState(() {
        _manutencao = cfg['manutencao'] == true;
        _msgCtrl.text = cfg['mensagem'] ?? '';
        _admins = admins;
        _loading = false;
      });
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

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Manutenção
        Card(color: const Color(0xFF1A1A1A), child: Padding(padding: const EdgeInsets.all(16), child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Modo manutenção', style: TextStyle(fontWeight: FontWeight.bold)),
              Text(_manutencao ? '⚠️ Jogadores bloqueados' : 'Desativado',
                style: TextStyle(color: _manutencao ? Colors.orange : Colors.grey, fontSize: 12)),
            ]),
            Switch(
              value: _manutencao, activeColor: const Color(0xFFE8A838),
              onChanged: (v) async {
                setState(() => _manutencao = v);
                await _fs.setManutencao(v);
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(v ? '⚠️ Manutenção ativada!' : '✅ Desativada!')));
              },
            ),
          ],
        ))),
        const SizedBox(height: 12),

        // Mensagem Global
        Card(color: const Color(0xFF1A1A1A), child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('📢 Mensagem Global', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text('Aparece para todos os jogadores online.', style: TextStyle(color: Colors.grey, fontSize: 12)),
          const SizedBox(height: 12),
          TextField(controller: _msgCtrl, maxLines: 3, decoration: const InputDecoration(hintText: 'Ex: Nova versão disponível!', border: OutlineInputBorder())),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: ElevatedButton(
              onPressed: () async {
                await _fs.salvarMensagemGlobal(_msgCtrl.text.trim());
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Mensagem salva!')));
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE8A838)),
              child: const Text('Enviar', style: TextStyle(color: Colors.black)),
            )),
            const SizedBox(width: 8),
            OutlinedButton(onPressed: () async {
              _msgCtrl.clear();
              await _fs.salvarMensagemGlobal('');
              if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mensagem removida.')));
            }, child: const Text('Limpar')),
          ]),
        ]))),
        const SizedBox(height: 12),

        // Admins
        Card(color: const Color(0xFF1A1A1A), child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('👑 Admins', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ..._admins.map((uid) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(children: [
              Expanded(child: Text(uid, style: const TextStyle(fontSize: 12, fontFamily: 'monospace'), overflow: TextOverflow.ellipsis)),
              IconButton(icon: const Icon(Icons.close, color: Colors.red, size: 18), onPressed: () async {
                await _fs.removerAdmin(uid, _admins);
                _carregar();
              }),
            ]),
          )),
          const SizedBox(height: 8),
          Row(children: [
            Expanded(child: TextField(controller: _adminCtrl, decoration: const InputDecoration(hintText: 'UID do novo admin', border: OutlineInputBorder()), style: const TextStyle(fontSize: 13))),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: () async {
                final uid = _adminCtrl.text.trim();
                if (uid.isEmpty) return;
                await _fs.adicionarAdmin(uid, _admins);
                _adminCtrl.clear();
                _carregar();
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE8A838)),
              child: const Text('Add', style: TextStyle(color: Colors.black)),
            ),
          ]),
        ]))),
      ]),
    );
  }
}
