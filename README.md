# IIT Roorkee conference 2027 — UI concept

Responsive React + TypeScript prototype for a 2027 conference organized by IIT Roorkee, CSIR–IIP Dehradun and HKUST. The [IAHS 2025 site](https://iahs2025.com/Homepage) informs the page structure and interaction patterns. The official 2027 name, theme, dates and almost all content are still unknown, so every provisional area is labeled in the UI. This is a local design review build with no backend, payments or submission handling.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the Local URL printed by Vite. To create a static production bundle, run `npm run build`; the output is in `dist/`. A static host must serve `index.html` for unknown paths so direct links such as `/registration` work.

## Codebase map

| Location | Purpose |
| --- | --- |
| `src/main.tsx` | Shared header/footer, home sections, inner-page templates, navigation and demo programme search. |
| `src/content.ts` | Event constants, page inventory and placeholder section descriptions. Start here when editing content or page order. |
| `src/styles.css` | Responsive layout, colors, typography, buttons and focus states. |
| `public/assets/` | Approved photos, logos, posters, maps and downloads when supplied. |
| `TODO.md` | Content, workflow and design decisions that remain open. |
| `AGENTS.md` | Maintenance conventions for future contributors and coding agents. |

## Updating the concept

1. Change official event information in `src/content.ts`.
2. Adjust the page list and navigation groups in the same file. Each `slug` becomes a page URL.
3. Replace a white `ImageSlot` with an `<img>` that references `/assets/your-file.webp` or `/assets/your-logo.svg`. Preserve its intended aspect ratio and add meaningful `alt` text.
4. Replace bracketed content hints and ghost lines with approved copy.
5. Replace the `sampleSessions` demo records in `src/main.tsx` with a typed local data file when the programme is supplied. The search currently filters by text, theme and contribution type in the browser.
6. Link buttons to the organizers' chosen registration, abstract, newsletter and other systems once confirmed.

No real form submits data. Sample timetable entries and search records are deliberately marked as examples. All 19 inner pages from the reference menu are represented so organizers can review what to keep or remove.

## Design and reference limits

The reference's public page inventory and homepage section sequence were inspected on 22 October 2026. A visual browser review was blocked by an expired certificate on the source site, so precise colors, fonts and animation have **not** been verified for pixel parity. This concept uses a blue, teal and warm accent academic style and should receive a side-by-side review when a safe reference or screenshots are available. Reference content, photos, logos and source code were not copied.

## Accessibility and performance

The design uses semantic links and headings, a skip link, visible keyboard focus, Escape to close menus, reduced-motion support, responsive tables with horizontal overflow, and no external fonts or image downloads. The current asset placeholders have explicit aspect ratios. Before launch, review final imagery, color contrast, real content semantics, keyboard navigation and device performance again.
