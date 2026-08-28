import { z } from 'zod';

export const playRequestSchema = z.object({
  query: z.string().min(1).max(200),
  requestedBy: z.string().max(255).optional(),
  groupName: z.string().max(255).optional(),
});

export const playFromQueueSchema = z.object({
  itemId: z.number().int().positive(),
});

export const volumeRequestSchema = z.object({
  volume: z.number().int().min(0).max(100),
});

export const positionRequestSchema = z.object({
  position: z.number().int().min(0),
});
