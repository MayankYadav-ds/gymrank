import { trackedLiftIds } from "../../src/shared/constants/tracked-lifts.js";
import type { SeedExercise, SeedMuscle } from "./exercise-seed-data.js";

export function validateExerciseSeedData(
  muscles: readonly SeedMuscle[],
  exercises: readonly SeedExercise[]
): void {
  const muscleIds = new Set<string>();

  for (const muscle of muscles) {
    if (muscleIds.has(muscle.id)) {
      throw new Error(`Duplicate muscle seed id: ${muscle.id}`);
    }

    muscleIds.add(muscle.id);
  }

  const exerciseIds = new Set<string>();
  const trackedSeedIds: string[] = [];

  for (const exercise of exercises) {
    if (exerciseIds.has(exercise.id)) {
      throw new Error(`Duplicate exercise seed id: ${exercise.id}`);
    }

    exerciseIds.add(exercise.id);

    if (exercise.isTrackedLift) {
      if (!exercise.trackedLiftId) {
        throw new Error(`Tracked lift is missing trackedLiftId: ${exercise.id}`);
      }

      trackedSeedIds.push(exercise.trackedLiftId);
    }

    if (!exercise.isTrackedLift && exercise.trackedLiftId) {
      throw new Error(`Non-tracked exercise has trackedLiftId: ${exercise.id}`);
    }

    const mappedMuscles = new Set<string>();

    for (const mapping of exercise.muscles) {
      if (!muscleIds.has(mapping.muscleId)) {
        throw new Error(`Exercise ${exercise.id} references unknown muscle: ${mapping.muscleId}`);
      }

      if (mappedMuscles.has(mapping.muscleId)) {
        throw new Error(`Exercise ${exercise.id} has duplicate muscle mapping: ${mapping.muscleId}`);
      }

      mappedMuscles.add(mapping.muscleId);
    }
  }

  const expectedTrackedIds = [...trackedLiftIds].sort();
  const actualTrackedIds = trackedSeedIds.sort();

  if (JSON.stringify(actualTrackedIds) !== JSON.stringify(expectedTrackedIds)) {
    throw new Error(
      `Tracked lift seed mismatch. Expected ${expectedTrackedIds.join(", ")}, got ${actualTrackedIds.join(", ")}`
    );
  }
}
