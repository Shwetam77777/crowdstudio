import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  if (error || !profile) return <div className="p-10 text-center text-red-300">{error ?? "User not found"}</div>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="glass mb-6 rounded-xl p-6">
        <h1 className="font-display text-2xl text-primary">
          {profile.displayName ?? profile.username}
        </h1>
        <p className="text-sm text-muted">@{profile.username} · {profile.trackCount} tracks</p>
        {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
      </div>

      <h2 className="mb-3 font-semibold">Tracks</h2>
      <div className="space-y-3">
        {tracks.length === 0 && <p className="text-sm text-muted">No tracks yet.</p>}
        {tracks.map((t) => (
          <Link
            key={t.id}
            to={`/tracks/${t.id}`}
            className="glass block rounded-lg px-4 py-3 hover:border-primary/50"
          >
            <div className="flex items-center justify-between">
              <span>{t.title}</span>
              <span className="text-sm text-muted">
                ♥ {t.likeCount} · {t.playCount} plays
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
