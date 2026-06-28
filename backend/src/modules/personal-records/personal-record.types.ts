export type PersonalRecord = {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  workoutSessionId: string;
  workoutSetId: string;
  weight: number;
  reps: number;
  achievedAt: string;
  createdAt: string;
};

export type PersonalRecordCandidate = {
  userId: string;
  exerciseId: string;
  workoutSessionId: string;
  workoutSetId: string;
  weight: number;
  reps: number;
  achievedAt: string;
};
