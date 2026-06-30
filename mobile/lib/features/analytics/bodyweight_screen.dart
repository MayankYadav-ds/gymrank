import 'package:flutter/material.dart';

import 'analytics_repository.dart';
import 'analytics_service.dart';

class BodyweightScreen extends StatelessWidget {
  const BodyweightScreen({super.key});

  static const routeName = '/analytics/bodyweight';

  @override
  Widget build(BuildContext context) {
    const service = AnalyticsService(MockAnalyticsRepository());

    return Scaffold(
      appBar: AppBar(title: const Text('Bodyweight')),
      body: SafeArea(
        child: FutureBuilder(
          future: service.findBodyweight(),
          builder: (context, snapshot) {
            final summary = snapshot.data;

            if (summary == null) {
              return const Center(child: CircularProgressIndicator());
            }

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _BodyweightTile(label: 'Current', value: summary.current),
                _BodyweightTile(label: 'Highest', value: summary.highest),
                _BodyweightTile(label: 'Lowest', value: summary.lowest),
                _BodyweightTile(label: 'Average', value: summary.average),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _BodyweightTile extends StatelessWidget {
  const _BodyweightTile({
    required this.label,
    required this.value,
  });

  final String label;
  final double value;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(label),
      trailing: Text('${value.toStringAsFixed(1)} kg', style: Theme.of(context).textTheme.titleMedium),
    );
  }
}
