import 'exercise_models.dart';
import 'exercise_repository.dart';

class ExerciseService {
  const ExerciseService(this._repository);

  final ExerciseRepository _repository;

  Future<List<ExerciseSummary>> listExercises() {
    return _repository.findAll();
  }

  Future<ExerciseSummary?> getExercise(String id) {
    return _repository.findById(id);
  }
}
