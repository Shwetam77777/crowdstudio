import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, apiErrorMessage } from "../lib/api";
import { useAuthStore } from "../stores/authStore";

interface Track {
  id: string;
  title: string;
  description: string | null;
  playCount: number;
  likeCount: number;
  likedByMe: boolean;
  aiExportUrl: string | null;
  aiExportStatus: string;
  author: { username: string; displayName: string | null };
}

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  user: { username: string; displayName: string | null };
}

export default function TrackDetail() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [track, setTrack] = useState<Track | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([api.get(`/tracks/${id}`), api.get(`/tracks/${id}/comments`)])
      .then(([trackRes, commentsRes]) => {
        setTrack(trackRes.data.track);
        setComments(commentsRes.data.comments);
      })
      .catch((err) => setError(apiErrorMessage(err, "Could not load this track")))
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleLike() {
    if (!user || !track) return;
    try {
      const { data } = await api.post(`/tracks/${track.id}/like`);
      setTrack({ ...track, likedByMe: data.liked, likeCount: data.likeCount });
    } catch {
      // Non-critical UI action — fail silently, like state just won't update.
    }
  }

  async function postComment() {
    if (!id || !newComment.trim()) return;
    setPosting(true);
    setCommentError(null);
    try {
      const { data } = await api.post(`/tracks/${id}/comments`, { body: newComment });
      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
    } catch (err) {
      setCommentError(apiErrorMessage(err, "Could not post comment"));
    } finally {
      setPosting(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-muted">Loading…</div>;
  if (error || !track) return <div className="p-10 text-center text-red-300">{error ?? "Track not found"}</div>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link to="/" className="mb-4 inline-block text-sm text-muted hover:text-primary">
        ← Back to feed
      </Link>
      <div className="glass mb-6 rounded-xl p-6">
        <h1 className="mb-1 font-display text-2xl text-primary">{track.title}</h1>
        <p className="mb-4 text-sm text-muted">
          by {track.author.displayName ?? track.author.username} · {track.playCount} plays
        </p>
        {track.description && <p className="mb-4 text-sm">{track.description}</p>}

        <button
          onClick={toggleLike}
          disabled={!user}
          className={`rounded border px-4 py-2 text-sm disabled:opacity-40 ${
            track.likedByMe ? "border-primary text-primary" : "border-white/20 text-muted"
          }`}
        >
          ♥ {track.likeCount} {track.likedByMe ? "Liked" : "Like"}
        </button>

        {track.aiExportStatus === "ready" && track.aiExportUrl && (
          <audio controls src={track.aiExportUrl} className="mt-4 w-full" />
        )}
        {track.aiExportStatus === "pending" && (
          <p className="mt-4 text-sm text-muted">AI export rendering…</p>
        )}
        {track.aiExportStatus === "failed" && (
          <p className="mt-4 text-sm text-red-300">AI export failed — try again from the studio.</p>
        )}
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="mb-4 font-semibold">Comments ({comments.length})</h2>
        <div className="mb-4 space-y-3">
          {comments.length === 0 && <p className="text-sm text-muted">No comments yet.</p>}
          {comments.map((c) => (
            <div key={c.id} className="border-b border-white/10 pb-2 text-sm">
              <span className="text-primary">{c.user.displayName ?? c.user.username}</span>{" "}
              <span className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
              <p>{c.body}</p>
            </div>
          ))}
        </div>

        {user ? (
          <div>
            {commentError && <p className="mb-2 text-sm text-red-300">{commentError}</p>}
            <textarea
              className="mb-2 w-full rounded border border-white/20 bg-black/30 px-3 py-2 text-sm"
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment…"
            />
            <button
              onClick={postComment}
              disabled={posting || !newComment.trim()}
              className="rounded bg-primary px-4 py-1.5 text-sm font-semibold text-black disabled:opacity-50"
            >
              {posting ? "Posting…" : "Post"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted">
            <Link to="/login" className="text-primary">Log in</Link> to comment.
          </p>
        )}
      </div>
    </div>
  );
}
