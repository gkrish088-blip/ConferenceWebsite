import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { build } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const screenshotDirectory = resolve(root, "screenshots");
const siteContentPath = resolve(root, "src/content/site.json");
const datesContentPath = resolve(root, "src/content/dates.json");
const themesContentPath = resolve(root, "src/content/themes.json");
const speakersContentPath = resolve(root, "src/content/speakers.json");
const committeeContentPath = resolve(root, "src/content/committee.json");
const hospitalityContentPath = resolve(root, "src/content/hospitality.json");
const ports = { full: 4173, landing: 4174 };
const origins = Object.fromEntries(
  Object.entries(ports).map(([name, port]) => [
    name,
    `http://127.0.0.1:${port}`,
  ]),
);
const servers = [];
const failures = [];
const externalRequests = [];
const pageErrors = [];
const consoleErrors = [];

function startPreview(mode, port) {
  const child = spawn(
    process.execPath,
    [
      resolve(root, "node_modules/vite/bin/vite.js"),
      "preview",
      "--mode",
      mode,
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    {
      cwd: root,
      stdio: "ignore",
      windowsHide: true,
    },
  );
  servers.push(child);
  return child;
}

async function buildMode(mode) {
  await build({ configFile: resolve(root, "vite.config.ts"), mode });
}

async function waitForServer(origin, child) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null)
      throw new Error(
        `Preview server exited with code ${child.exitCode}: ${origin}`,
      );
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      await delay(250);
    }
    await delay(250);
  }
  throw new Error(`Preview server did not become ready: ${origin}`);
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function contrastRatio(foreground, background) {
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (color) => {
    const values = color
      .match(/[\d.]+/g)
      .slice(0, 3)
      .map(Number);
    return (
      0.2126 * channel(values[0]) +
      0.7152 * channel(values[1]) +
      0.0722 * channel(values[2])
    );
  };
  const values = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function monitor(page, origin) {
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== origin)
      externalRequests.push(request.url());
  });
}

async function auditPage(page, { main = false, minimumFontSize = 14 } = {}) {
  const audit = await page.evaluate(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number(style.opacity) !== 0 &&
        rect.width > 0 &&
        rect.height > 0
      );
    };
    const textElements = [...document.body.querySelectorAll("*")].filter(
      (element) =>
        element.children.length === 0 &&
        !element.classList.contains("sr-only") &&
        element.textContent?.trim() &&
        visible(element),
    );
    const textStyles = textElements.map((element) => {
      let background = getComputedStyle(element).backgroundColor;
      let parent = element.parentElement;
      while (background === "rgba(0, 0, 0, 0)" && parent) {
        background = getComputedStyle(parent).backgroundColor;
        parent = parent.parentElement;
      }
      return {
        fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
        color: getComputedStyle(element).color,
        background,
        text: element.textContent.trim().slice(0, 80),
      };
    });
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(
      (heading) => Number(heading.tagName.slice(1)),
    );
    return {
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      overflowingElements: [...document.body.querySelectorAll("*")]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName,
            id: element.id,
            className:
              typeof element.className === "string" ? element.className : "",
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
            text: element.textContent?.trim().slice(0, 35),
          };
        })
        .filter(({ left, right }) => left < -1 || right > window.innerWidth + 1)
        .slice(0, 12),
      h1Count: document.querySelectorAll("h1").length,
      headings,
      minFontSize: Math.min(...textStyles.map(({ fontSize }) => fontSize)),
      textStyles,
      brokenImages: [...document.images]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.src),
      emptyAlt: [...document.images]
        .filter((image) => !image.hasAttribute("alt") || !image.alt.trim())
        .map((image) => image.src),
      bodyFont: getComputedStyle(document.body).fontFamily,
      headingFont: getComputedStyle(document.querySelector("h1")).fontFamily,
    };
  });

  const lowContrast = audit.textStyles.filter(
    ({ color, background, fontSize }) => {
      if (!color.startsWith("rgb") || !background.startsWith("rgb"))
        return false;
      return contrastRatio(color, background) < (fontSize >= 24 ? 3 : 4.5);
    },
  );
  expect(
    audit.documentWidth <= audit.viewportWidth,
    `Horizontal overflow at ${audit.viewportWidth}px (${audit.documentWidth}px document): ${JSON.stringify(audit.overflowingElements)}`,
  );
  expect(audit.h1Count === 1, `Expected one h1, found ${audit.h1Count}`);
  expect(
    audit.minFontSize >= minimumFontSize,
    `Text below ${minimumFontSize}px: ${audit.minFontSize}px`,
  );
  expect(
    lowContrast.length === 0,
    `Low contrast text: ${JSON.stringify(lowContrast.slice(0, 8))}`,
  );
  expect(
    audit.brokenImages.length === 0,
    `Broken images: ${audit.brokenImages.join(", ")}`,
  );
  expect(
    audit.emptyAlt.length === 0,
    `Images without alt: ${audit.emptyAlt.join(", ")}`,
  );
  expect(
    audit.bodyFont.includes("Public Sans"),
    `Unexpected body font: ${audit.bodyFont}`,
  );
  expect(
    audit.headingFont.includes("Newsreader"),
    `Unexpected heading font: ${audit.headingFont}`,
  );

  const skippedHeadingLevels = audit.headings.some(
    (level, index) => index > 0 && level > audit.headings[index - 1] + 1,
  );
  expect(
    !skippedHeadingLevels,
    `Heading levels skip a level: ${audit.headings.join(", ")}`,
  );
  if (main) {
    const links = await page
      .locator("#site-navigation-links a")
      .evaluateAll((items) => items.map((item) => item.getAttribute("href")));
    expect(
      links.length === 8 && links.every((href) => href?.startsWith("#")),
      "Navigation should have eight same-page anchor links",
    );
  }
}

