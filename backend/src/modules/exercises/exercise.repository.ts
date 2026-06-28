import type { Exercise } from "./exercise.types.js";
import { exerciseCatalog } from "./exercise-catalog.js";

export type ExerciseListFilters = {
  search?: string;
  trackedOnly?: boolean;
};

export type ExerciseRepository = {
  list(filters: ExerciseListFilters): Promise<readonly Exercise[]>;
  findById(id: string): Promise<Exercise | null>;
};

export class CatalogExerciseRepository implements ExerciseRepository {
  async list(filters: ExerciseListFilters): Promise<readonly Exercise[]> {
    const search = filters.search?.trim().toLowerCase();

    return exerciseCatalog.filter((exercise) => {
      if (filters.trackedOnly && !exercise.isTrackedLift) {
        return false;
      }

      if (search && !exercise.name.toLowerCase().includes(search)) {
        return false;
      }

      return true;
    });
  }

  async findById(id: string): Promise<Exercise | null> {
    return exerciseCatalog.find((exercise) => exercise.id === id) ?? null;
  }
}
