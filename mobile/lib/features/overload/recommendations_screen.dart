import 'package:flutter/material.dart';

import 'overload_models.dart';
import 'overload_repository.dart';
import 'overload_service.dart';
import 'recommendation_card.dart';
import 'recommendation_detail_screen.dart';

class RecommendationsScreen extends StatelessWidget {
  const RecommendationsScreen({super.key});

  static const routeName = '/overload/recommendations';
  static const _service = OverloadService(MockOverloadRepository());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Recommendations')),
      body: SafeArea(
        child: FutureBuilder<List<OverloadRecommendationSummary>>(
          future: _service.findRecommendations(),
          builder: (context, snapshot) {
            final recommendations = snapshot.data ?? const <OverloadRecommendationSummary>[];

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemBuilder: (context, index) {
                final recommendation = recommendations[index];
                return RecommendationCard(
                  recommendation: recommendation,
                  onTap: () => Navigator.of(context).pushNamed(
                    RecommendationDetailScreen.routeName,
                    arguments: recommendation.exerciseId,
                  ),
                );
              },
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemCount: recommendations.length,
            );
          },
        ),
      ),
    );
  }
}
