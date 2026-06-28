import 'package:flutter/material.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  static const routeName = '/auth/login';

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: _LoginAppBar(),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: _LoginFormSkeleton(),
        ),
      ),
    );
  }
}

class _LoginFormSkeleton extends StatelessWidget {
  const _LoginFormSkeleton();

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          decoration: InputDecoration(labelText: 'Email'),
          keyboardType: TextInputType.emailAddress,
        ),
        SizedBox(height: 16),
        TextField(
          decoration: InputDecoration(labelText: 'Password'),
          obscureText: true,
        ),
        SizedBox(height: 24),
        FilledButton(
          onPressed: null,
          child: Text('Log in'),
        ),
      ],
    );
  }
}

class _LoginAppBar extends StatelessWidget implements PreferredSizeWidget {
  const _LoginAppBar();

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(title: const Text('Log in'));
  }
}
