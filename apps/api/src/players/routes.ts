import { Router, type Router as RouterType } from 'express';
import validate from 'express-zod-safe';
import z from 'zod';
import {
  playFromQueueSchema,
  playRequestSchema,
  positionRequestSchema,
  volumeRequestSchema,
} from '../schemas/players';
import * as playerService from './services';
import { searchQuerySchema } from '../schemas';
import { asyncHandler } from '../middleware/async-handler';
import { noContent, ok } from '../core';

const router: RouterType = Router();

router.get(
  '/:playerId/state',
  validate({ params: { playerId: z.coerce.number().int() } }),
  asyncHandler(async (req) =>
    ok(await playerService.first(req.params.playerId)),
  ),
);

router.post(
  '/:playerId/play',
  validate({
    params: { playerId: z.coerce.number().int() },
    body: playRequestSchema,
  }),
  asyncHandler(async (req) => {
    const { playerId } = req.params;
    const { query, requestedBy, groupName } = req.body;

    return ok(
      await playerService.play(playerId, query, requestedBy, groupName),
    );
  }),
);

router.post(
  '/:playerId/pause',
  validate({ params: { playerId: z.coerce.number().int() } }),
  asyncHandler(async (req) => {
    await playerService.pause(req.params.playerId);

    return noContent();
  }),
);

router.post(
  '/:playerId/resume',
  validate({ params: { playerId: z.coerce.number().int() } }),
  asyncHandler(async (req) => {
    await playerService.resume(req.params.playerId);

    return noContent();
  }),
);

router.post(
  '/:playerId/stop',
  validate({ params: { playerId: z.coerce.number().int() } }),
  asyncHandler(async (req) => {
    await playerService.stop(req.params.playerId);

    return noContent();
  }),
);

router.post(
  '/:playerId/skip',
  validate({ params: { playerId: z.coerce.number().int() } }),
  asyncHandler(async (req) => {
    await playerService.skip(req.params.playerId);

    return noContent();
  }),
);

router.post(
  '/:playerId/play-from-queue',
  validate({
    params: { playerId: z.coerce.number().int() },
    body: playFromQueueSchema,
  }),
  asyncHandler(async (req) => {
    await playerService.playFromQueue(req.params.playerId, req.body.itemId);

    return noContent();
  }),
);

router.post(
  '/:playerId/events/ended',
  validate({ params: { playerId: z.coerce.number().int() } }),
  asyncHandler(async (req) => {
    await playerService.videoEnded(req.params.playerId);

    return noContent();
  }),
);

router.post(
  '/:playerId/volume',
  validate({
    params: { playerId: z.coerce.number().int() },
    body: volumeRequestSchema,
  }),
  asyncHandler(async (req) => {
    const { volume } = req.body;
    const { playerId } = req.params;

    await playerService.setVolume(playerId, volume);

    return noContent();
  }),
);

router.post(
  '/:playerId/position',
  validate({
    params: { playerId: z.coerce.number().int() },
    body: positionRequestSchema,
  }),
  asyncHandler(async (req) => {
    const { position } = req.body;
    const { playerId } = req.params;

    await playerService.setPosition(playerId, position);

    return noContent();
  }),
);

router.get(
  '/:playerId/queue',
  validate({ params: { playerId: z.coerce.number().int() } }),
  asyncHandler(async (req) =>
    ok(await playerService.getQueue(req.params.playerId)),
  ),
);

router.post(
  '/:playerId/search',
  validate({
    params: { playerId: z.coerce.number().int() },
    body: searchQuerySchema,
  }),
  asyncHandler(async (req) => ok(await playerService.search(req.body.query))),
);

router.get(
  '/trending',
  asyncHandler(async () => ok(await playerService.getTrending())),
);

router.get(
  '/categories',
  asyncHandler(async () => ok(await playerService.getCategories())),
);

router.post(
  '/:playerId/queue',
  validate({
    params: { playerId: z.coerce.number().int() },
    body: playRequestSchema,
  }),
  asyncHandler(async (req) => {
    const { playerId } = req.params;
    const { query, requestedBy, groupName } = req.body;

    return ok(
      await playerService.addToQueue(playerId, query, requestedBy, groupName),
    );
  }),
);

router.delete(
  '/:playerId/queue/:itemId',
  validate({
    params: {
      playerId: z.coerce.number().int(),
      itemId: z.coerce.number().int(),
    },
  }),
  asyncHandler(async (req) => {
    await playerService.removeFromQueue(req.params.playerId, req.params.itemId);

    return noContent();
  }),
);

router.delete(
  '/:playerId/queue',
  validate({ params: { playerId: z.coerce.number().int() } }),
  asyncHandler(async (req) => {
    await playerService.clearQueue(req.params.playerId);

    return noContent();
  }),
);

export default router;
