import {
  PlayRequest,
  PlayerState,
  QueueItem,
  SearchResult,
  VolumeRequest,
} from "../type";
import { App } from "../config/env";

async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${App.getOrThrow("API_URL")}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "API request failed");
  }

  return response.json();
}

export async function getState(playerId: string) {
  return request<PlayerState | null>(`/players/${playerId}/state`);
}

export async function play(playerId: string, data: PlayRequest) {
  return request<SearchResult>(`/players/${playerId}/play`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function pause(playerId: string) {
  return request(`/players/${playerId}/pause`, {
    method: "POST",
  });
}

export async function resume(playerId: string) {
  return request(`/players/${playerId}/resume`, {
    method: "POST",
  });
}

export async function stop(playerId: string) {
  return request(`/players/${playerId}/stop`, {
    method: "POST",
  });
}

export async function skip(playerId: string) {
  return request(`/players/${playerId}/skip`, {
    method: "POST",
  });
}

export async function getQueue(playerId: string) {
  return request<QueueItem[]>(`/players/${playerId}/queue`);
}

export async function search(playerId: string, query: string) {
  return request<SearchResult[]>(`/players/${playerId}/search`, {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export async function addToQueue(playerId: string, data: PlayRequest) {
  return request(`/players/${playerId}/queue`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function removeFromQueue(playerId: string, itemId: number) {
  return request(`/players/${playerId}/queue/${itemId}`, {
    method: "DELETE",
  });
}

export async function clearQueue(playerId: string) {
  return request(`/players/${playerId}/queue`, {
    method: "DELETE",
  });
}

export async function setVolume(playerId: string, data: VolumeRequest) {
  return request(`/players/${playerId}/volume`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getGroupHistory(groupId: string, limit = 10) {
  return request<{ videoId: string; title: string }[]>(
    `/groups/${groupId}/history?limit=${limit}`,
  );
}
