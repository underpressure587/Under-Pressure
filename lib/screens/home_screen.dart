import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'visao_geral_screen.dart';
import 'jogadores_screen.dart';
import 'podio_screen.dart';
import 'sessoes_screen.dart';
import 'config_screen.dart';
import 'dashboard_screen.dart';
import 'historias_screen.dart';
import 'feedback_screen.dart';
import 'logs_screen.dart';
import 'versao_screen.dart';
import 'auditoria_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _secaoAtual = 0;

  final _secoes = const [
    {'label': 'Visão Geral',  'icon': Icons.dashboard,        'widget': VisaoGeralScreen()},
    {'label': 'Jogadores',    'icon': Icons.people,            'widget': JogadoresScreen()},
    {'label': 'Pódio',        'icon': Icons.emoji_events,      'widget': PodioScreen()},
    {'label': 'Sessões',      'icon': Icons.computer,          'widget': SessoesScreen()},
    {'label': 'Dashboard',    'icon': Icons.bar_chart,         'widget': DashboardScreen()},
    {'label': 'Histórias',    'icon': Icons.menu_book,         'widget': HistoriasScreen()},
    {'label': 'Feedback',     'icon': Icons.star,              'widget': FeedbackScreen()},
    {'label': 'Logs',         'icon': Icons.list_alt,          'widget': LogsScreen()},
    {'label': 'Versão',       'icon': Icons.system_update,     'widget': VersaoScreen()},
    {'label': 'Config',       'icon': Icons.settings,          'widget': ConfigScreen()},
    {'label': 'Auditoria',    'icon': Icons.security,          'widget': AuditoriaScreen()},
  ];

  Future<void> _sair() async {
    await FirebaseAuth.instance.signOut();
    await GoogleSignIn().signOut();
    if (mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
  }

  @override
  Widget build(BuildContext context) {
    final secao = _secoes[_secaoAtual];
    return Scaffold(
      appBar: AppBar(
        title: Text(secao['label'] as String),
        backgroundColor: const Color(0xFF1A1A1A),
        actions: [
          IconButton(icon: const Icon(Icons.logout), onPressed: _sair, tooltip: 'Sair'),
        ],
      ),
      drawer: Drawer(
        backgroundColor: const Color(0xFF111111),
        child: SafeArea(child: Column(children: [
          const Padding(
            padding: EdgeInsets.all(20),
            child: Row(children: [
              Icon(Icons.admin_panel_settings, color: Color(0xFFE8A838), size: 28),
              SizedBox(width: 12),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Under Pressure', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                Text('Painel Admin', style: TextStyle(color: Colors.grey, fontSize: 12)),
              ]),
            ]),
          ),
          const Divider(color: Color(0xFF2A2A2A)),
          Expanded(
            child: ListView.builder(
              itemCount: _secoes.length,
              itemBuilder: (ctx, i) {
                final s = _secoes[i];
                final ativo = i == _secaoAtual;
                return ListTile(
                  leading: Icon(s['icon'] as IconData, color: ativo ? const Color(0xFFE8A838) : Colors.grey, size: 22),
                  title: Text(s['label'] as String, style: TextStyle(color: ativo ? const Color(0xFFE8A838) : Colors.white, fontWeight: ativo ? FontWeight.bold : FontWeight.normal, fontSize: 14)),
                  selected: ativo,
                  selectedTileColor: const Color(0xFF1A1A1A),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  onTap: () { setState(() => _secaoAtual = i); Navigator.pop(ctx); },
                );
              },
            ),
          ),
          const Divider(color: Color(0xFF2A2A2A)),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red, size: 22),
            title: const Text('Sair', style: TextStyle(color: Colors.red, fontSize: 14)),
            onTap: _sair,
          ),
          const SizedBox(height: 8),
        ])),
      ),
      body: secao['widget'] as Widget,
    );
  }
}
