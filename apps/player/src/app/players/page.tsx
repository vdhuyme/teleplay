"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import * as api from "@/api";
import {
  Music,
  Play,
  Pause,
  SkipForward,
  Square,
  Volume2,
  Users,
  Clock,
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
  playerId: string;
  state: {
    status: "idle" | "playing" | "paused" | "stopped";
    videoId: string | null;
    title: string | null;
    thumbnail: string | null;
    duration: number | null;
    position: number;
    volume: number;
    requestedBy: string | null;
  } | null;
  queueCount: number;
  historyCount: number;
  lastActivity: Date | null;
}

export default function PlayersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [playerQueue, setPlayerQueue] = useState<any[]>([]);
  const [playerHistory, setPlayerHistory] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await api.groups.list();
        setGroups(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchGroups();
    }
  }, [status]);

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

  const formatLastActivity = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const handleDelete = async (playerId: string) => {
    setDeleting(true);
    try {
      await api.groups.remove(Number(playerId));
      setGroups((prev) => prev.filter((g) => g.playerId !== playerId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const toggleExpandPlayer = async (playerId: string) => {
    if (expandedPlayer === playerId) {
      setExpandedPlayer(null);
      return;
    }

    setExpandedPlayer(playerId);
    setLoadingDetails(true);

    try {
      const [queueData, historyData] = await Promise.all([
        api.groups.queue(Number(playerId)),
        api.groups.history(Number(playerId), 5),
      ]);
      setPlayerQueue(queueData);
      setPlayerHistory(historyData);
    } catch (err) {
      console.error("Failed to fetch player details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRemoteAction = async (
    playerId: string,
    action: string,
    body?: any,
  ) => {
    try {
      const id = Number(playerId);
      switch (action) {
        case "pause":
          await api.groups.pause(id);
          break;
        case "resume":
          await api.groups.resume(id);
          break;
        case "stop":
          await api.groups.stop(id);
          break;
        case "skip":
          await api.groups.skip(id);
          break;
        case "volume":
          await api.groups.setVolume(id, body.volume);
          break;
      }

      const data = await api.groups.list();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action}`);
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <LoadingOverlay size="lg" />
      </main>
    );
  }

  if (!session) {
    return null;
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
          <Card key={group.playerId} className="p-6">
            {/* Player Header */}
            <div className="flex items-center justify-between mb-4">
              <div
                onClick={() => router.push(`/players/${group.playerId}`)}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80"
              >
                {getStatusIcon(group.state?.status || "idle")}
                <div>
                  <h3 className="text-feature-heading font-semibold">
                    {group.playerId}
                  </h3>
                  <p className="text-caption text-text-secondary">
                    {getStatusText(group.state?.status || "idle")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpandPlayer(group.playerId);
                  }}
                  title="View details"
                >
                  {expandedPlayer === group.playerId ? (
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
                    setDeleteConfirm(group.playerId);
                  }}
                  className="hover:text-text-negative"
                  title="Delete player"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Now Playing */}
            {group.state?.title && (
              <div className="mb-4 p-3 bg-bg-surface rounded-md">
                <p className="text-caption text-text-secondary mb-1">
                  Now Playing
                </p>
                <p className="text-body-medium font-medium truncate">
                  {group.state.title}
                </p>
                {group.state.requestedBy && (
                  <p className="text-caption text-text-secondary mt-1">
                    by {group.state.requestedBy}
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
                    group.playerId,
                    group.state?.status === "playing" ? "pause" : "resume",
                  );
                }}
                title={group.state?.status === "playing" ? "Pause" : "Play"}
              >
                {group.state?.status === "playing" ? (
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
                  handleRemoteAction(group.playerId, "stop");
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
                  handleRemoteAction(group.playerId, "skip");
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
                  value={group.state?.volume || 80}
                  onChange={(e) => {
                    e.stopPropagation();
                    const volume = parseInt(e.target.value, 10);
                    handleRemoteAction(group.playerId, "volume", { volume });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-16 h-1 accent-spotify-green"
                  title={`Volume: ${group.state?.volume || 80}%`}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-caption text-text-secondary">
              <div className="flex items-center gap-1">
                <ListMusic className="w-4 h-4" />
                <span>{group.queueCount} in queue</span>
              </div>
              <div className="flex items-center gap-1">
                <History className="w-4 h-4" />
                <span>{group.historyCount} played</span>
              </div>
            </div>

            {/* Last Activity */}
            <div className="mt-4 pt-4 border-t border-bg-surface">
              <div className="flex items-center gap-2 text-caption text-text-secondary">
                <Clock className="w-4 h-4" />
                <span>
                  Last activity: {formatLastActivity(group.lastActivity)}
                </span>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedPlayer === group.playerId && (
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
              Are you sure you want to delete player{" "}
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
                onClick={() => handleDelete(deleteConfirm)}
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
