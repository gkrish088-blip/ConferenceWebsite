# Supplied PDF content

The text import uses the three PDFs supplied in the project root. No external sources or images were added.

- `MemDesAI-2027_Poster 1.pptx.pdf`: conference title and short name, 6–8 December 2027 dates, IIT Roorkee venue, joint organizers and HKUST departmental collaboration, themes and three conveners.
- `MemTechAI_2027_Proposal.pdf`: background, audience, objectives, planned format, institutional responsibilities, convener affiliations and five proposed international advisory committee members.
- `Registration Fees - Sheet1.pdf`: seven attendee categories for each of early bird and standard registration, prices with and without accommodation, GST and payment notes, three-night accommodation provision, and four sponsorship packages with their supplied benefits.

The poster is used for the public conference name and dates. Its nine themes are represented in eight entries to preserve the approved theme limit: air purification and gas separation share one entry, retaining both descriptions. The proposal's four technical tracks are broader than the poster's theme list.

The advisory committee is explicitly labelled proposed. Planned proceedings, journal publication, partnerships and programme activities are described as aims or plans, rather than confirmed arrangements. Internal budget estimates, funding requests, projected attendance and broad planning quarters have not been converted into attendee fees, confirmed participation, or exact deadlines.

The PDFs provide calendar dates but no event start or end times. The countdown temporarily targets the beginning of 6 December 2027 in IST; `site.placeholder` and the conference milestone's placeholder flag remain true, and the visible date text states that the start time is to be confirmed. The previous invented end time has been removed. Organizers must supply exact times before launch. Submission and registration deadlines have not been invented from the proposal's planning quarters.

No emails, phone numbers, postal address, map URL, registration URL, abstract submission URL, named speakers, patron names, student council roster, or full organizing committee roster are supplied. These remain placeholders. HKUST advisory membership is not treated as confirmation of a separate leadership appointment or speaker role. Institutional URLs and all imagery remain placeholders.

Accommodation copy is populated only with the fee sheet's three-night arrangement. Booking instructions, availability, travel guidance and other hospitality information still need organizer input.

Content editors should update `src/content/*.json`. Registration table headings live in `feeColumns`; `feeGroups` contains each registration period and its category rows. Sponsorship supports three or four tiers with a variable number of benefits, so all supplied benefits can be retained.

## Verification

Content validation, TypeScript, all 23 tests, both launch builds and the responsive browser suite passed after the import. Screenshots in `screenshots/` cover 1440, 1024, 768 and 390 pixels. The browser suite checks keyboard interactions, reduced motion, countdown states, content-list extremes and external requests; it reported no external requests or browser errors. Countdown typography was adjusted to fit the full conference name.

ESLint and formatting checks for the changed source files passed. The repository-wide lint command still reports formatting warnings in 42 untouched files. Both builds also emit dependency annotation warnings from Zod. No dependency changes were made.

The placeholder report lists 51 records: about 4, committee 23, contact 3, dates 2, hospitality 7, registration 3, site 1 and speakers 8. Themes have no placeholder records. The remaining records include assets and partially completed sections; this is not a count of missing text fields. The site is not ready for the final no-placeholder launch check.
