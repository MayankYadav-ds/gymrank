import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../src/app/create-app.js";
import type { AppConfig } from "../src/config/env.js";
import { signAuthToken } from "../src/modules/auth-profile/auth-token.js";
import type { PersonalRecordRepository } from "../src/modules/personal-records/personal-record.repository.js";
import type { PersonalRecord, PersonalRecordCandidate } from "../src/modules/personal-records/personal-record.types.js";
import type {
  AddWorkoutExerciseInput,
  AddWorkoutSetInput,
  CreateWorkoutInput,
  UpdateWorkoutExerciseInput,
  UpdateWorkoutInput,
  UpdateWorkoutSetInput
} from "../src/modules/workouts/workout.schemas.js";
import type { WorkoutRepository } from "../src/modules/workouts/workout.repository.js";
import type { WorkoutHistoryItem, WorkoutSession } from "../src/modules/workouts/workout.types.js";

const testConfig: AppConfig = {
  nodeEnv: "test",
  appName: "GymRank",
  port: 4000,
  corsOrigin: "http://localhost:3000",
  databaseUrl: "postgresql://gymrank:gymrank_dev_password@localhost:5432/gymrank_dev?schema=public",
  jwtSecret: "test-secret-that-is-at-least-thirty-two-characters",
  jwtExpiresIn: "7d"
};

