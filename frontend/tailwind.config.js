/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm analog mixing-console palette — deliberately not the
        // generic near-black+neon look this project's UI was inheriting
        // from present-mind-sound, and not Claude's own terracotta.
        bg: "#1C1815",       // console body
        surface: "#26201B",  // panel
        panel: "#2F2820",    // channel strip
        primary: "#E8A33D",  // VU-meter amber — the main accent
        accent: "#4FB8A6",   // "live" teal — presence, AI export
        alert: "#C1543A",    // rust — errors only
        paper: "#F2EDE4",    // primary text
        muted: "#9C9284",    // secondary text, warm gray (not cool gray)
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
