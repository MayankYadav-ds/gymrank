import type { PrismaClient, WorkoutSetType as PrismaWorkoutSetType, WorkoutStatus as PrismaWorkoutStatus } from "@prisma/client";

import type {
  AddWorkoutExerciseInput,
  AddWorkoutSetInput,
  CreateWorkoutInput,
  UpdateWorkoutExerciseInput,
  UpdateWorkoutInput,
  UpdateWorkoutSetInput
} from "./workout.schemas.js";
import type { WorkoutHistoryItem, WorkoutSession, WorkoutSetType, WorkoutStatus } from "./workout.types.js";

export type WorkoutRepository = {
  createWorkout(userId: string, input: CreateWorkoutInput): Promise<WorkoutSession>;
  finishWorkout(userId: string, workoutId: string): Promise<WorkoutSession>;
  cancelWorkout(userId: string, workoutId: string): Promise<WorkoutSession>;
  updateWorkout(userId: string, workoutId: string, input: UpdateWorkoutInput): Promise<WorkoutSession>;
  deleteWorkout(userId: string, workoutId: string): Promise<void>;
  findWorkout(userId: string, workoutId: string): Promise<WorkoutSession | null>;
  findHistory(userId: string): Promise<readonly WorkoutHistoryItem[]>;
  exerciseExists(exerciseId: string): Promise<boolean>;
  addExercise(userId: string, workoutId: string, input: AddWorkoutExerciseInput): Promise<WorkoutSession>;
  updateExercise(
    userId: string,
    workoutId: string,
    workoutExerciseId: string,
    input: UpdateWorkoutExerciseInput
  ): Promise<WorkoutSession>;
  removeExercise(userId: string, workoutId: string, workoutExerciseId: string): Promise<WorkoutSession>;
  addSet(userId: string, workoutId: string, input: AddWorkoutSetInput): Promise<WorkoutSession>;
  updateSet(
    userId: string,
    workoutId: string,
    setId: string,
    input: UpdateWorkoutSetInput
  ): Promise<WorkoutSession>;
  deleteSet(userId: string, workoutId: string, setId: string): Promise<WorkoutSession>;
};

export class PrismaWorkoutRepository implements WorkoutRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createWorkout(userId: string, input: CreateWorkoutInput): Promise<WorkoutSession> {
    const workout = await this.prisma.workoutSession.create({
      data: {
        userId,
        title: input.title,
        notes: input.notes
      },
      include: workoutInclude
    });

    return mapWorkout(workout);
  }

  async finishWorkout(userId: string, workoutId: string): Promise<WorkoutSession> {
    const workout = await this.prisma.workoutSession.update({
      where: { id: workoutId, userId },
      data: {
        status: "COMPLETED",
        finishedAt: new Date(),
        canceledAt: null
      },
      include: workoutInclude
    });

    return mapWorkout(workout);
  }

  async cancelWorkout(userId: string, workoutId: string): Promise<WorkoutSession> {
    const workout = await this.prisma.workoutSession.update({
      where: { id: workoutId, userId },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
        finishedAt: null
      },
      include: workoutInclude
    });

    return mapWorkout(workout);
  }

  async updateWorkout(userId: string, workoutId: string, input: UpdateWorkoutInput): Promise<WorkoutSession> {
    const workout = await this.prisma.workoutSession.update({
      where: { id: workoutId, userId },
      data: {
        title: input.title,
        notes: input.notes
      },
      include: workoutInclude
    });

    return mapWorkout(workout);
  }

  async deleteWorkout(userId: string, workoutId: string): Promise<void> {
    await this.prisma.workoutSession.delete({
      where: { id: workoutId, userId }
    });
  }

  async findWorkout(userId: string, workoutId: string): Promise<WorkoutSession | null> {
    const workout = await this.prisma.workoutSession.findFirst({
      where: { id: workoutId, userId },
      include: workoutInclude
    });

    return workout ? mapWorkout(workout) : null;
  }

  async findHistory(userId: string): Promise<readonly WorkoutHistoryItem[]> {
    const workouts = await this.prisma.workoutSession.findMany({
      where: { userId },
      include: workoutInclude,
      orderBy: { startedAt: "desc" }
    });

    return workouts.map((workout) => {
      const mapped = mapWorkout(workout);
      return {
        ...withoutExercises(mapped),
        exerciseCount: mapped.exercises.length,
        setCount: mapped.exercises.reduce((count, exercise) => count + exercise.sets.length, 0)
      };
    });
  }

  async exerciseExists(exerciseId: string): Promise<boolean> {
    const count = await this.prisma.exercise.count({ where: { id: exerciseId } });
    return count > 0;
  }

  async addExercise(userId: string, workoutId: string, input: AddWorkoutExerciseInput): Promise<WorkoutSession> {
    const orderIndex =
      input.orderIndex ??
      (await this.prisma.workoutExercise.count({ where: { workoutSessionId: workoutId } }));

    await this.prisma.workoutExercise.create({
      data: {
        workoutSessionId: workoutId,
        exerciseId: input.exerciseId,
        orderIndex,
        notes: input.notes
      }
    });

    return this.findOwnedWorkoutOrThrow(userId, workoutId);
  }

  async updateExercise(
    userId: string,
    workoutId: string,
    workoutExerciseId: string,
    input: UpdateWorkoutExerciseInput
  ): Promise<WorkoutSession> {
    await this.prisma.workoutExercise.update({
      where: { id: workoutExerciseId },
      data: {
        notes: input.notes,
        orderIndex: input.orderIndex
      }
    });

    return this.findOwnedWorkoutOrThrow(userId, workoutId);
  }

  async removeExercise(userId: string, workoutId: string, workoutExerciseId: string): Promise<WorkoutSession> {
    await this.prisma.workoutExercise.delete({
      where: { id: workoutExerciseId }
    });

    return this.findOwnedWorkoutOrThrow(userId, workoutId);
  }

  async addSet(userId: string, workoutId: string, input: AddWorkoutSetInput): Promise<WorkoutSession> {
    const orderIndex =
      input.orderIndex ??
      (await this.prisma.workoutSet.count({ where: { workoutExerciseId: input.workoutExerciseId } }));

    await this.prisma.workoutSet.create({
      data: {
        workoutExerciseId: input.workoutExerciseId,
        orderIndex,
        weight: input.weight,
        reps: input.reps,
        type: toPrismaSetType(input.type),
        completed: input.completed
      }
    });

    return this.findOwnedWorkoutOrThrow(userId, workoutId);
  }

  async updateSet(
    userId: string,
    workoutId: string,
    setId: string,
    input: UpdateWorkoutSetInput
  ): Promise<WorkoutSession> {
    await this.prisma.workoutSet.update({
      where: { id: setId },
      data: {
        weight: input.weight,
        reps: input.reps,
        type: input.type ? toPrismaSetType(input.type) : undefined,
        completed: input.completed,
        orderIndex: input.orderIndex
      }
    });

    return this.findOwnedWorkoutOrThrow(userId, workoutId);
  }

  async deleteSet(userId: string, workoutId: string, setId: string): Promise<WorkoutSession> {
    await this.prisma.workoutSet.delete({
      where: {
        id: setId
      }
    });

    return this.findOwnedWorkoutOrThrow(userId, workoutId);
  }

  private async findOwnedWorkoutOrThrow(userId: string, workoutId: string): Promise<WorkoutSession> {
    const workout = await this.findWorkout(userId, workoutId);

    if (!workout) {
      throw new Error("Workout was not found after mutation.");
    }

    return workout;
  }
}

