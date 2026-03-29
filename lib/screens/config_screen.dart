import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
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
  String _mensagem = '';
  final _msgCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    setState(() => _loading = true);
    try {
      final doc = await _fs.getConfigGlobal();
      final d = doc.data() as Map<String, dynamic>? ?? {};
      setState(() {
        _manutencao = d['manutencao'] == true;
        _mensagem = d['mensagem'] ?? '';
        _msgCtrl.text = _mensagem;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _salvarMensagem() async {
    try {
      await FirebaseFirestore.instance
        .collection('config')
        .doc('global')
        .update({'mensagem': _msgCtrl.text.trim()});
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('✅ Mensagem salva!')),
      );
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            color: const Color(0xFF1A1A1A),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Modo manutenção', style: TextStyle(fontWeight: FontWeight.bold)),
                      Text(
                        _manutencao ? '⚠️ Ativo — jogadores bloqueados' : 'Desativado',
                        style: TextStyle(color: _manutencao ? Colors.orange : Colors.grey, fontSize: 12),
                      ),
                    ],
                  ),
                  Switch(
                    value: _manutencao,
                    activeColor: const Color(0xFFE8A838),
                    onChanged: (v) async {
                      setState(() => _manutencao = v);
                      await _fs.setManutencao(v);
                      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(v ? '⚠️ Manutenção ativada!' : '✅ Manutenção desativada!')),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            color: const Color(0xFF1A1A1A),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('📢 Mensagem Global', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text('Aparece para todos os jogadores online.', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _msgCtrl,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      hintText: 'Ex: Nova versão disponível!',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _salvarMensagem,
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE8A838)),
                        child: const Text('Enviar', style: TextStyle(color: Colors.black)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    OutlinedButton(
                      onPressed: () {
                        _msgCtrl.clear();
                        _salvarMensagem();
                      },
                      child: const Text('Limpar'),
                    ),
                  ]),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
