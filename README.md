# IIT Roorkee conference website

A static React and TypeScript conference site. The main page is a single, data-driven page; the countdown landing page is available as `/countdown/` in the full build and as `/` in the landing build. Event copy and the page inventory live in schema-validated JSON files under `src/content/`.

## Page map

| Route | Purpose |
| --- | --- |
| `/` | Main conference page: overview, institutions, themes, dates, speakers, committee, registration, hospitality and contact. |
| `/countdown/` | Countdown landing page in the full build. |
| `/` | Countdown landing page in the landing-only build. |

The main navigation uses section anchors. Hospitality has six independent accordion items with direct hash links such as `/#hospitality-accommodation`.

## Run locally

```bash
npm install
npm run dev
```

## Checks and builds

```bash
npm run lint
npm run typecheck
npm test
npm run validate:content
npm run report:placeholders
npm run build:landing
npm run build:full
npm run capture:screenshots
```

`npm run build:landing` writes the countdown site to `dist/`. `npm run build:full` writes the main site and `/countdown/` entry to `dist/`. The landing build serves the countdown page at `/`; the full build serves the main page at `/` and the countdown at `/countdown/`. `npm run check:launch` intentionally fails until placeholder event data and links have been replaced with approved details.

## Content and assets

- `src/content/*.json` owns event copy, page inventory, labels, links, dates, people, hospitality topics and accessibility strings. `src/content/schema.ts` validates the data.
- `src/main.tsx`, `src/app/`, `src/components/` and `src/sections/` render the shared page patterns from those JSON records.
- `public/assets/logos/` contains the supplied conference and institution logos. `public/assets/hospitality/` contains licensed travel photographs, with credits in `src/content/hospitality.json`. `public/placeholders/` contains remaining portrait placeholders. Replace imagery only with approved assets.
- Institute website links live in `src/content/about.json` and are shared by the About links and clickable logos in the header, footer and countdown page. External links open in a new tab.
- `docs/` contains the supplied decisions, architecture, design and section requirements. `skills/verify-site/SKILL.md` contains the verification checklist.

Every unconfirmed event-specific item is marked as a placeholder. Do not present example names, dates, costs, biographies, policies or destinations as verified information.

Text has been populated from the three supplied PDFs: the MemDesAI-2027 poster, conference proposal and registration fee sheet. See [content sources and remaining confirmations](docs/07-content-sources.md) for the source mapping and provisional details. Registration now includes early bird and standard fee tables and all four sponsorship packages. The hospitality guide links to its travel and campus sources. Portraits awaiting approved images remain placeholders.

## Design branches

This is the static design. The existing Vercel project deploys from `main`.

Update `src/content/about.json` and `src/content/themes.json` on both branches when conference copy changes.
