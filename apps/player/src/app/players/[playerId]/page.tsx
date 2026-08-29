import { Player } from '@/components/Player';
import { tryCatch } from '@teleplay/core';
import { notFound } from 'next/navigation';
import * as api from '@/api';

export const metadata = {
  title: 'Player Details - Teleplay',
  description: 'View and manage a specific Telegram bot player.',
};

interface PlayerPageProps {
  params: Promise<{ playerId: string }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { playerId } = await params;

  const [err, result] = await tryCatch(api.groups.getGroup(Number(playerId)));

  if (err || !result.data) {
    notFound();
  }

  const group = result.data;

  const playerState: api.players.PlayerState = {
    id: group.id,
    name: group.name,
    status: group.status,
    videoId: group.videoId,
    title: group.title,
    thumbnail: group.thumbnail,
    duration: group.duration,
    position: group.position,
    volume: group.volume,
    requestedBy: group.requestedBy,
  };

  return <Player player={playerState} />;
}
