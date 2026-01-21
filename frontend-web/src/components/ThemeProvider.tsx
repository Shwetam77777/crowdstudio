"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeType = "light" | "dark" | "neon";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeType>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme =
      (localStorage.getItem("theme") as ThemeType) || "dark";
    setThemeState(savedTheme);
    
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", savedTheme);
    
    // Also apply as class for better CSS support
    document.documentElement.classList.remove("light", "dark", "neon");
    document.documentElement.classList.add(savedTheme);
    
    // Update meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      const colors = {
        light: "#ffffff",
        dark: "#0f0f23",
        neon: "#000000"
      };
      metaTheme.setAttribute("content", colors[savedTheme]);
    }
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem("theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      
      // Apply as class
      document.documentElement.classList.remove("light", "dark", "neon");
      document.documentElement.classList.add(newTheme);
      
      // Update meta theme-color
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        const colors = {
          light: "#ffffff",
          dark: "#0f0f23",
          neon: "#000000"
        };
        metaTheme.setAttribute("content", colors[newTheme]);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
