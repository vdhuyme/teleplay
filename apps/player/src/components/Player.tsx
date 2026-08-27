"use client";

import { usePlayerState } from "@/hooks/usePlayerState";
import { PlayerHeader } from "./player/PlayerHeader";
import { NowPlaying } from "./player/NowPlaying";
import { PlayerControls } from "./player/PlayerControls";
import { Queue } from "./Queue";

interface PlayerProps {
  playerId: string;
}

export function Player({ playerId }: PlayerProps) {
  const { state, setState, queue, connected, handleVideoEnded } =
    usePlayerState(playerId);

  const handlePause = () => {
    setState((prev) => ({ ...prev, status: "paused" }));
  };

  const handleResume = () => {
    setState((prev) => ({ ...prev, status: "playing" }));
  };

  const handleStop = () => {
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
  };

  const handleVolumeChange = (volume: number) => {
    setState((prev) => ({ ...prev, volume }));
  };

  const handleStateChange = (status: "idle" | "playing" | "paused" | "stopped") => {
    setState((prev) => ({ ...prev, status }));
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-base p-6">
      <PlayerHeader connected={connected} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player */}
        <div className="lg:col-span-2">
          <div className="card-spotify">
            <NowPlaying
              state={state}
              onStateChange={handleStateChange}
              onEnded={handleVideoEnded}
            />
            <PlayerControls
              playerId={playerId}
              state={state}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
              onVolumeChange={handleVolumeChange}
            />
          </div>
        </div>

        {/* Queue */}
        <div className="lg:col-span-1">
          <Queue items={queue} playerId={playerId} />
        </div>
      </div>
    </div>
  );
}
