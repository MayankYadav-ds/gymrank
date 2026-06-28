export type OverloadPreviousWorkout = {
  workoutSessionId: string;
  exerciseId: string;
  exerciseName: string;
  completedAt: string;
  bestWeight: number;
  bestReps: number;
  setCount: number;
};

export type OverloadRecommendation = {
  previousWorkout: OverloadPreviousWorkout | null;
  recommendation: "none" | "increase_weight" | "increase_reps" | "repeat_weight";
  suggestedWeight: number | null;
  suggestedReps: number | null;
  explanation: string;
};

export type CompletedExercisePerformance = {
  workoutSessionId: string;
  exerciseId: string;
  exerciseName: string;
  category: string;
  completedAt: string;
  sets: readonly {
    weight: number;
    reps: number;
    completed: boolean;
  }[];
};
