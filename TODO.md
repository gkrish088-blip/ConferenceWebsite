# Content to confirm with the organizers

Replace placeholders in `src/content/*.json` only with confirmed, approved information. Keep placeholder flags accurate until replacement data is ready.

- [x] Retire the public countdown page and its separate launch build.

## Event identity and programme

- [x] Populate full and short conference names and description from the supplied poster and proposal.
- [x] Populate 6â€“8 December 2027 and IIT Roorkee venue from the poster.
- [ ] Confirm exact start/end times and room or building details.
- [x] Connect the supplied IIT Roorkee, CSIR-IIP and HKUST logos throughout the site.
- [x] Add verified official institution websites to the About links and every logo.
- [ ] Confirm institution descriptions with the organizers.
- [x] Publish the supplied About copy and ten conference themes on both design branches.
- [ ] Supply abstract and registration milestone dates; only the conference date is currently documented.

## Speakers and committee

- [ ] Guest of Honor name, role, affiliation, approved biography and portrait.
- [ ] Six delegate names, affiliations and approved portraits.
- [ ] Patron and both institution leadership names and roles.
- [x] Populate the three named conveners and their affiliations from the poster and proposal.
- [x] Publish portraits and details for the four international advisors, six national advisors, and thirteen IIT Roorkee organisers from the supplied committee rosters.
- [x] Publish the five student Website Development Team members with their supplied photos.

## Registration and contact

- [x] Populate early bird and standard fees for all seven categories, GST, payment method and accommodation notes.
- [ ] Supply registration deadlines, payment instructions, registration URL and abstract submission URL.
- [x] Populate all four sponsorship packages, amounts and supplied benefits.
- [ ] Two contact persons, roles and email addresses.
- [ ] Official mailing address and map URL.

## Hospitality

- [x] Populate the three-night accommodation arrangement from the registration fee sheet.
- [x] Publish sourced travel and campus guidance with credited photographs.
- [ ] Confirm conference transfers, campus reporting point, accommodation allocation and dates, accessibility, catering, and delegate access to Wi-Fi and facilities.
- [ ] One approved image and useful alt text for each topic.
- [ ] Confirm airport, travel, accommodation, campus, food and regional visitor guidance.

## Launch review

- [ ] Replace placeholder portraits with approved assets.
- [ ] Run `npm run validate:content`, `npm run report:placeholders`, the production build and the verification checklist.
- [ ] Run `npm run check:launch` after every placeholder has been replaced.


## 15 November 2026 refresh

- [x] Extract and prioritize the supplied ODT identity assets; add all seven portraits.
- [x] Add campus galleries, membrane imagery and Uttarakhand tourism photographs.
- [x] Default to a light theme; keep optional dark interactive presentation.
- [x] Generate real HTML and hydrate each route.
- [x] Isolate the supplied multipage code on `codex/multipage-design`.
- [ ] Organizer approval of remaining placeholder speakers, committee, contacts, dates, registration links and travel details.
- [ ] Set deployment-specific SITE_ORIGIN for canonical links and sitemap.
- [ ] Deploy the refreshed builds to the chosen hosting targets.

- [x] Split the static conference into section pages and keep Contact on the final navigation page.
