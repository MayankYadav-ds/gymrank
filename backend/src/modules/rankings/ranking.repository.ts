import type { PrismaClient } from "@prisma/client";

import { bodyweightClasses, findBodyweightClass } from "./bodyweight-classes.js";
import type { RankingEntry, RankingFilters } from "./ranking.types.js";
import type { PersonalRecord } from "../personal-records/personal-record.types.js";
import type { SexCategory } from "../auth-profile/auth-profile.types.js";

export type RankingRepository = {
  upsertSnapshotFromPersonalRecord(record: PersonalRecord): Promise<void>;
  recalculateExerciseRanks(exerciseId: string): Promise<void>;
  findLeaderboard(exerciseId: string, filters: RankingFilters): Promise<readonly RankingEntry[]>;
  countLeaderboard(exerciseId: string, filters: RankingFilters): Promise<number>;
  findUserEntry(userId: string, exerciseId: string, filters: RankingFilters): Promise<RankingEntry | null>;
  findNearby(userId: string, exerciseId: string, filters: RankingFilters, radius: number): Promise<readonly RankingEntry[]>;
  findUserEntries(userId: string): Promise<readonly RankingEntry[]>;
};

export class PrismaRankingRepository implements RankingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsertSnapshotFromPersonalRecord(record: PersonalRecord): Promise<void> {
    await this.prisma.rankingSnapshot.upsert({
      where: {
        userId_exerciseId: {
          userId: record.userId,
          exerciseId: record.exerciseId
        }
      },
      create: {
        userId: record.userId,
        exerciseId: record.exerciseId,
        bestWeight: record.weight,
        bestReps: record.reps,
        currentRank: 0,
        percentile: 0,
        achievedAt: new Date(record.achievedAt)
      },
      update: {
        bestWeight: record.weight,
        bestReps: record.reps,
        achievedAt: new Date(record.achievedAt)
      }
    });
  }

  async recalculateExerciseRanks(exerciseId: string): Promise<void> {
    const snapshots = await this.prisma.rankingSnapshot.findMany({
      where: { exerciseId },
      orderBy: [{ bestWeight: "desc" }, { bestReps: "desc" }, { achievedAt: "asc" }]
    });
    const total = snapshots.length;

    for (const [index, snapshot] of snapshots.entries()) {
      const rank = index + 1;
      const percentile = total <= 1 ? 100 : ((total - rank) / (total - 1)) * 100;

      await this.prisma.rankingSnapshot.update({
        where: { id: snapshot.id },
        data: {
          currentRank: rank,
          percentile
        }
      });
    }
  }

  async findLeaderboard(exerciseId: string, filters: RankingFilters): Promise<readonly RankingEntry[]> {
    const snapshots = await this.prisma.rankingSnapshot.findMany({
      where: { exerciseId, ...toPrismaFilter(filters) },
      include: rankingInclude,
      orderBy: [{ bestWeight: "desc" }, { bestReps: "desc" }, { achievedAt: "asc" }],
      take: filters.limit,
      skip: filters.offset
    });

    return snapshots.map(mapRankingEntry);
  }

  countLeaderboard(exerciseId: string, filters: RankingFilters): Promise<number> {
    return this.prisma.rankingSnapshot.count({
      where: { exerciseId, ...toPrismaFilter(filters) }
    });
  }

  async findUserEntry(userId: string, exerciseId: string, filters: RankingFilters): Promise<RankingEntry | null> {
    const snapshots = await this.prisma.rankingSnapshot.findMany({
      where: { exerciseId, ...toPrismaFilter(filters) },
      include: rankingInclude,
      orderBy: [{ bestWeight: "desc" }, { bestReps: "desc" }, { achievedAt: "asc" }]
    });

    return snapshots.map(mapRankingEntry).find((entry) => entry.userId === userId) ?? null;
  }

  async findNearby(
    userId: string,
    exerciseId: string,
    filters: RankingFilters,
    radius: number
  ): Promise<readonly RankingEntry[]> {
    const snapshots = await this.prisma.rankingSnapshot.findMany({
      where: { exerciseId, ...toPrismaFilter(filters) },
      include: rankingInclude,
      orderBy: [{ bestWeight: "desc" }, { bestReps: "desc" }, { achievedAt: "asc" }]
    });
    const entries = snapshots.map(mapRankingEntry);
    const index = entries.findIndex((entry) => entry.userId === userId);

    if (index === -1) {
      return [];
    }

    return entries.slice(Math.max(0, index - radius), index + radius + 1);
  }

  async findUserEntries(userId: string): Promise<readonly RankingEntry[]> {
    const snapshots = await this.prisma.rankingSnapshot.findMany({
      where: { userId },
      include: rankingInclude,
      orderBy: [{ currentRank: "asc" }]
    });

    return snapshots.map(mapRankingEntry);
  }
}

