import type { Express, Request, Response } from "express";

import type { AppConfig } from "../../config/env.js";
import { requireAuth } from "../auth-profile/auth.middleware.js";
import { AppError } from "../../shared/errors/app-error.js";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { prisma } from "../../shared/prisma/client.js";
import { PrismaRankingRepository, type RankingRepository } from "./ranking.repository.js";
import { rankingQuerySchema } from "./ranking.schemas.js";
import { RankingService } from "./ranking.service.js";

export type RankingRouteDependencies = {
  rankingRepository?: RankingRepository;
};

export function registerRankingRoutes(
  app: Express,
  config: AppConfig,
  dependencies: RankingRouteDependencies = {}
): void {
  const repository = dependencies.rankingRepository ?? new PrismaRankingRepository(prisma);
  const service = new RankingService(repository);
  const auth = requireAuth(config);

  app.get(
    "/v1/rankings",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const filters = rankingQuerySchema.parse(request.query);
      const leaderboards = await service.findOverallLeaderboard(request.auth!.userId, filters);
      response.status(200).json({ leaderboards });
    })
  );

  app.get(
    "/v1/rankings/me",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const rankings = await service.findMyRanks(request.auth!.userId);
      response.status(200).json({ rankings });
    })
  );

  app.get(
    "/v1/rankings/me/:exerciseId",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const exerciseId = requireExerciseId(request.params.exerciseId);
      const ranking = await service.findMyExerciseRank(request.auth!.userId, exerciseId);
      response.status(200).json({ ranking });
    })
  );

  app.get(
    "/v1/rankings/:exerciseId",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const exerciseId = requireExerciseId(request.params.exerciseId);
      const filters = rankingQuerySchema.parse(request.query);
      const leaderboard = await service.findExerciseLeaderboard(request.auth!.userId, exerciseId, filters);
      response.status(200).json({ leaderboard });
    })
  );
}

function requireExerciseId(value: string | string[] | undefined): string {
  if (!value || Array.isArray(value)) {
    throw new AppError(400, "exercise_id_required", "Exercise id is required.");
  }

  return value;
}
