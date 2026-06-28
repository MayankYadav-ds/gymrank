import type { TrackedLiftId } from "../../shared/constants/tracked-lifts.js";

export const exerciseCategories = ["strength", "hypertrophy", "bodyweight", "accessory"] as const;
export type ExerciseCategory = (typeof exerciseCategories)[number];

export const exerciseDifficulties = ["beginner", "intermediate", "advanced"] as const;
export type ExerciseDifficulty = (typeof exerciseDifficulties)[number];

export const muscleRegions = ["front", "back", "both"] as const;
export type MuscleRegion = (typeof muscleRegions)[number];

export const muscleTargetRoles = ["primary", "secondary"] as const;
export type MuscleTargetRole = (typeof muscleTargetRoles)[number];

export type Muscle = {
  id: string;
  name: string;
  region: MuscleRegion;
};

export type ExerciseMuscleTarget = Muscle & {
  role: MuscleTargetRole;
};

export type Exercise = {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment: string;
  difficulty: ExerciseDifficulty;
  isTrackedLift: boolean;
  trackedLiftId: TrackedLiftId | null;
  muscles: readonly ExerciseMuscleTarget[];
};

export type ExerciseListItem = Omit<Exercise, "muscles"> & {
  primaryMuscles: readonly Muscle[];
  secondaryMuscles: readonly Muscle[];
};

export type ExerciseDetail = ExerciseListItem & {
  anatomy: {
    frontHighlightedMuscles: readonly Muscle[];
    backHighlightedMuscles: readonly Muscle[];
  };
};
