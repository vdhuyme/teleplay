import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../utils';

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
    error: {
      code: 'NOT_FOUND',
      message: `The requested resource ${req.originalUrl} was not found`,
      timestamp: Math.floor(Date.now() / 1000),
    },
  });
}
