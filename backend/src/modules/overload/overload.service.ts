import { AppError } from "../../shared/errors/app-error.js";
import type { OverloadRepository } from "./overload.repository.js";
import type {
  CompletedExercisePerformance,
  OverloadPreviousWorkout,
  OverloadRecommendation
} from "./overload.types.js";

const upperBodyIncrementKg = 2.5;
const lowerBodyIncrementKg = 5;
const greatlyExceededTargetReps = 3;

export class OverloadService {
  constructor(private readonly repository: OverloadRepository) {}

  async findRecommendations(userId: string): Promise<Record<string, OverloadRecommendation>> {
    const exerciseIds = await this.repository.findLatestCompletedExerciseIds(userId);
    const recommendations: Record<string, OverloadRecommendation> = {};

    for (const exerciseId of exerciseIds) {
      recommendations[exerciseId] = await this.findRecommendation(userId, exerciseId);
    }

    return recommendations;
  }

  async findRecommendation(userId: string, exerciseId: string): Promise<OverloadRecommendation> {
    if (!(await this.repository.exerciseExists(exerciseId))) {
      throw new AppError(404, "exercise_not_found", "Exercise was not found.");
    }

    const performances = await this.repository.findRecentCompletedExercisePerformances(userId, exerciseId, 2);
    const latest = performances[0];

    if (!latest || latest.sets.length === 0) {
      return noRecommendation();
    }

    const latestBest = getBestSet(latest);
    const previous = toPreviousWorkout(latest);
    const older = performances[1];

    if (!older || older.sets.length === 0) {
      return {
        previousWorkout: previous,
        recommendation: "increase_reps",
        suggestedWeight: latestBest.weight,
        suggestedReps: latestBest.reps + 1,
        explanation: "No earlier completed workout exists for this exercise, so repeat the weight and add one rep."
      };
    }

    const targetReps = getBestSet(older).reps;
    const allWorkingSetsReachedTarget = latest.sets.every((set) => set.reps >= targetReps);
    const anySetMissedTarget = latest.sets.some((set) => set.reps < targetReps);
    const bestExceededTarget = latestBest.reps >= targetReps + greatlyExceededTargetReps;

    if (anySetMissedTarget) {
      return {
        previousWorkout: previous,
        recommendation: "repeat_weight",
        suggestedWeight: latestBest.weight,
        suggestedReps: targetReps,
        explanation: "A target rep count was missed, so repeat the current weight next time."
      };
    }

    if (allWorkingSetsReachedTarget || bestExceededTarget) {
      const increment = getConservativeIncrement(latest);

      if (!isWeightJumpAppropriate(latestBest.weight, increment)) {
        return {
          previousWorkout: previous,
          recommendation: "increase_reps",
          suggestedWeight: latestBest.weight,
          suggestedReps: latestBest.reps + 1,
          explanation: "A weight jump is not appropriate yet, so keep the weight and add one rep."
        };
      }

      return {
        previousWorkout: previous,
        recommendation: "increase_weight",
        suggestedWeight: latestBest.weight + increment,
        suggestedReps: targetReps,
        explanation: `All working sets reached the target. Increase weight conservatively by ${increment} kg.`
      };
    }

    return {
      previousWorkout: previous,
      recommendation: "repeat_weight",
      suggestedWeight: latestBest.weight,
      suggestedReps: targetReps,
      explanation: "Repeat the current weight to build consistency before progressing."
    };
  }
}

function noRecommendation(): OverloadRecommendation {
  return {
    previousWorkout: null,
    recommendation: "none",
    suggestedWeight: null,
    suggestedReps: null,
    explanation: "No recommendation available yet."
  };
}

function toPreviousWorkout(performance: CompletedExercisePerformance): OverloadPreviousWorkout {
  const best = getBestSet(performance);

  return {
    workoutSessionId: performance.workoutSessionId,
    exerciseId: performance.exerciseId,
    exerciseName: performance.exerciseName,
    completedAt: performance.completedAt,
    bestWeight: best.weight,
    bestReps: best.reps,
    setCount: performance.sets.length
  };
}

function getBestSet(performance: CompletedExercisePerformance): { weight: number; reps: number } {
  return performance.sets.reduce((best, current) => {
    if (current.weight > best.weight) {
      return current;
    }

    if (current.weight === best.weight && current.reps > best.reps) {
      return current;
    }

    return best;
  });
}

function getConservativeIncrement(performance: CompletedExercisePerformance): number {
  return isLowerBodyExercise(performance) ? lowerBodyIncrementKg : upperBodyIncrementKg;
}

function isLowerBodyExercise(performance: CompletedExercisePerformance): boolean {
  return ["squat", "deadlift", "romanian_deadlift", "leg_press"].includes(performance.exerciseId);
}

function isWeightJumpAppropriate(weight: number, increment: number): boolean {
  if (weight <= 0) {
    return false;
  }

  return increment / weight <= 0.1;
}
