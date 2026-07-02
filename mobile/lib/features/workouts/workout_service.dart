import 'workout_models.dart';
import 'workout_repository.dart';

class WorkoutService {
  const WorkoutService(this._repository);

  final WorkoutRepository _repository;

  Future<List<WorkoutSessionDraft>> findHistory() {
    return _repository.findHistory();
  }

  Future<WorkoutSessionDraft> createWorkout() {
    return _repository.createWorkout();
  }

  Future<WorkoutSessionDraft?> findWorkout(String id) {
    return _repository.findWorkout(id);
  }

  Future<WorkoutSessionDraft> addExercise(String workoutId, String exerciseId) {
    return _repository.addExercise(workoutId, exerciseId);
  }

  Future<WorkoutSessionDraft> addSet({
    required String workoutId,
    required String workoutExerciseId,
    required double weight,
    required int reps,
    String type = 'normal',
    bool completed = true,
  }) {
    return _repository.addSet(
      workoutId: workoutId,
      workoutExerciseId: workoutExerciseId,
      weight: weight,
      reps: reps,
      type: type,
      completed: completed,
    );
  }

  Future<WorkoutSessionDraft> finishWorkout(String workoutId) {
    return _repository.finishWorkout(workoutId);
  }

  Future<void> deleteWorkout(String workoutId) {
    return _repository.deleteWorkout(workoutId);
  }
}
