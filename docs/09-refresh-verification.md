# Design refresh verification — 15 November 2026

- TypeScript and all content schemas: passed.
- Unit tests: 37 passed.
- ESLint and Prettier: passed. Windows line endings are preserved by `.prettierrc.json`.
- Full and landing-only builds: passed; final `dist/` contains the full build.
- Static HTML and local asset references: passed for every published route.
- Browser widths: 1440, 1024, 768 and 390 pixels.
- Keyboard: native disclosures toggle with Enter and Space, visible focus, mobile menu opens and Escape closes it.
- Reduced motion: no automatic slideshow; content remains visible; manual gallery controls work.
- All seven ODT portraits and five supplied tourism photographs: loaded and decoded.
- Deep links: Uttarakhand disclosure opens on arrival.
- JavaScript disabled: real page content, working navigation and native disclosures.
- Browser/hydration errors: zero. Failed asset requests: zero. External asset requests: zero.
- Interactive theme preference: light default, dark preference survives reload.
- Multipage navigation: direct routes, client navigation and back navigation checked on that branch.

Screenshots and repeatable browser report: `proof/design-refresh/` (screenshots
are local review material, excluded from commits; report.json is tracked).

The full design suite was rerun after portrait dimensions, reading scrims and
opening layout corrections. Final supplementary checks cover countdown-only
layouts, focus color and genuine HTTP 404 responses.

## Content still awaiting organizer approval

41 placeholder records remain in each design: committee 20, contact 3, dates 2,
hospitality 4, registration 3, site 1 and speakers 8. These counts include parent
records and child items, not 41 distinct event facts. No missing event details
were invented. `check:launch` remains blocked by these records.

## Deployment status

Changes are local branch commits. No public deployment was performed. The live
Vercel URL will retain the previous build until redeployed. HTML generation
removes the empty app-shell limitation; search indexing and host access controls
remain outside this local verification.

Supplementary checks passed for all three landing-only builds at all four widths,
final full-build focus and genuine 404 responses, and automatic gallery advancement
with manual pause. Key body/link contrast pairs range from 4.86:1 to 14.91:1.
See `proof/design-refresh/supplementary-report.json`.

## Logo presentation refinement

The original artwork bytes in all five transparent SVG presentations were
verified against their approved sources. Header logos load without CSS white
backgrounds at 1440px and 390px, with no overflow. Institution images are now
108 by 84 CSS pixels on desktop and 88 by 68 on phones; the conference mark is
430px/300px wide with the unused surrounding paper trimmed from its viewBox.
Both themes retain readable brand bands, and countdowns fit at 390 by 844.
Both launch builds, content validation, static HTML checks and formatting pass.

The subsequent sizing revision verifies exact two-thirds header image dimensions
at 1440px and 390px, with no overflow or browser errors and working keyboard
menu controls. Both launch builds and static HTML checks pass.

## Interactive dark-mode verification

Both launch builds, type checks, schema validation, unit tests and formatting
pass. The regular four-width browser suite passes with no browser/hydration
errors or failed asset requests. A dark-theme audit covers all eight sections
at 1440px and 390px, verifies dark header/footer backgrounds, dark logo sources,
readable main/muted text, removal of darker inset rich-text blocks, no overflow,
and returning to the original light logo sources. See dark-mode-report.json.

## Fully open multipage Hospitality

All six topics render as normal labelled sections, with body text, source credits
and supplied images immediately visible. No details, summary or toggle controls
remain on this page. Both launch builds, content/HTML checks and formatting pass.
The updated browser suite passes at 1440/1024/768/390px with no errors, failed
assets or external requests. All topics remain visible without JavaScript, and
keyboard activation of the accommodation intro link preserves its deep-link URL.
