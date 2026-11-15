import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const browser = await chromium.launch();
const report = [];
try {
  for (const width of [1366, 390]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    for (const route of [
      "/",
      "/themes/",
      "/dates/",
      "/speakers/",
      "/committee/",
      "/registration/",
      "/hospitality/",
      "/contact/",
    ]) {
      await page.goto(`http://127.0.0.1:5283${route}`);
      await page.evaluate(() => document.fonts.ready);
      const pairs = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const rgba = (color) => {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, 1, 1);
          return [...ctx.getImageData(0, 0, 1, 1).data].map((v, i) =>
            i === 3 ? v / 255 : v,
          );
        };
        const blend = (fg, bg) =>
          fg.slice(0, 3).map((v, i) => v * fg[3] + bg[i] * (1 - fg[3]));
        const lum = (rgb) =>
          rgb
            .map((v) => {
              v /= 255;
              return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
            })
            .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
        const pairs = new Map();
        for (const el of document.querySelectorAll("body *")) {
          if (
            !el.checkVisibility({
              checkOpacity: true,
              checkVisibilityCSS: true,
            }) ||
            el.getBoundingClientRect().width < 2 ||
            el.getBoundingClientRect().height < 2
          )
            continue;
          if (
            ![...el.childNodes].some(
              (node) =>
                node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
            )
          )
            continue;
          const chain = [];
          for (let node = el; node; node = node.parentElement)
            chain.unshift(node);
          let bg = [255, 255, 255];
          for (const node of chain)
            bg = blend(rgba(getComputedStyle(node).backgroundColor), bg);
          const s = getComputedStyle(el);
          const fg = blend(rgba(s.color), bg);
          const a = lum(fg),
            b = lum(bg);
          const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          const key = `${s.color}/${bg.map(Math.round)}`;
          if (!pairs.has(key))
            pairs.set(key, {
              color: s.color,
              background: bg.map(Math.round),
              ratio,
              example: el.textContent.trim().slice(0, 90),
            });
        }
        return [...pairs.values()].sort((a, b) => a.ratio - b.ratio);
      });
      report.push({ width, route, pairs });
    }
    await page.close();
  }
} finally {
  await browser.close();
  await writeFile(
    "proof/typography/contrast.json",
    JSON.stringify(report, null, 2) + "\n",
  );
}
const failed = report.flatMap((page) =>
  page.pairs
    .filter((pair) => pair.ratio < 4.5)
    .map((pair) => ({ route: page.route, width: page.width, ...pair })),
);
console.log(
  JSON.stringify(
    {
      minimum: Math.min(
        ...report.flatMap((page) => page.pairs.map((pair) => pair.ratio)),
      ),
      failed,
    },
    null,
    2,
  ),
);
assert.deepEqual(failed, []);
