import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { HttpResponse } from '../core';
import { tryCatch } from '@teleplay/core';

type Params = Record<string, string | string[]>;

type AsyncHandler<
  P = Params,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, unknown>,
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction,
) => Promise<HttpResponse>;

export function asyncHandler<
  P = Params,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, unknown>,
>(
  handler: AsyncHandler<P, ResBody, ReqBody, ReqQuery>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return async (req, res, next) => {
    const [err, response] = await tryCatch(() => handler(req, res, next));

    if (err) {
      return next(err);
    }

    return res.status(response.status).json(response as ResBody);
  };
}
