import type { Game, Role } from "@/lib/game/types";

type ActionPanelProps = {
  game: Game;
  humanRole: Role;
};

export function ActionPanel({ game, humanRole }: ActionPanelProps) {
  const aliveAiPlayers = game.players.filter((player) => !player.isHuman && player.isAlive);

  return (
    <aside className="rounded-lg border border-[#2d3547] bg-[#121722] p-4">
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#aab4c5]">
          Action
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#c8d0df]">
          You are a {humanRole}. Ask one sharp question, watch the room react, then prepare for the vote.
        </p>
      </div>

      <label className="block text-sm font-semibold text-[#f5f7fb]" htmlFor="question">
        Question
      </label>
      <textarea
        className="focus-ring mt-2 min-h-28 w-full resize-none rounded-md border border-[#354059] bg-[#0c1018] px-3 py-3 text-sm text-white placeholder:text-[#6f7b91]"
        defaultValue="Kabir, why did you deflect when Meera asked about voting patterns?"
        id="question"
      />

      <div className="mt-4 grid gap-2">
        <button className="focus-ring rounded-md bg-[#e3b75f] px-4 py-3 text-sm font-bold text-[#12100a]">
          Ask Room
        </button>
        <button className="focus-ring rounded-md border border-[#3a4257] px-4 py-3 text-sm font-semibold text-[#f3f5fa]">
          Advance Mock Phase
        </button>
      </div>

      <div className="mt-6 border-t border-[#293145] pt-4">
        <h3 className="text-sm font-bold text-white">Vote Preview</h3>
        <div className="mt-3 grid gap-2">
          {aliveAiPlayers.slice(0, 4).map((player) => (
            <button
              className="focus-ring flex items-center justify-between rounded-md border border-[#30384d] bg-[#151b28] px-3 py-2 text-left text-sm text-[#d8deea]"
              key={player.id}
            >
              <span>{player.displayName}</span>
              <span className="text-xs text-[#9aa5b8]">Select</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
