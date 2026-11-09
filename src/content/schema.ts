import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const placeholder = z.object({ placeholder: z.boolean() });
const richText = z.string().min(1);
const imageRef = z.object({
  src: z.string().regex(/^\/(?:assets|placeholders)\//),
  alt: z.string().min(1),
  focus: z.enum(["center", "top", "right", "bottom", "left"]),
});
const offsetDate = z.string().refine((value) => {
  return (
    /^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d)?(?:\.\d+)?\+05:30$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}, "Expected a valid ISO 8601 date with the +05:30 offset");

const navIds = [
  "about",
  "themes",
  "dates",
  "speakers",
  "committee",
  "registration",
  "hospitality",
  "contact",
];
export const siteSchema = z
  .object({
    name: z.string().min(1),
    shortName: z.string().min(1),
    logo: imageRef.optional(),
    tagline: richText,
    datesText: z.string().min(1),
    venue: z.string().min(1),
    eventStart: offsetDate,
    eventEnd: offsetDate.optional(),
    nav: z
      .array(z.object({ id: slug, label: z.string().min(1) }))
      .length(8)
      .refine(
        (items) => items.map((item) => item.id).join("|") === navIds.join("|"),
        "Navigation order must match the approved one-page section order",
      ),
    landing: z.object({
      enterLabel: z.string(),
      comingSoon: z.string(),
      liveText: z.string(),
      endedText: z.string(),
      countdownUnits: z.object({
        days: z.string(),
        hours: z.string(),
        minutes: z.string(),
        seconds: z.string(),
      }),
    }),
    accessibility: z.object({
      openMenuLabel: z.string(),
      closeMenuLabel: z.string(),
      navigationLabel: z.string(),
      externalLinkText: z.string(),
      countdownLabel: z.string(),
      skipLinkLabel: z.string(),
    }),
    footer: z.object({ copyright: z.string() }),
  })
  .merge(placeholder);

export const institutionSchema = z
  .object({
    id: slug,
    name: z.string().min(1),
    logo: imageRef,
    description: richText,
    url: z
      .string()
      .refine(
        (value) =>
          value === "#" ||
          (URL.canParse(value) && new URL(value).protocol === "https:"),
      ),
    linkLabel: z.string().min(1),
  })
  .merge(placeholder);

export const aboutSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: richText.refine(
      (value) =>
        value.split(/\n\s*\n/).length >= 2 &&
        value.split(/\n\s*\n/).length <= 3,
    ),
    institutions: z
      .array(institutionSchema)
      .length(3)
      .refine(
        (items) =>
          items.map((item) => item.id).join("|") === "iitr|csir-iip|hkust",
        "The three institutions must remain in the approved order",
      ),
  })
  .merge(placeholder);

export const themesSchema = z
  .object({
    title: z.string().min(1).optional(),
    emptyText: z.string(),
    items: z
      .array(
        z
          .object({ id: slug, title: z.string().min(1), summary: richText })
          .merge(placeholder),
      )
      .max(10),
  })
  .merge(placeholder);

export const milestoneSchema = z
  .object({
    id: slug,
    label: z.string().min(1),
    date: offsetDate,
    note: z.string().optional(),
    showTime: z.boolean().optional().default(false),
  })
  .merge(placeholder);

export const datesSchema = z
  .object({
    emptyText: z.string(),
    milestones: z.array(milestoneSchema).max(12),
  })
  .merge(placeholder);

const speakerBase = z
  .object({
    id: slug,
    name: z.string().min(1),
    photo: imageRef.optional(),
  })
  .merge(placeholder);

export const speakersSchema = z
  .object({
    guestHeading: z.string(),
    delegatesHeading: z.string(),
    guestsOfHonor: z
      .array(
        speakerBase.extend({
          role: z.string().min(1),
          affiliation: z.string().min(1),
          bio: richText,
        }),
      )
      .min(1),
    delegates: z.array(speakerBase.extend({ affiliation: z.string().min(1) })),
    placeholderPhoto: imageRef,
    emptyDelegatesText: z.string(),
  })
  .merge(placeholder);

