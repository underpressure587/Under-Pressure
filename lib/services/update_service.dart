import 'package:shorebird_code_push/shorebird_code_push.dart';

// ═══════════════════════════════════════════════════════
//  UPDATE SERVICE — verificação manual de patches (Shorebird)
//  Usado pelo botão "Verificar atualizações" em ConfigScreen
// ═══════════════════════════════════════════════════════

class UpdateService {
  static final _updater = ShorebirdUpdater();

  /// Retorna true se existe um patch novo disponível pra baixar.
  static Future<bool> hasUpdate() async {
    if (!_updater.isAvailable) return false;
    final status = await _updater.checkForUpdate();
    return status == UpdateStatus.outdated;
  }

  /// Baixa o patch disponível. Só entra em vigor na próxima
  /// abertura do app (o Dart compilado não troca "ao vivo").
  static Future<void> downloadUpdate() async {
    await _updater.update();
  }
}
