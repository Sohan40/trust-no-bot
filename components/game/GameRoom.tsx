"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { StartGameButton } from "@/components/game/StartGameButton";
import {
  loadVisibleGame,
  submitGameAction,
  submitGameVote,
} from "@/lib/game/client";
import type {
  AvailableAction,
  VisibleGameState,
} from "@/lib/game/types";

type GameRoomProps = {
  gameId: string;
};

export function GameRoom({ gameId }: GameRoomProps) {
  const [state, setState] = useState<VisibleGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<AvailableAction | null>(
    null,
  );

  const loadGame = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      setIsLoading(true);
      setLoadError(null);
      setState(null);

      try {
        const nextState = await loadVisibleGame(gameId, signal);
        setState(nextState);
      } catch (loadFailure) {
        if (isAbortError(loadFailure)) {
          return;
        }

        setLoadError(getErrorMessage(loadFailure, "The game could not be loaded."));
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [gameId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadGame(controller.signal);

    return () => controller.abort();
  }, [loadGame]);

  async function runAction(
    action: AvailableAction,
    request: () => Promise<VisibleGameState>,
  ): Promise<boolean> {
    setPendingAction(action);
    setActionError(null);

    try {
      const nextState = await request();
      setState(nextState);
      return true;
    } catch (actionFailure) {
      setActionError(
        getErrorMessage(actionFailure, "The action could not be completed."),
      );
      return false;
    } finally {
      setPendingAction(null);
    }
  }

  if (isLoading && !state) {
    return <GameLoadingState />;
  }

  if (!state) {
    return (
      <GameLoadError
        error={loadError ?? "The game could not be loaded."}
        onRetry={() => void loadGame()}
      />
    );
  }

  return (
    <GameShell
      actionError={actionError}
      onAdvance={() =>
        runAction("ADVANCE_PHASE", () =>
          submitGameAction(gameId, "ADVANCE_PHASE"),
        )
      }
      onAskQuestion={(question, targetPlayerId) =>
        runAction("ASK_QUESTION", () =>
          submitGameAction(gameId, "ASK_QUESTION", { question, targetPlayerId }),
        )
      }
      onVote={(targetPlayerId) =>
        runAction("VOTE", () => submitGameVote(gameId, targetPlayerId))
      }
      pendingAction={pendingAction}
      state={state}
    />
  );
}

function GameLoadingState() {
  return (
    <main className="tnb-page relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <div className="scanlines pointer-events-none absolute inset-0 opacity-60" />
      <div
        aria-live="polite"
        className="glow-amber relative w-full max-w-md rounded-2xl border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--panel)_76%,transparent)] p-6 text-center backdrop-blur"
        role="status"
      >
        <div className="pulse-ring mx-auto size-10 rounded-full bg-[var(--accent)]" />
        <h1 className="mt-5 text-xl font-black text-[var(--foreground)]">
          Opening the room
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Loading the latest persisted game state.
        </p>
      </div>
    </main>
  );
}

function GameLoadError({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <main className="tnb-page relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <div className="scanlines pointer-events-none absolute inset-0 opacity-60" />
      <section className="glow-danger relative w-full max-w-md rounded-2xl border border-[color-mix(in_srgb,var(--danger)_45%,transparent)] bg-[color-mix(in_srgb,var(--panel)_82%,transparent)] p-6 backdrop-blur">
        <Link
          className="font-mono-label text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]"
          href="/"
        >
          trust_no_bot.exe
        </Link>
        <h1 className="mt-5 text-2xl font-black text-[var(--foreground)]">
          The room could not open
        </h1>
        <p className="mt-3 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_82%,transparent)]" role="alert">
          {error}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            className="focus-ring min-h-11 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-[var(--accent-foreground)]"
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
          <StartGameButton
            className="focus-ring min-h-11 w-full rounded-xl border border-[color-mix(in_srgb,var(--line)_76%,transparent)] px-4 text-sm font-semibold text-[var(--foreground)]"
            label="Start New Game"
          />
        </div>
      </section>
    </main>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
