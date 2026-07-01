import 'package:flutter/material.dart';

import 'achievement_repository.dart';
import 'achievement_service.dart';

class AchievementDetailScreen extends StatelessWidget {
  const AchievementDetailScreen({super.key});

  static const routeName = '/achievements/detail';

  @override
  Widget build(BuildContext context) {
    final achievementId = ModalRoute.of(context)?.settings.arguments as String? ?? 'first_workout';
    const service = AchievementService(MockAchievementRepository());

    return Scaffold(
      appBar: AppBar(title: const Text('Achievement')),
      body: SafeArea(
        child: FutureBuilder(
          future: service.findAchievement(achievementId),
          builder: (context, snapshot) {
            final achievement = snapshot.data;

            if (achievement == null) {
              return const Center(child: CircularProgressIndicator());
            }

            return ListView(
              padding: const EdgeInsets.all(24),
              children: [
                Icon(
                  achievement.unlocked ? Icons.emoji_events : Icons.lock,
                  size: 64,
                ),
                const SizedBox(height: 20),
                Text(achievement.title, style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 8),
                Text('${achievement.category} • ${achievement.rarity}'),
                const SizedBox(height: 20),
                Text(achievement.description),
                const SizedBox(height: 20),
                LinearProgressIndicator(value: achievement.progressPercent / 100),
                const SizedBox(height: 8),
                Text('${achievement.progressPercent.toStringAsFixed(0)}% complete'),
              ],
            );
          },
        ),
      ),
    );
  }
}
