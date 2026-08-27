import { useRouter } from 'next/navigation';
import { Music, Play, Pause, Trash2, Eye } from 'lucide-react';
import { Card } from '../Card';
import type { Group } from '@/api/groups';

interface PlayerCardProps {
  player: Group;
  onDelete: (id: number) => void;
  onExpand: (id: number) => void;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'playing':
      return <Play className="w-4 h-4 text-spotify-green" />;
    case 'paused':
      return <Pause className="w-4 h-4 text-yellow-500" />;
    default:
      return <Music className="w-4 h-4 text-text-secondary" />;
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'playing':
      return 'Playing';
    case 'paused':
      return 'Paused';
    case 'stopped':
      return 'Stopped';
    default:
      return 'Idle';
  }
}

export function PlayerCard({ player, onDelete, onExpand }: PlayerCardProps) {
  const router = useRouter();

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push(`/players/${player.id}`)}
        >
          {getStatusIcon(player.status)}
          <div>
            <h3 className="text-body-large font-semibold">
              {player.name || `Player ${player.id}`}
            </h3>
            <p className="text-caption text-text-secondary">
              {getStatusText(player.status)}
              {player.title && ` - ${player.title}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onExpand(player.id)}
            className="p-2 hover:bg-bg-surface rounded-md transition-colors"
            title="View queue & history"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(player.id)}
            className="p-2 hover:bg-bg-surface rounded-md transition-colors text-text-negative"
            title="Delete player"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
