import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../core';

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: {
      status: HTTP_STATUS.NOT_FOUND,
      message: `The requested resource ${req.originalUrl} was not found`,
      timestamp: new Date().toISOString(),
    },
  });
}
