# Design refresh verification — 15 November 2026

- TypeScript and all content schemas: passed.
- Unit tests: 28 passed.
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
