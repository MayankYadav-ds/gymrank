import 'package:flutter/material.dart';

import 'exercise_leaderboard_screen.dart';
import 'ranking_filter_bottom_sheet.dart';

class LeaderboardScreen extends StatelessWidget {
  const LeaderboardScreen({super.key});

  static const routeName = '/rankings';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rankings'),
        actions: [
          IconButton(
            onPressed: () => showModalBottomSheet<void>(
              context: context,
              builder: (_) => const RankingFilterBottomSheet(),
            ),
            icon: const Icon(Icons.tune),
            tooltip: 'Filters',
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: const [
            _LiftTile(name: 'Bench Press', exerciseId: 'bench_press'),
            _LiftTile(name: 'Squat', exerciseId: 'squat'),
            _LiftTile(name: 'Deadlift', exerciseId: 'deadlift'),
            _LiftTile(name: 'Overhead Press', exerciseId: 'overhead_press'),
            _LiftTile(name: 'Pull-Up / Weighted Pull-Up', exerciseId: 'pull_up_weighted_pull_up'),
          ],
        ),
      ),
    );
  }
}

class _LiftTile extends StatelessWidget {
  const _LiftTile({
    required this.name,
    required this.exerciseId,
  });

  final String name;
  final String exerciseId;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(name),
      trailing: const Icon(Icons.chevron_right),
      onTap: () => Navigator.of(context).pushNamed(
        ExerciseLeaderboardScreen.routeName,
        arguments: exerciseId,
      ),
    );
  }
}
