import 'package:flutter/material.dart';

import '../../features/auth_profile/login_screen.dart';
import '../../features/auth_profile/profile_setup_screen.dart';
import '../../features/auth_profile/register_screen.dart';
import '../../features/exercises/exercise_library_screen.dart';
import '../../features/overload/recommendations_screen.dart';
import '../../features/workouts/workout_history_screen.dart';

class AppShell extends StatelessWidget {
  const AppShell({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: _FoundationView(),
        ),
      ),
    );
  }
}

class _FoundationView extends StatelessWidget {
  const _FoundationView();

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('GymRank', style: textTheme.headlineLarge),
        const SizedBox(height: 12),
        Text(
          'Competitive strength progress platform',
          style: textTheme.titleMedium,
        ),
        const SizedBox(height: 32),
        const _ScopeCard(),
        const SizedBox(height: 24),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            FilledButton(
              onPressed: () => Navigator.of(context).pushNamed(RegisterScreen.routeName),
              child: const Text('Create account'),
            ),
            OutlinedButton(
              onPressed: () => Navigator.of(context).pushNamed(LoginScreen.routeName),
              child: const Text('Log in'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pushNamed(ProfileSetupScreen.routeName),
              child: const Text('Profile setup'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pushNamed(ExerciseLibraryScreen.routeName),
              child: const Text('Exercises'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pushNamed(WorkoutHistoryScreen.routeName),
              child: const Text('Workouts'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pushNamed(RecommendationsScreen.routeName),
              child: const Text('Recommendations'),
            ),
          ],
        ),
      ],
    );
  }
}

class _ScopeCard extends StatelessWidget {
  const _ScopeCard();

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: colorScheme.outline),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Padding(
        padding: EdgeInsets.all(16),
        child: Text(
          'V1 foundation ready: auth/profile, workouts, exercises, muscle targeting, PRs, overload, rankings, physique, analytics, and achievements.',
        ),
      ),
    );
  }
}
