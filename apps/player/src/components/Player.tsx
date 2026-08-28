'use client';

import { useState } from 'react';
import { Search, ListMusic } from 'lucide-react';
import { usePlayerState } from '@/hooks/usePlayerState';
import { PlayerHeader } from './player/PlayerHeader';
import { NowPlaying } from './player/NowPlaying';
import { PlayerControls } from './player/PlayerControls';
import { SearchPanel } from './player/SearchPanel';
import { Queue } from './Queue';

interface PlayerProps {
  playerId: string;
}

export function Player({ playerId }: PlayerProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'queue'>('search');
  const { state, setState, queue, connected, handleVideoEnded } =
    usePlayerState(playerId);

  const handlePause = () => {
    setState((prev) => ({ ...prev, status: 'paused' }));
  };

  const handleResume = () => {
    setState((prev) => ({ ...prev, status: 'playing' }));
  };

  const handleStop = () => {
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
  };

  const handleVolumeChange = (volume: number) => {
    setState((prev) => ({ ...prev, volume }));
  };

  const handleStateChange = (
    status: 'idle' | 'playing' | 'paused' | 'stopped',
  ) => {
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
              playerId={playerId}
              state={state}
              onStateChange={handleStateChange}
              onEnded={handleVideoEnded}
            />
            <PlayerControls
              playerId={playerId}
              state={state}
              hasQueue={queue.length > 0}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
              onVolumeChange={handleVolumeChange}
            />
          </div>
        </div>

        {/* Search & Queue */}
        <div className="lg:col-span-1">
          <div className="card-spotify">
            <div className="flex border-b border-bg-surface">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 flex items-center justify-center gap-2 p-3 text-body-large font-medium transition-colors ${
                  activeTab === 'search'
                    ? 'border-b-2 border-spotify-green text-spotify-green'
                    : 'text-text-secondary hover:text-text-base'
                }`}
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              <button
                onClick={() => setActiveTab('queue')}
                className={`flex-1 flex items-center justify-center gap-2 p-3 text-body-large font-medium transition-colors ${
                  activeTab === 'queue'
                    ? 'border-b-2 border-spotify-green text-spotify-green'
                    : 'text-text-secondary hover:text-text-base'
                }`}
              >
                <ListMusic className="w-4 h-4" />
                Queue
                {queue.length > 0 && (
                  <span className="text-caption bg-bg-surface px-2 py-0.5 rounded-full">
                    {queue.length}
                  </span>
                )}
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'search' ? (
                <SearchPanel playerId={playerId} />
              ) : (
                <Queue items={queue} playerId={playerId} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
