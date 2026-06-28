import 'workout_models.dart';

abstract class WorkoutRepository {
  Future<List<WorkoutSessionDraft>> findHistory();

  Future<WorkoutSessionDraft> createWorkout();

  Future<WorkoutSessionDraft?> findWorkout(String id);
}

class MockWorkoutRepository implements WorkoutRepository {
  const MockWorkoutRepository();

  @override
  Future<WorkoutSessionDraft> createWorkout() async {
    return sampleWorkouts.first;
  }

  @override
  Future<List<WorkoutSessionDraft>> findHistory() async {
    return sampleWorkouts;
  }

  @override
  Future<WorkoutSessionDraft?> findWorkout(String id) async {
    for (final workout in sampleWorkouts) {
      if (workout.id == id) {
        return workout;
      }
    }

    return null;
  }
}

const sampleWorkouts = <WorkoutSessionDraft>[
  WorkoutSessionDraft(
    id: 'sample_workout_1',
    title: 'Upper Strength',
    status: 'in_progress',
    exercises: [
      WorkoutExerciseDraft(
        id: 'sample_workout_exercise_1',
        exerciseName: 'Bench Press',
        notes: 'Controlled reps',
        sets: [
          WorkoutSetDraft(
            id: 'sample_set_1',
            weight: 135,
            reps: 8,
            type: 'normal',
            completed: true,
          ),
        ],
      ),
    ],
  ),
];
