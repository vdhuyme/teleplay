import { Router } from "express";
import { validate } from "../../middleware/validation";
import {
  playRequestSchema,
  volumeRequestSchema,
} from "../../core/schemas/player";
import * as ctrl from "./controller";

const router = Router();

router.get("/:playerId/state", ctrl.getState);
router.post("/:playerId/play", validate(playRequestSchema), ctrl.play);
router.post("/:playerId/pause", ctrl.pause);
router.post("/:playerId/resume", ctrl.resume);
router.post("/:playerId/stop", ctrl.stop);
router.post("/:playerId/skip", ctrl.skip);
router.post("/:playerId/volume", validate(volumeRequestSchema), ctrl.setVolume);
router.get("/:playerId/queue", ctrl.getQueue);
router.post("/:playerId/queue", validate(playRequestSchema), ctrl.addToQueue);
router.delete("/:playerId/queue/:itemId", ctrl.removeFromQueue);
router.delete("/:playerId/queue", ctrl.clearQueue);
router.post("/:playerId/events/ended", ctrl.videoEnded);

export default router;
