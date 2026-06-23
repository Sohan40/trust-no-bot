import Link from "next/link";
import { ActionPanel } from "@/components/game/ActionPanel";
import { PlayerCard } from "@/components/game/PlayerCard";
import { ResultPanel } from "@/components/game/ResultPanel";
import { Transcript } from "@/components/game/Transcript";
import type {
  AvailableAction,
  VisibleGameState,
} from "@/lib/game/types";

type GameShellProps = {
  state: VisibleGameState;
  pendingAction: AvailableAction | null;
  actionError: string | null;
  onAdvance: () => Promise<boolean>;
  onAskQuestion: (question: string) => Promise<boolean>;
  onVote: (targetPlayerId: string) => Promise<boolean>;
};

export function GameShell({
  state,
  pendingAction,
  actionError,
  onAdvance,
  onAskQuestion,
  onVote,
}: GameShellProps) {
  const isComplete = state.game.status === "completed";
  const aliveCount = state.publicPlayers.filter(
    (player) => player.isAlive,
  ).length;

  return (
    <main className="min-h-screen bg-[#090a0f]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-rows-[auto_1fr] gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-[#242b3b] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f3d48d]"
              href="/"
            >
              Trust No Bot
            </Link>
            <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Classic Room
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:flex">
            <div className="rounded-md border border-[#30384b] bg-[#121722] px-3 py-2">
              <span className="block text-xs text-[#96a1b4]">Phase</span>
              <strong className="text-[#f5f7fb]">
                {state.game.phaseLabel}
              </strong>
            </div>
            <div className="rounded-md border border-[#30384b] bg-[#121722] px-3 py-2">
              <span className="block text-xs text-[#96a1b4]">Your role</span>
              <strong className="text-[#f5f7fb]">
                {state.privateInfo.role}
              </strong>
            </div>
          </div>
        </header>

        <section className="grid min-h-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#aab4c5]">
                Players
              </h2>
              <span className="text-xs text-[#7f8ba0]">
                {aliveCount} alive
              </span>
            </div>
            <div
              className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:overflow-visible lg:pb-0"
              key={state.game.id}
            >
              {state.publicPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  showRole={isComplete}
                />
              ))}
            </div>
          </aside>

          <div className="order-3 min-w-0 lg:order-none">
            <Transcript messages={state.messages} />
          </div>

          {isComplete ? (
            <div className="order-2 lg:order-none">
              <ResultPanel state={state} />
            </div>
          ) : (
            <div className="order-2 lg:order-none">
              <ActionPanel
                key={state.game.phase + ":" + state.game.dayNumber}
                error={actionError}
                onAdvance={onAdvance}
                onAskQuestion={onAskQuestion}
                onVote={onVote}
                pendingAction={pendingAction}
                state={state}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}