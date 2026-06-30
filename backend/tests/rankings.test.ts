import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app/create-app.js";
import type { AppConfig } from "../src/config/env.js";
import { signAuthToken } from "../src/modules/auth-profile/auth-token.js";
import { PersonalRecordService } from "../src/modules/personal-records/personal-record.service.js";
import type { PersonalRecordRepository } from "../src/modules/personal-records/personal-record.repository.js";
import type { PersonalRecord, PersonalRecordCandidate } from "../src/modules/personal-records/personal-record.types.js";
import type { RankingRepository } from "../src/modules/rankings/ranking.repository.js";
import { RankingService } from "../src/modules/rankings/ranking.service.js";
import type { RankingEntry, RankingFilters } from "../src/modules/rankings/ranking.types.js";
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

describe("rankings", () => {
  it("ranks a single user", async () => {
    const repository = seededRankingRepository([entry({ userId: "user_1", bestWeight: 100 })]);
    const result = await new RankingService(repository).findExerciseLeaderboard("user_1", "bench_press", defaultFilters());

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toMatchObject({ userId: "user_1", currentRank: 1, percentile: 100 });
  });

  it("ranks multiple users by highest weight", async () => {
    const repository = seededRankingRepository([
      entry({ userId: "user_1", bestWeight: 100 }),
      entry({ userId: "user_2", bestWeight: 140 }),
      entry({ userId: "user_3", bestWeight: 120 })
    ]);

    const result = await new RankingService(repository).findExerciseLeaderboard("user_1", "bench_press", defaultFilters());

    expect(result.entries.map((item) => item.userId)).toEqual(["user_2", "user_3", "user_1"]);
  });

  it("uses reps and earlier achievement date as tie breakers", async () => {
    const repository = seededRankingRepository([
      entry({ userId: "user_1", bestWeight: 100, bestReps: 5, achievedAt: "2026-01-02T00:00:00.000Z" }),
      entry({ userId: "user_2", bestWeight: 100, bestReps: 6, achievedAt: "2026-01-03T00:00:00.000Z" }),
      entry({ userId: "user_3", bestWeight: 100, bestReps: 5, achievedAt: "2026-01-01T00:00:00.000Z" })
    ]);

    const result = await new RankingService(repository).findExerciseLeaderboard("user_1", "bench_press", defaultFilters());

    expect(result.entries.map((item) => item.userId)).toEqual(["user_2", "user_3", "user_1"]);
  });

  it("filters by country", async () => {
    const repository = seededRankingRepository([
      entry({ userId: "user_1", country: "US" }),
      entry({ userId: "user_2", country: "IN" })
    ]);

    const result = await new RankingService(repository).findExerciseLeaderboard("user_1", "bench_press", {
      ...defaultFilters(),
      country: "IN"
    });

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]!.country).toBe("IN");
  });

  it("filters by sex category", async () => {
    const repository = seededRankingRepository([
      entry({ userId: "user_1", sexCategory: "male" }),
      entry({ userId: "user_2", sexCategory: "female" })
    ]);

    const result = await new RankingService(repository).findExerciseLeaderboard("user_1", "bench_press", {
      ...defaultFilters(),
      sexCategory: "female"
    });

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]!.sexCategory).toBe("female");
  });

  it("filters by bodyweight class", async () => {
    const repository = seededRankingRepository([
      entry({ userId: "user_1", bodyweight: 72, bodyweightClass: "60_74" }),
      entry({ userId: "user_2", bodyweight: 95, bodyweightClass: "90_104" })
    ]);

    const result = await new RankingService(repository).findExerciseLeaderboard("user_1", "bench_press", {
      ...defaultFilters(),
      bodyweightClass: "90_104"
    });

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]!.bodyweightClass).toBe("90_104");
  });

  it("returns nearby rankings", async () => {
    const repository = seededRankingRepository([
      entry({ userId: "user_1", bestWeight: 100 }),
      entry({ userId: "user_2", bestWeight: 105 }),
      entry({ userId: "user_3", bestWeight: 110 }),
      entry({ userId: "user_4", bestWeight: 115 }),
      entry({ userId: "user_5", bestWeight: 120 })
    ]);

    const result = await new RankingService(repository).findExerciseLeaderboard("user_3", "bench_press", defaultFilters());

    expect(result.nearby.map((item) => item.userId)).toContain("user_3");
    expect(result.nearby.length).toBeLessThanOrEqual(5);
  });

  it("supports pagination", async () => {
    const repository = seededRankingRepository([
      entry({ userId: "user_1", bestWeight: 100 }),
      entry({ userId: "user_2", bestWeight: 110 }),
      entry({ userId: "user_3", bestWeight: 120 })
    ]);

    const result = await new RankingService(repository).findExerciseLeaderboard("user_1", "bench_press", {
      ...defaultFilters(),
      limit: 1,
      offset: 1
    });

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]!.userId).toBe("user_2");
  });

  it("rejects non-ranked exercises", async () => {
    const repository = seededRankingRepository([entry({ userId: "user_1" })]);

    await expect(
      new RankingService(repository).findExerciseLeaderboard("user_1", "barbell_row", defaultFilters())
    ).rejects.toMatchObject({ code: "exercise_not_ranked" });
  });

  it("requires authorization", async () => {
    const response = await request(createApp(testConfig, { rankingRepository: seededRankingRepository([]) }))
      .get("/v1/rankings/bench_press");

    expect(response.status).toBe(401);
  });

  it("returns leaderboard through the API", async () => {
    const token = signAuthToken({ userId: "user_1", email: "user@example.com" }, testConfig);
    const response = await request(createApp(testConfig, { rankingRepository: seededRankingRepository([
      entry({ userId: "user_1", bestWeight: 100 })
    ]) }))
      .get("/v1/rankings/bench_press")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.leaderboard.entries[0]).toMatchObject({ userId: "user_1", currentRank: 1 });
  });

  it("updates rankings after a new PR", async () => {
    const rankingRepository = seededRankingRepository([]);
    const rankingService = new RankingService(rankingRepository);
    const personalRecordRepository = new InMemoryPersonalRecordRepository();
    const personalRecordService = new PersonalRecordService(personalRecordRepository, rankingService);

    await personalRecordService.detectForCompletedWorkout(completedWorkout("user_1", "set_1", 100, 5));
    await personalRecordService.detectForCompletedWorkout(completedWorkout("user_2", "set_2", 120, 3));

    const result = await rankingService.findExerciseLeaderboard("user_1", "bench_press", defaultFilters());

    expect(result.entries.map((item) => item.userId)).toEqual(["user_2", "user_1"]);
  });
});

