import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ManutencaoScreen extends StatelessWidget {
  const ManutencaoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: AppTheme.warn.withOpacity(0.1),
                    shape: BoxShape.circle,
                    border: Border.all(
                        color: AppTheme.warn.withOpacity(0.3), width: 1.5),
                  ),
                  child: const Icon(Icons.build_rounded,
                      color: AppTheme.warn, size: 32),
                ),
                const SizedBox(height: 24),
                Text('Manutenção',
                    style: AppTheme.syne(
                        size: 22, weight: FontWeight.w800, color: AppTheme.t1)),
                const SizedBox(height: 10),
                Text(
                  'O Under Pressure está temporariamente fora do ar para atualizações.\n\nVoltamos em breve!',
                  textAlign: TextAlign.center,
                  style: AppTheme.inter(
                      size: 14, color: AppTheme.t2, height: 1.6),
                ),
                const SizedBox(height: 32),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppTheme.bg2,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.line2),
                  ),
                  child: Text('Tente novamente em alguns minutos.',
                      style: AppTheme.inter(
                          size: 12, color: AppTheme.t3)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
