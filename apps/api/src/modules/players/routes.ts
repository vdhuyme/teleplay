import { Router } from "express";
import validate from "express-zod-safe";
import z from "zod";
import {
  playRequestSchema,
  searchRequestSchema,
  volumeRequestSchema,
} from "../../core/schemas/player";
import * as playerService from "./service";

const router = Router();

router.get(
  "/:playerId/state",
  validate({ params: { playerId: z.coerce.number().int() } }),
  async (req, res) => {
    res.json(await playerService.getState(req.params.playerId));
  },
);

router.post(
  "/:playerId/play",
  validate({
    params: { playerId: z.coerce.number().int() },
    body: playRequestSchema,
  }),
  async (req, res) => {
    const { playerId } = req.params;
    const { query, requestedBy, groupName } = req.body;

    res.json(await playerService.play(playerId, query, requestedBy, groupName));
  },
);

router.post(
  "/:playerId/pause",
  validate({ params: { playerId: z.coerce.number().int() } }),
  async (req, res) => {
    await playerService.pause(req.params.playerId);

    res.json({ success: true });
  },
);

router.post(
  "/:playerId/resume",
  validate({ params: { playerId: z.coerce.number().int() } }),
  async (req, res) => {
    await playerService.resume(req.params.playerId);

    res.json({ success: true });
  },
);

router.post(
  "/:playerId/stop",
  validate({ params: { playerId: z.coerce.number().int() } }),
  async (req, res) => {
    await playerService.stop(req.params.playerId);

    res.json({ success: true });
  },
);

router.post(
  "/:playerId/skip",
  validate({ params: { playerId: z.coerce.number().int() } }),
  async (req, res) => {
    await playerService.skip(req.params.playerId);

    res.json({ success: true });
  },
);

router.post(
  "/:playerId/events/ended",
  validate({ params: { playerId: z.coerce.number().int() } }),
  async (req, res) => {
    await playerService.videoEnded(req.params.playerId);

    res.json({ success: true });
  },
);

router.post(
  "/:playerId/volume",
  validate({
    params: { playerId: z.coerce.number().int() },
    body: volumeRequestSchema,
  }),
  async (req, res) => {
    const { volume } = req.body;
    const { playerId } = req.params;

    await playerService.setVolume(playerId, volume);

    res.json({ success: true });
  },
);

router.get(
  "/:playerId/queue",
  validate({ params: { playerId: z.coerce.number().int() } }),
  async (req, res) => {
    res.json(await playerService.getQueue(req.params.playerId));
  },
);

router.post(
  "/:playerId/search",
  validate({
    params: { playerId: z.coerce.number().int() },
    body: searchRequestSchema,
  }),
  async (req, res) => {
    res.json(await playerService.search(req.body.query));
  },
);

router.post(
  "/:playerId/queue",
  validate({
    params: { playerId: z.coerce.number().int() },
    body: playRequestSchema,
  }),
  async (req, res) => {
    const { playerId } = req.params;
    const { query, requestedBy, groupName } = req.body;

    res.json(
      await playerService.addToQueue(playerId, query, requestedBy, groupName),
    );
  },
);

router.delete(
  "/:playerId/queue/:itemId",
  validate({
    params: {
      playerId: z.coerce.number().int(),
      itemId: z.coerce.number().int(),
    },
  }),
  async (req, res) => {
    await playerService.removeFromQueue(
      req.params.playerId,
      req.params.itemId,
    );

    res.json({ success: true });
  },
);

router.delete(
  "/:playerId/queue",
  validate({ params: { playerId: z.coerce.number().int() } }),
  async (req, res) => {
    await playerService.clearQueue(req.params.playerId);

    res.json({ success: true });
  },
);

export default router;
