import type { Express, Request, Response } from "express";

import { v1Modules } from "../shared/constants/v1-modules.js";

export function registerModuleRoutes(app: Express): void {
  app.get("/v1/modules", (_request: Request, response: Response) => {
    response.status(200).json({
      modules: v1Modules
    });
  });
}
