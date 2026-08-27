'use client';

import { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  status: 'idle' | 'playing' | 'paused' | 'stopped';
  volume: number;
  position: number;
  onStateChange: (status: 'idle' | 'playing' | 'paused' | 'stopped') => void;
  onEnded: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YouTubePlayer({
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

  // Store props in refs for use in callbacks
  const propsRef = useRef({ volume, status, onEnded, onStateChange });
  propsRef.current = { volume, status, onEnded, onStateChange };

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    // Load the IFrame Player API code asynchronously
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

  // Initialize player
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

    // Play if there's a pending video or status is playing
    if (pendingVideoRef.current) {
      event.target.loadVideoById(pendingVideoRef.current);
      pendingVideoRef.current = null;
    } else if (propsRef.current.status === 'playing') {
      event.target.playVideo();
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

  // Update video when videoId changes
  useEffect(() => {
    if (playerRef.current && isReadyRef.current) {
      playerRef.current.loadVideoById(videoId);
    } else if (videoId) {
      // Store pending video to load when player is ready
      pendingVideoRef.current = videoId;
    }
  }, [videoId]);

  // Update volume
  useEffect(() => {
    if (playerRef.current && isReadyRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  // Update play/pause status
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

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
