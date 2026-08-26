"use client";

import { Music, ListMusic } from "lucide-react";
import type { QueueItem as ApiQueueItem } from "@/api/players";

interface QueueProps {
  items: ApiQueueItem[];
}

export function Queue({ items }: QueueProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="card-spotify h-full">
      <div className="flex items-center gap-2 mb-4">
        <ListMusic className="w-5 h-5 text-text-secondary" />
        <h3 className="text-feature-heading font-ui font-semibold">Queue</h3>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <Music className="w-10 h-10 text-text-secondary mx-auto mb-3" />
          <p className="text-body-medium text-text-secondary">
            No songs in queue
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-bg-surface rounded-md"
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-body-medium text-text-base truncate">
                  {item.title}
                </p>
                <p className="text-caption text-text-secondary">
                  {formatDuration(item.duration)} · {item.requestedBy || "Unknown"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
