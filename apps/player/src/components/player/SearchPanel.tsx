'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Play, Plus, Music, X } from 'lucide-react';
import { toast } from 'sonner';
import { tryCatch } from '@teleplay/core';
import * as api from '@/api';
import type { SearchResult } from '@/api/players';
import { EmptyState } from '../EmptyState';
import { LoadingOverlay } from '../LoadingOverlay';

interface SearchPanelProps {
  playerId: string;
}

export function SearchPanel({ playerId }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const [error, result] = await tryCatch(
        api.players.search(Number(playerId), searchQuery.trim()),
      );
      if (!error) {
        setResults(result.data);
      }
      setLoading(false);
    },
    [playerId],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(query);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, handleSearch]);

  const handlePlay = async (result: SearchResult) => {
    const [err] = await tryCatch(
      api.players.play(Number(playerId), { query: result.title }),
    );
    if (err) {
      toast.error('Failed to play');
      return;
    }
    toast.success(`Now playing: ${result.title}`);
  };

  const handleAddToQueue = async (result: SearchResult) => {
    setAddingId(result.videoId);
    const [err] = await tryCatch(
      api.players.addToQueue(Number(playerId), { query: result.title }),
    );
    if (err) {
      toast.error('Failed to add to queue');
    } else {
      toast.success('Added to queue');
    }
    setAddingId(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          placeholder="Search songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-bg-surface-light text-text-base rounded-pill pl-10 pr-10 py-3 outline-none transition-all focus:ring-1 focus:ring-white"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-bg-surface rounded-full transition-colors text-text-secondary hover:text-text-base"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="max-h-[calc(100vh-300px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-bg-surface [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:transition-colors hover:[&::-webkit-scrollbar-thumb]:bg-border-dark scrollbar-thin [scrollbar-color:var(--color-bg-surface)_transparent]">
        {loading ? (
          <LoadingOverlay />
        ) : results.length === 0 ? (
          query.trim().length >= 2 ? (
            <EmptyState
              icon={Music}
              title="No results found"
              description="Try a different search term."
              className="py-6"
            />
          ) : (
            <EmptyState
              icon={Search}
              title="Search for songs"
              description="Type at least 2 characters to search YouTube."
              className="py-6"
            />
          )
        ) : (
          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.videoId}
                className="flex items-center gap-3 p-2 bg-bg-surface rounded-md group"
              >
                <img
                  src={result.thumbnail}
                  alt={result.title}
                  className="w-12 h-12 rounded object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-body-medium text-text-base truncate">
                    {result.title}
                  </p>
                  <p className="text-caption text-text-secondary">
                    {result.channelTitle && `${result.channelTitle} · `}
                    {formatDuration(result.duration)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handlePlay(result)}
                    className="p-2 hover:bg-bg-card-alt rounded-md transition-colors text-text-secondary hover:text-spotify-green"
                    title="Play now"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAddToQueue(result)}
                    disabled={addingId === result.videoId}
                    className="p-2 hover:bg-bg-card-alt rounded-md transition-colors text-text-secondary hover:text-spotify-green disabled:opacity-50"
                    title="Add to queue"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
