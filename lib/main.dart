import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'theme/app_theme.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Forçar orientação retrato
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Status bar escura
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: AppTheme.bg,
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  await Firebase.initializeApp(
    options: const FirebaseOptions(
      apiKey: 'AIzaSyA8R7vnuWAWWDfe2DHLhGJdZTsWiXC5u7g',
      appId: '1:240438805750:android:90ab3118d158050b8f58d7',
      messagingSenderId: '240438805750',
      projectId: 'under-pressure-49320',
      storageBucket: 'under-pressure-49320.firebasestorage.app',
      databaseURL:
          'https://under-pressure-49320-default-rtdb.firebaseio.com',
    ),
  );

  runApp(const UnderPressureApp());
}

class UnderPressureApp extends StatelessWidget {
  const UnderPressureApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Under Pressure',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      home: const SplashScreen(),
    );
  }
}
