class RankingEntrySummary {
  const RankingEntrySummary({
    required this.rank,
    required this.displayName,
    required this.exerciseName,
    required this.bestWeight,
    required this.bestReps,
    required this.percentile,
  });

  final int rank;
  final String displayName;
  final String exerciseName;
  final double bestWeight;
  final int bestReps;
  final double percentile;
}