const memberSchema = z
  .object({
    id: slug,
    name: z.string().min(1),
    role: z.string().optional(),
    affiliation: z.string().optional(),
    photo: imageRef.optional(),
  })
  .merge(placeholder)
  .refine(
    (member) => Boolean(member.role || member.affiliation),
    "A member needs a role or affiliation",
  );

const committeeGroupSchema = z.discriminatedUnion("layout", [
  z.object({
    id: slug,
    title: z.string(),
    layout: z.literal("featured"),
    members: z.array(memberSchema).length(1),
  }),
  z.object({
    id: slug,
    title: z.string(),
    layout: z.literal("pair"),
    members: z.array(memberSchema).length(2),
  }),
  z.object({
    id: slug,
    title: z.string(),
    layout: z.literal("grid"),
    members: z.array(memberSchema).min(1).max(12),
  }),
  z.object({
    id: slug,
    title: z.string(),
    layout: z.literal("list"),
    members: z.array(memberSchema).min(1).max(100),
  }),
]);

export const committeeSchema = z.object({
  groups: z.array(committeeGroupSchema).length(6),
});

export const registrationSchema = z
  .object({
    details: richText,
    feeColumns: z.object({
      category: z.string().min(1),
      withoutAccommodation: z.string().min(1),
      withAccommodation: z.string().min(1),
    }),
    feeGroups: z
      .array(
        z.object({
          id: slug,
          title: z.string().min(1),
          rows: z
            .array(
              z.object({
                category: z.string().min(1),
                withoutAccommodation: z.string().min(1),
                withAccommodation: z.string().min(1),
              }),
            )
            .min(1),
          placeholder: z.boolean(),
        }),
      )
      .min(1),
    sponsorshipHeading: z.string().min(1),
    sponsorshipIntro: richText,
    links: z
      .array(
        z
          .object({
            label: z.string().min(1),
            url: z
              .string()
              .refine(
                (value) =>
                  value === "#" ||
                  (URL.canParse(value) && new URL(value).protocol === "https:"),
              ),
          })
          .merge(placeholder),
      )
      .length(2),
    tiers: z
      .array(
        z
          .object({
            id: slug,
            name: z.string().min(1),
            amount: z.string().min(1),
            benefits: z.array(z.string().min(1)).min(1),
          })
          .merge(placeholder),
      )
      .min(3)
      .max(4),
  })
  .merge(placeholder);

export const hospitalitySchema = z
  .object({
    intro: richText,
    items: z
      .array(
        z.object({
          id: slug,
          title: z.string().min(1),
          body: richText,
          images: z.array(imageRef),
          placeholder: z.boolean(),
        }),
      )
      .length(6)
      .refine(
        (items) =>
          items.map((item) => `${item.id}:${item.title}`).join("|") ===
          [
            "about-roorkee:About Roorkee",
            "exit-delhi-t3:How To Exit Delhi Airport T3",
            "reach-iitr:How To Reach IIT Roorkee",
            "accommodation:Accommodation",
            "life-and-food:Life And Food At IIT Roorkee",
            "uttarakhand:Uttarakhand Destination",
          ].join("|"),
        "Hospitality topics and order must match the approved labels",
      ),
  })
  .merge(placeholder);

export const contactSchema = z
  .object({
    persons: z
      .array(
        z
          .object({
            id: slug,
            name: z.string().min(1),
            role: z.string().min(1),
            email: z.string().email(),
            phone: z.string().optional(),
          })
          .merge(placeholder),
      )
      .length(2),
    address: richText,
    mapUrl: z
      .string()
      .refine(
        (value) =>
          value === "#" ||
          (URL.canParse(value) && new URL(value).protocol === "https:"),
      ),
    mapLabel: z.string().min(1),
  })
  .merge(placeholder);
