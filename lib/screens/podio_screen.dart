import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../theme/app_theme.dart';
import '../widgets/app_widgets.dart';

class PodioScreen extends StatefulWidget {
  const PodioScreen({super.key});

  @override
  State<PodioScreen> createState() => _PodioScreenState();
}

class _PodioScreenState extends State<PodioScreen> {
  String _filtro = 'all';

  final _filtros = [
    {'id': 'all', 'label': 'Todos'},
    {'id': 'tecnologia', 'label': '🚀'},
    {'id': 'industria', 'label': '🏭'},
    {'id': 'logistica', 'label': '🚚'},
    {'id': 'varejo', 'label': '🛒'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
              child: Row(
                children: [
                  const BackBtn(),
                  const SizedBox(width: 12),
                  Text('🏆  Pódio',
                      style: AppTheme.syne(
                          size: 15,
                          weight: FontWeight.w700,
                          color: AppTheme.t1)),
                ],
              ),
            ),
            const Divider(color: AppTheme.line, height: 1),

            // Filtros
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
                    onTap: () => setState(() => _filtro = f['id']!),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 4),
                      decoration: BoxDecoration(
                        color: active
                            ? AppTheme.primary
                            : AppTheme.bg3,
                        borderRadius: BorderRadius.circular(99),
                        border: Border.all(
                            color: active
                                ? AppTheme.primary
                                : AppTheme.line2),
                      ),
                      child: Text(
                        f['label']!,
                        style: AppTheme.inter(
                          size: 12,
                          weight: FontWeight.w600,
                          color: active ? Colors.black : AppTheme.t2,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            // Lista
            Expanded(
              child: StreamBuilder<QuerySnapshot>(
                stream: _filtro == 'all'
                    ? FirebaseFirestore.instance
                        .collection('partidas')
                        .orderBy('score', descending: true)
                        .limit(50)
                        .snapshots()
                    : FirebaseFirestore.instance
                        .collection('partidas')
                        .where('setor', isEqualTo: _filtro)
                        .orderBy('score', descending: true)
                        .limit(50)
                        .snapshots(),
                builder: (_, snap) {
                  if (snap.connectionState ==
                      ConnectionState.waiting) {
                    return const Center(
                        child: CircularProgressIndicator(
                            color: AppTheme.primary));
                  }
                  final docs = snap.data?.docs ?? [];
                  if (docs.isEmpty) {
                    return Center(
                      child: Text('Nenhum jogo finalizado ainda.',
                          style: AppTheme.inter(color: AppTheme.t3)),
                    );
                  }
                  return ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: docs.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: 8),
                    itemBuilder: (_, i) {
                      final d =
                          docs[i].data() as Map<String, dynamic>;
                      return _PodioRow(
                          rank: i + 1, data: d);
                    },
                  );
                },
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
        border: Border.all(
            color: rank <= 3
                ? _rankColor.withOpacity(0.3)
                : AppTheme.line2),
      ),
      child: Row(
        children: [
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
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  data['nomeJogador'] ?? 'Jogador',
                  style: AppTheme.syne(
                      size: 13,
                      weight: FontWeight.w600,
                      color: AppTheme.t1),
                ),
                Text(
                  '${data['nomeEmpresa'] ?? ''} · ${data['setor'] ?? ''}',
                  style: AppTheme.inter(size: 11, color: AppTheme.t3),
                ),
              ],
            ),
          ),
          Text(
            '${data['score'] ?? 0}',
            style: AppTheme.syne(
                size: 18,
                weight: FontWeight.w800,
                color: rank <= 3 ? _rankColor : AppTheme.primary),
          ),
        ],
      ),
    );
  }
}
