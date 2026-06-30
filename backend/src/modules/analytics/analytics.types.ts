export type AnalyticsWorkoutSet = {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
};

export type AnalyticsMuscle = {
  id: string;
  name: string;
};

export type AnalyticsWorkoutExercise = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: readonly AnalyticsWorkoutSet[];
  muscles: readonly AnalyticsMuscle[];
};

export type AnalyticsWorkout = {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  exercises: readonly AnalyticsWorkoutExercise[];
};

export type AnalyticsPersonalRecord = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  achievedAt: string;
};

export type AnalyticsSource = {
  user: {
    bodyweight: number | null;
  };
  workouts: readonly AnalyticsWorkout[];
  personalRecords: readonly AnalyticsPersonalRecord[];
};

export type DashboardAnalytics = {
  totalWorkouts: number;
  totalSets: number;
  totalReps: number;
  totalVolumeLifted: number;
  activeDays: number;
  workoutStreak: number;
  currentBodyweight: number | null;
  prCount: number;
};

export type StrengthExerciseAnalytics = {
  exerciseId: string;
  exerciseName: string;
  currentPr: AnalyticsPersonalRecord | null;
  previousPr: AnalyticsPersonalRecord | null;
  progressPercent: number | null;
  progressTimeline: readonly AnalyticsPersonalRecord[];
  lastWorkout: ExerciseWorkoutSummary | null;
  bestWorkout: ExerciseWorkoutSummary | null;
};

export type ExerciseWorkoutSummary = {
  workoutId: string;
  performedAt: string;
  volume: number;
  sets: number;
  reps: number;
};

export type VolumeAnalytics = {
  weeklyVolume: readonly TimeBucketVolume[];
  monthlyVolume: readonly TimeBucketVolume[];
  exerciseVolume: readonly ExerciseVolume[];
  muscleGroupVolume: readonly MuscleGroupVolume[];
};

export type TimeBucketVolume = {
  period: string;
  volume: number;
};

export type ExerciseVolume = {
  exerciseId: string;
  exerciseName: string;
  volume: number;
};

export type MuscleGroupVolume = {
  muscleGroup: MuscleGroup;
  volume: number;
};

export type ConsistencyAnalytics = {
  currentStreak: number;
  longestStreak: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  calendarHeatmap: readonly CalendarHeatmapDay[];
};

export type CalendarHeatmapDay = {
  date: string;
  workoutCount: number;
};

export type BodyweightAnalytics = {
  history: readonly BodyweightHistoryPoint[];
  highest: number | null;
  lowest: number | null;
  current: number | null;
  average: number | null;
};

export type BodyweightHistoryPoint = {
  date: string;
  bodyweight: number;
};

export type MuscleDistributionAnalytics = {
  chest: number;
  back: number;
  legs: number;
  shoulders: number;
  arms: number;
  core: number;
};

export const muscleGroups = ["chest", "back", "legs", "shoulders", "arms", "core"] as const;
export type MuscleGroup = (typeof muscleGroups)[number];
