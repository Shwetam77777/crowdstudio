import { useEffect, useState } from "react";
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
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-2 font-display text-3xl text-primary">Leaderboard</h1>
      <p className="mb-6 text-sm text-muted">
        Real, global, database-backed — not per-browser localStorage.
      </p>
      {error && <p className="text-red-300">{error}</p>}
      <ol className="space-y-2">
        {entries.map((e) => (
          <li key={e.trackId} className="glass flex items-center justify-between rounded-lg px-4 py-3">
            <span className="flex items-center gap-3">
              <span className="w-6 text-muted">#{e.rank}</span>
              <span>{e.title}</span>
              <span className="text-sm text-muted">
                by {e.author.displayName ?? e.author.username}
              </span>
            </span>
            <span className="text-sm text-primary">♥ {e.likeCount}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
