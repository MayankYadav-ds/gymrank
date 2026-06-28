import type { Express, Request, Response } from "express";

import type { AppConfig } from "../../config/env.js";
import { requireAuth } from "../auth-profile/auth.middleware.js";
import { AppError } from "../../shared/errors/app-error.js";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { prisma } from "../../shared/prisma/client.js";
import { OverloadService } from "./overload.service.js";
import { PrismaOverloadRepository, type OverloadRepository } from "./overload.repository.js";

export type OverloadRouteDependencies = {
  overloadRepository?: OverloadRepository;
};

export function registerOverloadRoutes(
  app: Express,
  config: AppConfig,
  dependencies: OverloadRouteDependencies = {}
): void {
  const repository = dependencies.overloadRepository ?? new PrismaOverloadRepository(prisma);
  const service = new OverloadService(repository);
  const auth = requireAuth(config);

  app.get(
    "/v1/overload/recommendations",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const recommendations = await service.findRecommendations(request.auth!.userId);
      response.status(200).json({ recommendations });
    })
  );

  app.get(
    "/v1/overload/:exerciseId",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const exerciseId = request.params.exerciseId;

      if (!exerciseId || Array.isArray(exerciseId)) {
        throw new AppError(400, "exercise_id_required", "Exercise id is required.");
      }

      const recommendation = await service.findRecommendation(request.auth!.userId, exerciseId);
      response.status(200).json(recommendation);
    })
  );
}
