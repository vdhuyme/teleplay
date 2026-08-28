import { ApiResponse, DEFAULT_LIMIT, DEFAULT_PAGE, Paginated } from '@/types';
import { http } from './client';

export interface Group {
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
  updatedAt: Date;
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

export interface PlayHistory {
  id: number;
  groupId: number;
  videoId: string;
  title: string;
  requestedBy: string | null;
  playedAt: Date;
}

export const list = (page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) =>
  http.get<ApiResponse<Paginated<Group>>>(`/groups`, {
    params: { page, limit },
  });

export const getGroup = (groupId: number) =>
  http.get<ApiResponse<Group>>(`/groups/${groupId}`);

export const queue = (groupId: number) =>
  http.get<ApiResponse<QueueItem[]>>(`/groups/${groupId}/queue`);

export const history = (
  groupId: number,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
) =>
  http.get<ApiResponse<Paginated<PlayHistory>>>(`/groups/${groupId}/history`, {
    params: { page, limit },
  });

export const remove = (groupId: number) =>
  http.delete<ApiResponse<null>>(`/groups/${groupId}`);
