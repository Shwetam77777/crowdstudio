import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, PlayCircle, Sparkles, Disc3 } from "lucide-react";
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
      // Non-critical UI action
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Hero Header Section */}
      <section className="glass-card mb-10 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-gradient-to-br from-accent/20 to-neon/20 blur-3xl pointer-events-none" />
        
        <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent font-semibold">
          <VUMeter active={presence.inJamRoom > 0} bars={4} />
          {presence.inJamRoom > 0 ? `${presence.inJamRoom} active musicians in jam room` : "Studio room is quiet — be the first to jam"}
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-paper sm:text-5xl">
          What the crowd is <span className="neon-text-cyan">building</span>
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted leading-relaxed">
          Real generative audio synthesis produced in live browser sessions. Saved straight from the Jam Studio.
        </p>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            to="/studio"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent via-primary to-neon px-6 py-3 text-sm font-bold text-bg shadow-glow hover:brightness-110 transition-all active:scale-95"
          >
            <Disc3 size={18} /> Open Jam Studio (No Login Needed)
          </Link>
        </div>
      </section>

      {loading && <FeedSkeleton />}

      {!loading && error && (
        <div className="glass-card p-6 text-center text-sm text-alert">{error}</div>
      )}

      {!loading && !error && tracks.length === 0 && (
        <div className="glass-card flex flex-col items-center gap-4 p-12 text-center">
          <Sparkles className="text-accent" size={36} />
          <h2 className="text-xl font-bold text-paper">No jams saved yet.</h2>
          <p className="text-sm text-muted">Open the Studio, hit start jam, and publish your first session to the board!</p>
          <Link
            to="/studio"
            className="mt-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-bg shadow-glow hover:brightness-110 transition-all"
          >
            Go to Jam Studio
          </Link>
        </div>
      )}

      {!loading && !error && tracks.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {tracks.map((t) => (
            <div key={t.id} className="glass-card flex flex-col justify-between p-6 group">
              <div>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <Link to={`/tracks/${t.id}`} className="font-display text-lg font-bold text-paper hover:text-accent transition-colors">
                    {t.title}
                  </Link>
                  <button
                    onClick={() => toggleLike(t.id)}
                    disabled={!user}
                    title={user ? "Like this track" : "Log in to like tracks"}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-semibold transition-all ${
                      t.likedByMe
                        ? "bg-alert/20 text-alert border border-alert/40 shadow-glow"
                        : "bg-surface/80 text-muted border border-white/10 hover:text-paper"
                    } disabled:opacity-40`}
                  >
                    <Heart size={14} fill={t.likedByMe ? "currentColor" : "none"} />
                    {t.likeCount}
                  </button>
                </div>
                {t.description && <p className="mb-3 text-sm text-muted line-clamp-2">{t.description}</p>}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-mono text-muted">
                <span className="flex items-center gap-1">
                  by{" "}
                  <Link to={`/profile/${t.author.username}`} className="text-accent font-semibold hover:underline">
                    {t.author.displayName ?? t.author.username}
                  </Link>
                </span>
                <span className="flex items-center gap-1.5 text-paper">
                  <PlayCircle size={14} className="text-accent" /> {t.playCount} plays
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card animate-pulse p-6">
          <div className="mb-3 h-5 w-2/3 rounded bg-white/10" />
          <div className="mb-2 h-4 w-full rounded bg-white/5" />
          <div className="h-4 w-1/3 rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}
