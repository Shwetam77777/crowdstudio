"use client";

import React from "react";
import Link from "next/link";
import { useTheme, ThemeType } from "./ThemeProvider";

export const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: ThemeType[] = ["light", "dark", "neon"];

  return (
    <nav className="w-full py-4 px-6 border-b border-gray-300 dark:border-gray-700">
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

        <div className="flex gap-2">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                theme === t
                  ? theme === "neon"
                    ? "bg-neonPink text-black"
                    : "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <Link href="/login">
          <button className="px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors">
            Login
          </button>
        </Link>
      </div>
    </nav>
  );
};
