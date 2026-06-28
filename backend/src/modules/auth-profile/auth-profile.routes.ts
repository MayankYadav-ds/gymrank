import type { Express, Request, Response } from "express";

import type { AppConfig } from "../../config/env.js";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { validateBody } from "../../shared/validation/validate-request.js";
import { PrismaAuthProfileRepository, type AuthProfileRepository } from "./auth-profile.repository.js";
import { loginSchema, registerSchema, updateProfileSchema } from "./auth-profile.schemas.js";
import { AuthProfileService } from "./auth-profile.service.js";
import { requireAuth } from "./auth.middleware.js";
import { prisma } from "../../shared/prisma/client.js";

export type AuthProfileRouteDependencies = {
  authProfileRepository?: AuthProfileRepository;
};

export function registerAuthProfileRoutes(
  app: Express,
  config: AppConfig,
  dependencies: AuthProfileRouteDependencies = {}
): void {
  const repository = dependencies.authProfileRepository ?? new PrismaAuthProfileRepository(prisma);
  const service = new AuthProfileService(repository, config);

  app.post(
    "/v1/auth/register",
    validateBody(registerSchema),
    asyncHandler(async (request: Request, response: Response) => {
      const result = await service.register(request.body);
      response.status(201).json(result);
    })
  );

  app.post(
    "/v1/auth/login",
    validateBody(loginSchema),
    asyncHandler(async (request: Request, response: Response) => {
      const result = await service.login(request.body);
      response.status(200).json(result);
    })
  );

  app.get(
    "/v1/profile",
    requireAuth(config),
    asyncHandler(async (request: Request, response: Response) => {
      const result = await service.getProfile(request.auth!.userId);
      response.status(200).json(result);
    })
  );

  app.patch(
    "/v1/profile",
    requireAuth(config),
    validateBody(updateProfileSchema),
    asyncHandler(async (request: Request, response: Response) => {
      const result = await service.updateProfile(request.auth!.userId, request.body);
      response.status(200).json(result);
    })
  );
}
