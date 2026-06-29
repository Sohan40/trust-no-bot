"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  Send,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type {
  AvailableAction,
  Phase,
  PlayerId,
  PublicPlayer,
  VisibleGameState,
} from "@/lib/game/types";

type ActionPanelProps = {
  state: VisibleGameState;
  pendingAction: AvailableAction | null;
  error: string | null;
  onAdvance: () => Promise<boolean>;
  onAskQuestion: (
    question: string,
    targetPlayerId?: PlayerId,
  ) => Promise<boolean>;
  onVote: (targetPlayerId: string) => Promise<boolean>;
};

export function ActionPanel({
  state,
  pendingAction,
  error,
  onAdvance,
  onAskQuestion,
  onVote,
}: ActionPanelProps) {
  const [question, setQuestion] = useState("");
  const [targetPlayerId, setTargetPlayerId] = useState<string>("all");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isVoteOpen, setIsVoteOpen] = useState(false);
  const canAdvance = state.availableActions.includes("ADVANCE_PHASE");
  const canAsk = state.availableActions.includes("ASK_QUESTION");
  const canVote = state.availableActions.includes("VOTE");
  const voteTargets = state.publicPlayers.filter(
    (player) => player.isAlive && player.id !== state.humanPlayerId,
  );
  const isBusy = pendingAction !== null;

  async function handleQuestionSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return;
    }

    const accepted = await onAskQuestion(
      trimmedQuestion,
      targetPlayerId === "all" ? undefined : targetPlayerId,
    );

    if (accepted) {
      setQuestion("");
      setTargetPlayerId("all");
    }
  }

  async function handleVoteSubmit(): Promise<void> {
    if (!selectedPlayerId) {
      return;
    }

    const accepted = await onVote(selectedPlayerId);

    if (accepted) {
      setSelectedPlayerId(null);
      setIsVoteOpen(false);
    }
  }

  return (
    <aside
      aria-busy={isBusy}
      className="self-start rounded-2xl border border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[color-mix(in_srgb,var(--panel)_72%,transparent)] p-4 backdrop-blur lg:sticky lg:top-20"
    >
      <div className="mb-4">
        <h2 className="font-mono-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
          Action
        </h2>
        <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_78%,transparent)]">
          {getPhaseInstruction(state.game.phase, state.privateInfo.role)}
        </p>
      </div>

      {error ? (
        <p
          className="mb-4 rounded-lg border border-[color-mix(in_srgb,var(--danger)_44%,transparent)] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-3 py-2 text-sm leading-5 text-[var(--danger-strong)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {canAsk ? (
        <form className="flex flex-col gap-2" onSubmit={handleQuestionSubmit}>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="question-target">
              Question target
            </label>
            <select
              className="focus-ring rounded-lg border border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[var(--surface)] px-2.5 py-2 font-mono-label text-[11px] uppercase tracking-wider text-[var(--foreground)] outline-none"
              disabled={isBusy}
              id="question-target"
              onChange={(event) => setTargetPlayerId(event.target.value)}
              value={targetPlayerId}
            >
              <option value="all">All players</option>
              {voteTargets.map((player) => (
                <option key={player.id} value={player.id}>
                  → {player.displayName}
                </option>
              ))}
            </select>
            {canAdvance ? (
              <button
                className="focus-ring ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,var(--danger)_45%,transparent)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-3 py-2 text-xs font-semibold text-[var(--danger-strong)] transition hover:bg-[color-mix(in_srgb,var(--danger)_18%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isBusy}
                onClick={() => void onAdvance()}
                type="button"
              >
                <Crosshair className="size-3.5" aria-hidden="true" />
                {pendingAction === "ADVANCE_PHASE"
                  ? "Skipping..."
                  : getAdvanceLabel(state.game.phase)}
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="question">
              Ask a question
            </label>
            <input
              className="focus-ring min-w-0 flex-1 rounded-xl border border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[color-mix(in_srgb,var(--muted)_72%,transparent)]"
              disabled={isBusy}
              id="question"
              maxLength={500}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a question..."
              value={question}
            />
            <button
              aria-label="Send question"
              className="focus-ring grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isBusy || question.trim().length === 0}
              type="submit"
            >
              <Send className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Public question</span>
            <span>{question.length}/500</span>
          </div>
        </form>
      ) : null}

      {canVote ? (
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 text-xs leading-5 text-[var(--muted)]">
            Vote required. Choose who to eliminate.
          </p>
          <button
            className="glow-danger focus-ring inline-flex items-center gap-1.5 rounded-xl bg-[var(--danger)] px-4 py-3 text-sm font-semibold text-[var(--danger-foreground)] transition hover:bg-[var(--danger-strong)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isBusy}
            onClick={() => setIsVoteOpen(true)}
            type="button"
          >
            <Crosshair className="size-4" aria-hidden="true" />
            Open vote
          </button>
        </div>
      ) : null}

      {canAdvance && !canAsk ? (
        <button
          className="glow-amber focus-ring min-h-12 w-full rounded-xl border border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[var(--accent)] px-4 text-sm font-bold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isBusy}
          onClick={() => void onAdvance()}
          type="button"
        >
          {pendingAction === "ADVANCE_PHASE"
            ? "Advancing..."
            : getAdvanceLabel(state.game.phase)}
        </button>
      ) : null}

      {!canAdvance && !canAsk && !canVote ? (
        <p className="rounded-lg border border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[var(--surface)] px-3 py-3 text-sm leading-6 text-[var(--muted)]">
          The room is waiting for the next server update.
        </p>
      ) : null}

      {isVoteOpen ? (
        <VoteModal
          isBusy={isBusy}
          onClose={() => setIsVoteOpen(false)}
          onConfirm={() => void handleVoteSubmit()}
          players={voteTargets}
          selectedPlayerId={selectedPlayerId}
          setSelectedPlayerId={setSelectedPlayerId}
        />
      ) : null}
    </aside>
  );
}

