# Content schema

Every file in `src/content/` is JSON, validated by `src/content/schema.ts` (zod). The build fails if a file is invalid. Records that are fake carry `"placeholder": true`.

## Rules

- IDs are lowercase kebab-case and never change once published (anchors and tests use them).
- Order in an array is display order.
- Images: `{ "src": "/assets/images/x.webp", "alt": "...", "focus": "center" }`. `alt` is required. Use `"alt": ""` only if decorative and say so with `"decorative": true`.
- Dates: ISO 8601 with `+05:30`. Display text is generated from them. Do not store pre-formatted dates, except `site.datesText` which is a human phrase like "15 to 17 December 2027".
- Text fields use RichText: blank line = new paragraph, `**bold**`, `[label](https://...)`, `[label](#anchor)`. No HTML.
- External links must be `https://`. `#` is allowed only on records marked placeholder.
- Max 8 themes. Max 12 date milestones (soft, the layout is tested to 12).

## Files and shapes

### site.json

```json
{
  "name": "Placeholder: International Conference on Hydrology",
  "shortName": "Placeholder 2027",
  "tagline": "Placeholder: one sentence on what the conference is about.",
  "datesText": "15 to 17 December 2027",
  "venue": "IIT Roorkee, Uttarakhand, India",
  "eventStart": "2027-12-15T09:00:00+05:30",
  "eventEnd": "2027-12-17T18:00:00+05:30",
  "nav": [
    { "id": "about", "label": "About" },
    { "id": "themes", "label": "Themes" },
    { "id": "dates", "label": "Dates" },
    { "id": "speakers", "label": "Speakers" },
    { "id": "committee", "label": "Committee" },
    { "id": "registration", "label": "Registration" },
    { "id": "hospitality", "label": "Hospitality" },
    { "id": "contact", "label": "Contact" }
  ],
  "landing": {
    "enterLabel": "Enter site",
    "comingSoon": "Full website coming soon.",
    "liveText": "Conference is live",
    "endedText": "Conference has ended. Thank you for joining."
  },
  "footer": { "copyright": "Placeholder copyright line" },
  "placeholder": true
}
```

`eventEnd` is optional. Remove it if not wanted.

### about.json

```json
{
  "description": "Placeholder: 2 or 3 paragraphs describing the event.",
  "institutions": [
    {
      "id": "iitr",
      "name": "Indian Institute of Technology Roorkee",
      "logo": "/assets/logos/iitr.svg",
      "description": "Placeholder: about 60 words.",
      "url": "https://...",
      "placeholder": true
    },
    {
      "id": "csir-iip",
      "name": "CSIR-Indian Institute of Petroleum",
      "logo": "/assets/logos/csir-iip.svg",
      "...": "..."
    },
    {
      "id": "hkust",
      "name": "The Hong Kong University of Science and Technology",
      "logo": "/assets/logos/hkust.svg",
      "...": "..."
    }
  ]
}
```

Exactly three institutions for now. Names above are the official expansions as understood. Confirm spelling with the department.

### themes.json

```json
{
  "items": [
    {
      "id": "theme-1",
      "title": "Placeholder theme",
      "summary": "One line.",
      "placeholder": true
    }
  ]
}
```

### dates.json

```json
{
  "milestones": [
    {
      "id": "abstract-open",
      "label": "Abstract submission opens",
      "date": "2027-03-01T00:00:00+05:30",
      "note": "",
      "showTime": false,
      "placeholder": true
    },
    {
      "id": "abstract-deadline",
      "label": "Abstract deadline",
      "date": "2027-06-15T23:59:00+05:30",
      "placeholder": true
    },
    {
      "id": "acceptance",
      "label": "Acceptance notification",
      "date": "2027-08-01T00:00:00+05:30",
      "placeholder": true
    },
    {
      "id": "early-registration",
      "label": "Early registration closes",
      "date": "2027-09-30T23:59:00+05:30",
      "placeholder": true
    },
    {
      "id": "conference",
      "label": "Conference",
      "date": "2027-12-15T09:00:00+05:30",
      "placeholder": true
    }
  ]
}
```

Use clearly fake dates. They are all flagged.
`showTime` is optional and defaults to `false`. Milestones display as `1 March 2027`; set `showTime: true` only when the time should also be shown. Keep placeholder `note` fields empty until there is approved note text.

### speakers.json

