import { Request, Response } from "express";
import * as playerService from "./service";

export async function getState(req: Request, res: Response) {
  const playerId = Number(req.params.playerId);
  const state = await playerService.getState(playerId);

  res.json(state);
}

export async function play(req: Request, res: Response) {
  const playerId = Number(req.params.playerId);
  const { query, requestedBy, groupName } = req.body;
  const video = await playerService.play(
    playerId,
    query,
    requestedBy,
    groupName,
  );

  res.json(video);
}

export async function pause(req: Request, res: Response) {
  const playerId = Number(req.params.playerId);
  await playerService.pause(playerId);

  res.json({ success: true });
}

export async function resume(req: Request, res: Response) {
  const playerId = Number(req.params.playerId);
  await playerService.resume(playerId);

  res.json({ success: true });
}

export async function stop(req: Request, res: Response) {
  const playerId = Number(req.params.playerId);
  await playerService.stop(playerId);

  res.json({ success: true });
}

export async function skip(req: Request, res: Response) {
  const playerId = Number(req.params.playerId);
  await playerService.skip(playerId);

  res.json({ success: true });
}

export async function videoEnded(req: Request, res: Response) {
  const playerId = Number(req.params.playerId);
  await playerService.videoEnded(playerId);

  res.json({ success: true });
}

export async function setVolume(req: Request, res: Response) {
  const playerId = Number(req.params.playerId);
  const { volume } = req.body;
  await playerService.setVolume(playerId, volume);

  res.json({ success: true });
}

export async function getQueue(req: Request, res: Response) {
  const playerId = Number(req.params.playerId);
  const queue = await playerService.getQueue(playerId);

  res.json(queue);
}

export async function addToQueue(req: Request, res: Response) {
  const playerId = Number(req.params.playerId);
  const { query, requestedBy, groupName } = req.body;
  const video = await playerService.addToQueue(
    playerId,
    query,
    requestedBy,
    groupName,
  );

  res.json(video);
}

export async function removeFromQueue(req: Request, res: Response) {
  const playerId = Number(req.params.playerId);
  const itemId = Number(req.params.itemId);
  await playerService.removeFromQueue(playerId, itemId);

  res.json({ success: true });
}

export async function clearQueue(req: Request, res: Response) {
  const playerId = Number(req.params.playerId);
  await playerService.clearQueue(playerId);

  res.json({ success: true });
}
