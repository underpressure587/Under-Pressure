import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/app_widgets.dart';
import '../services/inbox_service.dart';
import '../services/firestore_service.dart';

const _catIcones = {
  'geral': '💬',
  'aviso': '📢',
  'conquista': '🎉',
  'alerta': '⚠️',
};

String _formatarData(int ts) {
  if (ts == 0) return '';
  final d = DateTime.fromMillisecondsSinceEpoch(ts);
  String p2(int n) => n.toString().padLeft(2, '0');
  return '${p2(d.day)}/${p2(d.month)} ${p2(d.hour)}:${p2(d.minute)}';
}

class InboxScreen extends StatefulWidget {
  const InboxScreen({super.key});

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> {
  String _aba = 'mensagens'; // 'mensagens' | 'novidades'

  Map<String, dynamic>? _changelog;
  bool _changelogCarregado = false;

  @override
  void initState() {
    super.initState();
    // Marca como lidas as mensagens simples, igual ao site ao abrir a caixa.
    InboxService.marcarLidasSimples();
    _carregarChangelog();
  }

  Future<void> _carregarChangelog() async {
    final doc = await FirestoreService.getDoc('config/changelog');
    final agora = DateTime.now().millisecondsSinceEpoch;
    final expiraEm = (doc?['expiraEm'] as num?)?.toInt() ?? 0;
    if (mounted) {
      setState(() {
        _changelog = (doc != null && (expiraEm == 0 || expiraEm > agora))
            ? doc
            : null;
        _changelogCarregado = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(children: [
          // ── Header ──
          Container(
            padding: const EdgeInsets.fromLTRB(24, 14, 24, 12),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppTheme.line)),
            ),
            child: Row(children: [
              const BackBtn(),
              const SizedBox(width: 12),
              Text('📬 Comunicados',
                  style: AppTheme.syne(
                      size: 15, weight: FontWeight.w700, color: AppTheme.t1)),
            ]),
          ),

          // ── Abas ──
          Container(
            margin: const EdgeInsets.fromLTRB(20, 10, 20, 0),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppTheme.line)),
            ),
            child: Row(children: [
              _Aba(
                label: 'Mensagens',
                active: _aba == 'mensagens',
                onTap: () => setState(() => _aba = 'mensagens'),
              ),
              _Aba(
                label: 'Novidades',
                active: _aba == 'novidades',
                onTap: () => setState(() => _aba = 'novidades'),
              ),
            ]),
          ),

          Expanded(
            child: _aba == 'mensagens'
                ? _PainelMensagens()
                : _PainelNovidades(
                    changelog: _changelog,
                    carregado: _changelogCarregado,
                  ),
          ),
        ]),
      ),
    );
  }
}

