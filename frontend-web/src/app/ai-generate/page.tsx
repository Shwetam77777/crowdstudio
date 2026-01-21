"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { aiAPI } from "@/lib/api";

export default function AIGeneratePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [genre, setGenre] = useState("pop");
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<"prompt" | "lyrics">("prompt");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const genres = [
    { id: "pop", name: "Pop", emoji: "🎵", color: "from-pink-500 to-rose-500" },
    { id: "rock", name: "Rock", emoji: "🎸", color: "from-red-500 to-orange-500" },
    { id: "jazz", name: "Jazz", emoji: "🎷", color: "from-blue-500 to-indigo-500" },
    { id: "classical", name: "Classical", emoji: "🎻", color: "from-purple-500 to-violet-500" },
    { id: "electronic", name: "Electronic", emoji: "🎹", color: "from-cyan-500 to-blue-500" },
    { id: "hip-hop", name: "Hip Hop", emoji: "🎤", color: "from-yellow-500 to-orange-500" },
    { id: "country", name: "Country", emoji: "🤠", color: "from-amber-500 to-yellow-500" },
    { id: "r&b", name: "R&B", emoji: "💜", color: "from-fuchsia-500 to-pink-500" },
    { id: "indie", name: "Indie", emoji: "🌟", color: "from-teal-500 to-emerald-500" },
    { id: "folk", name: "Folk", emoji: "🌿", color: "from-green-500 to-lime-500" },
  ];

  const examplePrompts = [
    "A love song about summer nights",
    "Upbeat party anthem with catchy chorus",
    "Sad ballad about missing someone",
    "Epic adventure theme with orchestral feel",
    "Chill lo-fi beats for studying",
  ];

  const expandLyrics = (shortLyrics: string): string => {
    // AI-like lyrics expansion
    const lines = shortLyrics.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) return shortLyrics;

    let expanded = '';
    const firstLine = lines[0];
    
    // Generate verse 1
    expanded += '[Verse 1]\n';
    expanded += firstLine + '\n';
    expanded += 'Walking through the memories we made\n';
    expanded += 'Every moment with you never fades\n';
    expanded += 'In my heart you\'ll always stay\n\n';
    
    // Generate chorus
    expanded += '[Chorus]\n';
    expanded += firstLine + '\n';
    expanded += 'This feeling deep inside won\'t go away\n';
    expanded += firstLine + '\n';
    expanded += 'Forever in my heart you\'ll stay\n\n';
    
    // Generate verse 2
    expanded += '[Verse 2]\n';
    if (lines.length > 1) {
      expanded += lines[1] + '\n';
    }
    expanded += 'Time keeps moving but I\'m standing still\n';
    expanded += 'Thinking of you gives me such a thrill\n';
    expanded += 'No matter what, I always will\n\n';
    
    // Repeat chorus
    expanded += '[Chorus]\n';
    expanded += firstLine + '\n';
    expanded += 'This feeling deep inside won\'t go away\n';
    expanded += firstLine + '\n';
    expanded += 'Forever in my heart you\'ll stay\n';
    
    return expanded;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Allow generation without login, but save only if logged in
    const input = mode === "prompt" ? prompt : lyrics;
    
    if (!input.trim()) {
      setError(`Please enter ${mode === "prompt" ? "a prompt" : "lyrics"} for your song`);
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      let finalLyrics = input;
      
      // If mode is prompt, convert to lyrics structure
      if (mode === "prompt") {
        finalLyrics = `[Verse 1]\n${input}\n\nWalking through the memories we made\nEvery moment never fades\n\n[Chorus]\n${input}\nThis feeling deep inside won't go away\n\n[Verse 2]\nTime keeps moving forward, day by day\nIn my heart, you'll always stay`;
      } else if (input.split('\n').filter(l => l.trim()).length < 5) {
        // Auto-expand short lyrics
        finalLyrics = expandLyrics(input);
      }

      if (user) {
        // User is logged in, save to database
        const song = await aiAPI.generateSong(finalLyrics, genre, title || undefined);
        router.push(`/songs/${song.id}`);
      } else {
        // Not logged in, show preview (redirect to login to save)
        alert("🎵 Song Generated!\n\nLogin to save your song and share it with the community!");
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate AI song");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section - Suno Style */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full border border-purple-200 dark:border-purple-800 shadow-xl">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">AI Ready</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Create Music<br />with AI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Turn your ideas into complete songs. Just describe what you want or write some lyrics.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => setMode("prompt")}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${
              mode === "prompt"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/50"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
            }`}
          >
            ✨ Describe Song
          </button>
          <button
            type="button"
            onClick={() => setMode("lyrics")}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${
              mode === "lyrics"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-2xl shadow-blue-500/50"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
            }`}
          >
            📝 Write Lyrics
          </button>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-purple-200 dark:border-purple-900">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-6 py-4 rounded-2xl mb-8 animate-shake font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-8">
            {/* Main Input Area */}
            {mode === "prompt" ? (
              <div>
                <label className="block text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
                  What kind of song do you want? ✨
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-6 py-4 border-2 border-purple-300 dark:border-purple-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 resize-none transition-all placeholder:text-gray-400"
                  placeholder="Example: A romantic ballad about stargazing with someone special..."
                  disabled={isGenerating}
                />
                
                {/* Example Prompts */}
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Try these:</p>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((example, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(example)}
                        className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium transition-all"
                        disabled={isGenerating}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
                  Write your lyrics 📝
                </label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  rows={12}
                  required
                  className="w-full px-6 py-4 border-2 border-blue-300 dark:border-blue-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 resize-none transition-all font-mono placeholder:text-gray-400"
                  placeholder="Start writing... AI will help expand short lyrics into a full song!&#10;&#10;Just a line or two is enough to get started:&#10;'Walking under the stars tonight'&#10;'Missing you more each day'"
                  disabled={isGenerating}
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {lyrics.split('\n').filter(line => line.trim()).length} lines • {lyrics.split(/\s+/).filter(word => word).length} words
                  </p>
                  {lyrics.trim() && lyrics.split('\n').filter(l => l.trim()).length < 5 && (
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                      ✨ AI will auto-expand
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Genre Selection - Beautiful Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  Choose Genre 🎵
                </label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {genres.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGenre(g.id)}
                    disabled={isGenerating}
                    className={`p-4 rounded-xl font-bold text-center transition-all transform hover:scale-105 ${
                      genre === g.id
                        ? `bg-gradient-to-br ${g.color} text-white shadow-xl`
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="text-2xl mb-1">{g.emoji}</div>
                    <div className="text-sm">{g.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                {showAdvanced ? "▼" : "▶"} Advanced Options
              </button>
              
              {showAdvanced && (
                <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                    Custom Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Leave empty for AI-generated title"
                    disabled={isGenerating}
                  />
                </div>
              )}
            </div>

            {/* Generate Button - Large and Beautiful */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isGenerating}
                className={`w-full px-8 py-6 bg-gradient-to-r ${
                  mode === "prompt" 
                    ? "from-purple-600 via-pink-600 to-blue-600" 
                    : "from-blue-600 via-cyan-600 to-teal-600"
                } text-white rounded-2xl font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] disabled:hover:scale-100 shadow-2xl hover:shadow-3xl`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg
                      className="animate-spin h-6 w-6"
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
                    Creating Your Song...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-2xl">🎵</span>
                    Generate Song with AI
                  </span>
                )}
              </button>
              
              {!user && (
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                  🔐 Login after generating to save and share your song
                </p>
              )}
            </div>
          </form>

          {/* Generating Status */}
          {isGenerating && (
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-blue-900/30 rounded-2xl border-2 border-purple-300 dark:border-purple-700 animate-pulse">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
              <p className="text-center text-purple-800 dark:text-purple-200 font-bold text-lg">
                🎼 AI is composing your masterpiece...
              </p>
              <p className="text-center text-purple-600 dark:text-purple-300 text-sm mt-2">
                This may take a few moments
              </p>
            </div>
          )}
        </div>

        {/* Tips Section - Redesigned */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-purple-200 dark:border-purple-900">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="text-2xl">✨</span> Prompt Mode Tips
            </h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 text-lg">•</span>
                <span>Describe the mood, story, or feeling you want</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 text-lg">•</span>
                <span>Be specific about instruments or style</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 text-lg">•</span>
                <span>Mention the theme (love, adventure, party, etc.)</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-900">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="text-2xl">📝</span> Lyrics Mode Tips
            </h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 text-lg">•</span>
                <span>Even 1-2 lines work - AI auto-expands short lyrics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 text-lg">•</span>
                <span>Use [Verse], [Chorus] tags for structure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 text-lg">•</span>
                <span>Rhyming words create better flow</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
