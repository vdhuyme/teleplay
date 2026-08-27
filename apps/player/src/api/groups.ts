import { request } from "./client";

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

export function list() {
  return request<Group[]>("/groups");
}

export function get(groupId: number) {
  return request<Group>(`/groups/${groupId}`);
}

export function queue(groupId: number) {
  return request<QueueItem[]>(`/groups/${groupId}/queue`);
}

export function history(groupId: number, limit = 20) {
  return request<PlayHistory[]>(`/groups/${groupId}/history?limit=${limit}`);
}

export function remove(groupId: number) {
  return request(`/groups/${groupId}`, { method: "DELETE" });
}

export function play(groupId: number, data: {
  query: string;
  requestedBy?: string;
  groupName?: string;
}) {
  return request(`/groups/${groupId}/play`, {
    method: "POST",
    body: data,
  });
}

export function pause(groupId: number) {
  return request(`/groups/${groupId}/pause`, { method: "POST" });
}

export function resume(groupId: number) {
  return request(`/groups/${groupId}/resume`, { method: "POST" });
}

export function stop(groupId: number) {
  return request(`/groups/${groupId}/stop`, { method: "POST" });
}

export function skip(groupId: number) {
  return request(`/groups/${groupId}/skip`, { method: "POST" });
}

export function setVolume(groupId: number, volume: number) {
  return request(`/groups/${groupId}/volume`, {
    method: "POST",
    body: { volume },
  });
}
