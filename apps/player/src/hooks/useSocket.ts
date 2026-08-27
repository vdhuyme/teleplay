"use client";

import { useEffect, useState, useCallback } from "react";
import { useSocketContext } from "./SocketContext";

interface StateSyncEvent {
  type: "STATE_SYNC";
  state: {
    status: "idle" | "playing" | "paused" | "stopped";
    videoId: string | null;
    title: string | null;
    thumbnail: string | null;
    duration: number | null;
    position: number;
    volume: number;
    requestedBy: string | null;
  };
}

interface PlayEvent {
  type: "PLAY";
  videoId: string;
  title: string;
  thumbnail: string;
  duration: number;
  position: number;
  requestedBy: string | null;
}

interface PauseEvent {
  type: "PAUSE";
}

interface ResumeEvent {
  type: "RESUME";
}

interface StopEvent {
  type: "STOP";
}

interface VolumeEvent {
  type: "VOLUME";
  volume: number;
}

interface QueueUpdatedEvent {
  type: "QUEUE_UPDATED";
}

type SocketEvent =
  | StateSyncEvent
  | PlayEvent
  | PauseEvent
  | ResumeEvent
  | StopEvent
  | VolumeEvent
  | QueueUpdatedEvent;

interface UseSocketReturn {
  connected: boolean;
  lastEvent: SocketEvent | null;
  emit: (event: string, data?: Record<string, unknown>) => void;
}

export function useSocket(playerId: string): UseSocketReturn {
  const { socket, connected } = useSocketContext();
  const [lastEvent, setLastEvent] = useState<SocketEvent | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join", playerId);

    const handleStateSync = (state: StateSyncEvent["state"]) => {
      setLastEvent({ type: "STATE_SYNC", state });
    };

    const handlePlay = (data: Omit<PlayEvent, "type">) => {
      setLastEvent({ type: "PLAY", ...data });
    };

    const handlePause = () => {
      setLastEvent({ type: "PAUSE" });
    };

    const handleResume = () => {
      setLastEvent({ type: "RESUME" });
    };

    const handleStop = () => {
      setLastEvent({ type: "STOP" });
    };

    const handleVolume = (data: { volume: number }) => {
      setLastEvent({ type: "VOLUME", ...data });
    };

    const handleQueueUpdated = () => {
      setLastEvent({ type: "QUEUE_UPDATED" });
    };

    socket.on("STATE_SYNC", handleStateSync);
    socket.on("PLAY", handlePlay);
    socket.on("PAUSE", handlePause);
    socket.on("RESUME", handleResume);
    socket.on("STOP", handleStop);
    socket.on("VOLUME", handleVolume);
    socket.on("QUEUE_UPDATED", handleQueueUpdated);

    return () => {
      socket.off("STATE_SYNC", handleStateSync);
      socket.off("PLAY", handlePlay);
      socket.off("PAUSE", handlePause);
      socket.off("RESUME", handleResume);
      socket.off("STOP", handleStop);
      socket.off("VOLUME", handleVolume);
      socket.off("QUEUE_UPDATED", handleQueueUpdated);
    };
  }, [socket, playerId]);

  const emit = useCallback(
    (event: string, data?: Record<string, unknown>) => {
      if (socket) {
        socket.emit(event, data);
      }
    },
    [socket],
  );

  return { connected, lastEvent, emit };
}
