class AnalyticsMetric {
  const AnalyticsMetric({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;
}

class StrengthProgress {
  const StrengthProgress({
    required this.exerciseName,
    required this.currentPr,
    required this.previousPr,
    required this.progressPercent,
  });

  final String exerciseName;
  final String currentPr;
  final String previousPr;
  final double progressPercent;
}

class VolumePoint {
  const VolumePoint({
    required this.label,
    required this.volume,
  });

  final String label;
  final double volume;
}

class ConsistencySummary {
  const ConsistencySummary({
    required this.currentStreak,
    required this.longestStreak,
    required this.workoutsThisWeek,
    required this.workoutsThisMonth,
  });

  final int currentStreak;
  final int longestStreak;
  final int workoutsThisWeek;
  final int workoutsThisMonth;
}

class BodyweightSummary {
  const BodyweightSummary({
    required this.current,
    required this.highest,
    required this.lowest,
    required this.average,
  });

  final double current;
  final double highest;
  final double lowest;
  final double average;
}

class MuscleDistributionPoint {
  const MuscleDistributionPoint({
    required this.muscleGroup,
    required this.percent,
  });

  final String muscleGroup;
  final double percent;
}
