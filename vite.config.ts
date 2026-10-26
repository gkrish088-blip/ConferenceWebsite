import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  const launchMode = mode === "landing" ? "landing" : "full";

  return {
    plugins: [
      {
        name: "launch-mode-entry",
        transformIndexHtml: {
          order: "pre",
          handler(html) {
            return launchMode === "landing"
              ? html.replace('src="/src/main.tsx"', 'src="/src/landing.tsx"')
              : html;
          },
        },
      },
    ],
    define: {
      "import.meta.env.VITE_LAUNCH_MODE": JSON.stringify(launchMode),
    },
    build: {
      outDir: resolve(projectRoot, "dist"),
      emptyOutDir: true,
      rollupOptions: {
        input:
          launchMode === "landing"
            ? [resolve(projectRoot, "index.html")]
            : [
                resolve(projectRoot, "index.html"),
                resolve(projectRoot, "countdown/index.html"),
              ],
      },
    },
  };
});
