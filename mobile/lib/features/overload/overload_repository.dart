import 'overload_models.dart';

abstract class OverloadRepository {
  Future<List<OverloadRecommendationSummary>> findRecommendations();

  Future<OverloadRecommendationSummary?> findRecommendation(String exerciseId);
}

class MockOverloadRepository implements OverloadRepository {
  const MockOverloadRepository();

  @override
  Future<List<OverloadRecommendationSummary>> findRecommendations() async {
    return sampleOverloadRecommendations;
  }

  @override
  Future<OverloadRecommendationSummary?> findRecommendation(String exerciseId) async {
    for (final recommendation in sampleOverloadRecommendations) {
      if (recommendation.exerciseId == exerciseId) {
        return recommendation;
      }
    }

    return null;
  }
}

const sampleOverloadRecommendations = <OverloadRecommendationSummary>[
  OverloadRecommendationSummary(
    exerciseId: 'bench_press',
    exerciseName: 'Bench Press',
    recommendation: 'Increase reps',
    suggestedWeight: 100,
    suggestedReps: 9,
    explanation: 'Repeat the weight and add one rep next time.',
  ),
  OverloadRecommendationSummary(
    exerciseId: 'squat',
    exerciseName: 'Squat',
    recommendation: 'Increase weight',
    suggestedWeight: 145,
    suggestedReps: 5,
    explanation: 'All working sets reached target reps. Increase by 5 kg.',
  ),
];
