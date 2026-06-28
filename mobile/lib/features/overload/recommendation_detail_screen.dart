import 'package:flutter/material.dart';

import 'overload_repository.dart';
import 'overload_service.dart';

class RecommendationDetailScreen extends StatelessWidget {
  const RecommendationDetailScreen({super.key});

  static const routeName = '/overload/recommendations/detail';
  static const _service = OverloadService(MockOverloadRepository());

  @override
  Widget build(BuildContext context) {
    final exerciseId = ModalRoute.of(context)?.settings.arguments as String?;

    return Scaffold(
      appBar: AppBar(title: const Text('Recommendation')),
      body: SafeArea(
        child: FutureBuilder(
          future: exerciseId == null ? Future.value(null) : _service.findRecommendation(exerciseId),
          builder: (context, snapshot) {
            final recommendation = snapshot.data;

            if (recommendation == null) {
              return const Center(child: Text('No recommendation available yet.'));
            }

            return ListView(
              padding: const EdgeInsets.all(24),
              children: [
                Text(recommendation.exerciseName, style: Theme.of(context).textTheme.headlineLarge),
                const SizedBox(height: 16),
                Text(recommendation.recommendation, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 24),
                if (recommendation.suggestedWeight != null)
                  Text('Suggested weight: ${recommendation.suggestedWeight} kg'),
                if (recommendation.suggestedReps != null) Text('Suggested reps: ${recommendation.suggestedReps}'),
                const SizedBox(height: 24),
                Text(recommendation.explanation),
              ],
            );
          },
        ),
      ),
    );
  }
}
