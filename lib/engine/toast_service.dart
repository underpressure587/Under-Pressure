import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

// ═══════════════════════════════════════════════════════
//  TOAST SERVICE — sistema global de notificações
//  Espelha _showToast() / mostrarSucesso() / mostrarErro()
//  / mostrarAviso() / mostrarErroCritico() do site
// ═══════════════════════════════════════════════════════

enum ToastType { info, ok, aviso, erro, critico }

class _ToastStyle {
  final Color bg, borda;
  final String icone;
  const _ToastStyle(this.bg, this.borda, this.icone);
}

const _toastStyles = {
  ToastType.erro:    _ToastStyle(Color(0xEBE74C3C), Color(0x80E74C3C), '❌'),
  ToastType.aviso:   _ToastStyle(Color(0xEBF39C12), Color(0x80F39C12), '⚠️'),
  ToastType.ok:      _ToastStyle(Color(0xEB2ECC71), Color(0x802ECC71), '✅'),
  ToastType.info:    _ToastStyle(AppTheme.bg4,       AppTheme.line2,    'ℹ️'),
  ToastType.critico: _ToastStyle(Color(0xF2C0392B), Color(0x99C0392B), '🚨'),
};

class ToastService {
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  static final List<OverlayEntry> _entries = [];

  static void _show(String msg, ToastType tipo, Duration duracao) {
    final overlay = navigatorKey.currentState?.overlay;
    if (overlay == null) return;
    final style = _toastStyles[tipo]!;

    late OverlayEntry entry;
    entry = OverlayEntry(builder: (context) {
      return _ToastWidget(
        message: msg,
        icon: style.icone,
        bg: style.bg,
        border: style.borda,
        index: _entries.indexOf(entry),
        onDone: () { entry.remove(); _entries.remove(entry); },
      );
    });

    _entries.add(entry);
    overlay.insert(entry);

    Future.delayed(duracao, () {
      if (_entries.contains(entry)) {
        // O próprio widget cuida da remoção animada
      }
    });
  }

  static void erro(String msg)        => _show(msg, ToastType.info,    const Duration(milliseconds: 3200));
  static void sucesso(String msg)     => _show(msg, ToastType.ok,      const Duration(milliseconds: 2800));
  static void aviso(String msg)       => _show(msg, ToastType.aviso,   const Duration(milliseconds: 3200));
  static void erroCritico(String msg) => _show(msg, ToastType.critico, const Duration(milliseconds: 3500));
}

class _ToastWidget extends StatefulWidget {
  final String message, icon;
  final Color bg, border;
  final int index;
  final VoidCallback onDone;

  const _ToastWidget({
    required this.message, required this.icon,
    required this.bg, required this.border,
    required this.index, required this.onDone,
  });

  @override
  State<_ToastWidget> createState() => _ToastWidgetState();
}

class _ToastWidgetState extends State<_ToastWidget> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _slide, _fade;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 220));
    _slide = Tween(begin: -20.0, end: 0.0).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
    _fade  = Tween(begin: 0.0, end: 1.0).animate(_ctrl);
    _ctrl.forward();

    final duracao = widget.bg == const Color(0xF2C0392B)
        ? 3500 : widget.bg == const Color(0xEB2ECC71)
        ? 2800 : 3200;

    Future.delayed(Duration(milliseconds: duracao), () async {
      if (!mounted) return;
      await _ctrl.reverse();
      widget.onDone();
    });
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final topOffset = MediaQuery.of(context).padding.top + 12 + (widget.index * 56.0);
    return Positioned(
      top: topOffset, left: 16, right: 16,
      child: AnimatedBuilder(
        animation: _ctrl,
        builder: (_, child) => Opacity(
          opacity: _fade.value,
          child: Transform.translate(offset: Offset(0, _slide.value), child: child),
        ),
        child: Material(
          color: Colors.transparent,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: widget.bg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: widget.border),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 16, offset: const Offset(0, 4))],
            ),
            child: Row(children: [
              Text(widget.icon, style: const TextStyle(fontSize: 16)),
              const SizedBox(width: 8),
              Expanded(child: Text(widget.message,
                  style: AppTheme.inter(size: 13, weight: FontWeight.w600, color: Colors.white))),
            ]),
          ),
        ),
      ),
    );
  }
}
