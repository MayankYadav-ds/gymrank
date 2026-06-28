import type { Express, Request, Response } from "express";

import { AppError } from "../../shared/errors/app-error.js";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { prisma } from "../../shared/prisma/client.js";
import { PrismaExerciseRepository, type ExerciseRepository } from "./exercise.repository.js";
import { listExercisesQuerySchema } from "./exercise.schemas.js";
import { ExerciseService } from "./exercise.service.js";

export type ExerciseRouteDependencies = {
  exerciseRepository?: ExerciseRepository;
};

export function registerExerciseRoutes(
  app: Express,
  dependencies: ExerciseRouteDependencies = {}
): void {
  const repository = dependencies.exerciseRepository ?? new PrismaExerciseRepository(prisma);
  const service = new ExerciseService(repository);

  app.get(
    "/v1/exercises",
    asyncHandler(async (request: Request, response: Response) => {
      const query = listExercisesQuerySchema.parse(request.query);
      const exercises = await service.listExercises(query);
      response.status(200).json({ exercises });
    })
  );

  app.get(
    "/v1/exercises/:id",
    asyncHandler(async (request: Request, response: Response) => {
      const exerciseId = request.params.id;

      if (!exerciseId || Array.isArray(exerciseId)) {
        throw new AppError(400, "exercise_id_required", "Exercise id is required.");
      }

      const exercise = await service.getExercise(exerciseId);
      response.status(200).json({ exercise });
    })
  );
}
