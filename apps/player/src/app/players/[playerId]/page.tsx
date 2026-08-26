import { Player } from "@/components/Player";

interface PlayerPageProps {
  params: Promise<{ playerId: string }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { playerId } = await params;

  return <Player playerId={playerId} />;
}
