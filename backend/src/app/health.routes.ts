import type { Express, Request, Response } from "express";

import type { AppConfig } from "../config/env.js";

export function registerHealthRoutes(app: Express, config: AppConfig): void {
  app.get("/health", (_request: Request, response: Response) => {
    response.status(200).json({
      status: "ok",
      app: config.appName,
      environment: config.nodeEnv
    });
  });
}
