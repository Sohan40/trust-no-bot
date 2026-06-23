import { StartGameButton } from "@/components/game/StartGameButton";
import type { VisibleGameState } from "@/lib/game/types";

type ResultPanelProps = {
  state: VisibleGameState;
};

export function ResultPanel({ state }: ResultPanelProps) {
  const villageWon = state.game.winner === "villagers";
  const result = state.result;

  return (
    <aside className="self-start rounded-lg border border-[#4b4028] bg-[#171711] p-4 lg:sticky lg:top-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#e3b75f]">
        Game Over
      </p>
      <h2 className="mt-2 text-2xl font-black text-white">
        {villageWon ? "Village wins" : "Mafia wins"}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#d4d7df]">
        {result?.summary ?? "The final roles are now revealed."}
      </p>

      <div className="mt-5 border-t border-[#3a3528] pt-4">
        <h3 className="text-sm font-bold text-white">Role reveal</h3>
        <div className="mt-3 divide-y divide-[#302f2a]">
          {state.publicPlayers.map((player) => (
            <div
              className="flex items-center justify-between gap-3 py-2.5 text-sm"
              key={player.id}
            >
              <span className="min-w-0 truncate text-[#d9dde6]">
                {player.displayName}
              </span>
              <span className="shrink-0 font-bold text-[#f3d48d]">
                {player.role ?? "Hidden"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {result?.shareText ? (
        <blockquote className="mt-5 border-l-2 border-[#e3b75f] pl-3 text-sm leading-6 text-[#c8c9c4]">
          {result.shareText}
        </blockquote>
      ) : null}

      <StartGameButton
        className="focus-ring mt-5 min-h-11 w-full rounded-md bg-[#e3b75f] px-4 text-sm font-bold text-[#12100a] disabled:cursor-wait disabled:opacity-70"
        label="Play Again"
      />
    </aside>
  );
}