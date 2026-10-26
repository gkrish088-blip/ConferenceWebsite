# Implementation plan

Work in order. After each phase: run `skills/verify-site`, commit, stop, report.

## Phase 0: scaffold

- Vite + React + TypeScript project in the repo root. Add the planned dependencies from `docs/00-decisions.md`.
- Add scripts listed in `AGENTS.md` (some can be stubs until Phase 1).
- ESLint, Prettier, Vitest configured. `.gitignore`, `.nvmrc` (current LTS Node).
- Two entries (`index.html`, `countdown/index.html`) both render a hello page.
- `VITE_LAUNCH_MODE` switch works: `build:landing` and `build:full` both succeed and produce the folder shapes described in `docs/01-architecture.md`.

Done when: both builds succeed, and `dist/` has the right entries for each mode.

## Phase 1: foundation

- `tokens.css` and `base.css` from `docs/03-design-choices.md`. Fonts imported from `@fontsource`.
- `content/schema.ts`, all nine JSON files with placeholder data (see `docs/05-content-schema.md`), and `content/index.ts`.
- Scripts: `validate-content`, `report-placeholders`, `check-launch`, `make-placeholders` (generates neutral placeholder images and three placeholder logo SVGs into `public/placeholders/` and `public/assets/logos/` only if the logo files are missing).
- Layout components: `Container`, `Section` (id, heading, scroll margin), `Nav` (sticky, anchors, scroll-spy, mobile menu), `Footer`.
- `RichText` and `richText.ts` (paragraphs, bold, links, `#anchor` links). No `dangerouslySetInnerHTML`.
- `sections/index.ts` registry with empty stub sections so the nav already works.
- Tests: schema accepts the placeholder content, rejects bad dates, more than 8 themes, missing alt text.

Done when: the nav scrolls between nine stub sections, scroll-spy works, `validate-content` passes, tests pass.

## Phase 2: Hero, About, Themes

- Hero (top info), About (description then three institutions), Themes (up to 8). Specs in `docs/04-section-specs.md`.
- `InstitutionMark` component (logo plus name) reused in Hero, About and Footer.

Done when: sections show placeholder content from JSON, and changing a JSON value changes the page with no code edit. Themes with 3, 8 and 0 items all look right.

## Phase 3: Dates and Speakers

- Dates pipeline (SVG river line, horizontal on desktop, vertical under 900px). Status per milestone (past, next, upcoming) computed in IST.
- Speakers: Guest of Honor block, then delegates grid. Empty states.
- `lib/dates.ts` tests: status logic around "today", ordering, 1 milestone, 12 milestones.

Done when: the pipeline looks right with 1, 5 and 12 milestones, at 1440px and 390px.

## Phase 4: Committee, Registration, Hospitality, Contact

- Committee: Patron, pair of boxes with connector lines, Conveners, Advisory, Organising, Student Council. All from one `committee.json` using `layout` types (`featured`, `pair`, `grid`, `list`).
- Registration: details text, sponsorship tiers, link slots (buttons) for the Drive PDF items.
- Hospitality: intro with anchor links, six accordion items, deep links.
- Contact: persons, email, address, a map link (plain link, no embed).

Done when: adding 30 names to Organising needs only JSON edits and the layout holds. Deep link `/#hospitality-accommodation` opens the item. Accordion works from keyboard.

## Phase 5: Landing page

- Full-screen landing from `docs/04-section-specs.md`. Countdown component with the three states. Mode-aware button.
- Countdown unit tests: far future, exactly zero, one second before, after start, after end, DST-free IST check using fixed `nowMs`.

Done when: landing builds alone in `landing` mode, shows "Enter site" only in `full` mode, and "Conference is live" appears when `nowMs` passes the target (verify with a temporary override of the target, then remove it).

## Phase 6: polish, QA, deploy notes

- Responsive pass at 1440, 1024, 768, 390.
- Keyboard pass, focus order, reduced motion.
- Contrast check on every colour pair used for text.
- Page weight: main page under 500 KB transferred excluding images; each image under 200 KB; use `webp` for photos.
- No external requests (verify in the built `dist`).
- Write `docs/06-deployment.md` updates with the real build commands and output folders.
- Final `report:placeholders` output pasted into the report so the human knows what is left.

Done when: `verify-site` is fully green and the report lists every remaining placeholder.
