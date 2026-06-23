import 'package:flutter/material.dart';
import '../engine/game_engine.dart';
import '../theme/app_theme.dart';
import '../widgets/app_widgets.dart';
import 'intro_screen.dart';

class SectorScreen extends StatefulWidget {
  const SectorScreen({super.key});

  @override
  State<SectorScreen> createState() => _SectorScreenState();
}

class _SectorScreenState extends State<SectorScreen> {
  String? _setorSelecionado;
  final _nomeCtrl = TextEditingController();
  bool _timerOn = false;
  bool _treinoOn = false;

  final _setores = [
    {
      'id': 'tecnologia',
      'nome': 'Tecnologia',
      'tag': 'Escale sem quebrar o time',
      'emoji': '🚀',
      'color': const Color(0xFF5B8DEF),
    },
    {
      'id': 'industria',
      'nome': 'Indústria',
      'tag': 'Qualidade e segurança em escala',
      'emoji': '🏭',
      'color': const Color(0xFFE8711A),
    },
    {
      'id': 'logistica',
      'nome': 'Logística',
      'tag': 'SLA e eficiência operacional',
      'emoji': '🚚',
      'color': const Color(0xFF1FB885),
    },
    {
      'id': 'varejo',
      'nome': 'Varejo',
      'tag': 'Experiência e margem sob pressão',
      'emoji': '🛒',
      'color': const Color(0xFFD4A853),
    },
  ];

  void _lancarJogo() {
    if (_setorSelecionado == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Selecione um setor.',
              style: AppTheme.inter(color: AppTheme.t1)),
          backgroundColor: AppTheme.bg3,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
      return;
    }
    if (_nomeCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Digite o nome da empresa.',
              style: AppTheme.inter(color: AppTheme.t1)),
          backgroundColor: AppTheme.bg3,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
      return;
    }
    final state = GameEngine.iniciar(
      sector:       _setorSelecionado!,
      companyName:  _nomeCtrl.text.trim(),
      timerEnabled: _timerOn,
    );
    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 350),
        pageBuilder: (_, __, ___) => IntroScreen(state: state),
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Top ────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: BackBtn(),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Escolha o tipo\nde empresa',
                style: AppTheme.syne(
                    size: 26, weight: FontWeight.w800, color: AppTheme.t1),
              ),
            ),
            const SizedBox(height: 20),

            // ── Grid de setores ────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 1.3,
                children: _setores
                    .map((s) => _SectorCard(
                          setor: s,
                          selected: _setorSelecionado == s['id'],
                          onTap: () => setState(
                              () => _setorSelecionado = s['id'] as String),
                        ))
                    .toList(),
              ),
            ),
            const SizedBox(height: 16),

            // ── Nome da empresa ────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text('Nome da empresa',
                          style:
                              AppTheme.inter(size: 12, color: AppTheme.t2)),
                      Text(' *',
                          style:
                              AppTheme.inter(size: 12, color: AppTheme.err)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _nomeCtrl,
                    maxLength: 30,
                    style: AppTheme.inter(size: 15, color: AppTheme.t1),
                    decoration: InputDecoration(
                      hintText: 'Obrigatório — ex: Nexora S.A.',
                      hintStyle: AppTheme.inter(size: 14, color: AppTheme.t3),
                      counterText: '',
                      filled: true,
                      fillColor: AppTheme.bg3,
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide:
                              const BorderSide(color: AppTheme.line2)),
                      enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide:
                              const BorderSide(color: AppTheme.line2)),
                      focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                              color: AppTheme.primary, width: 1.5)),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 14),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // ── Toggles ────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  _ToggleRow(
                    label: 'Timer por rodada',
                    desc: '90 segundos por decisão',
                    value: _timerOn,
                    onToggle: (v) => setState(() => _timerOn = v),
                  ),
                  const SizedBox(height: 8),
                  _ToggleRow(
                    label: 'Modo Treino',
                    desc: 'Sem pontuação · Ideal para aprender',
                    value: _treinoOn,
                    onToggle: (v) => setState(() => _treinoOn = v),
                  ),
                ],
              ),
            ),

            const Spacer(),

            // ── CTA ────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              child: PrimaryButton(
                label: 'Assumir o Mandato',
                onTap: _lancarJogo,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Sector Card ───────────────────────────────────────────────
class _SectorCard extends StatelessWidget {
  final Map<String, dynamic> setor;
  final bool selected;
  final VoidCallback onTap;

  const _SectorCard(
      {required this.setor, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final color = setor['color'] as Color;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: selected ? color.withOpacity(0.12) : AppTheme.bg2,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: selected ? color.withOpacity(0.6) : AppTheme.line2,
            width: selected ? 1.5 : 1,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                      color: color.withOpacity(0.15),
                      blurRadius: 20,
                      spreadRadius: 2)
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(setor['emoji'] as String, style: const TextStyle(fontSize: 28)),
            const Spacer(),
            Text(
              setor['nome'] as String,
              style: AppTheme.syne(
                  size: 14,
                  weight: FontWeight.w700,
                  color: selected ? color : AppTheme.t1),
            ),
            const SizedBox(height: 2),
            Text(
              setor['tag'] as String,
              style: AppTheme.inter(size: 10, color: AppTheme.t3),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

// ── Toggle Row ────────────────────────────────────────────────
class _ToggleRow extends StatelessWidget {
  final String label;
  final String desc;
  final bool value;
  final ValueChanged<bool> onToggle;

  const _ToggleRow({
    required this.label,
    required this.desc,
    required this.value,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppTheme.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.line2),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: AppTheme.inter(
                        size: 13,
                        weight: FontWeight.w500,
                        color: AppTheme.t1)),
                Text(desc,
                    style: AppTheme.inter(size: 11, color: AppTheme.t3)),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onToggle,
            activeColor: AppTheme.primary,
            inactiveTrackColor: AppTheme.bg4,
            inactiveThumbColor: AppTheme.t3,
          ),
        ],
      ),
    );
  }
}
