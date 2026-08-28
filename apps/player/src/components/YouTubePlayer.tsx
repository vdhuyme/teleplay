'use client';

import { useEffect, useRef } from 'react';
import { tryCatch } from '@teleplay/core';

interface YouTubePlayerProps {
  playerId: string;
  videoId: string;
  status: 'idle' | 'playing' | 'paused' | 'stopped';
  volume: number;
  position: number;
  onStateChange: (status: 'idle' | 'playing' | 'paused' | 'stopped') => void;
  onEnded: () => void;
}

interface SavedPosition {
  videoId: string;
  position: number;
  savedAt: number;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const STORAGE_KEY = (playerId: string) =>
  `teleplay:player:${playerId}:position`;

export function YouTubePlayer({
  playerId,
  videoId,
  status,
  volume,
  position,
  onStateChange,
  onEnded,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const isReadyRef = useRef(false);
  const pendingVideoRef = useRef<string | null>(null);
  const localPositionRef = useRef<number | null>(null);

  const propsRef = useRef({
    videoId,
    volume,
    status,
    position,
    onEnded,
    onStateChange,
  });
  propsRef.current = {
    videoId,
    volume,
    status,
    position,
    onEnded,
    onStateChange,
  };

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY(playerId));
    if (!raw) return;
    const [error, saved] = tryCatch(() => JSON.parse(raw) as SavedPosition);
    if (error) return;
    if (saved.videoId === videoId && saved.position > 0) {
      localPositionRef.current = saved.position;
    }
  }, [playerId, videoId]);

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const initPlayer = () => {
    if (!containerRef.current || playerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: videoId || undefined,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onEnd: () => propsRef.current.onEnded(),
      },
    });
  };

  const onPlayerReady = (event: any) => {
    isReadyRef.current = true;
    event.target.setVolume(propsRef.current.volume);

    const { status, position } = propsRef.current;
    const vid = pendingVideoRef.current ?? propsRef.current.videoId;
    pendingVideoRef.current = null;

    if (!vid) return;

    const startAt = position || localPositionRef.current || 0;
    if (status === 'playing') {
      event.target.loadVideoById(vid, startAt);
    } else {
      event.target.cueVideoById(vid, startAt);
    }
  };

  const onPlayerStateChange = (event: any) => {
    const YT = window.YT;
    if (!YT) return;

    switch (event.data) {
      case YT.PlayerState.PLAYING:
        propsRef.current.onStateChange('playing');
        break;
      case YT.PlayerState.PAUSED:
        propsRef.current.onStateChange('paused');
        break;
      case YT.PlayerState.ENDED:
        propsRef.current.onEnded();
        break;
    }
  };

  useEffect(() => {
    if (playerRef.current && isReadyRef.current) {
      playerRef.current.loadVideoById(videoId);
    } else if (videoId) {
      pendingVideoRef.current = videoId;
    }
  }, [videoId]);

  useEffect(() => {
    if (playerRef.current && isReadyRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (!playerRef.current || !isReadyRef.current) return;

    const YT = window.YT;
    if (!YT) return;

    const currentState = playerRef.current.getPlayerState();

    if (status === 'playing' && currentState !== YT.PlayerState.PLAYING) {
      playerRef.current.playVideo();
    } else if (status === 'paused' && currentState !== YT.PlayerState.PAUSED) {
      playerRef.current.pauseVideo();
    }
  }, [status]);

  useEffect(() => {
    if (status !== 'playing' || !videoId) return;

    const save = () => {
      if (!playerRef.current?.getCurrentTime) return;
      const t = playerRef.current.getCurrentTime();
      if (t > 0) {
        localStorage.setItem(
          STORAGE_KEY(playerId),
          JSON.stringify({
            videoId,
            position: t,
            savedAt: Date.now(),
          } satisfies SavedPosition),
        );
      }
    };

    const id = window.setInterval(save, 3000);
    return () => {
      clearInterval(id);
      save();
    };
  }, [status, videoId, playerId]);

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
