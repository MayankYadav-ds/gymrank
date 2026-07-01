import 'achievement_models.dart';
import 'achievement_repository.dart';

class AchievementService {
  const AchievementService(this._repository);

  final AchievementRepository _repository;

  Future<List<AchievementSummary>> findAchievements() {
    return _repository.findAchievements();
  }

  Future<AchievementSummary> findAchievement(String id) {
    return _repository.findAchievement(id);
  }
}
