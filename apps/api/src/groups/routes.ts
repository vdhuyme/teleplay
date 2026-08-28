import { Router, type Router as RouterType } from 'express';
import validate from 'express-zod-safe';
import z from 'zod';
import * as groupService from './services';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../constants/pagination';
import { paginationQuerySchema } from '../schemas';
import { asyncHandler } from '../middleware/async-handler';
import { noContent, ok } from '../core';

const router: RouterType = Router();

router.get(
  '/',
  validate({ query: paginationQuerySchema }),
  asyncHandler(async (req) => {
    const page = Number(req.query.page ?? DEFAULT_PAGE);
    const limit = Number(req.query.limit ?? DEFAULT_LIMIT);

    return ok(await groupService.list(page, limit));
  }),
);

router.get(
  '/:groupId',
  validate({ params: { groupId: z.coerce.number().int() } }),
  asyncHandler(async (req) => {
    const { groupId } = req.params;

    return ok(await groupService.get(groupId));
  }),
);

router.get(
  '/:groupId/queue',
  validate({ params: { groupId: z.coerce.number().int() } }),
  asyncHandler(async (req) => {
    const { groupId } = req.params;

    return ok(await groupService.queue(groupId));
  }),
);

router.get(
  '/:groupId/history',
  validate({
    params: { groupId: z.coerce.number().int() },
    query: paginationQuerySchema,
  }),
  asyncHandler(async (req) => {
    const { groupId } = req.params;
    const page = Number(req.query.page ?? DEFAULT_PAGE);
    const limit = Number(req.query.limit ?? DEFAULT_LIMIT);

    return ok(await groupService.history(groupId, page, limit));
  }),
);

router.delete(
  '/:groupId',
  validate({ params: { groupId: z.coerce.number().int() } }),
  asyncHandler(async (req) => {
    await groupService.remove(req.params.groupId);

    return noContent();
  }),
);

export default router;