function defaultFilters(): RankingFilters {
  return { limit: 50, offset: 0 };
}

function entry(overrides: Partial<RankingEntry>): RankingEntry {
  return {
    userId: "user_1",
    displayName: overrides.userId ?? "User",
    exerciseId: "bench_press",
    exerciseName: "Bench Press",
    bestWeight: 100,
    bestReps: 5,
    currentRank: 1,
    percentile: 100,
    achievedAt: "2026-01-01T00:00:00.000Z",
    country: "US",
    sexCategory: "male",
    bodyweight: 80,
    bodyweightClass: "75_89",
    ...overrides
  };
}

function seededRankingRepository(entries: readonly RankingEntry[]): InMemoryRankingRepository {
  const repository = new InMemoryRankingRepository();
  repository.replaceEntries(entries);
  return repository;
}

class InMemoryRankingRepository implements RankingRepository {
  private entries: RankingEntry[] = [];

  replaceEntries(entries: readonly RankingEntry[]): void {
    this.entries = [...entries];
    this.recalculate("bench_press");
  }

  async upsertSnapshotFromPersonalRecord(record: PersonalRecord): Promise<void> {
    const existingIndex = this.entries.findIndex(
      (entry) => entry.userId === record.userId && entry.exerciseId === record.exerciseId
    );
    const next = entry({
      userId: record.userId,
      displayName: record.userId,
      exerciseId: record.exerciseId,
      exerciseName: record.exerciseName,
      bestWeight: record.weight,
      bestReps: record.reps,
      achievedAt: record.achievedAt
    });

    if (existingIndex === -1) {
      this.entries.push(next);
    } else {
      this.entries[existingIndex] = next;
    }
  }

