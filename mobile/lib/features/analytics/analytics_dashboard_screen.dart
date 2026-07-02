import 'package:flutter/material.dart';

import 'analytics_repository.dart';
import 'analytics_service.dart';
import 'bodyweight_screen.dart';
import 'consistency_screen.dart';
import 'muscle_distribution_screen.dart';
import 'strength_progress_screen.dart';
import 'volume_screen.dart';

class AnalyticsDashboardScreen extends StatelessWidget {
  const AnalyticsDashboardScreen({super.key});

  static const routeName = '/analytics';

  @override
  Widget build(BuildContext context) {
    const service = AnalyticsService(MockAnalyticsRepository());

    return Scaffold(
      appBar: AppBar(title: const Text('Analytics')),
      body: SafeArea(
        child: FutureBuilder(
          future: service.findDashboardMetrics(),
          builder: (context, snapshot) {
            final metrics = snapshot.data ?? [];

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: metrics.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 1.45,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  itemBuilder: (context, index) {
                    final metric = metrics[index];
                    return _MetricCard(label: metric.label, value: metric.value);
                  },
                ),
                const SizedBox(height: 20),
                const _AnalyticsNavTile(
                  title: 'Strength Progress',
                  icon: Icons.trending_up,
                  routeName: StrengthProgressScreen.routeName,
                ),
                const _AnalyticsNavTile(
                  title: 'Volume',
                  icon: Icons.bar_chart,
                  routeName: VolumeScreen.routeName,
                ),
                const _AnalyticsNavTile(
                  title: 'Consistency',
                  icon: Icons.calendar_month,
                  routeName: ConsistencyScreen.routeName,
                ),
                const _AnalyticsNavTile(
                  title: 'Bodyweight',
                  icon: Icons.monitor_weight,
                  routeName: BodyweightScreen.routeName,
                ),
                const _AnalyticsNavTile(
                  title: 'Muscle Distribution',
                  icon: Icons.pie_chart,
                  routeName: MuscleDistributionScreen.routeName,
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final colorScheme = Theme.of(context).colorScheme;

    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: colorScheme.outline),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(label, style: textTheme.labelLarge),
            const SizedBox(height: 8),
            Text(value, style: textTheme.titleLarge),
          ],
        ),
      ),
    );
  }
}

class _AnalyticsNavTile extends StatelessWidget {
  const _AnalyticsNavTile({
    required this.title,
    required this.icon,
    required this.routeName,
  });

  final String title;
  final IconData icon;
  final String routeName;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right),
      onTap: () => Navigator.of(context).pushNamed(routeName),
    );
  }
}
