import { Router, type Router as RouterType } from 'express';
import validate from 'express-zod-safe';
import z from 'zod';
import * as groupService from './services';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../constants/pagination';
import { paginationQuerySchema } from '../schemas';

const router: RouterType = Router();

router.get(
  '/',
  validate({ query: paginationQuerySchema }),
  async (req, res) => {
    const page = req.query.page ?? DEFAULT_PAGE;
    const limit = req.query.limit ?? DEFAULT_LIMIT;

    res.json(await groupService.list(page, limit));
  },
);

router.get(
  '/:groupId',
  validate({ params: { groupId: z.coerce.number().int() } }),
  async (req, res) => {
    const { groupId } = req.params;

    res.json(await groupService.get(groupId));
  },
);

router.get(
  '/:groupId/queue',
  validate({ params: { groupId: z.coerce.number().int() } }),
  async (req, res) => {
    const { groupId } = req.params;

    res.json(await groupService.queue(groupId));
  },
);

router.get(
  '/:groupId/history',
  validate({
    params: { groupId: z.coerce.number().int() },
    query: paginationQuerySchema,
  }),
  async (req, res) => {
    const { groupId } = req.params;
    const page = req.query.page ?? DEFAULT_PAGE;
    const limit = req.query.limit ?? DEFAULT_LIMIT;

    res.json(await groupService.history(groupId, page, limit));
  },
);

router.delete(
  '/:groupId',
  validate({ params: { groupId: z.coerce.number().int() } }),
  async (req, res) => {
    await groupService.remove(req.params.groupId);

    res.json({ success: true });
  },
);

export default router;
