import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: const FirebaseOptions(
      apiKey: "AIzaSyA8R7vnuWAWWDfe2DHLhGJdZTsWiXC5u7g",
      appId: "1:240438805750:android:90ab3118d158050b8f58d7",
      messagingSenderId: "240438805750",
      projectId: "under-pressure-49320",
      storageBucket: "under-pressure-49320.firebasestorage.app",
    ),
  );
  runApp(const AdminApp());
}

class AdminApp extends StatelessWidget {
  const AdminApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Under Pressure Admin',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0F0F0F),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFE8A838),
        ),
      ),
      home: const AuthGate(),
    );
  }
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});
  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  bool _checandoAdmin = false;
  bool _isAdmin = false;
  String? _uidChecado;

  Future<void> _verificarAdmin(String uid) async {
    if (_uidChecado == uid) return;
    setState(() {
      _checandoAdmin = true;
      _uidChecado = uid;
    });
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      final doc = await FirebaseFirestore.instance
          .collection('config')
          .doc('admins')
          .get();
      final uids = List<String>.from(doc.data()?['uids'] ?? []);
      final admin = uids.contains(uid);
      if (mounted) {
        setState(() {
          _isAdmin = admin;
          _checandoAdmin = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isAdmin = false;
          _checandoAdmin = false;
          _uidChecado = null;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (ctx, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final user = snap.data;

        if (user == null) {
          _isAdmin = false;
          _uidChecado = null;
          return const LoginScreen();
        }

        if (!_checandoAdmin && _uidChecado != user.uid) {
          _verificarAdmin(user.uid);
        }

        if (_isAdmin) {
          return const HomeScreen();
        }

        return const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        );
      },
    );
  }
}
