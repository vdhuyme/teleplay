import { Player } from "@/components/Player";

export const metadata = {
  title: "Player Details - Teleplay",
  description: "View and manage a specific Telegram bot player.",
};

interface PlayerPageProps {
  params: Promise<{ playerId: string }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { playerId } = await params;

  return <Player playerId={playerId} />;
}
