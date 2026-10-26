---
name: verify-site
description: Checklist to run before reporting any phase or content update as done. Covers code checks, content checks, both launch builds, responsive and accessibility checks, and the no-external-requests rule.
---

# Verify the site

Run everything that applies and report **actual results**. If you could not run something (no browser, for example), say "not run" and why. Do not write "should work".

## 1. Code

```
npm run lint
npm run typecheck
npm run test
```
All must pass with no new warnings.

## 2. Content

```
npm run validate:content
npm run report:placeholders
```
Validation must pass. Paste the placeholder summary into your report. Before real launch, `npm run check:launch` must pass too.

## 3. Builds

```
npm run build:landing
npm run build:full
```
Check the output folders:
- landing mode: `/` is the countdown page, no "Enter site" button, no main site files.
- full mode: `/` is the main site, `/countdown/` is the landing page with "Enter site".

Serve each with `npx vite preview` (or a static server) and open them.

## 4. No external requests

Search `dist/` for `http://` and `https://` that are not plain links in content. Confirm there are no `<script src>`, `<link href>`, `@import` or font URLs pointing off-site. If a browser is available, load the page and confirm the network panel shows only same-origin requests.

## 5. Visual and responsive (if a browser is available)

Take screenshots at 1440, 1024, 768 and 390 pixels wide for the main site and the landing page. Look for: text overlap, horizontal scroll, clipped logos, unreadable text over the contour background, nav wrapping to two lines, dates pipeline overlap. Fix before reporting. If you cannot take screenshots, say so, and review the CSS breakpoints by reading it.

## 6. Accessibility

- Tab through the whole page: order makes sense, focus ring is always visible, accordions open and close with Enter and Space, mobile menu is reachable and closable.
- Headings go h1 (once), then h2 per section, h3 within.
- Every non-decorative image has real alt text.
- Contrast: check each text and background pair against 4.5:1 (3:1 for large text). Marigold is never used as text.
- Reduced motion: with `prefers-reduced-motion: reduce` nothing animates and nothing is hidden because an animation did not run.

## 7. Specific behaviours

- Countdown: tests cover before, exactly zero, after start, after end. IST is used for display.
- Deep link `/#hospitality-accommodation` scrolls to and opens that item.
- Nav scroll-spy highlights the right section while scrolling and does not flicker.
- Stress the data: 0, 1 and many items in themes, speakers, committee lists, milestones, hospitality images.

## 8. Report

```
Ran: commands and results
Not run: what and why
Screenshots: where saved, widths covered
Issues found and fixed:
Issues found, not fixed:
Placeholders remaining: summary
```
