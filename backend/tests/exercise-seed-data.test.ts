import { describe, expect, it } from "vitest";

import { seedExercises, seedMuscles } from "../prisma/seed-data/exercise-seed-data.js";
import { validateExerciseSeedData } from "../prisma/seed-data/validate-exercise-seed-data.js";
import { trackedLiftIds } from "../src/shared/constants/tracked-lifts.js";

describe("exercise seed data", () => {
  it("validates the seed catalog successfully", () => {
    expect(() => validateExerciseSeedData(seedMuscles, seedExercises)).not.toThrow();
  });

  it("contains exactly the approved tracked lift ids", () => {
    const trackedSeedIds = seedExercises
      .filter((exercise) => exercise.isTrackedLift)
      .map((exercise) => exercise.trackedLiftId);

    expect(trackedSeedIds).toEqual([...trackedLiftIds]);
  });

  it("contains no duplicate exercise-muscle mappings", () => {
    for (const exercise of seedExercises) {
      const mappedMuscles = exercise.muscles.map((muscle) => muscle.muscleId);
      expect(new Set(mappedMuscles).size).toBe(mappedMuscles.length);
    }
  });

  it("rejects duplicate muscle mappings", () => {
    const invalidExercises = [
      {
        ...seedExercises[0]!,
        muscles: [
          ...seedExercises[0]!.muscles,
          {
            muscleId: seedExercises[0]!.muscles[0]!.muscleId,
            role: "SECONDARY" as const
          }
        ]
      },
      ...seedExercises.slice(1)
    ];

    expect(() => validateExerciseSeedData(seedMuscles, invalidExercises)).toThrow(
      /duplicate muscle mapping/
    );
  });
});
