import type { Express, Request, Response } from "express";

import type { AppConfig } from "../../config/env.js";
import { requireAuth } from "../auth-profile/auth.middleware.js";
import {
  PrismaPersonalRecordRepository,
  type PersonalRecordRepository
} from "../personal-records/personal-record.repository.js";
import { PersonalRecordService } from "../personal-records/personal-record.service.js";
import { PrismaRankingRepository, type RankingRepository } from "../rankings/ranking.repository.js";
import { RankingService } from "../rankings/ranking.service.js";
import { AppError } from "../../shared/errors/app-error.js";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { prisma } from "../../shared/prisma/client.js";
import { validateBody } from "../../shared/validation/validate-request.js";
import {
  addWorkoutExerciseSchema,
  addWorkoutSetSchema,
  createWorkoutSchema,
  updateWorkoutExerciseSchema,
  updateWorkoutSchema,
  updateWorkoutSetSchema
} from "./workout.schemas.js";
import { PrismaWorkoutRepository, type WorkoutRepository } from "./workout.repository.js";
import { WorkoutService } from "./workout.service.js";

export type WorkoutRouteDependencies = {
  workoutRepository?: WorkoutRepository;
  personalRecordRepository?: PersonalRecordRepository;
  rankingRepository?: RankingRepository;
};

export function registerWorkoutRoutes(
  app: Express,
  config: AppConfig,
  dependencies: WorkoutRouteDependencies = {}
): void {
  const repository = dependencies.workoutRepository ?? new PrismaWorkoutRepository(prisma);
  const personalRecordRepository =
    dependencies.personalRecordRepository ?? new PrismaPersonalRecordRepository(prisma);
  const rankingRepository = dependencies.rankingRepository ?? new PrismaRankingRepository(prisma);
  const service = new WorkoutService(
    repository,
    new PersonalRecordService(personalRecordRepository, new RankingService(rankingRepository))
  );
  const auth = requireAuth(config);

  app.post(
    "/v1/workouts",
    auth,
    validateBody(createWorkoutSchema),
    asyncHandler(async (request: Request, response: Response) => {
      const workout = await service.createWorkout(request.auth!.userId, request.body);
      response.status(201).json({ workout });
    })
  );

  app.get(
    "/v1/workouts",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const workouts = await service.findHistory(request.auth!.userId);
      response.status(200).json({ workouts });
    })
  );

  app.get(
    "/v1/workouts/:id",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const workout = await service.findWorkout(request.auth!.userId, requireParam(request.params.id, "workout_id_required"));
      response.status(200).json({ workout });
    })
  );

  app.patch(
    "/v1/workouts/:id",
    auth,
    validateBody(updateWorkoutSchema),
    asyncHandler(async (request: Request, response: Response) => {
      const workout = await service.updateWorkout(
        request.auth!.userId,
        requireParam(request.params.id, "workout_id_required"),
        request.body
      );
      response.status(200).json({ workout });
    })
  );

  app.delete(
    "/v1/workouts/:id",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      await service.deleteWorkout(request.auth!.userId, requireParam(request.params.id, "workout_id_required"));
      response.status(204).send();
    })
  );

  app.post(
    "/v1/workouts/:id/exercises",
    auth,
    validateBody(addWorkoutExerciseSchema),
    asyncHandler(async (request: Request, response: Response) => {
      const workout = await service.addExercise(
        request.auth!.userId,
        requireParam(request.params.id, "workout_id_required"),
        request.body
      );
      response.status(201).json({ workout });
    })
  );

  app.patch(
    "/v1/workouts/:id/exercises/:exerciseId",
    auth,
    validateBody(updateWorkoutExerciseSchema),
    asyncHandler(async (request: Request, response: Response) => {
      const workout = await service.updateExercise(
        request.auth!.userId,
        requireParam(request.params.id, "workout_id_required"),
        requireParam(request.params.exerciseId, "workout_exercise_id_required"),
        request.body
      );
      response.status(200).json({ workout });
    })
  );

  app.delete(
    "/v1/workouts/:id/exercises/:exerciseId",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const workout = await service.removeExercise(
        request.auth!.userId,
        requireParam(request.params.id, "workout_id_required"),
        requireParam(request.params.exerciseId, "workout_exercise_id_required")
      );
      response.status(200).json({ workout });
    })
  );

  app.post(
    "/v1/workouts/:id/sets",
    auth,
    validateBody(addWorkoutSetSchema),
    asyncHandler(async (request: Request, response: Response) => {
      const workout = await service.addSet(
        request.auth!.userId,
        requireParam(request.params.id, "workout_id_required"),
        request.body
      );
      response.status(201).json({ workout });
    })
  );

  app.patch(
    "/v1/workouts/:id/sets/:setId",
    auth,
    validateBody(updateWorkoutSetSchema),
    asyncHandler(async (request: Request, response: Response) => {
      const workout = await service.updateSet(
        request.auth!.userId,
        requireParam(request.params.id, "workout_id_required"),
        requireParam(request.params.setId, "workout_set_id_required"),
        request.body
      );
      response.status(200).json({ workout });
    })
  );

  app.delete(
    "/v1/workouts/:id/sets/:setId",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const workout = await service.deleteSet(
        request.auth!.userId,
        requireParam(request.params.id, "workout_id_required"),
        requireParam(request.params.setId, "workout_set_id_required")
      );
      response.status(200).json({ workout });
    })
  );
}

function requireParam(value: string | string[] | undefined, code: string): string {
  if (!value || Array.isArray(value)) {
    throw new AppError(400, code, "Required route parameter is missing.");
  }

  return value;
}
