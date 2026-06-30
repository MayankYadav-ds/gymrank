import 'analytics_models.dart';

abstract class AnalyticsRepository {
  Future<List<AnalyticsMetric>> findDashboardMetrics();

  Future<List<StrengthProgress>> findStrengthProgress();

  Future<List<VolumePoint>> findVolume();

  Future<ConsistencySummary> findConsistency();

  Future<BodyweightSummary> findBodyweight();

  Future<List<MuscleDistributionPoint>> findMuscleDistribution();
}

class MockAnalyticsRepository implements AnalyticsRepository {
  const MockAnalyticsRepository();

  @override
  Future<List<AnalyticsMetric>> findDashboardMetrics() async {
    return const [
      AnalyticsMetric(label: 'Total Workouts', value: '42'),
      AnalyticsMetric(label: 'Total Sets', value: '612'),
      AnalyticsMetric(label: 'Total Reps', value: '3,480'),
      AnalyticsMetric(label: 'Volume Lifted', value: '284,500 kg'),
      AnalyticsMetric(label: 'Active Days', value: '31'),
      AnalyticsMetric(label: 'Workout Streak', value: '5 days'),
      AnalyticsMetric(label: 'Current Bodyweight', value: '82.5 kg'),
      AnalyticsMetric(label: 'PR Count', value: '18'),
    ];
  }

  @override
  Future<List<StrengthProgress>> findStrengthProgress() async {
    return const [
      StrengthProgress(
        exerciseName: 'Bench Press',
        currentPr: '105 kg x 5',
        previousPr: '100 kg x 5',
        progressPercent: 5,
      ),
      StrengthProgress(
        exerciseName: 'Squat',
        currentPr: '140 kg x 3',
        previousPr: '132.5 kg x 3',
        progressPercent: 5.66,
      ),
      StrengthProgress(
        exerciseName: 'Deadlift',
        currentPr: '180 kg x 1',
        previousPr: '170 kg x 1',
        progressPercent: 5.88,
      ),
    ];
  }

  @override
  Future<List<VolumePoint>> findVolume() async {
    return const [
      VolumePoint(label: 'Week 1', volume: 24500),
      VolumePoint(label: 'Week 2', volume: 28100),
      VolumePoint(label: 'Week 3', volume: 30250),
      VolumePoint(label: 'Week 4', volume: 33600),
    ];
  }

  @override
  Future<ConsistencySummary> findConsistency() async {
    return const ConsistencySummary(
      currentStreak: 5,
      longestStreak: 12,
      workoutsThisWeek: 4,
      workoutsThisMonth: 17,
    );
  }

  @override
  Future<BodyweightSummary> findBodyweight() async {
    return const BodyweightSummary(
      current: 82.5,
      highest: 84,
      lowest: 80.8,
      average: 82.2,
    );
  }

  @override
  Future<List<MuscleDistributionPoint>> findMuscleDistribution() async {
    return const [
      MuscleDistributionPoint(muscleGroup: 'Chest', percent: 22),
      MuscleDistributionPoint(muscleGroup: 'Back', percent: 18),
      MuscleDistributionPoint(muscleGroup: 'Legs', percent: 28),
      MuscleDistributionPoint(muscleGroup: 'Shoulders', percent: 12),
      MuscleDistributionPoint(muscleGroup: 'Arms', percent: 14),
      MuscleDistributionPoint(muscleGroup: 'Core', percent: 6),
    ];
  }
}
