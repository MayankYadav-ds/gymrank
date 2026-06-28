class MuscleSummary {
  const MuscleSummary({
    required this.id,
    required this.name,
    required this.region,
  });

  final String id;
  final String name;
  final String region;
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
}
