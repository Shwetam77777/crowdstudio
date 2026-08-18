import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, PlayCircle, Edit3, Save, X } from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import { useAuthStore } from "../stores/authStore";

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
  const currentUser = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tracks, setTracks] = useState<ProfileTrack[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isOwnProfile = currentUser && profile && currentUser.username === profile.username;

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    api
      .get(`/users/${username}`)
      .then(({ data }) => {
        setProfile(data.user);
        setTracks(data.tracks);
        setDisplayName(data.user.displayName ?? "");
        setBio(data.user.bio ?? "");
      })
      .catch((err) => setError(apiErrorMessage(err, "Could not load this profile")))
      .finally(() => setLoading(false));
  }, [username]);

  async function handleSaveProfile() {
    setSaving(true);
    setSaveError(null);
    try {
      const { data } = await api.patch("/users/me", { displayName, bio });
      setProfile((prev) => (prev ? { ...prev, displayName: data.user.displayName, bio: data.user.bio } : null));
      setIsEditing(false);
    } catch (err) {
      setSaveError(apiErrorMessage(err, "Could not save profile"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-muted">Loading…</div>;
  if (error || !profile) return <div className="p-10 text-center text-alert">{error ?? "User not found"}</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="channel-strip mb-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-primary">
              {profile.displayName ?? profile.username}
            </h1>
            <p className="text-sm text-muted">
              @{profile.username} · <span className="font-mono">{profile.trackCount} tracks</span>
            </p>
          </div>
          {isOwnProfile && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 rounded border border-paper/15 px-3 py-1.5 text-xs text-muted hover:border-primary hover:text-primary transition-colors"
            >
              <Edit3 size={13} /> Edit profile
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="mt-4 border-t border-paper/10 pt-4">
            {saveError && <p className="mb-2 text-xs text-alert">{saveError}</p>}
            <label className="mb-1 block text-xs text-muted">Display Name</label>
            <input
              className="mb-3 w-full rounded border border-paper/15 bg-bg/60 px-3 py-1.5 text-sm focus:border-primary"
              value={displayName}
              maxLength={50}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <label className="mb-1 block text-xs text-muted">Bio</label>
            <textarea
              className="mb-3 w-full rounded border border-paper/15 bg-bg/60 px-3 py-1.5 text-sm focus:border-primary"
              rows={2}
              maxLength={280}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-bg disabled:opacity-50"
              >
                <Save size={13} /> {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 rounded border border-paper/15 px-3 py-1.5 text-xs text-muted hover:text-paper"
              >
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>
        )}
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
