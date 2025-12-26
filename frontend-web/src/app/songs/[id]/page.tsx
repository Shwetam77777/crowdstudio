import { notFound } from "next/navigation";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LikeButton } from "@/components/LikeButton";

interface Song {
  id: number;
  title: string;
  description: string | null;
  audioUrl: string | null;
  ownerEmail: string;
  likeCount: number;
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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              by {song.ownerEmail}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {new Date(song.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {song.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
              {song.description}
            </p>
          )}

          {song.audioUrl && (
            <div className="mb-6">
              <AudioPlayer audioUrl={song.audioUrl} title={song.title} />
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <LikeButton
              songId={song.id}
              initialLikes={song.likeCount}
              initialIsLiked={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