async function capture(
  browser,
  origin,
  pagePath,
  name,
  width,
  {
    main = false,
    landing = false,
    height = 1000,
    fullPage = true,
    expectedEnter = landing,
    noVerticalScroll = false,
    minimumFontSize = 14,
    fileName,
  } = {},
) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  monitor(page, origin);
  await page.goto(`${origin}${pagePath}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(180);
  await auditPage(page, { main, minimumFontSize });
  if (noVerticalScroll) {
    const scroll = await page.evaluate(() => ({
      document: document.documentElement.scrollHeight,
      body: document.body.scrollHeight,
      viewport: window.innerHeight,
    }));
    expect(
      scroll.document <= scroll.viewport && scroll.body <= scroll.viewport,
      `Landing page scrolls vertically at ${width}x${height}: ${JSON.stringify(scroll)}`,
    );
  }
  await page.screenshot({
    path: resolve(
      screenshotDirectory,
      fileName ?? `${name}-${width}x${height}.png`,
    ),
    fullPage,
    animations: "disabled",
  });
  if (expectedEnter !== undefined) {
    const enterCount = await page
      .getByRole("link", { name: "Enter site" })
      .count();
    expect(
      enterCount === (expectedEnter ? 1 : 0),
      expectedEnter
        ? "Full build landing page is missing the Enter site link"
        : "Landing-only page unexpectedly has an Enter site link",
    );
  }
  await page.close();
}

const landingViewports = [
  { width: 1440, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1000 },
  { width: 390, height: 844 },
];

async function captureLandingSet(browser, origin, mode, pagePath, enter) {
  for (const viewport of landingViewports) {
    await capture(
      browser,
      origin,
      pagePath,
      `landing-${mode}`,
      viewport.width,
      {
        height: viewport.height,
        fullPage: false,
        expectedEnter: enter,
        noVerticalScroll: true,
        minimumFontSize: 16,
        fileName: `landing-${mode}-${viewport.width}x${viewport.height}.png`,
      },
    );
  }
}

async function checkCountdownStability(browser, origin, pagePath, mode) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 800 },
  });
  monitor(page, origin);
  await page.goto(`${origin}${pagePath}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const readCells = () =>
    page
      .locator("[data-countdown-grid] [data-countdown-value]")
      .evaluateAll((cells) =>
        cells.map((cell) => {
          const rect = cell.getBoundingClientRect();
          return {
            x: Number(rect.x.toFixed(2)),
            width: Number(rect.width.toFixed(2)),
            text: cell.textContent.trim(),
          };
        }),
      );
  const before = await readCells();
  await page.waitForTimeout(10_000);
  const after = await readCells();
  expect(before.length === 4, `${mode} countdown does not show four units`);
  expect(
    JSON.stringify(before.map(({ x, width }) => [x, width])) ===
      JSON.stringify(after.map(({ x, width }) => [x, width])),
    `${mode} countdown cells shifted during ten seconds: ${JSON.stringify({ before, after })}`,
  );
  expect(
    before[3]?.text !== after[3]?.text,
    `${mode} countdown did not update during the ten-second observation`,
  );
  console.log(
    `${mode} countdown cell geometry over 10s: ${JSON.stringify({ before, after })}`,
  );
  await page.close();
}

