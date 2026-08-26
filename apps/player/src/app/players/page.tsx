"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/api";
import { tryCatch } from "@/utils/try-catch";
import {
  Music,
  Play,
  Pause,
  SkipForward,
  Square,
  Volume2,
  Users,
  ListMusic,
  History,
  Trash2,
  X,
  Eye,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { LoadingOverlay } from "@/components/LoadingOverlay";

interface GroupInfo {
  id: number;
  name: string | null;
  status: string;
  videoId: string | null;
  title: string | null;
  thumbnail: string | null;
  duration: number | null;
  position: number;
  volume: number;
  requestedBy: string | null;
}

export default function PlayersPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);
  const [playerQueue, setPlayerQueue] = useState<api.groups.QueueItem[]>([]);
  const [playerHistory, setPlayerHistory] = useState<api.groups.PlayHistory[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      const [err, data] = await tryCatch(api.groups.list());
      if (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } else {
        setGroups(data);
      }
      setLoading(false);
    };

    fetchGroups();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "playing":
        return <Play className="w-4 h-4 text-spotify-green" />;
      case "paused":
        return <Pause className="w-4 h-4 text-yellow-500" />;
      default:
        return <Music className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "playing":
        return "Playing";
      case "paused":
        return "Paused";
      case "stopped":
        return "Stopped";
      default:
        return "Idle";
    }
  };

  const handleDelete = async (groupId: number) => {
    setDeleting(true);
    const [err] = await tryCatch(api.groups.remove(groupId));
    if (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } else {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setDeleteConfirm(null);
    }
    setDeleting(false);
  };

  const toggleExpandPlayer = async (groupId: number) => {
    if (expandedPlayer === groupId) {
      setExpandedPlayer(null);
      return;
    }

    setExpandedPlayer(groupId);
    setLoadingDetails(true);

    const [err, data] = await tryCatch(
      Promise.all([
        api.groups.queue(groupId),
        api.groups.history(groupId, 5),
      ]),
    );
    if (!err && data) {
      setPlayerQueue(data[0]);
      setPlayerHistory(data[1]);
    }
    setLoadingDetails(false);
  };

  const handleRemoteAction = async (
    groupId: number,
    action: string,
    body?: any,
  ) => {
    let apiCall: Promise<unknown> | undefined;
    switch (action) {
      case "pause":
        apiCall = api.groups.pause(groupId);
        break;
      case "resume":
        apiCall = api.groups.resume(groupId);
        break;
      case "stop":
        apiCall = api.groups.stop(groupId);
        break;
      case "skip":
        apiCall = api.groups.skip(groupId);
        break;
      case "volume":
        apiCall = api.groups.setVolume(groupId, body.volume);
        break;
    }

    const [actionErr] = await tryCatch(apiCall!);
    if (actionErr) {
      setError(actionErr instanceof Error ? actionErr.message : `Failed to ${action}`);
      return;
    }

    const [listErr, listData] = await tryCatch(api.groups.list());
    if (listErr) {
      setError(listErr instanceof Error ? listErr.message : `Failed to refresh`);
      return;
    }
    setGroups(listData);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-spotify-green" />
          <h1 className="text-section-title font-title font-bold">Players</h1>
        </div>
        <Button variant="outline" onClick={() => router.push("/")}>
          <Music className="w-4 h-4" />
          <span>Home</span>
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-6 mb-6">
          <p className="text-body-medium text-text-negative">{error}</p>
        </Card>
      )}

      {/* Empty State */}
      {!error && groups.length === 0 && (
        <Card className="p-12 text-center">
          <Music className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h2 className="text-feature-heading font-semibold mb-2">
            No Players Found
          </h2>
          <p className="text-body-medium text-text-secondary">
            No active players or groups available.
          </p>
        </Card>
      )}

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="p-6">
            {/* Player Header */}
            <div className="flex items-center justify-between mb-4">
              <div
                onClick={() => router.push(`/players/${group.id}`)}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80"
              >
                {getStatusIcon(group.status)}
                <div>
                  <h3 className="text-feature-heading font-semibold">
                    {group.name || `Group ${group.id}`}
                  </h3>
                  <p className="text-caption text-text-secondary">
                    {getStatusText(group.status)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpandPlayer(group.id);
                  }}
                  title="View details"
                >
                  {expandedPlayer === group.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(group.id);
                  }}
                  className="hover:text-text-negative"
                  title="Delete player"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Now Playing */}
            {group.title && (
              <div className="mb-4 p-3 bg-bg-surface rounded-md">
                <p className="text-caption text-text-secondary mb-1">
                  Now Playing
                </p>
                <p className="text-body-medium font-medium truncate">
                  {group.title}
                </p>
                {group.requestedBy && (
                  <p className="text-caption text-text-secondary mt-1">
                    by {group.requestedBy}
                  </p>
                )}
              </div>
            )}

            {/* Remote Controls */}
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoteAction(
                    group.id,
                    group.status === "playing" ? "pause" : "resume",
                  );
                }}
                title={group.status === "playing" ? "Pause" : "Play"}
              >
                {group.status === "playing" ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoteAction(group.id, "stop");
                }}
                title="Stop"
              >
                <Square className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoteAction(group.id, "skip");
                }}
                title="Skip"
              >
                <SkipForward className="w-3 h-3" />
              </Button>
              <div className="flex items-center gap-1 ml-auto">
                <Volume2 className="w-3 h-3 text-text-secondary" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={group.volume}
                  onChange={(e) => {
                    e.stopPropagation();
                    const volume = parseInt(e.target.value, 10);
                    handleRemoteAction(group.id, "volume", { volume });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-16 h-1 accent-spotify-green"
                  title={`Volume: ${group.volume}%`}
                />
              </div>
            </div>

            {/* Expanded Details */}
            {expandedPlayer === group.id && (
              <div className="mt-4 pt-4 border-t border-bg-surface">
                {loadingDetails ? (
                  <LoadingOverlay size="sm" className="py-4" />
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-caption font-semibold text-text-secondary mb-2">
                        Queue ({playerQueue.length})
                      </h4>
                      {playerQueue.length === 0 ? (
                        <p className="text-caption text-text-secondary">
                          Empty
                        </p>
                      ) : (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {playerQueue.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="text-caption truncate"
                            >
                              {idx + 1}. {item.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-caption font-semibold text-text-secondary mb-2">
                        Recently Played
                      </h4>
                      {playerHistory.length === 0 ? (
                        <p className="text-caption text-text-secondary">
                          No history
                        </p>
                      ) : (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {playerHistory.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="text-caption truncate"
                            >
                              {item.title}
                              {item.requestedBy && (
                                <span className="text-text-secondary">
                                  {" "}
                                  by {item.requestedBy}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-feature-heading font-semibold">
                Delete Player
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteConfirm(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-body-medium text-text-secondary mb-6">
              Are you sure you want to delete group{" "}
              <span className="text-text-base font-semibold">
                {deleteConfirm}
              </span>
              ? This will remove all queue and history data.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  deleteConfirm !== null && handleDelete(deleteConfirm)
                }
                disabled={deleting}
              >
                {deleting ? (
                  <LoadingOverlay size="sm" className="flex-none" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
