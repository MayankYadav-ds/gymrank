import 'package:flutter/material.dart';

import 'achievement_card.dart';
import 'achievement_repository.dart';
import 'achievement_service.dart';
import 'unlocked_celebration_dialog.dart';

class AchievementsScreen extends StatelessWidget {
  const AchievementsScreen({super.key});

  static const routeName = '/achievements';

  @override
  Widget build(BuildContext context) {
    const service = AchievementService(MockAchievementRepository());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Achievements'),
        actions: [
          IconButton(
            onPressed: () => showDialog<void>(
              context: context,
              builder: (_) => const UnlockedCelebrationDialog(title: 'First Workout'),
            ),
            icon: const Icon(Icons.celebration),
            tooltip: 'Preview unlock',
          ),
        ],
      ),
      body: SafeArea(
        child: FutureBuilder(
          future: service.findAchievements(),
          builder: (context, snapshot) {
            final achievements = snapshot.data ?? [];

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: achievements.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) => AchievementCard(achievement: achievements[index]),
            );
          },
        ),
      ),
    );
  }
}
