import 'package:flutter/material.dart';

import 'overload_models.dart';

class RecommendationCard extends StatelessWidget {
  const RecommendationCard({
    required this.recommendation,
    required this.onTap,
    super.key,
  });

  final OverloadRecommendationSummary recommendation;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(recommendation.exerciseName),
        subtitle: Text(recommendation.explanation),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
