import type { PrismaClient } from "@prisma/client";

import type { CompletedExercisePerformance } from "./overload.types.js";

export type OverloadRepository = {
  findRecentCompletedExercisePerformances(
    userId: string,
    exerciseId: string,
    limit: number
  ): Promise<readonly CompletedExercisePerformance[]>;
  findLatestCompletedExerciseIds(userId: string): Promise<readonly string[]>;
  exerciseExists(exerciseId: string): Promise<boolean>;
};

export class PrismaOverloadRepository implements OverloadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findRecentCompletedExercisePerformances(
    userId: string,
    exerciseId: string,
    limit: number
  ): Promise<readonly CompletedExercisePerformance[]> {
    const workoutExercises = await this.prisma.workoutExercise.findMany({
      where: {
        exerciseId,
        workoutSession: {
          userId,
          status: "COMPLETED"
        }
      },
      include: overloadInclude,
      orderBy: {
        workoutSession: {
          finishedAt: "desc"
        }
      },
      take: limit
    });

    return workoutExercises.map(mapWorkoutExercise);
  }

  async findLatestCompletedExerciseIds(userId: string): Promise<readonly string[]> {
    const workoutExercises = await this.prisma.workoutExercise.findMany({
      where: {
        workoutSession: {
          userId,
          status: "COMPLETED"
        }
      },
      include: {
        workoutSession: true
      },
      orderBy: {
        workoutSession: {
          finishedAt: "desc"
        }
      }
    });

    return [...new Set(workoutExercises.map((workoutExercise) => workoutExercise.exerciseId))];
  }

  async exerciseExists(exerciseId: string): Promise<boolean> {
    const count = await this.prisma.exercise.count({ where: { id: exerciseId } });
    return count > 0;
  }
}

const overloadInclude = {
  exercise: true,
  workoutSession: true,
  sets: {
    where: {
      completed: true
    },
    orderBy: {
      orderIndex: "asc" as const
    }
  }
} as const;

type PrismaWorkoutExerciseForOverload = {
  workoutSessionId: string;
  exerciseId: string;
  exercise: {
    name: string;
    category: string;
  };
  workoutSession: {
    finishedAt: Date | null;
    updatedAt: Date;
  };
  sets: Array<{
    weight: { toNumber(): number };
    reps: number;
    completed: boolean;
  }>;
};

function mapWorkoutExercise(workoutExercise: PrismaWorkoutExerciseForOverload): CompletedExercisePerformance {
  return {
    workoutSessionId: workoutExercise.workoutSessionId,
    exerciseId: workoutExercise.exerciseId,
    exerciseName: workoutExercise.exercise.name,
    category: workoutExercise.exercise.category,
    completedAt: (workoutExercise.workoutSession.finishedAt ?? workoutExercise.workoutSession.updatedAt).toISOString(),
    sets: workoutExercise.sets.map((set) => ({
      weight: set.weight.toNumber(),
      reps: set.reps,
      completed: set.completed
    }))
  };
}
