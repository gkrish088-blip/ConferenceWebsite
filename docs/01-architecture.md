# Architecture

## Why this shape

Two things pull in different directions. The site should be easy to hand over (content in plain files), and it should be hard to break (types, validation, tests). So the code is a thin React layer over validated JSON.

## Folder layout

```
/
  index.html                 main site entry (served at / in full mode)
  countdown/index.html       landing page entry
  src/
    entries/
      main.tsx               mounts <MainApp/>
      landing.tsx            mounts <LandingApp/>
    app/
      MainApp.tsx            nav + all sections in order + footer
      LandingApp.tsx         full-screen countdown page
    sections/                one folder per section, each: Component.tsx + Component.module.css
      Hero/  About/  Themes/  Dates/  Speakers/  Committee/  Registration/  Hospitality/  Contact/
      index.ts               ordered registry: [{ id, navLabel, Component }]
    components/
      layout/                Container, Section, Nav, Footer
      ui/                    Accordion, Button, PersonCard, InstitutionMark, Countdown, RichText
    content/
      site.json  about.json  themes.json  dates.json  speakers.json
      committee.json  registration.json  hospitality.json  contact.json
      schema.ts              zod schemas, one per file
      index.ts               loads + validates, exports typed content
    lib/
      countdown.ts           pure countdown math (unit tested)
      dates.ts               IST formatting, past/next/future status for milestones
      scrollspy.ts           IntersectionObserver hook for nav highlighting
      richText.ts            tiny safe parser: paragraphs, **bold**, [text](url or #anchor)
    styles/
      tokens.css             colours, type scale, spacing, radii
      base.css               reset, typography, focus styles
  public/
    assets/logos/            iitr.svg, csir-iip.svg, hkust.svg (human supplies)
    assets/images/           real images later
    placeholders/            generated placeholder images
  scripts/
    validate-content.ts  report-placeholders.ts  check-launch.ts  make-placeholders.ts
  tests/
    countdown.test.ts  content.test.ts  dates.test.ts
```

## Two launch modes

Set with `VITE_LAUNCH_MODE`:

- `landing`: only the landing page is built. `/` shows the countdown. No "Enter site" button, because there is nothing to enter.
- `full`: `/` shows the main site. The landing page still exists at `/countdown/`. The landing page now shows an "Enter site" button.

Implementation is left to the agent (a small Vite config switch plus a post-build copy step is enough). Requirements: both modes build from the same code and content, and the mode is the only thing that changes. Launching the main site later means rebuilding with `full` and redeploying.

## Main site behaviour

- Sections render in the order of `sections/index.ts`. The nav is generated from the same registry, so adding a section is one line.
- Nav links are anchors (`#about`, `#committee`, and so on). Smooth scroll only when reduced motion is not requested. Each section has `scroll-margin-top` equal to the sticky nav height.
- Scroll-spy highlights the nav item for the section in view. The URL hash updates with `history.replaceState`, never with pushes.
- Under 900px the nav collapses to a menu button.
- No client-side router. There is only one page.

## Hospitality accordion

- One `Accordion` component. Each item is a button (`aria-expanded`, `aria-controls`) and a region.
- All items start closed. Items toggle independently, so a reader can compare two.
- Deep links work: `/#hospitality-accommodation` scrolls to Hospitality and opens that item. The intro paragraph can contain links like `[Accommodation](#hospitality-accommodation)` and they open the item too.
- Height animation uses the `grid-template-rows: 0fr to 1fr` technique. Content is in the DOM when closed but hidden from assistive tech until open.

## Countdown

- `getCountdown(targetISO, nowMs)` returns `{ state: "before" | "live" | "ended", days, hours, minutes, seconds }`.
- The target is a full ISO string with `+05:30`, so it means the same moment for every viewer. Display strings use `Intl.DateTimeFormat` with `timeZone: "Asia/Kolkata"`.
- Ticks once a second with `setInterval`, cleared on unmount. The container is not `aria-live` while ticking. A visually hidden line updates once per minute.
- `live` starts at zero and shows "Conference is live". `ended` appears only if `eventEnd` exists in `site.json`.
- It uses the viewer's device clock. A wrong clock gives a wrong countdown. That is acceptable for this site.

## Content layer rules

See `docs/05-content-schema.md`. The short version: one JSON file per section, validated by zod, `placeholder: true` on anything fake, `npm run check:launch` fails while any placeholder remains.
