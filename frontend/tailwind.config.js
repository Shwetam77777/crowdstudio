/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0E0C15",        // Deep Midnight Obsidian
        surface: "#161324",   // Glassmorphic Violet Panel
        panel: "#1E1A34",     // DAW Channel Strip Body
        primary: "#FF9F43",   // Electric Amber Accent
        accent: "#00F2FE",    // Neon Cyan Signal Accent
        neon: "#E100FF",      // Magenta Audio Pulse Accent
        alert: "#FF4D4D",     // High-Visibility Error Red
        paper: "#F8F9FE",     // Crisp Bright Text
        muted: "#A09DBA",     // Sleek Muted Violet Gray
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 242, 254, 0.35)",
        amberGlow: "0 0 20px rgba(255, 159, 67, 0.4)",
        magentaGlow: "0 0 20px rgba(225, 0, 255, 0.35)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
};
