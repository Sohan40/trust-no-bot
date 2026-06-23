import { ActionPanel } from "@/components/game/ActionPanel";
import { PlayerCard } from "@/components/game/PlayerCard";
import { Transcript } from "@/components/game/Transcript";
import { getHumanPlayer, getPublicPlayers } from "@/lib/game/mock-state";
import type { Game } from "@/lib/game/types";

type GameShellProps = {
  game: Game;
};

export function GameShell({ game }: GameShellProps) {
  const publicPlayers = getPublicPlayers(game);
  const human = getHumanPlayer(game);

  return (
    <main className="min-h-screen bg-[#090a0f]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-rows-[auto_1fr] gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-[#242b3b] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <a className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f3d48d]" href="/">
              Trust No Bot
            </a>
            <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Classic Room
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:flex">
            <div className="rounded-md border border-[#30384b] bg-[#121722] px-3 py-2">
              <span className="block text-xs text-[#96a1b4]">Phase</span>
              <strong className="text-[#f5f7fb]">{game.phaseLabel}</strong>
            </div>
            <div className="rounded-md border border-[#30384b] bg-[#121722] px-3 py-2">
              <span className="block text-xs text-[#96a1b4]">Your role</span>
              <strong className="text-[#f5f7fb]">{human.role}</strong>
            </div>
          </div>
        </header>

        <section className="grid min-h-0 gap-4 lg:grid-cols-[280px_1fr_320px]">
          <aside className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#aab4c5]">
                Players
              </h2>
              <span className="text-xs text-[#7f8ba0]">{game.players.filter((player) => player.isAlive).length} alive</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:overflow-visible lg:pb-0">
              {publicPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </aside>

          <Transcript messages={game.messages} />

          <ActionPanel game={game} humanRole={human.role} />
        </section>
      </div>
    </main>
  );
}
