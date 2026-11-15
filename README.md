# MemDesAI 2027 — multipage design

Branch: `codex/multipage-design`.
React + TypeScript + Vite; static hosting with build-time HTML and client hydration.
No runtime server or new dependencies.

## Run and build

```sh
npm ci
npm run dev
npm run build:full
npm run preview
```

`npm run build:landing` emits only the countdown at `/`, without Enter site.
`npm run build:full` emits the conference and `/countdown/` with Enter site.
Both builds replace `dist/`; build full last for the full conference deployment.
Deploy the complete `dist/` folder. Vercel uses `vercel.json`; no SPA catch-all
rewrite is required. Unknown paths should return HTTP 404. Direct section paths
on the multipage branch are real directories with an `index.html`.

## Page map

- `/`
- `/themes/`
- `/dates/`
- `/speakers/`
- `/committee/`
- `/registration/`
- `/hospitality/`
- `/contact/`
- `/countdown/`

The single-page branches retain eight anchored sections. The multipage branch
uses each section as a real page, with browser history and previous/next links.
The countdown remains separate in every design.

## Content and asset ownership

All event copy remains in schema-validated `src/content/`. `pages.json` owns
route inventory; `media.json` owns gallery images, slide order and control labels.
`about.json` owns institution/department marks; `committee.json` owns captioned
patrons and conveners; `hospitality.json` owns the tourism gallery. The build
validates these records before generating HTML.

`public/assets/approved/` contains optimized derivatives of user-supplied images.
`provenance.json` maps files to the supplied Images folders and ODT media entries.
The ODT names/portraits and logos take priority over older placeholder identity
assets. Originals remain unchanged in the main workspace. No new external
imagery, biography, date, fee, policy or contact information has been invented.
Other unknown records retain `placeholder: true`.

## Readable without JavaScript

`scripts/prerender.mjs` renders the actual React components into every page at
build time. `hydrateRoot` attaches browser interactions to that same markup.
Clock snapshots keep countdown/date hydration consistent. All Hospitality topics
and real navigation links remain available without JavaScript.
The live countdown updates after hydration; without JavaScript its digits are
a build-time snapshot and the event date remains visible.

For canonical URLs, Open Graph URLs and a sitemap, set `SITE_ORIGIN` to that
particular deployment's HTTPS origin before building. It is intentionally not
hardcoded across three designs. A robots.txt is always generated. HTML availability
improves crawler access but does not guarantee search indexing or bypass hosting
access restrictions. Rebuild and redeploy to apply this fix to a live URL.

Technical references: [React server rendering](https://react.dev/reference/react-dom/server/renderToString),
[React hydration](https://react.dev/reference/react-dom/client/hydrateRoot),
[Vite static generation](https://vite.dev/guide/ssr.html#pre-rendering-ssg).

## Verification

```sh
npm test
npm run validate:content
npm run report:placeholders
npm run build:landing
node scripts/check-html.mjs --landing
npm run build:full
npm run check:html
node scripts/verify-design.mjs
```

The browser check expects a static server on 5281 (static), 5282 (interactive),
or 5283 (multipage), or `CONFERENCE_ORIGIN`. It covers 1440/1024/768/390px,
images, gallery controls, reduced motion, keyboard navigation, full Hospitality content, deep links,
mobile menus, theme persistence, direct routes without JavaScript, browser
errors, hydration and same-origin asset requests. Proof is saved under
`proof/design-refresh/`. `npm run check:launch` still rejects unknown content;
this design refresh does not approve remaining event details for launch.

## Interactive theme assets

Institution and conference image records may provide `darkSrc` alongside `src`.
The shared theme context selects dark-compatible logo presentations in the
identity band, About and footer. The dark page/background palette is shared
across sections and reading surfaces; original light artwork remains unchanged.
See `proof/design-refresh/dark-mode-report.json` for the dark-theme audit.


The multipage Hospitality page displays all six topics in full. Existing intro anchors and topic URLs continue to work, with content visible before JavaScript runs.


The multipage About introduction now uses a background slideshow of the first two supplied campus photos. No visible photo caption or counter is shown. `media.json` sets its interval with `galleryIntervalMs` (10 seconds); reduced motion keeps manual navigation available and disables automatic changes.

## Multipage typography

The multipage branch uses Source Serif 4 600, Inter 400/500 and IBM Plex Mono 500.
Fontsource packages supply four self-hosted Latin WOFF2 files; `fonts.css` defines
swap and the entry HTML preloads only heading/body weights. Tokens own font stacks.
The long title uses an approved smaller size to retain three laptop lines.
No event copy, routes or image ownership changed.

After the full build, run `node scripts/verify-typography.mjs` and
`node scripts/check-typography-contrast.mjs` with the static preview on port 5283.
The former accepts `CONFERENCE_ORIGIN` for live verification. Screenshots and
reports are in `proof/typography/`; the audit and file inventory are in
`docs/typography-review.md`.
