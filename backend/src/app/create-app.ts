import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";

import { registerHealthRoutes } from "./health.routes.js";
import { registerModuleRoutes } from "./module-routes.js";
import type { AppConfig } from "../config/env.js";
import {
  registerAuthProfileRoutes,
  type AuthProfileRouteDependencies
} from "../modules/auth-profile/auth-profile.routes.js";
import {
  registerExerciseRoutes,
  type ExerciseRouteDependencies
} from "../modules/exercises/exercise.routes.js";
import {
  registerWorkoutRoutes,
  type WorkoutRouteDependencies
} from "../modules/workouts/workout.routes.js";
import { errorHandler } from "../shared/errors/error-handler.js";

export type AppDependencies = AuthProfileRouteDependencies & ExerciseRouteDependencies & WorkoutRouteDependencies;

export function createApp(config: AppConfig, dependencies: AppDependencies = {}): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: "1mb" }));

  if (config.nodeEnv !== "test") {
    app.use(morgan("dev"));
  }

  registerHealthRoutes(app, config);
  registerModuleRoutes(app);
  registerAuthProfileRoutes(app, config, dependencies);
  registerExerciseRoutes(app, dependencies);
  registerWorkoutRoutes(app, config, dependencies);
  app.use(errorHandler);

  return app;
}
