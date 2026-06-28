import 'exercise_models.dart';
import 'exercise_sample_catalog.dart';

abstract class ExerciseRepository {
  Future<List<ExerciseSummary>> findAll();

  Future<ExerciseSummary?> findById(String id);
}

class MockExerciseRepository implements ExerciseRepository {
  const MockExerciseRepository();

  @override
  Future<List<ExerciseSummary>> findAll() async {
    return sampleExercises;
  }

  @override
  Future<ExerciseSummary?> findById(String id) async {
    return findSampleExercise(id);
  }
}
