class MuscleSummary {
  const MuscleSummary({
    required this.id,
    required this.name,
    required this.region,
  });

  final String id;
  final String name;
  final String region;

  factory MuscleSummary.fromJson(Map<String, dynamic> json) {
    return MuscleSummary(
      id: json['id'] as String,
      name: json['name'] as String,
      region: json['region'] as String,
    );
  }
}

class ExerciseSummary {
  const ExerciseSummary({
    required this.id,
    required this.name,
    required this.equipment,
    required this.difficulty,
    required this.isTrackedLift,
    required this.primaryMuscles,
    required this.secondaryMuscles,
  });

  final String id;
  final String name;
  final String equipment;
  final String difficulty;
  final bool isTrackedLift;
  final List<MuscleSummary> primaryMuscles;
  final List<MuscleSummary> secondaryMuscles;

  List<MuscleSummary> get highlightedFrontMuscles {
    return [...primaryMuscles, ...secondaryMuscles]
        .where((muscle) => muscle.region != 'back')
        .toList();
  }

  List<MuscleSummary> get highlightedBackMuscles {
    return [...primaryMuscles, ...secondaryMuscles]
        .where((muscle) => muscle.region != 'front')
        .toList();
  }

  factory ExerciseSummary.fromJson(Map<String, dynamic> json) {
    return ExerciseSummary(
      id: json['id'] as String,
      name: json['name'] as String,
      equipment: json['equipment'] as String? ?? 'Unknown',
      difficulty: json['difficulty'] as String? ?? 'beginner',
      isTrackedLift: json['isTrackedLift'] as bool? ?? false,
      primaryMuscles: _musclesFromJson(json['primaryMuscles']),
      secondaryMuscles: _musclesFromJson(json['secondaryMuscles']),
    );
  }
}

List<MuscleSummary> _musclesFromJson(Object? value) {
  if (value is! List) {
    return [];
  }

  return value
      .whereType<Map<String, dynamic>>()
      .map(MuscleSummary.fromJson)
      .toList();
}