const workoutInclude = {
  exercises: {
    include: {
      exercise: true,
      sets: {
        orderBy: { orderIndex: "asc" as const }
      }
    },
    orderBy: { orderIndex: "asc" as const }
  }
} as const;

type PrismaWorkout = NonNullable<Awaited<ReturnType<PrismaClient["workoutSession"]["findFirst"]>>> & {
  exercises: Array<{
    id: string;
    workoutSessionId: string;
    exerciseId: string;
    orderIndex: number;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    exercise: { name: string };
    sets: Array<{
      id: string;
      workoutExerciseId: string;
      orderIndex: number;
      weight: { toNumber(): number };
      reps: number;
      type: PrismaWorkoutSetType;
      completed: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }>;
};

function mapWorkout(workout: PrismaWorkout): WorkoutSession {
  return {
    id: workout.id,
    userId: workout.userId,
    title: workout.title,
    notes: workout.notes,
    status: fromPrismaWorkoutStatus(workout.status),
    startedAt: workout.startedAt.toISOString(),
    finishedAt: workout.finishedAt?.toISOString() ?? null,
    canceledAt: workout.canceledAt?.toISOString() ?? null,
    createdAt: workout.createdAt.toISOString(),
    updatedAt: workout.updatedAt.toISOString(),
    exercises: workout.exercises.map((workoutExercise) => ({
      id: workoutExercise.id,
      workoutSessionId: workoutExercise.workoutSessionId,
      exerciseId: workoutExercise.exerciseId,
      exerciseName: workoutExercise.exercise.name,
      orderIndex: workoutExercise.orderIndex,
      notes: workoutExercise.notes,
      createdAt: workoutExercise.createdAt.toISOString(),
      updatedAt: workoutExercise.updatedAt.toISOString(),
      sets: workoutExercise.sets.map((set) => ({
        id: set.id,
        workoutExerciseId: set.workoutExerciseId,
        orderIndex: set.orderIndex,
        weight: set.weight.toNumber(),
        reps: set.reps,
        type: fromPrismaSetType(set.type),
        completed: set.completed,
        createdAt: set.createdAt.toISOString(),
        updatedAt: set.updatedAt.toISOString()
      }))
    }))
  };
}

function withoutExercises(workout: WorkoutSession): Omit<WorkoutSession, "exercises"> {
  const { exercises: _exercises, ...historyItem } = workout;
  void _exercises;
  return historyItem;
}

function fromPrismaWorkoutStatus(status: PrismaWorkoutStatus): WorkoutStatus {
  const map = {
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    CANCELED: "canceled"
  } as const;
  return map[status];
}

function toPrismaSetType(type: WorkoutSetType): PrismaWorkoutSetType {
  const map = {
    normal: "NORMAL",
    warm_up: "WARM_UP",
    drop_set: "DROP_SET",
    failure: "FAILURE"
  } as const;
  return map[type];
}

function fromPrismaSetType(type: PrismaWorkoutSetType): WorkoutSetType {
  const map = {
    NORMAL: "normal",
    WARM_UP: "warm_up",
    DROP_SET: "drop_set",
    FAILURE: "failure"
  } as const;
  return map[type];
}
