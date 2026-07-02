import 'workout_models.dart';
import '../../core/api/api_client.dart';

abstract class WorkoutRepository {
  Future<List<WorkoutSessionDraft>> findHistory();

  Future<WorkoutSessionDraft> createWorkout();

  Future<WorkoutSessionDraft?> findWorkout(String id);

  Future<WorkoutSessionDraft> addExercise(String workoutId, String exerciseId);

  Future<WorkoutSessionDraft> addSet({
    required String workoutId,
    required String workoutExerciseId,
    required double weight,
    required int reps,
    String type = 'normal',
    bool completed = true,
  });

  Future<WorkoutSessionDraft> finishWorkout(String workoutId);

  Future<void> deleteWorkout(String workoutId);
}

class ApiWorkoutRepository implements WorkoutRepository {
  const ApiWorkoutRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient.shared;

  final ApiClient _apiClient;

  @override
  Future<WorkoutSessionDraft> createWorkout() async {
    final json = await _apiClient.postJson('/v1/workouts', body: const {});
    return WorkoutSessionDraft.fromJson(json['workout'] as Map<String, dynamic>);
  }

  @override
  Future<List<WorkoutSessionDraft>> findHistory() async {
    final json = await _apiClient.getJson('/v1/workouts');
    final workouts = json['workouts'];

    if (workouts is! List) {
      return [];
    }

    return workouts.whereType<Map<String, dynamic>>().map(WorkoutSessionDraft.fromJson).toList();
  }

  @override
  Future<WorkoutSessionDraft?> findWorkout(String id) async {
    final json = await _apiClient.getJson('/v1/workouts/$id');
    final workout = json['workout'];

    if (workout is Map<String, dynamic>) {
      return WorkoutSessionDraft.fromJson(workout);
    }

    return null;
  }

  @override
  Future<WorkoutSessionDraft> addExercise(String workoutId, String exerciseId) async {
    final json = await _apiClient.postJson('/v1/workouts/$workoutId/exercises', body: {
      'exerciseId': exerciseId,
    });
    return WorkoutSessionDraft.fromJson(json['workout'] as Map<String, dynamic>);
  }

  @override
  Future<WorkoutSessionDraft> addSet({
    required String workoutId,
    required String workoutExerciseId,
    required double weight,
    required int reps,
    String type = 'normal',
    bool completed = true,
  }) async {
    final json = await _apiClient.postJson('/v1/workouts/$workoutId/sets', body: {
      'workoutExerciseId': workoutExerciseId,
      'weight': weight,
      'reps': reps,
      'type': type,
      'completed': completed,
    });
    return WorkoutSessionDraft.fromJson(json['workout'] as Map<String, dynamic>);
  }

  @override
  Future<WorkoutSessionDraft> finishWorkout(String workoutId) async {
    final json = await _apiClient.patchJson('/v1/workouts/$workoutId', body: {
      'status': 'completed',
    });
    return WorkoutSessionDraft.fromJson(json['workout'] as Map<String, dynamic>);
  }

  @override
  Future<void> deleteWorkout(String workoutId) {
    return _apiClient.delete('/v1/workouts/$workoutId');
  }
}
