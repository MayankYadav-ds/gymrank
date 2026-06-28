import type { TrackedLiftId } from "../../src/shared/constants/tracked-lifts.js";

export type SeedMuscle = {
  id: string;
  name: string;
  region: "FRONT" | "BACK" | "BOTH";
};

export type SeedExerciseMuscle = {
  muscleId: string;
  role: "PRIMARY" | "SECONDARY";
};

export type SeedExercise = {
  id: string;
  name: string;
  category: "STRENGTH" | "HYPERTROPHY" | "BODYWEIGHT" | "ACCESSORY";
  equipment: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  isTrackedLift: boolean;
  trackedLiftId: TrackedLiftId | null;
  muscles: readonly SeedExerciseMuscle[];
};

export const seedMuscles: readonly SeedMuscle[] = [
  { id: "chest", name: "Chest", region: "FRONT" },
  { id: "front_delts", name: "Front Delts", region: "FRONT" },
  { id: "side_delts", name: "Side Delts", region: "FRONT" },
  { id: "triceps", name: "Triceps", region: "FRONT" },
  { id: "lats", name: "Lats", region: "BACK" },
  { id: "upper_back", name: "Upper Back", region: "BACK" },
  { id: "spinal_erectors", name: "Spinal Erectors", region: "BACK" },
  { id: "abs", name: "Abs", region: "FRONT" },
  { id: "glutes", name: "Glutes", region: "BACK" },
  { id: "quads", name: "Quads", region: "FRONT" },
  { id: "hamstrings", name: "Hamstrings", region: "BACK" },
  { id: "calves", name: "Calves", region: "BACK" },
  { id: "biceps", name: "Biceps", region: "FRONT" }
] as const;

export const seedExercises: readonly SeedExercise[] = [
  {
    id: "bench_press",
    name: "Bench Press",
    category: "STRENGTH",
    equipment: "barbell",
    difficulty: "INTERMEDIATE",
    isTrackedLift: true,
    trackedLiftId: "bench_press",
    muscles: targets(["chest"], ["front_delts", "triceps"])
  },
  {
    id: "squat",
    name: "Squat",
    category: "STRENGTH",
    equipment: "barbell",
    difficulty: "INTERMEDIATE",
    isTrackedLift: true,
    trackedLiftId: "squat",
    muscles: targets(["quads", "glutes"], ["hamstrings", "abs", "spinal_erectors"])
  },
  {
    id: "deadlift",
    name: "Deadlift",
    category: "STRENGTH",
    equipment: "barbell",
    difficulty: "ADVANCED",
    isTrackedLift: true,
    trackedLiftId: "deadlift",
    muscles: targets(["glutes", "hamstrings", "spinal_erectors"], ["upper_back", "lats", "quads"])
  },
  {
    id: "overhead_press",
    name: "Overhead Press",
    category: "STRENGTH",
    equipment: "barbell",
    difficulty: "INTERMEDIATE",
    isTrackedLift: true,
    trackedLiftId: "overhead_press",
    muscles: targets(["front_delts", "side_delts"], ["triceps", "upper_back", "abs"])
  },
  {
    id: "pull_up_weighted_pull_up",
    name: "Pull-Up / Weighted Pull-Up",
    category: "STRENGTH",
    equipment: "bodyweight",
    difficulty: "INTERMEDIATE",
    isTrackedLift: true,
    trackedLiftId: "pull_up_weighted_pull_up",
    muscles: targets(["lats", "upper_back"], ["biceps", "abs"])
  },
  {
    id: "barbell_row",
    name: "Barbell Row",
    category: "HYPERTROPHY",
    equipment: "barbell",
    difficulty: "INTERMEDIATE",
    isTrackedLift: false,
    trackedLiftId: null,
    muscles: targets(["lats", "upper_back"], ["biceps", "spinal_erectors"])
  },
  {
    id: "incline_dumbbell_press",
    name: "Incline Dumbbell Press",
    category: "HYPERTROPHY",
    equipment: "dumbbell",
    difficulty: "BEGINNER",
    isTrackedLift: false,
    trackedLiftId: null,
    muscles: targets(["chest", "front_delts"], ["triceps"])
  },
  {
    id: "romanian_deadlift",
    name: "Romanian Deadlift",
    category: "ACCESSORY",
    equipment: "barbell",
    difficulty: "INTERMEDIATE",
    isTrackedLift: false,
    trackedLiftId: null,
    muscles: targets(["hamstrings", "glutes"], ["spinal_erectors"])
  },
  {
    id: "leg_press",
    name: "Leg Press",
    category: "HYPERTROPHY",
    equipment: "machine",
    difficulty: "BEGINNER",
    isTrackedLift: false,
    trackedLiftId: null,
    muscles: targets(["quads", "glutes"], ["hamstrings", "calves"])
  },
  {
    id: "lat_pulldown",
    name: "Lat Pulldown",
    category: "HYPERTROPHY",
    equipment: "cable",
    difficulty: "BEGINNER",
    isTrackedLift: false,
    trackedLiftId: null,
    muscles: targets(["lats"], ["upper_back", "biceps"])
  }
] as const;

function targets(primaryIds: readonly string[], secondaryIds: readonly string[]): readonly SeedExerciseMuscle[] {
  return [
    ...primaryIds.map((muscleId) => ({ muscleId, role: "PRIMARY" as const })),
    ...secondaryIds.map((muscleId) => ({ muscleId, role: "SECONDARY" as const }))
  ];
}
