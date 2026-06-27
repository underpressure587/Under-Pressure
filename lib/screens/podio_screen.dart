import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/game_service.dart';
import '../widgets/app_widgets.dart';

class PodioScreen extends StatefulWidget {
  const PodioScreen({super.key});

  @override
  State<PodioScreen> createState() => _PodioScreenState();
}

class _PodioScreenState extends State<PodioScreen> {
  String _filtro = 'all';
  List<Map<String, dynamic>> _items = [];
  bool _loading = true;

  final _filtros = [
    {'id': 'all',        'label': 'Todos'},
    {'id': 'tecnologia', 'label': '🚀 Tecnologia'},
    {'id': 'industria',  'label': '🏭 Indústria'},
    {'id': 'logistica',  'label': '🚚 Logística'},
    {'id': 'varejo',     'label': '🛒 Varejo'},
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final items = await GameService.buscarPodio(
      sector: _filtro == 'all' ? null : _filtro,
    );
    if (mounted) setState(() { _items = items; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
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
                Text('🏆  Pódio',
                    style: AppTheme.syne(size: 15, weight: FontWeight.w700, color: AppTheme.t1)),
              ]),
            ),
            const Divider(color: AppTheme.line, height: 1),
            SizedBox(
              height: 44,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                itemCount: _filtros.length,
                separatorBuilder: (_, __) => const SizedBox(width: 6),
                itemBuilder: (_, i) {
                  final f = _filtros[i];
                  final active = _filtro == f['id'];
                  return GestureDetector(
                    onTap: () { setState(() => _filtro = f['id']!); _load(); },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                      decoration: BoxDecoration(
                        color: active ? AppTheme.primary : AppTheme.bg3,
                        borderRadius: BorderRadius.circular(99),
                        border: Border.all(color: active ? AppTheme.primary : AppTheme.line2),
                      ),
                      child: Text(f['label']!,
                          style: AppTheme.inter(size: 12, weight: FontWeight.w600,
                              color: active ? Colors.black : AppTheme.t2)),
                    ),
                  );
                },
              ),
            ),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                  : _items.isEmpty
                      ? Center(child: Text('Nenhum resultado ainda.',
                          style: AppTheme.inter(color: AppTheme.t3)))
                      : ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _items.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (_, i) => _PodioRow(rank: i + 1, data: _items[i]),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PodioRow extends StatelessWidget {
  final int rank;
  final Map<String, dynamic> data;
  const _PodioRow({required this.rank, required this.data});

  Color get _rankColor {
    switch (rank) {
      case 1: return const Color(0xFFFFD700);
      case 2: return const Color(0xFFC0C0C0);
      case 3: return const Color(0xFFCD7F32);
      default: return AppTheme.t3;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppTheme.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: rank <= 3 ? _rankColor.withOpacity(0.3) : AppTheme.line2),
      ),
      child: Row(children: [
        SizedBox(
          width: 28,
          child: Text(
            rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : '#$rank',
            style: rank <= 3
                ? const TextStyle(fontSize: 20)
                : AppTheme.inter(size: 13, color: _rankColor),
            textAlign: TextAlign.center,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(data['player'] ?? 'Jogador',
                style: AppTheme.syne(size: 13, weight: FontWeight.w600, color: AppTheme.t1)),
            Text('${data['totalJogos'] ?? 0} mandatos',
                style: AppTheme.inter(size: 11, color: AppTheme.t3)),
          ],
        )),
        Text('${data['melhorScore'] ?? 0}',
            style: AppTheme.syne(size: 18, weight: FontWeight.w800,
                color: rank <= 3 ? _rankColor : AppTheme.primary)),
      ]),
    );
  }
}
