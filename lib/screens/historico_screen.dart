import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../services/game_service.dart';
import '../widgets/app_widgets.dart';

class HistoricoScreen extends StatefulWidget {
  const HistoricoScreen({super.key});

  @override
  State<HistoricoScreen> createState() => _HistoricoScreenState();
}

class _HistoricoScreenState extends State<HistoricoScreen> {
  List<Map<String, dynamic>> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final items = await GameService.buscarHistorico();
    if (mounted) setState(() { _items = items; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    final uid = AuthService.currentUser?.uid;
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
              child: Row(children: [
                const BackBtn(),
                const SizedBox(width: 12),
                Text('📋  Histórico',
                    style: AppTheme.syne(size: 15, weight: FontWeight.w700, color: AppTheme.t1)),
              ]),
            ),
            const Divider(color: AppTheme.line, height: 1),
            Expanded(
              child: uid == null
                  ? Center(child: Text('Entre para ver seu histórico.',
                      style: AppTheme.inter(color: AppTheme.t3)))
                  : _loading
                      ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                      : _items.isEmpty
                          ? Center(child: Text('Nenhum mandato registrado ainda.',
                              style: AppTheme.inter(color: AppTheme.t3)))
                          : ListView.separated(
                              padding: const EdgeInsets.all(16),
                              itemCount: _items.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 8),
                              itemBuilder: (_, i) => _HistRow(data: _items[i]),
                            ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HistRow extends StatelessWidget {
  final Map<String, dynamic> data;
  const _HistRow({required this.data});

  String get _emoji {
    switch (data['sector']) {
      case 'tecnologia': return '🚀';
      case 'industria':  return '🏭';
      case 'logistica':  return '🚚';
      case 'varejo':     return '🛒';
      default: return '🏢';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.line2),
      ),
      child: Row(children: [
        Text(_emoji, style: const TextStyle(fontSize: 26)),
        const SizedBox(width: 12),
        Expanded(child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(data['companyName'] ?? 'Empresa',
                style: AppTheme.syne(size: 13, weight: FontWeight.w600, color: AppTheme.t1)),
            Text(data['sector'] ?? '',
                style: AppTheme.inter(size: 11, color: AppTheme.t3)),
          ],
        )),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text('${data['score'] ?? 0}',
              style: AppTheme.syne(size: 20, weight: FontWeight.w800, color: AppTheme.primary)),
          Text('pts', style: AppTheme.inter(size: 10, color: AppTheme.t3)),
        ]),
      ]),
    );
  }
}
