import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../widgets/app_widgets.dart';

class HistoricoScreen extends StatelessWidget {
  const HistoricoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final uid = AuthService.currentUser?.uid;

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
                  Text('📋  Histórico de Jogos',
                      style: AppTheme.syne(
                          size: 15,
                          weight: FontWeight.w700,
                          color: AppTheme.t1)),
                ],
              ),
            ),
            const Divider(color: AppTheme.line, height: 1),

            Expanded(
              child: uid == null
                  ? Center(
                      child: Text('Entre para ver seu histórico.',
                          style:
                              AppTheme.inter(color: AppTheme.t3)))
                  : StreamBuilder<QuerySnapshot>(
                      stream: FirebaseFirestore.instance
                          .collection('partidas')
                          .where('uid', isEqualTo: uid)
                          .orderBy('criadoEm', descending: true)
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
                            child: Text(
                                'Nenhum jogo registrado ainda.',
                                style: AppTheme.inter(
                                    color: AppTheme.t3)),
                          );
                        }
                        return ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: docs.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 8),
                          itemBuilder: (_, i) {
                            final d = docs[i].data()
                                as Map<String, dynamic>;
                            return _HistRow(data: d);
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

class _HistRow extends StatelessWidget {
  final Map<String, dynamic> data;
  const _HistRow({required this.data});

  String get _setorEmoji {
    switch (data['setor']) {
      case 'tecnologia': return '🚀';
      case 'industria':  return '🏭';
      case 'logistica':  return '🚚';
      case 'varejo':     return '🛒';
      default: return '🏢';
    }
  }

  @override
  Widget build(BuildContext context) {
    final score = data['score'] ?? 0;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.line2),
      ),
      child: Row(
        children: [
          Text(_setorEmoji, style: const TextStyle(fontSize: 26)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  data['nomeEmpresa'] ?? 'Empresa',
                  style: AppTheme.syne(
                      size: 13,
                      weight: FontWeight.w600,
                      color: AppTheme.t1),
                ),
                const SizedBox(height: 2),
                Text(
                  data['setor'] ?? '',
                  style:
                      AppTheme.inter(size: 11, color: AppTheme.t3),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '$score',
                style: AppTheme.syne(
                    size: 20,
                    weight: FontWeight.w800,
                    color: AppTheme.primary),
              ),
              Text('pts',
                  style:
                      AppTheme.inter(size: 10, color: AppTheme.t3)),
            ],
          ),
        ],
      ),
    );
  }
}
