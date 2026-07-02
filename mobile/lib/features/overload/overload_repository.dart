import 'overload_models.dart';
import '../../core/api/api_client.dart';

abstract class OverloadRepository {
  Future<List<OverloadRecommendationSummary>> findRecommendations();

  Future<OverloadRecommendationSummary?> findRecommendation(String exerciseId);
}

class ApiOverloadRepository implements OverloadRepository {
  const ApiOverloadRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient.shared;

  final ApiClient _apiClient;

  @override
  Future<List<OverloadRecommendationSummary>> findRecommendations() async {
    final json = await _apiClient.getJson('/v1/overload/recommendations');
    final recommendations = json['recommendations'];

    if (recommendations is! Map<String, dynamic>) {
      return [];
    }

    return recommendations.entries.map((entry) {
      final value = entry.value as Map<String, dynamic>;
      final previousWorkout = value['previousWorkout'];
      return OverloadRecommendationSummary.fromJson({
        ...value,
        'exerciseId': entry.key,
        if (previousWorkout is Map<String, dynamic>) 'exerciseName': previousWorkout['exerciseName'],
      });
    }).toList();
  }

  @override
  Future<OverloadRecommendationSummary?> findRecommendation(String exerciseId) async {
    final json = await _apiClient.getJson('/v1/overload/$exerciseId');
    return OverloadRecommendationSummary.fromJson({
      ...json,
      'exerciseId': exerciseId,
    });
  }
}
