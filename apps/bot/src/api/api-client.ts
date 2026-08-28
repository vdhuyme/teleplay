import { httpClient } from '@teleplay/core';
import { App } from '@teleplay/core';
import {
  Paginated,
  PlayRequest,
  PlayerState,
  QueueItem,
  SearchResult,
  VolumeRequest,
} from '../type';
import { ApiResponse, HistoryItem } from './type';

const http = httpClient({ baseUrl: App.getOrThrow('API_URL') });

export const getState = (playerId: string) =>
  http.get<ApiResponse<PlayerState | null>>(`/players/${playerId}/state`);

export const play = (playerId: string, data: PlayRequest) =>
  http.post<ApiResponse<SearchResult>>(`/players/${playerId}/play`, data);

export const pause = (playerId: string) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/pause`);

export const resume = (playerId: string) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/resume`);

export const stop = (playerId: string) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/stop`);

export const skip = (playerId: string) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/skip`);

export const getQueue = (playerId: string) =>
  http.get<ApiResponse<QueueItem[]>>(`/players/${playerId}/queue`);

export const search = (playerId: string, query: string) =>
  http.post<ApiResponse<SearchResult[]>>(`/players/${playerId}/search`, {
    query,
  });

export const getTrending = () =>
  http.get<ApiResponse<SearchResult[]>>(`/players/trending`);

export const getCategories = () =>
  http.get<ApiResponse<{ id: string; title: string }[]>>(`/players/categories`);

export const addToQueue = (playerId: string, data: PlayRequest) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/queue`, data);

export const removeFromQueue = (playerId: string, itemId: number) =>
  http.delete<ApiResponse<null>>(`/players/${playerId}/queue/${itemId}`);

export const clearQueue = (playerId: string) =>
  http.delete<ApiResponse<null>>(`/players/${playerId}/queue`);

export const setVolume = (playerId: string, data: VolumeRequest) =>
  http.post<ApiResponse<null>>(`/players/${playerId}/volume`, data);

export const getGroupHistory = async (
  groupId: string,
  limit = 10,
): Promise<HistoryItem[]> => {
  const result = await http.get<ApiResponse<Paginated<HistoryItem>>>(
    `/groups/${groupId}/history`,
    { params: { limit } },
  );

  return result.data.items;
};
