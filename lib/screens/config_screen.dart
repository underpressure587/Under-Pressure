import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../widgets/app_widgets.dart';
import '../services/toast_service.dart';

class ConfigScreen extends StatefulWidget {
  const ConfigScreen({super.key});
  @override
  State<ConfigScreen> createState() => _ConfigScreenState();
}

class _ConfigScreenState extends State<ConfigScreen> {
  bool _fotoOn      = false;
  bool _cloudOn     = true;
  bool _statusOn    = true;
  String _nomeAtual = '';
  bool _salvando    = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final user  = AuthService.currentUser;
    setState(() {
      _fotoOn   = prefs.getBool('cfg_foto_on')   ?? false;
      _cloudOn  = prefs.getBool('cfg_cloud_on')  ?? true;
      _statusOn = prefs.getBool('cfg_status_on') ?? true;
      _nomeAtual = user?.displayName ?? '';
    });
  }

  Future<void> _salvarPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('cfg_foto_on',   _fotoOn);
    await prefs.setBool('cfg_cloud_on',  _cloudOn);
    await prefs.setBool('cfg_status_on', _statusOn);
  }

  void _editarNome() {
    final ctrl = TextEditingController(text: _nomeAtual);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.bg2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Nome de exibição',
            style: AppTheme.syne(size: 15, weight: FontWeight.w700, color: AppTheme.t1)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Text('Novo nome de exibição',
              style: AppTheme.inter(size: 12, color: AppTheme.t3)),
          const SizedBox(height: 8),
          TextField(
            controller: ctrl,
            autofocus: true,
            maxLength: 30,
            style: AppTheme.inter(size: 14, color: AppTheme.t1),
            decoration: InputDecoration(
              counterStyle: AppTheme.inter(size: 10, color: AppTheme.t3),
              filled: true, fillColor: AppTheme.bg3,
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppTheme.line2)),
              enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppTheme.line2)),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: AppTheme.primary)),
            ),
          ),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx),
              child: Text('Cancelar', style: AppTheme.inter(color: AppTheme.t2))),
          TextButton(
            onPressed: () async {
              final nome = ctrl.text.trim();
              if (nome.length < 2) {
                ToastService.aviso('Nome muito curto. Mínimo 2 caracteres.');
                return;
              }
              Navigator.pop(ctx);
              setState(() { _salvando = true; _nomeAtual = nome; });
              try {
                await AuthService.currentUser?.updateDisplayName(nome);
                final uid = AuthService.currentUser?.uid;
                if (uid != null) {
                  await FirestoreService.setDoc('usuarios/$uid', {'nome': nome});
                }
                if (mounted) ToastService.sucesso('Nome atualizado!');
              } catch (_) {
                if (mounted) ToastService.erroCritico('Erro ao salvar nome.');
              } finally {
                if (mounted) setState(() => _salvando = false);
              }
            },
            child: Text('Salvar',
                style: AppTheme.inter(color: AppTheme.primary, weight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  void _toggleFoto(bool val) {
    if (val) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: AppTheme.bg2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text('Exibir foto do Google?',
              style: AppTheme.syne(size: 15, weight: FontWeight.w700, color: AppTheme.t1)),
          content: Text('Sua foto ficará visível para outros jogadores no pódio.',
              style: AppTheme.inter(size: 13, color: AppTheme.t2)),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx),
                child: Text('Cancelar', style: AppTheme.inter(color: AppTheme.t2))),
            TextButton(onPressed: () {
              Navigator.pop(ctx);
              setState(() => _fotoOn = true);
              _salvarPrefs();
            }, child: Text('Confirmar',
                style: AppTheme.inter(color: AppTheme.primary, weight: FontWeight.w700))),
          ],
        ),
      );
    } else {
      setState(() => _fotoOn = false);
      _salvarPrefs();
    }
  }

  bool get _isGoogle => AuthService.currentUser?.providerData
      .any((p) => p.providerId == 'google.com') ?? false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(child: Column(children: [
        // Header
        Container(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
          decoration: const BoxDecoration(
            color: Color(0xE60D0F14),
            border: Border(bottom: BorderSide(color: AppTheme.line)),
          ),
          child: Row(children: [
            const BackBtn(),
            const SizedBox(width: 10),
            const Icon(Icons.settings_outlined, size: 15, color: AppTheme.t2),
            const SizedBox(width: 6),
            Text('Configurações',
                style: AppTheme.syne(size: 15, weight: FontWeight.w700, color: AppTheme.t1)),
          ]),
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

              // ── Perfil / Conta ───────────────────────
              _SectionTitle('Perfil / Conta'),
              _ConfigGroup(children: [
                _ConfigItem(
                  iconBg: const Color(0x1F8B5CF6),
                  iconColor: const Color(0xFF8B5CF6),
                  icon: Icons.person_outline_rounded,
                  label: 'Nome de exibição',
                  desc: _salvando ? 'Salvando...' : (_nomeAtual.isNotEmpty ? _nomeAtual : '—'),
                  trailing: TextButton(
                    onPressed: _editarNome,
                    child: Text('Editar',
                        style: AppTheme.inter(size: 12, weight: FontWeight.w600,
                            color: AppTheme.primary)),
                  ),
                ),
                if (_isGoogle) _ConfigItem(
                  iconBg: const Color(0x1F3B82F6),
                  iconColor: const Color(0xFF3B82F6),
                  icon: Icons.image_outlined,
                  label: 'Foto do Google',
                  desc: 'Visível para outros jogadores',
                  isLast: true,
                  trailing: _Toggle(value: _fotoOn, onChanged: _toggleFoto),
                ),
                if (!_isGoogle) _ConfigItem(
                  iconBg: const Color(0x1F3B82F6),
                  iconColor: const Color(0xFF3B82F6),
                  icon: Icons.image_outlined,
                  label: 'Foto do Google',
                  desc: 'Disponível para contas Google',
                  isLast: true,
                  trailing: const _SoonBadge(),
                ),
              ]),
              const SizedBox(height: 16),

              // ── Visual ───────────────────────────────
              _SectionTitle('Visual'),
              _ConfigGroup(children: [
                _ConfigItem(
                  iconBg: const Color(0x1FEAB308),
                  iconColor: const Color(0xFFEAB308),
                  icon: Icons.light_mode_outlined,
                  label: 'Tema e aparência',
                  desc: 'Claro, escuro e tamanho de fonte',
                  isLast: true,
                  trailing: const _SoonBadge(),
                ),
              ]),
              const SizedBox(height: 16),

              // ── Jogo ─────────────────────────────────
              _SectionTitle('Jogo'),
              _ConfigGroup(children: [
                _ConfigItem(
                  iconBg: const Color(0x1F10B981),
                  iconColor: const Color(0xFF10B981),
                  icon: Icons.info_outline_rounded,
                  label: 'Mostrar dicas',
                  desc: 'Dicas durante a partida',
                  isLast: true,
                  trailing: const _SoonBadge(),
                ),
              ]),
              const SizedBox(height: 16),

              // ── Sistema ──────────────────────────────
              _SectionTitle('Sistema'),
              _ConfigGroup(children: [
                _ConfigItem(
                  iconBg: const Color(0x1F14B8A6),
                  iconColor: const Color(0xFF14B8A6),
                  icon: Icons.cloud_outlined,
                  label: 'Salvamento na nuvem',
                  desc: 'Exibir status de sincronização',
                  trailing: _Toggle(
                    value: _cloudOn,
                    onChanged: (v) { setState(() => _cloudOn = v); _salvarPrefs(); },
                  ),
                ),
                _ConfigItem(
                  iconBg: const Color(0x1F22C55E),
                  iconColor: const Color(0xFF22C55E),
                  icon: Icons.circle_outlined,
                  label: 'Mostrar status online',
                  desc: 'Exibe conexão e ping no menu',
                  trailing: _Toggle(
                    value: _statusOn,
                    onChanged: (v) { setState(() => _statusOn = v); _salvarPrefs(); },
                  ),
                ),
                _ConfigItem(
                  iconBg: const Color(0x1FF97316),
                  iconColor: const Color(0xFFF97316),
                  icon: Icons.play_arrow_rounded,
                  label: 'Rever tutorial',
                  isLast: true,
                  trailing: TextButton(
                    onPressed: () => ToastService.aviso('Tutorial em breve!'),
                    child: Text('Ver',
                        style: AppTheme.inter(size: 12, weight: FontWeight.w600,
                            color: AppTheme.primary)),
                  ),
                ),
              ]),
              const SizedBox(height: 24),

              Center(child: Text('v6.0 · Under Pressure · Beta',
                  style: AppTheme.inter(size: 11, color: AppTheme.t3))),
              const SizedBox(height: 8),
            ]),
          ),
        ),
      ])),
    );
  }
}

