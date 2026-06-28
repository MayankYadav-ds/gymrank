import type { Exercise, Muscle } from "./exercise.types.js";

export const muscles: readonly Muscle[] = [
  { id: "chest", name: "Chest", region: "front" },
  { id: "front_delts", name: "Front Delts", region: "front" },
  { id: "side_delts", name: "Side Delts", region: "front" },
  { id: "triceps", name: "Triceps", region: "front" },
  { id: "lats", name: "Lats", region: "back" },
  { id: "upper_back", name: "Upper Back", region: "back" },
  { id: "spinal_erectors", name: "Spinal Erectors", region: "back" },
  { id: "abs", name: "Abs", region: "front" },
  { id: "glutes", name: "Glutes", region: "back" },
  { id: "quads", name: "Quads", region: "front" },
  { id: "hamstrings", name: "Hamstrings", region: "back" },
  { id: "calves", name: "Calves", region: "back" },
  { id: "biceps", name: "Biceps", region: "front" }
] as const;

const muscleById = new Map(muscles.map((muscle) => [muscle.id, muscle]));

export const exerciseCatalog: readonly Exercise[] = [
  {
    id: "bench_press",
    name: "Bench Press",
    category: "strength",
    equipment: "barbell",
    difficulty: "intermediate",
    isTrackedLift: true,
    trackedLiftId: "bench_press",
    muscles: targets(["chest"], ["front_delts", "triceps"])
  },
  {
    id: "squat",
    name: "Squat",
    category: "strength",
    equipment: "barbell",
    difficulty: "intermediate",
    isTrackedLift: true,
    trackedLiftId: "squat",
    muscles: targets(["quads", "glutes"], ["hamstrings", "abs", "spinal_erectors"])
  },
  {
    id: "deadlift",
    name: "Deadlift",
    category: "strength",
    equipment: "barbell",
    difficulty: "advanced",
    isTrackedLift: true,
    trackedLiftId: "deadlift",
    muscles: targets(["glutes", "hamstrings", "spinal_erectors"], ["upper_back", "lats", "quads"])
  },
  {
    id: "overhead_press",
    name: "Overhead Press",
    category: "strength",
    equipment: "barbell",
    difficulty: "intermediate",
    isTrackedLift: true,
    trackedLiftId: "overhead_press",
    muscles: targets(["front_delts", "side_delts"], ["triceps", "upper_back", "abs"])
  },
  {
    id: "pull_up_weighted_pull_up",
    name: "Pull-Up / Weighted Pull-Up",
    category: "strength",
    equipment: "bodyweight",
    difficulty: "intermediate",
    isTrackedLift: true,
    trackedLiftId: "pull_up_weighted_pull_up",
    muscles: targets(["lats", "upper_back"], ["biceps", "abs"])
  },
  {
    id: "barbell_row",
    name: "Barbell Row",
    category: "hypertrophy",
    equipment: "barbell",
    difficulty: "intermediate",
    isTrackedLift: false,
    trackedLiftId: null,
    muscles: targets(["lats", "upper_back"], ["biceps", "spinal_erectors"])
  },
  {
    id: "incline_dumbbell_press",
    name: "Incline Dumbbell Press",
    category: "hypertrophy",
    equipment: "dumbbell",
    difficulty: "beginner",
    isTrackedLift: false,
    trackedLiftId: null,
    muscles: targets(["chest", "front_delts"], ["triceps"])
  },
  {
    id: "romanian_deadlift",
    name: "Romanian Deadlift",
    category: "accessory",
    equipment: "barbell",
    difficulty: "intermediate",
    isTrackedLift: false,
    trackedLiftId: null,
    muscles: targets(["hamstrings", "glutes"], ["spinal_erectors"])
  },
  {
    id: "leg_press",
    name: "Leg Press",
    category: "hypertrophy",
    equipment: "machine",
    difficulty: "beginner",
    isTrackedLift: false,
    trackedLiftId: null,
    muscles: targets(["quads", "glutes"], ["hamstrings", "calves"])
  },
  {
    id: "lat_pulldown",
    name: "Lat Pulldown",
    category: "hypertrophy",
    equipment: "cable",
    difficulty: "beginner",
    isTrackedLift: false,
    trackedLiftId: null,
    muscles: targets(["lats"], ["upper_back", "biceps"])
  }
] as const;

function targets(primaryIds: readonly string[], secondaryIds: readonly string[]) {
  return [
    ...primaryIds.map((id) => ({ ...findMuscle(id), role: "primary" as const })),
    ...secondaryIds.map((id) => ({ ...findMuscle(id), role: "secondary" as const }))
  ];
}

function findMuscle(id: string): Muscle {
  const muscle = muscleById.get(id);

  if (!muscle) {
    throw new Error(`Unknown muscle in exercise catalog: ${id}`);
  }

  return muscle;
}
