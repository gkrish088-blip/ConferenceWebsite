# MemDesAI 2027 — static design

Branch: `codex/static-content`.
React + TypeScript + Vite; static hosting with build-time HTML and client hydration.
No runtime server or new dependencies.

## Run and build

```sh
npm ci
npm run dev
npm run build
npm run preview
```

`npm run build` generates the eight conference pages in `dist/`. The retired `/countdown/` URL returns HTTP 404.
Deploy the complete `dist/` folder. Vercel uses `vercel.json`; no SPA catch-all
rewrite is required. Unknown paths should return HTTP 404. Direct section paths
on the multipage branch are real directories with an `index.html`.

## Page map

- `/` contains the conference title and About.
- Themes, Dates, Speakers, Committee, Registration, Hospitality and Contact have their own prerendered section paths.
- Contact details appear on `/contact/`, the last page in the conference navigation.
- Legacy section bookmarks forward to the corresponding page. Hospitality topic fragments still open the matching disclosure.
- The hero controls cycle through three crops of the approved membrane-fibre micrograph. Institutional descriptions have a reduced-motion-aware reveal.

## Content and asset ownership

All event copy remains in schema-validated `src/content/`. `pages.json` owns
route inventory; `media.json` owns gallery images, slide order and control labels.
`about.json` owns institution/department marks; `committee.json` owns captioned
leadership, conveners, and the three portrait rosters supplied in the IITR Organizing, International Advisory, and National Advisory committee documents; `hospitality.json` owns the tourism gallery. The build
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
The build timestamp keeps date hydration consistent. Native hospitality
disclosures and real navigation links remain usable without JavaScript.

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
npm run build
npm run check:html
node scripts/verify-design.mjs --local
```

The browser check starts a local preview with `--local`. Without that flag it expects a static server on 5281 (static), 5282 (interactive),
or 5283 (multipage), or `CONFERENCE_ORIGIN`. It covers 1440/1024/768/390px,
images, gallery controls, reduced motion, keyboard disclosures, deep links,
mobile menus, theme persistence, direct routes without JavaScript, browser
errors, hydration and same-origin asset requests. Proof is saved under
`proof/design-refresh/`. `npm run check:launch` still rejects unknown content;
this design refresh does not approve remaining event details for launch.
