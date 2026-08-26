import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

type ValidationSource = "body" | "query" | "params";

export function validate(schema: z.ZodType, source: ValidationSource = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const value = req[source] ?? {};

    const result = schema.safeParse(value);

    if (!result.success) {
      next(result.error);
      return;
    }

    req[source] = result.data;
    next();
  };
}
