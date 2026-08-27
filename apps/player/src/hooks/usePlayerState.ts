"use client";

import { useEffect, useState } from "react";
import { usePlayerSocket } from "./usePlayerSocket";
import * as api from "@/api";
import { tryCatch } from "@teleplay/core";

export interface PlayerState {
  status: "idle" | "playing" | "paused" | "stopped";
  videoId: string | null;
  title: string | null;
  thumbnail: string | null;
  duration: number | null;
  position: number;
  volume: number;
  requestedBy: string | null;
}

const initialState: PlayerState = {
  status: "idle",
  videoId: null,
  title: null,
  thumbnail: null,
  duration: null,
  position: 0,
  volume: 80,
  requestedBy: null,
};

export function usePlayerState(playerId: string) {
  const [state, setState] = useState<PlayerState>(initialState);
  const [queue, setQueue] = useState<api.players.QueueItem[]>([]);

  const { connected, lastEvent } = usePlayerSocket(playerId);

  // Fetch initial state via REST API on mount
  useEffect(() => {
    const fetchInitialState = async () => {
      const [error, data] = await tryCatch(
        api.players.getState(Number(playerId)),
      );
      if (error) {
        console.error("Failed to fetch initial state:", error);
        return;
      }
      setState(data as PlayerState);
    };

    fetchInitialState();
  }, [playerId]);

  // Handle Socket.IO events
  useEffect(() => {
    if (!lastEvent) return;

    switch (lastEvent.type) {
      case "STATE_SYNC":
        setState(lastEvent.state);
        break;
      case "PLAY":
        setState((prev) => ({
          ...prev,
          status: "playing",
          videoId: lastEvent.videoId,
          title: lastEvent.title,
          thumbnail: lastEvent.thumbnail,
          duration: lastEvent.duration,
          position: lastEvent.position,
          requestedBy: lastEvent.requestedBy,
        }));
        break;
      case "PAUSE":
        setState((prev) => ({ ...prev, status: "paused" }));
        break;
      case "RESUME":
        setState((prev) => ({ ...prev, status: "playing" }));
        break;
      case "STOP":
        setState((prev) => ({
          ...prev,
          status: "idle",
          videoId: null,
          title: null,
          thumbnail: null,
          duration: null,
          position: 0,
          requestedBy: null,
        }));
        break;
      case "VOLUME":
        setState((prev) => ({ ...prev, volume: lastEvent.volume }));
        break;
      case "QUEUE_UPDATED":
        fetchQueue();
        break;
    }
  }, [lastEvent]);

  // Fetch queue
  const fetchQueue = async () => {
    const [error, data] = await tryCatch(
      api.players.getQueue(Number(playerId)),
    );
    if (error) {
      console.error("Failed to fetch queue:", error);
      return;
    }
    setQueue(data);
  };

  // Handle video ended
  const handleVideoEnded = async () => {
    const [error] = await tryCatch(api.players.videoEnded(Number(playerId)));
    if (error) {
      console.error("Failed to report video ended:", error);
    }
  };

  // Fetch queue on mount
  useEffect(() => {
    fetchQueue();
  }, [playerId]);

  return {
    state,
    setState,
    queue,
    connected,
    fetchQueue,
    handleVideoEnded,
  };
}
