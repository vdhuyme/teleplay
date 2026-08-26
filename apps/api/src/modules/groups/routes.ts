import { Router } from "express";
import { validate } from "../../middleware/validation";
import {
  playRequestSchema,
  volumeRequestSchema,
} from "../../core/schemas/player.js";
import * as ctrl from "./controller";

const router = Router();

router.get("/", ctrl.list);
router.get("/:groupId", ctrl.get);
router.get("/:groupId/queue", ctrl.queue);
router.get("/:groupId/history", ctrl.history);
router.delete("/:groupId", ctrl.remove);
router.post("/:groupId/play", validate(playRequestSchema), ctrl.play);
router.post("/:groupId/pause", ctrl.pause);
router.post("/:groupId/resume", ctrl.resume);
router.post("/:groupId/stop", ctrl.stop);
router.post("/:groupId/skip", ctrl.skip);
router.post("/:groupId/volume", validate(volumeRequestSchema), ctrl.setVolume);

export default router;
