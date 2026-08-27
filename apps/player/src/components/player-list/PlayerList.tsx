"use client";

import { useEffect, useState, useCallback } from "react";
import { Music } from "lucide-react";
import * as api from "@/api";
import { tryCatch } from "@teleplay/core";
import { useGroupsSocket } from "@/hooks/useGroupsSocket";
import { EmptyState } from "../EmptyState";
import { LoadingOverlay } from "../LoadingOverlay";
import { Pagination } from "../Pagination";
import { PlayerCard } from "./PlayerCard";
import { PlayerDetailsModal } from "./PlayerDetailsModal";

const PAGE_LIMIT = 20;

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
    const [err, data] = await tryCatch(api.groups.list(page, PAGE_LIMIT));
    if (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } else {
      setGroups(data.data);
      setTotal(data.total);
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
      setError(err instanceof Error ? err.message : "Failed to delete");
    } else {
      setDeleteConfirm(null);
      const [fetchErr, data] = await tryCatch(
        api.groups.list(page, PAGE_LIMIT),
      );
      if (!fetchErr) {
        setGroups(data.data);
        setTotal(data.total);
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

  return (
    <main className="min-h-screen bg-bg-base text-text-base p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-section-title font-title font-bold">Players</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-body-medium text-red-500">{error}</p>
          </div>
        )}

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
              limit={PAGE_LIMIT}
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
                {deleting ? "Deleting..." : "Delete"}
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
