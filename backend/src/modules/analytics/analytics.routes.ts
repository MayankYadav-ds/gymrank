import type { Express, Request, Response } from "express";

import type { AppConfig } from "../../config/env.js";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { prisma } from "../../shared/prisma/client.js";
import { requireAuth } from "../auth-profile/auth.middleware.js";
import { PrismaAnalyticsRepository, type AnalyticsRepository } from "./analytics.repository.js";
import { AnalyticsService } from "./analytics.service.js";

export type AnalyticsRouteDependencies = {
  analyticsRepository?: AnalyticsRepository;
};

export function registerAnalyticsRoutes(
  app: Express,
  config: AppConfig,
  dependencies: AnalyticsRouteDependencies = {}
): void {
  const repository = dependencies.analyticsRepository ?? new PrismaAnalyticsRepository(prisma);
  const service = new AnalyticsService(repository);
  const auth = requireAuth(config);

  app.get(
    "/v1/analytics/dashboard",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const dashboard = await service.getDashboard(request.auth!.userId);
      response.status(200).json({ dashboard });
    })
  );

  app.get(
    "/v1/analytics/strength",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const strength = await service.getStrength(request.auth!.userId);
      response.status(200).json({ strength });
    })
  );

  app.get(
    "/v1/analytics/volume",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const volume = await service.getVolume(request.auth!.userId);
      response.status(200).json({ volume });
    })
  );

  app.get(
    "/v1/analytics/consistency",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const consistency = await service.getConsistency(request.auth!.userId);
      response.status(200).json({ consistency });
    })
  );

  app.get(
    "/v1/analytics/bodyweight",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const bodyweight = await service.getBodyweight(request.auth!.userId);
      response.status(200).json({ bodyweight });
    })
  );

  app.get(
    "/v1/analytics/muscles",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const muscles = await service.getMuscleDistribution(request.auth!.userId);
      response.status(200).json({ muscles });
    })
  );
}
