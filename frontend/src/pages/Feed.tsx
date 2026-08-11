import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "../lib/api";
import { useAuthStore } from "../stores/authStore";

interface Track {
  id: string;
  title: string;
  description: string | null;
  playCount: number;
  likeCount: number;
  likedByMe: boolean;
  author: { username: string; displayName: string | null };
}

export default function Feed() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    api
      .get("/tracks")
      .then(({ data }) => setTracks(data.tracks))
      .catch((err) => setError(apiErrorMessage(err, "Could not load feed")))
      .finally(() => setLoading(false));
  }, []);

  async function toggleLike(trackId: string) {
    if (!user) return;
    try {
      const { data } = await api.post(`/tracks/${trackId}/like`);
      setTracks((prev) =>
        prev.map((t) => (t.id === trackId ? { ...t, likedByMe: data.liked, likeCount: data.likeCount } : t))
      );
    } catch {
      // Non-critical UI action — fail silently, like state just won't update.
    }
  }

  if (loading) return <div className="p-10 text-center text-muted">Loading feed…</div>;
  if (error) return <div className="p-10 text-center text-red-300">{error}</div>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 font-display text-3xl text-primary">Global Feed</h1>
      {tracks.length === 0 && (
        <p className="text-muted">No jams yet — head to the Studio and be the first.</p>
      )}
      <div className="space-y-4">
        {tracks.map((t) => (
          <div key={t.id} className="glass rounded-xl p-5">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-semibold">{t.title}</h3>
              <button
                onClick={() => toggleLike(t.id)}
                disabled={!user}
                className={`text-sm ${t.likedByMe ? "text-primary" : "text-muted"} disabled:opacity-40`}
              >
                ♥ {t.likeCount}
              </button>
            </div>
            <p className="text-sm text-muted">
              by {t.author.displayName ?? t.author.username} · {t.playCount} plays
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
