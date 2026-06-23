import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../widgets/app_widgets.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // 'landing' | 'login' | 'cadastro' | 'recuperar'
  String _view = 'landing';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 250),
        child: switch (_view) {
          'auth' => _AuthScreen(onBack: () => setState(() => _view = 'landing')),
          _ => _LandingScreen(onEntrar: () => setState(() => _view = 'auth')),
        },
      ),
    );
  }
}

// ══ LANDING ══════════════════════════════════════════════════
class _LandingScreen extends StatelessWidget {
  final VoidCallback onEntrar;
  const _LandingScreen({required this.onEntrar});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          // ── Main center ─────────────────────────────────────
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo
                Container(
                  width: 88,
                  height: 88,
                  decoration: BoxDecoration(
                    gradient: AppTheme.goldGradient,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                          color: AppTheme.primaryGlow,
                          blurRadius: 40,
                          spreadRadius: 4)
                    ],
                  ),
                  child: const Icon(Icons.star_rounded,
                      color: Colors.black, size: 44),
                ),
                const SizedBox(height: 24),
                Text('Simulação Executiva · Beta',
                    style: AppTheme.inter(
                        size: 11,
                        color: AppTheme.primary,
                        weight: FontWeight.w600)),
                const SizedBox(height: 8),
                Text('Under Pressure',
                    style: AppTheme.syne(
                        size: 28,
                        weight: FontWeight.w800,
                        color: AppTheme.t1)),
                const SizedBox(height: 12),
                Container(
                  width: 40,
                  height: 1,
                  color: AppTheme.line2,
                ),
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: Text(
                    'Tome decisões reais. Enfrente crises verdadeiras. Aprenda gestão na prática.',
                    textAlign: TextAlign.center,
                    style: AppTheme.inter(
                        size: 14, color: AppTheme.t2, height: 1.6),
                  ),
                ),
              ],
            ),
          ),

          // ── Footer CTA ──────────────────────────────────────
          Padding(
            padding:
                const EdgeInsets.fromLTRB(24, 0, 24, 32),
            child: PrimaryButton(
              label: 'Criar conta / Entrar',
              onTap: onEntrar,
            ),
          ),
        ],
      ),
    );
  }
}

// ══ AUTH SCREEN (Login / Cadastro / Recuperar) ════════════
class _AuthScreen extends StatefulWidget {
  final VoidCallback onBack;
  const _AuthScreen({required this.onBack});

