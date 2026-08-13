import { useEffect, useState } from "react";
import { Trophy, Heart } from "lucide-react";
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
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="mb-1 flex items-center gap-2 font-display text-2xl font-semibold text-primary sm:text-3xl">
        <Trophy className="text-primary" size={26} /> Leaderboard
      </h1>
      <p className="mb-6 text-sm text-muted">
        Real, global, database-backed — not per-browser localStorage.
      </p>
      {error && <p className="mb-4 font-mono text-sm text-alert">{error}</p>}
      {!error && entries.length === 0 && (
        <div className="channel-strip p-8 text-center text-sm text-muted">
          No ranked tracks yet — the first saved jam takes the top spot.
        </div>
      )}
      <ol className="space-y-2">
        {entries.map((e) => (
          <li key={e.trackId} className="channel-strip flex items-center justify-between px-4 py-3">
            <span className="flex min-w-0 items-center gap-3">
              <span
                className={`w-6 shrink-0 font-mono text-sm ${
                  e.rank <= 3 ? "text-primary" : "text-muted"
                }`}
              >
                #{e.rank}
              </span>
              <span className="truncate text-paper">{e.title}</span>
              <span className="hidden shrink-0 text-sm text-muted sm:inline">
                by {e.author.displayName ?? e.author.username}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1 font-mono text-sm text-primary">
              <Heart size={13} fill="currentColor" /> {e.likeCount}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
