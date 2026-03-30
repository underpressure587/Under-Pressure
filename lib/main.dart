import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'screens/login_screen.dart';

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
      home: const LoginScreen(), // fixo para diagnóstico
    );
  }
}
