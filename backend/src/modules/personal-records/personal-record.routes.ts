import type { Express, Request, Response } from "express";

import type { AppConfig } from "../../config/env.js";
import { requireAuth } from "../auth-profile/auth.middleware.js";
import { AppError } from "../../shared/errors/app-error.js";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { prisma } from "../../shared/prisma/client.js";
import {
  PrismaPersonalRecordRepository,
  type PersonalRecordRepository
} from "./personal-record.repository.js";
import { PersonalRecordService } from "./personal-record.service.js";

export type PersonalRecordRouteDependencies = {
  personalRecordRepository?: PersonalRecordRepository;
};

export function registerPersonalRecordRoutes(
  app: Express,
  config: AppConfig,
  dependencies: PersonalRecordRouteDependencies = {}
): void {
  const repository = dependencies.personalRecordRepository ?? new PrismaPersonalRecordRepository(prisma);
  const service = new PersonalRecordService(repository);
  const auth = requireAuth(config);

  app.get(
    "/v1/personal-records",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const records = await service.findCurrentByUser(request.auth!.userId);
      response.status(200).json({ records });
    })
  );

  app.get(
    "/v1/personal-records/:exerciseId",
    auth,
    asyncHandler(async (request: Request, response: Response) => {
      const exerciseId = request.params.exerciseId;

      if (!exerciseId || Array.isArray(exerciseId)) {
        throw new AppError(400, "exercise_id_required", "Exercise id is required.");
      }

      const records = await service.findHistoryByExercise(request.auth!.userId, exerciseId);
      response.status(200).json({ records });
    })
  );
}
