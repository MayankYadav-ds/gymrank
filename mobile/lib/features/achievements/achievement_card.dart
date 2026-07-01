import 'package:flutter/material.dart';

import 'achievement_models.dart';
import 'achievement_detail_screen.dart';

class AchievementCard extends StatelessWidget {
  const AchievementCard({
    required this.achievement,
    super.key,
  });

  final AchievementSummary achievement;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: achievement.unlocked ? colorScheme.primary : colorScheme.surfaceContainerHighest,
          child: Icon(
            achievement.unlocked ? Icons.emoji_events : Icons.lock,
            color: achievement.unlocked ? colorScheme.onPrimary : colorScheme.onSurfaceVariant,
          ),
        ),
        title: Text(achievement.title),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${achievement.category} • ${achievement.rarity}'),
            const SizedBox(height: 8),
            LinearProgressIndicator(value: achievement.progressPercent / 100),
          ],
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => Navigator.of(context).pushNamed(
          AchievementDetailScreen.routeName,
          arguments: achievement.id,
        ),
      ),
    );
  }
}
