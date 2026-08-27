import { Router } from 'express';
import validate from 'express-zod-safe';
import z from 'zod';
import {
  playRequestSchema,
  volumeRequestSchema,
} from '../../core/schemas/player';
import { playerService } from '../players/index';
import * as groupService from './service';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../core/constants/pagination';

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const router = Router();

router.get('/', validate({ query: paginationQuery }), async (req, res) => {
  const page = req.query.page ?? DEFAULT_PAGE;
  const limit = req.query.limit ?? DEFAULT_LIMIT;

  res.json(await groupService.list(page, limit));
});

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
    query: paginationQuery,
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

router.post(
  '/:groupId/play',
  validate({
    params: { groupId: z.coerce.number().int() },
    body: playRequestSchema,
  }),
  async (req, res) => {
    const { query, groupName, requestedBy } = req.body;
    const { groupId } = req.params;

    const video = await playerService.play(
      groupId,
      query,
      requestedBy,
      groupName,
    );

    res.json(video);
  },
);

router.post(
  '/:groupId/pause',
  validate({ params: { groupId: z.coerce.number().int() } }),
  async (req, res) => {
    await playerService.pause(req.params.groupId);

    res.json({ success: true });
  },
);

router.post(
  '/:groupId/resume',
  validate({ params: { groupId: z.coerce.number().int() } }),
  async (req, res) => {
    await playerService.resume(req.params.groupId);

    res.json({ success: true });
  },
);

router.post(
  '/:groupId/stop',
  validate({ params: { groupId: z.coerce.number().int() } }),
  async (req, res) => {
    await playerService.stop(req.params.groupId);

    res.json({ success: true });
  },
);

router.post(
  '/:groupId/skip',
  validate({ params: { groupId: z.coerce.number().int() } }),
  async (req, res) => {
    await playerService.skip(req.params.groupId);

    res.json({ success: true });
  },
);

router.post(
  '/:groupId/volume',
  validate({
    params: { groupId: z.coerce.number().int() },
    body: volumeRequestSchema,
  }),
  async (req, res) => {
    const { volume } = req.body;
    const { groupId } = req.params;

    await playerService.setVolume(groupId, volume);

    res.json({ success: true });
  },
);

export default router;
