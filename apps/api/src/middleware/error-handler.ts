import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../core/errors/index";
import { HTTP_STATUS_CODE } from "../utils/http-status";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });

    return;
  }

  if (err instanceof ZodError) {
    res.status(HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });

    return;
  }

  res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
}
