/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#050508",        // Pure Pitch Black
        surface: "#0D0D14",   // Deep Obsidian Card
        panel: "#14141F",     // Sleek Studio Console Strip
        primary: "#FFAB00",   // Vibrant Gold Accent
        accent: "#00F2FE",    // Electric Neon Cyan
        neon: "#BD00FF",      // Electric Neon Magenta
        alert: "#FF3B30",     // Bright Red Error
        paper: "#FFFFFF",     // Pure Crisp White
        muted: "#8E8EA8",     // Sleek Slate Gray
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px rgba(0, 242, 254, 0.4)",
        amberGlow: "0 0 25px rgba(255, 171, 0, 0.4)",
        magentaGlow: "0 0 25px rgba(189, 0, 255, 0.4)",
        glass: "0 10px 40px 0 rgba(0, 0, 0, 0.8)",
      },
    },
  },
  plugins: [],
};
