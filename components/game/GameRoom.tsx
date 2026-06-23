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
      onAskQuestion={(question) =>
        runAction("ASK_QUESTION", () =>
          submitGameAction(gameId, "ASK_QUESTION", { question }),
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
    <main className="flex min-h-screen items-center justify-center bg-[#090a0f] px-5">
      <div
        aria-live="polite"
        className="w-full max-w-md rounded-lg border border-[#2d3547] bg-[#121722] p-6 text-center"
        role="status"
      >
        <div className="mx-auto size-10 animate-pulse rounded-full bg-[#e3b75f]" />
        <h1 className="mt-5 text-xl font-black text-white">
          Opening the room
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#aab4c5]">
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
    <main className="flex min-h-screen items-center justify-center bg-[#090a0f] px-5">
      <section className="w-full max-w-md rounded-lg border border-[#4d3038] bg-[#17131a] p-6">
        <Link
          className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f3d48d]"
          href="/"
        >
          Trust No Bot
        </Link>
        <h1 className="mt-5 text-2xl font-black text-white">
          The room could not open
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#d3c3c8]" role="alert">
          {error}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            className="focus-ring min-h-11 rounded-md bg-[#e3b75f] px-4 text-sm font-bold text-[#12100a]"
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
          <StartGameButton
            className="focus-ring min-h-11 w-full rounded-md border border-[#4a5266] px-4 text-sm font-semibold text-white"
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