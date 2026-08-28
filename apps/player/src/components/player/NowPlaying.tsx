import { Music } from 'lucide-react';
import { YouTubePlayer } from '../YouTubePlayer';
import { isNotNil } from '@teleplay/core';
import type { PlayerState } from '@/hooks/usePlayerState';

interface NowPlayingProps {
  playerId: string;
  state: PlayerState;
  onStateChange: (status: PlayerState['status']) => void;
  onEnded: () => void;
}

export function NowPlaying({
  playerId,
  state,
  onStateChange,
  onEnded,
}: NowPlayingProps) {
  return (
    <div className="card-spotify">
      {isNotNil(state.videoId) ? (
        <YouTubePlayer
          playerId={Number(playerId)}
          videoId={state.videoId}
          status={state.status}
          volume={state.volume}
          position={state.position}
          onStateChange={onStateChange}
          onEnded={onEnded}
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
    </div>
  );
}
