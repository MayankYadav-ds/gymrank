import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app/create-app.js";
import type { AppConfig } from "../src/config/env.js";
import type { ExerciseRepository, ExerciseListFilters } from "../src/modules/exercises/exercise.repository.js";
import type { Exercise } from "../src/modules/exercises/exercise.types.js";
import { trackedLiftIds } from "../src/shared/constants/tracked-lifts.js";
import { seedExercises, seedMuscles } from "../prisma/seed-data/exercise-seed-data.js";

const testConfig: AppConfig = {
  nodeEnv: "test",
  appName: "GymRank",
  port: 4000,
  corsOrigin: "http://localhost:3000",
  databaseUrl: "postgresql://gymrank:gymrank_dev_password@localhost:5432/gymrank_dev?schema=public",
  jwtSecret: "test-secret-that-is-at-least-thirty-two-characters",
  jwtExpiresIn: "7d"
};

describe("exercise routes", () => {
  it("lists exercises with muscle targeting summaries", async () => {
    const response = await request(createExerciseTestApp()).get("/v1/exercises");

    expect(response.status).toBe(200);
    expect(response.body.exercises.length).toBeGreaterThan(5);
    expect(response.body.exercises[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        primaryMuscles: expect.any(Array),
        secondaryMuscles: expect.any(Array)
      })
    );
  });

  it("restricts tracked lifts to the approved V1 ranking lift ids", async () => {
    const response = await request(createExerciseTestApp()).get("/v1/exercises?trackedOnly=true");

    expect(response.status).toBe(200);
    expect(response.body.exercises.map((exercise: { trackedLiftId: string }) => exercise.trackedLiftId).sort()).toEqual(
      [...trackedLiftIds].sort()
    );
  });

  it("returns exercise-centric anatomy data for exercise detail", async () => {
    const response = await request(createExerciseTestApp()).get("/v1/exercises/bench_press");

    expect(response.status).toBe(200);
    expect(response.body.exercise).toMatchObject({
      id: "bench_press",
      name: "Bench Press",
      isTrackedLift: true,
      trackedLiftId: "bench_press",
      anatomy: {
        frontHighlightedMuscles: expect.arrayContaining([
          expect.objectContaining({ id: "chest", name: "Chest" })
        ]),
        backHighlightedMuscles: []
      }
    });
  });

  it("does not mark unsupported exercise variants as ranking lifts", async () => {
    const response = await request(createExerciseTestApp()).get("/v1/exercises/barbell_row");

    expect(response.status).toBe(200);
    expect(response.body.exercise.isTrackedLift).toBe(false);
    expect(response.body.exercise.trackedLiftId).toBeNull();
  });

  it("returns 404 for unknown exercises", async () => {
    const response = await request(createExerciseTestApp()).get("/v1/exercises/unknown_lift");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("exercise_not_found");
  });

  it("supports search without changing the response shape", async () => {
    const response = await request(createExerciseTestApp()).get("/v1/exercises?search=press");

    expect(response.status).toBe(200);
    expect(response.body.exercises.map((exercise: { id: string }) => exercise.id)).toEqual([
      "bench_press",
      "incline_dumbbell_press",
      "leg_press",
      "overhead_press"
    ]);
  });

  it("supports category filtering", async () => {
    const response = await request(createExerciseTestApp()).get("/v1/exercises?category=accessory");

    expect(response.status).toBe(200);
    expect(response.body.exercises).toEqual([
      expect.objectContaining({
        id: "romanian_deadlift",
        category: "accessory"
      })
    ]);
  });
});

function createExerciseTestApp() {
  return createApp(testConfig, { exerciseRepository: new SeedExerciseRepository() });
}

class SeedExerciseRepository implements ExerciseRepository {
  private readonly exercises = seedExercises
    .map((exercise): Exercise => ({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category.toLowerCase() as Exercise["category"],
      equipment: exercise.equipment,
      difficulty: exercise.difficulty.toLowerCase() as Exercise["difficulty"],
      isTrackedLift: exercise.isTrackedLift,
      trackedLiftId: exercise.trackedLiftId,
      muscles: exercise.muscles.map((mapping) => {
        const muscle = seedMuscles.find((seedMuscle) => seedMuscle.id === mapping.muscleId);

        if (!muscle) {
          throw new Error(`Missing test muscle: ${mapping.muscleId}`);
        }

        return {
          id: muscle.id,
          name: muscle.name,
          region: muscle.region.toLowerCase() as "front" | "back" | "both",
          role: mapping.role.toLowerCase() as "primary" | "secondary"
        };
      })
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  async findAll(): Promise<readonly Exercise[]> {
    return this.exercises;
  }

  async findById(id: string): Promise<Exercise | null> {
    return this.exercises.find((exercise) => exercise.id === id) ?? null;
  }

  async findTrackedLifts(): Promise<readonly Exercise[]> {
    return this.exercises.filter((exercise) => exercise.isTrackedLift);
  }

  async search(query: string): Promise<readonly Exercise[]> {
    const normalizedQuery = query.toLowerCase();
    return this.exercises.filter((exercise) => exercise.name.toLowerCase().includes(normalizedQuery));
  }

  async findByCategory(category: Exercise["category"]): Promise<readonly Exercise[]> {
    return this.exercises.filter((exercise) => exercise.category === category);
  }

  async findByMuscle(muscleId: string): Promise<readonly Exercise[]> {
    return this.exercises.filter((exercise) => exercise.muscles.some((muscle) => muscle.id === muscleId));
  }

  async list(filters: ExerciseListFilters): Promise<readonly Exercise[]> {
    let exercises = this.exercises;

    if (filters.trackedOnly) {
      exercises = exercises.filter((exercise) => exercise.isTrackedLift);
    }

    if (filters.search) {
      const normalizedSearch = filters.search.toLowerCase();
      exercises = exercises.filter((exercise) => exercise.name.toLowerCase().includes(normalizedSearch));
    }

    if (filters.category) {
      exercises = exercises.filter((exercise) => exercise.category === filters.category);
    }

    if (filters.muscleId) {
      exercises = exercises.filter((exercise) =>
        exercise.muscles.some((muscle) => muscle.id === filters.muscleId)
      );
    }

    return exercises;
  }
}
