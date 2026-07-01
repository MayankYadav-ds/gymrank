import type { PrismaClient } from "@prisma/client";

import type {
  Achievement,
  AchievementDefinition,
  AchievementEvaluationSource,
  UserAchievement
} from "./achievement.types.js";

export type AchievementRepository = {
  ensureDefinitions(definitions: readonly AchievementDefinition[]): Promise<void>;
  findAll(): Promise<readonly Achievement[]>;
  findById(id: string): Promise<Achievement | null>;
  findUnlockedByUser(userId: string): Promise<readonly UserAchievement[]>;
  unlockMany(userId: string, achievementIds: readonly string[]): Promise<readonly UserAchievement[]>;
  getEvaluationSource(userId: string): Promise<AchievementEvaluationSource>;
};

export class PrismaAchievementRepository implements AchievementRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async ensureDefinitions(definitions: readonly AchievementDefinition[]): Promise<void> {
    await this.prisma.$transaction(
      definitions.map((definition) =>
        this.prisma.achievement.upsert({
          where: { code: definition.code },
          create: toDefinitionWrite(definition),
          update: toDefinitionWrite(definition)
        })
      )
    );
  }

  async findAll(): Promise<readonly Achievement[]> {
    const achievements = await this.prisma.achievement.findMany({
      orderBy: [{ category: "asc" }, { createdAt: "asc" }]
    });

    return achievements.map(mapAchievement);
  }

  async findById(id: string): Promise<Achievement | null> {
    const achievement = await this.prisma.achievement.findUnique({ where: { id } });
    return achievement ? mapAchievement(achievement) : null;
  }

  async findUnlockedByUser(userId: string): Promise<readonly UserAchievement[]> {
    const unlocked = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" }
    });

    return unlocked.map(mapUserAchievement);
  }

  async unlockMany(userId: string, achievementIds: readonly string[]): Promise<readonly UserAchievement[]> {
    const uniqueIds = [...new Set(achievementIds)];

    if (uniqueIds.length === 0) {
      return this.findUnlockedByUser(userId);
    }

    await this.prisma.$transaction(
      uniqueIds.map((achievementId) =>
        this.prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId,
              achievementId
            }
          },
          create: {
            userId,
            achievementId
          },
          update: {}
        })
      )
    );

    return this.findUnlockedByUser(userId);
  }

  async getEvaluationSource(userId: string): Promise<AchievementEvaluationSource> {
    const [workouts, personalRecords, rankingSnapshots] = await Promise.all([
      this.prisma.workoutSession.findMany({
        where: {
          userId,
          status: "COMPLETED"
        },
        include: {
          exercises: {
            include: {
              sets: true
            }
          }
        },
        orderBy: { startedAt: "asc" }
      }),
      this.prisma.personalRecord.findMany({
        where: { userId },
        orderBy: { achievedAt: "asc" }
      }),
      this.prisma.rankingSnapshot.findMany({
        where: { userId },
        select: {
          exerciseId: true,
          currentRank: true
        }
      })
    ]);

    return {
      workoutCount: workouts.length,
      workoutDates: workouts.map((workout) => workout.startedAt.toISOString().slice(0, 10)),
      prCount: personalRecords.length,
      totalVolume: workouts.reduce(
        (sum, workout) =>
          sum +
          workout.exercises.reduce(
            (exerciseSum, exercise) =>
              exerciseSum +
              exercise.sets
                .filter((set) => set.completed)
                .reduce((setSum, set) => setSum + set.weight.toNumber() * set.reps, 0),
            0
          ),
        0
      ),
      personalRecords: personalRecords.map((record) => ({
        exerciseId: record.exerciseId,
        weight: record.weight.toNumber(),
        reps: record.reps
      })),
      rankings: rankingSnapshots
    };
  }
}

type PrismaAchievement = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  rarity: string;
  hidden: boolean;
  createdAt: Date;
};

type PrismaUserAchievement = {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  achievement: PrismaAchievement;
};

function toDefinitionWrite(definition: AchievementDefinition) {
  return {
    id: definition.id,
    code: definition.code,
    title: definition.title,
    description: definition.description,
    category: definition.category,
    icon: definition.icon,
    rarity: definition.rarity,
    hidden: definition.hidden
  };
}

function mapAchievement(achievement: PrismaAchievement): Achievement {
  return {
    id: achievement.id,
    code: achievement.code,
    title: achievement.title,
    description: achievement.description,
    category: achievement.category as Achievement["category"],
    icon: achievement.icon,
    rarity: achievement.rarity as Achievement["rarity"],
    hidden: achievement.hidden,
    createdAt: achievement.createdAt.toISOString()
  };
}

function mapUserAchievement(userAchievement: PrismaUserAchievement): UserAchievement {
  return {
    id: userAchievement.id,
    userId: userAchievement.userId,
    achievementId: userAchievement.achievementId,
    unlockedAt: userAchievement.unlockedAt.toISOString(),
    achievement: mapAchievement(userAchievement.achievement)
  };
}
