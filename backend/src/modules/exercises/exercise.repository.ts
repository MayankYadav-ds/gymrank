import type { PrismaClient } from "@prisma/client";

import { isTrackedLiftId } from "../../shared/constants/tracked-lifts.js";
import type {
  Exercise,
  ExerciseCategory,
  ExerciseDifficulty,
  ExerciseMuscleTarget,
  MuscleRegion,
  MuscleTargetRole
} from "./exercise.types.js";

export type ExerciseListFilters = {
  search?: string;
  trackedOnly?: boolean;
  category?: ExerciseCategory;
  muscleId?: string;
};

export type ExerciseRepository = {
  findAll(): Promise<readonly Exercise[]>;
  findById(id: string): Promise<Exercise | null>;
  findTrackedLifts(): Promise<readonly Exercise[]>;
  search(query: string): Promise<readonly Exercise[]>;
  findByCategory(category: ExerciseCategory): Promise<readonly Exercise[]>;
  findByMuscle(muscleId: string): Promise<readonly Exercise[]>;
  list(filters: ExerciseListFilters): Promise<readonly Exercise[]>;
};

export class PrismaExerciseRepository implements ExerciseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(): Promise<readonly Exercise[]> {
    return this.findMany({});
  }

  async findById(id: string): Promise<Exercise | null> {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
      include: exerciseInclude
    });

    return exercise ? mapPrismaExercise(exercise) : null;
  }

  findTrackedLifts(): Promise<readonly Exercise[]> {
    return this.findMany({
      where: { isTrackedLift: true }
    });
  }

  search(query: string): Promise<readonly Exercise[]> {
    return this.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive"
        }
      }
    });
  }

  findByCategory(category: ExerciseCategory): Promise<readonly Exercise[]> {
    return this.findMany({
      where: { category: toPrismaExerciseCategory(category) }
    });
  }

  findByMuscle(muscleId: string): Promise<readonly Exercise[]> {
    return this.findMany({
      where: {
        muscles: {
          some: { muscleId }
        }
      }
    });
  }

  async list(filters: ExerciseListFilters): Promise<readonly Exercise[]> {
    return this.findMany({
      where: {
        ...(filters.trackedOnly ? { isTrackedLift: true } : {}),
        ...(filters.category ? { category: toPrismaExerciseCategory(filters.category) } : {}),
        ...(filters.search
          ? {
              name: {
                contains: filters.search,
                mode: "insensitive" as const
              }
            }
          : {}),
        ...(filters.muscleId
          ? {
              muscles: {
                some: { muscleId: filters.muscleId }
              }
            }
          : {})
      }
    });
  }

  private async findMany(args: Parameters<PrismaClient["exercise"]["findMany"]>[0]): Promise<readonly Exercise[]> {
    const exercises = await this.prisma.exercise.findMany({
      ...args,
      include: exerciseInclude,
      orderBy: { name: "asc" }
    });

    return exercises.map(mapPrismaExercise);
  }
}

const exerciseInclude = {
  muscles: {
    include: {
      muscle: true
    },
    orderBy: {
      role: "asc" as const
    }
  }
} as const;

type PrismaExerciseWithMuscles = NonNullable<
  Awaited<ReturnType<PrismaClient["exercise"]["findUnique"]>>
> & {
  muscles: Array<{
    role: "PRIMARY" | "SECONDARY";
    muscle: {
      id: string;
      name: string;
      region: "FRONT" | "BACK" | "BOTH";
    };
  }>;
};

function mapPrismaExercise(exercise: PrismaExerciseWithMuscles): Exercise {
  return {
    id: exercise.id,
    name: exercise.name,
    category: fromPrismaExerciseCategory(exercise.category),
    equipment: exercise.equipment,
    difficulty: fromPrismaExerciseDifficulty(exercise.difficulty),
    isTrackedLift: exercise.isTrackedLift,
    trackedLiftId: toTrackedLiftId(exercise.trackedLiftId),
    muscles: exercise.muscles.map(
      (mapping): ExerciseMuscleTarget => ({
        id: mapping.muscle.id,
        name: mapping.muscle.name,
        region: fromPrismaMuscleRegion(mapping.muscle.region),
        role: fromPrismaMuscleTargetRole(mapping.role)
      })
    )
  };
}

function toTrackedLiftId(value: string | null) {
  if (value === null) {
    return null;
  }

  if (!isTrackedLiftId(value)) {
    throw new Error(`Database exercise has unsupported trackedLiftId: ${value}`);
  }

  return value;
}

function fromPrismaExerciseCategory(value: "STRENGTH" | "HYPERTROPHY" | "BODYWEIGHT" | "ACCESSORY"): ExerciseCategory {
  const map = {
    STRENGTH: "strength",
    HYPERTROPHY: "hypertrophy",
    BODYWEIGHT: "bodyweight",
    ACCESSORY: "accessory"
  } as const;

  return map[value];
}

function toPrismaExerciseCategory(value: ExerciseCategory): "STRENGTH" | "HYPERTROPHY" | "BODYWEIGHT" | "ACCESSORY" {
  const map = {
    strength: "STRENGTH",
    hypertrophy: "HYPERTROPHY",
    bodyweight: "BODYWEIGHT",
    accessory: "ACCESSORY"
  } as const;

  return map[value];
}

function fromPrismaExerciseDifficulty(value: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"): ExerciseDifficulty {
  const map = {
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    ADVANCED: "advanced"
  } as const;

  return map[value];
}

function fromPrismaMuscleRegion(value: "FRONT" | "BACK" | "BOTH"): MuscleRegion {
  const map = {
    FRONT: "front",
    BACK: "back",
    BOTH: "both"
  } as const;

  return map[value];
}

function fromPrismaMuscleTargetRole(value: "PRIMARY" | "SECONDARY"): MuscleTargetRole {
  return value === "PRIMARY" ? "primary" : "secondary";
}
