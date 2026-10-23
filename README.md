# IIT Roorkee conference 2027 prototype

Static React + TypeScript conference site based on visual inspection of the [IAHS 2025 reference](https://iahs2025.com/Homepage) on 22 October 2026. The reference's dark overlaid header, campus hero composition, Poppins/Ubuntu typography, pink accent, colored countdown boxes, programme table, search fields, white logo cards, inner-page banner, and mobile menu informed this version.

The official 2027 conference name, theme, dates, schedule, registration system, speakers, policies, and most assets are still unknown. They remain visibly labeled as pending. The generated hero is a visual stand-in and **not an official IIT Roorkee photograph**. Organizer and sponsor marks are placeholders pending approval. The inner-page banner uses a CSS gradient until approved imagery is supplied.

## Run

```bash
npm install
npm run dev
npm run build
```

For direct links such as `/registration`, configure the static host to serve `index.html` for unknown routes.

## Files

| File | Purpose |
| --- | --- |
| `src/content.ts` | Event fields, page inventory, navigation, milestone labels, and page-specific hints. |
| `src/main.tsx` | Shared header, footer, homepage and inner-page families. |
| `src/styles.css` | Reference-inspired desktop and mobile styling, focus, and reduced-motion behavior. |
| `public/assets/campus-hero-generated.png` | Generated campus-style hero stand-in. |

| `TODO.md` | Organizer inputs still needed for a production-ready site. |

All 19 inner pages in `src/content.ts` now have a reviewable structure with page-specific section headings, organizer handover hints, shared breadcrumbs, related links, and a content-pending notice. The complete primary navigation is also defined in `src/content.ts`, so its links and page inventory stay together. Forms and programme search are display-only until organizers provide a real destination and approved data. Logo blocks intentionally carry clear pending labels.

## Verification

The production build succeeds. The homepage and scientific-program page were visually checked at desktop and mobile viewport sizes; keyboard focus and reduced-motion CSS remain present. Final content and approved marks should receive another responsive and accessibility review before launch.
