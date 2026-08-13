import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, PlayCircle } from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";

interface ProfileData {
  username: string;
  displayName: string | null;
  bio: string | null;
  trackCount: number;
  createdAt: string;
}

interface ProfileTrack {
  id: string;
  title: string;
  playCount: number;
  likeCount: number;
  commentCount: number;
}

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tracks, setTracks] = useState<ProfileTrack[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    api
      .get(`/users/${username}`)
      .then(({ data }) => {
        setProfile(data.user);
        setTracks(data.tracks);
      })
      .catch((err) => setError(apiErrorMessage(err, "Could not load this profile")))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div className="p-10 text-center text-muted">Loading…</div>;
  if (error || !profile) return <div className="p-10 text-center text-alert">{error ?? "User not found"}</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="channel-strip mb-6 p-6">
        <h1 className="font-display text-2xl font-semibold text-primary">
          {profile.displayName ?? profile.username}
        </h1>
        <p className="text-sm text-muted">
          @{profile.username} · <span className="font-mono">{profile.trackCount} tracks</span>
        </p>
        {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
      </div>

      <h2 className="mb-3 font-semibold">Tracks</h2>
      <div className="space-y-3">
        {tracks.length === 0 && <p className="text-sm text-muted">No tracks yet.</p>}
        {tracks.map((t) => (
          <Link
            key={t.id}
            to={`/tracks/${t.id}`}
            className="channel-strip block px-4 py-3 transition-colors hover:border-primary/60"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-paper">{t.title}</span>
              <span className="flex shrink-0 items-center gap-3 font-mono text-sm text-muted">
                <span className="flex items-center gap-1"><Heart size={13} /> {t.likeCount}</span>
                <span className="flex items-center gap-1"><PlayCircle size={13} /> {t.playCount}</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
