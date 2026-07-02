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

  factory RankingEntrySummary.fromJson(Map<String, dynamic> json) {
    return RankingEntrySummary(
      rank: json['currentRank'] as int? ?? 0,
      displayName: json['displayName'] as String? ?? 'Lifter',
      exerciseName: json['exerciseName'] as String? ?? 'Exercise',
      bestWeight: (json['bestWeight'] as num?)?.toDouble() ?? 0,
      bestReps: json['bestReps'] as int? ?? 0,
      percentile: (json['percentile'] as num?)?.toDouble() ?? 0,
    );
  }
}
