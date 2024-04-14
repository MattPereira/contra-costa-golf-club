// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Asynchronously import the ESM plugin
const pluginRewriteAll = import("vite-plugin-rewrite-all").then(
  (m) => m.default
);

export default defineConfig({
  plugins: [react(), pluginRewriteAll],
  server: {
    port: 3000,
  },
});
