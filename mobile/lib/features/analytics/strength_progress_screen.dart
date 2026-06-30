import 'package:flutter/material.dart';

import 'analytics_repository.dart';
import 'analytics_service.dart';

class StrengthProgressScreen extends StatelessWidget {
  const StrengthProgressScreen({super.key});

  static const routeName = '/analytics/strength';

  @override
  Widget build(BuildContext context) {
    const service = AnalyticsService(MockAnalyticsRepository());

    return Scaffold(
      appBar: AppBar(title: const Text('Strength Progress')),
      body: SafeArea(
        child: FutureBuilder(
          future: service.findStrengthProgress(),
          builder: (context, snapshot) {
            final items = snapshot.data ?? [];

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final item = items[index];
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.exerciseName, style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 12),
                        Text('Current PR: ${item.currentPr}'),
                        Text('Previous PR: ${item.previousPr}'),
                        const SizedBox(height: 12),
                        LinearProgressIndicator(value: (item.progressPercent / 10).clamp(0, 1)),
                        const SizedBox(height: 8),
                        Text('+${item.progressPercent.toStringAsFixed(2)}%'),
                      ],
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
