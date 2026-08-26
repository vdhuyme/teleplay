"use client";

import { useParams } from "next/navigation";
import { Player } from "@/components/Player";

export default function PlayerPage() {
  const params = useParams();
  const playerId = params.playerId as string;

  return <Player playerId={playerId} />;
}
