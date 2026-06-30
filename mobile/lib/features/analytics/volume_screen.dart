import 'package:flutter/material.dart';

import 'analytics_repository.dart';
import 'analytics_service.dart';

class VolumeScreen extends StatelessWidget {
  const VolumeScreen({super.key});

  static const routeName = '/analytics/volume';

  @override
  Widget build(BuildContext context) {
    const service = AnalyticsService(MockAnalyticsRepository());

    return Scaffold(
      appBar: AppBar(title: const Text('Volume')),
      body: SafeArea(
        child: FutureBuilder(
          future: service.findVolume(),
          builder: (context, snapshot) {
            final items = snapshot.data ?? [];
            final maxVolume = items.fold<double>(1, (max, item) => item.volume > max ? item.volume : max);

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
                        Text(item.label),
                        Text('${item.volume.toStringAsFixed(0)} kg'),
                      ],
                    ),
                    const SizedBox(height: 8),
                    LinearProgressIndicator(value: item.volume / maxVolume),
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
