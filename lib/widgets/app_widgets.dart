import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

// ── Botão Primário ────────────────────────────────────────────
class PrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final bool loading;
  final double? width;

  const PrimaryButton({
    super.key,
    required this.label,
    this.onTap,
    this.loading = false,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width ?? double.infinity,
      height: 52,
      child: ElevatedButton(
        onPressed: loading ? null : onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppTheme.primary,
          disabledBackgroundColor: AppTheme.primary.withOpacity(0.5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: loading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: Colors.black),
              )
            : Text(label,
                style: AppTheme.syne(
                    size: 15,
                    weight: FontWeight.w700,
                    color: Colors.black)),
      ),
    );
  }
}

// ── Botão Secundário ─────────────────────────────────────────
class SecondaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;

  const SecondaryButton({super.key, required this.label, this.onTap});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          foregroundColor: AppTheme.t1,
          side: const BorderSide(color: AppTheme.line2),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: Text(label, style: AppTheme.inter(size: 14, color: AppTheme.t2)),
      ),
    );
  }
}

// ── Botão Google ─────────────────────────────────────────────
class GoogleButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final bool loading;

  const GoogleButton(
      {super.key, required this.label, this.onTap, this.loading = false});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: OutlinedButton.icon(
        onPressed: loading ? null : onTap,
        style: OutlinedButton.styleFrom(
          backgroundColor: AppTheme.bg3,
          foregroundColor: AppTheme.t1,
          side: const BorderSide(color: AppTheme.line2),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        icon: loading
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: AppTheme.t2))
            : _GoogleIcon(),
        label: Text(label,
            style: AppTheme.inter(
                size: 14, weight: FontWeight.w500, color: AppTheme.t1)),
      ),
    );
  }
}

class _GoogleIcon extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 18,
      height: 18,
      child: CustomPaint(painter: _GooglePainter()),
    );
  }
}

class _GooglePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 18;
    final p = Paint()..isAntiAlias = true;

    // Blue
    p.color = const Color(0xFF4285F4);
    final path = Path()
      ..moveTo(17.64 * s, 9.2 * s)
      ..cubicTo(17.64 * s, 8.563 * s, 17.583 * s, 7.949 * s, 17.476 * s,
          7.36 * s)
      ..lineTo(9 * s, 7.36 * s)
      ..lineTo(9 * s, 10.841 * s)
      ..lineTo(13.844 * s, 10.841 * s)
      ..cubicTo(13.635 * s, 11.971 * s, 12.988 * s, 12.924 * s, 12.048 * s,
          13.557 * s)
      ..lineTo(12.048 * s, 15.816 * s)
      ..lineTo(14.956 * s, 15.816 * s)
      ..cubicTo(16.658 * s, 14.249 * s, 17.64 * s, 11.941 * s, 17.64 * s,
          9.2 * s)
      ..close();
    canvas.drawPath(path, p);

    // Green
    p.color = const Color(0xFF34A853);
    final path2 = Path()
      ..moveTo(9 * s, 18 * s)
      ..cubicTo(11.43 * s, 18 * s, 13.467 * s, 17.194 * s, 14.956 * s,
          15.82 * s)
      ..lineTo(12.048 * s, 13.561 * s)
      ..cubicTo(11.242 * s, 14.101 * s, 10.211 * s, 14.421 * s, 9 * s,
          14.421 * s)
      ..cubicTo(6.656 * s, 14.421 * s, 4.672 * s, 12.837 * s, 3.964 * s,
          10.71 * s)
      ..lineTo(0.957 * s, 10.71 * s)
      ..lineTo(0.957 * s, 13.042 * s)
      ..cubicTo(2.438 * s, 15.983 * s, 5.482 * s, 18 * s, 9 * s, 18 * s)
      ..close();
    canvas.drawPath(path2, p);

    // Yellow
    p.color = const Color(0xFFFBBC05);
    final path3 = Path()
      ..moveTo(3.964 * s, 10.71 * s)
      ..cubicTo(3.782 * s, 10.17 * s, 3.682 * s, 9.593 * s, 3.682 * s,
          9 * s)
      ..cubicTo(3.682 * s, 8.407 * s, 3.784 * s, 7.83 * s, 3.964 * s,
          7.29 * s)
      ..lineTo(3.964 * s, 4.958 * s)
      ..lineTo(0.957 * s, 4.958 * s)
      ..cubicTo(0.348 * s, 6.173 * s, 0 * s, 7.548 * s, 0 * s, 9 * s)
      ..cubicTo(0, 10.452 * s, 0.348 * s, 11.827 * s, 0.957 * s, 13.042 * s)
      ..lineTo(3.964 * s, 10.71 * s)
      ..close();
    canvas.drawPath(path3, p);

    // Red
    p.color = const Color(0xFFEA4335);
    final path4 = Path()
      ..moveTo(9 * s, 3.58 * s)
      ..cubicTo(10.321 * s, 3.58 * s, 11.508 * s, 4.034 * s, 12.44 * s,
          4.925 * s)
      ..lineTo(15.022 * s, 2.345 * s)
      ..cubicTo(13.463 * s, 0.891 * s, 11.426 * s, 0, 9 * s, 0)
      ..cubicTo(5.482 * s, 0, 2.438 * s, 2.017 * s, 0.957 * s, 4.958 * s)
      ..lineTo(3.964 * s, 7.29 * s)
      ..cubicTo(4.672 * s, 5.163 * s, 6.656 * s, 3.58 * s, 9 * s, 3.58 * s)
      ..close();
    canvas.drawPath(path4, p);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ── Campo de input ────────────────────────────────────────────
