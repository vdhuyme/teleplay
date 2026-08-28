import z from 'zod';

export const searchQuerySchema = z.object({
  query: z.string().min(1).max(200),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
