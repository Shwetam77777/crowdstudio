import { useLiveReactions } from "../hooks/useLiveReactions";

export function LiveVoting({ trackId }: { trackId: string }) {
  const { counts, bursts, react } = useLiveReactions(trackId);
  const total = counts.fire + counts.music;
  const firePct = total === 0 ? 50 : Math.round((counts.fire / total) * 100);

  return (
    <div className="channel-strip relative overflow-hidden p-4">
      <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
        Live Vote — what's the room feeling?
      </h2>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {bursts.map((b) => (
          <span
            key={b.id}
            className="absolute bottom-10 text-xl"
            style={{
              left: b.type === "fire" ? "25%" : "75%",
              animation: "burst-rise 1.2s ease-out forwards",
            }}
          >
            {b.type === "fire" ? "🔥" : "🎶"}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes burst-rise {
          0% { transform: translateY(0) scale(0.8); opacity: 1; }
          100% { transform: translateY(-40px) scale(1.3); opacity: 0; }
        }
      `}</style>

      <div className="mb-3 flex h-3 overflow-hidden rounded-full bg-bg/60">
        <div className="bg-primary transition-all duration-500" style={{ width: `${firePct}%` }} />
        <div className="bg-accent transition-all duration-500" style={{ width: `${100 - firePct}%` }} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => react("fire")}
          className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-primary/30 py-3 transition-colors hover:bg-primary/10 active:scale-95"
        >
          <span className="text-2xl">🔥</span>
          <span className="font-mono text-sm text-primary">{counts.fire}</span>
        </button>
        <button
          onClick={() => react("music")}
          className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-accent/30 py-3 transition-colors hover:bg-accent/10 active:scale-95"
        >
          <span className="text-2xl">🎶</span>
          <span className="font-mono text-sm text-accent">{counts.music}</span>
        </button>
      </div>

      <p className="mt-2 text-center text-xs text-muted">
        {total === 0
          ? "Be the first to vote"
          : firePct === 50
            ? "It's dead even right now"
            : firePct > 50
              ? `🔥 is winning, ${firePct}% of the room`
              : `🎶 is winning, ${100 - firePct}% of the room`}
      </p>
    </div>
  );
}
