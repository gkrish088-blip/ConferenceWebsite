import { preview } from "vite";
import { chromium } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const { kind, routes } = JSON.parse(
  await readFile("src/content/pages.json", "utf8"),
);
const multipage = routes.includes("/committee/");
const server = process.argv.includes("--local")
  ? await preview({ preview: { host: "127.0.0.1", port: 0 } })
  : null;
const origin =
  (server && `http://127.0.0.1:${server.httpServer.address().port}`) ||
  process.env.CONFERENCE_ORIGIN ||
  `http://127.0.0.1:${{ static: 5281, interactive: 5282, multipage: 5283 }[kind]}`;
const out = "proof/design-refresh";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [],
  failed = [],
  external = new Set(),
  checks = [];
const watch = (page) => {
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      failed.push(`${response.status()} ${response.url()}`);
  });
  page.on("request", (request) => {
    if (!request.url().startsWith(origin) && !request.url().startsWith("data:"))
      external.add(request.url());
  });
};
const overflow = async (page) =>
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    `Horizontal overflow at ${page.viewportSize().width}px ${page.url()}`,
  );
const goto = async (page, path) => {
  await page.goto(origin + path);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.locator("img").evaluateAll((images) => {
    for (const image of images) image.loading = "eager";
  });
  await page.waitForLoadState("networkidle");
};
try {
  for (const width of [1440, 1024, 768, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    watch(page);
    await goto(page, "/");
    await overflow(page);
    if (kind !== "static")
      assert.equal(
        await page.locator("[data-theme]").getAttribute("data-theme"),
        "light",
      );
    await page.screenshot({ path: `${out}/home-${width}.png` });
    await page.locator("#about").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${out}/about-${width}.png` });
    const campus = page.locator('#about img[src*="/approved/campus/"]');
    assert.equal(await campus.count(), 1);
    await campus.evaluate((image) => image.decode());
    assert.equal(
      await page.locator("#about [data-gallery-controls]").count(),
      0,
    );
    if (multipage) await goto(page, "/committee/");
    else
      await page
        .locator("#committee")
        .evaluate((el) =>
          el.scrollIntoView({ block: "start", behavior: "instant" }),
        );
    assert.equal(
      await page.locator('#committee img[src*="/approved/portraits/"]').count(),
      35,
    );
    await page
      .locator("#committee img")
      .evaluateAll((images) =>
        Promise.all(images.map((image) => image.decode())),
      );
    await overflow(page);
    await page.screenshot({ path: `${out}/committee-${width}.png` });
    if (multipage) await goto(page, "/hospitality/#hospitality-uttarakhand");
    else await goto(page, "/#hospitality-uttarakhand");
    const tourism = page.locator("#hospitality-uttarakhand");
    await tourism.waitFor({ state: "visible" });
    assert(await tourism.evaluate((el) => el.open));
    assert.equal(
      await tourism.locator('img[src*="/approved/tourism/"]').count(),
      5,
    );
    await overflow(page);
    await tourism.screenshot({ path: `${out}/tourism-${width}.png` });
    await tourism.locator("summary").focus();
    await page.keyboard.press("Enter");
    assert.equal(await tourism.evaluate((el) => el.open), false);
    await page.keyboard.press("Space");
    assert.equal(await tourism.evaluate((el) => el.open), true);
    assert.notEqual(
      await tourism
        .locator("summary")
        .evaluate((el) => getComputedStyle(el).outlineStyle),
      "none",
    );
    await goto(page, "/");
    if (width < 900) {
      const menu = page.locator(
        'button[aria-controls="site-navigation-links"]',
      );
      if (await menu.count()) {
        await menu.click();
        assert.equal(await menu.getAttribute("aria-expanded"), "true");
        await page.keyboard.press("Escape");
        assert.equal(await menu.getAttribute("aria-expanded"), "false");
      }
    }
    if (kind === "static") {
      const hero = page.getByRole("region", {
        name: "Conference background slideshow",
      });
      await hero.getByRole("button", { name: "Next photograph" }).click();
      assert.match(
        await hero.locator('[aria-hidden="false"] img').getAttribute("src"),
        /membrane-fibres\.webp$/,
      );
    }
    checks.push(
      `${width}px: home/about/committee/tourism, galleries, native accordions, focus, no overflow`,
    );
    await context.close();
  }
  // Verify real static responses and native disclosures with JavaScript disabled.
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 900 },
  });
  const page = await context.newPage();
  watch(page);
  assert.equal(
    (await context.request.get(origin + "/countdown/")).status(),
    404,
  );
  for (const route of routes) {
    const response = await page.goto(origin + route);
    assert.equal(response.status(), 200);
    assert(await page.locator("h1").textContent());
    assert.equal(
      await page
        .locator(
          'footer #contact, footer a[href^="mailto:"], footer a[href^="tel:"]',
        )
        .count(),
      0,
    );
    assert.equal(
      await page.locator("main #contact").count(),
      route === "/contact/" ? 1 : 0,
    );
    if (route === "/hospitality/" || (route === "/" && !multipage)) {
      const details = page.locator("#hospitality-uttarakhand");
      await details.locator("summary").click();
      assert(await details.evaluate((el) => el.open));
    }
    assert(
      await page
        .locator("[data-site-navigation]")
        .getByRole("link", { name: "About", exact: true })
        .isVisible(),
    );
  }
  checks.push(
    "All published routes contain readable HTML without JavaScript; mobile navigation and disclosures remain usable",
  );
  await context.close();
  // Motion and theme preferences, history and client navigation after hydration.
  const motion = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const p = await motion.newPage();
  watch(p);
  await goto(p, "/");
  if (kind !== "static") {
    await p.getByRole("button", { name: "Switch to dark theme" }).click();
    assert.equal(
      await p.locator("[data-theme]").getAttribute("data-theme"),
      "dark",
    );
    await p.reload();
    await p.waitForLoadState("networkidle");
    assert.equal(
      await p.locator("[data-theme]").getAttribute("data-theme"),
      "dark",
    );
    await p.getByRole("button", { name: "Switch to light theme" }).click();
  }
  if (multipage) {
    await p.locator('[data-site-navigation] a[href="/committee/"]').click();
    await p.waitForURL("**/committee/");
    assert(await p.locator("#committee").isVisible());
    await p.goBack();
    assert(await p.locator("#about").isVisible());
  }
  await motion.close();
  assert.deepEqual(errors, [], "Browser/hydration errors");
  assert.deepEqual(failed, [], "Failed asset requests");
  assert.deepEqual([...external], [], "Unexpected external requests");
  await writeFile(
    `${out}/report.json`,
    JSON.stringify(
      { kind, origin, checks, errors, failed, external: [...external] },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      kind,
      checks: checks.length,
      errors,
      failed,
      external: [...external],
      screenshots: out,
    }),
  );
} finally {
  await browser.close();
  await server?.close();
}
