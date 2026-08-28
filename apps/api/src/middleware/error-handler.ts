import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { HTTP_STATUS } from '../core';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const timestamp = Math.floor(Date.now() / 1000);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        timestamp,
      },
    });

    return;
  }

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp,
    },
  });
}