const rankingInclude = {
  user: true,
  exercise: true
} as const;

type PrismaRankingSnapshot = {
  userId: string;
  exerciseId: string;
  bestWeight: { toNumber(): number };
  bestReps: number;
  currentRank: number;
  percentile: { toNumber(): number };
  achievedAt: Date;
  user: {
    displayName: string;
    country: string | null;
    sexCategory: "MALE" | "FEMALE" | "OPEN" | "PREFER_NOT_TO_SAY" | null;
    bodyweight: { toNumber(): number } | null;
  };
  exercise: {
    name: string;
  };
};

function toPrismaFilter(filters: RankingFilters) {
  const bodyweightClass = filters.bodyweightClass;
  const bodyweightRange = bodyweightClass ? getBodyweightRange(bodyweightClass) : null;

  return {
    user: {
      ...(filters.country ? { country: filters.country } : {}),
      ...(filters.sexCategory ? { sexCategory: toPrismaSexCategory(filters.sexCategory) } : {}),
      ...(bodyweightRange
        ? {
            bodyweight: {
              gte: bodyweightRange.minKg,
              ...(bodyweightRange.maxKg === null ? {} : { lte: bodyweightRange.maxKg })
            }
          }
        : {})
    }
  };
}

function mapRankingEntry(snapshot: PrismaRankingSnapshot): RankingEntry {
  const bodyweight = snapshot.user.bodyweight?.toNumber() ?? null;

  return {
    userId: snapshot.userId,
    displayName: snapshot.user.displayName,
    exerciseId: snapshot.exerciseId,
    exerciseName: snapshot.exercise.name,
    bestWeight: snapshot.bestWeight.toNumber(),
    bestReps: snapshot.bestReps,
    currentRank: snapshot.currentRank,
    percentile: snapshot.percentile.toNumber(),
    achievedAt: snapshot.achievedAt.toISOString(),
    country: snapshot.user.country,
    sexCategory: snapshot.user.sexCategory ? fromPrismaSexCategory(snapshot.user.sexCategory) : null,
    bodyweight,
    bodyweightClass: findBodyweightClass(bodyweight)?.id ?? null
  };
}

function getBodyweightRange(bodyweightClassId: string) {
  return bodyweightClasses.find((item) => item.id === bodyweightClassId) ?? null;
}

function toPrismaSexCategory(value: SexCategory): "MALE" | "FEMALE" | "OPEN" | "PREFER_NOT_TO_SAY" {
  const map = {
    male: "MALE",
    female: "FEMALE",
    open: "OPEN",
    prefer_not_to_say: "PREFER_NOT_TO_SAY"
  } as const;

  return map[value];
}

function fromPrismaSexCategory(value: "MALE" | "FEMALE" | "OPEN" | "PREFER_NOT_TO_SAY"): SexCategory {
  const map = {
    MALE: "male",
    FEMALE: "female",
    OPEN: "open",
    PREFER_NOT_TO_SAY: "prefer_not_to_say"
  } as const;

  return map[value];
}
