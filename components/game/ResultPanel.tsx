import { RotateCcw, Share2 } from "lucide-react";
import { ShareResultButton } from "@/components/game/ShareResultButton";
import { StartGameButton } from "@/components/game/StartGameButton";
import { getRoleIcon } from "@/components/game/RoleReveal";
import type { VisibleGameState } from "@/lib/game/types";

type ResultPanelProps = {
  state: VisibleGameState;
};

export function ResultPanel({ state }: ResultPanelProps) {
  const villageWon = state.game.winner === "villagers";
  const result = state.result;
  const human = state.publicPlayers.find(
    (player) => player.id === state.humanPlayerId,
  );
  const aliveCount = state.publicPlayers.filter((player) => player.isAlive).length;
  const shareText =
    result?.shareText ??
    `I played Trust No Bot.\nResult: ${
      villageWon ? "Won" : "Lost"
    }\nMode: Classic`;

  return (
    <section className="mx-auto max-w-2xl space-y-4 py-2">
      <div
        className={
          villageWon
            ? "fade-up rounded-2xl border border-[color-mix(in_srgb,var(--success)_42%,transparent)] bg-[color-mix(in_srgb,var(--success)_7%,transparent)] p-6 text-center backdrop-blur"
            : "glow-danger fade-up rounded-2xl border border-[color-mix(in_srgb,var(--danger)_42%,transparent)] bg-[color-mix(in_srgb,var(--danger)_7%,transparent)] p-6 text-center backdrop-blur"
        }
      >
        <div className="font-mono-label text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">
          Game over · Day {state.game.dayNumber}
        </div>
        <h1
          className={
            villageWon
              ? "text-glow mt-1 text-4xl font-bold tracking-normal text-[var(--success)]"
              : "text-glow mt-1 text-4xl font-bold tracking-normal text-[var(--danger-strong)]"
          }
        >
          {villageWon ? "Villagers Win" : "Mafia Wins"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {human?.isAlive ? "You survived the round." : "You were eliminated."}
        </p>
        {result?.summary ? (
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_84%,transparent)]">
            {result.summary}
          </p>
        ) : null}
      </div>

      <div className="fade-up rounded-2xl border border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[color-mix(in_srgb,var(--panel)_70%,transparent)] p-5 backdrop-blur">
        <div className="font-mono-label mb-3 text-[10px] uppercase tracking-wider text-[var(--muted)]">
          Revealed roles
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {state.publicPlayers.map((player) => {
            const role = player.role ?? "Villager";
            const Icon = getRoleIcon(role);
            const isMafia = player.role === "Mafia";

            return (
              <div
                className={
                  isMafia
                    ? "flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--danger)_54%,transparent)] bg-[var(--surface)] p-2.5"
                    : "flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[var(--surface)] p-2.5"
                }
                key={player.id}
              >
                <div
                  className={
                    isMafia
                      ? "grid size-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--danger)_16%,transparent)] text-[var(--danger-strong)]"
                      : "grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--surface-elevated)] text-[color-mix(in_srgb,var(--foreground)_82%,transparent)]"
                  }
                >
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {player.displayName}
                  </div>
                  <div
                    className={
                      isMafia
                        ? "text-[11px] text-[var(--danger-strong)]"
                        : "text-[11px] text-[var(--muted)]"
                    }
                  >
                    {player.role ?? "Hidden"}
                    {!player.isAlive ? " · dead" : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Result" value={villageWon ? "Village held" : "Mafia survived"} tone={villageWon ? "success" : "danger"} />
        <Stat label="Survivors" value={`${aliveCount} alive`} />
        <Stat label="Your role" value={state.privateInfo.role} />
      </div>

      <div className="glow-amber fade-up rounded-2xl border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] p-5 backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-mono-label text-[10px] uppercase tracking-wider text-[var(--accent)]">
            share card
          </div>
          <Share2 className="size-3.5 text-[var(--accent)]" aria-hidden="true" />
        </div>
        <pre className="whitespace-pre-wrap rounded-lg border border-[color-mix(in_srgb,var(--line)_70%,transparent)] bg-[color-mix(in_srgb,#101116_76%,transparent)] p-3 font-mono-label text-xs leading-relaxed text-[color-mix(in_srgb,var(--foreground)_92%,transparent)]">
          {shareText}
        </pre>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <ShareResultButton shareText={shareText} />
        <StartGameButton className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--line)_70%,transparent)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] disabled:cursor-wait disabled:opacity-70">
          <RotateCcw className="size-4" aria-hidden="true" />
          Replay
        </StartGameButton>
      </div>
    </section>
  );
}

function Stat({
  label,
  tone,
  value,
}: {
  label: string;
  tone?: "success" | "danger";
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[color-mix(in_srgb,var(--panel)_70%,transparent)] p-4 backdrop-blur">
      <div className="font-mono-label text-[10px] uppercase tracking-wider text-[var(--muted)]">
        {label}
      </div>
      <div
        className={
          tone === "success"
            ? "mt-1 text-sm font-semibold text-[var(--success)]"
            : tone === "danger"
              ? "mt-1 text-sm font-semibold text-[var(--danger-strong)]"
              : "mt-1 text-sm font-semibold text-[var(--foreground)]"
        }
      >
        {value}
      </div>
    </div>
  );
}
