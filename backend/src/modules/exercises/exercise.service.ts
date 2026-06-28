import { AppError } from "../../shared/errors/app-error.js";
import { toExerciseDetail, toExerciseListItem } from "./exercise.mapper.js";
import type { ExerciseRepository } from "./exercise.repository.js";
import type { ListExercisesQuery } from "./exercise.schemas.js";
import type { ExerciseDetail, ExerciseListItem } from "./exercise.types.js";

export class ExerciseService {
  constructor(private readonly repository: ExerciseRepository) {}

  async listExercises(query: ListExercisesQuery): Promise<readonly ExerciseListItem[]> {
    const exercises = await this.repository.list({
      search: query.search,
      trackedOnly: query.trackedOnly,
      category: query.category,
      muscleId: query.muscleId
    });

    return exercises.map(toExerciseListItem);
  }

  async getExercise(id: string): Promise<ExerciseDetail> {
    const exercise = await this.repository.findById(id);

    if (!exercise) {
      throw new AppError(404, "exercise_not_found", "Exercise was not found.");
    }

    return toExerciseDetail(exercise);
  }
}
