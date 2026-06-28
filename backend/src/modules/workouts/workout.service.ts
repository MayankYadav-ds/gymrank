import { AppError } from "../../shared/errors/app-error.js";
import type { PersonalRecordService } from "../personal-records/personal-record.service.js";
import type {
  AddWorkoutExerciseInput,
  AddWorkoutSetInput,
  CreateWorkoutInput,
  UpdateWorkoutExerciseInput,
  UpdateWorkoutInput,
  UpdateWorkoutSetInput
} from "./workout.schemas.js";
import type { WorkoutRepository } from "./workout.repository.js";
import type { WorkoutHistoryItem, WorkoutSession } from "./workout.types.js";

export class WorkoutService {
  constructor(
    private readonly repository: WorkoutRepository,
    private readonly personalRecordService?: PersonalRecordService
  ) {}

  createWorkout(userId: string, input: CreateWorkoutInput): Promise<WorkoutSession> {
    return this.repository.createWorkout(userId, input);
  }

  async updateWorkout(userId: string, workoutId: string, input: UpdateWorkoutInput): Promise<WorkoutSession> {
    const workout = await this.requireWorkout(userId, workoutId);

    if (input.status === "completed") {
      return this.finishWorkout(userId, workout.id);
    }

    if (input.status === "canceled") {
      return this.cancelWorkout(userId, workout.id);
    }

    if (input.status === "in_progress" && workout.status !== "in_progress") {
      throw new AppError(400, "invalid_workout_status", "Completed or canceled workouts cannot be reopened.");
    }

    return this.repository.updateWorkout(userId, workoutId, input);
  }

  async finishWorkout(userId: string, workoutId: string): Promise<WorkoutSession> {
    const workout = await this.requireWorkout(userId, workoutId);

    if (workout.exercises.length === 0) {
      throw new AppError(
        400,
        "workout_requires_exercise",
        "Workout must contain at least one exercise before completion."
      );
    }

    const completedWorkout = await this.repository.finishWorkout(userId, workoutId);
    await this.personalRecordService?.detectForCompletedWorkout(completedWorkout);
    return completedWorkout;
  }

  async cancelWorkout(userId: string, workoutId: string): Promise<WorkoutSession> {
    await this.requireWorkout(userId, workoutId);
    return this.repository.cancelWorkout(userId, workoutId);
  }

  async deleteWorkout(userId: string, workoutId: string): Promise<void> {
    await this.requireWorkout(userId, workoutId);
    await this.repository.deleteWorkout(userId, workoutId);
  }

  async findWorkout(userId: string, workoutId: string): Promise<WorkoutSession> {
    return this.requireWorkout(userId, workoutId);
  }

  findHistory(userId: string): Promise<readonly WorkoutHistoryItem[]> {
    return this.repository.findHistory(userId);
  }

  async addExercise(
    userId: string,
    workoutId: string,
    input: AddWorkoutExerciseInput
  ): Promise<WorkoutSession> {
    await this.requireWorkout(userId, workoutId);

    if (!(await this.repository.exerciseExists(input.exerciseId))) {
      throw new AppError(400, "exercise_not_found", "Exercise does not exist.");
    }

    return this.repository.addExercise(userId, workoutId, input);
  }

  async updateExercise(
    userId: string,
    workoutId: string,
    workoutExerciseId: string,
    input: UpdateWorkoutExerciseInput
  ): Promise<WorkoutSession> {
    const workout = await this.requireWorkout(userId, workoutId);

    if (!workout.exercises.some((exercise) => exercise.id === workoutExerciseId)) {
      throw new AppError(404, "workout_exercise_not_found", "Workout exercise was not found.");
    }

    return this.repository.updateExercise(userId, workoutId, workoutExerciseId, input);
  }

  async removeExercise(userId: string, workoutId: string, workoutExerciseId: string): Promise<WorkoutSession> {
    const workout = await this.requireWorkout(userId, workoutId);

    if (!workout.exercises.some((exercise) => exercise.id === workoutExerciseId)) {
      throw new AppError(404, "workout_exercise_not_found", "Workout exercise was not found.");
    }

    return this.repository.removeExercise(userId, workoutId, workoutExerciseId);
  }

  async addSet(userId: string, workoutId: string, input: AddWorkoutSetInput): Promise<WorkoutSession> {
    const workout = await this.requireWorkout(userId, workoutId);

    if (!workout.exercises.some((exercise) => exercise.id === input.workoutExerciseId)) {
      throw new AppError(404, "workout_exercise_not_found", "Workout exercise was not found.");
    }

    return this.repository.addSet(userId, workoutId, input);
  }

  async updateSet(
    userId: string,
    workoutId: string,
    setId: string,
    input: UpdateWorkoutSetInput
  ): Promise<WorkoutSession> {
    const workout = await this.requireWorkout(userId, workoutId);

    if (!workout.exercises.some((exercise) => exercise.sets.some((set) => set.id === setId))) {
      throw new AppError(404, "workout_set_not_found", "Workout set was not found.");
    }

    return this.repository.updateSet(userId, workoutId, setId, input);
  }

  async deleteSet(userId: string, workoutId: string, setId: string): Promise<WorkoutSession> {
    const workout = await this.requireWorkout(userId, workoutId);

    if (!workout.exercises.some((exercise) => exercise.sets.some((set) => set.id === setId))) {
      throw new AppError(404, "workout_set_not_found", "Workout set was not found.");
    }

    return this.repository.deleteSet(userId, workoutId, setId);
  }

  private async requireWorkout(userId: string, workoutId: string): Promise<WorkoutSession> {
    const workout = await this.repository.findWorkout(userId, workoutId);

    if (!workout) {
      throw new AppError(404, "workout_not_found", "Workout was not found.");
    }

    return workout;
  }
}
