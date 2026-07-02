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

  factory WorkoutSetDraft.fromJson(Map<String, dynamic> json) {
    return WorkoutSetDraft(
      id: json['id'] as String,
      weight: (json['weight'] as num?)?.toDouble() ?? 0,
      reps: json['reps'] as int? ?? 0,
      type: json['type'] as String? ?? 'normal',
      completed: json['completed'] as bool? ?? false,
    );
  }
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

  factory WorkoutExerciseDraft.fromJson(Map<String, dynamic> json) {
    return WorkoutExerciseDraft(
      id: json['id'] as String,
      exerciseName: json['exerciseName'] as String? ?? 'Exercise',
      notes: json['notes'] as String?,
      sets: _setsFromJson(json['sets']),
    );
  }
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

  factory WorkoutSessionDraft.fromJson(Map<String, dynamic> json) {
    return WorkoutSessionDraft(
      id: json['id'] as String,
      title: (json['title'] as String?)?.isNotEmpty == true ? json['title'] as String : 'Untitled workout',
      status: json['status'] as String? ?? 'in_progress',
      exercises: _exercisesFromJson(json['exercises']),
    );
  }
}

List<WorkoutExerciseDraft> _exercisesFromJson(Object? value) {
  if (value is! List) {
    return [];
  }

  return value.whereType<Map<String, dynamic>>().map(WorkoutExerciseDraft.fromJson).toList();
}

List<WorkoutSetDraft> _setsFromJson(Object? value) {
  if (value is! List) {
    return [];
  }

  return value.whereType<Map<String, dynamic>>().map(WorkoutSetDraft.fromJson).toList();
}
