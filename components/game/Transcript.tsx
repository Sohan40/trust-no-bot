import type { Message } from "@/lib/game/types";

type TranscriptProps = {
  messages: Message[];
};

export function Transcript({ messages }: TranscriptProps) {
  return (
    <section className="flex min-h-[520px] min-w-0 flex-col rounded-lg border border-[#2d3547] bg-[#10141f]">
      <div className="border-b border-[#263044] px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#aab4c5]">
          Transcript
        </h2>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => (
          <article
            className={
              message.visibility === "private"
                ? "rounded-md border border-[#4c3f22] bg-[#1f1a11] p-3"
                : "rounded-md border border-[#283144] bg-[#151a27] p-3"
            }
            key={message.id}
          >
            <div className="mb-1 flex items-center justify-between gap-3 text-xs text-[#8f9bb0]">
              <span>{message.phaseLabel}</span>
              <span>{message.visibility === "private" ? "Private" : "Public"}</span>
            </div>
            <p className="text-sm font-bold text-[#f5f7fb]">{message.speakerName}</p>
            <p className="mt-1 text-sm leading-6 text-[#d8deea]">{message.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
