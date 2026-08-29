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

  const [err, result] = await tryCatch(api.players.getState(Number(playerId)));

  if (err) {
    notFound();
  }

  return <Player player={result.data} />;
}
