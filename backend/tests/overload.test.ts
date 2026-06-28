import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app/create-app.js";
import type { AppConfig } from "../src/config/env.js";
import { signAuthToken } from "../src/modules/auth-profile/auth-token.js";
import type { OverloadRepository } from "../src/modules/overload/overload.repository.js";
import { OverloadService } from "../src/modules/overload/overload.service.js";
import type { CompletedExercisePerformance } from "../src/modules/overload/overload.types.js";

const testConfig: AppConfig = {
  nodeEnv: "test",
  appName: "GymRank",
  port: 4000,
  corsOrigin: "http://localhost:3000",
  databaseUrl: "postgresql://gymrank:gymrank_dev_password@localhost:5432/gymrank_dev?schema=public",
  jwtSecret: "test-secret-that-is-at-least-thirty-two-characters",
  jwtExpiresIn: "7d"
};

describe("progressive overload", () => {
  it("returns no recommendation for a first exercise with no completed workout", async () => {
    const service = new OverloadService(new InMemoryOverloadRepository({ bench_press: [] }));

    const result = await service.findRecommendation("user_1", "bench_press");

    expect(result).toMatchObject({
      recommendation: "none",
      suggestedWeight: null,
      suggestedReps: null,
      explanation: "No recommendation available yet."
    });
  });

  it("recommends rep progression after only one completed workout", async () => {
    const service = new OverloadService(new InMemoryOverloadRepository({
      bench_press: [performance("bench_press", "Bench Press", "STRENGTH", 100, [8, 8])]
    }));

    const result = await service.findRecommendation("user_1", "bench_press");

    expect(result).toMatchObject({
      recommendation: "increase_reps",
      suggestedWeight: 100,
      suggestedReps: 9
    });
  });

  it("uses upper body 2.5kg increment after successful progression", async () => {
    const service = new OverloadService(new InMemoryOverloadRepository({
      bench_press: [
        performance("bench_press", "Bench Press", "STRENGTH", 100, [8, 8]),
        performance("bench_press", "Bench Press", "STRENGTH", 100, [7, 7], "workout_old")
      ]
    }));

    const result = await service.findRecommendation("user_1", "bench_press");

    expect(result).toMatchObject({
      recommendation: "increase_weight",
      suggestedWeight: 102.5,
      suggestedReps: 7
    });
  });

  it("uses lower body 5kg increment after successful progression", async () => {
    const service = new OverloadService(new InMemoryOverloadRepository({
      squat: [
        performance("squat", "Squat", "STRENGTH", 140, [5, 5]),
        performance("squat", "Squat", "STRENGTH", 140, [5, 5], "workout_old")
      ]
    }));

    const result = await service.findRecommendation("user_1", "squat");

    expect(result).toMatchObject({
      recommendation: "increase_weight",
      suggestedWeight: 145,
      suggestedReps: 5
    });
  });

  it("recommends repeating weight after failed progression", async () => {
    const service = new OverloadService(new InMemoryOverloadRepository({
      bench_press: [
        performance("bench_press", "Bench Press", "STRENGTH", 100, [6, 7]),
        performance("bench_press", "Bench Press", "STRENGTH", 100, [8, 8], "workout_old")
      ]
    }));

    const result = await service.findRecommendation("user_1", "bench_press");

    expect(result).toMatchObject({
      recommendation: "repeat_weight",
      suggestedWeight: 100,
      suggestedReps: 8
    });
  });

  it("recommends conservative increase when target reps were greatly exceeded", async () => {
    const service = new OverloadService(new InMemoryOverloadRepository({
      bench_press: [
        performance("bench_press", "Bench Press", "STRENGTH", 100, [11]),
        performance("bench_press", "Bench Press", "STRENGTH", 100, [8], "workout_old")
      ]
    }));

    const result = await service.findRecommendation("user_1", "bench_press");

    expect(result).toMatchObject({
      recommendation: "increase_weight",
      suggestedWeight: 102.5
    });
  });

  it("uses rep progression when a weight jump is inappropriate", async () => {
    const service = new OverloadService(new InMemoryOverloadRepository({
      bench_press: [
        performance("bench_press", "Bench Press", "STRENGTH", 10, [8]),
        performance("bench_press", "Bench Press", "STRENGTH", 10, [8], "workout_old")
      ]
    }));

    const result = await service.findRecommendation("user_1", "bench_press");

    expect(result).toMatchObject({
      recommendation: "increase_reps",
      suggestedWeight: 10,
      suggestedReps: 9
    });
  });

  it("rejects invalid exercises", async () => {
    const service = new OverloadService(new InMemoryOverloadRepository({}));

    await expect(service.findRecommendation("user_1", "missing")).rejects.toMatchObject({
      code: "exercise_not_found"
    });
  });

  it("requires authorization for the API", async () => {
    const response = await request(createApp(testConfig, { overloadRepository: new InMemoryOverloadRepository({}) }))
      .get("/v1/overload/bench_press");

    expect(response.status).toBe(401);
  });

  it("returns exercise recommendation through the API", async () => {
    const token = signAuthToken({ userId: "user_1", email: "user@example.com" }, testConfig);
    const repository = new InMemoryOverloadRepository({
      bench_press: [performance("bench_press", "Bench Press", "STRENGTH", 100, [8])]
    });

    const response = await request(createApp(testConfig, { overloadRepository: repository }))
      .get("/v1/overload/bench_press")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      recommendation: "increase_reps",
      suggestedWeight: 100,
      suggestedReps: 9
    });
  });
});

function performance(
  exerciseId: string,
  exerciseName: string,
  category: string,
  weight: number,
  reps: number[],
  workoutSessionId = "workout_latest"
): CompletedExercisePerformance {
  return {
    workoutSessionId,
    exerciseId,
    exerciseName,
    category,
    completedAt: new Date().toISOString(),
    sets: reps.map((repCount) => ({
      weight,
      reps: repCount,
      completed: true
    }))
  };
}

class InMemoryOverloadRepository implements OverloadRepository {
  constructor(private readonly performancesByExercise: Record<string, readonly CompletedExercisePerformance[]>) {}

  async findRecentCompletedExercisePerformances(
    _userId: string,
    exerciseId: string,
    limit: number
  ): Promise<readonly CompletedExercisePerformance[]> {
    return (this.performancesByExercise[exerciseId] ?? []).slice(0, limit);
  }

  async findLatestCompletedExerciseIds(_userId: string): Promise<readonly string[]> {
    return Object.keys(this.performancesByExercise);
  }

  async exerciseExists(exerciseId: string): Promise<boolean> {
    return exerciseId in this.performancesByExercise || ["bench_press", "squat"].includes(exerciseId);
  }
}
