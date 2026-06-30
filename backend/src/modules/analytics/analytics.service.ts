import type {
  AnalyticsPersonalRecord,
  AnalyticsSource,
  BodyweightAnalytics,
  ConsistencyAnalytics,
  DashboardAnalytics,
  ExerciseVolume,
  ExerciseWorkoutSummary,
  MuscleDistributionAnalytics,
  MuscleGroup,
  StrengthExerciseAnalytics,
  TimeBucketVolume,
  VolumeAnalytics
} from "./analytics.types.js";
import type { AnalyticsRepository } from "./analytics.repository.js";
import { muscleGroups } from "./analytics.types.js";

type Clock = () => Date;

export class AnalyticsService {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly now: Clock = () => new Date()
  ) {}

  async getDashboard(userId: string): Promise<DashboardAnalytics> {
    const source = await this.repository.getAnalyticsSource(userId);
    const completedSets = getCompletedSets(source);

    return {
      totalWorkouts: source.workouts.length,
      totalSets: completedSets.length,
      totalReps: completedSets.reduce((sum, set) => sum + set.reps, 0),
      totalVolumeLifted: round(completedSets.reduce((sum, set) => sum + set.weight * set.reps, 0)),
      activeDays: getActiveDateSet(source).size,
      workoutStreak: calculateStreaks(source).currentStreak,
      currentBodyweight: source.user.bodyweight,
      prCount: source.personalRecords.length
    };
  }

  async getStrength(userId: string): Promise<readonly StrengthExerciseAnalytics[]> {
    const source = await this.repository.getAnalyticsSource(userId);
    const exerciseIds = new Set<string>();

    for (const workout of source.workouts) {
      for (const exercise of workout.exercises) {
        exerciseIds.add(exercise.exerciseId);
      }
    }

    for (const record of source.personalRecords) {
      exerciseIds.add(record.exerciseId);
    }

    return [...exerciseIds].sort().map((exerciseId) => this.getExerciseStrength(source, exerciseId));
  }

  async getVolume(userId: string): Promise<VolumeAnalytics> {
    const source = await this.repository.getAnalyticsSource(userId);
    const weekly = new Map<string, number>();
    const monthly = new Map<string, number>();
    const exerciseVolume = new Map<string, ExerciseVolume>();
    const muscleVolume = emptyMuscleVolumeMap();

    for (const workout of source.workouts) {
      const date = new Date(workout.startedAt);
      const weekKey = getIsoWeekKey(date);
      const monthKey = workout.startedAt.slice(0, 7);

      for (const exercise of workout.exercises) {
        const volume = getExerciseVolume(exercise.sets);
        weekly.set(weekKey, round((weekly.get(weekKey) ?? 0) + volume));
        monthly.set(monthKey, round((monthly.get(monthKey) ?? 0) + volume));

        const existing = exerciseVolume.get(exercise.exerciseId);
        exerciseVolume.set(exercise.exerciseId, {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          volume: round((existing?.volume ?? 0) + volume)
        });

        addMuscleVolume(muscleVolume, exercise.muscles, volume);
      }
    }

    return {
      weeklyVolume: mapTimeBuckets(weekly),
      monthlyVolume: mapTimeBuckets(monthly),
      exerciseVolume: [...exerciseVolume.values()].sort((left, right) => right.volume - left.volume),
      muscleGroupVolume: muscleGroups.map((muscleGroup) => ({
        muscleGroup,
        volume: round(muscleVolume.get(muscleGroup) ?? 0)
      }))
    };
  }

  async getConsistency(userId: string): Promise<ConsistencyAnalytics> {
    const source = await this.repository.getAnalyticsSource(userId);
    const { currentStreak, longestStreak } = calculateStreaks(source);
    const workoutCountsByDate = getWorkoutCountsByDate(source);
    const now = this.now();

    return {
      currentStreak,
      longestStreak,
      workoutsThisWeek: source.workouts.filter((workout) => isSameIsoWeek(new Date(workout.startedAt), now)).length,
      workoutsThisMonth: source.workouts.filter((workout) => workout.startedAt.slice(0, 7) === toIsoMonth(now)).length,
      calendarHeatmap: [...workoutCountsByDate.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([date, workoutCount]) => ({ date, workoutCount }))
    };
  }

  async getBodyweight(userId: string): Promise<BodyweightAnalytics> {
    const source = await this.repository.getAnalyticsSource(userId);

    if (source.user.bodyweight === null) {
      return {
        history: [],
        highest: null,
        lowest: null,
        current: null,
        average: null
      };
    }

    return {
      history: [
        {
          date: toIsoDate(this.now()),
          bodyweight: source.user.bodyweight
        }
      ],
      highest: source.user.bodyweight,
      lowest: source.user.bodyweight,
      current: source.user.bodyweight,
      average: source.user.bodyweight
    };
  }

  async getMuscleDistribution(userId: string): Promise<MuscleDistributionAnalytics> {
    const volume = await this.getVolume(userId);
    const total = volume.muscleGroupVolume.reduce((sum, item) => sum + item.volume, 0);

    if (total === 0) {
      return {
        chest: 0,
        back: 0,
        legs: 0,
        shoulders: 0,
        arms: 0,
        core: 0
      };
    }

    return Object.fromEntries(
      volume.muscleGroupVolume.map((item) => [item.muscleGroup, round((item.volume / total) * 100)])
    ) as MuscleDistributionAnalytics;
  }

  private getExerciseStrength(source: AnalyticsSource, exerciseId: string): StrengthExerciseAnalytics {
    const timeline = source.personalRecords
      .filter((record) => record.exerciseId === exerciseId)
      .sort((left, right) => Date.parse(left.achievedAt) - Date.parse(right.achievedAt));
    const currentPr = timeline.at(-1) ?? null;
    const previousPr = timeline.at(-2) ?? null;
    const exerciseName =
      currentPr?.exerciseName ??
      source.workouts.flatMap((workout) => workout.exercises).find((exercise) => exercise.exerciseId === exerciseId)
        ?.exerciseName ??
      exerciseId;
    const workoutSummaries = getExerciseWorkoutSummaries(source, exerciseId);

    return {
      exerciseId,
      exerciseName,
      currentPr,
      previousPr,
      progressPercent: calculateProgressPercent(currentPr, previousPr),
      progressTimeline: timeline,
      lastWorkout: workoutSummaries.at(-1) ?? null,
      bestWorkout: [...workoutSummaries].sort((left, right) => right.volume - left.volume)[0] ?? null
    };
  }
}

