import { Request, Response, NextFunction } from "express";
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
        timestamp: new Date(),
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
