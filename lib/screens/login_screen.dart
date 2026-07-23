import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../widgets/app_widgets.dart';
import 'home_screen.dart';
import 'glossario_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  String _view = 'landing';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        transitionBuilder: (child, anim) =>
            FadeTransition(opacity: anim, child: child),
        child: _view == 'landing'
            ? _LandingScreen(
                key: const ValueKey('landing'),
                onEntrar: () => setState(() => _view = 'auth'),
              )
            : _AuthScreen(
                key: const ValueKey('auth'),
                onBack: () => setState(() => _view = 'landing'),
              ),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════
//  LANDING — idêntica ao web (mobile)
// ══════════════════════════════════════════════════════
class _LandingScreen extends StatefulWidget {
  final VoidCallback onEntrar;
  const _LandingScreen({super.key, required this.onEntrar});

  @override
  State<_LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<_LandingScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _floatCtrl;
  late Animation<double>   _floatY;

  @override
  void initState() {
    super.initState();
    _floatCtrl = AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 6000))
      ..repeat(reverse: true);
    _floatY = Tween(begin: -8.0, end: 8.0).animate(
        CurvedAnimation(parent: _floatCtrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() { _floatCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Stack(children: [
      // ── Grid background ──────────────────────────────
      Positioned.fill(child: CustomPaint(painter: _GridPainter())),

      // ── Radial glow fundo esquerdo-baixo ─────────────
      Positioned(
        bottom: -200, left: -200,
        child: Container(
          width: 600, height: 600,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(colors: [
              AppTheme.primary.withOpacity(0.07),
              Colors.transparent,
            ]),
          ),
        ),
      ),

      SafeArea(
        child: Column(children: [
          // ── Topbar ────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: Row(children: [
              _GhostBtn(
                label: '?',
                color: AppTheme.primary,
                onTap: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const GlossarioScreen())),
              ),
            ]),
          ),

          // ── Main — logo + textos ──────────────────────
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo flutuante com glow dourado
                AnimatedBuilder(
                  animation: _floatY,
                  builder: (_, child) => Transform.translate(
                    offset: Offset(0, _floatY.value),
                    child: child,
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primary.withOpacity(0.45),
                          blurRadius: 60,
                          spreadRadius: 10,
                        ),
                        BoxShadow(
                          color: const Color(0xFF1A3A6B).withOpacity(0.3),
                          blurRadius: 40,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: ClipOval(
                      child: Image.asset(
                        'assets/logo.jpg',
                        width: 200,
                        height: 200,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // Eyebrow
                Text(
                  'S I M U L A Ç Ã O  E X E C U T I V A  ·  B E T A',
                  style: AppTheme.inter(
                    size: 10,
                    color: AppTheme.t2.withOpacity(0.8),
                    weight: FontWeight.w500,
                    letterSpacing: 0.05 * 10,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),

                // Linha dourada
                Container(
                  width: 48, height: 3,
                  decoration: BoxDecoration(
                    gradient: AppTheme.goldGradient,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 20),

                // Descrição
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 44),
                  child: Text(
                    'Tome decisões reais. Enfrente crises verdadeiras. Aprenda gestão na prática.',
                    textAlign: TextAlign.center,
                    style: AppTheme.inter(
                        size: 14, color: AppTheme.t2, height: 1.9),
                  ),
                ),
              ],
            ),
          ),

          // ── Footer — botão CTA ────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 40),
            child: _GlowButton(
              label: 'Criar conta / Entrar',
              onTap: widget.onEntrar,
            ),
          ),
        ]),
      ),
    ]);
  }
}

// ══════════════════════════════════════════════════════
//  AUTH — Login / Cadastro / Recuperar
// ══════════════════════════════════════════════════════
class _AuthScreen extends StatefulWidget {
  final VoidCallback onBack;
  const _AuthScreen({super.key, required this.onBack});