describe("workout routes", () => {
  let repository: InMemoryWorkoutRepository;
  let token: string;
  let otherToken: string;

  beforeEach(() => {
    repository = new InMemoryWorkoutRepository();
    token = signAuthToken({ userId: "user_1", email: "user@example.com" }, testConfig);
    otherToken = signAuthToken({ userId: "user_2", email: "other@example.com" }, testConfig);
  });

  it("requires auth for workout creation", async () => {
    const response = await request(app(repository)).post("/v1/workouts").send({});

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("auth_required");
  });

  it("creates a workout session", async () => {
    const response = await authed(request(app(repository)).post("/v1/workouts"), token).send({
      title: "Push day"
    });

    expect(response.status).toBe(201);
    expect(response.body.workout).toMatchObject({
      userId: "user_1",
      title: "Push day",
      status: "in_progress",
      exercises: []
    });
  });

  it("returns workout history", async () => {
    await authed(request(app(repository)).post("/v1/workouts"), token).send({ title: "A" });

    const response = await authed(request(app(repository)).get("/v1/workouts"), token);

    expect(response.status).toBe(200);
    expect(response.body.workouts).toHaveLength(1);
    expect(response.body.workouts[0]).toMatchObject({ exerciseCount: 0, setCount: 0 });
  });

  it("returns workout detail", async () => {
    const createResponse = await authed(request(app(repository)).post("/v1/workouts"), token).send({});

    const response = await authed(
      request(app(repository)).get(`/v1/workouts/${createResponse.body.workout.id}`),
      token
    );

    expect(response.status).toBe(200);
    expect(response.body.workout.id).toBe(createResponse.body.workout.id);
  });

  it("prevents users from reading workouts they do not own", async () => {
    const createResponse = await authed(request(app(repository)).post("/v1/workouts"), token).send({});

    const response = await authed(
      request(app(repository)).get(`/v1/workouts/${createResponse.body.workout.id}`),
      otherToken
    );

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("workout_not_found");
  });

  it("adds an exercise to a workout", async () => {
    const workout = await createWorkout(repository, token);

    const response = await authed(request(app(repository)).post(`/v1/workouts/${workout.id}/exercises`), token).send({
      exerciseId: "bench_press",
      notes: "Controlled reps"
    });

    expect(response.status).toBe(201);
    expect(response.body.workout.exercises[0]).toMatchObject({
      exerciseId: "bench_press",
      exerciseName: "Bench Press",
      notes: "Controlled reps"
    });
  });

  it("rejects unknown exercises", async () => {
    const workout = await createWorkout(repository, token);

    const response = await authed(request(app(repository)).post(`/v1/workouts/${workout.id}/exercises`), token).send({
      exerciseId: "unknown"
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("exercise_not_found");
  });

  it("does not finish an empty workout", async () => {
    const workout = await createWorkout(repository, token);

    const response = await authed(request(app(repository)).patch(`/v1/workouts/${workout.id}`), token).send({
      status: "completed"
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("workout_requires_exercise");
  });

  it("finishes a workout that has at least one exercise", async () => {
    const workout = await createWorkoutWithExercise(repository, token);

    const response = await authed(request(app(repository)).patch(`/v1/workouts/${workout.id}`), token).send({
      status: "completed"
    });

    expect(response.status).toBe(200);
    expect(response.body.workout.status).toBe("completed");
    expect(response.body.workout.finishedAt).toEqual(expect.any(String));
  });

  it("cancels a workout", async () => {
    const workout = await createWorkout(repository, token);

    const response = await authed(request(app(repository)).patch(`/v1/workouts/${workout.id}`), token).send({
      status: "canceled"
    });

    expect(response.status).toBe(200);
    expect(response.body.workout.status).toBe("canceled");
  });

  it("updates workout exercise notes and order", async () => {
    const workout = await createWorkoutWithExercise(repository, token);
    const workoutExercise = workout.exercises[0]!;

    const response = await authed(
      request(app(repository)).patch(`/v1/workouts/${workout.id}/exercises/${workoutExercise.id}`),
      token
    ).send({ notes: "Move first", orderIndex: 2 });

    expect(response.status).toBe(200);
    expect(response.body.workout.exercises[0]).toMatchObject({ notes: "Move first", orderIndex: 2 });
  });

  it("removes an exercise from a workout", async () => {
    const workout = await createWorkoutWithExercise(repository, token);
    const workoutExercise = workout.exercises[0]!;

    const response = await authed(
      request(app(repository)).delete(`/v1/workouts/${workout.id}/exercises/${workoutExercise.id}`),
      token
    );

    expect(response.status).toBe(200);
    expect(response.body.workout.exercises).toHaveLength(0);
  });

  it("adds a set", async () => {
    const workout = await createWorkoutWithExercise(repository, token);
    const workoutExercise = workout.exercises[0]!;

    const response = await authed(request(app(repository)).post(`/v1/workouts/${workout.id}/sets`), token).send({
      workoutExerciseId: workoutExercise.id,
      weight: 135,
      reps: 8,
      type: "warm_up",
      completed: true
    });

    expect(response.status).toBe(201);
    expect(response.body.workout.exercises[0].sets[0]).toMatchObject({
      weight: 135,
      reps: 8,
      type: "warm_up",
      completed: true
    });
  });

  it("rejects invalid set values", async () => {
    const workout = await createWorkoutWithExercise(repository, token);

    const response = await authed(request(app(repository)).post(`/v1/workouts/${workout.id}/sets`), token).send({
      workoutExerciseId: workout.exercises[0]!.id,
      weight: -1,
      reps: 8
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("validation_error");
  });

  it("updates a set", async () => {
    const workout = await createWorkoutWithSet(repository, token);
    const set = workout.exercises[0]!.sets[0]!;

    const response = await authed(request(app(repository)).patch(`/v1/workouts/${workout.id}/sets/${set.id}`), token).send({
      weight: 140,
      reps: 9,
      type: "normal",
      completed: true
    });

    expect(response.status).toBe(200);
    expect(response.body.workout.exercises[0].sets[0]).toMatchObject({ weight: 140, reps: 9 });
  });

  it("deletes a set", async () => {
    const workout = await createWorkoutWithSet(repository, token);
    const set = workout.exercises[0]!.sets[0]!;

    const response = await authed(request(app(repository)).delete(`/v1/workouts/${workout.id}/sets/${set.id}`), token);

    expect(response.status).toBe(200);
    expect(response.body.workout.exercises[0].sets).toHaveLength(0);
  });

  it("deletes a workout", async () => {
    const workout = await createWorkout(repository, token);

    const deleteResponse = await authed(request(app(repository)).delete(`/v1/workouts/${workout.id}`), token);
    const getResponse = await authed(request(app(repository)).get(`/v1/workouts/${workout.id}`), token);

    expect(deleteResponse.status).toBe(204);
    expect(getResponse.status).toBe(404);
  });
});

function app(repository: WorkoutRepository) {
  return createApp(testConfig, {
    workoutRepository: repository,
    personalRecordRepository: new NoopPersonalRecordRepository()
  });
}

function authed(requestBuilder: request.Test, authToken: string): request.Test {
  return requestBuilder.set("Authorization", `Bearer ${authToken}`);
}

async function createWorkout(repository: InMemoryWorkoutRepository, authToken: string): Promise<WorkoutSession> {
  const response = await authed(request(app(repository)).post("/v1/workouts"), authToken).send({});
  return response.body.workout as WorkoutSession;
}

async function createWorkoutWithExercise(
  repository: InMemoryWorkoutRepository,
  authToken: string
): Promise<WorkoutSession> {
  const workout = await createWorkout(repository, authToken);
  const response = await authed(request(app(repository)).post(`/v1/workouts/${workout.id}/exercises`), authToken).send({
    exerciseId: "bench_press"
  });
  return response.body.workout as WorkoutSession;
}

async function createWorkoutWithSet(repository: InMemoryWorkoutRepository, authToken: string): Promise<WorkoutSession> {
  const workout = await createWorkoutWithExercise(repository, authToken);
  const response = await authed(request(app(repository)).post(`/v1/workouts/${workout.id}/sets`), authToken).send({
    workoutExerciseId: workout.exercises[0]!.id,
    weight: 135,
    reps: 8
  });
  return response.body.workout as WorkoutSession;
}

class InMemoryWorkoutRepository implements WorkoutRepository {
  private readonly workouts = new Map<string, WorkoutSession>();
  private sequence = 1;
  private readonly exercises = new Map([
    ["bench_press", "Bench Press"],
    ["squat", "Squat"]
  ]);

  async createWorkout(userId: string, input: CreateWorkoutInput): Promise<WorkoutSession> {
    const now = new Date().toISOString();
    const workout: WorkoutSession = {
      id: this.nextId("workout"),
      userId,
      title: input.title ?? null,
      notes: input.notes ?? null,
      status: "in_progress",
      startedAt: now,
      finishedAt: null,
      canceledAt: null,
      exercises: [],
      createdAt: now,
      updatedAt: now
    };
    this.workouts.set(workout.id, workout);
    return workout;
  }

  async finishWorkout(userId: string, workoutId: string): Promise<WorkoutSession> {
    return this.patchWorkout(userId, workoutId, { status: "completed", finishedAt: new Date().toISOString() });
  }

  async cancelWorkout(userId: string, workoutId: string): Promise<WorkoutSession> {
    return this.patchWorkout(userId, workoutId, { status: "canceled", canceledAt: new Date().toISOString() });
  }

  async updateWorkout(userId: string, workoutId: string, input: UpdateWorkoutInput): Promise<WorkoutSession> {
    return this.patchWorkout(userId, workoutId, {
      title: input.title === undefined ? undefined : input.title,
      notes: input.notes === undefined ? undefined : input.notes
    });
  }

  async deleteWorkout(userId: string, workoutId: string): Promise<void> {
    const workout = await this.findWorkout(userId, workoutId);
    if (workout) {
      this.workouts.delete(workoutId);
    }
  }

  async findWorkout(userId: string, workoutId: string): Promise<WorkoutSession | null> {
    const workout = this.workouts.get(workoutId);
    return workout?.userId === userId ? workout : null;
  }

  async findHistory(userId: string): Promise<readonly WorkoutHistoryItem[]> {
    return [...this.workouts.values()]
      .filter((workout) => workout.userId === userId)
      .map((workout) => ({
        ...this.withoutExercises(workout),
        exerciseCount: workout.exercises.length,
        setCount: workout.exercises.reduce((count, exercise) => count + exercise.sets.length, 0)
      }));
  }

  async exerciseExists(exerciseId: string): Promise<boolean> {
    return this.exercises.has(exerciseId);
  }

  async addExercise(userId: string, workoutId: string, input: AddWorkoutExerciseInput): Promise<WorkoutSession> {
    const workout = this.requireWorkout(userId, workoutId);
    const now = new Date().toISOString();
    const workoutExercise = {
      id: this.nextId("workout_exercise"),
      workoutSessionId: workoutId,
      exerciseId: input.exerciseId,
      exerciseName: this.exercises.get(input.exerciseId)!,
      orderIndex: input.orderIndex ?? workout.exercises.length,
      notes: input.notes ?? null,
      sets: [],
      createdAt: now,
      updatedAt: now
    };
    return this.replaceWorkout({ ...workout, exercises: [...workout.exercises, workoutExercise], updatedAt: now });
  }

  async updateExercise(
    userId: string,
    workoutId: string,
    workoutExerciseId: string,
    input: UpdateWorkoutExerciseInput
  ): Promise<WorkoutSession> {
    const workout = this.requireWorkout(userId, workoutId);
    const now = new Date().toISOString();
    return this.replaceWorkout({
      ...workout,
      updatedAt: now,
      exercises: workout.exercises.map((exercise) =>
        exercise.id === workoutExerciseId
          ? {
              ...exercise,
              notes: input.notes === undefined ? exercise.notes : input.notes,
              orderIndex: input.orderIndex ?? exercise.orderIndex,
              updatedAt: now
            }
          : exercise
      )
    });
  }

  async removeExercise(userId: string, workoutId: string, workoutExerciseId: string): Promise<WorkoutSession> {
    const workout = this.requireWorkout(userId, workoutId);
    return this.replaceWorkout({
      ...workout,
      exercises: workout.exercises.filter((exercise) => exercise.id !== workoutExerciseId),
      updatedAt: new Date().toISOString()
    });
  }

  async addSet(userId: string, workoutId: string, input: AddWorkoutSetInput): Promise<WorkoutSession> {
    const workout = this.requireWorkout(userId, workoutId);
    const now = new Date().toISOString();
    return this.replaceWorkout({
      ...workout,
      updatedAt: now,
      exercises: workout.exercises.map((exercise) =>
        exercise.id === input.workoutExerciseId
          ? {
              ...exercise,
              updatedAt: now,
              sets: [
                ...exercise.sets,
                {
                  id: this.nextId("set"),
                  workoutExerciseId: exercise.id,
                  orderIndex: input.orderIndex ?? exercise.sets.length,
                  weight: input.weight,
                  reps: input.reps,
                  type: input.type,
                  completed: input.completed,
                  createdAt: now,
                  updatedAt: now
                }
              ]
            }
          : exercise
      )
    });
  }

  async updateSet(
    userId: string,
    workoutId: string,
    setId: string,
    input: UpdateWorkoutSetInput
  ): Promise<WorkoutSession> {
    const workout = this.requireWorkout(userId, workoutId);
    const now = new Date().toISOString();
    return this.replaceWorkout({
      ...workout,
      updatedAt: now,
      exercises: workout.exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) =>
          set.id === setId
            ? {
                ...set,
                weight: input.weight ?? set.weight,
                reps: input.reps ?? set.reps,
                type: input.type ?? set.type,
                completed: input.completed ?? set.completed,
                orderIndex: input.orderIndex ?? set.orderIndex,
                updatedAt: now
              }
            : set
        )
      }))
    });
  }

  async deleteSet(userId: string, workoutId: string, setId: string): Promise<WorkoutSession> {
    const workout = this.requireWorkout(userId, workoutId);
    return this.replaceWorkout({
      ...workout,
      exercises: workout.exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.filter((set) => set.id !== setId)
      })),
      updatedAt: new Date().toISOString()
    });
  }

  private requireWorkout(userId: string, workoutId: string): WorkoutSession {
    const workout = this.workouts.get(workoutId);
    if (!workout || workout.userId !== userId) {
      throw new Error("Missing test workout.");
    }
    return workout;
  }

  private patchWorkout(
    userId: string,
    workoutId: string,
    patch: Partial<Omit<WorkoutSession, "exercises">>
  ): WorkoutSession {
    const workout = this.requireWorkout(userId, workoutId);
    return this.replaceWorkout({ ...workout, ...patch, updatedAt: new Date().toISOString() });
  }

  private replaceWorkout(workout: WorkoutSession): WorkoutSession {
    this.workouts.set(workout.id, workout);
    return workout;
  }

  private withoutExercises(workout: WorkoutSession): Omit<WorkoutSession, "exercises"> {
    const { exercises: _exercises, ...rest } = workout;
    void _exercises;
    return rest;
  }

  private nextId(prefix: string): string {
    return `${prefix}_${this.sequence++}`;
  }
}

class NoopPersonalRecordRepository implements PersonalRecordRepository {
  async findCurrentByUser(_userId: string): Promise<readonly PersonalRecord[]> {
    return [];
  }

  async findHistoryByExercise(_userId: string, _exerciseId: string): Promise<readonly PersonalRecord[]> {
    return [];
  }

  async findBestForExercise(_userId: string, _exerciseId: string): Promise<PersonalRecord | null> {
    return null;
  }

  async createRecords(_candidates: readonly PersonalRecordCandidate[]): Promise<readonly PersonalRecord[]> {
    return [];
  }
}
