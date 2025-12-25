import React from "react";
import { SongCard } from "@/components/SongCard";
import { songsAPI } from "@/lib/api";

export const revalidate = 60;

export default async function Home() {
  let songs = [];
  let error = null;

  try {
    songs = await songsAPI.getTopSongs();
  } catch (err) {
    error = "Failed to load songs. Please try again later.";
    console.error(err);
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Top Songs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and support amazing AI-generated music from our community
          </p>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {songs.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No songs yet. Be the first to upload one!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </div>
    </div>
  );
}
