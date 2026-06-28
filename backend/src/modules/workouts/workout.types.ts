export const workoutStatuses = ["in_progress", "completed", "canceled"] as const;
export type WorkoutStatus = (typeof workoutStatuses)[number];

export const workoutSetTypes = ["normal", "warm_up", "drop_set", "failure"] as const;
export type WorkoutSetType = (typeof workoutSetTypes)[number];

export type WorkoutSet = {
  id: string;
  workoutExerciseId: string;
  orderIndex: number;
  weight: number;
  reps: number;
  type: WorkoutSetType;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WorkoutExercise = {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  notes: string | null;
  sets: readonly WorkoutSet[];
  createdAt: string;
  updatedAt: string;
};

export type WorkoutSession = {
  id: string;
  userId: string;
  title: string | null;
  notes: string | null;
  status: WorkoutStatus;
  startedAt: string;
  finishedAt: string | null;
  canceledAt: string | null;
  exercises: readonly WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
};

export type WorkoutHistoryItem = Omit<WorkoutSession, "exercises"> & {
  exerciseCount: number;
  setCount: number;
};
