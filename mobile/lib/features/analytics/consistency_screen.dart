import 'package:flutter/material.dart';

import 'analytics_repository.dart';
import 'analytics_service.dart';

class ConsistencyScreen extends StatelessWidget {
  const ConsistencyScreen({super.key});

  static const routeName = '/analytics/consistency';

  @override
  Widget build(BuildContext context) {
    const service = AnalyticsService(MockAnalyticsRepository());

    return Scaffold(
      appBar: AppBar(title: const Text('Consistency')),
      body: SafeArea(
        child: FutureBuilder(
          future: service.findConsistency(),
          builder: (context, snapshot) {
            final summary = snapshot.data;

            if (summary == null) {
              return const Center(child: CircularProgressIndicator());
            }

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _ConsistencyTile(label: 'Current Streak', value: '${summary.currentStreak} days'),
                _ConsistencyTile(label: 'Longest Streak', value: '${summary.longestStreak} days'),
                _ConsistencyTile(label: 'Workouts This Week', value: '${summary.workoutsThisWeek}'),
                _ConsistencyTile(label: 'Workouts This Month', value: '${summary.workoutsThisMonth}'),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _ConsistencyTile extends StatelessWidget {
  const _ConsistencyTile({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(label),
      trailing: Text(value, style: Theme.of(context).textTheme.titleMedium),
    );
  }
}
