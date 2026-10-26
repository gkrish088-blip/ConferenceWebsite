# Working on this prototype

- Keep this a small React + TypeScript static site. Do not add server features or dependencies beyond `docs/00-decisions.md` without approval.
- Put all visible event-specific content and the page inventory in schema-validated JSON under `src/content/`. Do not hardcode event copy in React components.
- Keep shared UI in focused files under `src/components/`; use `src/sections/` for page sections and `src/app/` for entry page composition.
- Put approved images and logos in `public/assets/`. Keep placeholder art clearly labeled and do not use unapproved organizer marks or third-party imagery.
- Preserve the one-page section navigation, identity band, shared footer, hospitality accordions and separate countdown launch mode.
- Mark unknown content clearly and set `placeholder: true`. Do not present invented names, facts, dates, fees, speakers, policies or addresses as real.
- Follow the palette, typography and layout rules in `docs/03-design-choices.md` and the behavior requirements in `docs/04-section-specs.md`.
- Check desktop and mobile layout, keyboard focus, reduced-motion behavior, content validation and both launch builds when changes affect the site.
- Update `README.md` and `TODO.md` when the page map, workflows or content ownership changes.
