import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../widgets/app_widgets.dart';

// ══ PERFIL ══════════════════════════════════════════════════
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _data;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final uid = AuthService.currentUser?.uid;
    if (uid == null) return;
    final doc = await FirebaseFirestore.instance
        .collection('usuarios')
        .doc(uid)
        .get();
    if (mounted && doc.exists) setState(() => _data = doc.data());
  }

  String get _nome {
    if (_data?['nome'] != null) return _data!['nome'];
    return AuthService.currentUser?.displayName ?? 'Jogador';
  }

  String get _initial =>
      _nome.isNotEmpty ? _nome[0].toUpperCase() : '?';

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
                  const Icon(Icons.person_outline_rounded,
                      size: 16, color: AppTheme.t2),
                  const SizedBox(width: 6),
                  Text('Meu Perfil',
                      style: AppTheme.syne(
                          size: 15,
                          weight: FontWeight.w700,
                          color: AppTheme.t1)),
                ],
              ),
            ),
            const Divider(color: AppTheme.line, height: 1),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    // Avatar
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: AppTheme.goldGradient,
                        border: Border.all(
                            color: AppTheme.primaryBd, width: 2),
                      ),
                      child: _data?['fotoUrl'] != null &&
                              (_data!['fotoUrl'] as String).isNotEmpty
                          ? ClipOval(
                              child: Image.network(
                                _data!['fotoUrl'],
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Center(
                                  child: Text(_initial,
                                      style: AppTheme.syne(
                                          size: 28,
                                          weight: FontWeight.w700,
                                          color: Colors.black)),
                                ),
                              ),
                            )
                          : Center(
                              child: Text(_initial,
                                  style: AppTheme.syne(
                                      size: 28,
                                      weight: FontWeight.w700,
                                      color: Colors.black)),
                            ),
                    ),
                    const SizedBox(height: 12),
                    Text(_nome,
                        style: AppTheme.syne(
                            size: 20,
                            weight: FontWeight.w700,
                            color: AppTheme.t1)),
                    const SizedBox(height: 4),
                    Text(
                      '${_data?['totalJogos'] ?? 0} mandatos concluídos',
                      style: AppTheme.inter(size: 13, color: AppTheme.t3),
                    ),
                    const SizedBox(height: 24),

                    // Stats
                    _StatsGrid(
                      totalJogos: _data?['totalJogos'] ?? 0,
                      melhorScore: _data?['melhorScore'] ?? 0,
                    ),
                    const SizedBox(height: 24),

                    // Conquistas placeholder
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.bg2,
                        borderRadius: BorderRadius.circular(14),
                        border:
                            Border.all(color: AppTheme.line2),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Conquistas',
                              style: AppTheme.syne(
                                  size: 13,
                                  weight: FontWeight.w700,
                                  color: AppTheme.t1)),
                          const SizedBox(height: 12),
                          Text(
                            'Suas conquistas aparecerão aqui após jogar.',
                            style: AppTheme.inter(
                                size: 13, color: AppTheme.t3),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatsGrid extends StatelessWidget {
  final int totalJogos;
  final int melhorScore;

  const _StatsGrid(
      {required this.totalJogos, required this.melhorScore});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
            child: _StatCard(
                label: 'Partidas', value: '$totalJogos')),
        const SizedBox(width: 10),
        Expanded(
            child: _StatCard(
                label: 'Melhor Score',
                value: melhorScore > 0 ? '$melhorScore' : '—')),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;

  const _StatCard({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: AppTheme.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.line2),
      ),
      child: Column(
        children: [
          Text(value,
              style: AppTheme.syne(
                  size: 24,
                  weight: FontWeight.w800,
                  color: AppTheme.primary)),
          const SizedBox(height: 4),
          Text(label,
              style: AppTheme.inter(size: 12, color: AppTheme.t3)),
        ],
      ),
    );
  }
}
