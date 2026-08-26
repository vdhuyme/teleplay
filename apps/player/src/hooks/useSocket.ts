"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketReturn {
  connected: boolean;
  lastEvent: any | null;
  emit: (event: string, data?: any) => void;
}

export function useSocket(playerId: string): UseSocketReturn {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      {
        transports: ["websocket", "polling"],
      },
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO connected");
      setConnected(true);
      socket.emit("join", playerId);
    });

    socket.on("disconnect", () => {
      console.log("Socket.IO disconnected");
      setConnected(false);
    });

    socket.on("STATE_SYNC", (state) => {
      setLastEvent({ type: "STATE_SYNC", state });
    });

    socket.on("PLAY", (data) => {
      setLastEvent({ type: "PLAY", ...data });
    });

    socket.on("PAUSE", () => {
      setLastEvent({ type: "PAUSE" });
    });

    socket.on("RESUME", () => {
      setLastEvent({ type: "RESUME" });
    });

    socket.on("STOP", () => {
      setLastEvent({ type: "STOP" });
    });

    socket.on("VOLUME", (data) => {
      setLastEvent({ type: "VOLUME", ...data });
    });

    socket.on("QUEUE_UPDATED", () => {
      setLastEvent({ type: "QUEUE_UPDATED" });
    });

    return () => {
      socket.disconnect();
    };
  }, [playerId]);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return { connected, lastEvent, emit };
}
