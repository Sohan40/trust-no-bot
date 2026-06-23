import { GameRoom } from "@/components/game/GameRoom";

type GamePageProps = {
  params: Promise<{
    gameId: string;
  }>;
};

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;

  return <GameRoom gameId={gameId} />;
}