import React from "react";
import Link from "next/link";
import { SongCard } from "@/components/SongCard";
import { Song, songsAPI } from "@/lib/api";

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export default async function Home() {
  let songs: Song[] = [];
  let error = null;

  try {
    songs = await songsAPI.getTopSongs();
  } catch (err) {
    error = "Failed to load songs. Please try again later.";
    console.error(err);
  }

  const totalLikes = songs.reduce((sum, song) => sum + song.likeCount, 0);
  const totalComments = songs.reduce((sum, song) => sum + (song.commentCount || 0), 0);

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎵 Global Leaderboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Discover and support amazing AI-generated music from our community
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-3 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {songs.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Songs
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-3 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-red-500">
                {totalLikes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Likes
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-3 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-blue-500">
                {totalComments}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Comments
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Link href="/ai-generate">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl">
              ✨ Create AI Music
            </button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-6 py-4 rounded-xl mb-8 shadow-lg">
            {error}
          </div>
        )}

        {songs.length === 0 && !error && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No songs yet
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Be the first to create an AI-generated masterpiece!
            </p>
            <Link href="/ai-generate">
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Get Started
              </button>
            </Link>
          </div>
        )}

        {songs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                🏆 Top Ranked Songs
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Ranked by likes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {songs.map((song, index) => (
                <SongCard key={song.id} song={song} rank={index + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
