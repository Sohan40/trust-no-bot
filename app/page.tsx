import {
  Bot,
  ChevronRight,
  Crosshair,
  Eye,
  Skull,
  Stethoscope,
} from "lucide-react";
import { StartGameButton } from "@/components/game/StartGameButton";

const roleCards = [
  { label: "1 Mafia", Icon: Skull },
  { label: "1 Detective", Icon: Eye },
  { label: "1 Doctor", Icon: Stethoscope },
];

export default function HomePage() {
  return (
    <main className="tnb-page relative min-h-screen overflow-hidden text-[var(--foreground)]">
      <div className="scanlines pointer-events-none absolute inset-0 opacity-70" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-between px-6 py-10">
        <nav className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="glow-amber grid size-9 place-items-center rounded-md border border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[var(--surface)] text-[var(--accent)]">
              <Bot className="flicker size-4" aria-hidden="true" />
            </span>
            <span className="font-mono-label text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">
              trust_no_bot.exe
            </span>
          </div>
          <span className="font-mono-label shrink-0 rounded-full border border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
            v1 · classic
          </span>
        </nav>

        <div className="my-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-3 py-1 text-[11px] font-medium text-[var(--accent)]">
            <span className="pulse-ring size-1.5 rounded-full bg-[var(--accent)]" />
            Tonight in Room 7
          </div>
          <h1 className="text-glow text-4xl font-bold leading-[1.05] tracking-normal text-[var(--foreground)] sm:text-5xl md:text-6xl">
            Can you catch
            <br />
            the <span className="text-[var(--accent)]">hidden AI</span>
            <br />
            opponent?
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-[var(--muted)]">
            Play Mafia against AI characters. Ask questions, spot
            contradictions, and survive the vote.
          </p>

          <StartGameButton className="glow-amber focus-ring group mt-8 inline-flex min-h-14 w-full items-center justify-between rounded-xl border border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[var(--accent)] px-5 text-base font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-strong)] disabled:cursor-wait disabled:opacity-70 sm:w-auto">
            <span className="inline-flex items-center gap-2">
              <Crosshair className="size-4" aria-hidden="true" />
              Start Game
            </span>
            <ChevronRight
              className="ml-6 size-5 transition group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </StartGameButton>

          <p className="font-mono-label mt-4 text-[11px] uppercase tracking-wider text-[var(--muted)]">
            Classic Mode · 1 human · 6 AI players
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {roleCards.map(({ Icon, label }) => (
            <div
              className="rounded-lg border border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] px-3 py-3 backdrop-blur"
              key={label}
            >
              <Icon
                className="mx-auto mb-1.5 size-4 text-[color-mix(in_srgb,var(--accent)_82%,transparent)]"
                aria-hidden="true"
              />
              <div className="text-[11px] text-[var(--muted)]">{label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
