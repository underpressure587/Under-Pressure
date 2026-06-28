import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
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
    {'id': 'tecnologia', 'label': '🚀'},
    {'id': 'industria',  'label': '🏭'},
    {'id': 'logistica',  'label': '🚚'},
    {'id': 'varejo',     'label': '🛒'},
  ];

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    final items = await GameService.buscarPodio(
      sector: _filtro == 'all' ? null : _filtro,
    );
    if (mounted) setState(() { _items = items; _loading = false; });
  }

  int _getScore(Map<String, dynamic> p) {
    if (_filtro == 'all') return (p['melhorScore'] as num?)?.toInt() ?? 0;
    final mps = p['melhorPorSetor'] as Map? ?? {};
    return (mps[_filtro]?['score'] as num?)?.toInt() ?? 0;
  }

  String _getSub(Map<String, dynamic> p) {
    const icons = {'tecnologia': '🚀', 'varejo': '🛒', 'logistica': '🚚', 'industria': '🏭'};
    if (_filtro == 'all') {
      final t = (p['totalJogos'] as num?)?.toInt() ?? 1;
      return '$t jogo${t != 1 ? 's' : ''}';
    }
    final mps = p['melhorPorSetor'] as Map? ?? {};
    final cn  = mps[_filtro]?['companyName'] ?? '';
    return '${icons[_filtro] ?? '🏢'} $cn';
  }

  bool _isMe(Map<String, dynamic> p) =>
      AuthService.currentUser?.uid != null &&
      p['uid'] == AuthService.currentUser!.uid;

  String get _scoreLabel => _filtro == 'all' ? 'Melhor' : 'Score';

  @override
  Widget build(BuildContext context) {
    final sorted = [..._items]..sort((a, b) => _getScore(b).compareTo(_getScore(a)));
    final top3   = sorted.take(3).toList();
    final resto  = sorted.skip(3).toList();

    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(children: [
          _buildHeader(),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                : sorted.isEmpty
                    ? Center(child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Text('Nenhuma partida no ranking ainda.\nComplete um mandato para aparecer aqui.',
                            style: AppTheme.inter(size: 13, color: AppTheme.t3),
                            textAlign: TextAlign.center)))
                    : SingleChildScrollView(
                        child: Column(children: [
                          _Top3(top3: top3, getScore: _getScore, getSub: _getSub,
                              isMe: _isMe, scoreLabel: _scoreLabel),
                          if (resto.isNotEmpty) ...[
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                              child: Align(alignment: Alignment.centerLeft,
                                child: Text('A partir do 4º lugar',
                                    style: AppTheme.inter(size: 11, weight: FontWeight.w700,
                                        color: AppTheme.t3, letterSpacing: 0.06 * 11))),
                            ),
                            ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                              itemCount: resto.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 8),
                              itemBuilder: (_, i) => _PodioItem(
                                rank: i + 4,
                                data: resto[i],
                                score: _getScore(resto[i]),
                                sub: _getSub(resto[i]),
                                isMe: _isMe(resto[i]),
                                scoreLabel: _scoreLabel,
                              ),
                            ),
                          ],
                        ]),
                      ),
          ),
        ]),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      decoration: const BoxDecoration(
        color: Color(0xE60D0F14),
        border: Border(bottom: BorderSide(color: AppTheme.line)),
      ),
      child: Row(children: [
        const BackBtn(),
        const SizedBox(width: 12),
        Text('🏆 Pódio',
            style: AppTheme.syne(size: 16, weight: FontWeight.w700, color: AppTheme.t1)),
        const Spacer(),
        // Filtros no header (igual ao site)
        Row(children: _filtros.map((f) {
          final active = _filtro == f['id'];
          return GestureDetector(
            onTap: () { setState(() => _filtro = f['id']!); _load(); },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              margin: const EdgeInsets.only(left: 6),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: active ? AppTheme.primary.withOpacity(0.15) : AppTheme.bg2,
                borderRadius: BorderRadius.circular(99),
                border: Border.all(
                    color: active ? AppTheme.primaryBd : AppTheme.line2),
              ),
              child: Text(f['label']!,
                  style: AppTheme.inter(size: 12, weight: FontWeight.w600,
                      color: active ? AppTheme.primary : AppTheme.t3)),
            ),
          );
        }).toList()),
      ]),
    );
  }
}

