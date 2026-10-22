# Working on this prototype

- Keep this a small React + TypeScript static site unless approved workflows require server features.
- Put event-specific content and the page inventory in `src/content.ts`. Avoid repeating dates, titles and organizer names in components.
- Keep shared UI in `src/main.tsx` until component size justifies splitting into focused files. Explain non-obvious behavior in comments; prefer clear names over commentary on each line.
- Put approved images and logos in `public/assets/`; do not embed third-party imagery or unapproved organizer marks.
- Preserve the page families, shared navigation, breadcrumb, callout and footer patterns when editing.
- Mark unknown content clearly. Do not present invented sample fees, dates, speakers or policies as real.
- Check desktop and mobile layout, keyboard focus and reduced-motion behavior for changes affecting UI.
- Update `README.md` and `TODO.md` when the page map, workflows or content ownership changes.
