import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";
const pages = JSON.parse(await readFile("src/content/pages.json", "utf8"));
const routes = pages.routes;
for (const route of routes) {
  const html = await readFile(
    resolve("dist", route.slice(1), "index.html"),
    "utf8",
  );
  if (
    !/<h1[ >]/.test(html) ||
    !html.includes("__CONFERENCE_BUILD_TIME__") ||
    html.includes('<div id="root"></div>')
  )
    throw new Error(`Missing rendered content: ${route}`);
  if (
    route === "/committee/" ||
    (route === "/" && !pages.routes.includes("/committee/"))
  ) {
    for (const name of [
      "Kamal Kishore Pant",
      "Harender Singh Bisht",
      "Alicia Kyoungjin An",
      "Gopinath Packirisamy",
    ])
      if (!html.includes(name)) throw new Error(`Missing ODT person: ${name}`);
  }
  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g))
    await access(resolve("dist", match[1].slice(1)));
  console.log(`Readable HTML and local assets verified: ${route}`);
}