  @override
  State<_AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<_AuthScreen> {
  String _tab = 'login'; // 'login' | 'cadastro' | 'recuperar'
  bool _loading = false;
  String _erro = '';
  String _recOk = '';

  // controllers login
  final _loginEmail = TextEditingController();
  final _loginPass  = TextEditingController();

  // controllers cadastro
  final _regNome  = TextEditingController();
  final _regEmail = TextEditingController();
  final _regPass  = TextEditingController();

  // controller recuperar
  final _recEmail = TextEditingController();

  @override
  void dispose() {
    _loginEmail.dispose(); _loginPass.dispose();
    _regNome.dispose(); _regEmail.dispose(); _regPass.dispose();
    _recEmail.dispose();
    super.dispose();
  }

  void _setErr(String msg) => setState(() { _erro = msg; _loading = false; });
  void _setLoad(bool v)    => setState(() { _loading = v; _erro = ''; });

  void _goHome() {
    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 300),
        pageBuilder: (_, __, ___) => const HomeScreen(),
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
      ),
    );
  }

  Future<void> _login() async {
    _setLoad(true);
    try {
      await AuthService.loginEmail(
          _loginEmail.text.trim(), _loginPass.text);
      _goHome();
    } on FirebaseAuthException catch (e) {
      _setErr(AuthService.traduzirErro(e.code));
    } catch (e) {
      _setErr('Erro inesperado. Tente novamente.');
    }
  }

  Future<void> _cadastrar() async {
    if (_regNome.text.trim().isEmpty) {
      _setErr('Digite seu nome.'); return;
    }
    _setLoad(true);
    try {
      await AuthService.registerEmail(
          _regEmail.text.trim(), _regPass.text, _regNome.text.trim());
      _goHome();
    } on FirebaseAuthException catch (e) {
      _setErr(AuthService.traduzirErro(e.code));
    } catch (e) {
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
    } catch (e) {
      _setErr('Erro ao entrar com Google.');
    }
  }

  Future<void> _convidado() async {
    _setLoad(true);
    try {
      await AuthService.loginGuest();
      _goHome();
    } catch (e) {
      _setErr('Erro ao entrar como convidado.');
    }
  }

  Future<void> _recuperar() async {
    if (_recEmail.text.trim().isEmpty) {
      _setErr('Digite seu e-mail.'); return;
    }
    _setLoad(true);
    try {
      await AuthService.sendPasswordReset(_recEmail.text.trim());
      setState(() {
        _loading = false;
        _recOk = '✅ E-mail enviado! Verifique sua caixa de entrada.';
      });
    } on FirebaseAuthException catch (e) {
      _setErr(AuthService.traduzirErro(e.code));
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          // ── Topbar ─────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Row(
              children: [
                BackBtn(onTap: widget.onBack),
                const Spacer(),
                Text('Under Pressure',
                    style: AppTheme.syne(
                        size: 15,
                        weight: FontWeight.w700,
                        color: AppTheme.t1)),
                const Spacer(),
                const SizedBox(width: 36),
              ],
            ),
          ),

          // ── Logo pequena ────────────────────────────────────
          const SizedBox(height: 20),
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              gradient: AppTheme.goldGradient,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                    color: AppTheme.primaryGlow,
                    blurRadius: 24,
                    spreadRadius: 2)
              ],
            ),
            child: const Icon(Icons.star_rounded,
                color: Colors.black, size: 26),
          ),
          const SizedBox(height: 20),

          // ── Abas (só em login/cadastro) ─────────────────────
          if (_tab != 'recuperar')
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Container(
                height: 42,
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: AppTheme.bg3,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.line2),
                ),
                child: Row(
                  children: [
                    _Tab(
                      label: 'Entrar',
                      active: _tab == 'login',
                      onTap: () => setState(() { _tab = 'login'; _erro = ''; }),
                    ),
                    _Tab(
                      label: 'Cadastrar',
                      active: _tab == 'cadastro',
                      onTap: () =>
                          setState(() { _tab = 'cadastro'; _erro = ''; }),
                    ),
                  ],
                ),
              ),
            ),

          // ── Body scrollável ─────────────────────────────────
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

                  // ── LOGIN ──────────────────────────────────
                  if (_tab == 'login') ...[
                    AppInput(
                      label: 'E-mail',
                      placeholder: 'seu@email.com',
                      controller: _loginEmail,
                      keyboardType: TextInputType.emailAddress,
                      onSubmit: () => FocusScope.of(context).nextFocus(),
                    ),
                    const SizedBox(height: 14),
                    AppInput(
                      label: 'Senha',
                      placeholder: '••••••••',
                      controller: _loginPass,
                      isPassword: true,
                      onSubmit: _login,
                    ),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerRight,
                      child: GestureDetector(
                        onTap: () =>
                            setState(() { _tab = 'recuperar'; _erro = ''; }),
                        child: Text('Esqueci minha senha',
                            style: AppTheme.inter(
                                size: 12, color: AppTheme.primary)),
                      ),
                    ),
                    const SizedBox(height: 20),
                    PrimaryButton(
                        label: 'Entrar', onTap: _login, loading: _loading),
                    const SizedBox(height: 14),
                    const OrDivider(),
                    const SizedBox(height: 14),
                    GoogleButton(
                        label: 'Entrar com Google',
                        onTap: _google,
                        loading: _loading),
                    const SizedBox(height: 10),
                    SecondaryButton(
                        label: 'Entrar como Convidado', onTap: _convidado),
                  ],

                  // ── CADASTRO ───────────────────────────────
                  if (_tab == 'cadastro') ...[
                    AppInput(
                      label: 'Seu nome',
                      placeholder: 'Como quer ser chamado',
                      controller: _regNome,
                      onSubmit: () => FocusScope.of(context).nextFocus(),
                    ),
                    const SizedBox(height: 14),
                    AppInput(
                      label: 'E-mail',
                      placeholder: 'seu@email.com',
                      controller: _regEmail,
                      keyboardType: TextInputType.emailAddress,
                      onSubmit: () => FocusScope.of(context).nextFocus(),
                    ),
                    const SizedBox(height: 14),
                    AppInput(
                      label: 'Senha (mín. 6 caracteres)',
                      placeholder: '••••••••',
                      controller: _regPass,
                      isPassword: true,
                      onSubmit: _cadastrar,
                    ),
                    const SizedBox(height: 20),
                    PrimaryButton(
                        label: 'Criar conta',
                        onTap: _cadastrar,
                        loading: _loading),
                    const SizedBox(height: 14),
                    const OrDivider(),
                    const SizedBox(height: 14),
                    GoogleButton(
                        label: 'Cadastrar com Google',
                        onTap: _google,
                        loading: _loading),
                    const SizedBox(height: 10),
                    SecondaryButton(
                        label: 'Entrar como Convidado', onTap: _convidado),
                  ],

                  // ── RECUPERAR ──────────────────────────────
                  if (_tab == 'recuperar') ...[
                    Center(
                      child: Column(
                        children: [
                          Container(
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(
                              color: AppTheme.primaryBg,
                              shape: BoxShape.circle,
                              border: Border.all(color: AppTheme.primaryBd),
                            ),
                            child: const Icon(Icons.lock_reset_rounded,
                                color: AppTheme.primary, size: 24),
                          ),
                          const SizedBox(height: 12),
                          Text('Recuperar senha',
                              style: AppTheme.syne(
                                  size: 18,
                                  weight: FontWeight.w700,
                                  color: AppTheme.t1)),
                          const SizedBox(height: 6),
                          Text(
                            'Digite seu e-mail e enviaremos um link para redefinir.',
                            textAlign: TextAlign.center,
                            style: AppTheme.inter(
                                size: 13, color: AppTheme.t2, height: 1.5),
                          ),
                        ],
                      ),
                    ),
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
                            style: AppTheme.inter(
                                size: 13, color: AppTheme.ok)),
                      )
                    else ...[
                      AppInput(
                        label: 'E-mail da conta',
                        placeholder: 'seu@email.com',
                        controller: _recEmail,
                        keyboardType: TextInputType.emailAddress,
                        onSubmit: _recuperar,
                      ),
                      const SizedBox(height: 20),
                      PrimaryButton(
                          label: 'Enviar link',
                          onTap: _recuperar,
                          loading: _loading),
                    ],
                    const SizedBox(height: 14),
                    Center(
                      child: GestureDetector(
                        onTap: () =>
                            setState(() { _tab = 'login'; _erro = ''; _recOk = ''; }),
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
        ],
      ),
    );
  }
}

// ── Tab pill ─────────────────────────────────────────────────
class _Tab extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _Tab(
      {required this.label, required this.active, required this.onTap});

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
            border: active
                ? Border.all(color: AppTheme.line2)
                : null,
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: AppTheme.inter(
              size: 13,
              weight: FontWeight.w600,
              color: active ? AppTheme.t1 : AppTheme.t3,
            ),
          ),
        ),
      ),
    );
  }
}
