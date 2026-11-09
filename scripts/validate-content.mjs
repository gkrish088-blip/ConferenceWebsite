import { createServer } from "vite";

const server = await createServer({
  configFile: "./vite.config.ts",
  optimizeDeps: { noDiscovery: true, include: [], entries: [] },
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  await server.ssrLoadModule("/src/content/index.ts");
  await server.ssrLoadModule("/src/content/flow-example.ts");
  console.log(
    "Content schema validation passed for conference and interactive design data.",
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await server.close();
}
