class OverloadRecommendationSummary {
  const OverloadRecommendationSummary({
    required this.exerciseId,
    required this.exerciseName,
    required this.recommendation,
    required this.suggestedWeight,
    required this.suggestedReps,
    required this.explanation,
  });

  final String exerciseId;
  final String exerciseName;
  final String recommendation;
  final double? suggestedWeight;
  final int? suggestedReps;
  final String explanation;
}