function VoteModal({
  isBusy,
  onClose,
  onConfirm,
  players,
  selectedPlayerId,
  setSelectedPlayerId,
}: {
  isBusy: boolean;
  onClose: () => void;
  onConfirm: () => void;
  players: PublicPlayer[];
  selectedPlayerId: string | null;
  setSelectedPlayerId: (playerId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#101116]/85 backdrop-blur-sm sm:items-center">
      <section
        aria-labelledby="vote-title"
        aria-modal="true"
        className="glow-danger fade-up w-full max-w-md rounded-t-3xl border border-[color-mix(in_srgb,var(--danger)_45%,transparent)] bg-[var(--panel)] p-5 sm:rounded-2xl"
        role="dialog"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--danger)_16%,transparent)] text-[var(--danger-strong)]">
            <Crosshair className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono-label text-[10px] uppercase tracking-wider text-[var(--danger-strong)]">
              vote · final
            </div>
            <h2
              className="text-lg font-bold leading-tight text-[var(--foreground)]"
              id="vote-title"
            >
              Eliminate who?
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Roles stay hidden. Confirm only when you&apos;re sure.
            </p>
          </div>
          <button
            aria-label="Close vote modal"
            className="focus-ring text-[var(--muted)] transition hover:text-[var(--foreground)]"
            onClick={onClose}
            type="button"
          >
            <XCircle className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mb-4 max-h-[45vh] space-y-1.5 overflow-y-auto">
          {players.map((player) => {
            const isSelected = selectedPlayerId === player.id;
            const suspicion = Math.round(player.suspicion * 100);

            return (
              <button
                aria-pressed={isSelected}
                className={
                  isSelected
                    ? "glow-danger focus-ring flex w-full items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--danger)_62%,transparent)] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] p-3 text-left transition"
                    : "focus-ring flex w-full items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[var(--surface)] p-3 text-left transition hover:border-[var(--line)]"
                }
                disabled={isBusy}
                key={player.id}
                onClick={() => setSelectedPlayerId(player.id)}
                type="button"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--surface-elevated)] text-xs font-bold uppercase text-[var(--foreground)]">
                  {player.displayName.slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[var(--foreground)]">
                    {player.displayName}
                  </span>
                  <span className="block truncate text-[11px] text-[var(--muted)]">
                    {player.publicStyle} · suspicion {suspicion}%
                  </span>
                </span>
                <span
                  className={
                    isSelected
                      ? "grid size-5 place-items-center rounded-full border border-[var(--danger)] bg-[var(--danger)] text-[var(--danger-foreground)]"
                      : "grid size-5 place-items-center rounded-full border border-[var(--line)]"
                  }
                >
                  {isSelected ? (
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-3 flex items-start gap-2 rounded-lg border border-[color-mix(in_srgb,var(--warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--warning)_7%,transparent)] p-2.5 text-[11px] text-[var(--warning)]">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Votes are final. If you eliminate a Villager, the Mafia grows
          stronger.
        </div>

        <button
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--danger)] px-4 py-3.5 text-sm font-semibold text-[var(--danger-foreground)] transition hover:bg-[var(--danger-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isBusy || !selectedPlayerId}
          onClick={onConfirm}
          type="button"
        >
          Confirm Vote
        </button>
      </section>
    </div>
  );
}

function getAdvanceLabel(phase: Phase): string {
  switch (phase) {
    case "ROLE_REVEAL":
      return "Enter Room";
    case "NIGHT_ACTIONS":
      return "Resolve Night";
    case "DAY_DISCUSSION":
      return "Continue Discussion";
    case "PLAYER_QUESTION":
      return "Skip to Vote";
    default:
      return "Advance Phase";
  }
}

function getPhaseInstruction(phase: Phase, role: string): string {
  switch (phase) {
    case "ROLE_REVEAL":
      return `You are the ${role}. Keep the other roles hidden and enter when ready.`;
    case "NIGHT_ACTIONS":
      return "Hidden roles are choosing their deterministic night actions.";
    case "DAY_DISCUSSION":
      return "Read the room, then continue when you are ready to question the players.";
    case "PLAYER_QUESTION":
      return "Ask one public question, or skip directly to the vote.";
    case "VOTING":
      return "Choose one living AI player. Your vote is final for this day.";
    default:
      return "Follow the available action to continue the game.";
  }
}
