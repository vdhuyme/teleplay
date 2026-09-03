'use client';

import { useEffect, useState } from 'react';
import { usePlayerSocket } from './usePlayerSocket';
import { useTtsAnnouncement } from './useTtsAnnouncement';
import * as api from '@/api';
import { tryCatch } from '@teleplay/core';
import { SOCKET_EVENTS } from '@/socket/events';
import type { PlayerState } from '@/socket/types';

export type { PlayerState } from '@/socket/types';

const defaultState: PlayerState = {
  status: 'idle',
  videoId: null,
  title: null,
  thumbnail: null,
  duration: null,
  position: 0,
  volume: 80,
  requestedBy: null,
};

interface UsePlayerStateOptions {
  initialState?: PlayerState;
}

export function usePlayerState(
  playerId: string,
  options?: UsePlayerStateOptions,
) {
  const [state, setState] = useState<PlayerState>(
    options?.initialState ?? defaultState,
  );
  const [queue, setQueue] = useState<api.players.QueueItem[]>([]);

  const { connected, lastEvent } = usePlayerSocket(playerId);
  const tts = useTtsAnnouncement();

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
        if (lastEvent.title && lastEvent.requestedBy) {
          tts.announce(lastEvent.title, lastEvent.requestedBy);
        }
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
      case SOCKET_EVENTS.POSITION:
        setState((prev) => ({ ...prev, position: lastEvent.position }));
        break;
      case SOCKET_EVENTS.QUEUE_UPDATED:
        fetchQueue();
        break;
    }
  }, [lastEvent]);

  const fetchQueue = async () => {
    const [err, result] = await tryCatch(
      api.players.getQueue(Number(playerId)),
    );
    if (err) {
      console.error('Failed to fetch queue:', err);
      return;
    }
    setQueue(result.data ?? []);
  };

  const handleVideoEnded = async () => {
    const [err] = await tryCatch(api.players.videoEnded(Number(playerId)));
    if (err) {
      console.error('Failed to report video ended:', err);
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
    ttsEnabled: tts.enabled,
    toggleTts: tts.toggle,
  };
}
