"use client";

import { useState } from "react";
import type {
  AvailableAction,
  Phase,
  VisibleGameState,
} from "@/lib/game/types";

type ActionPanelProps = {
  state: VisibleGameState;
  pendingAction: AvailableAction | null;
  error: string | null;
  onAdvance: () => Promise<boolean>;
  onAskQuestion: (question: string) => Promise<boolean>;
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
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
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

    const accepted = await onAskQuestion(trimmedQuestion);

    if (accepted) {
      setQuestion("");
    }
  }

  async function handleVoteSubmit(): Promise<void> {
    if (!selectedPlayerId) {
      return;
    }

    const accepted = await onVote(selectedPlayerId);

    if (accepted) {
      setSelectedPlayerId(null);
    }
  }

  return (
    <aside
      aria-busy={isBusy}
      className="self-start rounded-lg border border-[#2d3547] bg-[#121722] p-4 lg:sticky lg:top-4"
    >
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#aab4c5]">
          Action
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#c8d0df]">
          {getPhaseInstruction(state.game.phase, state.privateInfo.role)}
        </p>
      </div>

      {error ? (
        <p
          className="mb-4 rounded-md border border-[#633b45] bg-[#24151a] px-3 py-2 text-sm leading-5 text-[#f0a5af]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {canAsk ? (
        <form onSubmit={handleQuestionSubmit}>
          <label
            className="block text-sm font-semibold text-[#f5f7fb]"
            htmlFor="question"
          >
            Ask the room
          </label>
          <textarea
            className="focus-ring mt-2 min-h-28 w-full resize-none rounded-md border border-[#354059] bg-[#0c1018] px-3 py-3 text-sm text-white placeholder:text-[#6f7b91]"
            disabled={isBusy}
            id="question"
            maxLength={500}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What made you suspicious during the last discussion?"
            value={question}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-[#7f8ba0]">
            <span>Public question</span>
            <span>{question.length}/500</span>
          </div>
          <button
            className="focus-ring mt-4 min-h-11 w-full rounded-md bg-[#e3b75f] px-4 text-sm font-bold text-[#12100a] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isBusy || question.trim().length === 0}
            type="submit"
          >
            {pendingAction === "ASK_QUESTION" ? "Asking..." : "Ask Room"}
          </button>
        </form>
      ) : null}

      {canVote ? (
        <div>
          <fieldset disabled={isBusy}>
            <legend className="text-sm font-semibold text-[#f5f7fb]">
              Choose one player
            </legend>
            <div className="mt-3 grid gap-2">
              {voteTargets.map((player) => {
                const isSelected = selectedPlayerId === player.id;

                return (
                  <button
                    aria-pressed={isSelected}
                    className={
                      isSelected
                        ? "focus-ring flex min-h-11 items-center justify-between rounded-md border border-[#e3b75f] bg-[#272315] px-3 text-left text-sm text-white"
                        : "focus-ring flex min-h-11 items-center justify-between rounded-md border border-[#30384d] bg-[#151b28] px-3 text-left text-sm text-[#d8deea] hover:border-[#59647d]"
                    }
                    key={player.id}
                    onClick={() => setSelectedPlayerId(player.id)}
                    type="button"
                  >
                    <span>{player.displayName}</span>
                    <span className="text-xs text-[#aeb7c7]">
                      {isSelected ? "Selected" : "Choose"}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
          <button
            className="focus-ring mt-4 min-h-11 w-full rounded-md bg-[#e3b75f] px-4 text-sm font-bold text-[#12100a] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isBusy || !selectedPlayerId}
            onClick={handleVoteSubmit}
            type="button"
          >
            {pendingAction === "VOTE" ? "Submitting Vote..." : "Confirm Vote"}
          </button>
        </div>
      ) : null}

      {canAdvance ? (
        <button
          className={
            canAsk
              ? "focus-ring mt-3 min-h-11 w-full rounded-md border border-[#3a4257] px-4 text-sm font-semibold text-[#f3f5fa] disabled:cursor-not-allowed disabled:opacity-50"
              : "focus-ring min-h-11 w-full rounded-md bg-[#e3b75f] px-4 text-sm font-bold text-[#12100a] disabled:cursor-not-allowed disabled:opacity-50"
          }
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
        <p className="rounded-md border border-[#30384d] bg-[#0f141e] px-3 py-3 text-sm leading-6 text-[#aab4c5]">
          The room is waiting for the next server update.
        </p>
      ) : null}
    </aside>
  );
}

function getAdvanceLabel(phase: Phase): string {
  switch (phase) {
    case "ROLE_REVEAL":
      return "Begin Night";
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
      return `You are the ${role}. Keep the other roles hidden and begin when ready.`;
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