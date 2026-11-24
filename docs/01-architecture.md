# Architecture

## Why this shape

Two things pull in different directions. The site should be easy to hand over (content in plain files), and it should be hard to break (types, validation, tests). So the code is a thin React layer over validated JSON.

## Folder layout

```
/
  index.html                 main site entry (served at / in full mode)
  src/
    entries/
      main.tsx               mounts <MainApp/>
    app/
      MainApp.tsx            nav + all sections in order + footer
    sections/                one folder per section, each: Component.tsx + Component.module.css
      Hero/  About/  Themes/  Dates/  Speakers/  Committee/  Registration/  Hospitality/  Contact/
      index.ts               ordered registry: [{ id, navLabel, Component }]
    components/
      layout/                Container, Section, Nav, Footer
      ui/                    Accordion, Button, PersonCard, InstitutionMark, RichText
    content/
      site.json  about.json  themes.json  dates.json  speakers.json
      committee.json  registration.json  hospitality.json  contact.json
      schema.ts              zod schemas, one per file
      index.ts               loads + validates, exports typed content
    lib/
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
    content.test.ts  dates.test.ts
```

## Build

Run `npm run build` to prerender each route in `src/content/pages.json`.

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

## Content layer rules

See `docs/05-content-schema.md`. The short version: one JSON file per section, validated by zod, `placeholder: true` on anything fake, `npm run check:launch` fails while any placeholder remains.
