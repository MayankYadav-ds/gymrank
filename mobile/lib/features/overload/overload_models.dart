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

  factory OverloadRecommendationSummary.fromJson(Map<String, dynamic> json) {
    final previousWorkout = json['previousWorkout'];
    final previousExercise = previousWorkout is Map<String, dynamic> ? previousWorkout['exerciseName'] as String? : null;

    return OverloadRecommendationSummary(
      exerciseId: json['exerciseId'] as String? ?? '',
      exerciseName: json['exerciseName'] as String? ?? previousExercise ?? 'Exercise',
      recommendation: json['recommendation'] as String? ?? 'none',
      suggestedWeight: (json['suggestedWeight'] as num?)?.toDouble(),
      suggestedReps: json['suggestedReps'] as int?,
      explanation: json['explanation'] as String? ?? 'No recommendation available yet.',
    );
  }
}
