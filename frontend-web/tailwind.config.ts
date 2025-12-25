import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0f0f0f",
        darkText: "#e0e0e0",
        lightBg: "#f5f5f5",
        lightText: "#1a1a1a",
        neonPink: "#ff006e",
        neonBlue: "#00d4ff",
        neonPurple: "#b500d4",
      },
    },
  },
  plugins: [],
};
export default config;
