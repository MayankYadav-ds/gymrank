import 'analytics_models.dart';
import 'analytics_repository.dart';

class AnalyticsService {
  const AnalyticsService(this._repository);

  final AnalyticsRepository _repository;

  Future<List<AnalyticsMetric>> findDashboardMetrics() {
    return _repository.findDashboardMetrics();
  }

  Future<List<StrengthProgress>> findStrengthProgress() {
    return _repository.findStrengthProgress();
  }

  Future<List<VolumePoint>> findVolume() {
    return _repository.findVolume();
  }

  Future<ConsistencySummary> findConsistency() {
    return _repository.findConsistency();
  }

  Future<BodyweightSummary> findBodyweight() {
    return _repository.findBodyweight();
  }

  Future<List<MuscleDistributionPoint>> findMuscleDistribution() {
    return _repository.findMuscleDistribution();
  }
}
