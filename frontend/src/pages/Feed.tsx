import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, apiErrorMessage } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { usePresence } from "../hooks/usePresence";
import { VUMeter } from "../components/VUMeter";

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
  const presence = usePresence();

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="mb-10">
        <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
          <VUMeter active={presence.inJamRoom > 0} bars={3} />
          {presence.inJamRoom > 0 ? `${presence.inJamRoom} jamming right now` : "the room is quiet"}
        </p>
        <h1 className="font-display text-3xl font-semibold text-paper sm:text-4xl">
          What the crowd is building
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Every track here came out of someone's live session — real synthesis, saved straight from
          the Jam Studio, not a stock loop.
        </p>
        <div className="signal-line mt-6" />
      </section>

      {loading && <FeedSkeleton />}

      {!loading && error && (
        <div className="channel-strip p-6 text-center text-sm text-alert">{error}</div>
      )}

      {!loading && !error && tracks.length === 0 && (
        <div className="channel-strip flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-paper">No jams saved yet.</p>
          <p className="text-sm text-muted">Open the Studio, hit start, and be the first on the board.</p>
          <Link
            to="/studio"
            className="mt-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-bg"
          >
            Go to Jam Studio
          </Link>
        </div>
      )}

      {!loading && !error && tracks.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {tracks.map((t) => (
            <div key={t.id} className="channel-strip flex flex-col justify-between p-5">
              <div>
                <div className="mb-1 flex items-start justify-between gap-2">
                  <Link to={`/tracks/${t.id}`} className="font-semibold text-paper hover:text-primary">
                    {t.title}
                  </Link>
                  <button
                    onClick={() => toggleLike(t.id)}
                    disabled={!user}
                    title={user ? "Like this track" : "Log in to like tracks"}
                    className={`shrink-0 font-mono text-sm ${
                      t.likedByMe ? "text-primary" : "text-muted"
                    } disabled:opacity-40`}
                  >
                    ♥ {t.likeCount}
                  </button>
                </div>
                {t.description && <p className="mb-2 text-sm text-muted">{t.description}</p>}
              </div>
              <p className="mt-3 font-mono text-xs text-muted">
                by{" "}
                <Link to={`/profile/${t.author.username}`} className="text-accent hover:underline">
                  {t.author.displayName ?? t.author.username}
                </Link>{" "}
                · {t.playCount} plays
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="channel-strip animate-pulse p-5">
          <div className="mb-3 h-4 w-2/3 rounded bg-paper/10" />
          <div className="mb-2 h-3 w-full rounded bg-paper/5" />
          <div className="h-3 w-1/3 rounded bg-paper/5" />
        </div>
      ))}
    </div>
  );
}
