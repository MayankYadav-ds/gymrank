import 'package:flutter/material.dart';

import 'navigation/app_shell.dart';
import 'theme/gymrank_theme.dart';
import '../features/auth_profile/login_screen.dart';
import '../features/auth_profile/profile_setup_screen.dart';
import '../features/auth_profile/register_screen.dart';

class GymRankApp extends StatelessWidget {
  const GymRankApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GymRank',
      debugShowCheckedModeBanner: false,
      theme: GymRankTheme.dark,
      routes: {
        LoginScreen.routeName: (_) => const LoginScreen(),
        RegisterScreen.routeName: (_) => const RegisterScreen(),
        ProfileSetupScreen.routeName: (_) => const ProfileSetupScreen(),
      },
      home: const AppShell(),
    );
  }
}
