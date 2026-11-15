import { createServer } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const fullMode = process.argv[2] !== "landing";
const server = await createServer({
  mode: fullMode ? "full" : "landing",
  configFile: "./vite.config.ts",
  optimizeDeps: { noDiscovery: true, include: [], entries: [] },
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: "custom",
});
const escape = (value) =>
  value.replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
try {
  const { render, site } = await server.ssrLoadModule("/src/entry-server.tsx");
  const { pages } = await server.ssrLoadModule("/src/content/pages.ts");
  const template = await readFile("dist/index.html", "utf8");
  const routes = fullMode ? pages.routes : ["/"];
  const timestamp = Date.now();
  const origin = process.env.SITE_ORIGIN?.replace(/\/$/, "");
  if (origin && !/^https:\/\/[^/]+$/.test(origin))
    throw new Error("SITE_ORIGIN must be an https origin without a path");
  const css = [
    ...template.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g),
  ].map((match) => match[1]);
  for (const pathname of routes) {
    const countdown = !fullMode || pathname === "/countdown/";
    const label =
      pathname === "/"
        ? ""
        : site.nav.find((item) => pathname === `/${item.id}/`)?.label;
    const title = countdown
      ? `${site.shortName} | ${site.accessibility.countdownLabel}`
      : label
        ? `${label} | ${site.shortName}`
        : site.name;
    const description = `${site.name}. ${site.datesText}. ${site.venue}. ${site.tagline}`;
    const pageTemplate =
      fullMode && pathname === "/countdown/"
        ? await readFile("dist/countdown/index.html", "utf8")
        : template;
    let html = pageTemplate.replace(
      '<div id="root"></div>',
      `<div id="root">${render(pathname, fullMode, timestamp)}</div>`,
    );
    if (html === pageTemplate)
      throw new Error(`Prerender did not insert content for ${pathname}`);
    html = html.replace(
      /<title>.*?<\/title>/s,
      `<title>${escape(title)}</title>`,
    );
    html = html.replace(
      "</head>",
      `<meta name="description" content="${escape(description)}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${escape(title)}" />
<meta property="og:description" content="${escape(description)}" />
${
  origin
    ? `<link rel="canonical" href="${origin}${pathname}" />
<meta property="og:url" content="${origin}${pathname}" />
<meta property="og:image" content="${origin}/assets/approved/campus/iitr-2.webp" />`
    : ""
}
<script>window.__CONFERENCE_BUILD_TIME__=${timestamp}</script>
<noscript><style>[class*="navLinks"]{display:flex!important;flex-wrap:wrap;position:static!important;max-height:none!important}[class*="menuButton"],[data-gallery-controls]{display:none!important}[class*="navShell"]{position:relative!important}[class*="navShell"]>div{flex-wrap:wrap}</style></noscript>
</head>`,
    );
    const output = resolve("dist", pathname.slice(1), "index.html");
    await mkdir(resolve(output, ".."), { recursive: true });
    await writeFile(output, html);
    if (!/<h1[ >]/.test(html))
      throw new Error(`No readable heading: ${pathname}`);
    if (!css.length) throw new Error("Build has no stylesheet");
    console.log(`Prerendered ${pathname}: ${html.length} bytes`);
  }
  await writeFile(
    "dist/robots.txt",
    `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ""}`,
  );
  if (origin)
    await writeFile(
      "dist/sitemap.xml",
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((path) => `<url><loc>${escape(origin + path)}</loc></url>`).join("")}</urlset>`,
    );
  // Unknown URLs return a genuine 404 on static hosts rather than the conference home page.
  await writeFile(
    "dist/404.html",
    '<!doctype html><html lang="en"><meta charset="utf-8"><title>404</title><meta name="robots" content="noindex"><body><h1>404</h1><a href="/">' +
      escape(site.shortName) +
      "</a></body></html>",
  );
} finally {
  await server.close();
}
