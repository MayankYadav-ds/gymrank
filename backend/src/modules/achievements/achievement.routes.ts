import type { Express, Request, Response } from "express";

import type { AppConfig } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { prisma } from "../../shared/prisma/client.js";
import { requireAuth } from "../auth-profile/auth.middleware.js";
import { PrismaAchievementRepository, type AchievementRepository } from "./achievement.repository.js";
import { AchievementService } from "./achievement.service.js";

export type AchievementRouteDependencies = {
  achievementRepository?: AchievementRepository;
};

export function registerAchievementRoutes(
  app: Express,
  config: AppConfig,
  dependencies: AchievementRouteDependencies = {}
): void {
  const repository = dependencies.achievementRepository ?? new PrismaAchievementRepository(prisma);
  const service = new AchievementService(repository);
  const auth = requireAuth(config);

  app.get(
    "/v1/achievements",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const achievements = await service.findAll(request.auth!.userId);
      response.status(200).json({ achievements });
    })
  );

  app.get(
    "/v1/achievements/unlocked",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const unlocked = await service.findUnlocked(request.auth!.userId);
      response.status(200).json({ unlocked });
    })
  );

  app.get(
    "/v1/achievements/progress",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const progress = await service.getProgress(request.auth!.userId);
      response.status(200).json({ progress });
    })
  );

  app.get(
    "/v1/achievements/:id",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const achievementId = request.params.id;

      if (!achievementId || Array.isArray(achievementId)) {
        throw new AppError(400, "achievement_id_required", "Achievement id is required.");
      }

      const achievement = await service.findDetail(request.auth!.userId, achievementId);
      response.status(200).json({ achievement });
    })
  );
}
