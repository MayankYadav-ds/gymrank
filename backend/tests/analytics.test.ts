import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app/create-app.js";
import type { AppConfig } from "../src/config/env.js";
import { signAuthToken } from "../src/modules/auth-profile/auth-token.js";
import type { AnalyticsRepository } from "../src/modules/analytics/analytics.repository.js";
import { AnalyticsService } from "../src/modules/analytics/analytics.service.js";
import type { AnalyticsSource, AnalyticsWorkout } from "../src/modules/analytics/analytics.types.js";

const testConfig: AppConfig = {
  nodeEnv: "test",
  appName: "GymRank",
  port: 4000,
  corsOrigin: "http://localhost:3000",
  databaseUrl: "postgresql://gymrank:gymrank_dev_password@localhost:5432/gymrank_dev?schema=public",
  jwtSecret: "test-secret-that-is-at-least-thirty-two-characters",
  jwtExpiresIn: "7d"
};

const fixedNow = () => new Date("2026-06-30T12:00:00.000Z");

describe("analytics", () => {
  it("calculates dashboard totals from completed workouts", async () => {
    const service = serviceFor(sourceFixture());

    const dashboard = await service.getDashboard("user_1");

    expect(dashboard).toMatchObject({
      totalWorkouts: 3,
      totalSets: 5,
      totalReps: 25,
      totalVolumeLifted: 2250,
      activeDays: 3,
      workoutStreak: 3,
      currentBodyweight: 82.5,
      prCount: 2
    });
  });

  it("calculates volume buckets and exercise volume", async () => {
    const service = serviceFor(sourceFixture());

    const volume = await service.getVolume("user_1");

    expect(volume.weeklyVolume).toEqual([
      { period: "2026-W26", volume: 1000 },
      { period: "2026-W27", volume: 1250 }
    ]);
    expect(volume.monthlyVolume).toEqual([{ period: "2026-06", volume: 2250 }]);
    expect(volume.exerciseVolume).toContainEqual({
      exerciseId: "bench_press",
      exerciseName: "Bench Press",
      volume: 2050
    });
  });

  it("calculates consistency and streaks", async () => {
    const service = serviceFor(sourceFixture());

    const consistency = await service.getConsistency("user_1");

    expect(consistency).toMatchObject({
      currentStreak: 3,
      longestStreak: 3,
      workoutsThisWeek: 2,
      workoutsThisMonth: 3
    });
    expect(consistency.calendarHeatmap).toEqual([
      { date: "2026-06-28", workoutCount: 1 },
      { date: "2026-06-29", workoutCount: 1 },
      { date: "2026-06-30", workoutCount: 1 }
    ]);
  });

  it("calculates bodyweight analytics from the current profile bodyweight", async () => {
    const service = serviceFor(sourceFixture());

    const bodyweight = await service.getBodyweight("user_1");

    expect(bodyweight).toMatchObject({
      highest: 82.5,
      lowest: 82.5,
      current: 82.5,
      average: 82.5
    });
    expect(bodyweight.history).toEqual([{ date: "2026-06-30", bodyweight: 82.5 }]);
  });

  it("calculates muscle distribution percentages from muscle mappings", async () => {
    const service = serviceFor(sourceFixture());

    const muscles = await service.getMuscleDistribution("user_1");

    expect(muscles.chest).toBe(30.37);
    expect(muscles.arms).toBe(30.37);
    expect(muscles.shoulders).toBe(30.37);
    expect(muscles.legs).toBe(8.89);
    expect(muscles.back).toBe(0);
    expect(muscles.core).toBe(0);
  });

  it("returns strength analytics with current and previous PRs", async () => {
    const service = serviceFor(sourceFixture());

    const strength = await service.getStrength("user_1");
    const bench = strength.find((item) => item.exerciseId === "bench_press");

    expect(bench).toMatchObject({
      exerciseId: "bench_press",
      currentPr: { weight: 105, reps: 5 },
      previousPr: { weight: 100, reps: 5 },
      progressPercent: 5,
      lastWorkout: { workoutId: "workout_2" },
      bestWorkout: { workoutId: "workout_2", volume: 1050 }
    });
  });

  it("returns zeroed analytics for an empty user", async () => {
    const service = serviceFor({ user: { bodyweight: null }, workouts: [], personalRecords: [] });

    await expect(service.getDashboard("user_1")).resolves.toMatchObject({
      totalWorkouts: 0,
      totalSets: 0,
      totalReps: 0,
      totalVolumeLifted: 0,
      activeDays: 0,
      workoutStreak: 0,
      currentBodyweight: null,
      prCount: 0
    });
    await expect(service.getMuscleDistribution("user_1")).resolves.toEqual({
      chest: 0,
      back: 0,
      legs: 0,
      shoulders: 0,
      arms: 0,
      core: 0
    });
  });

  it("handles a large workout history without changing totals", async () => {
    const workouts = Array.from({ length: 120 }, (_, index) =>
      workout(`workout_${index}`, `2026-01-${((index % 28) + 1).toString().padStart(2, "0")}T10:00:00.000Z`, [
        exercise("bench_press", "Bench Press", ["chest"], [{ id: `set_${index}`, weight: 100, reps: 5 }])
      ])
    );
    const service = serviceFor({ user: { bodyweight: 80 }, workouts, personalRecords: [] });

    const dashboard = await service.getDashboard("user_1");

    expect(dashboard.totalWorkouts).toBe(120);
    expect(dashboard.totalSets).toBe(120);
    expect(dashboard.totalReps).toBe(600);
    expect(dashboard.totalVolumeLifted).toBe(60000);
  });

  it("requires authorization for analytics endpoints", async () => {
    const response = await request(createApp(testConfig, { analyticsRepository: repositoryFor(sourceFixture()) }))
      .get("/v1/analytics/dashboard");

    expect(response.status).toBe(401);
  });

  it("returns dashboard analytics through the API", async () => {
    const token = signAuthToken({ userId: "user_1", email: "user@example.com" }, testConfig);
    const response = await request(createApp(testConfig, { analyticsRepository: repositoryFor(sourceFixture()) }))
      .get("/v1/analytics/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.dashboard).toMatchObject({
      totalWorkouts: 3,
      totalVolumeLifted: 2250
    });
  });
});

