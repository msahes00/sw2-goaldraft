import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import deno from "@deno/vite-plugin";

import "react";
import "react-dom";

export default defineConfig({
  base: "./",
  root: "./frontend",
  server: {
    port: 3000,
  },
  // WARNING: the plugin functions below may show errors in the IDE
  // but the project will still build and run correctly, so they can safely be ignored
  plugins: [
    react(),
    deno(),
  ],
  optimizeDeps: {
    include: ["react/jsx-runtime"],
  },
  ssr: {
    noExternal: ["npm:@emotion/css"],
  },
  resolve: {
    alias: {
      "npm:@emotion/css": "@emotion/css",
    },
  },
});
