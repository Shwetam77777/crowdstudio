import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Heart, Flame, PlayCircle } from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";

interface Entry {
  rank: number;
  trackId: string;
  title: string;
  likeCount: number;
  playCount: number;
  author: { username: string; displayName: string | null };
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/tracks/leaderboard")
      .then(({ data }) => setEntries(data.leaderboard))
      .catch((err) => setError(apiErrorMessage(err, "Could not load leaderboard")));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="glass-card mb-8 p-6">
        <h1 className="mb-2 flex items-center gap-3 font-display text-3xl font-extrabold text-paper">
          <Trophy className="text-primary" size={32} /> Hot Track <span className="neon-text-amber">Leaderboard</span>
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Ranked by a time-decayed hot score — (likes × 3 + plays) / (age + 2)^1.5 — so fresh trending tracks can surface to #1!
        </p>
      </div>

      {error && <p className="mb-4 font-mono text-sm text-alert">{error}</p>}
      {!error && entries.length === 0 && (
        <div className="glass-card p-10 text-center text-sm text-muted">
          No ranked tracks yet — the first saved jam takes the top spot!
        </div>
      )}

      <ol className="space-y-3">
        {entries.map((e) => (
          <li key={e.trackId}>
            <Link
              to={`/tracks/${e.trackId}`}
              className={`glass-card flex items-center justify-between p-4 transition-all ${
                e.rank === 1
                  ? "border-primary/60 bg-gradient-to-r from-primary/10 to-transparent shadow-amberGlow"
                  : e.rank === 2
                  ? "border-accent/40 bg-gradient-to-r from-accent/10 to-transparent"
                  : e.rank === 3
                  ? "border-neon/40 bg-gradient-to-r from-neon/10 to-transparent"
                  : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-4">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${
                    e.rank === 1
                      ? "bg-primary text-bg shadow-amberGlow"
                      : e.rank === 2
                      ? "bg-accent text-bg shadow-glow"
                      : e.rank === 3
                      ? "bg-neon text-white"
                      : "bg-surface/80 text-muted border border-white/10"
                  }`}
                >
                  {e.rank === 1 ? <Flame size={18} /> : `#${e.rank}`}
                </span>
                <div className="truncate">
                  <span className="block truncate font-bold text-paper text-base group-hover:text-accent">
                    {e.title}
                  </span>
                  <span className="text-xs text-muted">
                    by <span className="text-accent font-semibold">{e.author.displayName ?? e.author.username}</span>
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-4 font-mono text-sm">
                <span className="flex items-center gap-1 text-muted text-xs">
                  <PlayCircle size={14} /> {e.playCount}
                </span>
                <span className="flex items-center gap-1 font-bold text-alert">
                  <Heart size={14} fill="currentColor" /> {e.likeCount}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
