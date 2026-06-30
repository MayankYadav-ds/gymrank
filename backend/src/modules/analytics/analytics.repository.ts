import type { PrismaClient } from "@prisma/client";

import type { AnalyticsSource } from "./analytics.types.js";

export type AnalyticsRepository = {
  getAnalyticsSource(userId: string): Promise<AnalyticsSource>;
};

export class PrismaAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getAnalyticsSource(userId: string): Promise<AnalyticsSource> {
    const [user, workouts, personalRecords] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { bodyweight: true }
      }),
      this.prisma.workoutSession.findMany({
        where: {
          userId,
          status: "COMPLETED"
        },
        include: {
          exercises: {
            include: {
              exercise: {
                include: {
                  muscles: {
                    include: {
                      muscle: true
                    }
                  }
                }
              },
              sets: {
                orderBy: { orderIndex: "asc" }
              }
            },
            orderBy: { orderIndex: "asc" }
          }
        },
        orderBy: { startedAt: "asc" }
      }),
      this.prisma.personalRecord.findMany({
        where: { userId },
        include: { exercise: true },
        orderBy: { achievedAt: "asc" }
      })
    ]);

    return {
      user: {
        bodyweight: user?.bodyweight?.toNumber() ?? null
      },
      workouts: workouts.map((workout) => ({
        id: workout.id,
        startedAt: workout.startedAt.toISOString(),
        finishedAt: workout.finishedAt?.toISOString() ?? null,
        exercises: workout.exercises.map((workoutExercise) => ({
          id: workoutExercise.id,
          exerciseId: workoutExercise.exerciseId,
          exerciseName: workoutExercise.exercise.name,
          sets: workoutExercise.sets.map((set) => ({
            id: set.id,
            weight: set.weight.toNumber(),
            reps: set.reps,
            completed: set.completed
          })),
          muscles: workoutExercise.exercise.muscles.map((mapping) => ({
            id: mapping.muscle.id,
            name: mapping.muscle.name
          }))
        }))
      })),
      personalRecords: personalRecords.map((record) => ({
        id: record.id,
        exerciseId: record.exerciseId,
        exerciseName: record.exercise.name,
        weight: record.weight.toNumber(),
        reps: record.reps,
        achievedAt: record.achievedAt.toISOString()
      }))
    };
  }
}
