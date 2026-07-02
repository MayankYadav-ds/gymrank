import 'achievement_models.dart';
import '../../core/api/api_client.dart';

abstract class AchievementRepository {
  Future<List<AchievementSummary>> findAchievements();

  Future<AchievementSummary> findAchievement(String id);
}

class ApiAchievementRepository implements AchievementRepository {
  const ApiAchievementRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient.shared;

  final ApiClient _apiClient;

  @override
  Future<List<AchievementSummary>> findAchievements() async {
    final json = await _apiClient.getJson('/v1/achievements/progress');
    final progress = json['progress'];

    if (progress is! List) {
      return [];
    }

    return progress.whereType<Map<String, dynamic>>().map(AchievementSummary.fromProgressJson).toList();
  }

  @override
  Future<AchievementSummary> findAchievement(String id) async {
    final json = await _apiClient.getJson('/v1/achievements/$id');
    return AchievementSummary.fromProgressJson(json['achievement'] as Map<String, dynamic>);
  }
}
