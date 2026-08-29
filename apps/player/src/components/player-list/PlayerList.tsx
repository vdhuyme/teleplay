'use client';

import { useEffect, useState, useCallback } from 'react';
import { Music, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '@/api';
import { tryCatch } from '@teleplay/core';
import { useGroupsSocket } from '@/hooks/useGroupsSocket';
import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';
import { LoadingOverlay } from '../LoadingOverlay';
import { Pagination } from '../Pagination';
import { PlayerCard } from './PlayerCard';
import { PlayerDetailsModal } from './PlayerDetailsModal';
import { DEFAULT_LIMIT } from '@/types';

export function PlayerList() {
  const [groups, setGroups] = useState<api.groups.Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    const [err, result] = await tryCatch(api.groups.list(page, DEFAULT_LIMIT));
    if (err) {
      setError(err.message ?? 'Failed to fetch players');
    } else {
      setGroups(result.data?.items ?? []);
      setTotal(result.data?.total ?? 0);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchGroups();
  }, [page]);

  useGroupsSocket(fetchGroups);

  const handleDelete = async (groupId: number) => {
    setDeleting(true);
    const [err] = await tryCatch(api.groups.remove(groupId));
    if (err) {
      toast.error('Failed to delete player');
    } else {
      toast.success('Player deleted');
      setDeleteConfirm(null);
      const [fetchErr, result] = await tryCatch(
        api.groups.list(page, DEFAULT_LIMIT),
      );
      if (!fetchErr) {
        setGroups(result.data?.items ?? []);
        setTotal(result.data?.total ?? 0);
      }
    }
    setDeleting(false);
  };

  const handleDeleteClick = (groupId: number) => {
    setDeleteConfirm(groupId);
  };

  const handleExpand = (groupId: number) => {
    setExpandedPlayer(groupId);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <LoadingOverlay size="lg" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-bg-base text-text-base p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-section-title font-title font-bold mb-8">
            Players
          </h1>
          <ErrorState icon={AlertCircle} message={error} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-base text-text-base p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-section-title font-title font-bold">Players</h1>
        </div>

        {groups.length === 0 ? (
          <EmptyState
            icon={Music}
            title="No players yet"
            description="Players will appear here once your bot is added to a Telegram group."
          />
        ) : (
          <>
            <div className="space-y-4">
              {groups.map((group) => (
                <PlayerCard
                  key={group.id}
                  player={group}
                  onDelete={handleDeleteClick}
                  onExpand={handleExpand}
                />
              ))}
            </div>

            <Pagination
              page={page}
              total={total}
              limit={DEFAULT_LIMIT}
              onPageChange={setPage}
              className="mt-6"
            />
          </>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-card rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-feature-heading font-semibold mb-2">
              Delete Player
            </h3>
            <p className="text-body-medium text-text-secondary mb-4">
              Are you sure you want to delete this player? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-spotify-outline"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn-spotify bg-red-500 hover:bg-red-600"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {expandedPlayer && (
        <PlayerDetailsModal
          playerId={expandedPlayer}
          onClose={() => setExpandedPlayer(null)}
        />
      )}
    </main>
  );
}
