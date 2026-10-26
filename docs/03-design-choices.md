# Design choices

## The brief in one line

A hydrology conference run by an institute whose history is water engineering. The audience is professors, researchers and PhD students, mostly on laptops. The site should feel like a real institution's event: calm, legible, specific. It should look better than the official IITR pages without looking like a startup template.

## Where the look comes from

IIT Roorkee began as the Thomason College of Civil Engineering (1847), built around canal engineering. The Upper Ganga Canal runs by the campus. Water, flow and terrain are real parts of the place, so the design uses **contour lines and flow lines** (the language of maps and hydrology), not stock waves, droplets or blue gradients. (Verify the history line before using it in any copy.)

## Where the boldness goes

One memorable element: the **dates pipeline drawn as a river** that runs through the milestones. Everything else stays quiet. The landing page gets one more moment: contour lines that draw in once on load behind a very large countdown.

## Starting tokens

These are starting values. **Sample the real brand colour from the IITR logo file and adjust `--river` to match.** Do not trust the hex below over the logo.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#10263F` | Text, headings, footer background |
| `--river` | `#1F5F8B` | Links, buttons, the river line, key rules |
| `--shallows` | `#DCE9F1` | Alternate section backgrounds, soft panels |
| `--paper` | `#FBFCFD` | Page background |
| `--silt` | `#6B6A60` | Secondary text, captions, hairlines at 40% |
| `--marigold` | `#D8962A` | Used only as a fill for the "next milestone" marker and the focus ring offset. Never as text on light backgrounds (fails contrast). |

Rules: no gradients as decoration. No second accent colour. No pure black. Check every text pair for WCAG AA (4.5:1 body, 3:1 large). Add a contrast test script if easy.

This palette is deliberately institutional (navy, river blue, one warm marker). That is a choice: the goal is trust, not novelty.

## Type

- Headings: **Newsreader**, weights 500 and 600. Serif gives the academic tone and holds up at large sizes.
- Body and UI: **Public Sans**, weights 400, 500, 600. Plain, readable, built for institutional use.
- Self-host through `@fontsource/newsreader` and `@fontsource/public-sans`. Latin subset only.
- Scale (ratio about 1.25, laptop reading): body 17px/1.65, small 14px, h3 22px, h2 34px, h1 52px (hero) down to 36px on mobile. Use `clamp()`.
- Line length under 72 characters for body text.
- Sentence case for headings and buttons. No all-caps labels, no small labels above headings, no middle-dot strings, no arrows appended to links. Numbers appear only where the content is a sequence (the dates pipeline).
- Tabular numerals for countdown digits and dates.

## Layout

12-column grid, container 1120px, 24px gutters, left-aligned text everywhere. The only centred element is the committee hierarchy, because a tree reads best centred. Sections alternate `--paper` and `--shallows` backgrounds, with generous vertical space (96px desktop, 56px mobile).

Top of the page:

```
+------------------------------------------------------------+
| [IITR] [CSIR-IIP] [HKUST]      Conference name (small)     |   identity band
+------------------------------------------------------------+
| About  Themes  Dates  Speakers  Committee  Registration ... |   sticky nav
+------------------------------------------------------------+
| Conference title, large serif                               |
| Dates · venue as two plain lines                            |   hero, contour
| One-sentence description                                    |   lines behind
| [Register]  (link from Drive PDF)                           |
+------------------------------------------------------------+
```

(That wireframe uses a dot only as a sketch. In the real hero, dates and venue are separate lines.)

Cards: avoid a wall of identical rounded cards. Use cards only where items are parallel and compared (sponsorship tiers, people). Themes, hospitality and contact use ruled lists and plain blocks. Use one corner radius (4px) and no drop shadows. Use borders and spacing for structure.

## Motion

- Hero: one sequence on load (title, then lines draw in), about 800ms, once.
- No scroll-triggered fade-ups, no hover lifts.
- Motion that answers a click is fine: accordion open, mobile menu, smooth scroll.
- `prefers-reduced-motion`: everything static, instant.

## Imagery

Use IITR photos and logos supplied by the department. Until then, `make-placeholders` generates neutral grey-blue placeholder images with visible dimensions, so nobody mistakes them for final art. Photos get a consistent 4:3 or 4:5 crop per use, with the focal point set in the data.

## Responsive

Breakpoints: 1200, 900, 600. Laptop is the design target. Below 900 the nav collapses, grids go to two then one column, and the dates pipeline turns vertical. Touch targets at least 44px.

## Copy tone for placeholders

Realistic, short, clearly fake. No lorem ipsum walls. Example: "Placeholder: one-paragraph description of the conference goes here (60 to 80 words)." This tells the content editor exactly what is needed.
