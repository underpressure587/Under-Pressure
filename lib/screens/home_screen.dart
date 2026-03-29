import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'jogadores_screen.dart';
import 'podio_screen.dart';
import 'sessoes_screen.dart';
import 'config_screen.dart';
import 'visao_geral_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _abaAtual = 0;

  final _abas = const [
    VisaoGeralScreen(),
    JogadoresScreen(),
    PodioScreen(),
    SessoesScreen(),
    ConfigScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin — Under Pressure'),
        backgroundColor: const Color(0xFF1A1A1A),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await FirebaseAuth.instance.signOut();
              if (mounted) Navigator.pushReplacementNamed(context, '/');
            },
          ),
        ],
      ),
      body: _abas[_abaAtual],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _abaAtual,
        onTap: (i) => setState(() => _abaAtual = i),
        backgroundColor: const Color(0xFF1A1A1A),
        selectedItemColor: const Color(0xFFE8A838),
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Geral'),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Jogadores'),
          BottomNavigationBarItem(icon: Icon(Icons.emoji_events), label: 'Pódio'),
          BottomNavigationBarItem(icon: Icon(Icons.computer), label: 'Sessões'),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'Config'),
        ],
      ),
    );
  }
}