function getCompletedSets(source: AnalyticsSource) {
  return source.workouts.flatMap((workout) =>
    workout.exercises.flatMap((exercise) => exercise.sets.filter((set) => set.completed))
  );
}

function getExerciseVolume(sets: readonly { weight: number; reps: number; completed: boolean }[]): number {
  return round(sets.filter((set) => set.completed).reduce((sum, set) => sum + set.weight * set.reps, 0));
}

function getExerciseWorkoutSummaries(source: AnalyticsSource, exerciseId: string): ExerciseWorkoutSummary[] {
  return source.workouts.flatMap((workout) =>
    workout.exercises
      .filter((exercise) => exercise.exerciseId === exerciseId)
      .map((exercise) => {
        const completedSets = exercise.sets.filter((set) => set.completed);

        return {
          workoutId: workout.id,
          performedAt: workout.finishedAt ?? workout.startedAt,
          volume: getExerciseVolume(exercise.sets),
          sets: completedSets.length,
          reps: completedSets.reduce((sum, set) => sum + set.reps, 0)
        };
      })
  );
}

function calculateProgressPercent(
  currentPr: AnalyticsPersonalRecord | null,
  previousPr: AnalyticsPersonalRecord | null
): number | null {
  if (!currentPr || !previousPr || previousPr.weight === 0) {
    return null;
  }

  return round(((currentPr.weight - previousPr.weight) / previousPr.weight) * 100);
}

function getActiveDateSet(source: AnalyticsSource): Set<string> {
  return new Set(source.workouts.map((workout) => workout.startedAt.slice(0, 10)));
}

function getWorkoutCountsByDate(source: AnalyticsSource): Map<string, number> {
  const counts = new Map<string, number>();

  for (const workout of source.workouts) {
    const date = workout.startedAt.slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  return counts;
}

function calculateStreaks(source: AnalyticsSource): { currentStreak: number; longestStreak: number } {
  const dates = [...getActiveDateSet(source)].sort();

  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longestStreak = 1;
  let currentRun = 1;

  for (let index = 1; index < dates.length; index += 1) {
    const previous = new Date(`${dates[index - 1]}T00:00:00.000Z`);
    const current = new Date(`${dates[index]}T00:00:00.000Z`);
    const dayGap = Math.round((current.getTime() - previous.getTime()) / 86_400_000);

    currentRun = dayGap === 1 ? currentRun + 1 : 1;
    longestStreak = Math.max(longestStreak, currentRun);
  }

  return { currentStreak: currentRun, longestStreak };
}

function getIsoWeekKey(date: Date): string {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);

  return `${utcDate.getUTCFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
}

function isSameIsoWeek(left: Date, right: Date): boolean {
  return getIsoWeekKey(left) === getIsoWeekKey(right);
}

function toIsoMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function mapTimeBuckets(map: Map<string, number>): readonly TimeBucketVolume[] {
  return [...map.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([period, volume]) => ({ period, volume: round(volume) }));
}

function emptyMuscleVolumeMap(): Map<MuscleGroup, number> {
  return new Map(muscleGroups.map((muscleGroup) => [muscleGroup, 0]));
}

function addMuscleVolume(
  muscleVolume: Map<MuscleGroup, number>,
  muscles: readonly { id: string; name: string }[],
  volume: number
): void {
  const groups = new Set<MuscleGroup>();

  for (const muscle of muscles) {
    const group = toMuscleGroup(muscle.id) ?? toMuscleGroup(muscle.name);

    if (group) {
      groups.add(group);
    }
  }

  if (groups.size === 0 || volume === 0) {
    return;
  }

  const allocatedVolume = volume / groups.size;

  for (const group of groups) {
    muscleVolume.set(group, (muscleVolume.get(group) ?? 0) + allocatedVolume);
  }
}

function toMuscleGroup(value: string): MuscleGroup | null {
  const normalized = value.toLowerCase().replaceAll(" ", "_");

  if (normalized.includes("chest") || normalized.includes("pec")) {
    return "chest";
  }

  if (
    normalized.includes("back") ||
    normalized.includes("lat") ||
    normalized.includes("erector") ||
    normalized.includes("trap")
  ) {
    return "back";
  }

  if (
    normalized.includes("quad") ||
    normalized.includes("hamstring") ||
    normalized.includes("glute") ||
    normalized.includes("calf") ||
    normalized.includes("leg")
  ) {
    return "legs";
  }

  if (normalized.includes("delt") || normalized.includes("shoulder")) {
    return "shoulders";
  }

  if (normalized.includes("bicep") || normalized.includes("tricep") || normalized.includes("arm")) {
    return "arms";
  }

  if (normalized.includes("ab") || normalized.includes("core")) {
    return "core";
  }

  return null;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
