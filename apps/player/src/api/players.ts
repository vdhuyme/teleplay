import { ApiResponse } from '@/types';
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

export interface SearchResult {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: number;
  channelTitle?: string;
}

export const getState = (playerId: number) =>
  http.get<ApiResponse<PlayerState>>(`/players/${playerId}/state`);

export const play = (playerId: number, data: PlayBody) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/play`, data);

export const pause = (playerId: number) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/pause`);

export const resume = (playerId: number) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/resume`);

export const stop = (playerId: number) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/stop`);

export const skip = (playerId: number) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/skip`);

export const setVolume = (playerId: number, volume: number) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/volume`, { volume });

export const setPosition = (playerId: number, position: number) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/position`, { position });

export const getQueue = (playerId: number) =>
  http.get<ApiResponse<QueueItem[]>>(`/players/${playerId}/queue`);

export const addToQueue = (playerId: number, data: PlayBody) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/queue`, data);

export const removeFromQueue = (playerId: number, itemId: number) =>
  http.delete<ApiResponse<null>>(`/players/${playerId}/queue/${itemId}`);

export const clearQueue = (playerId: number) =>
  http.delete<ApiResponse<null>>(`/players/${playerId}/queue`);

export const videoEnded = (playerId: number) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/events/ended`);

export const playFromQueue = (playerId: number, itemId: number) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/play-from-queue`, {
    itemId,
  });

export const search = (playerId: number, query: string) =>
  http.post<ApiResponse<SearchResult[]>>(`/players/${playerId}/search`, {
    query,
  });

export const getTrending = () =>
  http.get<ApiResponse<SearchResult[]>>('/players/trending');

export const getCategories = () =>
  http.get<ApiResponse<{ id: string; name: string }[]>>('/players/categories');
