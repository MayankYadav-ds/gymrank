import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "./app-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        code: "validation_error",
        message: "Request validation failed.",
        details: error.flatten()
      }
    });
    return;
  }

  response.status(500).json({
    error: {
      code: "internal_server_error",
      message: "Something went wrong."
    }
  });
};
