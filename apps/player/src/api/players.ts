import { http } from './client';

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

interface PlayBody {
  query: string;
  requestedBy?: string;
  groupName?: string;
}

export const getState = (playerId: number) =>
  http.get<PlayerState>(`/players/${playerId}/state`);

export const play = (playerId: number, data: PlayBody) =>
  http.post(`/players/${playerId}/play`, data);

export const pause = (playerId: number) =>
  http.post(`/players/${playerId}/pause`);

export const resume = (playerId: number) =>
  http.post(`/players/${playerId}/resume`);

export const stop = (playerId: number) =>
  http.post(`/players/${playerId}/stop`);

export const skip = (playerId: number) =>
  http.post(`/players/${playerId}/skip`);

export const setVolume = (playerId: number, volume: number) =>
  http.post(`/players/${playerId}/volume`, { volume });

export const getQueue = (playerId: number) =>
  http.get<QueueItem[]>(`/players/${playerId}/queue`);

export const addToQueue = (playerId: number, data: PlayBody) =>
  http.post(`/players/${playerId}/queue`, data);

export const removeFromQueue = (playerId: number, itemId: number) =>
  http.delete(`/players/${playerId}/queue/${itemId}`);

export const clearQueue = (playerId: number) =>
  http.delete(`/players/${playerId}/queue`);

export const videoEnded = (playerId: number) =>
  http.post(`/players/${playerId}/events/ended`);

export const playFromQueue = (playerId: number, itemId: number) =>
  http.post(`/players/${playerId}/play-from-queue`, { itemId });
