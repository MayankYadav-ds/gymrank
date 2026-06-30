import type { WorkoutSession, WorkoutSet } from "../workouts/workout.types.js";
import type { RankingService } from "../rankings/ranking.service.js";
import type { PersonalRecordRepository } from "./personal-record.repository.js";
import type { PersonalRecord, PersonalRecordCandidate } from "./personal-record.types.js";

export class PersonalRecordService {
  constructor(
    private readonly repository: PersonalRecordRepository,
    private readonly rankingService?: RankingService
  ) {}

  findCurrentByUser(userId: string): Promise<readonly PersonalRecord[]> {
    return this.repository.findCurrentByUser(userId);
  }

  findHistoryByExercise(userId: string, exerciseId: string): Promise<readonly PersonalRecord[]> {
    return this.repository.findHistoryByExercise(userId, exerciseId);
  }

  async detectForCompletedWorkout(workout: WorkoutSession): Promise<readonly PersonalRecord[]> {
    if (workout.status !== "completed") {
      return [];
    }

    const candidates: PersonalRecordCandidate[] = [];

    for (const workoutExercise of workout.exercises) {
      const strongestSet = findStrongestCompletedSet(workoutExercise.sets);

      if (!strongestSet) {
        continue;
      }

      const previousBest = await this.repository.findBestForExercise(workout.userId, workoutExercise.exerciseId);

      if (previousBest && !isStrongerSet(strongestSet, previousBest)) {
        continue;
      }

      candidates.push({
        userId: workout.userId,
        exerciseId: workoutExercise.exerciseId,
        workoutSessionId: workout.id,
        workoutSetId: strongestSet.id,
        weight: strongestSet.weight,
        reps: strongestSet.reps,
        achievedAt: workout.finishedAt ?? workout.updatedAt
      });
    }

    const records = await this.repository.createRecords(candidates);
    await this.rankingService?.updateFromPersonalRecords(records);
    return records;
  }
}

function findStrongestCompletedSet(sets: readonly WorkoutSet[]): WorkoutSet | null {
  const completedSets = sets.filter((set) => set.completed);

  if (completedSets.length === 0) {
    return null;
  }

  return completedSets.reduce((best, current) => (isStrongerSet(current, best) ? current : best));
}

function isStrongerSet(
  candidate: Pick<WorkoutSet, "weight" | "reps">,
  currentBest: Pick<WorkoutSet, "weight" | "reps">
): boolean {
  if (candidate.weight > currentBest.weight) {
    return true;
  }

  return candidate.weight === currentBest.weight && candidate.reps > currentBest.reps;
}
