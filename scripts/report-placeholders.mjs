import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const contentRoot = fileURLToPath(new URL("../src/content/", import.meta.url));

async function jsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? jsonFiles(path)
        : entry.name.endsWith(".json")
          ? [path]
          : [];
    }),
  );
  return nested.flat();
}

function findPlaceholders(value, path = "$", found = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      findPlaceholders(item, `${path}[${index}]`, found),
    );
  } else if (value && typeof value === "object") {
    if (value.placeholder === true) found.push(path);
    for (const [key, child] of Object.entries(value)) {
      if (key !== "placeholder")
        findPlaceholders(child, `${path}.${key}`, found);
    }
  }
  return found;
}

const files = (await jsonFiles(contentRoot)).sort();
let total = 0;

for (const file of files) {
  const data = JSON.parse(await readFile(file, "utf8"));
  const records = findPlaceholders(data);
  if (records.length === 0) continue;
  total += records.length;
  console.log(
    `${relative(contentRoot, file).replaceAll("\\", "/")}: ${records.length} placeholder records`,
  );
  for (const record of records) console.log(`  ${record}`);
}

console.log(
  `Total: ${total} placeholder records across ${files.length} content files.`,
);
