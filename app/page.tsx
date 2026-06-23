import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-5 py-6 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between text-sm text-[#c2cad8]">
          <span className="font-semibold uppercase tracking-[0.16em] text-[#f3d48d]">
            Trust No Bot
          </span>
          <span className="rounded-full border border-[#343b4e] px-3 py-1 text-xs">
            Classic Mode MVP
          </span>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_0.82fr]">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#e3b75f]">
              Single-player AI Mafia
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] text-white sm:text-7xl">
              Can you catch an AI lying?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#c8d0df]">
              Enter a tense group chat with six AI characters. One has a secret role, everyone has a story, and your vote decides who survives the round.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md bg-[#e3b75f] px-6 text-base font-bold text-[#12100a] shadow-lg shadow-[#e3b75f]/20 transition hover:bg-[#f0c873]"
                href="/game"
              >
                Start Game
              </Link>
              <a
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-[#3a4257] px-6 text-base font-semibold text-[#f3f5fa] transition hover:border-[#59647d] hover:bg-white/5"
                href="#preview"
              >
                Preview Room
              </a>
            </div>
          </div>

          <div
            id="preview"
            className="relative min-h-[390px] rounded-lg border border-[#2b3142] bg-[#111520] p-4 shadow-2xl shadow-black/30"
            aria-label="Preview of the Trust No Bot game room"
          >
            <div className="absolute inset-x-6 top-8 h-28 rounded-[50%] border border-[#3d4559] bg-[#1a2030]" />
            <div className="relative grid h-full grid-cols-2 gap-3 pt-4">
              {["Arjun", "Riya", "Kabir", "Meera", "Tara", "Dev"].map((name, index) => (
                <div
                  className="flex min-h-24 flex-col justify-between rounded-md border border-[#30374a] bg-[#151a27] p-3"
                  key={name}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex size-9 items-center justify-center rounded-full bg-[#263149] text-sm font-bold text-[#f3d48d]">
                      {name[0]}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{name}</p>
                      <p className="text-xs text-[#98a4b8]">{index === 2 ? "slippery" : "watching"}</p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-[#273047]">
                    <div
                      className="h-full rounded-full bg-[#e3b75f]"
                      style={{ width: `${22 + index * 9}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="max-w-3xl pb-2 text-sm leading-6 text-[#8f9bb0]">
          Phase 0 scaffold: mock local state only. Supabase persistence, real AI dialogue, and full rules come next.
        </p>
      </section>
    </main>
  );
}
