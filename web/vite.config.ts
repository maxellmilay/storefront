import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // In development the API runs beside Vite; nginx proxies it once built
  // (nginx.conf), stripping /api the same way.
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
