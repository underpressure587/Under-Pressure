import 'package:flutter/material.dart';
import '../engine/models.dart';
import '../engine/game_engine.dart';
import '../data/sector_data.dart';
import '../theme/app_theme.dart';
import '../widgets/app_widgets.dart';
import 'game_screen.dart';

class IntroScreen extends StatefulWidget {
  final GameState state;

  const IntroScreen({super.key, required this.state});

  @override
  State<IntroScreen> createState() => _IntroScreenState();
}

class _IntroScreenState extends State<IntroScreen> {
  int _secao = 0;
  bool _ready = false;

  IntroData get _intro {
    final intros = introsForSector(widget.state.sector);
    return intros[widget.state.introIndex];
  }

  void _avancar() {
    final total = _intro.secoes.length;
    if (_secao < total - 1) {
      setState(() => _secao++);
    } else {
      setState(() => _ready = true);
    }
  }

  void _iniciarJogo() {
    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 350),
        pageBuilder: (_, __, ___) =>
            GameScreen(state: widget.state),
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final intro = _intro;
    final secoes = intro.secoes;

    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(
          children: [
            // ── Top bar ──────────────────────────────────
            _TopBar(
              sector: widget.state.sector,
              badge: intro.badge,
            ),

            // ── Body ─────────────────────────────────────
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 250),
                child: _ready
                    ? _ReadyPanel(
                        key: const ValueKey('ready'),
                        state: widget.state,
                        intro: intro,
                        onIniciar: _iniciarJogo,
                      )
                    : _SecaoPanel(
                        key: ValueKey(_secao),
                        secao: secoes[_secao],
                        index: _secao,
                        total: secoes.length,
                        onAvancar: _avancar,
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Top bar ───────────────────────────────────────────
class _TopBar extends StatelessWidget {
  final String sector;
  final String badge;

  const _TopBar({required this.sector, required this.badge});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppTheme.line)),
      ),
      child: Row(
        children: [
          Text(sectorIcon(sector),
              style: const TextStyle(fontSize: 20)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Briefing Executivo',
                    style: AppTheme.inter(
                        size: 10,
                        color: AppTheme.primary,
                        weight: FontWeight.w600)),
                Text(badge,
                    style: AppTheme.inter(
                        size: 12, color: AppTheme.t2),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Painel de seção ───────────────────────────────────
class _SecaoPanel extends StatelessWidget {
  final IntroSectionData secao;
  final int index;
  final int total;
  final VoidCallback onAvancar;

  const _SecaoPanel({
    super.key,
    required this.secao,
    required this.index,
    required this.total,
    required this.onAvancar,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Progress dots
          Row(
            children: List.generate(total, (i) => Container(
              width: i == index ? 20 : 6,
              height: 6,
              margin: const EdgeInsets.only(right: 4),
              decoration: BoxDecoration(
                color: i == index
                    ? AppTheme.primary
                    : AppTheme.bg4,
                borderRadius: BorderRadius.circular(99),
              ),
            )),
          ),
          const SizedBox(height: 24),

          // Ícone + título
          Row(
            children: [
              Text(secao.icone,
                  style: const TextStyle(fontSize: 28)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(secao.titulo,
                    style: AppTheme.syne(
                        size: 18,
                        weight: FontWeight.w700,
                        color: AppTheme.t1)),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Corpo
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.bg2,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppTheme.line2),
            ),
            child: Text(
              secao.corpo,
              style: AppTheme.inter(
                  size: 14, color: AppTheme.t2, height: 1.65),
            ),
          ),

          const Spacer(),

          PrimaryButton(
            label: index < total - 1
                ? 'Continuar  →'
                : 'Ver situação atual  →',
            onTap: onAvancar,
          ),
        ],
      ),
    );
  }
}

// ── Painel pronto para jogar ──────────────────────────
class _ReadyPanel extends StatelessWidget {
  final GameState state;
  final IntroData intro;
  final VoidCallback onIniciar;

  const _ReadyPanel({
    super.key,
    required this.state,
    required this.intro,
    required this.onIniciar,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Alerta
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.err.withOpacity(0.08),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                  color: AppTheme.err.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                Text(intro.alertaIcone,
                    style: const TextStyle(fontSize: 24)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(intro.alertaTitulo,
                          style: AppTheme.syne(
                              size: 14,
                              weight: FontWeight.w700,
                              color: AppTheme.err)),
                      const SizedBox(height: 4),
                      Text(intro.subtitulo,
                          style: AppTheme.inter(
                              size: 12,
                              color: AppTheme.t2,
                              height: 1.5)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Empresa
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.primaryBg,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppTheme.primaryBd),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Sua empresa',
                    style: AppTheme.inter(
                        size: 11, color: AppTheme.primary)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(sectorIcon(state.sector),
                        style: const TextStyle(fontSize: 22)),
                    const SizedBox(width: 8),
                    Text(
                      state.companyName,
                      style: AppTheme.syne(
                          size: 18,
                          weight: FontWeight.w800,
                          color: AppTheme.t1),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(sectorName(state.sector),
                    style: AppTheme.inter(
                        size: 12, color: AppTheme.t2)),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Regras rápidas
          _RegraCard(
            icon: Icons.fact_check_outlined,
            titulo: '15 rodadas, 4 escolhas cada',
            desc: 'Cada decisão afeta múltiplos indicadores da empresa.',
          ),
          const SizedBox(height: 8),
          _RegraCard(
            icon: Icons.warning_amber_rounded,
            titulo: 'Cuidado com indicadores críticos',
            desc:
                'Se qualquer indicador chegar a zero, o mandato termina antes do prazo.',
          ),

          const Spacer(),

          PrimaryButton(
            label: '${sectorIcon(state.sector)}  Assumir o Mandato',
            onTap: onIniciar,
          ),
        ],
      ),
    );
  }
}

class _RegraCard extends StatelessWidget {
  final IconData icon;
  final String titulo;
  final String desc;

  const _RegraCard(
      {required this.icon, required this.titulo, required this.desc});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.line2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppTheme.primary),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(titulo,
                    style: AppTheme.inter(
                        size: 13,
                        weight: FontWeight.w600,
                        color: AppTheme.t1)),
                const SizedBox(height: 2),
                Text(desc,
                    style: AppTheme.inter(
                        size: 12, color: AppTheme.t3, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
