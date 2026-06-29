import {
  ChevronRight,
  Eye,
  Lock,
  Shield,
  Skull,
  Stethoscope,
} from "lucide-react";
import type { Role } from "@/lib/game/types";

type RoleRevealProps = {
  isBusy: boolean;
  onEnter: () => void;
  role: Role;
};

export function RoleReveal({ isBusy, onEnter, role }: RoleRevealProps) {
  const Icon = getRoleIcon(role);

  return (
    <main className="tnb-page relative grid min-h-screen place-items-center overflow-hidden px-6 text-[var(--foreground)]">
      <div className="scanlines pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_60%)]" />
      <section className="fade-up relative w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="font-mono-label mb-2 text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">
            Identity assigned
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--line)_70%,transparent)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] px-2.5 py-1 text-[11px] text-[var(--muted)]">
            <Lock className="size-3" aria-hidden="true" />
            Confidential - for your eyes only
          </div>
        </div>

        <div className="glow-amber relative rounded-2xl border border-[color-mix(in_srgb,var(--accent)_32%,transparent)] bg-[color-mix(in_srgb,var(--panel)_82%,transparent)] p-8 text-center backdrop-blur">
          <div className="mx-auto mb-5 grid size-20 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent)_11%,transparent)] text-[var(--accent)]">
            <Icon className="size-9" aria-hidden="true" />
          </div>
          <div className="font-mono-label text-xs uppercase tracking-widest text-[var(--muted)]">
            Your Role
          </div>
          <h1 className="text-glow mt-1 text-4xl font-bold tracking-normal text-[var(--foreground)]">
            {role}
          </h1>
          <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
            <span className="font-semibold text-[color-mix(in_srgb,var(--foreground)_92%,transparent)]">
              Goal:
            </span>{" "}
            Find the hidden Mafia before the room turns against you.
          </p>

          <button
            className="focus-ring mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-strong)] disabled:cursor-wait disabled:opacity-60"
            disabled={isBusy}
            onClick={onEnter}
            type="button"
          >
            {isBusy ? "Entering..." : "Enter the Room"}
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-[var(--muted)]">
          Other players&apos; roles stay hidden until the game ends.
        </p>
      </section>
    </main>
  );
}

export function getRoleIcon(role: Role) {
  if (role === "Mafia") {
    return Skull;
  }

  if (role === "Detective") {
    return Eye;
  }

  if (role === "Doctor") {
    return Stethoscope;
  }

  return Shield;
}
