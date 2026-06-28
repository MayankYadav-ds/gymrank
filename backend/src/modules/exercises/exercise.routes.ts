import type { Express, Request, Response } from "express";

import { asyncHandler } from "../../shared/http/async-handler.js";
import { CatalogExerciseRepository, type ExerciseRepository } from "./exercise.repository.js";
import { listExercisesQuerySchema } from "./exercise.schemas.js";
import { ExerciseService } from "./exercise.service.js";

export type ExerciseRouteDependencies = {
  exerciseRepository?: ExerciseRepository;
};

export function registerExerciseRoutes(
  app: Express,
  dependencies: ExerciseRouteDependencies = {}
): void {
  const repository = dependencies.exerciseRepository ?? new CatalogExerciseRepository();
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
      const exercise = await service.getExercise(request.params.id);
      response.status(200).json({ exercise });
    })
  );
}
