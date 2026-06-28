import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app/create-app.js";
import type { AppConfig } from "../src/config/env.js";
import { signAuthToken } from "../src/modules/auth-profile/auth-token.js";
import type { PersonalRecordRepository } from "../src/modules/personal-records/personal-record.repository.js";
import { PersonalRecordService } from "../src/modules/personal-records/personal-record.service.js";
import type { PersonalRecord, PersonalRecordCandidate } from "../src/modules/personal-records/personal-record.types.js";
import type { WorkoutSession } from "../src/modules/workouts/workout.types.js";

const testConfig: AppConfig = {
  nodeEnv: "test",
  appName: "GymRank",
  port: 4000,
  corsOrigin: "http://localhost:3000",
  databaseUrl: "postgresql://gymrank:gymrank_dev_password@localhost:5432/gymrank_dev?schema=public",
  jwtSecret: "test-secret-that-is-at-least-thirty-two-characters",
  jwtExpiresIn: "7d"
};

describe("personal records", () => {
  it("creates a PR from the strongest completed set in a completed workout", async () => {
    const repository = new InMemoryPersonalRecordRepository();
    const service = new PersonalRecordService(repository);

    const records = await service.detectForCompletedWorkout(workoutWithSets([
      { id: "set_1", weight: 100, reps: 5, completed: true },
      { id: "set_2", weight: 120, reps: 3, completed: true }
    ]));

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ workoutSetId: "set_2", weight: 120, reps: 3 });
  });

  it("does not create PRs from incomplete sets", async () => {
    const repository = new InMemoryPersonalRecordRepository();
    const service = new PersonalRecordService(repository);

    const records = await service.detectForCompletedWorkout(workoutWithSets([
      { id: "set_1", weight: 200, reps: 1, completed: false }
    ]));

    expect(records).toHaveLength(0);
  });

  it("uses reps as a tie-breaker when weight is equal", async () => {
    const repository = new InMemoryPersonalRecordRepository();
    const service = new PersonalRecordService(repository);

    await service.detectForCompletedWorkout(workoutWithSets([{ id: "set_1", weight: 100, reps: 5, completed: true }]));
    const records = await service.detectForCompletedWorkout(
      workoutWithSets([{ id: "set_2", weight: 100, reps: 6, completed: true }], "workout_2")
    );

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ workoutSetId: "set_2", reps: 6 });
  });

  it("does not create a PR when the completed set is weaker than current best", async () => {
    const repository = new InMemoryPersonalRecordRepository();
    const service = new PersonalRecordService(repository);

    await service.detectForCompletedWorkout(workoutWithSets([{ id: "set_1", weight: 120, reps: 5, completed: true }]));
    const records = await service.detectForCompletedWorkout(
      workoutWithSets([{ id: "set_2", weight: 115, reps: 10, completed: true }], "workout_2")
    );

    expect(records).toHaveLength(0);
  });

  it("returns current PRs through the API", async () => {
    const repository = new InMemoryPersonalRecordRepository();
    await repository.createRecords([
      candidate({ workoutSetId: "set_1", weight: 100, reps: 5 }),
      candidate({ workoutSetId: "set_2", weight: 120, reps: 3 })
    ]);
    const token = signAuthToken({ userId: "user_1", email: "user@example.com" }, testConfig);

    const response = await request(createApp(testConfig, { personalRecordRepository: repository }))
      .get("/v1/personal-records")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.records).toHaveLength(1);
    expect(response.body.records[0]).toMatchObject({ weight: 120, reps: 3 });
  });

  it("returns exercise PR history through the API", async () => {
    const repository = new InMemoryPersonalRecordRepository();
    await repository.createRecords([
      candidate({ workoutSetId: "set_1", weight: 100, reps: 5 }),
      candidate({ workoutSetId: "set_2", weight: 120, reps: 3 })
    ]);
    const token = signAuthToken({ userId: "user_1", email: "user@example.com" }, testConfig);

    const response = await request(createApp(testConfig, { personalRecordRepository: repository }))
      .get("/v1/personal-records/bench_press")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.records).toHaveLength(2);
  });
});

function workoutWithSets(
  sets: Array<{ id: string; weight: number; reps: number; completed: boolean }>,
  workoutId = "workout_1"
): WorkoutSession {
  const now = new Date("2026-06-28T10:00:00.000Z").toISOString();

  return {
    id: workoutId,
    userId: "user_1",
    title: null,
    notes: null,
    status: "completed",
    startedAt: now,
    finishedAt: now,
    canceledAt: null,
    createdAt: now,
    updatedAt: now,
    exercises: [
      {
        id: "workout_exercise_1",
        workoutSessionId: workoutId,
        exerciseId: "bench_press",
        exerciseName: "Bench Press",
        orderIndex: 0,
        notes: null,
        createdAt: now,
        updatedAt: now,
        sets: sets.map((set, index) => ({
          ...set,
          workoutExerciseId: "workout_exercise_1",
          orderIndex: index,
          type: "normal",
          createdAt: now,
          updatedAt: now
        }))
      }
    ]
  };
}

function candidate(overrides: Partial<PersonalRecordCandidate>): PersonalRecordCandidate {
  return {
    userId: "user_1",
    exerciseId: "bench_press",
    workoutSessionId: "workout_1",
    workoutSetId: "set_1",
    weight: 100,
    reps: 5,
    achievedAt: new Date("2026-06-28T10:00:00.000Z").toISOString(),
    ...overrides
  };
}

class InMemoryPersonalRecordRepository implements PersonalRecordRepository {
  private records: PersonalRecord[] = [];
  private sequence = 1;

  async findCurrentByUser(userId: string): Promise<readonly PersonalRecord[]> {
    const byExercise = new Map<string, PersonalRecord>();
    const records = this.records
      .filter((record) => record.userId === userId)
      .sort((left, right) => right.weight - left.weight || right.reps - left.reps);

    for (const record of records) {
      if (!byExercise.has(record.exerciseId)) {
        byExercise.set(record.exerciseId, record);
      }
    }

    return [...byExercise.values()];
  }

  async findHistoryByExercise(userId: string, exerciseId: string): Promise<readonly PersonalRecord[]> {
    return this.records.filter((record) => record.userId === userId && record.exerciseId === exerciseId);
  }

  async findBestForExercise(userId: string, exerciseId: string): Promise<PersonalRecord | null> {
    return (
      this.records
        .filter((record) => record.userId === userId && record.exerciseId === exerciseId)
        .sort((left, right) => right.weight - left.weight || right.reps - left.reps)[0] ?? null
    );
  }

  async createRecords(candidates: readonly PersonalRecordCandidate[]): Promise<readonly PersonalRecord[]> {
    const created: PersonalRecord[] = [];

    for (const item of candidates) {
      const existing = this.records.find((record) => record.workoutSetId === item.workoutSetId);
      if (existing) {
        continue;
      }

      const record: PersonalRecord = {
        id: `pr_${this.sequence++}`,
        exerciseName: "Bench Press",
        createdAt: item.achievedAt,
        ...item
      };

      this.records.push(record);
      created.push(record);
    }

    return created;
  }
}
