import 'ranking_models.dart';
import '../../core/api/api_client.dart';

abstract class RankingRepository {
  Future<List<RankingEntrySummary>> findLeaderboard(String exerciseId);

  Future<List<RankingEntrySummary>> findMyRanks();
}

class ApiRankingRepository implements RankingRepository {
  const ApiRankingRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient.shared;

  final ApiClient _apiClient;

  @override
  Future<List<RankingEntrySummary>> findLeaderboard(String exerciseId) async {
    final json = await _apiClient.getJson('/v1/rankings/$exerciseId');
    final leaderboard = json['leaderboard'];
    final entries = leaderboard is Map<String, dynamic> ? leaderboard['entries'] : null;

    if (entries is! List) {
      return [];
    }

    return entries.whereType<Map<String, dynamic>>().map(RankingEntrySummary.fromJson).toList();
  }

  @override
  Future<List<RankingEntrySummary>> findMyRanks() async {
    final json = await _apiClient.getJson('/v1/rankings/me');
    final rankings = json['rankings'];
    final exerciseRanks = rankings is Map<String, dynamic> ? rankings['exerciseRanks'] : null;

    if (exerciseRanks is! List) {
      return [];
    }

    return exerciseRanks.whereType<Map<String, dynamic>>().map(RankingEntrySummary.fromJson).toList();
  }
}
