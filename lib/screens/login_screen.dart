import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final List<String> _logs = [];
  bool _loading = false;

  void _log(String msg) {
    setState(() => _logs.add(msg));
  }

  Future<void> _loginComGoogle() async {
    setState(() { _logs.clear(); _loading = true; });
    _log('1. Iniciando Google Sign-In...');

    try {
      final googleUser = await GoogleSignIn(
        serverClientId: '240438805750-30aegs2ra4pr6r961hcjmmt3iuj4iiel.apps.googleusercontent.com',
      ).signIn();

      if (googleUser == null) {
        _log('PAROU: googleUser é null (cancelado)');
        setState(() => _loading = false);
        return;
      }
      _log('2. Google OK: ${googleUser.email}');

      final googleAuth = await googleUser.authentication;
      _log('3. Token obtido. idToken null: ${googleAuth.idToken == null}');

      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      _log('4. Fazendo signInWithCredential (timeout 10s)...');
      try {
        final cred = await FirebaseAuth.instance
            .signInWithCredential(credential)
            .timeout(const Duration(seconds: 10));
        final uid = cred.user!.uid;
        _log('5. Firebase Auth OK. UID: $uid');
      } catch (e) {
        _log('ERRO no signInWithCredential: $e');
        setState(() => _loading = false);
        return;
      }

      _log('6. Lendo config/admins...');
      try {
        final uid = FirebaseAuth.instance.currentUser!.uid;
        final doc = await FirebaseFirestore.instance
            .collection('config')
            .doc('admins')
            .get()
            .timeout(const Duration(seconds: 10));

        _log('7. Doc existe: ${doc.exists}');
        if (doc.exists) {
          final uids = List<String>.from(doc.data()?['uids'] ?? []);
          _log('8. UIDs no doc: $uids');
          _log('9. Contém meu UID: ${uids.contains(uid)}');
        }
      } catch (e) {
        _log('ERRO Firestore: $e');
      }

      _log('10. FIM do diagnóstico.');
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
                        style: TextStyle(color: Colors.grey))
                    : ListView.builder(
                        itemCount: _logs.length,
                        itemBuilder: (_, i) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2),
                          child: SelectableText(
                            _logs[i],
                            style: TextStyle(
                              fontSize: 11,
                              color: _logs[i].startsWith('ERRO') || _logs[i].startsWith('PAROU')
                                ? Colors.red
                                : Colors.green,
                              fontFamily: 'monospace',
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
