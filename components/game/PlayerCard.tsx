import type { PublicPlayer } from "@/lib/game/types";

type PlayerCardProps = {
  player: PublicPlayer;
};

export function PlayerCard({ player }: PlayerCardProps) {
  const status = player.isAlive ? "Alive" : "Out";

  return (
    <article className="min-w-52 rounded-md border border-[#2f374a] bg-[#131824] p-3 lg:min-w-0">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#263149] text-sm font-black text-[#f3d48d]">
          {player.displayName[0]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base font-bold text-white">{player.displayName}</h3>
            <span className={player.isAlive ? "text-xs text-[#69d6a3]" : "text-xs text-[#ef6767]"}>
              {status}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-[#98a4b8]">{player.publicStyle}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-[#8e99ad]">
          <span>Suspicion</span>
          <span>{Math.round(player.suspicion * 100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#252d40]" aria-hidden="true">
          <div
            className="h-full rounded-full bg-[#e3b75f]"
            style={{ width: `${Math.round(player.suspicion * 100)}%` }}
          />
        </div>
      </div>
    </article>
  );
}
