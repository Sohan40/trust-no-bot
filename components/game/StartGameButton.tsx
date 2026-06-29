"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { startClassicGame } from "@/lib/game/client";

type StartGameButtonProps = {
  children?: ReactNode;
  className?: string;
  label?: string;
};

export function StartGameButton({
  children,
  className,
  label = "Start Game",
}: StartGameButtonProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart(): Promise<void> {
    setIsStarting(true);
    setError(null);

    try {
      const state = await startClassicGame();
      router.push(`/game/${state.game.id}`);
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : "The game could not be started.",
      );
      setIsStarting(false);
    }
  }

  return (
    <div>
      <button
        aria-busy={isStarting}
        className={className}
        disabled={isStarting}
        onClick={handleStart}
        type="button"
      >
        {isStarting ? "Starting Game..." : (children ?? label)}
      </button>
      {error ? (
        <p
          className="mt-2 max-w-sm text-sm leading-5 text-[var(--danger-strong)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