  @override
  State<_AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<_AuthScreen> {
  String _tab     = 'login';
  bool   _loading = false;
  String _erro    = '';
  String _recOk   = '';

  final _loginEmail = TextEditingController();
  final _loginPass  = TextEditingController();
  final _regNome    = TextEditingController();
  final _regEmail   = TextEditingController();
  final _regPass    = TextEditingController();
  final _recEmail   = TextEditingController();

  @override
  void dispose() {
    _loginEmail.dispose(); _loginPass.dispose();
    _regNome.dispose(); _regEmail.dispose();
    _regPass.dispose(); _recEmail.dispose();
    super.dispose();
  }

  void _setErr(String m) => setState(() { _erro = m; _loading = false; });
  void _setLoad(bool v)  => setState(() { _loading = v; _erro = ''; });

  void _goHome() => Navigator.pushReplacement(
    context,
    PageRouteBuilder(
      transitionDuration: const Duration(milliseconds: 300),
      pageBuilder: (_, __, ___) => const HomeScreen(),
      transitionsBuilder: (_, a, __, child) =>
          FadeTransition(opacity: a, child: child),
    ),
  );

  Future<void> _login() async {
    if (_loginEmail.text.trim().isEmpty || _loginPass.text.isEmpty) {
      _setErr('Preencha e-mail e senha.'); return;
    }
    _setLoad(true);
    try {
      await AuthService.loginEmail(
          _loginEmail.text.trim(), _loginPass.text);
      _goHome();
    } on FirebaseAuthException catch (e) {
      _setErr(AuthService.traduzirErro(e.code));
    } catch (_) {
      _setErr('Erro inesperado. Tente novamente.');
    }
  }

  Future<void> _cadastrar() async {
    if (_regNome.text.trim().isEmpty)  { _setErr('Digite seu nome.'); return; }
    if (_regEmail.text.trim().isEmpty) { _setErr('Digite seu e-mail.'); return; }
    if (_regPass.text.length < 6)      { _setErr('Senha mínima de 6 caracteres.'); return; }
    _setLoad(true);
    try {
      await AuthService.registerEmail(
          _regEmail.text.trim(), _regPass.text, _regNome.text.trim());
      _goHome();
    } on FirebaseAuthException catch (e) {
      _setErr(AuthService.traduzirErro(e.code));
    } catch (_) {
      _setErr('Erro inesperado. Tente novamente.');
    }
  }

  Future<void> _google() async {
    _setLoad(true);
    try {
      final cred = await AuthService.loginGoogle();
      if (cred == null) { setState(() => _loading = false); return; }
      _goHome();
    } on FirebaseAuthException catch (e) {
      _setErr(AuthService.traduzirErro(e.code));
    } catch (_) {
      _setErr('Erro ao entrar com Google.');
    }
  }

  Future<void> _convidado() async {
    _setLoad(true);
    try {
      await AuthService.loginGuest();
      _goHome();
    } catch (_) {
      _setErr('Erro ao entrar como convidado.');
    }
  }

  Future<void> _recuperar() async {
    if (_recEmail.text.trim().isEmpty) { _setErr('Digite seu e-mail.'); return; }
    _setLoad(true);
    try {
      await AuthService.sendPasswordReset(_recEmail.text.trim());
      setState(() { _loading = false; _recOk = '✅ E-mail enviado!'; });
    } on FirebaseAuthException catch (e) {
      _setErr(AuthService.traduzirErro(e.code));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(children: [
          // ── Topbar ──────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Row(children: [
              BackBtn(onTap: widget.onBack),
              const Spacer(),
              // Logo pequena circular
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(
                    color: AppTheme.primary.withOpacity(0.4),
                    blurRadius: 8,
                  )],
                ),
                child: ClipOval(
                  child: Image.asset('assets/logo.jpg',
                      width: 34, height: 34, fit: BoxFit.cover),
                ),
              ),
              const Spacer(),
              const SizedBox(width: 36),
            ]),
          ),
          const SizedBox(height: 20),

          // ── Abas ────────────────────────────────────
          if (_tab != 'recuperar')
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Container(
                height: 44,
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: AppTheme.bg3,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.line2),
                ),
                child: Row(children: [
                  _Tab(label: 'Entrar',   active: _tab == 'login',
                      onTap: () => setState(() { _tab = 'login';    _erro = ''; })),
                  _Tab(label: 'Cadastrar', active: _tab == 'cadastro',
                      onTap: () => setState(() { _tab = 'cadastro'; _erro = ''; })),
                ]),
              ),
            ),

          // ── Body ────────────────────────────────────
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_erro.isNotEmpty) ...[
                    ErrorBox(_erro),
                    const SizedBox(height: 16),
                  ],

                  // ── LOGIN ──────────────────────────
                  if (_tab == 'login') ...[
                    AppInput(label: 'E-mail', placeholder: 'seu@email.com',
                        controller: _loginEmail,
                        keyboardType: TextInputType.emailAddress,
                        onSubmit: () => FocusScope.of(context).nextFocus()),
                    const SizedBox(height: 14),
                    AppInput(label: 'Senha', placeholder: '••••••••',
                        controller: _loginPass, isPassword: true,
                        onSubmit: _login),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerRight,
                      child: GestureDetector(
                        onTap: () => setState(
                            () { _tab = 'recuperar'; _erro = ''; }),
                        child: Text('Esqueci minha senha',
                            style: AppTheme.inter(
                                size: 12, color: AppTheme.primary)),
                      ),
                    ),
                    const SizedBox(height: 20),
                    _GlowButton(label: 'Entrar',
                        onTap: _loading ? null : _login,
                        loading: _loading),
                    const SizedBox(height: 14),
                    const OrDivider(),
                    const SizedBox(height: 14),
                    GoogleButton(label: 'Entrar com Google',
                        onTap: _loading ? null : _google,
                        loading: _loading),
                    const SizedBox(height: 10),
                    SecondaryButton(label: 'Entrar como Convidado',
                        onTap: _loading ? null : _convidado),
                  ],

                  // ── CADASTRO ───────────────────────
                  if (_tab == 'cadastro') ...[
                    AppInput(label: 'Seu nome',
                        placeholder: 'Como quer ser chamado',
                        controller: _regNome,
                        onSubmit: () => FocusScope.of(context).nextFocus()),
                    const SizedBox(height: 14),
                    AppInput(label: 'E-mail', placeholder: 'seu@email.com',
                        controller: _regEmail,
                        keyboardType: TextInputType.emailAddress,
                        onSubmit: () => FocusScope.of(context).nextFocus()),
                    const SizedBox(height: 14),
                    AppInput(label: 'Senha (mín. 6 caracteres)',
                        placeholder: '••••••••',
                        controller: _regPass, isPassword: true,
                        onSubmit: _cadastrar),
                    const SizedBox(height: 20),
                    _GlowButton(label: 'Criar conta',
                        onTap: _loading ? null : _cadastrar,
                        loading: _loading),
                    const SizedBox(height: 14),
                    const OrDivider(),
                    const SizedBox(height: 14),
                    GoogleButton(label: 'Cadastrar com Google',
                        onTap: _loading ? null : _google,
                        loading: _loading),
                    const SizedBox(height: 10),
                    SecondaryButton(label: 'Entrar como Convidado',
                        onTap: _loading ? null : _convidado),
                  ],

                  // ── RECUPERAR ──────────────────────
                  if (_tab == 'recuperar') ...[
                    Center(child: Column(children: [
                      Container(
                        width: 56, height: 56,
                        decoration: BoxDecoration(
                          color: AppTheme.primaryBg,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppTheme.primaryBd),
                        ),
                        child: const Icon(Icons.lock_reset_rounded,
                            color: AppTheme.primary, size: 26),
                      ),
                      const SizedBox(height: 12),
                      Text('Recuperar senha',
                          style: AppTheme.syne(size: 18,
                              weight: FontWeight.w700, color: AppTheme.t1)),
                      const SizedBox(height: 6),
                      Text(
                        'Digite seu e-mail e enviaremos um link para redefinir.',
                        textAlign: TextAlign.center,
                        style: AppTheme.inter(
                            size: 13, color: AppTheme.t2, height: 1.5),
                      ),
                    ])),
                    const SizedBox(height: 20),
                    if (_recOk.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.ok.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                              color: AppTheme.ok.withOpacity(0.3)),
                        ),
                        child: Text(_recOk,
                            style: AppTheme.inter(size: 13, color: AppTheme.ok)),
                      )
                    else ...[
                      AppInput(label: 'E-mail da conta',
                          placeholder: 'seu@email.com',
                          controller: _recEmail,
                          keyboardType: TextInputType.emailAddress,
                          onSubmit: _recuperar),
                      const SizedBox(height: 20),
                      _GlowButton(label: 'Enviar link',
                          onTap: _loading ? null : _recuperar,
                          loading: _loading),
                    ],
                    const SizedBox(height: 14),
                    Center(
                      child: GestureDetector(
                        onTap: () => setState(
                            () { _tab = 'login'; _erro = ''; _recOk = ''; }),
                        child: Text('← Voltar para o login',
                            style: AppTheme.inter(
                                size: 13, color: AppTheme.primary)),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ]),
      ),
    );
  }
}

