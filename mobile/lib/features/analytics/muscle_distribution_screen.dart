import 'package:flutter/material.dart';

import 'analytics_repository.dart';
import 'analytics_service.dart';

class MuscleDistributionScreen extends StatelessWidget {
  const MuscleDistributionScreen({super.key});

  static const routeName = '/analytics/muscles';

  @override
  Widget build(BuildContext context) {
    const service = AnalyticsService(MockAnalyticsRepository());

    return Scaffold(
      appBar: AppBar(title: const Text('Muscle Distribution')),
      body: SafeArea(
        child: FutureBuilder(
          future: service.findMuscleDistribution(),
          builder: (context, snapshot) {
            final items = snapshot.data ?? [];

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final item = items[index];

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(item.muscleGroup),
                        Text('${item.percent.toStringAsFixed(0)}%'),
                      ],
                    ),
                    const SizedBox(height: 8),
                    LinearProgressIndicator(value: item.percent / 100),
                  ],
                );
              },
            );
          },
        ),
      ),
    );
  }
}
