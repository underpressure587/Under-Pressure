import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthService {
  static final _auth = FirebaseAuth.instance;
  static final _db   = FirebaseFirestore.instance;

  // ── Coleções ──────────────────────────────────────────
  static const _colUsers = 'usuarios';

  // ── Current user ─────────────────────────────────────
  static User? get currentUser => _auth.currentUser;
  static Stream<User?> get authStream => _auth.authStateChanges();

  // ── E-mail / Senha ────────────────────────────────────
  static Future<UserCredential> loginEmail(String email, String pass) =>
      _auth.signInWithEmailAndPassword(email: email, password: pass);

  static Future<UserCredential> registerEmail(
      String email, String pass, String nome) async {
    final cred = await _auth.createUserWithEmailAndPassword(
        email: email, password: pass);
    await cred.user!.updateDisplayName(nome);
    await _criarPerfil(cred.user!, nome);
    return cred;
  }

  static Future<void> sendPasswordReset(String email) =>
      _auth.sendPasswordResetEmail(email: email);

  // ── Google ────────────────────────────────────────────
  static Future<UserCredential?> loginGoogle() async {
    final gUser = await GoogleSignIn(
      serverClientId:
          '240438805750-30aegs2ra4pr6r961hcjmmt3iuj4iiel.apps.googleusercontent.com',
    ).signIn();
    if (gUser == null) return null;

    final gAuth = await gUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: gAuth.accessToken,
      idToken: gAuth.idToken,
    );
    final cred = await _auth.signInWithCredential(credential);

    final doc = await _db
        .collection(_colUsers)
        .doc(cred.user!.uid)
        .get();
    if (!doc.exists) {
      await _criarPerfil(
        cred.user!,
        gUser.displayName ?? 'Jogador',
        photoUrl: gUser.photoUrl,
      );
    }
    return cred;
  }

  // ── Convidado ─────────────────────────────────────────
  static Future<UserCredential> loginGuest() async {
    final cred = await _auth.signInAnonymously();
    await _criarPerfil(cred.user!, 'Convidado');
    return cred;
  }

  // ── Logout ────────────────────────────────────────────
  static Future<void> logout() async {
    await GoogleSignIn().signOut();
    await _auth.signOut();
  }

  // ── Criar perfil ──────────────────────────────────────
  static Future<void> _criarPerfil(User user, String nome,
      {String? photoUrl}) async {
    await _db.collection(_colUsers).doc(user.uid).set({
      'nome':        nome,
      'email':       user.email ?? '',
      'fotoUrl':     photoUrl ?? user.photoURL ?? '',
      'criadoEm':    FieldValue.serverTimestamp(),
      'totalJogos':  0,
      'melhorScore': 0,
    }, SetOptions(merge: true));
  }

  // ── Buscar perfil ─────────────────────────────────────
  static Future<Map<String, dynamic>?> buscarPerfil() async {
    final uid = currentUser?.uid;
    if (uid == null) return null;
    final doc = await _db.collection(_colUsers).doc(uid).get();
    return doc.exists ? doc.data() : null;
  }

  // ── Traduzir erro ─────────────────────────────────────
  static String traduzirErro(String code) {
    switch (code) {
      case 'user-not-found':        return 'E-mail não encontrado.';
      case 'wrong-password':        return 'Senha incorreta.';
      case 'email-already-in-use':  return 'E-mail já cadastrado.';
      case 'weak-password':         return 'Senha muito fraca (mín. 6 caracteres).';
      case 'invalid-email':         return 'E-mail inválido.';
      case 'network-request-failed':return 'Sem conexão. Verifique a internet.';
      case 'invalid-credential':    return 'E-mail ou senha incorretos.';
      default: return 'Erro: $code';
    }
  }
}
