import { createHttpClient } from '@teleplay/core';
import { App } from '@teleplay/core';
import {
  Paginated,
  PlayRequest,
  PlayerState,
  QueueItem,
  SearchResult,
  VolumeRequest,
} from '../type';

const http = createHttpClient({ baseUrl: App.getOrThrow('API_URL') });

export const getState = (playerId: string) =>
  http.get<PlayerState | null>(`/players/${playerId}/state`);

export const play = (playerId: string, data: PlayRequest) =>
  http.post<SearchResult>(`/players/${playerId}/play`, data);

export const pause = (playerId: string) =>
  http.post(`/players/${playerId}/pause`);

export const resume = (playerId: string) =>
  http.post(`/players/${playerId}/resume`);

export const stop = (playerId: string) =>
  http.post(`/players/${playerId}/stop`);

export const skip = (playerId: string) =>
  http.post(`/players/${playerId}/skip`);

export const getQueue = (playerId: string) =>
  http.get<QueueItem[]>(`/players/${playerId}/queue`);

export const search = (playerId: string, query: string) =>
  http.post<SearchResult[]>(`/players/${playerId}/search`, { query });

export const getTrending = () => http.get<SearchResult[]>(`/players/trending`);

export const getCategories = () =>
  http.get<{ id: string; title: string }[]>(`/players/categories`);

export const addToQueue = (playerId: string, data: PlayRequest) =>
  http.post(`/players/${playerId}/queue`, data);

export const removeFromQueue = (playerId: string, itemId: number) =>
  http.delete(`/players/${playerId}/queue/${itemId}`);

export const clearQueue = (playerId: string) =>
  http.delete(`/players/${playerId}/queue`);

export const setVolume = (playerId: string, data: VolumeRequest) =>
  http.post(`/players/${playerId}/volume`, data);

export const getGroupHistory = async (
  groupId: string,
  limit = 10,
): Promise<{ videoId: string; title: string }[]> => {
  const result = await http.get<
    Paginated<{
      videoId: string;
      title: string;
    }>
  >(`/groups/${groupId}/history`, { params: { limit } });

  return result.data;
};
