import { request } from "./client";

export interface PlayerState {
  id: number;
  name: string | null;
  status: string;
  videoId: string | null;
  title: string | null;
  thumbnail: string | null;
  duration: number | null;
  position: number;
  volume: number;
  requestedBy: string | null;
}

export interface QueueItem {
  id: number;
  groupId: number;
  videoId: string;
  title: string;
  thumbnail: string;
  duration: number;
  votes: number;
  requestedBy: string | null;
}

export function getState(playerId: number) {
  return request<PlayerState>(`/players/${playerId}/state`);
}

export function play(playerId: number, data: {
  query: string;
  requestedBy?: string;
  groupName?: string;
}) {
  return request(`/players/${playerId}/play`, {
    method: "POST",
    body: data,
  });
}

export function pause(playerId: number) {
  return request(`/players/${playerId}/pause`, { method: "POST" });
}

export function resume(playerId: number) {
  return request(`/players/${playerId}/resume`, { method: "POST" });
}

export function stop(playerId: number) {
  return request(`/players/${playerId}/stop`, { method: "POST" });
}

export function skip(playerId: number) {
  return request(`/players/${playerId}/skip`, { method: "POST" });
}

export function setVolume(playerId: number, volume: number) {
  return request(`/players/${playerId}/volume`, {
    method: "POST",
    body: { volume },
  });
}

export function getQueue(playerId: number) {
  return request<QueueItem[]>(`/players/${playerId}/queue`);
}

export function addToQueue(playerId: number, data: {
  query: string;
  requestedBy?: string;
  groupName?: string;
}) {
  return request(`/players/${playerId}/queue`, {
    method: "POST",
    body: data,
  });
}

export function removeFromQueue(playerId: number, itemId: number) {
  return request(`/players/${playerId}/queue/${itemId}`, { method: "DELETE" });
}

export function clearQueue(playerId: number) {
  return request(`/players/${playerId}/queue`, { method: "DELETE" });
}

export function videoEnded(playerId: number) {
  return request(`/players/${playerId}/events/ended`, { method: "POST" });
}
