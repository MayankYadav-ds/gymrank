import type { Exercise, ExerciseDetail, ExerciseListItem, Muscle } from "./exercise.types.js";

export function toExerciseListItem(exercise: Exercise): ExerciseListItem {
  const primaryMuscles = exercise.muscles.filter((muscle) => muscle.role === "primary");
  const secondaryMuscles = exercise.muscles.filter((muscle) => muscle.role === "secondary");

  return {
    id: exercise.id,
    name: exercise.name,
    category: exercise.category,
    equipment: exercise.equipment,
    difficulty: exercise.difficulty,
    isTrackedLift: exercise.isTrackedLift,
    trackedLiftId: exercise.trackedLiftId,
    primaryMuscles,
    secondaryMuscles
  };
}

export function toExerciseDetail(exercise: Exercise): ExerciseDetail {
  const item = toExerciseListItem(exercise);
  const allTargetMuscles: readonly Muscle[] = [...item.primaryMuscles, ...item.secondaryMuscles];

  return {
    ...item,
    anatomy: {
      frontHighlightedMuscles: allTargetMuscles.filter((muscle) => muscle.region !== "back"),
      backHighlightedMuscles: allTargetMuscles.filter((muscle) => muscle.region !== "front")
    }
  };
}
