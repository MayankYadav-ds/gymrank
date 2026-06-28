class WorkoutSetDraft {
  const WorkoutSetDraft({
    required this.id,
    required this.weight,
    required this.reps,
    required this.type,
    required this.completed,
  });

  final String id;
  final double weight;
  final int reps;
  final String type;
  final bool completed;
}

class WorkoutExerciseDraft {
  const WorkoutExerciseDraft({
    required this.id,
    required this.exerciseName,
    required this.notes,
    required this.sets,
  });

  final String id;
  final String exerciseName;
  final String? notes;
  final List<WorkoutSetDraft> sets;
}

class WorkoutSessionDraft {
  const WorkoutSessionDraft({
    required this.id,
    required this.title,
    required this.status,
    required this.exercises,
  });

  final String id;
  final String title;
  final String status;
  final List<WorkoutExerciseDraft> exercises;
}
