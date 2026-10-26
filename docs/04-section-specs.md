# Section specs

All text and images come from content files. Names below match `docs/05-content-schema.md`. Nav order is the order here.

## Identity band and nav (layout)
- Band: three institution marks and the short conference name. Marks come from `about.json` institutions.
- Nav: Hospitality is just another anchor. Items: About, Themes, Dates, Speakers, Committee, Registration, Hospitality, Contact. Sticky. Active item has an underline in `--river`.
- Mobile: menu button, full-width panel, closes on selection.

## Hero (top info)
- Content: `site.json` (name, tagline, event dates text, venue), a short description, an optional primary link slot ("Register" or similar) that points to a Drive PDF link in `registration.json`.
- Layout: left-aligned text, contour-line SVG behind it, low contrast so text stays readable.
- Acceptance: the title wraps cleanly at 390px and at 1440px; dates and venue are readable without the background interfering.

## About (`#about`)
- A description of 2 or 3 paragraphs (RichText).
- Then three institution blocks: logo, name, a short description, optional external link. Laid out as three columns on desktop, stacked on mobile. Separated by hairlines, not cards.
- Acceptance: with a very long description (300 words) in one institution, the other two do not stretch awkwardly.

## Themes (`#themes`)
- Up to 8 items: title and one-line description. Two columns on desktop, one on mobile, ruled list.
- No numbering and no icons. The schema rejects more than 8.
- Acceptance: looks balanced at 3, 5, 7 and 8 items.

## Dates (`#dates`)
- A pipeline drawn with SVG: a river-like line with a node per milestone. Labels alternate above and below on desktop. Vertical on mobile.
- Each milestone: label, date (formatted in IST), optional note.
- Status computed in IST: past (filled node), next (marigold node, slightly larger, one only), upcoming (outlined).
- Must scale from 1 to 12 milestones without overlap. Long labels wrap.
- Acceptance: a test with fixed "today" proves exactly one milestone is "next" and none is "next" when all are past.

## Speakers (`#speakers`)
- Guest of Honor: large photo, name, role and institution, one-line bio. Supports one or more.
- Delegates: grid of photo, name, affiliation. Photos 4:5. A missing photo falls back to the placeholder portrait.
- Empty delegates list shows a plain sentence from content (e.g. "To be announced.").

## Committee (`#committee`)
Data lives in `committee.json` as an ordered array of groups. Each group has `title`, `layout`, `members`.
- `featured`: one large person block (Patron: IITR Director).
- `pair`: two boxes directly below the Patron, joined to it by CSS connector lines (CSIR-IIP Director, HKUST professor).
- `grid`: person blocks, 2 to 4 columns (four Conveners).
- `list`: compact names with affiliations in 2 or 3 columns (Advisory, Organising). Built for 5 to 60 names.
- `grid` with `role`: Student Council, role shown under the name.
- The tree (Patron to pair) is centred. Everything else is left-aligned.
- Acceptance: switching Organising from 6 to 60 names changes nothing but length. Adding a new group type is not needed for this phase.

## Registration (`#registration`)
- Details text (RichText), for example fee notes and how to register.
- Sponsorship tiers: parallel columns (3 to 4), each with name, amount text, benefit list. Tiers are the one place cards are justified, because the reader compares them. Clear hierarchy: tier name larger than amount.
- Link slots: buttons built from `registration.links` ({label, url}). These come from the Drive PDF. Placeholder URL is `#`, flagged, and `check:launch` fails on `#` links.

## Hospitality (`#hospitality`)
- Intro paragraph (RichText) that can link to the subheadings.
- Six subheadings, as given, in this order: About Roorkee; How To Exit Delhi Airport T3; How To Reach IIT Roorkee; Accommodation; Life And Food At IIT Roorkee; Uttarakhand Destination.
- Each subheading is an accordion row with a plus/minus indicator. Opening reveals body text (RichText) and optional images below the heading. All closed by default; independent toggling; deep links open the item.
- Acceptance: with all six closed the section is about one screen tall. With all six open nothing overlaps.

## Contact (`#contact`)
- Contact persons (name, role, email, phone optional), postal address, a map link as a plain link.
- No form. Emails are plain `mailto:` links.

## Footer
- Institution marks, short name, contact email, copyright line from content.

## Landing page (`/` in landing mode, `/countdown/` in full mode)
- Full viewport. Conference name, tagline, then the countdown as the dominant element: days, hours, minutes, seconds in very large tabular numerals with plain labels.
- Below: date and venue (IST shown as "IST"), and the three institution marks.
- States: before (counting), live ("Conference is live"), ended (only if `eventEnd` set; text from content).
- Button: "Enter site" shown only in `full` mode; in `landing` mode show nothing or a plain line from content ("Full website coming soon").
- Motion: contour lines draw in once on load. Nothing else animates except the digits changing. Static under reduced motion.
- Fits one screen at 1440x800 and 390x844 without scrolling.
