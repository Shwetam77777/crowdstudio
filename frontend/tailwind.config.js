/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(220 20% 4%)",
        surface: "hsl(220 22% 8%)",
        primary: "hsl(174 90% 50%)",
        accent: "hsl(280 80% 60%)",
        muted: "hsl(220 10% 60%)",
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
