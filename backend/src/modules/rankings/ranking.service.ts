import { AppError } from "../../shared/errors/app-error.js";
import { isTrackedLiftId, trackedLiftIds } from "../../shared/constants/tracked-lifts.js";
import type { PersonalRecord } from "../personal-records/personal-record.types.js";
import type { RankingRepository } from "./ranking.repository.js";
import type { LeaderboardResult, MyRankSummary, RankingFilters } from "./ranking.types.js";

export class RankingService {
  constructor(private readonly repository: RankingRepository) {}

  async updateFromPersonalRecords(records: readonly PersonalRecord[]): Promise<void> {
    const updatedExerciseIds = new Set<string>();

    for (const record of records) {
      if (!isTrackedLiftId(record.exerciseId)) {
        continue;
      }

      await this.repository.upsertSnapshotFromPersonalRecord(record);
      updatedExerciseIds.add(record.exerciseId);
    }

    for (const exerciseId of updatedExerciseIds) {
      await this.repository.recalculateExerciseRanks(exerciseId);
    }
  }

  async findOverallLeaderboard(userId: string, filters: RankingFilters): Promise<Record<string, LeaderboardResult>> {
    const result: Record<string, LeaderboardResult> = {};

    for (const exerciseId of trackedLiftIds) {
      result[exerciseId] = await this.findExerciseLeaderboard(userId, exerciseId, filters);
    }

    return result;
  }

  async findExerciseLeaderboard(
    userId: string,
    exerciseId: string,
    filters: RankingFilters
  ): Promise<LeaderboardResult> {
    assertTrackedLift(exerciseId);

    const [entries, total, currentUser, nearby] = await Promise.all([
      this.repository.findLeaderboard(exerciseId, filters),
      this.repository.countLeaderboard(exerciseId, filters),
      this.repository.findUserEntry(userId, exerciseId, filters),
      this.repository.findNearby(userId, exerciseId, filters, 2)
    ]);

    return {
      exerciseId,
      entries,
      currentUser,
      nearby,
      total
    };
  }

  async findMyRanks(userId: string): Promise<MyRankSummary> {
    const exerciseRanks = await this.repository.findUserEntries(userId);
    const bestLift = [...exerciseRanks].sort((left, right) => right.bestWeight - left.bestWeight)[0] ?? null;
    const currentPr = [...exerciseRanks].sort((left, right) => Date.parse(right.achievedAt) - Date.parse(left.achievedAt))[0] ?? null;
    const currentRank = exerciseRanks.length === 0 ? 0 : Math.min(...exerciseRanks.map((rank) => rank.currentRank));
    const percentile =
      exerciseRanks.length === 0
        ? null
        : Math.max(...exerciseRanks.map((rank) => rank.percentile));

    return {
      currentRank,
      bestLift,
      currentPr,
      percentile,
      exerciseRanks
    };
  }

  async findMyExerciseRank(userId: string, exerciseId: string): Promise<LeaderboardResult> {
    return this.findExerciseLeaderboard(userId, exerciseId, {
      limit: 10,
      offset: 0
    });
  }
}

function assertTrackedLift(exerciseId: string): void {
  if (!isTrackedLiftId(exerciseId)) {
    throw new AppError(400, "exercise_not_ranked", "Exercise is not ranked in GymRank V1.");
  }
}
