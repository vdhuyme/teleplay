import { Play, Pause, Square, Volume2 } from "lucide-react";
import * as api from "@/api";
import { tryCatch } from "@teleplay/core";
import type { PlayerState } from "@/hooks/usePlayerState";

interface PlayerControlsProps {
  playerId: string;
  state: PlayerState;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
}

export function PlayerControls({
  playerId,
  state,
  onPause,
  onResume,
  onStop,
  onVolumeChange,
}: PlayerControlsProps) {
  const handlePauseResume = async () => {
    const id = Number(playerId);
    const action = state.status === "paused" ? "resume" : "pause";
    const [error] = await tryCatch(
      action === "pause" ? api.players.pause(id) : api.players.resume(id),
    );
    if (error) {
      console.error(`Failed to ${action}:`, error);
      return;
    }
    if (action === "pause") {
      onPause();
    } else {
      onResume();
    }
  };

  const handleStop = async () => {
    const [error] = await tryCatch(api.players.stop(Number(playerId)));
    if (error) {
      console.error("Failed to stop:", error);
      return;
    }
    onStop();
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(e.target.value, 10);
    onVolumeChange(volume);
    const [error] = await tryCatch(
      api.players.setVolume(Number(playerId), volume),
    );
    if (error) {
      console.error("Failed to set volume:", error);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-6">
      <button onClick={handlePauseResume} className="btn-spotify flex items-center gap-2">
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
      <button onClick={handleStop} className="btn-spotify flex items-center gap-2">
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
          onChange={handleVolumeChange}
          className="w-24 accent-spotify-green"
        />
        <span className="text-caption text-text-secondary w-8">
          {state.volume}
        </span>
      </div>
    </div>
  );
}
