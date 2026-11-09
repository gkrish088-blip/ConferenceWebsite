import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import { build, preview } from "vite";

const browser = await chromium.launch();
const directory = new URL("../screenshots/", import.meta.url);
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

const snapshot = (canvas) => canvas.evaluate((element) => element.toDataURL());
const themeButton = (page, theme) =>
  page.getByRole("button", { name: `Switch to ${theme} theme` });

try {
  await withBuild("full", async (url) => {
    for (const width of [1600, 390, 320]) {
      const page = await browser.newPage({
        viewport: { width, height: 803 },
        reducedMotion: "reduce",
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(url);
      await expect(
        page.getByRole("heading", { name: "MemDesAI 2027", exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("link", { name: "Skip to content" }),
      ).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(page.locator("#themes article")).toHaveCount(10);
      await expect(
        page.locator("#about").getByText(/Through keynote lectures/),
      ).toBeVisible();
      await expect(page.locator("[data-flow-node]")).toHaveCount(5);
      for (const id of [
        "dates",
        "speakers",
        "committee",
        "registration",
        "hospitality",
        "contact",
      ]) {
        await expect(page.locator(`#${id}`)).toHaveCount(1);
      }

      const canvas = page.locator("canvas").first();
      const still = await snapshot(canvas);
      await page.waitForTimeout(150);
      expect(await snapshot(canvas)).toBe(still);
      await themeButton(page, "light").click();
      await expect(page.locator('[data-theme="light"]')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: fileURLToPath(new URL(`flow-light-${width}.png`, directory)),
      });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      await page.reload();
      await themeButton(page, "dark").click();
      await expect(page.locator('[data-theme="dark"]')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: fileURLToPath(new URL(`flow-dark-${width}.png`, directory)),
      });

      const accordion = page
        .locator("#hospitality")
        .getByRole("button")
        .first();
      await accordion.click();
      await expect(accordion).toHaveAttribute("aria-expanded", "true");
      await page.goto(new URL("countdown/", url).href);
      await expect(
        page.getByRole("link", { name: "Enter site" }),
      ).toHaveAttribute("href", "/");
      expect(errors).toEqual([]);
      await page.close();
      console.log(`Interactive layout and controls passed at ${width}px`);
    }

    const page = await browser.newPage();
    await page.goto(url);
    const canvas = page.locator("canvas").first();
    const particleMotion = async () => {
      const before = await snapshot(canvas);
      await page.waitForTimeout(100);
      return before !== (await snapshot(canvas));
    };
    await expect.poll(particleMotion).toBe(true);
    await page.getByRole("button", { name: "Pause animation" }).first().click();
    await expect.poll(particleMotion).toBe(false);
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
