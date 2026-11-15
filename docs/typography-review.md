# Multipage typography review

Scope: the multipage branch only. Copy, page inventory, image assets, structural
layout and colors are unchanged. The initial browser theme color was corrected.

## Audit before changes

Computed styles were captured from the local production build at commit
`5329ea1ea7f01271061f427a99d99ab7ed165625`, matching the deployed source.
The light and dark themes had identical font metrics. Measurements below use
1366px width, with 390px differences stated explicitly. Raw samples for both
themes and all four requested routes are in `proof/typography/before.json`.

- h1: `"Flow Bodoni", Georgia, serif`, normal 400, normal letter spacing,
  34.15px / 39.2725px (1.15). Mobile: 24px / 27.6px. Inner-page h1 is visually
  hidden and was 34px / 38.08px (1.12).
- h2: the same Bodoni stack and normal 400, normal tracking, 57.372px /
  65.9778px (1.15). Mobile: 34px / 39.1px.
- h3: the same Bodoni stack and normal 400, normal tracking. Institution names:
  22px / 24.64px. Theme headings: 30px / 33.6px, mobile 23px / 25.76px.
  Sponsorship headings: 24px / 26.88px. Date headings have 17px / 22.1px and
  19.89px / 22.2768px variants; the latter is 19px / 21.28px on mobile.
- Body content: `"Flow Jost", Arial, sans-serif`, normal 400, 17px / 28.05px
  (1.65), normal tracking in both widths. The outer body element specified
  `"Public Sans", Arial, sans-serif` at the same size/weight/line-height, but
  the page wrapper replaced it with Jost.
- Navigation: Jost 400, 14px / 18.2px (1.3), normal tracking, both widths.
  The brand link used Bodoni 400, 21px / 26.25px (1.25).
- Buttons: Jost 400, normal tracking, 17px / 28.05px; gallery buttons
  20px / 33px. Shared primary/secondary actions had 16px, weight 600 and
  line-height 1.35; countdown entry used 16px, 600 and 1.5.
- Small labels: Jost 400, normal tracking. Identity labels 12px / 16.2px;
  footer marks 14px / 18.9px; hero metadata 14px / 23.1px. Dates used
  15px / 21.75px, with mobile variants 14px / 20.3px. Photo captions were
  13px / 19.5px.
- Large wordmark: Bodoni normal 400, 95.62px / 89.8828px (0.94), tracking
  -0.045em. Mobile: 64px / 60.16px. It is separate from the semantic h1.

`membrane-site.module.css` loaded local `bodonimoda.ttf` and `jost.ttf`
through `@font-face` with swap but no explicit weight range. Every active
heading used normal 400, below 500. No italic heading style was used.
`base.css` also imported Newsreader normal 500/600 and Public Sans normal
400/500/600 through Fontsource. Those were superseded on the multipage design.
The retained unused flow-example stylesheet also declared Bodoni/Jost.
There were no Google Fonts links, CSS remote imports or framework font loader.

Theme state, storage, toggle and the theme-color update live in
`src/app/MembraneSiteApp.tsx`. It defaults to light and restores the saved
`memdesai-theme` preference. It sets `data-flow-theme` on html and `data-theme`
on the page; `ThemeContext` supplies the selected theme to logo images.

## Applied scheme

- Headings: `"Source Serif 4", Georgia, serif`, normal 600 in both themes,
  -0.01em tracking; h1 1.15 line-height, h2/h3 1.25.
- Body/UI: `"Inter", Arial, sans-serif`, normal 400/500, body 17px/1.65.
  Nav/actions use 500 and line-height 1.65. Paragraphs use pretty wrapping and
  a 68ch maximum. h3 card headings retain the heading scheme; h4 names and
  table captions use Inter 500.
- Metadata: `"IBM Plex Mono", "Courier New", monospace`, normal 500,
  12px/1.65, uppercase, 0.06em tracking. Countdown digits use that family,
  weight and tracking while retaining the existing launch display scale/grid.
- The stacks and heading weight are defined by `--font-heading`, `--font-body`,
  `--font-mono`, `--heading-weight` in `tokens.css`. Existing font variable
  aliases resolve to those variables.
- Only four Latin normal WOFF2 files ship, supplied by Fontsource and defined
  in `fonts.css`, with swap. Entry HTML preloads heading 600 and body 400/500;
  mono is not preloaded. Old font packages and TTF files were removed.
- h2 is `clamp(1.5rem, 1.1rem + 1.2vw, 2.25rem)`: 33.992px at 1366px and
  24px at 390px. General h1 uses the requested clamp, 24ch and balanced wrapping.