// ── Widgets ───────────────────────────────────────────

class _SectionTitle extends StatelessWidget {
  final String text;
  const _SectionTitle(this.text);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Text(text.toUpperCase(),
        style: AppTheme.inter(size: 9, weight: FontWeight.w700,
            color: AppTheme.t3, letterSpacing: 0.12 * 9)),
  );
}

class _ConfigGroup extends StatelessWidget {
  final List<Widget> children;
  const _ConfigGroup({required this.children});
  @override
  Widget build(BuildContext context) => Container(
    decoration: BoxDecoration(
      color: AppTheme.bg2,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppTheme.line2),
    ),
    child: Column(children: children),
  );
}

class _ConfigItem extends StatelessWidget {
  final Color iconBg, iconColor;
  final IconData icon;
  final String label;
  final String? desc;
  final Widget? trailing;
  final bool isLast;

  const _ConfigItem({
    required this.iconBg, required this.iconColor,
    required this.icon, required this.label,
    this.desc, this.trailing, this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        border: isLast ? null : const Border(
            bottom: BorderSide(color: AppTheme.line)),
      ),
      child: Row(children: [
        Container(
          width: 34, height: 34,
          decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, size: 16, color: iconColor),
        ),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label,
              style: AppTheme.inter(size: 13, weight: FontWeight.w600, color: AppTheme.t1)),
          if (desc != null) Text(desc!,
              style: AppTheme.inter(size: 11, color: AppTheme.t3)),
        ])),
        if (trailing != null) trailing!,
      ]),
    );
  }
}

class _Toggle extends StatelessWidget {
  final bool value;
  final ValueChanged<bool> onChanged;
  const _Toggle({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: () => onChanged(!value),
    child: AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: 48, height: 26,
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: value ? AppTheme.primary : AppTheme.bg4,
        borderRadius: BorderRadius.circular(99),
      ),
      child: AnimatedAlign(
        duration: const Duration(milliseconds: 200),
        alignment: value ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          width: 20, height: 20,
          decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
        ),
      ),
    ),
  );
}

class _SoonBadge extends StatelessWidget {
  const _SoonBadge();
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color: AppTheme.bg4,
      borderRadius: BorderRadius.circular(99),
      border: Border.all(color: AppTheme.line2),
    ),
    child: Text('Em breve',
        style: AppTheme.inter(size: 10, color: AppTheme.t3)),
  );
}