// ── Aba com sublinhado ──────────────────────────────────
class _Aba extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _Aba({required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.only(right: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Text(label,
                  style: AppTheme.inter(
                      size: 12,
                      weight: FontWeight.w700,
                      color: active ? AppTheme.primary : AppTheme.t3)),
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              height: 2,
              width: active ? 28 : 0,
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Painel de mensagens ──────────────────────────────────
class _PainelMensagens extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<List<Mensagem>>(
      valueListenable: InboxService.mensagens,
      builder: (context, lista, _) {
        final naoLidas = lista.where((m) => !m.lida).length;

        return Column(children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
            child: Row(children: [
              Text(
                lista.isEmpty
                    ? 'Nenhum comunicado.'
                    : naoLidas > 0
                        ? '$naoLidas não lida${naoLidas > 1 ? 's' : ''} · ${lista.length} no total'
                        : '${lista.length} no total',
                style: AppTheme.inter(size: 11.5, color: AppTheme.t3),
              ),
            ]),
          ),
          Expanded(
            child: lista.isEmpty
                ? Center(
                    child: Text('Sua caixa de entrada está vazia.',
                        style:
                            AppTheme.inter(size: 13, color: AppTheme.t3)),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(20, 4, 20, 4),
                    itemCount: lista.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (_, i) => _MensagemCard(msg: lista[i]),
                  ),
          ),
          if (lista.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 16),
              child: Row(children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: naoLidas > 0
                        ? () => InboxService.marcarTodasLidas()
                        : null,
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppTheme.line2),
                      padding: const EdgeInsets.symmetric(vertical: 11),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                    child: Text('✅ Marcar todas lidas',
                        style: AppTheme.inter(
                            size: 12,
                            weight: FontWeight.w600,
                            color: naoLidas > 0
                                ? AppTheme.t2
                                : AppTheme.t3)),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () => _confirmarApagarTodas(context),
                  child: Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      border: Border.all(color: AppTheme.line2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.delete_outline_rounded,
                        size: 18, color: AppTheme.err),
                  ),
                ),
              ]),
            ),
        ]);
      },
    );
  }

  void _confirmarApagarTodas(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.bg2,
        title: Text('Apagar todas as mensagens?',
            style: AppTheme.syne(
                size: 14, weight: FontWeight.w700, color: AppTheme.t1)),
        content: Text('Essa ação não pode ser desfeita.',
            style: AppTheme.inter(size: 13, color: AppTheme.t2)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancelar',
                style: AppTheme.inter(color: AppTheme.t3)),
          ),
          TextButton(
            onPressed: () {
              InboxService.apagarTodas();
              Navigator.pop(context);
            },
            child: Text('Apagar',
                style: AppTheme.inter(
                    color: AppTheme.err, weight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

class _MensagemCard extends StatelessWidget {
  final Mensagem msg;
  const _MensagemCard({required this.msg});

  @override
  Widget build(BuildContext context) {
    final naoLida = !msg.lida;
    final precisaConfirmar =
        naoLida && msg.exigirConfirmacao && !msg.confirmada;

    return GestureDetector(
      onTap: naoLida && !msg.exigirConfirmacao
          ? () => InboxService.marcarLida(msg.id)
          : null,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: naoLida ? AppTheme.primaryBg : AppTheme.bg3,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: msg.fixada
                ? AppTheme.primary
                : naoLida
                    ? AppTheme.primaryBd
                    : AppTheme.line2,
            width: msg.fixada ? 1.4 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.bg4,
                  border: Border.all(color: AppTheme.line2),
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Text(
                    '${_catIcones[msg.categoria] ?? '💬'}  ${msg.categoria[0].toUpperCase()}${msg.categoria.substring(1)}',
                    style: AppTheme.inter(
                        size: 9.5,
                        weight: FontWeight.w600,
                        color: AppTheme.t2)),
              ),
              if (msg.fixada) ...[
                const SizedBox(width: 6),
                Text('📌 Fixado',
                    style: AppTheme.inter(
                        size: 9.5,
                        weight: FontWeight.w700,
                        color: AppTheme.primary)),
              ],
              const Spacer(),
              Text(_formatarData(msg.ts),
                  style: AppTheme.inter(size: 10, color: AppTheme.t3)),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () => InboxService.apagar(msg.id),
                child: const Icon(Icons.close_rounded,
                    size: 15, color: AppTheme.t3),
              ),
            ]),
            const SizedBox(height: 8),
            Text(msg.texto,
                style: AppTheme.inter(
                    size: 13,
                    color: naoLida ? AppTheme.t1 : AppTheme.t2,
                    height: 1.5)),
            if (naoLida && !msg.exigirConfirmacao) ...[
              const SizedBox(height: 6),
              Text('●  Não lido — toque para marcar',
                  style: AppTheme.inter(size: 10, color: AppTheme.warn)),
            ],
            if (precisaConfirmar) ...[
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => InboxService.confirmarLeitura(msg.id),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                  child: Text('✅ Entendido',
                      style: AppTheme.inter(
                          size: 12.5, weight: FontWeight.w700)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ── Painel de novidades (changelog) ──────────────────────
class _PainelNovidades extends StatelessWidget {
  final Map<String, dynamic>? changelog;
  final bool carregado;

  const _PainelNovidades({required this.changelog, required this.carregado});

  @override
  Widget build(BuildContext context) {
    if (!carregado) {
      return const Center(
          child: CircularProgressIndicator(color: AppTheme.primary));
    }
    if (changelog == null) {
      return Center(
        child: Text('Nenhuma novidade no momento.',
            style: AppTheme.inter(size: 13, color: AppTheme.t3)),
      );
    }
    final titulo = changelog!['titulo'] as String? ?? 'Novidades';
    final texto = changelog!['texto'] as String? ?? '';
    final ts = (changelog!['ts'] as num?)?.toInt() ?? 0;

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.bg3,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.line2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(titulo,
                  style: AppTheme.syne(
                      size: 14,
                      weight: FontWeight.w700,
                      color: AppTheme.primary)),
              if (ts > 0) ...[
                const SizedBox(height: 4),
                Text(_formatarData(ts),
                    style: AppTheme.inter(size: 10, color: AppTheme.t3)),
              ],
              const SizedBox(height: 10),
              Text(texto,
                  style: AppTheme.inter(
                      size: 13, color: AppTheme.t2, height: 1.6)),
            ],
          ),
        ),
      ],
    );
  }
}
