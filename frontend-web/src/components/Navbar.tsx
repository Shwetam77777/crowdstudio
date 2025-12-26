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
    <nav className="w-full py-4 px-6 border-b border-gray-300 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <h1 className="text-2xl font-bold cursor-pointer">
            {theme === "neon" ? (
              <span className="text-neonBlue">CrowdStudio</span>
            ) : (
              "CrowdStudio"
            )}
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {themes.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${theme === t
                    ? theme === "neon"
                      ? "bg-neonPink text-black"
                      : "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-4 ml-4">
              {user.role === "producer" && (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                >
                  Dashboard
                </Link>
              )}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-4 px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
