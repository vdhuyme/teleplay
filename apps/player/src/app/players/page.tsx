import { PlayerList } from "@/components/player-list/PlayerList";

export const metadata = {
  title: "Players - Teleplay",
  description: "Manage your Telegram bot players.",
};

export default function PlayersPage() {
  return <PlayerList />;
}
