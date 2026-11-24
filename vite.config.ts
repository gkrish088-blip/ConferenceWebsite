import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ isPreview }) => ({
  appType: isPreview ? "mpa" : "spa",
  build: {
    outDir: resolve(projectRoot, "dist"),
    emptyOutDir: true,
  },
}));