class AppInput extends StatefulWidget {
  final String label;
  final String placeholder;
  final TextEditingController controller;
  final bool isPassword;
  final TextInputType keyboardType;
  final String? Function(String?)? validator;
  final VoidCallback? onSubmit;

  const AppInput({
    super.key,
    required this.label,
    required this.placeholder,
    required this.controller,
    this.isPassword = false,
    this.keyboardType = TextInputType.text,
    this.validator,
    this.onSubmit,
  });

  @override
  State<AppInput> createState() => _AppInputState();
}

class _AppInputState extends State<AppInput> {
  bool _obscure = true;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.label, style: AppTheme.inter(size: 12, color: AppTheme.t2)),
        const SizedBox(height: 6),
        TextFormField(
          controller: widget.controller,
          obscureText: widget.isPassword && _obscure,
          keyboardType: widget.keyboardType,
          style: AppTheme.inter(size: 15, color: AppTheme.t1),
          validator: widget.validator,
          onFieldSubmitted: (_) => widget.onSubmit?.call(),
          decoration: InputDecoration(
            hintText: widget.placeholder,
            suffixIcon: widget.isPassword
                ? IconButton(
                    icon: Icon(
                      _obscure
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                      color: AppTheme.t3,
                      size: 18,
                    ),
                    onPressed: () =>
                        setState(() => _obscure = !_obscure),
                  )
                : null,
          ),
        ),
      ],
    );
  }
}

// ── Erro inline ───────────────────────────────────────────────
class ErrorBox extends StatelessWidget {
  final String message;

  const ErrorBox(this.message, {super.key});

  @override
  Widget build(BuildContext context) {
    if (message.isEmpty) return const SizedBox.shrink();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppTheme.err.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppTheme.err.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: AppTheme.err, size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Text(message,
                style: AppTheme.inter(size: 13, color: AppTheme.err)),
          ),
        ],
      ),
    );
  }
}

// ── Divider ───────────────────────────────────────────────────
class OrDivider extends StatelessWidget {
  const OrDivider({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(child: Divider(color: AppTheme.line2)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text('ou', style: AppTheme.inter(size: 12, color: AppTheme.t3)),
        ),
        const Expanded(child: Divider(color: AppTheme.line2)),
      ],
    );
  }
}

// ── Back button padrão ───────────────────────────────────────
class BackBtn extends StatelessWidget {
  final VoidCallback? onTap;

  const BackBtn({super.key, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap ?? () => Navigator.pop(context),
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: AppTheme.bg3,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppTheme.line2),
        ),
        child: const Icon(Icons.arrow_back_ios_new_rounded,
            size: 14, color: AppTheme.t2),
      ),
    );
  }
}
