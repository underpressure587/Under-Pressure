import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'splash_screen.dart';

/// Tela exibida antes de tudo: toca o vídeo da logo da empresa
/// (com som, centralizado, sem cortar bordas) e, ao terminar,
/// segue para a SplashScreen normal (checagens de Firebase etc).
///
/// IMPORTANTE: o arquivo do vídeo deve ser colocado em:
///   assets/videos/intro_logo.mp4
/// (nome e caminho exatos — já configurados no pubspec.yaml)
class LogoVideoScreen extends StatefulWidget {
  const LogoVideoScreen({super.key});

  @override
  State<LogoVideoScreen> createState() => _LogoVideoScreenState();
}

class _LogoVideoScreenState extends State<LogoVideoScreen> {
  static const String _videoAsset = 'assets/videos/intro_logo.mp4';

  late VideoPlayerController _controller;
  bool _navegou = false;
  bool _erroAoCarregar = false;

  @override
  void initState() {
    super.initState();

    _controller = VideoPlayerController.asset(_videoAsset);
    _controller.setLooping(false);
    _controller.addListener(_onVideoUpdate);

    _controller.initialize().then((_) {
      if (!mounted) return;
      setState(() {});
      _controller.play();
    }).catchError((_) {
      // Se o vídeo não existir ou não carregar, não trava o app:
      // segue direto para o carregamento normal.
      if (!mounted) return;
      setState(() => _erroAoCarregar = true);
      _irParaSplash();
    });
  }

  void _onVideoUpdate() {
    if (_navegou) return;
    final value = _controller.value;
    final terminou = value.isInitialized &&
        value.duration > Duration.zero &&
        value.position >= value.duration;
    if (terminou) {
      _irParaSplash();
    }
  }

  void _irParaSplash() {
    if (_navegou || !mounted) return;
    _navegou = true;
    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 400),
        pageBuilder: (_, __, ___) => const SplashScreen(),
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
      ),
    );
  }

  @override
  void dispose() {
    _controller.removeListener(_onVideoUpdate);
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: (_controller.value.isInitialized && !_erroAoCarregar)
            ? AspectRatio(
                aspectRatio: _controller.value.aspectRatio,
                child: VideoPlayer(_controller),
              )
            : const SizedBox.shrink(),
      ),
    );
  }
}
