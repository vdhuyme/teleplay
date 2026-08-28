'use client';

import { useEffect, useState } from 'react';
import { usePlayerSocket } from './usePlayerSocket';
import * as api from '@/api';
import { tryCatch } from '@teleplay/core';
import { SOCKET_EVENTS } from '@/socket/events';
import type { PlayerState } from '@/socket/types';

export type { PlayerState } from '@/socket/types';

const initialState: PlayerState = {
  status: 'idle',
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

  useEffect(() => {
    const fetchInitialState = async () => {
      const [error, data] = await tryCatch(
        api.players.getState(Number(playerId)),
      );
      if (error) {
        console.error('Failed to fetch initial state:', error);
        return;
      }
      setState(data as PlayerState);
    };

    fetchInitialState();
  }, [playerId]);

  useEffect(() => {
    if (!lastEvent) return;

    switch (lastEvent.type) {
      case SOCKET_EVENTS.STATE_SYNC:
        setState(lastEvent.state);
        break;
      case SOCKET_EVENTS.PLAY:
        setState((prev) => ({
          ...prev,
          status: 'playing',
          videoId: lastEvent.videoId,
          title: lastEvent.title,
          thumbnail: lastEvent.thumbnail,
          duration: lastEvent.duration,
          requestedBy: lastEvent.requestedBy,
        }));
        break;
      case SOCKET_EVENTS.PAUSE:
        setState((prev) => ({ ...prev, status: 'paused' }));
        break;
      case SOCKET_EVENTS.RESUME:
        setState((prev) => ({ ...prev, status: 'playing' }));
        break;
      case SOCKET_EVENTS.STOP:
        setState((prev) => ({
          ...prev,
          status: 'idle',
          videoId: null,
          title: null,
          thumbnail: null,
          duration: null,
          position: 0,
          requestedBy: null,
        }));
        break;
      case SOCKET_EVENTS.VOLUME:
        setState((prev) => ({ ...prev, volume: lastEvent.volume }));
        break;
      case SOCKET_EVENTS.QUEUE_UPDATED:
        fetchQueue();
        break;
    }
  }, [lastEvent]);

  const fetchQueue = async () => {
    const [error, data] = await tryCatch(
      api.players.getQueue(Number(playerId)),
    );
    if (error) {
      console.error('Failed to fetch queue:', error);
      return;
    }
    setQueue(data);
  };

  const handleVideoEnded = async () => {
    const [error] = await tryCatch(api.players.videoEnded(Number(playerId)));
    if (error) {
      console.error('Failed to report video ended:', error);
    }
  };

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
