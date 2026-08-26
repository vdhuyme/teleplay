import { Request, Response } from "express";
import * as groupService from "./service";
import * as playerService from "../players/service";

export async function list(_req: Request, res: Response) {
  const groups = await groupService.list();

  res.json(groups);
}

export async function get(req: Request, res: Response) {
  const groupId = Number(req.params.groupId);
  const group = await groupService.get(groupId);

  res.json(group);
}

export async function queue(req: Request, res: Response) {
  const groupId = Number(req.params.groupId);
  const queue = await groupService.queue(groupId);

  res.json(queue);
}

export async function history(req: Request, res: Response) {
  const groupId = Number(req.params.groupId);
  const limit = parseInt(req.query.limit as string) || 20;
  const history = await groupService.history(groupId, limit);

  res.json(history);
}

export async function remove(req: Request, res: Response) {
  const groupId = Number(req.params.groupId);
  await groupService.remove(groupId);

  res.json({ success: true });
}

export async function play(req: Request, res: Response) {
  const groupId = Number(req.params.groupId);
  const { query, requestedBy, groupName } = req.body;
  const video = await playerService.play(
    groupId,
    query,
    requestedBy,
    groupName,
  );

  res.json(video);
}

export async function pause(req: Request, res: Response) {
  const groupId = Number(req.params.groupId);
  await playerService.pause(groupId);

  res.json({ success: true });
}

export async function resume(req: Request, res: Response) {
  const groupId = Number(req.params.groupId);
  await playerService.resume(groupId);

  res.json({ success: true });
}

export async function stop(req: Request, res: Response) {
  const groupId = Number(req.params.groupId);
  await playerService.stop(groupId);

  res.json({ success: true });
}

export async function skip(req: Request, res: Response) {
  const groupId = Number(req.params.groupId);
  await playerService.skip(groupId);

  res.json({ success: true });
}

export async function setVolume(req: Request, res: Response) {
  const groupId = Number(req.params.groupId);
  const { volume } = req.body;
  await playerService.setVolume(groupId, volume);

  res.json({ success: true });
}
