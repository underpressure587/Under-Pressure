import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/firestore_service.dart';

class ConfigScreen extends StatefulWidget {
  const ConfigScreen({super.key});
  @override
  State<ConfigScreen> createState() => _ConfigScreenState();
}

class _ConfigScreenState extends State<ConfigScreen> {
  final _fs = FirestoreService();
  bool _manutencao = false;
  bool _modoSala = false;
  bool _loading = true;
  bool _salvando = false;
  String? _erro;
  final _msgCtrl = TextEditingController();
  final _inicioCtrl = TextEditingController();
  final _fimCtrl = TextEditingController();
  final _liberadoCtrl = TextEditingController();
  List<dynamic> _liberados = [];
  List<String> _admins = [];
  String _adminOwner = '';
  final _adminCtrl = TextEditingController();

  @override
  void initState() { super.initState(); _carregar(); }

  @override
  void dispose() {
    _msgCtrl.dispose(); _inicioCtrl.dispose(); _fimCtrl.dispose();
    _liberadoCtrl.dispose(); _adminCtrl.dispose();
    super.dispose();
  }

  Future<void> _carregar() async {
    setState(() { _loading = true; _erro = null; });
    try {
      final cfg = await _fs.getConfigGlobal();
      final admsData = await _fs.getAdminsCompleto();
      setState(() {
        _manutencao = cfg['manutencao'] == true;
        _modoSala   = cfg['modoSalaAtivo'] == true;
        _msgCtrl.text    = cfg['mensagem'] as String? ?? '';
        _inicioCtrl.text = cfg['manutencaoInicio'] as String? ?? '';
        _fimCtrl.text    = cfg['manutencaoFim'] as String? ?? '';
        _liberados = (cfg['liberados'] as List?) ?? [];
        _admins = List<String>.from(admsData['uids'] as List);
        _adminOwner = admsData['owner'] as String? ?? '';
        _loading = false;
      });
    } catch (e) {
      setState(() { _erro = e.toString(); _loading = false; });
    }
  }

  Future<void> _salvar() async {
    setState(() => _salvando = true);
    try {
      await _fs.salvarConfigGlobal(
        manutencao: _manutencao,
        modoSalaAtivo: _modoSala,
        manutencaoInicio: _inicioCtrl.text.trim(),
        manutencaoFim: _fimCtrl.text.trim(),
        mensagem: _msgCtrl.text.trim(),
      );
      final uid = FirebaseAuth.instance.currentUser?.uid ?? 'desconhecido';
      await _fs.registrarAuditoria(_manutencao ? 'Manutenção ativada' : 'Manutenção desativada', uidAdmin: uid);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Configurações salvas!')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro: $e')));
    }
    setState(() => _salvando = false);
  }

  Future<void> _toggleLiberado(String uid, bool adicionar) async {
    try {
      await _fs.toggleLiberado(uid, adicionar);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(adicionar ? '✅ UID liberado' : '🚫 UID removido')));
      _carregar();
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

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

        // ── Manutenção ──────────────────────────────────────
        Card(color: const Color(0xFF1A1A1A), child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('🔧 Manutenção', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 12),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Modo manutenção'),
              Text(_manutencao ? '⚠️ Jogadores bloqueados' : 'Desativado',
                style: TextStyle(color: _manutencao ? Colors.orange : Colors.grey, fontSize: 12)),
            ]),
            Switch(value: _manutencao, activeColor: const Color(0xFFE8A838), onChanged: (v) => setState(() => _manutencao = v)),
          ]),
          const SizedBox(height: 8),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Text('Modo Sala'),
            Switch(value: _modoSala, activeColor: const Color(0xFFE8A838), onChanged: (v) => setState(() => _modoSala = v)),
          ]),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: TextField(controller: _inicioCtrl, decoration: const InputDecoration(labelText: 'Início (ISO)', border: OutlineInputBorder(), contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10)), style: const TextStyle(fontSize: 13))),
            const SizedBox(width: 8),
            Expanded(child: TextField(controller: _fimCtrl, decoration: const InputDecoration(labelText: 'Fim (ISO)', border: OutlineInputBorder(), contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10)), style: const TextStyle(fontSize: 13))),
          ]),
        ]))),
        const SizedBox(height: 12),

        // ── Mensagem Global ──────────────────────────────────
        Card(color: const Color(0xFF1A1A1A), child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('📢 Mensagem Global', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text('Aparece para todos os jogadores online.', style: TextStyle(color: Colors.grey, fontSize: 12)),
          const SizedBox(height: 12),
          TextField(controller: _msgCtrl, maxLines: 3, decoration: const InputDecoration(hintText: 'Ex: Nova versão disponível!', border: OutlineInputBorder())),
        ]))),
        const SizedBox(height: 12),

        // ── Salvar ───────────────────────────────────────────
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _salvando ? null : _salvar,
            icon: const Icon(Icons.save, color: Colors.black),
            label: Text(_salvando ? 'Salvando...' : 'Salvar Configurações', style: const TextStyle(color: Colors.black)),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE8A838), minimumSize: const Size.fromHeight(44)),
          ),
        ),
        const SizedBox(height: 20),

        // ── UIDs liberados durante manutenção ────────────────
        if (_manutencao) ...[
          Card(color: const Color(0xFF1A1A1A), child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('🔓 UIDs liberados em manutenção', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ..._liberados.map((u) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 3),
              child: Row(children: [
                Expanded(child: Text(u.toString(), style: const TextStyle(fontSize: 12, fontFamily: 'monospace'), overflow: TextOverflow.ellipsis)),
                IconButton(icon: const Icon(Icons.close, color: Colors.red, size: 18), onPressed: () => _toggleLiberado(u.toString(), false)),
              ]),
            )),
            const SizedBox(height: 8),
            Row(children: [
              Expanded(child: TextField(controller: _liberadoCtrl, decoration: const InputDecoration(hintText: 'UID a liberar', border: OutlineInputBorder()), style: const TextStyle(fontSize: 13))),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: () {
                  final uid = _liberadoCtrl.text.trim();
                  if (uid.isEmpty) return;
                  _liberadoCtrl.clear();
                  _toggleLiberado(uid, true);
                },
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE8A838)),
                child: const Text('Add', style: TextStyle(color: Colors.black)),
              ),
            ]),
          ]))),
          const SizedBox(height: 12),
        ],

        // ── Admins ────────────────────────────────────────────
        Card(color: const Color(0xFF1A1A1A), child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('👑 Admins', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ..._admins.map((uid) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(children: [
              if (uid == _adminOwner) const Text('👑 ', style: TextStyle(fontSize: 14)),
              Expanded(child: Text(uid, style: const TextStyle(fontSize: 12, fontFamily: 'monospace'), overflow: TextOverflow.ellipsis)),
              if (uid != _adminOwner)
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
