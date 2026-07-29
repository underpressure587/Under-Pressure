import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../engine/game_engine.dart';
import '../theme/app_theme.dart';
import '../widgets/app_widgets.dart';
import 'intro_screen.dart';
import '../services/toast_service.dart';

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
  final _rnd = Random();

  final _setores = [
    {
      'id': 'tecnologia',
      'nome': 'Tecnologia',
      'tag': 'Escale sem quebrar o time',
      'icon': 'assets/icons/sector_tecnologia.svg',
      'color': const Color(0xFF5B8DEF),
      'colorLight': const Color(0xFF7BA7FF),
    },
    {
      'id': 'industria',
      'nome': 'Indústria',
      'tag': 'Qualidade e segurança em escala',
      'icon': 'assets/icons/sector_industria.svg',
      'color': const Color(0xFFE8711A),
      'colorLight': const Color(0xFFFF9448),
    },
    {
      'id': 'logistica',
      'nome': 'Logística',
      'tag': 'SLA e eficiência operacional',
      'icon': 'assets/icons/sector_logistica.svg',
      'color': const Color(0xFF1FB885),
      'colorLight': const Color(0xFF3DD6A3),
    },
    {
      'id': 'varejo',
      'nome': 'Varejo',
      'tag': 'Experiência e margem sob pressão',
      'icon': 'assets/icons/sector_varejo.svg',
      'color': const Color(0xFFE8467A),
      'colorLight': const Color(0xFFFF6B9A),
    },
  ];

  // Mesma lista usada no site (BetaUI.gerarNomeAleatorio).
  static const _nomesAleatorios = [
    'Nexora S.A.', 'Veltrix Corp', 'Aurum Group', 'Solera Holding',
    'Kairos Ventures', 'Fenix Soluções', 'Orbis Gestão', 'Zentra S.A.',
    'Caldera Corp', 'Lumis Group', 'Veritas S.A.', 'Ápex Holding',
    'Norax Indústrias', 'Solum Gestão', 'Acera Corp', 'Trivela S.A.',
    'Polaris Group', 'Vexor Holding', 'Alcora S.A.', 'Mantis Corp',
    'Stratum Group', 'Fulcrum S.A.', 'Helix Ventures', 'Crestline Corp',
  ];

  Map<String, dynamic>? get _setorAtual {
    if (_setorSelecionado == null) return null;
    for (final s in _setores) {
      if (s['id'] == _setorSelecionado) return s;
    }
    return null;
  }

  // Cores do tema dinâmico: douradas por padrão, e migram para a cor
  // do setor assim que um é selecionado — igual ao #app[data-sector] do site.
  Color get _corPrincipal => (_setorAtual?['color'] as Color?) ?? AppTheme.primary;
  Color get _corSecundaria => (_setorAtual?['colorLight'] as Color?) ?? AppTheme.primaryLight;

  void _gerarNomeAleatorio() {
    String nome;
    do {
      nome = _nomesAleatorios[_rnd.nextInt(_nomesAleatorios.length)];
    } while (nome == _nomeCtrl.text && _nomesAleatorios.length > 1);
    setState(() => _nomeCtrl.text = nome);
  }

  void _mostrarInfo(String titulo, String corpo) {
    showDialog(
      context: context,
      barrierColor: Colors.black54,
      builder: (_) => Dialog(
        backgroundColor: AppTheme.bg2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        insetPadding: const EdgeInsets.symmetric(horizontal: 24),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(titulo,
                  style: AppTheme.syne(
                      size: 17, weight: FontWeight.w800, color: AppTheme.t1)),
              const SizedBox(height: 12),
              Text(corpo,
                  style:
                      AppTheme.inter(size: 13, color: AppTheme.t2, height: 1.55)),
              const SizedBox(height: 20),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text('Entendi',
                      style: AppTheme.inter(
                          size: 13,
                          weight: FontWeight.w700,
                          color: _corPrincipal)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _infoTimer() => _mostrarInfo(
        'Timer por Rodada',
        'Com o timer ativado, você tem 90 segundos para tomar cada decisão. '
        'O tempo aparece na tela durante a rodada e fica vermelho nos últimos '
        'segundos.\n\n'
        '⏰ Se o tempo esgotar sem você escolher uma opção, o jogo segue '
        'automaticamente com uma Decisão por Omissão — um resultado diferente '
        'de uma escolha ativa, geralmente pior, e que aumenta o Esgotamento '
        'do gestor.\n\n'
        'Deixar o tempo esgotar repetidas vezes acumula esgotamento até o '
        'limite. Se isso acontecer, o gestor entra em Paralisia Decisória — '
        'um colapso por excesso de indecisão que encerra o mandato antes do '
        'previsto.',
      );

  void _infoModoTreino() => _mostrarInfo(
        'Modo Treino',
        'No Modo Treino, você joga normalmente, mas o resultado não conta '
        'para o pódio nem fica salvo no seu histórico de partidas.\n\n'
        '🎓 Ideal para aprender as mecânicas, testar decisões diferentes ou '
        'simplesmente jogar sem a pressão de manter uma boa pontuação '
        'registrada.',
      );

  void _lancarJogo() {
    if (_setorSelecionado == null) {
      ToastService.aviso('Selecione um setor.');
      return;
    }
    if (_nomeCtrl.text.trim().isEmpty) {
      ToastService.aviso('Digite o nome da empresa.');
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
  void dispose() {
    _nomeCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeOut,
          // Glow suave no topo que migra para a cor do setor selecionado —
          // igual ao #screen-sector::before do site.
          decoration: BoxDecoration(
            gradient: RadialGradient(
              center: const Alignment(0, -1.15),
              radius: 0.9,
              colors: [
                _corPrincipal.withOpacity(0.20),
                Colors.transparent,
              ],
            ),
          ),
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
                  childAspectRatio: 1.18,
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
                        Text(
                          'NOME DA EMPRESA',
                          style: AppTheme.inter(
                            size: 10,
                            weight: FontWeight.w800,
                            color: AppTheme.t3,
                            letterSpacing: 1.1,
                          ),
                        ),
                        Text(' *',
                            style:
                                AppTheme.inter(size: 13, color: _corPrincipal)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _nomeCtrl,
                            maxLength: 30,
                            style: AppTheme.inter(size: 15, color: AppTheme.t1),
                            decoration: InputDecoration(
                              hintText: 'Obrigatório — ex: Nexora S.A.',
                              hintStyle:
                                  AppTheme.inter(size: 14, color: AppTheme.t3),
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
                                  borderSide:
                                      BorderSide(color: _corPrincipal, width: 1.5)),
                              contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 14),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Botão de nome aleatório — mesmo dado do site.
                        GestureDetector(
                          onTap: _gerarNomeAleatorio,
                          child: Container(
                            width: 44,
                            height: 44,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: AppTheme.bg3,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.line2),
                            ),
                            child: SvgPicture.asset(
                              'assets/icons/dice_icon.svg',
                              width: 20,
                              height: 20,
                            ),
                          ),
                        ),
                      ],
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
                      onInfo: _infoTimer,
                    ),
                    const SizedBox(height: 8),
                    _ToggleRow(
                      label: 'Modo Treino',
                      desc: 'Sem pontuação · Ideal para aprender',
                      value: _treinoOn,
                      onToggle: (v) => setState(() => _treinoOn = v),
                      onInfo: _infoModoTreino,
                    ),
                  ],
                ),
              ),

              const Spacer(),

              // ── CTA ────────────────────────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                child: _SectorCta(
                  label: 'Assumir o Mandato',
                  colorA: _corPrincipal,
                  colorB: _corSecundaria,
                  onTap: _lancarJogo,
                ),
              ),
            ],
          ),
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
        padding: const EdgeInsets.fromLTRB(14, 20, 14, 16),
        decoration: BoxDecoration(
          color: selected ? color.withOpacity(0.12) : AppTheme.bg2,
          borderRadius: BorderRadius.circular(18),
          // Borda já vem tingida da cor do setor mesmo sem seleção
          // (rgba(cor,.22) no site) — não é mais cinza neutra.
          border: Border.all(
            color: selected ? color : color.withOpacity(0.22),
            width: 1.5,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(color: color.withOpacity(0.22), spreadRadius: 3),
                  BoxShadow(
                      color: color.withOpacity(0.22),
                      blurRadius: 28,
                      offset: const Offset(0, 8)),
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            SvgPicture.asset(setor['icon'] as String, width: 32, height: 32),
            const SizedBox(height: 10),
            Text(
              setor['nome'] as String,
              textAlign: TextAlign.center,
              // O nome fica sempre claro (branco), não tingido da cor do
              // setor — igual ao .sector-card-name do site.
              style: AppTheme.syne(
                  size: 14,
                  weight: FontWeight.w800,
                  color: selected ? Colors.white : AppTheme.t1),
            ),
            const SizedBox(height: 3),
            Text(
              setor['tag'] as String,
              textAlign: TextAlign.center,
              maxLines: 2,
              style: AppTheme.inter(
                size: 10,
                color: selected ? Colors.white.withOpacity(0.7) : AppTheme.t3,
                height: 1.3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── CTA do setor — cor dinâmica conforme o setor escolhido ──────
class _SectorCta extends StatelessWidget {
  final String label;
  final Color colorA;
  final Color colorB;
  final VoidCallback onTap;

  const _SectorCta({
    required this.label,
    required this.colorA,
    required this.colorB,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 350),
        width: double.infinity,
        height: 52,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [colorA, colorB],
          ),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
                color: colorA.withOpacity(0.35),
                blurRadius: 20,
                offset: const Offset(0, 4)),
          ],
        ),
        // Texto branco e maiúsculo, igual ao .btn-primary do site
        // (o app atual usava texto preto).
        child: Text(
          label.toUpperCase(),
          style: AppTheme.inter(
            size: 13,
            weight: FontWeight.w700,
            color: Colors.white,
            letterSpacing: 0.8,
          ),
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
  final VoidCallback onInfo;

  const _ToggleRow({
    required this.label,
    required this.desc,
    required this.value,
    required this.onToggle,
    required this.onInfo,
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
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(label,
                        style: AppTheme.inter(
                            size: 13,
                            weight: FontWeight.w500,
                            color: AppTheme.t1)),
                    const SizedBox(width: 6),
                    // Ícone "i" que abre a explicação — existia no site
                    // e faltava no app.
                    _InfoIconBtn(onTap: onInfo),
                  ],
                ),
                const SizedBox(height: 2),
                Text(desc,
                    style: AppTheme.inter(size: 11, color: AppTheme.t3)),
              ],
            ),
          ),
          _IosToggle(value: value, onChanged: onToggle),
        ],
      ),
    );
  }
}