- Approved title exception: the exact requested h1 size (54.716px at 1366px)
  required six lines at 24ch and five at the existing hero width. The user
  chose the smaller size over widening the layout. The long title therefore
  uses `clamp(2rem, 2.5vw, 2.2rem)` and the existing 820px hero / 900px
  countdown title areas. The home h1 is 34.15px and three lines at 1366px;
  at 390px it is 32px. Copy is unchanged.

## Verification

- Full-page screenshots: home, themes, dates and registration, light/dark,
  1366px and 390px: 16 captures. See `proof/typography/README.md`.
- No horizontal overflow, browser errors, failed assets or old font requests
  in the typography browser run. Network requests contain only the four
  intended same-origin Latin WOFF2 fonts. Three heading/body preloads match
  those exact asset URLs. See `proof/typography/report.json`.
- Normal local font loads recorded no layout shift in the requested pages.
  An intentionally delayed cold font load (800ms) recorded approximately
  0.005 desktop CLS and 0.012 mobile CLS: small, nonzero fallback movement.
- The pause numeral U+2161 renders through Times New Roman on the test machine,
  confirmed by Chromium's platform-font API; it is a clean system fallback,
  not a missing-glyph box. No extra font was downloaded for it.
- Theme-color checks pass in both themes: #f5f8f7 light and #162620 dark.
  Countdown retains #10263f, including the standalone landing build.
- All visible text color/background pairs on all eight content routes were
  checked at both widths in light mode; minimum 5.59:1, above 4.5:1.
  These calculations composite CSS surface colors. The About copy also sits
  over its existing high-opacity scrim; even a black photograph under the
  weakest scrim beneath the reading column retains sufficient body contrast.
  **Text colors changed: none. Background colors changed: none.**
- Content validation, 37 tests, lint, both launch builds and readable HTML
  checks pass. Existing browser checks also pass across 1440/1024/768/390px,
  including keyboard focus, reduced motion, galleries, hospitality, mobile
  navigation, theme persistence, route history and no-JavaScript content.

## Every changed file

- `.gitignore`: keep generated typography PNGs out of source control.
- `package.json`: replace old font packages with the three approved families.
- `package-lock.json`: lock those dependency changes.
- `src/styles/fonts.css`: four explicit, self-hosted Latin WOFF2 faces with swap.
- `src/styles/tokens.css`: central font variables, weight and h2 scale.
- `src/styles/base.css`: remove old imports; apply shared heading, body,
  paragraph, button and emphasis-weight rules.
- `src/styles/membrane-site.module.css`: remove old font faces/overrides;
  update wordmark, long title, metadata, actions and pager typography.
- `src/styles/site.module.css`: heading line-heights, UI weights, body
  readability and mono metadata across shared sections.
- `src/styles/media.module.css`: mono treatment for science-photo captions.
- `src/styles/landing.module.css`: new countdown fonts/metadata and the
  approved long-title size while preserving its grid.
- `src/styles/flow-example.module.css`: remove old font declarations and
  references from the retained example; use shared font variables.
- `index.html`: correct default theme-color and add three font preloads.
- `countdown/index.html`: add the same heading/body preloads.
- `scripts/prerender.mjs`: emit the correct standalone countdown theme-color.
- `scripts/verify-typography.mjs`: requested screenshot, network, glyph,
  theme-color, heading, overflow and delayed-font verification.
- `scripts/check-typography-contrast.mjs`: check composed light-theme text pairs.
- `public/assets/fonts/bodonimoda.ttf`, `jost.ttf`: remove obsolete fonts.
- `public/assets/fonts/bodonimoda-OFL.txt`, `jost-OFL.txt`: remove their old licenses.
- `public/assets/fonts/source-serif-4-OFL.txt`: retain the new serif license.
- `public/assets/fonts/inter-OFL.txt`: retain the new body-font license.
- `public/assets/fonts/ibm-plex-mono-OFL.txt`: retain the new mono license.
- `proof/typography/before.json`: original computed-style audit.
- `proof/typography/report.json`: final style, font network and loading evidence.
- `proof/typography/contrast.json`: measured light-theme contrast pairs.
- `proof/typography/README.md`: links to all 16 generated screenshots.
- `docs/00-decisions.md`: record explicit approval of font dependencies.
- `docs/03-design-choices.md`: replace the active multipage typography rules.
- `docs/typography-review.md`: this audit, results and file inventory.
- `README.md`: document font ownership and verification commands.
- `TODO.md`: mark the typography work complete.