function serviceFor(source: AnalyticsSource): AnalyticsService {
  return new AnalyticsService(repositoryFor(source), fixedNow);
}

function repositoryFor(source: AnalyticsSource): AnalyticsRepository {
  return {
    async getAnalyticsSource(_userId: string): Promise<AnalyticsSource> {
      return source;
    }
  };
}

function sourceFixture(): AnalyticsSource {
  return {
    user: { bodyweight: 82.5 },
    workouts: [
      workout("workout_1", "2026-06-28T10:00:00.000Z", [
        exercise("bench_press", "Bench Press", ["chest", "front_delts", "triceps"], [
          { id: "set_1", weight: 100, reps: 5 },
          { id: "set_2", weight: 100, reps: 5 }
        ])
      ]),
      workout("workout_2", "2026-06-29T10:00:00.000Z", [
        exercise("bench_press", "Bench Press", ["chest", "front_delts", "triceps"], [
          { id: "set_3", weight: 105, reps: 5 },
          { id: "set_4", weight: 105, reps: 5 }
        ])
      ]),
      workout("workout_3", "2026-06-30T10:00:00.000Z", [
        exercise("squat", "Squat", ["quads"], [{ id: "set_5", weight: 40, reps: 5 }])
      ])
    ],
    personalRecords: [
      {
        id: "pr_1",
        exerciseId: "bench_press",
        exerciseName: "Bench Press",
        weight: 100,
        reps: 5,
        achievedAt: "2026-06-28T10:00:00.000Z"
      },
      {
        id: "pr_2",
        exerciseId: "bench_press",
        exerciseName: "Bench Press",
        weight: 105,
        reps: 5,
        achievedAt: "2026-06-29T10:00:00.000Z"
      }
    ]
  };
}

function workout(id: string, startedAt: string, exercises: readonly AnalyticsWorkout["exercises"][number][]): AnalyticsWorkout {
  return {
    id,
    startedAt,
    finishedAt: startedAt,
    exercises
  };
}

function exercise(
  exerciseId: string,
  exerciseName: string,
  muscleIds: readonly string[],
  sets: readonly { id: string; weight: number; reps: number; completed?: boolean }[]
): AnalyticsWorkout["exercises"][number] {
  return {
    id: `${exerciseId}_${sets[0]?.id ?? "empty"}`,
    exerciseId,
    exerciseName,
    sets: sets.map((set) => ({
      id: set.id,
      weight: set.weight,
      reps: set.reps,
      completed: set.completed ?? true
    })),
    muscles: muscleIds.map((id) => ({
      id,
      name: id
    }))
  };
}
