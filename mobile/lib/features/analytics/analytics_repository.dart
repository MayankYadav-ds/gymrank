import 'analytics_models.dart';
import '../../core/api/api_client.dart';

abstract class AnalyticsRepository {
  Future<List<AnalyticsMetric>> findDashboardMetrics();

  Future<List<StrengthProgress>> findStrengthProgress();

  Future<List<VolumePoint>> findVolume();

  Future<ConsistencySummary> findConsistency();

  Future<BodyweightSummary> findBodyweight();

  Future<List<MuscleDistributionPoint>> findMuscleDistribution();
}

class ApiAnalyticsRepository implements AnalyticsRepository {
  const ApiAnalyticsRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient.shared;

  final ApiClient _apiClient;

  @override
  Future<List<AnalyticsMetric>> findDashboardMetrics() async {
    final json = await _apiClient.getJson('/v1/analytics/dashboard');
    final dashboard = json['dashboard'] as Map<String, dynamic>? ?? const {};

    return [
      AnalyticsMetric(label: 'Total Workouts', value: '${dashboard['totalWorkouts'] ?? 0}'),
      AnalyticsMetric(label: 'Total Sets', value: '${dashboard['totalSets'] ?? 0}'),
      AnalyticsMetric(label: 'Total Reps', value: '${dashboard['totalReps'] ?? 0}'),
      AnalyticsMetric(label: 'Volume Lifted', value: '${dashboard['totalVolumeLifted'] ?? 0} kg'),
      AnalyticsMetric(label: 'Active Days', value: '${dashboard['activeDays'] ?? 0}'),
      AnalyticsMetric(label: 'Workout Streak', value: '${dashboard['workoutStreak'] ?? 0} days'),
      AnalyticsMetric(label: 'Current Bodyweight', value: '${dashboard['currentBodyweight'] ?? '-'} kg'),
      AnalyticsMetric(label: 'PR Count', value: '${dashboard['prCount'] ?? 0}'),
    ];
  }

  @override
  Future<List<StrengthProgress>> findStrengthProgress() async {
    final json = await _apiClient.getJson('/v1/analytics/strength');
    final strength = json['strength'];

    if (strength is! List) {
      return [];
    }

    return strength.whereType<Map<String, dynamic>>().map((item) {
      final currentPr = item['currentPr'] as Map<String, dynamic>?;
      final previousPr = item['previousPr'] as Map<String, dynamic>?;
      return StrengthProgress(
        exerciseName: item['exerciseName'] as String? ?? 'Exercise',
        currentPr: _formatPr(currentPr),
        previousPr: _formatPr(previousPr),
        progressPercent: (item['progressPercent'] as num?)?.toDouble() ?? 0,
      );
    }).toList();
  }

  @override
  Future<List<VolumePoint>> findVolume() async {
    final json = await _apiClient.getJson('/v1/analytics/volume');
    final volume = json['volume'] as Map<String, dynamic>? ?? const {};
    final weekly = volume['weeklyVolume'];

    if (weekly is! List) {
      return [];
    }

    return weekly.whereType<Map<String, dynamic>>().map((item) {
      return VolumePoint(
        label: item['period'] as String? ?? '',
        volume: (item['volume'] as num?)?.toDouble() ?? 0,
      );
    }).toList();
  }

  @override
  Future<ConsistencySummary> findConsistency() async {
    final json = await _apiClient.getJson('/v1/analytics/consistency');
    final consistency = json['consistency'] as Map<String, dynamic>? ?? const {};

    return ConsistencySummary(
      currentStreak: consistency['currentStreak'] as int? ?? 0,
      longestStreak: consistency['longestStreak'] as int? ?? 0,
      workoutsThisWeek: consistency['workoutsThisWeek'] as int? ?? 0,
      workoutsThisMonth: consistency['workoutsThisMonth'] as int? ?? 0,
    );
  }

  @override
  Future<BodyweightSummary> findBodyweight() async {
    final json = await _apiClient.getJson('/v1/analytics/bodyweight');
    final bodyweight = json['bodyweight'] as Map<String, dynamic>? ?? const {};

    return BodyweightSummary(
      current: (bodyweight['current'] as num?)?.toDouble(),
      highest: (bodyweight['highest'] as num?)?.toDouble(),
      lowest: (bodyweight['lowest'] as num?)?.toDouble(),
      average: (bodyweight['average'] as num?)?.toDouble(),
    );
  }

  @override
  Future<List<MuscleDistributionPoint>> findMuscleDistribution() async {
    final json = await _apiClient.getJson('/v1/analytics/muscles');
    final muscles = json['muscles'] as Map<String, dynamic>? ?? const {};

    return muscles.entries.map((entry) {
      return MuscleDistributionPoint(
        muscleGroup: entry.key,
        percent: (entry.value as num?)?.toDouble() ?? 0,
      );
    }).toList();
  }
}

String _formatPr(Map<String, dynamic>? pr) {
  if (pr == null) {
    return '-';
  }

  return '${pr['weight'] ?? 0} kg x ${pr['reps'] ?? 0}';
}
