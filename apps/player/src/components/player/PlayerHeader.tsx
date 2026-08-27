import { Music, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';

interface PlayerHeaderProps {
  connected: boolean;
}

export function PlayerHeader({ connected }: PlayerHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex">
          <Music className="w-8 h-8 text-spotify-green mr-2" />
          <h1 className="text-section-title font-title font-bold">Teleplay</h1>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {connected ? (
          <Wifi className="w-4 h-4 text-spotify-green" />
        ) : (
          <WifiOff className="w-4 h-4 text-text-negative" />
        )}
        <span className="text-caption text-text-secondary">
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
}
