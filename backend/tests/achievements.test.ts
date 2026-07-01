import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app/create-app.js";
import type { AppConfig } from "../src/config/env.js";
import { signAuthToken } from "../src/modules/auth-profile/auth-token.js";
import type { AchievementRepository } from "../src/modules/achievements/achievement.repository.js";
import { AchievementService } from "../src/modules/achievements/achievement.service.js";
import type {
  Achievement,
  AchievementDefinition,
  AchievementEvaluationSource,
  UserAchievement
} from "../src/modules/achievements/achievement.types.js";

const testConfig: AppConfig = {
  nodeEnv: "test",
  appName: "GymRank",
  port: 4000,
  corsOrigin: "http://localhost:3000",
  databaseUrl: "postgresql://gymrank:gymrank_dev_password@localhost:5432/gymrank_dev?schema=public",
  jwtSecret: "test-secret-that-is-at-least-thirty-two-characters",
  jwtExpiresIn: "7d"
};

describe("achievements", () => {
  it("unlocks workout achievements", async () => {
    const repository = repositoryFor({ workoutCount: 10 });
    const unlocked = await new AchievementService(repository).findUnlocked("user_1");

    expect(unlocked.map((item) => item.achievement.code)).toEqual(
      expect.arrayContaining(["first_workout", "workouts_10"])
    );
  });

  it("unlocks PR achievements", async () => {
    const repository = repositoryFor({ prCount: 10 });
    const unlocked = await new AchievementService(repository).findUnlocked("user_1");

    expect(unlocked.map((item) => item.achievement.code)).toEqual(expect.arrayContaining(["first_pr", "prs_10"]));
  });

  it("unlocks strength milestones for approved lifts only", async () => {
    const repository = repositoryFor({
      personalRecords: [
        { exerciseId: "bench_press", weight: 140, reps: 1 },
        { exerciseId: "barbell_row", weight: 200, reps: 1 }
      ]
    });
    const unlocked = await new AchievementService(repository).findUnlocked("user_1");

    expect(unlocked.map((item) => item.achievement.code)).toEqual(
      expect.arrayContaining(["bench_100kg", "bench_140kg"])
    );
    expect(unlocked.map((item) => item.achievement.code)).not.toContain("barbell_row_200kg");
  });

  it("unlocks ranking achievements from current rankings", async () => {
    const repository = repositoryFor({
      rankings: [{ exerciseId: "bench_press", currentRank: 3 }]
    });
    const unlocked = await new AchievementService(repository).findUnlocked("user_1");

    expect(unlocked.map((item) => item.achievement.code)).toEqual(
      expect.arrayContaining(["ranking_top_100", "ranking_top_50", "ranking_top_10", "ranking_top_3"])
    );
    expect(unlocked.map((item) => item.achievement.code)).not.toContain("ranking_number_1");
  });

  it("prevents duplicate unlocks", async () => {
    const repository = repositoryFor({ workoutCount: 1 });
    const service = new AchievementService(repository);

    await service.findUnlocked("user_1");
    await service.findUnlocked("user_1");

    expect(repository.unlockCount("user_1", "first_workout")).toBe(1);
  });

  it("calculates progress without unlocking incomplete achievements", async () => {
    const repository = repositoryFor({ workoutCount: 5 });
    const progress = await new AchievementService(repository).getProgress("user_1");
    const workout10 = progress.find((item) => item.achievement.code === "workouts_10");

    expect(workout10).toMatchObject({
      unlocked: false,
      currentValue: 5,
      targetValue: 10,
      progressPercent: 50
    });
  });

  it("returns empty-user progress with zero values", async () => {
    const repository = repositoryFor({});
    const progress = await new AchievementService(repository).getProgress("user_1");
    const firstWorkout = progress.find((item) => item.achievement.code === "first_workout");

    expect(firstWorkout).toMatchObject({
      unlocked: false,
      currentValue: 0,
      progressPercent: 0
    });
  });

  it("requires authorization", async () => {
    const response = await request(createApp(testConfig, { achievementRepository: repositoryFor({}) }))
      .get("/v1/achievements");

    expect(response.status).toBe(401);
  });

  it("returns achievements through the API", async () => {
    const token = signAuthToken({ userId: "user_1", email: "user@example.com" }, testConfig);
    const response = await request(createApp(testConfig, { achievementRepository: repositoryFor({ workoutCount: 1 }) }))
      .get("/v1/achievements")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.achievements.some((item: { achievement: { code: string }; unlocked: boolean }) =>
      item.achievement.code === "first_workout" && item.unlocked
    )).toBe(true);
  });
});

function repositoryFor(overrides: Partial<AchievementEvaluationSource>): InMemoryAchievementRepository {
  return new InMemoryAchievementRepository({
    workoutCount: 0,
    workoutDates: [],
    prCount: 0,
    totalVolume: 0,
    personalRecords: [],
    rankings: [],
    ...overrides
  });
}

class InMemoryAchievementRepository implements AchievementRepository {
  private achievements = new Map<string, Achievement>();
  private unlocked = new Map<string, UserAchievement>();
  private unlockAttempts = new Map<string, number>();

  constructor(private readonly source: AchievementEvaluationSource) {}

  async ensureDefinitions(definitions: readonly AchievementDefinition[]): Promise<void> {
    for (const definition of definitions) {
      this.achievements.set(definition.id, {
        id: definition.id,
        code: definition.code,
        title: definition.title,
        description: definition.description,
        category: definition.category,
        icon: definition.icon,
        rarity: definition.rarity,
        hidden: definition.hidden,
        createdAt: "2026-01-01T00:00:00.000Z"
      });
    }
  }

  async findAll(): Promise<readonly Achievement[]> {
    return [...this.achievements.values()];
  }

  async findById(id: string): Promise<Achievement | null> {
    return this.achievements.get(id) ?? null;
  }

  async findUnlockedByUser(userId: string): Promise<readonly UserAchievement[]> {
    return [...this.unlocked.values()].filter((item) => item.userId === userId);
  }

  async unlockMany(userId: string, achievementIds: readonly string[]): Promise<readonly UserAchievement[]> {
    for (const achievementId of achievementIds) {
      const key = `${userId}:${achievementId}`;

      if (this.unlocked.has(key)) {
        continue;
      }

      this.unlockAttempts.set(key, (this.unlockAttempts.get(key) ?? 0) + 1);
      this.unlocked.set(key, {
        id: key,
        userId,
        achievementId,
        unlockedAt: "2026-01-01T00:00:00.000Z",
        achievement: this.achievements.get(achievementId)!
      });
    }

    return this.findUnlockedByUser(userId);
  }

  async getEvaluationSource(_userId: string): Promise<AchievementEvaluationSource> {
    return this.source;
  }

  unlockCount(userId: string, achievementId: string): number {
    return this.unlockAttempts.get(`${userId}:${achievementId}`) ?? 0;
  }
}
