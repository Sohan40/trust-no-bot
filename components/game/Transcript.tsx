"use client";

import { MessageSquare, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Message, PlayerId } from "@/lib/game/types";

type TranscriptProps = {
  humanPlayerId: PlayerId;
  messages: Message[];
};

export function Transcript({ humanPlayerId, messages }: TranscriptProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;

    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messages.length]);

  return (
    <section className="flex min-h-[520px] min-w-0 flex-col rounded-2xl border border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[color-mix(in_srgb,var(--panel)_52%,transparent)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-[color-mix(in_srgb,var(--line)_70%,transparent)] px-4 py-2.5">
        <h2 className="font-mono-label flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--muted)]">
          <MessageSquare className="size-3.5" aria-hidden="true" />
          Room transcript
        </h2>
        <div className="font-mono-label flex items-center gap-1 text-[10px] text-[var(--muted)]">
          <span className="size-1.5 rounded-full bg-[var(--success)]" />
          encrypted
        </div>
      </div>
      <div
        aria-live="polite"
        className="flex-1 space-y-2.5 overflow-y-auto p-4"
        ref={listRef}
      >
        {messages.length === 0 ? (
          <p className="rounded-lg border border-[color-mix(in_srgb,var(--line)_60%,transparent)] bg-[var(--surface)] px-3 py-3 text-sm leading-6 text-[var(--muted)]">
            The room is quiet for now.
          </p>
        ) : null}
        {messages.map((message) => (
          <MessageRow
            humanPlayerId={humanPlayerId}
            key={message.id}
            message={message}
          />
        ))}
      </div>
    </section>
  );
}

function MessageRow({
  humanPlayerId,
  message,
}: {
  humanPlayerId: PlayerId;
  message: Message;
}) {
  const isPrivate = message.visibility === "private";
  const isSystem =
    message.visibility === "system" || message.speakerId === "system";
  const isHuman = message.speakerId === humanPlayerId;
  const isVote = message.intent === "vote_summary";
  const isElimination =
    message.intent === "elimination" || message.intent === "game_over";

  if (isSystem && !isVote && !isElimination) {
    return (
      <article className="fade-up flex items-center gap-2 py-1 text-center">
        <div className="h-px flex-1 bg-[color-mix(in_srgb,var(--line)_70%,transparent)]" />
        <p className="font-mono-label text-[10px] uppercase tracking-widest text-[var(--muted)]">
          {message.text}
        </p>
        <div className="h-px flex-1 bg-[color-mix(in_srgb,var(--line)_70%,transparent)]" />
      </article>
    );
  }

  if (isPrivate) {
    return (
      <article className="fade-up flex gap-2.5 rounded-lg border border-[color-mix(in_srgb,var(--accent)_32%,transparent)] bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] p-3">
        <Sparkles
          className="mt-0.5 size-4 shrink-0 text-[var(--accent)]"
          aria-hidden="true"
        />
        <div className="min-w-0 text-sm">
          <div className="font-mono-label text-[10px] uppercase tracking-wider text-[var(--accent)]">
            private clue
          </div>
          <p className="mt-0.5 leading-6 text-[color-mix(in_srgb,var(--foreground)_92%,transparent)]">
            {message.text}
          </p>
        </div>
      </article>
    );
  }

  if (isVote) {
    return (
      <article className="fade-up rounded-lg border border-[color-mix(in_srgb,var(--danger)_45%,transparent)] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] p-3 text-sm">
        <div className="font-mono-label text-[10px] uppercase tracking-wider text-[var(--danger-strong)]">
          vote result
        </div>
        <p className="mt-1 leading-6 text-[var(--foreground)]">{message.text}</p>
      </article>
    );
  }

  if (isElimination) {
    return (
      <article className="fade-up rounded-lg border border-[color-mix(in_srgb,var(--line)_70%,transparent)] bg-[var(--surface)] p-3 text-sm">
        <div className="font-mono-label text-[10px] uppercase tracking-wider text-[var(--muted)]">
          elimination
        </div>
        <p className="mt-1 font-semibold leading-6 text-[var(--foreground)]">
          {message.text}
        </p>
      </article>
    );
  }

  if (isHuman) {
    return (
      <article className="fade-up flex justify-end">
        <div className="max-w-[82%] rounded-2xl rounded-br-sm border border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] px-3.5 py-2">
          <div className="font-mono-label mb-0.5 flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-wider text-[var(--accent)]">
            you
          </div>
          <p className="text-sm leading-6 text-[var(--foreground)]">
            {message.text}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="fade-up flex gap-2.5">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--surface-elevated)] text-[10px] font-bold uppercase text-[var(--foreground)]">
        {message.speakerName.slice(0, 2)}
      </div>
      <div className="min-w-0 max-w-[86%] rounded-2xl rounded-tl-sm border border-[color-mix(in_srgb,var(--line)_72%,transparent)] bg-[var(--surface)] px-3.5 py-2">
        <div className="font-mono-label mb-0.5 text-[10px] uppercase tracking-wider text-[var(--muted)]">
          {message.speakerName}
        </div>
        <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_95%,transparent)]">
          {message.text}
        </p>
      </div>
    </article>
  );
}
