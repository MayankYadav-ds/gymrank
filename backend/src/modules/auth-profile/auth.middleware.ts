import type { RequestHandler } from "express";

import type { AppConfig } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { verifyAuthToken } from "./auth-token.js";

export function requireAuth(config: AppConfig): RequestHandler {
  return (request, _response, next) => {
    const authorization = request.header("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      next(new AppError(401, "auth_required", "Authentication is required."));
      return;
    }

    const token = authorization.slice("Bearer ".length).trim();
    request.auth = verifyAuthToken(token, config);
    next();
  };
}
