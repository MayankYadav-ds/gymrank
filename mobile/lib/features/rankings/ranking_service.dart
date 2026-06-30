import 'ranking_models.dart';
import 'ranking_repository.dart';

class RankingService {
  const RankingService(this._repository);

  final RankingRepository _repository;

  Future<List<RankingEntrySummary>> findLeaderboard(String exerciseId) {
    return _repository.findLeaderboard(exerciseId);
  }

  Future<List<RankingEntrySummary>> findMyRanks() {
    return _repository.findMyRanks();
  }
}
