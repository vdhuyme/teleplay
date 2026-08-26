"use client";

import { useEffect, useState } from "react";
import { YouTubePlayer } from "./YouTubePlayer";
import { Queue } from "./Queue";
import { useSocket } from "@/hooks/useSocket";
import * as api from "@/api";
import {
  Play,
  Pause,
  Square,
  Volume2,
  Music,
  Wifi,
  WifiOff,
} from "lucide-react";

interface PlayerState {
  status: "idle" | "playing" | "paused" | "stopped";
  videoId: string | null;
  title: string | null;
  thumbnail: string | null;
  duration: number | null;
  position: number;
  volume: number;
  requestedBy: string | null;
}

interface PlayerProps {
  playerId: string;
}

export function Player({ playerId }: PlayerProps) {
  const [state, setState] = useState<PlayerState>({
    status: "idle",
    videoId: null,
    title: null,
    thumbnail: null,
    duration: null,
    position: 0,
    volume: 80,
    requestedBy: null,
  });

  const [queue, setQueue] = useState<any[]>([]);

  const { connected, lastEvent } = useSocket(playerId);

  // Fetch initial state via REST API on mount
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const data = await api.players.getState(Number(playerId));
        setState(data);
      } catch (error) {
        console.error("Failed to fetch initial state:", error);
      }
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
    try {
      const data = await api.players.getQueue(Number(playerId));
      setQueue(data);
    } catch (error) {
      console.error("Failed to fetch queue:", error);
    }
  };

  // Handle video ended
  const handleVideoEnded = async () => {
    try {
      await api.players.videoEnded(Number(playerId));
    } catch (error) {
      console.error("Failed to report video ended:", error);
    }
  };

  // Fetch queue on mount
  useEffect(() => {
    fetchQueue();
  }, [playerId]);

  return (
    <div className="min-h-screen bg-bg-base text-text-base p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Music className="w-8 h-8 text-spotify-green" />
          <h1 className="text-section-title font-title font-bold">Teleplay</h1>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <Wifi className="w-4 h-4 text-spotify-green" />
          ) : (
            <WifiOff className="w-4 h-4 text-text-negative" />
          )}
          <span className="text-caption text-text-secondary">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player */}
        <div className="lg:col-span-2">
          <div className="card-spotify">
            {state.videoId ? (
              <YouTubePlayer
                videoId={state.videoId}
                status={state.status}
                volume={state.volume}
                position={state.position}
                onStateChange={(newStatus) =>
                  setState((prev) => ({ ...prev, status: newStatus }))
                }
                onEnded={handleVideoEnded}
              />
            ) : (
              <div className="aspect-video bg-bg-surface rounded-md flex items-center justify-center">
                <Music className="w-16 h-16 text-text-secondary" />
              </div>
            )}

            {/* Now Playing Info */}
            {state.title && (
              <div className="mt-4">
                <h2 className="text-feature-heading font-ui font-semibold">
                  {state.title}
                </h2>
                {state.requestedBy && (
                  <p className="text-caption text-text-secondary mt-1">
                    Requested by {state.requestedBy}
                  </p>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={async () => {
                  const id = Number(playerId);
                  const action = state.status === "paused" ? "resume" : "pause";
                  try {
                    if (action === "pause") {
                      await api.players.pause(id);
                    } else {
                      await api.players.resume(id);
                    }
                    setState((prev) => ({
                      ...prev,
                      status: action === "pause" ? "paused" : "playing",
                    }));
                  } catch (error) {
                    console.error(`Failed to ${action}:`, error);
                  }
                }}
                className="btn-spotify flex items-center gap-2"
              >
                {state.status === "paused" ? (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Play</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                )}
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.players.stop(Number(playerId));
                    setState((prev) => ({
                      ...prev,
                      status: "stopped",
                      videoId: null,
                      title: null,
                      thumbnail: null,
                      duration: null,
                      position: 0,
                      requestedBy: null,
                    }));
                  } catch (error) {
                    console.error("Failed to stop:", error);
                  }
                }}
                className="btn-spotify flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </button>
              <div className="flex items-center gap-3 ml-auto">
                <Volume2 className="w-4 h-4 text-text-secondary" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={state.volume}
                  onChange={async (e) => {
                    const volume = parseInt(e.target.value, 10);
                    setState((prev) => ({ ...prev, volume }));
                    try {
                      await api.players.setVolume(Number(playerId), volume);
                    } catch (error) {
                      console.error("Failed to set volume:", error);
                    }
                  }}
                  className="w-24 accent-spotify-green"
                />
                <span className="text-caption text-text-secondary w-8">
                  {state.volume}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Queue */}
        <div className="lg:col-span-1">
          <Queue items={queue} />
        </div>
      </div>
    </div>
  );
}
