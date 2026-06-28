import 'package:flutter/material.dart';

class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  static const routeName = '/auth/register';

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: _AuthAppBar(title: 'Create account'),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: _RegisterFormSkeleton(),
        ),
      ),
    );
  }
}

class _RegisterFormSkeleton extends StatelessWidget {
  const _RegisterFormSkeleton();

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
        SizedBox(height: 16),
        TextField(
          decoration: InputDecoration(labelText: 'Display name'),
        ),
        SizedBox(height: 24),
        FilledButton(
          onPressed: null,
          child: Text('Create account'),
        ),
      ],
    );
  }
}

class _AuthAppBar extends StatelessWidget implements PreferredSizeWidget {
  const _AuthAppBar({required this.title});

  final String title;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(title: Text(title));
  }
}