// ── Top 3 Escada ─────────────────────────────────────
class _Top3 extends StatelessWidget {
  final List<Map<String, dynamic>> top3;
  final int Function(Map<String, dynamic>) getScore;
  final String Function(Map<String, dynamic>) getSub;
  final bool Function(Map<String, dynamic>) isMe;
  final String scoreLabel;
  const _Top3({required this.top3, required this.getScore,
      required this.getSub, required this.isMe, required this.scoreLabel});

  @override
  Widget build(BuildContext context) {
    // Ordem visual: 2º esquerda · 1º centro · 3º direita
    final slots = [
      top3.length > 1 ? {'p': top3[1], 'pos': 2, 'rk': 'silver'} : null,
      top3.isNotEmpty ? {'p': top3[0], 'pos': 1, 'rk': 'gold'}   : null,
      top3.length > 2 ? {'p': top3[2], 'pos': 3, 'rk': 'bronze'} : null,
    ];

    return Column(children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(12, 16, 12, 0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: slots.map((slot) {
            if (slot == null) return const Expanded(child: SizedBox());
            final p   = slot['p'] as Map<String, dynamic>;
            final pos = slot['pos'] as int;
            final rk  = slot['rk'] as String;
            return Expanded(child: _Top3Card(
              p: p, pos: pos, rk: rk,
              score: getScore(p), sub: getSub(p),
              isMe: isMe(p), scoreLabel: scoreLabel,
            ));
          }).toList(),
        ),
      ),
      // Linha base
      Container(
        height: 4,
        margin: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          borderRadius: const BorderRadius.only(
              bottomLeft: Radius.circular(4), bottomRight: Radius.circular(4)),
          gradient: const LinearGradient(colors: [
            Color(0x4DC07840), Color(0x80D4A853), Color(0x4D8A9CB0),
          ]),
        ),
      ),
      const SizedBox(height: 12),
    ]);
  }
}

class _Top3Card extends StatelessWidget {
  final Map<String, dynamic> p;
  final int pos, score;
  final String rk, sub, scoreLabel;
  final bool isMe;
  const _Top3Card({required this.p, required this.pos, required this.score,
      required this.rk, required this.sub, required this.isMe, required this.scoreLabel});

  Color get _rkColor {
    switch (rk) {
      case 'gold':   return const Color(0xFFD4A853);
      case 'silver': return const Color(0xFF8A9CB0);
      default:       return const Color(0xFFC07840);
    }
  }

  Color get _avatarBg {
    switch (rk) {
      case 'gold':   return const Color(0x26D4A853);
      case 'silver': return const Color(0x1F8A9CB0);
      default:       return const Color(0x1FC07840);
    }
  }

  double get _stepH { switch (pos) { case 1: return 80; case 2: return 56; default: return 40; } }
  double get _scoreSize { switch (pos) { case 1: return 24; case 2: return 20; default: return 18; } }
  double get _avatarSize { return pos == 1 ? 46 : 40; }

  Color get _stepBg {
    switch (rk) {
      case 'gold':   return const Color(0x2ED4A853);
      case 'silver': return const Color(0x238A9CB0);
      default:       return const Color(0x23C07840);
    }
  }

  Color get _stepBorder {
    switch (rk) {
      case 'gold':   return const Color(0x59D4A853);
      case 'silver': return const Color(0x408A9CB0);
      default:       return const Color(0x38C07840);
    }
  }

