"use client";

import React from "react";
import Link from "next/link";
import { Song } from "@/lib/api";

interface SongCardProps {
  song: Song;
  rank?: number;
}

export const SongCard: React.FC<SongCardProps> = ({ song, rank }) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return { emoji: "🥇", color: "from-yellow-400 to-yellow-600", text: "#1" };
    if (rank === 2) return { emoji: "🥈", color: "from-gray-400 to-gray-600", text: "#2" };
    if (rank === 3) return { emoji: "🥉", color: "from-orange-400 to-orange-600", text: "#3" };
    return null;
  };

  const rankBadge = rank ? getRankBadge(rank) : null;

  return (
    <Link href={`/songs/${song.id}`}>
      <div className="group relative p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-2xl transition-all duration-300 cursor-pointer h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 transform hover:-translate-y-1">
        {/* Rank Badge */}
        {rankBadge && (
          <div className="absolute -top-3 -left-3 flex items-center gap-1 z-10">
            <div className={`bg-gradient-to-br ${rankBadge.color} text-white font-bold text-sm px-3 py-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800`}>
              {rankBadge.emoji} {rankBadge.text}
            </div>
          </div>
        )}

        {/* AI Badge */}
        {song.aiGenerated && (
          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800 z-10">
            ✨ AI
          </div>
        )}

        <div className="flex flex-col h-full">
          {/* Title */}
          <h3 className="text-xl font-bold mb-2 truncate text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {song.title}
          </h3>

          {/* Genre */}
          {song.genre && (
            <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mb-3 w-fit">
              {song.genre.toUpperCase()}
            </span>
          )}

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">
            {song.description || "No description"}
          </p>

          {/* Footer */}
          <div className="space-y-3 mt-auto">
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-red-500 font-semibold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                {song.likeCount}
              </div>
              
              {song.commentCount !== undefined && (
                <div className="flex items-center gap-1 text-blue-500 font-semibold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  {song.commentCount}
                </div>
              )}
            </div>

            {/* Author */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                by <span className="font-medium">{song.ownerEmail}</span>
              </span>
              <span className="text-xs text-purple-500 dark:text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                View →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
