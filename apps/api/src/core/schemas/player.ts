import { z } from "zod";

export const playRequestSchema = z.object({
  query: z.string().min(1).max(200),
  requestedBy: z.string().max(255).optional(),
  groupName: z.string().max(255).optional(),
});

export const searchRequestSchema = z.object({
  query: z.string().min(1).max(200),
});

export const volumeRequestSchema = z.object({
  volume: z.number().int().min(0).max(100),
});
