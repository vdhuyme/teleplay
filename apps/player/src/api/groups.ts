import { Paginated } from '@/types';
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

interface PlayBody {
  query: string;
  requestedBy?: string;
  groupName?: string;
}

export const list = (page = 1, limit = 10) =>
  http.get<Paginated<Group>>(`/groups`, { params: { page, limit } });

export const getGroup = (groupId: number) =>
  http.get<Group>(`/groups/${groupId}`);

export const queue = (groupId: number) =>
  http.get<QueueItem[]>(`/groups/${groupId}/queue`);

export const history = (groupId: number, page = 1, limit = 20) =>
  http.get<Paginated<PlayHistory>>(`/groups/${groupId}/history`, {
    params: { page, limit },
  });

export const remove = (groupId: number) => http.delete(`/groups/${groupId}`);

export const play = (groupId: number, data: PlayBody) =>
  http.post(`/groups/${groupId}/play`, data);

export const pause = (groupId: number) => http.post(`/groups/${groupId}/pause`);

export const resume = (groupId: number) =>
  http.post(`/groups/${groupId}/resume`);

export const stop = (groupId: number) => http.post(`/groups/${groupId}/stop`);

export const skip = (groupId: number) => http.post(`/groups/${groupId}/skip`);

export const setVolume = (groupId: number, volume: number) =>
  http.post(`/groups/${groupId}/volume`, { volume });
