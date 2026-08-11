import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    // Real code splitting — the old present-mind-sound app shipped one
    // 1.4MB chunk with three.js + tone.js bundled together. Split them.
    rollupOptions: {
      output: {
        manualChunks: {
          tone: ["tone"],
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
