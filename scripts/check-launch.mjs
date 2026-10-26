import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const contentRoot = fileURLToPath(new URL("../src/content/", import.meta.url));
const problems = [];

async function inspect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await inspect(path);
      continue;
    }
    if (!entry.name.endsWith(".json")) continue;
    const data = JSON.parse(await readFile(path, "utf8"));
    const relativePath = relative(contentRoot, path).split(sep).join("/");
    walk(data, relativePath, "$");
  }
}

function walk(value, file, path) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, file, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  if (value.placeholder === true)
    problems.push(`${file}${path}: placeholder record`);
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (key.toLowerCase().endsWith("url") && child === "#")
      problems.push(`${file}${childPath}: placeholder URL`);
    if (
      key === "src" &&
      typeof child === "string" &&
      child.startsWith("/placeholders/")
    )
      problems.push(`${file}${childPath}: placeholder image`);
    if (key !== "placeholder") walk(child, file, childPath);
  }
}

await inspect(contentRoot);
if (problems.length > 0) {
  console.error(
    `Launch check failed with ${problems.length} placeholder issues:`,
  );
  for (const problem of problems) console.error(`- ${problem}`);
  process.exitCode = 1;
} else {
  console.log("Launch check passed.");
}