  async recalculateExerciseRanks(exerciseId: string): Promise<void> {
    this.recalculate(exerciseId);
  }

  async findLeaderboard(exerciseId: string, filters: RankingFilters): Promise<readonly RankingEntry[]> {
    return this.filtered(exerciseId, filters).slice(filters.offset, filters.offset + filters.limit);
  }

  async countLeaderboard(exerciseId: string, filters: RankingFilters): Promise<number> {
    return this.filtered(exerciseId, filters).length;
  }

  async findUserEntry(userId: string, exerciseId: string, filters: RankingFilters): Promise<RankingEntry | null> {
    return this.filtered(exerciseId, filters).find((item) => item.userId === userId) ?? null;
  }

  async findNearby(userId: string, exerciseId: string, filters: RankingFilters, radius: number): Promise<readonly RankingEntry[]> {
    const entries = this.filtered(exerciseId, filters);
    const index = entries.findIndex((item) => item.userId === userId);
    return index === -1 ? [] : entries.slice(Math.max(0, index - radius), index + radius + 1);
  }

  async findUserEntries(userId: string): Promise<readonly RankingEntry[]> {
    return this.entries.filter((item) => item.userId === userId);
  }

  private filtered(exerciseId: string, filters: RankingFilters): RankingEntry[] {
    return this.entries
      .filter((item) => item.exerciseId === exerciseId)
      .filter((item) => !filters.country || item.country === filters.country)
      .filter((item) => !filters.sexCategory || item.sexCategory === filters.sexCategory)
      .filter((item) => !filters.bodyweightClass || item.bodyweightClass === filters.bodyweightClass)
      .sort(compareEntries);
  }

  private recalculate(exerciseId: string): void {
    const sorted = this.entries.filter((item) => item.exerciseId === exerciseId).sort(compareEntries);

    for (const [index, item] of sorted.entries()) {
      const total = sorted.length;
      item.currentRank = index + 1;
      item.percentile = total <= 1 ? 100 : ((total - item.currentRank) / (total - 1)) * 100;
    }
  }
}

function compareEntries(left: RankingEntry, right: RankingEntry): number {
  return (
    right.bestWeight - left.bestWeight ||
    right.bestReps - left.bestReps ||
    Date.parse(left.achievedAt) - Date.parse(right.achievedAt)
  );
}

class InMemoryPersonalRecordRepository implements PersonalRecordRepository {
  private records: PersonalRecord[] = [];

  async findCurrentByUser(_userId: string): Promise<readonly PersonalRecord[]> {
    return [];
  }

  async findHistoryByExercise(_userId: string, _exerciseId: string): Promise<readonly PersonalRecord[]> {
    return [];
  }

  async findBestForExercise(userId: string, exerciseId: string): Promise<PersonalRecord | null> {
    return (
      this.records
        .filter((record) => record.userId === userId && record.exerciseId === exerciseId)
        .sort((left, right) => right.weight - left.weight || right.reps - left.reps)[0] ?? null
    );
  }

  async createRecords(candidates: readonly PersonalRecordCandidate[]): Promise<readonly PersonalRecord[]> {
    const records = candidates.map((candidate): PersonalRecord => ({
      id: candidate.workoutSetId,
      exerciseName: "Bench Press",
      createdAt: candidate.achievedAt,
      ...candidate
    }));
    this.records.push(...records);
    return records;
  }
}

function completedWorkout(userId: string, setId: string, weight: number, reps: number): WorkoutSession {
  const now = "2026-01-01T00:00:00.000Z";
  return {
    id: `workout_${setId}`,
    userId,
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
        id: `workout_exercise_${setId}`,
        workoutSessionId: `workout_${setId}`,
        exerciseId: "bench_press",
        exerciseName: "Bench Press",
        orderIndex: 0,
        notes: null,
        createdAt: now,
        updatedAt: now,
        sets: [
          {
            id: setId,
            workoutExerciseId: `workout_exercise_${setId}`,
            orderIndex: 0,
            weight,
            reps,
            type: "normal",
            completed: true,
            createdAt: now,
            updatedAt: now
          }
        ]
      }
    ]
  };
}
