"use client";

import React from "react";
import Link from "next/link";
import { useTheme, ThemeType } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";

export const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const themes: ThemeType[] = ["light", "dark", "neon"];

  return (
    <nav className="w-full py-4 px-6 border-b border-purple-200 dark:border-purple-900 sticky top-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <h1 className="text-2xl md:text-3xl font-black cursor-pointer bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all">
            🎵 CrowdStudio
          </h1>
        </Link>

        <div className="flex items-center gap-3">
          {/* AI Generate Button - Always visible */}
          <Link
            href="/ai-generate"
            className="hidden sm:block px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg text-sm"
          >
            ✨ Create
          </Link>

          {/* Theme Switcher */}
          <div className="hidden md:flex gap-2 p-1 bg-gray-200 dark:bg-gray-800 rounded-xl">
            {themes.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-4 py-2 rounded-lg font-bold transition-all text-sm ${
                  theme === t
                    ? "bg-white dark:bg-gray-700 shadow-md scale-105"
                    : "hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
                title={t.charAt(0).toUpperCase() + t.slice(1)}
              >
                {t === "light" && "☀️"}
                {t === "dark" && "🌙"}
                {t === "neon" && "✨"}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              {user.role === "producer" && (
                <Link
                  href="/dashboard"
                  className="hidden sm:block px-4 py-2 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all"
                >
                  Dashboard
                </Link>
              )}
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                  {user.email.split('@')[0]}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl font-bold bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border-2 border-gray-300 dark:border-gray-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