```json
{
  "guestsOfHonor": [
    {
      "id": "goh-1",
      "name": "Placeholder name",
      "role": "Guest of Honor",
      "affiliation": "Placeholder institution",
      "bio": "One line.",
      "photo": {
        "src": "/placeholders/portrait.svg",
        "alt": "Portrait of placeholder speaker"
      },
      "placeholder": true
    }
  ],
  "delegates": [
    {
      "id": "delegate-1",
      "name": "...",
      "affiliation": "...",
      "photo": { "src": "...", "alt": "..." },
      "placeholder": true
    }
  ],
  "emptyDelegatesText": "To be announced."
}
```

### committee.json

```json
{
  "groups": [
    {
      "id": "patron",
      "title": "Patron",
      "layout": "featured",
      "members": [
        {
          "id": "p1",
          "name": "Placeholder",
          "role": "Director, IIT Roorkee",
          "photo": { "src": "...", "alt": "..." },
          "placeholder": true
        }
      ]
    },
    {
      "id": "leadership",
      "title": "",
      "layout": "pair",
      "members": [
        {
          "id": "l1",
          "name": "...",
          "role": "Director, CSIR-IIP",
          "placeholder": true
        },
        {
          "id": "l2",
          "name": "...",
          "role": "Professor, HKUST",
          "placeholder": true
        }
      ]
    },
    {
      "id": "conveners",
      "title": "Conveners",
      "layout": "grid",
      "members": ["...four..."]
    },
    {
      "id": "advisory",
      "title": "Advisory committee",
      "layout": "list",
      "members": ["..."]
    },
    {
      "id": "organising",
      "title": "Organising committee",
      "layout": "list",
      "members": ["..."]
    },
    {
      "id": "students",
      "title": "Student council",
      "layout": "grid",
      "members": [
        {
          "id": "s1",
          "name": "...",
          "role": "Placeholder role",
          "placeholder": true
        }
      ]
    }
  ]
}
```

Rules: `featured` has exactly 1 member, `pair` exactly 2, `grid` 1 to 12, `list` 1 to 100. Member fields: `name`, `role` or `affiliation`, optional `photo`, optional `url`.

### registration.json

```json
{
  "details": "Placeholder: registration details.",
  "sponsorshipHeading": "Sponsorship",
  "sponsorshipIntro": "Placeholder: one-line sponsorship introduction.",
  "links": [
    { "label": "Register", "url": "#", "placeholder": true },
    { "label": "Submit an abstract", "url": "#", "placeholder": true }
  ],
  "tiers": [
    {
      "id": "tier-1",
      "name": "Placeholder tier",
      "amount": "Placeholder amount",
      "benefits": ["Placeholder benefit"],
      "placeholder": true
    }
  ]
}
```

Links come from the professor's Drive PDF. Do not invent URLs.

### hospitality.json

```json
{
  "intro": "Placeholder intro. Links like [Accommodation](#hospitality-accommodation) open the matching item.",
  "items": [
    {
      "id": "about-roorkee",
      "title": "About Roorkee",
      "body": "Placeholder text.",
      "images": [],
      "placeholder": true
    },
    {
      "id": "exit-delhi-t3",
      "title": "How To Exit Delhi Airport T3",
      "body": "...",
      "placeholder": true
    },
    {
      "id": "reach-iitr",
      "title": "How To Reach IIT Roorkee",
      "body": "...",
      "placeholder": true
    },
    {
      "id": "accommodation",
      "title": "Accommodation",
      "body": "...",
      "placeholder": true
    },
    {
      "id": "life-and-food",
      "title": "Life And Food At IIT Roorkee",
      "body": "...",
      "placeholder": true
    },
    {
      "id": "uttarakhand",
      "title": "Uttarakhand Destination",
      "body": "...",
      "placeholder": true
    }
  ]
}
```

The anchor for an item is `#hospitality-` plus its id, so `accommodation` gives `#hospitality-accommodation`.

### contact.json

```json
{
  "persons": [
    {
      "id": "c1",
      "name": "Placeholder",
      "role": "Conference secretary",
      "email": "placeholder@example.org",
      "phone": "",
      "placeholder": true
    }
  ],
  "address": "Department of Hydrology, IIT Roorkee, Roorkee, Uttarakhand, India",
  "mapUrl": "https://...",
  "placeholder": true
}
```

## Scripts

- `validate-content`: runs the schemas, prints file and field for every error.
- `report-placeholders`: groups every `placeholder: true` record by file, with counts.
- `check-launch`: exits non-zero if any placeholder remains, any `url` is `#`, or any image `src` starts with `/placeholders/`. This is the gate before real launch.
