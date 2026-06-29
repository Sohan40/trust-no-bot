import Link from "next/link";
import { Bot, Moon, Sparkles, Users } from "lucide-react";
import { ActionPanel } from "@/components/game/ActionPanel";
import { PlayerCard } from "@/components/game/PlayerCard";
import { ResultPanel } from "@/components/game/ResultPanel";
import { RoleReveal, getRoleIcon } from "@/components/game/RoleReveal";
import { Transcript } from "@/components/game/Transcript";
import type {
  AvailableAction,
  PlayerId,
  VisibleGameState,
} from "@/lib/game/types";

type GameShellProps = {
  state: VisibleGameState;
  pendingAction: AvailableAction | null;
  actionError: string | null;
  onAdvance: () => Promise<boolean>;
  onAskQuestion: (
    question: string,
    targetPlayerId?: PlayerId,
  ) => Promise<boolean>;
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

  if (state.game.phase === "ROLE_REVEAL" && !isComplete) {
    return (
      <RoleReveal
        isBusy={pendingAction === "ADVANCE_PHASE"}
        onEnter={() => void onAdvance()}
        role={state.privateInfo.role}
      />
    );
  }

  return (
    <main className="tnb-page relative min-h-screen text-[var(--foreground)]">
      <div className="scanlines pointer-events-none fixed inset-0 opacity-60" />
      <PhaseHeader aliveCount={aliveCount} state={state} />

      {isComplete ? (
        <div className="relative mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <ResultPanel state={state} />
        </div>
      ) : (
        <>
          <div className="relative mx-auto grid w-full max-w-7xl gap-4 px-3 py-4 pb-36 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6 lg:pb-8">
            <div className="flex min-w-0 flex-col gap-4">
              <PlayerRail state={state} />
              <Transcript
                humanPlayerId={state.humanPlayerId}
                messages={state.messages}
                pendingAction={pendingAction}
              />
            </div>

            <aside className="contents lg:block">
              <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[color-mix(in_srgb,#101116_94%,transparent)] px-3 py-3 backdrop-blur-xl lg:sticky lg:top-20 lg:inset-auto lg:border-0 lg:bg-transparent lg:p-0">
                <ActionPanel
                  error={actionError}
                  onAdvance={onAdvance}
                  onAskQuestion={onAskQuestion}
                  onVote={onVote}
                  pendingAction={pendingAction}
                  state={state}
                />
              </div>

              <div className="hidden lg:mt-3 lg:block">
                <SidePanel state={state} />
              </div>
            </aside>
          </div>
        </>
      )}
    </main>
  );
}

function PhaseHeader({
  aliveCount,
  state,
}: {
  aliveCount: number;
  state: VisibleGameState;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[color-mix(in_srgb,#171820_88%,transparent)] backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link
          aria-label="Trust No Bot home"
          className="glow-amber grid size-9 shrink-0 place-items-center rounded-md border border-[color-mix(in_srgb,var(--line)_70%,transparent)] bg-[var(--surface)] text-[var(--accent)]"
          href="/"
        >
          <Bot className="flicker size-4" aria-hidden="true" />
        </Link>
        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]">
          <Moon className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono-label text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
            Trust No Bot · Classic
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-glow text-[var(--accent)]">
              Day {state.game.dayNumber}
            </span>
            <span className="text-[var(--muted)]">·</span>
            <span>{state.game.phaseLabel}</span>
            {state.game.status === "active" ? (
              <span className="font-mono-label ml-1 inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--line)_70%,transparent)] bg-[var(--surface)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <span className="pulse-ring size-1.5 rounded-full bg-[var(--accent)]" />
                live
              </span>
            ) : null}
          </div>
        </div>
        <div className="hidden items-center gap-2 text-xs text-[var(--muted)] sm:flex">
          <Users className="size-3.5" aria-hidden="true" />
          {aliveCount} alive
        </div>
      </div>
    </header>
  );
}

function PlayerRail({ state }: { state: VisibleGameState }) {
  const isComplete = state.game.status === "completed";

  return (
    <section className="-mx-3 overflow-x-auto px-3 lg:mx-0 lg:overflow-visible lg:px-0">
      <h2 className="sr-only">Players</h2>
      <div className="flex gap-2.5 lg:grid lg:grid-cols-7 lg:gap-2.5">
        {state.publicPlayers.map((player) => (
          <PlayerCard
            isHuman={player.id === state.humanPlayerId}
            key={player.id}
            player={player}
            showRole={isComplete}
          />
        ))}
      </div>
    </section>
  );
}

function SidePanel({ state }: { state: VisibleGameState }) {
  const RoleIcon = getRoleIcon(state.privateInfo.role);
  const privateMessages = state.messages
    .filter((message) => message.visibility === "private")
    .slice(-3);
  const logMessages = state.messages
    .filter((message) =>
      ["night_resolution", "vote_summary", "elimination", "game_over"].includes(
        message.intent ?? "",
      ),
    )
    .slice(-4);

  return (
    <div className="sticky top-20 flex flex-col gap-3">
      <section className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--panel)_70%,transparent)] p-4 backdrop-blur">
        <div className="mb-3 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]">
            <RoleIcon className="size-4" aria-hidden="true" />
          </div>
          <div>
            <div className="font-mono-label text-[10px] uppercase tracking-wider text-[var(--muted)]">
              Your role
            </div>
            <div className="text-sm font-semibold text-[var(--foreground)]">
              {state.privateInfo.role}
            </div>
          </div>
        </div>
        <p className="text-xs leading-5 text-[var(--muted)]">
          Find the Mafia. Trust nothing said too smoothly.
        </p>
      </section>

      <section className="rounded-2xl border border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[color-mix(in_srgb,var(--panel)_70%,transparent)] p-4 backdrop-blur">
        <div className="font-mono-label mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--muted)]">
          <Sparkles className="size-3.5 text-[var(--accent)]" aria-hidden="true" />
          Private clues
        </div>
        {privateMessages.length > 0 ? (
          <ul className="space-y-2 text-xs text-[color-mix(in_srgb,var(--foreground)_88%,transparent)]">
            {privateMessages.map((message) => (
              <li
                className="rounded-md border border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[var(--surface)] px-2.5 py-2"
                key={message.id}
              >
                {message.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-md border border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[var(--surface)] px-2.5 py-2 text-xs text-[var(--muted)]">
            No private clues yet.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[color-mix(in_srgb,var(--panel)_70%,transparent)] p-4 backdrop-blur">
        <div className="font-mono-label mb-2 text-[10px] uppercase tracking-wider text-[var(--muted)]">
          Game log
        </div>
        {logMessages.length > 0 ? (
          <ol className="space-y-1.5 text-[11px] text-[var(--muted)]">
            {logMessages.map((message) => (
              <li key={message.id}>
                <span className="text-[color-mix(in_srgb,var(--foreground)_82%,transparent)]">
                  {message.phaseLabel}
                </span>{" "}
                - {message.text}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[11px] text-[var(--muted)]">
            The log will fill as the night, vote, and result unfold.
          </p>
        )}
      </section>
    </div>
  );
}
