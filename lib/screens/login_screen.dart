import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../services/firestore_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _loading = false;
  final List<String> _logs = [];

  void _log(String msg) {
    debugPrint('[LOGIN] $msg');
    setState(() => _logs.add(msg));
  }

  Future<void> _loginComGoogle() async {
    setState(() { _loading = true; _logs.clear(); });
    _log('1. Iniciando Google Sign-In...');
    try {
      final googleUser = await GoogleSignIn(
        serverClientId: '240438805750-30aegs2ra4pr6r961hcjmmt3iuj4iiel.apps.googleusercontent.com',
      ).signIn();
      if (googleUser == null) {
        _log('Cancelado pelo usuário.');
        setState(() => _loading = false);
        return;
      }
      _log('2. Google OK: ${googleUser.email}');
      final googleAuth = await googleUser.authentication;
      _log('3. Token OK. idToken null: ${googleAuth.idToken == null}');
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      _log('4. Autenticando no Firebase...');
      final cred = await FirebaseAuth.instance
          .signInWithCredential(credential)
          .timeout(const Duration(seconds: 15));
      final uid = cred.user!.uid;
      _log('5. Auth OK. UID: $uid');
      _log('6. Verificando admin no Realtime Database...');
      bool admin = false;
      try {
        admin = await FirestoreService().isAdmin(
          uid,
          onStatus: (msg) => _log('   → $msg'),
        );
      } catch (e) {
        _log('ERRO ao verificar admin: $e');
        await FirebaseAuth.instance.signOut();
        await GoogleSignIn().signOut();
        setState(() => _loading = false);
        return;
      }
      _log('7. É admin: $admin');
      if (!admin) {
        await FirebaseAuth.instance.signOut();
        await GoogleSignIn().signOut();
        _log('Acesso negado — UID não encontrado.');
        setState(() => _loading = false);
        return;
      }
      _log('8. Acesso liberado! Redirecionando...');
      // AuthGate detecta e redireciona
    } catch (e) {
      _log('ERRO GERAL: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Icon(Icons.admin_panel_settings, size: 48, color: Color(0xFFE8A838)),
              const SizedBox(height: 8),
              const Text('Under Pressure — Admin',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _loginComGoogle,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE8A838),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: _loading
                    ? const SizedBox(
                        width: 20, height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                      )
                    : const Text('Entrar com Google',
                        style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1A1A1A),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: _logs.isEmpty
                    ? const Text('Logs aparecerão aqui...',
                        style: TextStyle(color: Colors.grey, fontSize: 12))
                    : ListView.builder(
                        itemCount: _logs.length,
                        itemBuilder: (_, i) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2),
                          child: SelectableText(
                            _logs[i],
                            style: TextStyle(
                              fontSize: 11,
                              fontFamily: 'monospace',
                              color: _logs[i].startsWith('ERRO') || _logs[i].contains('negado')
                                ? Colors.red
                                : _logs[i].startsWith('8.')
                                  ? Colors.greenAccent
                                  : Colors.green,
                            ),
                          ),
                        ),
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
