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
  bool _loading = false;
  String _erro = '';

  Future<void> _loginComGoogle() async {
    setState(() { _loading = true; _erro = ''; });
    try {
      final googleUser = await GoogleSignIn(
        serverClientId: '240438805750-30aegs2ra4pr6r961hcjmmt3iuj4iiel.apps.googleusercontent.com',
      ).signIn();
      if (googleUser == null) {
        setState(() { _loading = false; _erro = 'Login cancelado.'; });
        return;
      }
      final googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      final cred = await FirebaseAuth.instance.signInWithCredential(credential);
      final uid = cred.user!.uid;

      // Diagnóstico: lê o documento diretamente e mostra o resultado na tela
      try {
        final doc = await FirebaseFirestore.instance
            .collection('config')
            .doc('admins')
            .get();

        if (!doc.exists) {
          await FirebaseAuth.instance.signOut();
          await GoogleSignIn().signOut();
          setState(() { _erro = 'ERRO: Documento config/admins não existe.'; });
          return;
        }

        final data = doc.data();
        final uids = List<String>.from(data?['uids'] ?? []);
        final contemUid = uids.contains(uid);

        if (!contemUid) {
          await FirebaseAuth.instance.signOut();
          await GoogleSignIn().signOut();
          setState(() {
            _erro = 'ERRO: UID não encontrado.\n\n'
                'Seu UID: $uid\n\n'
                'UIDs no doc: ${uids.join(', ')}';
          });
          return;
        }

        // É admin — AuthGate vai redirecionar

      } catch (e) {
        await FirebaseAuth.instance.signOut();
        await GoogleSignIn().signOut();
        setState(() { _erro = 'ERRO Firestore: $e'; });
        return;
      }

    } catch (e) {
      setState(() { _erro = 'ERRO login: $e'; });
    } finally {
      setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.admin_panel_settings, size: 64, color: Color(0xFFE8A838)),
              const SizedBox(height: 16),
              const Text('Under Pressure',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const Text('Painel Admin', style: TextStyle(color: Colors.grey)),
              const SizedBox(height: 48),
              if (_erro.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    border: Border.all(color: Colors.red),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: SelectableText(
                    _erro,
                    style: const TextStyle(color: Colors.red, fontSize: 12),
                  ),
                ),
                const SizedBox(height: 16),
              ],
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _loading ? null : _loginComGoogle,
                  icon: _loading
                    ? const SizedBox(
                        width: 20, height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                      )
                    : Image.network(
                        'https://www.google.com/favicon.ico',
                        width: 20, height: 20,
                        errorBuilder: (_, __, ___) =>
                          const Icon(Icons.login, color: Colors.black),
                      ),
                  label: const Text(
                    'Entrar com Google',
                    style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE8A838),
                    padding: const EdgeInsets.symmetric(vertical: 16),
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
