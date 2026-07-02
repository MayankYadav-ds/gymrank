import 'exercise_models.dart';
import '../../core/api/api_client.dart';

abstract class ExerciseRepository {
  Future<List<ExerciseSummary>> findAll();

  Future<ExerciseSummary?> findById(String id);
}

class ApiExerciseRepository implements ExerciseRepository {
  const ApiExerciseRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient.shared;

  final ApiClient _apiClient;

  @override
  Future<List<ExerciseSummary>> findAll() async {
    final json = await _apiClient.getJson('/v1/exercises');
    final exercises = json['exercises'];

    if (exercises is! List) {
      return [];
    }

    return exercises.whereType<Map<String, dynamic>>().map(ExerciseSummary.fromJson).toList();
  }

  @override
  Future<ExerciseSummary?> findById(String id) async {
    final json = await _apiClient.getJson('/v1/exercises/$id');
    final exercise = json['exercise'];

    if (exercise is Map<String, dynamic>) {
      return ExerciseSummary.fromJson(exercise);
    }

    return null;
  }
}