  String get _initial => ((p['player'] as String? ?? '?').isNotEmpty)
      ? (p['player'] as String)[0].toUpperCase()
      : '?';

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      // "Você" tag
      if (isMe)
        Container(
          margin: const EdgeInsets.only(bottom: 4),
          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
          decoration: BoxDecoration(
            color: AppTheme.primary.withOpacity(0.15),
            borderRadius: BorderRadius.circular(99),
          ),
          child: Text('Você',
              style: AppTheme.inter(size: 9, weight: FontWeight.w700,
                  color: AppTheme.primary, letterSpacing: 0.1 * 9)),
        ),
      // Avatar
      Container(
        width: _avatarSize, height: _avatarSize,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: _avatarBg,
          border: Border.all(color: _rkColor.withOpacity(0.5),
              width: pos == 1 ? 2 : 1.5),
          boxShadow: pos == 1 ? [BoxShadow(color: _rkColor.withOpacity(0.2), blurRadius: 16)] : null,
        ),
        child: Center(child: Text(_initial,
            style: AppTheme.syne(size: pos == 1 ? 21 : 18,
                weight: FontWeight.w700, color: _rkColor))),
      ),
      const SizedBox(height: 4),
      // Nome
      Text(p['player'] as String? ?? '?',
          style: AppTheme.syne(size: pos == 1 ? 13 : 12,
              weight: FontWeight.w700, color: AppTheme.t1),
          overflow: TextOverflow.ellipsis, maxLines: 1),
      // Sub
      Text(sub,
          style: AppTheme.inter(size: 10, color: AppTheme.t3),
          overflow: TextOverflow.ellipsis, maxLines: 1),
      const SizedBox(height: 4),
      // Score
      Text('$score',
          style: AppTheme.syne(size: _scoreSize,
              weight: FontWeight.w800, color: _rkColor)),
      Text(scoreLabel,
          style: AppTheme.inter(size: 9, weight: FontWeight.w700,
              color: AppTheme.t3, letterSpacing: 0.1 * 9)),
      const SizedBox(height: 6),
      // Degrau
      Container(
        width: double.infinity,
        height: _stepH,
        decoration: BoxDecoration(
          borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(6), topRight: Radius.circular(6)),
          gradient: LinearGradient(
            begin: Alignment.topCenter, end: Alignment.bottomCenter,
            colors: [_stepBg, _stepBg.withOpacity(0.1)],
          ),
          border: Border(
            top:   BorderSide(color: _stepBorder),
            left:  BorderSide(color: _stepBorder),
            right: BorderSide(color: _stepBorder),
          ),
          boxShadow: isMe ? [BoxShadow(color: AppTheme.primaryGlow, blurRadius: 20)] : null,
        ),
        child: Center(child: Text('${pos}º',
            style: AppTheme.syne(size: 16, weight: FontWeight.w800, color: _rkColor))),
      ),
    ]);
  }
}

// ── Item a partir do 4º ──────────────────────────────
class _PodioItem extends StatelessWidget {
  final int rank, score;
  final Map<String, dynamic> data;
  final String sub, scoreLabel;
  final bool isMe;
  const _PodioItem({required this.rank, required this.score, required this.data,
      required this.sub, required this.isMe, required this.scoreLabel});

  Color get _scoreColor {
    if (score >= 70) return const Color(0xFF22c55e);
    if (score >= 45) return const Color(0xFFf39c12);
    return AppTheme.err;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: isMe ? AppTheme.primary.withOpacity(0.07) : AppTheme.bg2,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
            color: isMe ? AppTheme.primaryBd : AppTheme.line),
      ),
      child: Row(children: [
        SizedBox(width: 30,
            child: Text('$rank',
                textAlign: TextAlign.center,
                style: AppTheme.syne(size: 22, weight: FontWeight.w700, color: AppTheme.t3))),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Flexible(child: Text(data['player'] as String? ?? 'Jogador',
                style: AppTheme.syne(size: 14, weight: FontWeight.w600, color: AppTheme.t1),
                overflow: TextOverflow.ellipsis)),
            if (isMe) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Text('Você',
                    style: AppTheme.inter(size: 9, weight: FontWeight.w700,
                        color: AppTheme.primary)),
              ),
            ],
          ]),
          const SizedBox(height: 2),
          Text(sub, style: AppTheme.inter(size: 12, color: AppTheme.t3)),
        ])),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text('$score',
              style: AppTheme.syne(size: 21, weight: FontWeight.w800, color: _scoreColor)),
          Text(scoreLabel,
              style: AppTheme.inter(size: 10, weight: FontWeight.w600,
                  color: AppTheme.t3, letterSpacing: 0.06 * 10)),
        ]),
      ]),
    );
  }
}
