import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const origin = process.env.CONFERENCE_ORIGIN || "http://127.0.0.1:5283";
const out = "proof/typography";
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const report = { origin, pages: [], fontLoading: [], glyph: null };
const failures = [];
try {
  for (const width of [1366, 390]) {
    for (const theme of ["light", "dark"]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
      });
      await context.addInitScript((saved) => {
        localStorage.setItem("memdesai-theme", saved);
        window.__fontCLS = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            if (!entry.hadRecentInput) window.__fontCLS += entry.value;
        }).observe({ type: "layout-shift", buffered: true });
      }, theme);
      const page = await context.newPage();
      page.on("pageerror", (error) => failures.push(error.message));
      page.on("response", (r) => {
        if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
      });
      let fonts = [];
      page.on("request", (r) => {
        if (r.resourceType() === "font") fonts.push(r.url());
      });
      for (const route of ["/", "/themes/", "/dates/", "/registration/"]) {
        fonts = [];
        await page.goto(origin + route);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForLoadState("networkidle");
        const result = await page.evaluate(() => {
          const style = (element) => {
            const s = getComputedStyle(element);
            return {
              text: element.textContent.trim().slice(0, 100),
              family: s.fontFamily,
              weight: s.fontWeight,
              size: s.fontSize,
              spacing: s.letterSpacing,
              lineHeight: s.lineHeight,
            };
          };
          const headings = [...document.querySelectorAll("h1,h2,h3")].map(
            style,
          );
          const title = document.querySelector("[data-flow-hero] h1");
          return {
            theme: document.querySelector("[data-theme]").dataset.theme,
            themeColor: document.querySelector('meta[name="theme-color"]')
              .content,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            headings,
            titleLines: title
              ? title.getBoundingClientRect().height /
                parseFloat(getComputedStyle(title).lineHeight)
              : null,
            cls: window.__fontCLS,
            preloads: [...document.querySelectorAll('link[as="font"]')].map(
              (e) => e.href,
            ),
            ui: [...document.querySelectorAll("nav a,button,time")]
              .slice(0, 18)
              .map(style),
          };
        });
        assert.equal(result.theme, theme);
        assert.equal(
          result.themeColor,
          theme === "light" ? "#f5f8f7" : "#162620",
        );
        assert.equal(result.overflow, false, `${route}: overflow at ${width}`);
        if (width === 1366 && result.titleLines)
          assert(result.titleLines < 3.01);
        for (const h of result.headings) {
          assert(h.family.includes("Source Serif 4"));
          assert.equal(h.weight, "600");
        }
        assert(result.preloads.length === 3);
        assert(
          result.preloads.every((url) =>
            /source-serif-4|inter-latin/.test(url),
          ),
        );
        assert(
          fonts.every(
            (url) =>
              url.startsWith(origin) &&
              /(?:source-serif-4|inter|ibm-plex-mono)-latin-.*\.woff2$/.test(
                url,
              ),
          ),
        );
        const name = `${route === "/" ? "home" : route.split("/")[1]}-${theme}-${width}`;
        await page.locator("img").evaluateAll((images) =>
          images.forEach((img) => {
            img.loading = "eager";
          }),
        );
        await page.waitForLoadState("networkidle");
        await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
        report.pages.push({
          route,
          width,
          theme,
          screenshot: `${name}.png`,
          fonts,
          ...result,
        });
      }
      if (width === 1366 && theme === "light") {
        await page.goto(origin);
        await page.evaluate(() => document.fonts.ready);
        const cdp = await context.newCDPSession(page);
        await cdp.send("DOM.enable");
        await cdp.send("CSS.enable");
        const { root } = await cdp.send("DOM.getDocument");
        const { nodeId } = await cdp.send("DOM.querySelector", {
          nodeId: root.nodeId,
          selector: 'button[class*="motionToggle"] span',
        });
        report.glyph = await cdp.send("CSS.getPlatformFontsForNode", {
          nodeId,
        });
        assert(report.glyph.fonts.some((font) => font.glyphCount > 0));
      }
      await context.close();
    }
  }

  // A delayed cold font response makes fallback-to-web-font movement observable.
  for (const width of [1366, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    await context.addInitScript(() => {
      window.__shifts = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput)
            window.__shifts.push({
              value: entry.value,
              sources: entry.sources.map(
                (source) => source.node?.className || source.node?.nodeName,
              ),
            });
      }).observe({ type: "layout-shift", buffered: true });
    });
    const page = await context.newPage();
    await page.route("**/*.woff2", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.continue();
    });
    await page.goto(origin, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    const shifts = await page.evaluate(() => window.__shifts);
    report.fontLoading.push({
      width,
      delayMs: 800,
      cls: shifts.reduce((sum, s) => sum + s.value, 0),
      shifts,
    });
    await context.close();
  }
  assert.deepEqual(failures, []);
} finally {
  await browser.close();
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2) + "\n");
}
console.log(
  JSON.stringify(
    {
      pages: report.pages.length,
      fontLoading: report.fontLoading,
      glyph: report.glyph,
      failures,
    },
    null,
    2,
  ),
);
