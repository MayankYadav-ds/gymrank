import 'package:flutter/material.dart';

class ProfileSetupScreen extends StatelessWidget {
  const ProfileSetupScreen({super.key});

  static const routeName = '/profile/setup';

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: _ProfileSetupAppBar(),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: _ProfileSetupSkeleton(),
        ),
      ),
    );
  }
}

class _ProfileSetupSkeleton extends StatelessWidget {
  const _ProfileSetupSkeleton();

  @override
  Widget build(BuildContext context) {
    return const ListView(
      children: [
        TextField(decoration: InputDecoration(labelText: 'Display name')),
        SizedBox(height: 16),
        TextField(decoration: InputDecoration(labelText: 'Country')),
        SizedBox(height: 16),
        TextField(decoration: InputDecoration(labelText: 'Date of birth')),
        SizedBox(height: 16),
        TextField(decoration: InputDecoration(labelText: 'Sex/category')),
        SizedBox(height: 16),
        TextField(
          decoration: InputDecoration(labelText: 'Bodyweight'),
          keyboardType: TextInputType.number,
        ),
        SizedBox(height: 16),
        SwitchListTile(
          value: false,
          onChanged: null,
          title: Text('Join rankings'),
          subtitle: Text('Optional. Bodyweight and profile fields are required before ranking.'),
        ),
        SizedBox(height: 24),
        FilledButton(
          onPressed: null,
          child: Text('Save profile'),
        ),
      ],
    );
  }
}

class _ProfileSetupAppBar extends StatelessWidget implements PreferredSizeWidget {
  const _ProfileSetupAppBar();

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(title: const Text('Profile setup'));
  }
}