// ══ WIDGETS LOCAIS ═════════════════════════════════════

// Grid background — idêntico ao web
class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = Colors.white.withOpacity(0.018)
      ..strokeWidth = 1;
    const step = 56.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), p);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), p);
    }
  }
  @override
  bool shouldRepaint(_) => false;
}

// Botão dourado com glow — igual ao web
class _GlowButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final bool loading;

  const _GlowButton(
      {required this.label, this.onTap, this.loading = false});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: loading ? null : onTap,
      child: Container(
        width: double.infinity,
        height: 56,
        decoration: BoxDecoration(
          gradient: AppTheme.goldGradient,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: AppTheme.primary.withOpacity(0.28),
              blurRadius: 28,
              spreadRadius: 2,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Center(
          child: loading
              ? const SizedBox(
                  width: 20, height: 20,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: Colors.black))
              : Text(label,
                  style: AppTheme.syne(
                    size: 14,
                    weight: FontWeight.w700,
                    color: Colors.black,
                    letterSpacing: 0.05 * 14,
                  )),
        ),
      ),
    );
  }
}

// Botão ghost (topbar da landing)
class _GhostBtn extends StatelessWidget {
  final IconData? icon;
  final String? label;
  final Color? color;
  final VoidCallback onTap;

  const _GhostBtn({this.icon, this.label, this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36, height: 36,
        decoration: BoxDecoration(
          color: AppTheme.bg2.withOpacity(0.7),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppTheme.line2),
        ),
        child: Center(
          child: icon != null
              ? Icon(icon, size: 16, color: color ?? AppTheme.t2)
              : Text(label ?? '',
                  style: AppTheme.syne(
                      size: 13,
                      weight: FontWeight.w700,
                      color: color ?? AppTheme.t2)),
        ),
      ),
    );
  }
}

// Tab pill
class _Tab extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _Tab({required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          height: double.infinity,
          decoration: BoxDecoration(
            color: active ? AppTheme.bg1 : Colors.transparent,
            borderRadius: BorderRadius.circular(9),
            border: active ? Border.all(color: AppTheme.line2) : null,
          ),
          alignment: Alignment.center,
          child: Text(label,
              style: AppTheme.inter(
                size: 13,
                weight: FontWeight.w600,
                color: active ? AppTheme.t1 : AppTheme.t3,
              )),
        ),
      ),
    );
  }
}
