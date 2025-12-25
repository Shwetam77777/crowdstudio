"use client";

import React, { useEffect, useState } from "react";
import { songsAPI, Song } from "@/lib/api";
import { useParams } from "next/navigation";

export default function SongDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [song, setSong] = useState<Song | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchSong = async () => {
      if (!id) return;

      try {
        const songData = await songsAPI.getSongById(parseInt(id, 10));
        setSong(songData);

        const savedLikes = JSON.parse(localStorage.getItem("liked") || "[]");
        if (savedLikes.includes(parseInt(id, 10))) {
          setLiked(true);
        }
      } catch (err: any) {
        setError(
          err.response?.data?.error || "Failed to load song"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSong();
  }, [id]);

  const handleLike = async () => {
    if (!song) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to like songs");
      return;
    }

    try {
      await songsAPI.likeSong(song.id);
      setLiked(true);

      const savedLikes = JSON.parse(localStorage.getItem("liked") || "[]");
      if (!savedLikes.includes(song.id)) {
        savedLikes.push(song.id);
        localStorage.setItem("liked", JSON.stringify(savedLikes));
      }

      setSong({ ...song, likeCount: song.likeCount + 1 });
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to like song"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded-lg">
            {error || "Song not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-4">{song.title}</h1>

          <div className="grid grid-cols-2 gap-4 mb-6 text-gray-600 dark:text-gray-400">
            <div>
              <p className="text-sm uppercase tracking-wide">Creator</p>
              <p className="text-lg font-semibold text-black dark:text-white">
                {song.ownerEmail}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide">Likes</p>
              <p className="text-lg font-semibold text-blue-500">
                {song.likeCount}
              </p>
            </div>
          </div>

          {song.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 dark:text-gray-300">
                {song.description}
              </p>
            </div>
          )}

          {song.audioUrl && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Audio</h2>
              <audio
                controls
                className="w-full h-10"
                src={song.audioUrl}
              />
            </div>
          )}

          <button
            onClick={handleLike}
            disabled={liked}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              liked
                ? "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {liked ? "♥ Liked" : "♥ Like"}
          </button>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Created {new Date(song.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
