import 'overload_models.dart';
import 'overload_repository.dart';

class OverloadService {
  const OverloadService(this._repository);

  final OverloadRepository _repository;

  Future<List<OverloadRecommendationSummary>> findRecommendations() {
    return _repository.findRecommendations();
  }

  Future<OverloadRecommendationSummary?> findRecommendation(String exerciseId) {
    return _repository.findRecommendation(exerciseId);
  }
}