// ── Botão de informação "i" ──────────────────────────────────────
class _InfoIconBtn extends StatelessWidget {
  final VoidCallback onTap;
  const _InfoIconBtn({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        width: 15,
        height: 15,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: AppTheme.line3),
        ),
        child: Text(
          'i',
          style: AppTheme.syne(size: 9, weight: FontWeight.w700, color: AppTheme.t3)
              .copyWith(fontStyle: FontStyle.italic),
        ),
      ),
    );
  }
}

// ── Toggle estilo iOS (trilho + bolinha branca), igual ao site ──
// Substitui o Switch padrão do Material, que renderizava a bolinha
// apenas como um contorno oco em vez de preenchida.
class _IosToggle extends StatelessWidget {
  final bool value;
  final ValueChanged<bool> onChanged;

  const _IosToggle({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onChanged(!value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        width: 50,
        height: 28,
        padding: const EdgeInsets.all(3),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          color: value ? null : AppTheme.bg4,
          gradient: value
              ? const LinearGradient(
                  colors: [AppTheme.primary, AppTheme.primaryLight])
              : null,
          border: value ? null : Border.all(color: AppTheme.line2),
          boxShadow: value
              ? [BoxShadow(color: AppTheme.primaryGlow, blurRadius: 14)]
              : null,
        ),
        child: AnimatedAlign(
          duration: const Duration(milliseconds: 280),
          curve: Curves.easeOutBack,
          alignment: value ? Alignment.centerRight : Alignment.centerLeft,
          child: Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                    color: Colors.black.withOpacity(0.45),
                    blurRadius: 6,
                    offset: const Offset(0, 1)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
