import 'package:flutter/material.dart';

import 'ranking_models.dart';

class RankingCard extends StatelessWidget {
  const RankingCard({
    required this.entry,
    super.key,
  });

  final RankingEntrySummary entry;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(child: Text('#${entry.rank}')),
        title: Text(entry.displayName),
        subtitle: Text('${entry.exerciseName} - ${entry.bestWeight} kg x ${entry.bestReps}'),
        trailing: Text('${entry.percentile.toStringAsFixed(0)}%'),
      ),
    );
  }
}
