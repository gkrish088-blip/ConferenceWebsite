import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";
import { build, preview } from "vite";

const browser = await chromium.launch();
const directory =
  process.env.MEMDESAI_QA_DIRECTORY ??
  fileURLToPath(new URL("../screenshots/", import.meta.url));
await mkdir(directory, { recursive: true });

async function withBuild(mode, check) {
  await build({ mode, logLevel: "warn" });
  const server = await preview({
    mode,
    preview: { host: "127.0.0.1", port: 0 },
  });
  try {
    await check(server.resolvedUrls.local[0]);
  } finally {
    await new Promise((resolve) => server.httpServer.close(resolve));
  }
}

const title =
  "International Conference on Membrane Technology, Desalination, Artificial Intelligence and Environmental Sustainability";
const links = [
  "About",
  "Themes",
  "Dates",
  "Speakers",
  "Committee",
  "Registration",
  "Hospitality",
  "Contact",
];
const annotations =
  /Six forms|Opposite charges|About the chemistry|Interactive schematic|Microfiltration|Ultrafiltration|Nanofiltration|Reverse osmosis|Second-pass RO|Interactive filtration schematic|A meeting of minds|Follow the flow/;
const themeButton = (page, theme) =>
  page.getByRole("button", { name: `Switch to ${theme} theme` });

try {
  await withBuild("full", async (url) => {
    for (const width of [375, 768, 1440]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(url);
      await expect(
        page.getByRole("heading", { name: title, exact: true }),
      ).toBeVisible();
      await expect(page).toHaveTitle("MemDesAI 2027");
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        "MemDesAI 2027",
      );
      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("link", { name: "Skip to content" }),
      ).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.locator("#main-content")).toBeFocused();
      await expect(page.locator("#top")).toHaveCount(1);
      await expect(page.locator("main #top")).toHaveCount(0);
      await expect(page.locator("main h1 + p")).toHaveText(
        "Connecting membrane science, desalination, artificial intelligence and environmental sustainability.",
      );
      await expect(
        page
          .locator("[data-flow-hero]")
          .getByRole("link", { name: "Register" }),
      ).toHaveAttribute("aria-disabled", "true");
      await expect(page.locator("#about h2")).toHaveText(
        "About the conference",
      );
      await expect(page.locator("#themes article")).toHaveCount(10);
      await expect(
        page.locator("[data-flow-node][aria-hidden='true']:empty"),
      ).toHaveCount(5);
      await expect(page.locator("body")).not.toContainText(annotations);

      const nav = page.getByRole("navigation", { name: "Primary navigation" });
      const mobile = width < 900;
      const menu = nav.getByRole("button", { name: "Open navigation menu" });
      const close = nav.getByRole("button", { name: "Close navigation menu" });
      await expect(nav).toHaveCount(1);
      if (mobile) {
        await expect(menu).toHaveAttribute(
          "aria-controls",
          "site-navigation-links",
        );
        await expect(menu).toHaveAttribute("aria-expanded", "false");
        await menu.click();
        await expect(close).toHaveAttribute("aria-expanded", "true");
      }
      await expect(nav.locator("#site-navigation-links a")).toHaveText(links);
      await nav.getByRole("link", { name: "Dates", exact: true }).click();
      if (mobile) await expect(menu).toHaveAttribute("aria-expanded", "false");
      await expect(
        nav.getByRole("link", { name: "MemDesAI-2027" }),
      ).toBeVisible();
      await expect(nav.locator('a[href="#dates"]')).toHaveAttribute(
        "aria-current",
        "location",
      );

      const canvas = page.locator("canvas");
      await expect(canvas).toHaveCSS("position", "fixed");
      await expect(canvas).toHaveCSS("z-index", "0");
      await expect(canvas).toHaveCSS("pointer-events", "none");
      await expect(page.locator("main")).toHaveCSS("z-index", "1");
      await expect(canvas).toHaveAttribute("data-motion", "static");

      for (const theme of ["dark", "light"]) {
        if (theme === "light") {
          if (mobile) await menu.click();
          await expect(
            page.getByRole("button", { name: "Pause animation" }),
          ).toHaveCount(1);
          await themeButton(page, "light").click();
          if (mobile) await close.click();
        }
        await expect(page.locator(`[data-theme="${theme}"]`)).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: resolve(directory, `after-${theme}-${width}-home.png`),
        });
        for (const [section, target] of [
          ["about", "#about article:first-of-type a:last-of-type"],
          ["dates", "#dates time:visible"],
          ["speakers", "#speakers article"],
          ["committee", "#committee h2"],
          ["registration", "#registration table td"],
          ["hospitality", "#hospitality button"],
          ["contact", "#contact a"],
        ]) {
          await page.locator(target).first().click({ trial: true });
          if (["about", "dates", "registration"].includes(section)) {
            await page
              .locator(`#${section}`)
              .evaluate((element) => element.scrollIntoView());
            await page.screenshot({
              path: resolve(
                directory,
                `after-${theme}-${width}-${section}.png`,
              ),
            });
          }
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width);
      }

      const accordion = page
        .locator("#hospitality")
        .getByRole("button")
        .first();
      await accordion.click();
      await expect(accordion).toHaveAttribute("aria-expanded", "true");
      await page.reload();
      await expect(page.locator('[data-theme="light"]')).toBeVisible();
      await page.getByRole("link", { name: "Conference countdown" }).click();
      await expect(
        page.getByRole("link", { name: "Enter site" }),
      ).toHaveAttribute("href", "/");
      expect(errors).toEqual([]);
      await page.close();
      console.log(`Interactive layout and controls passed at ${width}px`);
    }

    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await page.goto(url);
    const canvas = page.locator("canvas");
    await expect(canvas).toHaveAttribute("data-motion", "running");
    await page.getByRole("button", { name: "Pause animation" }).click();
    await expect(canvas).toHaveAttribute("data-motion", "static");
    await page.getByRole("button", { name: "Resume animation" }).click();
    await expect(canvas).toHaveAttribute("data-motion", "running");
    await page.locator("footer").evaluate((footer) => {
      footer.style.minHeight = "120vh";
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
    });
    await expect(canvas).toHaveAttribute("data-motion", "static");
    await page.close();
  });

  await withBuild("landing", async (url) => {
    const page = await browser.newPage();
    await page.goto(url);
    await expect(page.getByText("Full website coming soon.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Enter site" })).toHaveCount(0);
    await page.close();
  });
  console.log("Animation, pause, and both countdown routes passed");
} finally {
  await browser.close();
}
