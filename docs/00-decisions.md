# Decisions, and why

Status: **locked** unless marked open. If you change one, edit it here first.

| # | Decision | Why |
|---|---|---|
| 1 | Main site is one page. Nav links scroll to sections on that page. | Matches the professor's brief and the IITJ ICWS reference. Anchors also give shareable links per section (`/#committee`). |
| 2 | Hospitality is a normal section on the home page. Its subheadings expand in place when clicked. | The section stays short until someone chooses to open a topic. This replaces the earlier idea of a separate page. |
| 4 | Stack: React + TypeScript + Vite, static build. | You prefer React. Everything is static, so any server can host it. TypeScript matters here because AI agents will edit content later and types catch mistakes at build time. |
| 5 | All text, names, dates and image paths live in `src/content/*.json`, validated by a schema. | Real data arrives late and in pieces. Content edits must not touch layout code, and a bad edit must fail the build, not the live site. |
| 6 | Plain CSS Modules plus a tokens file. | The site is small and long-lived. Fewer dependencies means less breakage when someone revisits it in 2027. |
| 7 | Fonts self-hosted, images local, no third-party requests. | Institutional networks can block external hosts, and it is a privacy and reliability gain. |
| 9 | Institutions: IIT Roorkee, CSIR-IIP, HKUST. | As specified. |
| 10 | Dates pipeline starts with 5 placeholder milestones. | Real dates are not available. The component accepts any number. |
| 11 | Committee, speakers and themes are reusable data-driven components. | Counts are unknown. Adding people is a data edit. |
| 12 | Registration and abstract-submission links come from the professor's Drive PDF. We only provide slots for links. | Not our work. We just need places to put them. |
| 13 | Laptop-first design, fully responsive. | Visitors are mostly professors and PhD students on laptops, but phones must not break. |
| 14 | Hosting: AWS servers behind an IITR domain. Details open. | See `docs/06-deployment.md`. |
| 15 | Design improves on the official IITR look but uses the IITR logo and imagery. | As specified. See `docs/03-design-choices.md`. |
| 16 | One agent works phase by phase by default. | Shared files (tokens, layout, schema) are touched in Phase 1. Parallel work before that causes merge conflicts. |

## Open items (need a human answer, none block Phase 0 to 4)

- Event end date/time. The plan adds an optional `eventEnd` so the page does not say "live" forever after the event. Delete it if you do not want it. This is the only addition beyond your list.
- Final conference name, dates, venue wording.
- Whether we may use IITR photos from the official site or only photos supplied by the department.

## Added dependencies (agents append here)

Planned: `react`, `react-dom`, `vite`, `typescript`, `zod`, `@fontsource/newsreader`, `@fontsource/public-sans`, `vitest`, `eslint`, `prettier`. Optional for screenshots: `@playwright/test`.


## 15 November 2026: supplied photography and readable HTML

The user explicitly authorizes the supplied campus, membrane and Uttarakhand
photographs and the ODT portraits/logos. ODT identity assets take priority over
the earlier logos folder. No external imagery or dependencies were introduced.
Build-time prerendering uses existing Vite and React DOM; hosting remains static.
All routes emit real HTML before hydration; no runtime server is required.
Light is the default theme. Interactive variants retain an optional saved dark
theme and their existing membrane simulations. Native hospitality disclosures
remain usable without JavaScript.
