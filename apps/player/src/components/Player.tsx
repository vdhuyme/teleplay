"use client";

import { useEffect, useState } from "react";
import { YouTubePlayer } from "./YouTubePlayer";
import { Queue } from "./Queue";
import { useSocket } from "@/hooks/useSocket";
import * as api from "@/api";
import { tryCatch } from "@/utils/try-catch";
import { isNotNil } from "@/utils/ts-utils";
import {
  Play,
  Pause,
  Square,
  Volume2,
  Music,
  Wifi,
  WifiOff,
} from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="min-h-screen bg-bg-base text-text-base p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex">
            <Music className="w-8 h-8 text-spotify-green mr-2" />
            <h1 className="text-section-title font-title font-bold">
              Teleplay
            </h1>
          </Link>
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
            {isNotNil(state.videoId) ? (
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
            {isNotNil(state.title) && (
              <div className="mt-4">
                <h2 className="text-feature-heading font-ui font-semibold">
                  {state.title}
                </h2>
                {isNotNil(state.requestedBy) && (
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
                  const [error] = await tryCatch(
                    action === "pause"
                      ? api.players.pause(id)
                      : api.players.resume(id),
                  );
                  if (error) {
                    console.error(`Failed to ${action}:`, error);
                    return;
                  }
                  setState((prev) => ({
                    ...prev,
                    status: action === "pause" ? "paused" : "playing",
                  }));
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
                  const [error] = await tryCatch(
                    api.players.stop(Number(playerId)),
                  );
                  if (error) {
                    console.error("Failed to stop:", error);
                    return;
                  }
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
                    const [error] = await tryCatch(
                      api.players.setVolume(Number(playerId), volume),
                    );
                    if (error) {
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
