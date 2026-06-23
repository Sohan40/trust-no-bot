import { GameShell } from "@/components/game/GameShell";
import { createMockGame } from "@/lib/game/mock-state";

export default function GamePage() {
  const game = createMockGame("phase-0-demo");

  return <GameShell game={game} />;
}
