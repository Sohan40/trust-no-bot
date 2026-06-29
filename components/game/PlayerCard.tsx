import { Skull } from "lucide-react";
import type { PublicPlayer } from "@/lib/game/types";

type PlayerCardProps = {
  isHuman?: boolean;
  player: PublicPlayer;
  showRole?: boolean;
};

export function PlayerCard({
  isHuman = false,
  player,
  showRole = false,
}: PlayerCardProps) {
  const status = player.isAlive ? "Alive" : "Out";
  const suspicion = Math.min(100, Math.max(0, Math.round(player.suspicion * 100)));
  const suspicionTone =
    suspicion >= 60
      ? "text-[var(--danger-strong)]"
      : suspicion >= 35
        ? "text-[var(--warning)]"
        : "text-[var(--muted)]";
  const suspicionFill =
    suspicion >= 60
      ? "bg-[var(--danger)]"
      : suspicion >= 35
        ? "bg-[var(--warning)]"
        : "bg-[color-mix(in_srgb,var(--muted)_62%,transparent)]";

  return (
    <article
      className={
        player.isAlive
          ? `relative w-[140px] shrink-0 rounded-xl border border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[color-mix(in_srgb,var(--panel)_70%,transparent)] p-3 backdrop-blur transition lg:w-auto ${isHuman ? "ring-1 ring-[color-mix(in_srgb,var(--accent)_44%,transparent)]" : ""}`
          : "relative w-[140px] shrink-0 rounded-xl border border-[color-mix(in_srgb,var(--line)_48%,transparent)] bg-[color-mix(in_srgb,var(--panel)_58%,transparent)] p-3 opacity-55 grayscale backdrop-blur lg:w-auto"
      }
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={
            isHuman
              ? "grid size-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-xs font-bold uppercase text-[var(--accent)]"
              : "grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--surface-elevated)] text-xs font-bold uppercase text-[var(--foreground)]"
          }
        >
          {player.isAlive ? (
            player.displayName.slice(0, 2)
          ) : (
            <Skull className="size-4" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold leading-tight text-[var(--foreground)]">
            {player.displayName}
          </h3>
          <p className="truncate text-[10px] text-[var(--muted)]">
            {isHuman ? "You" : player.publicStyle}
          </p>
        </div>
      </div>

      {showRole && player.role ? (
        <div className="mt-3 rounded-md border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-2 py-1 text-center">
          <span className="font-mono-label block text-[9px] uppercase tracking-wider text-[var(--muted)]">
            revealed
          </span>
          <strong className="text-xs text-[var(--accent)]">{player.role}</strong>
        </div>
      ) : isHuman ? (
        <div className="rounded-md border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-2 py-1 text-center font-mono-label text-[10px] uppercase tracking-wider text-[var(--accent)]">
          human
        </div>
      ) : player.isAlive ? (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="font-mono-label text-[9px] uppercase tracking-wider text-[var(--muted)]">
              suspicion
            </span>
            <span className={`font-mono-label text-[10px] font-semibold ${suspicionTone}`}>
              {suspicion}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-elevated)]" aria-hidden="true">
            <div
              className={`h-full rounded-full transition-all ${suspicionFill}`}
              style={{ width: `${suspicion}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-[color-mix(in_srgb,var(--line)_68%,transparent)] bg-[var(--surface)] px-2 py-1 text-center font-mono-label text-[10px] uppercase tracking-wider text-[var(--muted)]">
          {status === "Out" ? "eliminated" : status}
        </div>
      )}
    </article>
  );
}
