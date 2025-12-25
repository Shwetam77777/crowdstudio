"use client";

import React from "react";
import Link from "next/link";
import { Song } from "@/lib/api";

interface SongCardProps {
  song: Song;
}

export const SongCard: React.FC<SongCardProps> = ({ song }) => {
  return (
    <Link href={`/songs/${song.id}`}>
      <div className="p-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer h-full bg-white dark:bg-gray-800">
        <h3 className="text-lg font-bold mb-2 truncate">{song.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {song.description || "No description"}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-500 truncate">
            by {song.ownerEmail}
          </span>
          <span className="font-semibold text-blue-500">
            ♥ {song.likeCount}
          </span>
        </div>
      </div>
    </Link>
  );
};
