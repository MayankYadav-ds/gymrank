import jwt, { type SignOptions } from "jsonwebtoken";

import type { AppConfig } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import type { AuthenticatedUser } from "./auth-profile.types.js";

type AuthTokenPayload = {
  sub: string;
  email: string;
};

export function signAuthToken(user: AuthenticatedUser, config: AppConfig): string {
  const options: SignOptions = {
    subject: user.userId,
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"]
  };

  return jwt.sign({ email: user.email } satisfies Omit<AuthTokenPayload, "sub">, config.jwtSecret, options);
}

export function verifyAuthToken(token: string, config: AppConfig): AuthenticatedUser {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;

    if (!payload.sub || !payload.email) {
      throw new AppError(401, "invalid_auth_token", "Auth token is invalid.");
    }

    return {
      userId: payload.sub,
      email: payload.email
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(401, "invalid_auth_token", "Auth token is invalid.");
  }
}
