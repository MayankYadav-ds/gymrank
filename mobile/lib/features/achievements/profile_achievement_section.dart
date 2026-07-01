import 'package:flutter/material.dart';

import 'achievement_card.dart';
import 'achievement_repository.dart';
import 'achievement_service.dart';

class ProfileAchievementSection extends StatelessWidget {
  const ProfileAchievementSection({super.key});

  @override
  Widget build(BuildContext context) {
    const service = AchievementService(MockAchievementRepository());

    return FutureBuilder(
      future: service.findAchievements(),
      builder: (context, snapshot) {
        final unlocked = (snapshot.data ?? []).where((achievement) => achievement.unlocked).take(2).toList();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Achievements', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            for (final achievement in unlocked) AchievementCard(achievement: achievement),
          ],
        );
      },
    );
  }
}
