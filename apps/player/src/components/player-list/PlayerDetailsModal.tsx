'use client';

import { useEffect, useState } from 'react';
import { History, ListMusic, X } from 'lucide-react';
import { Card } from '../Card';
import { EmptyState } from '../EmptyState';
import { LoadingOverlay } from '../LoadingOverlay';
import { Pagination } from '../Pagination';
import * as api from '@/api';
import { tryCatch } from '@teleplay/core';

const HISTORY_LIMIT = 20;

interface PlayerDetailsModalProps {
  playerId: number;
  onClose: () => void;
}

export function PlayerDetailsModal({
  playerId,
  onClose,
}: PlayerDetailsModalProps) {
  const [queue, setQueue] = useState<api.groups.QueueItem[]>([]);
  const [history, setPlayerHistory] = useState<api.groups.PlayHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const [queueErr, queueData] = await tryCatch(api.groups.queue(playerId));
      const [historyErr, historyData] = await tryCatch(
        api.groups.history(playerId, historyPage, HISTORY_LIMIT),
      );

      if (!queueErr) setQueue(queueData);
      if (!historyErr) {
        setPlayerHistory(historyData.items);
        setHistoryTotal(historyData.total);
      }
      setLoading(false);
    };

    fetchDetails();
  }, [playerId, historyPage]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-feature-heading font-semibold">Player Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-surface rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 p-3 text-body-large font-medium transition-colors ${
              activeTab === 'queue'
                ? 'border-b-2 border-spotify-green text-spotify-green'
                : 'text-text-secondary hover:text-text-base'
            }`}
          >
            Queue
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 p-3 text-body-large font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-b-2 border-spotify-green text-spotify-green'
                : 'text-text-secondary hover:text-text-base'
            }`}
          >
            History
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-bg-surface [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:transition-colors hover:[&::-webkit-scrollbar-thumb]:bg-border-dark scrollbar-thin [scrollbar-color:var(--color-bg-surface)_transparent]">
          {loading ? (
            <LoadingOverlay />
          ) : activeTab === 'queue' ? (
            queue.length === 0 ? (
              <EmptyState
                icon={ListMusic}
                title="Queue is empty"
                description="Songs requested from the bot will show up here."
                className="py-8"
              />
            ) : (
              <div className="space-y-2">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 bg-bg-surface rounded-md"
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-body-large font-medium truncate">
                        {item.title}
                      </p>
                      {item.requestedBy && (
                        <p className="text-caption text-text-secondary">
                          Requested by {item.requestedBy}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : history.length === 0 ? (
            <EmptyState
              icon={History}
              title="No history yet"
              description="Played songs will be recorded here."
              className="py-8"
            />
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 bg-bg-surface rounded-md"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-body-large font-medium truncate">
                      {item.title}
                    </p>
                    <p className="text-caption text-text-secondary">
                      {item.requestedBy &&
                        `Requested by ${item.requestedBy} • `}
                      {new Date(item.playedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}

              <Pagination
                page={historyPage}
                total={historyTotal}
                limit={HISTORY_LIMIT}
                onPageChange={setHistoryPage}
                className="mt-4"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
