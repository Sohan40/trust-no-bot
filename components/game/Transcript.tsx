"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/game/types";

type TranscriptProps = {
  messages: Message[];
};

export function Transcript({ messages }: TranscriptProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;

    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messages.length]);

  return (
    <section className="flex min-h-[520px] min-w-0 flex-col rounded-lg border border-[#2d3547] bg-[#10141f]">
      <div className="border-b border-[#263044] px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#aab4c5]">
          Transcript
        </h2>
      </div>
      <div
        aria-live="polite"
        className="flex-1 space-y-3 overflow-y-auto p-4"
        ref={listRef}
      >
        {messages.length === 0 ? (
          <p className="text-sm leading-6 text-[#8f9bb0]">
            The room is quiet for now.
          </p>
        ) : null}
        {messages.map((message) => {
          const isPrivate = message.visibility === "private";
          const isSystem = message.visibility === "system";

          return (
            <article
              className={
                isPrivate
                  ? "rounded-md border border-[#4c3f22] bg-[#1f1a11] p-3"
                  : isSystem
                    ? "rounded-md border border-[#35415a] bg-[#111827] p-3"
                    : "rounded-md border border-[#283144] bg-[#151a27] p-3"
              }
              key={message.id}
            >
              <div className="mb-1 flex items-center justify-between gap-3 text-xs text-[#8f9bb0]">
                <span>{message.phaseLabel}</span>
                <span>
                  {isPrivate ? "Private" : isSystem ? "System" : "Public"}
                </span>
              </div>
              <p className="text-sm font-bold text-[#f5f7fb]">
                {message.speakerName}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#d8deea]">
                {message.text}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}