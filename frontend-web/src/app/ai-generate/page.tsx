"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { aiAPI } from "@/lib/api";

export default function AIGeneratePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [lyrics, setLyrics] = useState("");
  const [genre, setGenre] = useState("pop");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const genres = [
    "pop",
    "rock",
    "jazz",
    "classical",
    "electronic",
    "hip-hop",
    "country",
    "r&b",
    "indie",
    "folk",
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/login");
      return;
    }

    if (!lyrics.trim()) {
      setError("Please enter lyrics for your song");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      const song = await aiAPI.generateSong(lyrics, genre, title);
      // Redirect to the newly created song
      router.push(`/songs/${song.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate AI song");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎵 AI Music Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Transform your lyrics into AI-generated music
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm border border-gray-200 dark:border-gray-700">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded-lg mb-6 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200"
              >
                Song Title (Optional)
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter a title or let AI generate one"
                disabled={isGenerating}
              />
            </div>

            <div>
              <label
                htmlFor="genre"
                className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200"
              >
                Genre
              </label>
              <select
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isGenerating}
              >
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="lyrics"
                className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200"
              >
                Lyrics *
              </label>
              <textarea
                id="lyrics"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                rows={12}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all font-mono"
                placeholder="Enter your song lyrics here...&#10;&#10;Example:&#10;Verse 1:&#10;Walking down the street&#10;Feeling the beat&#10;&#10;Chorus:&#10;This is my song&#10;Singing all day long"
                disabled={isGenerating}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {lyrics.split('\n').filter(line => line.trim()).length} lines • {lyrics.split(/\s+/).filter(word => word).length} words
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating AI Music...
                  </span>
                ) : (
                  "✨ Generate Song"
                )}
              </button>
            </div>
          </form>

          {isGenerating && (
            <div className="mt-6 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl border border-purple-300 dark:border-purple-700">
              <p className="text-center text-purple-800 dark:text-purple-200 font-medium">
                🎼 AI is creating your masterpiece... This may take a few moments.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            💡 Tips for Better AI Music
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>Write clear, structured lyrics with verses and chorus</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>Choose a genre that matches your lyrical theme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>Longer lyrics (3-4 verses) create more complex compositions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>Use descriptive language to influence the mood</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
