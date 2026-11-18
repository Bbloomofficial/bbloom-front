/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Client websites read live data from the backend during development.
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY ?? "http://localhost:8080",
        changeOrigin: true,
        // `changeOrigin` only rewrites Host. A deployed backend also checks
        // Origin and rejects `localhost` outright, so pointing the proxy at a
        // real environment needs the browser's Origin rewritten to match too.
        configure(proxy) {
          proxy.on("proxyReq", (proxyReq) => {
            const target = process.env.VITE_API_PROXY;
            if (target && proxyReq.getHeader("origin")) {
              proxyReq.setHeader("origin", new URL(target).origin);
            }
          });
        },
      },
    },
  },
  // Section renderers are plain React components, so a jsdom environment is
  // enough — nothing here needs a browser or a running backend.
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
