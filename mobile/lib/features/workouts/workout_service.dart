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
}
