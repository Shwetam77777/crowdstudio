import { notFound } from "next/navigation";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LikeButton } from "@/components/LikeButton";
import { CommentsSection } from "@/components/CommentsSection";

interface Song {
  id: number;
  title: string;
  description: string | null;
  audioUrl: string | null;
  lyrics?: string | null;
  genre?: string | null;
  aiGenerated?: boolean;
  ownerEmail: string;
  likeCount: number;
  commentCount?: number;
  createdAt: string;
}

async function getSong(id: string): Promise<Song | null> {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
    const res = await fetch(`${API_BASE}/songs/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching song:", error);
    return null;
  }
}

export default async function SongDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const song = await getSong(params.id);

  if (!song) {
    notFound();
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Main Song Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
          {/* Header with badges */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {song.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  by <span className="font-semibold">{song.ownerEmail}</span>
                </p>
              </div>
              
              {song.aiGenerated && (
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  ✨ AI Generated
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>
                📅 {new Date(song.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              {song.genre && (
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 font-semibold">
                  🎸 {song.genre.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {song.description && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                {song.description}
              </p>
            </div>
          )}

          {/* Audio Player */}
          {song.audioUrl && (
            <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <AudioPlayer audioUrl={song.audioUrl} title={song.title} />
            </div>
          )}

          {/* Lyrics Section */}
          {song.lyrics && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">
                📝 Lyrics
              </h3>
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed">
                  {song.lyrics}
                </pre>
              </div>
            </div>
          )}

          {/* Like Button */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <LikeButton
              songId={song.id}
              initialLikes={song.likeCount}
              initialIsLiked={false}
            />
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
          <CommentsSection songId={song.id} />
        </div>
      </div>
    </div>
  );
}
