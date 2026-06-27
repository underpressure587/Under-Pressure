import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'firestore_service.dart';

class AuthService {
  static final _auth = FirebaseAuth.instance;

  static User? get currentUser => _auth.currentUser;
  static Stream<User?> get authStream => _auth.authStateChanges();

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

  static Future<UserCredential?> loginGoogle() async {
    final gUser = await GoogleSignIn(
      clientId: '240438805750-scqlag6e49onlppenvhphu0vefhut46f.apps.googleusercontent.com',
      serverClientId: '240438805750-30aegs2ra4pr6r961hcjmmt3iuj4iiel.apps.googleusercontent.com',
    ).signIn();
    if (gUser == null) return null;

    final gAuth = await gUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: gAuth.accessToken,
      idToken: gAuth.idToken,
    );
    final cred = await _auth.signInWithCredential(credential);

    final exists = await FirestoreService.getDoc('usuarios/${cred.user!.uid}');
    if (exists == null) {
      await _criarPerfil(cred.user!, gUser.displayName ?? 'Jogador',
          photoUrl: gUser.photoUrl);
    }
    return cred;
  }

  static Future<UserCredential> loginGuest() async {
    final cred = await _auth.signInAnonymously();
    await _criarPerfil(cred.user!, 'Convidado');
    return cred;
  }

  static Future<void> logout() async {
    await GoogleSignIn().signOut();
    await _auth.signOut();
  }

  static Future<void> _criarPerfil(User user, String nome,
      {String? photoUrl}) async {
    await FirestoreService.setDoc('usuarios/${user.uid}', {
      'nome':        nome,
      'email':       user.email ?? '',
      'fotoUrl':     photoUrl ?? user.photoURL ?? '',
      'totalJogos':  0,
      'melhorScore': 0,
    });
  }

  static Future<Map<String, dynamic>?> buscarPerfil() async {
    final uid = currentUser?.uid;
    if (uid == null) return null;
    return FirestoreService.getDoc('usuarios/$uid');
  }

  static String traduzirErro(String code) {
    switch (code) {
      case 'user-not-found':         return 'E-mail não encontrado.';
      case 'wrong-password':         return 'Senha incorreta.';
      case 'email-already-in-use':   return 'E-mail já cadastrado.';
      case 'weak-password':          return 'Senha muito fraca (mín. 6 caracteres).';
      case 'invalid-email':          return 'E-mail inválido.';
      case 'network-request-failed': return 'Sem conexão. Verifique a internet.';
      case 'invalid-credential':     return 'E-mail ou senha incorretos.';
      default: return 'Erro: $code';
    }
  }
}
