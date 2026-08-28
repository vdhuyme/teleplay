'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocketContext } from '../contexts/SocketContext';
import { SOCKET_EVENTS, SOCKET_REQUESTS } from '../socket/events';
import type { SocketEvent, StateSyncEvent, PlayEvent } from '../socket/types';

interface UseSocketReturn {
  connected: boolean;
  lastEvent: SocketEvent | null;
  emit: (event: string, data?: Record<string, unknown>) => void;
}

export function usePlayerSocket(playerId: string): UseSocketReturn {
  const { socket, connected } = useSocketContext();
  const [lastEvent, setLastEvent] = useState<SocketEvent | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit(SOCKET_REQUESTS.JOIN_PLAYER, playerId);

    const handleStateSync = (state: StateSyncEvent['state']) => {
      setLastEvent({ type: SOCKET_EVENTS.STATE_SYNC, state });
    };

    const handlePlay = (data: Omit<PlayEvent, 'type'>) => {
      setLastEvent({ type: SOCKET_EVENTS.PLAY, ...data });
    };

    const handlePause = () => {
      setLastEvent({ type: SOCKET_EVENTS.PAUSE });
    };

    const handleResume = () => {
      setLastEvent({ type: SOCKET_EVENTS.RESUME });
    };

    const handleStop = () => {
      setLastEvent({ type: SOCKET_EVENTS.STOP });
    };

    const handleVolume = (data: { volume: number }) => {
      setLastEvent({ type: SOCKET_EVENTS.VOLUME, ...data });
    };

    const handleQueueUpdated = () => {
      setLastEvent({ type: SOCKET_EVENTS.QUEUE_UPDATED });
    };

    socket.on(SOCKET_EVENTS.STATE_SYNC, handleStateSync);
    socket.on(SOCKET_EVENTS.PLAY, handlePlay);
    socket.on(SOCKET_EVENTS.PAUSE, handlePause);
    socket.on(SOCKET_EVENTS.RESUME, handleResume);
    socket.on(SOCKET_EVENTS.STOP, handleStop);
    socket.on(SOCKET_EVENTS.VOLUME, handleVolume);
    socket.on(SOCKET_EVENTS.QUEUE_UPDATED, handleQueueUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.STATE_SYNC, handleStateSync);
      socket.off(SOCKET_EVENTS.PLAY, handlePlay);
      socket.off(SOCKET_EVENTS.PAUSE, handlePause);
      socket.off(SOCKET_EVENTS.RESUME, handleResume);
      socket.off(SOCKET_EVENTS.STOP, handleStop);
      socket.off(SOCKET_EVENTS.VOLUME, handleVolume);
      socket.off(SOCKET_EVENTS.QUEUE_UPDATED, handleQueueUpdated);
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