async function checkCountdownState(browser, origin, pagePath, mode, state) {
  const text = state === "live" ? "Conference is live" : "Conference has ended";
  for (const viewport of state === "live"
    ? [landingViewports[0], landingViewports.at(-1)]
    : [landingViewports[0]]) {
    const page = await browser.newPage({ viewport });
    monitor(page, origin);
    await page.goto(`${origin}${pagePath}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    expect(
      (await page.getByText(text, { exact: false }).count()) > 0,
      `${mode} ${state} state did not show “${text}”`,
    );
    expect(
      (await page.locator("[data-countdown-grid]").count()) === 0,
      `${mode} ${state} state still shows countdown numerals`,
    );
    await auditPage(page, { minimumFontSize: 16 });
    const scroll = await page.evaluate(() => ({
      document: document.documentElement.scrollHeight,
      body: document.body.scrollHeight,
      viewport: window.innerHeight,
    }));
    expect(
      scroll.document <= scroll.viewport && scroll.body <= scroll.viewport,
      `${mode} ${state} page scrolls vertically: ${JSON.stringify(scroll)}`,
    );
    if (state === "live") {
      await page.screenshot({
        path: resolve(
          screenshotDirectory,
          `landing-live-${mode}-${viewport.width}x${viewport.height}.png`,
        ),
        fullPage: false,
        animations: "disabled",
      });
    }
    await page.close();
  }
}

async function checkReducedMotionOnLanding(browser, origin, pagePath) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 800 },
  });
  monitor(page, origin);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${origin}${pagePath}`, { waitUntil: "networkidle" });
  const motion = await page.evaluate(() => ({
    contourDuration: getComputedStyle(
      document.querySelector("[data-landing-contour]"),
    ).animationDuration,
    contourOffset: getComputedStyle(
      document.querySelector("[data-landing-contour]"),
    ).strokeDashoffset,
    contourName: getComputedStyle(
      document.querySelector("[data-landing-contour]"),
    ).animationName,
    headerOpacity: getComputedStyle(document.querySelector("h1")).opacity,
    hiddenContent: [
      ...document.querySelectorAll("[data-landing-content] *"),
    ].filter((element) => {
      {
        const style = getComputedStyle(element);
        return style.opacity === "0" || style.visibility === "hidden";
      }
    }).length,
  }));
  expect(
    Number.parseFloat(motion.contourDuration) <= 0.00001 &&
      motion.contourName === "none" &&
      Number.parseFloat(motion.contourOffset) === 0 &&
      motion.headerOpacity === "1" &&
      motion.hiddenContent === 0,
    `Landing reduced-motion state leaves animation or hidden content: ${JSON.stringify(motion)}`,
  );
  await page.close();
}

async function checkCommitteeConnectors(page) {
  for (const width of [1440, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator("[data-committee-tree]").scrollIntoViewIfNeeded();
    const geometry = await page
      .locator("[data-committee-pair]")
      .evaluate((pair) => {
        const rect = pair.getBoundingClientRect();
        const bar = getComputedStyle(pair, "::before");
        const resolveInset = (value) =>
          value.endsWith("%")
            ? (Number.parseFloat(value) / 100) * rect.width
            : Number.parseFloat(value);
        const barStart = rect.left + resolveInset(bar.left);
        const barEnd = rect.right - resolveInset(bar.right);
        const members = [...pair.children].map((member) => {
          const box = member.getBoundingClientRect();
          const drop = getComputedStyle(member, "::before");
          return {
            center: box.left + box.width / 2,
            width: box.width,
            top: box.top,
            dropHeight: drop.height,
            dropTop: drop.top,
            dropLeft: drop.left,
          };
        });
        return { barStart, barEnd, barTop: rect.top, members };
      });
    expect(
      Math.abs(geometry.barStart - geometry.members[0].center) < 1 &&
        Math.abs(geometry.barEnd - geometry.members[1].center) < 1 &&
        geometry.members.every(
          (member) =>
            member.dropHeight === "24px" &&
            member.dropTop === "-24px" &&
            Math.abs(Number.parseFloat(member.dropLeft) - member.width / 2) <
              1 &&
            Math.abs(member.top - 24 - geometry.barTop) < 1,
        ),
      `Committee connector endpoints miss box centres at ${width}px: ${JSON.stringify(geometry)}`,
    );
  }
}

async function checkMainInteractions(browser) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  monitor(page, origins.full);
  await page.goto(origins.full, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const requiredHospitalityTitles = [
    "About Roorkee",
    "How To Exit Delhi Airport T3",
    "How To Reach IIT Roorkee",
    "Accommodation",
    "Life And Food At IIT Roorkee",
    "Uttarakhand Destination",
  ];
  expect(
    (await page
      .locator('h3[id^="hospitality-"] button[aria-expanded="false"]')
      .count()) === 6,
    "Hospitality rows are not all closed by default",
  );
  const hospitalityTitles = await page
    .locator('h3[id^="hospitality-"] button span:first-child')
    .allTextContents();
  expect(
    JSON.stringify(hospitalityTitles) ===
      JSON.stringify(requiredHospitalityTitles),
    "Hospitality titles or order do not match the specification",
  );
  expect(
    (await page
      .locator(
        '#hospitality [role="region"] img[src="/placeholders/hospitality.svg"]',
      )
      .count()) === 6,
    "Each hospitality item should have one placeholder image",
  );
  expect(
    (await page.locator("[data-identity-band] a img").count()) === 3,
    "Identity band should display the three institution marks",
  );
  expect(
    (await page.locator("#about [data-institution-card] h3").count()) === 3,
    "Institution names should be headings above their descriptions",
  );
  expect(
    (await page.locator("[data-delegate-card]").count()) === 6,
    "Expected six delegate portrait cards",
  );
  const portraitShape = await page
    .locator("[data-person-portrait]")
    .first()
    .evaluate((image) => ({
      ratio: getComputedStyle(image).aspectRatio,
      alt: image.alt,
    }));
  expect(
    portraitShape.ratio === "4 / 5" &&
      portraitShape.alt.toLowerCase().includes("placeholder"),
    `Portrait placeholder should use a 4:5 ratio and descriptive alt: ${JSON.stringify(portraitShape)}`,
  );
  const tierCount = await page.locator("[data-sponsorship-tier]").count();
  expect(
    tierCount === 4,
    `Expected four sponsorship tiers; found ${tierCount}`,
  );
  const registrationOrder = await page
    .locator("#registration > div")
    .evaluate((container) => {
      const details = container.querySelector("[data-registration-details]");
      const buttons = container.querySelector("[data-registration-links]");
      const sponsor = container.querySelector("[data-sponsorship-intro]");
      const tiers = container.querySelector("[data-sponsorship-tiers]");
      return [details, buttons, sponsor, tiers].map((element) =>
        element ? [...container.children].indexOf(element) : -1,
      );
    });
  expect(
    registrationOrder.every(
      (value, index) => index === 0 || value > registrationOrder[index - 1],
    ),
    `Registration blocks are in the wrong order: ${JSON.stringify(registrationOrder)}`,
  );
  expect(
    (await page
      .getByRole("link", { name: "Registration", exact: true })
      .count()) === 1,
    "Navigation should have one Registration button",
  );
  expect(
    (await page
      .locator('[data-site-navigation] a[href="#hospitality"]')
      .count()) === 1,
    "Hospitality navigation is not a same-page anchor",
  );
  const forbiddenCopy = await page.evaluate(() => {
    const body = document.body.innerText;
    return [
      "IN CONVERSATION",
      "A meeting point for ideas",
      "Conference leadership",
      "PROFILE PENDING",
      "Open hospitality guide",
    ].filter((phrase) => body.includes(phrase));
  });
  expect(
    forbiddenCopy.length === 0,
    `Old placeholder copy remains: ${forbiddenCopy.join(", ")}`,
  );

  await checkCommitteeConnectors(page);
  for (const [width, expected] of [
    [1100, 4],
    [800, 3],
    [520, 2],
    [519, 1],
  ]) {
    await page.setViewportSize({ width, height: 900 });
    const count = await page
      .locator("[data-delegate-grid]")
      .evaluate(
        (grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length,
      );
    expect(
      count === expected,
      `Delegate grid at ${width}px has ${count} columns, expected ${expected}`,
    );
  }
  for (const [width, expected] of [
    [1000, 3],
    [600, 2],
    [599, 1],
  ]) {
    await page.setViewportSize({ width, height: 900 });
    const count = await page
      .locator("[data-committee-list]")
      .first()
      .evaluate(
        (grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length,
      );
    expect(
      count === expected,
      `Committee list at ${width}px has ${count} columns, expected ${expected}`,
    );
  }
  for (const width of [1440, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    const collisions = await page.locator("#dates").evaluate((section) => {
      const intersects = (a, b) =>
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top;
      const labels = [
        ...section.querySelectorAll("[data-milestone-label]"),
      ].map((item) => item.getBoundingClientRect());
      const nodes = [...section.querySelectorAll("[data-milestone-node]")].map(
        (item) => item.getBoundingClientRect(),
      );
      let labelPairs = 0;
      let labelNodes = 0;
      labels.forEach((label, index) => {
        labels.slice(index + 1).forEach((other) => {
          if (intersects(label, other)) labelPairs += 1;
        });
        nodes.forEach((node) => {
          if (intersects(label, node)) labelNodes += 1;
        });
      });
      return { labelPairs, labelNodes };
    });
    expect(
      collisions.labelPairs === 0 && collisions.labelNodes === 0,
      `Date pipeline labels overlap at ${width}px: ${JSON.stringify(collisions)}`,
    );
  }
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.locator('a[href="#hospitality-exit-delhi-t3"]').click();
  expect(
    (await page
      .locator("#hospitality-exit-delhi-t3 button")
      .getAttribute("aria-expanded")) === "true",
    "Hospitality introduction link did not open its row",
  );
  await page.locator('a[href="#hospitality-accommodation"]').click();
  expect(
    (await page
      .locator("#hospitality-accommodation button")
      .getAttribute("aria-expanded")) === "true",
    "Second hospitality introduction link did not open its row",
  );
  expect(
    (await page
      .locator("#hospitality-exit-delhi-t3 button")
      .getAttribute("aria-expanded")) === "true",
    "Opening an intro link closed the first row",
  );
  await page.waitForTimeout(260);
  await page.locator("#hospitality").screenshot({
    path: resolve(screenshotDirectory, "hospitality-intro-two-open-1440.png"),
    animations: "disabled",
  });

  await page.goto(`${origins.full}/?fresh=1#hospitality-accommodation`, {
    waitUntil: "networkidle",
  });
  await page.evaluate(() => document.fonts.ready);
  const accommodation = page.locator(
    "#hospitality-accommodation button[aria-expanded]",
  );
  await page.waitForFunction(
    () =>
      document
        .querySelector("#hospitality-accommodation button")
        ?.getAttribute("aria-expanded") === "true",
  );
  expect(
    (await accommodation.getAttribute("aria-expanded")) === "true",
    "Hospitality deep link did not open Accommodation",
  );
  await page.screenshot({
    path: resolve(screenshotDirectory, "hospitality-deeplink-1440.png"),
    fullPage: false,
    animations: "disabled",
  });
  await accommodation.press("Enter");
  expect(
    (await accommodation.getAttribute("aria-expanded")) === "false",
    "Enter did not close a hospitality accordion",
  );
  await accommodation.press("Enter");
  expect(
    (await accommodation.getAttribute("aria-expanded")) === "true",
    "Enter did not open a hospitality accordion",
  );

  const roorkee = page.locator(
    "#hospitality-about-roorkee button[aria-expanded]",
  );
  await roorkee.click();
  expect(
    (await roorkee.getAttribute("aria-expanded")) === "true",
    "Hospitality accordion failed to open",
  );
  expect(
    (await accommodation.getAttribute("aria-expanded")) === "true",
    "Opening one hospitality row closed another",
  );
  await roorkee.press("Space");
  expect(
    (await roorkee.getAttribute("aria-expanded")) === "false",
    "Space did not close a hospitality accordion",
  );
  await page.locator("#hospitality").scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  const closedRowCount = await page
    .locator('h3[id^="hospitality-"] button[aria-expanded="false"]')
    .count();
  const scrollSpyDetails = await page.evaluate(() => ({
    scrollY: window.scrollY,
    active: document
      .querySelector('[data-site-navigation] a[aria-current="location"]')
      ?.getAttribute("href"),
    sectionTops: [...document.querySelectorAll("main section[id]")].map(
      (section) => ({
        id: section.id,
        top: Math.round(section.getBoundingClientRect().top),
      }),
    ),
  }));
  expect(
    closedRowCount === 5,
    `Hospitality rows did not toggle independently (closed=${closedRowCount})`,
  );
  expect(
    scrollSpyDetails.active === "#hospitality",
    `Scroll spy did not mark Hospitality active: ${JSON.stringify(scrollSpyDetails)}`,
  );
  const navBrand = page.locator("[data-scrolled-brand]");
  expect(
    (await navBrand.isVisible()) &&
      (await navBrand.getAttribute("href")) === "#top" &&
      (await navBrand.textContent())?.trim() === "MemDesAI-2027",
    "Sticky navigation did not show the short conference name link after the identity band scrolled away",
  );
  const underline = await page
    .locator('[data-site-navigation] a[href="#hospitality"]')
    .evaluate((element) => {
      const style = getComputedStyle(element, "::after");
      return {
        color: style.backgroundColor,
        transform: style.transform,
        height: Number.parseFloat(style.height),
      };
    });
  expect(
    underline.color === "rgb(31, 95, 139)" &&
      underline.height === 2 &&
      !underline.transform.includes("matrix(0, 0, 0, 1"),
    `Active navigation underline is not visible in river blue: ${JSON.stringify(underline)}`,
  );

  await page.goto(origins.full, { waitUntil: "networkidle" });
  const expectedFocusCount = await page.evaluate(() => {
    const candidates = [
      ...document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        !element.hasAttribute("disabled") &&
        !element.closest("[inert]") &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number(style.opacity) !== 0 &&
        rect.width > 0 &&
        rect.height > 0
      );
    });
    candidates.forEach((element, index) =>
      element.setAttribute("data-focus-check", String(index)),
    );
    return candidates.length;
  });
  for (let index = 0; index < expectedFocusCount; index += 1) {
    await page.keyboard.press("Tab");
    const focusState = await page.evaluate(() => {
      const active = document.activeElement;
      const style = getComputedStyle(active);
      return {
        order: Number(active?.getAttribute("data-focus-check")),
        text: active?.textContent?.trim().slice(0, 50),
        outline: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
      };
    });
    expect(
      focusState.order === index,
      `Keyboard focus order mismatch at ${index}: ${JSON.stringify(focusState)}`,
    );
    expect(
      focusState.outline === "solid" && focusState.outlineWidth >= 3,
      `Keyboard focus ring missing at ${index}: ${JSON.stringify(focusState)}`,
    );
  }
  expect(
    expectedFocusCount > 20,
    `Only ${expectedFocusCount} focusable controls found`,
  );

  await page.goto(origins.full, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement);
    return {
      target: document.activeElement?.textContent?.trim(),
      outline: style.outlineStyle,
      width: Number.parseFloat(style.outlineWidth),
    };
  });
  expect(
    focus.target?.includes("Skip to content") &&
      focus.outline === "solid" &&
      focus.width >= 3,
    "Keyboard focus ring or skip link is not visible",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole("button", { name: "Open navigation menu" });
  expect(
    await menu.isVisible(),
    "Mobile menu button is not visible below 900px",
  );
  for (const logoLink of await page.locator("[data-identity-band] a").all()) {
    await page.keyboard.press("Tab");
    expect(
      await logoLink.evaluate((element) => document.activeElement === element),
      "Institution logo link is not keyboard reachable before the mobile menu",
    );
  }
  await page.keyboard.press("Tab");
  expect(
    (await page.evaluate(() =>
      document.activeElement?.getAttribute("aria-label"),
    )) === "Open navigation menu",
    "Mobile menu button is not keyboard reachable",
  );
  await page.keyboard.press("Enter");
  expect(
    (await page
      .getByRole("button", { name: "Close navigation menu" })
      .getAttribute("aria-expanded")) === "true",
    "Mobile menu did not open",
  );
  expect(
    await page
      .getByRole("link", { name: "Hospitality", exact: true })
      .isVisible(),
    "Mobile navigation links are not visible when the menu is open",
  );
  await page.screenshot({
    path: resolve(screenshotDirectory, "mobile-menu-open-390x844.png"),
    fullPage: false,
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  expect(
    (await page
      .getByRole("button", { name: "Open navigation menu" })
      .getAttribute("aria-expanded")) === "false",
    "Escape did not close mobile menu",
  );

  await page.emulateMedia({ reducedMotion: "reduce" });
  const motion = await page.evaluate(() => ({
    scroll: getComputedStyle(document.documentElement).scrollBehavior,
    maxDuration: Math.max(
      ...[...document.querySelectorAll("*")].map(
        (element) =>
          Number.parseFloat(getComputedStyle(element).transitionDuration) || 0,
      ),
    ),
    maxAnimation: Math.max(
      ...[...document.querySelectorAll("*")].map(
        (element) =>
          Number.parseFloat(getComputedStyle(element).animationDuration) || 0,
      ),
    ),
  }));
  expect(
    motion.scroll === "auto" &&
      motion.maxDuration <= 0.001 &&
      motion.maxAnimation <= 0.001,
    "Reduced-motion preference is not respected",
  );

  await page.goto(origins.full, { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#dates").scrollIntoViewIfNeeded();
  await page.locator("#dates").screenshot({
    path: resolve(screenshotDirectory, "mobile-dates-vertical-390x844.png"),
    animations: "disabled",
  });
  await page.locator("[data-committee-tree]").scrollIntoViewIfNeeded();
  const mobileConnectorDisplay = await page
    .locator("[data-committee-pair]")
    .evaluate((pair) => ({
      bar: getComputedStyle(pair, "::before").display,
      drop: getComputedStyle(pair.children[0], "::before").display,
    }));
  expect(
    mobileConnectorDisplay.bar === "none" &&
      mobileConnectorDisplay.drop === "none",
    `Committee connectors should be hidden on mobile: ${JSON.stringify(mobileConnectorDisplay)}`,
  );
  await page.locator("[data-committee-tree]").screenshot({
    path: resolve(screenshotDirectory, "mobile-committee-tree-390x844.png"),
    animations: "disabled",
  });
  await page.locator("#hospitality").scrollIntoViewIfNeeded();
  await page.locator("#hospitality-about-roorkee button").click();
  await page.waitForTimeout(260);
  expect(
    (await page
      .locator('#hospitality button[aria-expanded="true"]')
      .count()) === 1,
    "Mobile Hospitality screenshot should show one open row",
  );
  await page.locator("#hospitality").screenshot({
    path: resolve(
      screenshotDirectory,
      "mobile-hospitality-one-open-390x844.png",
    ),
    animations: "disabled",
  });
  await page.close();
}

async function stopPreview(child) {
  if (!child || child.exitCode !== null) return;
  child.kill();
  await Promise.race([
    new Promise((resolveExit) => child.once("exit", resolveExit)),
    delay(1500),
  ]);
}

async function withTemporaryTarget(state, work) {
  const original = await readFile(siteContentPath);
  const site = JSON.parse(original.toString("utf8"));
  site.eventStart = "2020-12-15T09:00:00+05:30";
  if (state === "ended") site.eventEnd = "2020-12-17T18:00:00+05:30";
  await writeFile(
    siteContentPath,
    `${JSON.stringify(site, null, 2)}\n`,
    "utf8",
  );
  try {
    await work();
  } finally {
    await writeFile(siteContentPath, original);
  }
}

async function verifyTemporaryState(browser, state) {
  await withTemporaryTarget(state, async () => {
    for (const mode of ["landing", "full"]) {
      await buildMode(mode);
      const child = startPreview(mode, ports[mode]);
      try {
        await waitForServer(origins[mode], child);
        await checkCountdownState(
          browser,
          origins[mode],
          mode === "landing" ? "/" : "/countdown/",
          mode === "landing" ? "landing-only" : "full",
          state,
        );
      } finally {
        await stopPreview(child);
      }
    }
  });
}

async function verifyMilestoneCount(browser, count) {
  const original = await readFile(datesContentPath);
  const dates = JSON.parse(original.toString("utf8"));
  dates.milestones = Array.from({ length: count }, (_, index) => ({
    id: `milestone-${index + 1}`,
    label: `Milestone ${index + 1} placeholder`,
    date: `${new Date(Date.UTC(2027, index + 2, 1)).toISOString().slice(0, 10)}T09:00:00+05:30`,
    note: "",
    placeholder: true,
  }));
  await writeFile(
    datesContentPath,
    `${JSON.stringify(dates, null, 2)}\n`,
    "utf8",
  );
  try {
    await buildMode("full");
    const child = startPreview("full", ports.full);
    try {
      await waitForServer(origins.full, child);
      const page = await browser.newPage({
        viewport: { width: 1440, height: 900 },
      });
      monitor(page, origins.full);
      await page.goto(origins.full, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      for (const width of [1440, 1024]) {
        await page.setViewportSize({ width, height: 900 });
        const geometry = await page
          .locator("#dates")
          .evaluate((section, count) => {
            const intersects = (a, b) =>
              a.left < b.right &&
              a.right > b.left &&
              a.top < b.bottom &&
              a.bottom > b.top;
            const labels = [
              ...section.querySelectorAll("[data-milestone-label]"),
            ].map((item) => item.getBoundingClientRect());
            const nodes = [
              ...section.querySelectorAll("[data-milestone-node]"),
            ].map((item) => item.getBoundingClientRect());
            const pipeline = section
              .querySelector("[data-desktop-pipeline]")
              ?.getBoundingClientRect();
            if (count === 0) {
              return {
                count: 0,
                next: 0,
                labelPairs: 0,
                labelNodes: 0,
                outOfBounds: 0,
                emptyState: section.innerText.includes(
                  "Submission and registration deadlines to be announced.",
                ),
              };
            }
            const labelPairs = labels.reduce(
              (total, label, index) =>
                total +
                labels
                  .slice(index + 1)
                  .filter((other) => intersects(label, other)).length,
              0,
            );
            const labelNodes = labels.reduce(
              (total, label) =>
                total + nodes.filter((node) => intersects(label, node)).length,
              0,
            );
            return {
              count: labels.length,
              next: [
                ...section.querySelectorAll(
                  "[data-milestone-label][data-status='next']",
                ),
              ].length,
              labelPairs,
              labelNodes,
              emptyState: false,
              outOfBounds: labels.filter(
                (label) =>
                  label.left < pipeline?.left - 1 ||
                  label.right > pipeline?.right + 1,
              ).length,
            };
          }, count);
        expect(
          geometry.count === count &&
            geometry.next === (count === 0 ? 0 : 1) &&
            geometry.labelPairs === 0 &&
            geometry.labelNodes === 0 &&
            geometry.outOfBounds === 0 &&
            geometry.emptyState === (count === 0),
          `Milestone layout with ${count} items overlaps or clips at ${width}px: ${JSON.stringify(geometry)}`,
        );
      }
      if (count === 12) {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.locator("[data-site-navigation]").evaluate((nav) => {
          nav.style.visibility = "hidden";
        });
        await page.locator("[data-desktop-pipeline]").screenshot({
          path: resolve(
            screenshotDirectory,
            "dates-twelve-milestones-1440.png",
          ),
          animations: "disabled",
        });
      }
      await page.close();
      console.log(
        `Milestone layout with ${count} item(s): passed at 1440px and 1024px.`,
      );
    } finally {
      await stopPreview(child);
    }
  } finally {
    await writeFile(datesContentPath, original);
  }
}

async function verifyContentExtremes(browser) {
  const contentPaths = [
    themesContentPath,
    speakersContentPath,
    committeeContentPath,
    hospitalityContentPath,
  ];
  const originals = await Promise.all(
    contentPaths.map(async (path) => await readFile(path)),
  );
  const originalData = originals.map((content) =>
    JSON.parse(content.toString("utf8")),
  );
  const scenarios = ["zero", "single", "many"];

  try {
    for (const scenario of scenarios) {
      const [themes, speakers, committee, hospitality] =
        structuredClone(originalData);
      if (scenario === "zero") {
        themes.items = [];
        speakers.delegates = [];
        committee.groups = committee.groups.map((group) =>
          group.layout === "list"
            ? { ...group, members: group.members.slice(0, 1) }
            : group,
        );
        hospitality.items = hospitality.items.map((item) => ({
          ...item,
          images: [],
        }));
      } else if (scenario === "single") {
        themes.items = themes.items.slice(0, 1);
        speakers.delegates = speakers.delegates.slice(0, 1);
        committee.groups = committee.groups.map((group) =>
          group.layout === "list"
            ? { ...group, members: group.members.slice(0, 1) }
            : group,
        );
        hospitality.items = hospitality.items.map((item) => ({
          ...item,
          images: item.images.slice(0, 1),
        }));
      } else {
        hospitality.items = hospitality.items.map((item) => {
          const image = item.images[0];
          return {
            ...item,
            images: Array.from({ length: 3 }, (_, index) => ({
              ...image,
              alt: `Placeholder hospitality image ${index + 1} for ${item.title}`,
            })),
          };
        });
      }

      const scenarioData = [themes, speakers, committee, hospitality];
      await Promise.all(
        contentPaths.map((path, index) =>
          writeFile(path, `${JSON.stringify(scenarioData[index], null, 2)}\n`),
        ),
      );

      await buildMode("full");
      const child = startPreview("full", ports.full);
      try {
        await waitForServer(origins.full, child);
        const page = await browser.newPage({
          viewport: { width: 1440, height: 1000 },
        });
        monitor(page, origins.full);
        await page.goto(origins.full, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        const expectedCounts = {
          zero: {
            themes: 0,
            delegates: 0,
            listGroups: [1, 1],
            hospitalityImages: 0,
          },
          single: {
            themes: 1,
            delegates: 1,
            listGroups: [1, 1],
            hospitalityImages: 6,
          },
          many: {
            themes: 10,
            delegates: 6,
            listGroups: [5, 14],
            hospitalityImages: 18,
          },
        }[scenario];
        const renderedCounts = await page.evaluate(() => ({
          themes: document.querySelectorAll("#themes article").length,
          themesEmpty: document
            .querySelector("#themes")
            ?.textContent?.includes("Themes to be announced."),
          delegates: document.querySelectorAll("#speakers [data-delegate-card]")
            .length,
          delegatesEmpty: document
            .querySelector("#speakers")
            ?.textContent?.includes("To be announced."),
          committeeLists: [
            ...document.querySelectorAll("#committee [data-committee-list]"),
          ].map((list) => list.querySelectorAll("li").length),
          hospitalityImages: document.querySelectorAll(
            "#hospitality [role='region'] img",
          ).length,
        }));
        expect(
          renderedCounts.themes === expectedCounts.themes &&
            renderedCounts.delegates === expectedCounts.delegates &&
            JSON.stringify(renderedCounts.committeeLists) ===
              JSON.stringify(expectedCounts.listGroups) &&
            renderedCounts.hospitalityImages ===
              expectedCounts.hospitalityImages,
          `Rendered ${scenario} content counts differ: ${JSON.stringify({ expectedCounts, renderedCounts })}`,
        );
        if (scenario === "zero") {
          expect(
            renderedCounts.themesEmpty && renderedCounts.delegatesEmpty,
            "Zero-item themes or delegates did not show their empty-state copy",
          );
        }
        await auditPage(page, { main: true });
        await page.close();
      } finally {
        await stopPreview(child);
      }
      console.log(`Rendered ${scenario} content stress case: passed.`);
    }
  } finally {
    await Promise.all(
      contentPaths.map((path, index) => writeFile(path, originals[index])),
    );
    await buildMode("full");
  }
}

try {
  await mkdir(screenshotDirectory, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    await buildMode("landing");
    let child = startPreview("landing", ports.landing);
    try {
      await waitForServer(origins.landing, child);
      await captureLandingSet(browser, origins.landing, "only", "/", false);
      await checkCountdownStability(
        browser,
        origins.landing,
        "/",
        "Landing-only",
      );
      await checkReducedMotionOnLanding(browser, origins.landing, "/");
    } finally {
      await stopPreview(child);
    }

    await buildMode("full");
    child = startPreview("full", ports.full);
    try {
      await waitForServer(origins.full, child);
      await checkMainInteractions(browser);
      for (const width of [1440, 1024, 768, 390]) {
        await capture(browser, origins.full, "/", "main-full-page", width, {
          main: true,
          height: 1000,
          fullPage: true,
        });
      }
      await captureLandingSet(
        browser,
        origins.full,
        "full",
        "/countdown/",
        true,
      );
      await checkCountdownStability(
        browser,
        origins.full,
        "/countdown/",
        "Full-mode",
      );
      await checkReducedMotionOnLanding(browser, origins.full, "/countdown/");
    } finally {
      await stopPreview(child);
    }

    await verifyTemporaryState(browser, "live");
    await verifyTemporaryState(browser, "ended");
    await verifyMilestoneCount(browser, 0);
    await verifyMilestoneCount(browser, 1);
    await verifyMilestoneCount(browser, 12);
    await verifyContentExtremes(browser);
    await buildMode("full");
  } finally {
    await browser.close();
  }
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
} finally {
  for (const server of servers) await stopPreview(server);
}

console.log(`Screenshots saved to ${screenshotDirectory}`);
console.log("Viewport widths checked: 1440, 1024, 768, 390");
console.log(`External browser requests: ${externalRequests.length}`);
console.log(`Browser runtime errors: ${pageErrors.length}`);
console.log(`Browser console errors: ${consoleErrors.length}`);
if (externalRequests.length)
  console.error(`External requests: ${externalRequests.join(", ")}`);
if (pageErrors.length)
  console.error(`Browser errors: ${pageErrors.join("\n")}`);
if (consoleErrors.length)
  console.error(`Console errors: ${consoleErrors.join("\n")}`);
if (failures.length) {
  console.error(
    `Browser checks failed (${failures.length}):\n- ${failures.join("\n- ")}`,
  );
  process.exitCode = 1;
} else {
  console.log(
    "Browser, responsive, interaction, accessibility and network checks passed.",
  );
}
