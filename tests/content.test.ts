import { describe, expect, it } from "vitest";
import {
  about,
  committee,
  content,
  dates,
  hospitality,
  registration,
  speakers,
  themes,
} from "../src/content";
import {
  aboutSchema,
  committeeSchema,
  datesSchema,
  hospitalitySchema,
  speakersSchema,
  themesSchema,
} from "../src/content/schema";

describe("content records", () => {
  it("validates all content JSON and exposes the approved topic counts", () => {
    expect(content.site.nav.map((item) => item.id)).toEqual([
      "about",
      "themes",
      "dates",
      "speakers",
      "committee",
      "registration",
      "hospitality",
      "contact",
    ]);
    expect(about.institutions).toHaveLength(3);
    expect(themes.items).toHaveLength(8);
    expect(dates.milestones).toHaveLength(1);
    expect(speakers.guestsOfHonor).toHaveLength(1);
    expect(speakers.delegates).toHaveLength(6);
    expect(
      committee.groups.find((group) => group.id === "advisory")?.members,
    ).toHaveLength(5);
    expect(
      committee.groups.find((group) => group.id === "organising")?.members,
    ).toHaveLength(14);
    expect(
      committee.groups.find((group) => group.id === "students")?.members,
    ).toHaveLength(6);
    expect(registration.tiers).toHaveLength(4);
    expect(hospitality.items).toHaveLength(6);
  });

  it("requires alt text for institution images", () => {
    const invalid = structuredClone(about);
    (
      invalid.institutions[0].logo as {
        src: string;
        alt?: string;
        focus: string;
      }
    ).alt = "";
    expect(() => aboutSchema.parse(invalid)).toThrow();
  });

  it("rejects dates without the required IST offset", () => {
    expect(() =>
      datesSchema.parse({
        placeholder: true,
        emptyText: "Placeholder: no dates.",
        milestones: [
          {
            id: "sample",
            label: "Placeholder milestone",
            date: "2027-01-01T00:00:00Z",
            placeholder: true,
          },
        ],
      }),
    ).toThrow();
  });

  it("allows zero themes but rejects more than eight", () => {
    expect(
      themesSchema.parse({
        placeholder: true,
        emptyText: "Placeholder: no themes.",
        items: [],
      }).items,
    ).toHaveLength(0);
    const nine = Array.from({ length: 9 }, (_, index) => ({
      id: `theme-${index + 1}`,
      title: `Theme ${index + 1} placeholder`,
      summary: "Placeholder: theme summary.",
      placeholder: true,
    }));
    expect(() =>
      themesSchema.parse({
        placeholder: true,
        emptyText: "Placeholder: no themes.",
        items: nine,
      }),
    ).toThrow();
  });

  it("validates empty, single and maximum-sized content lists", () => {
    const dateItems = Array.from({ length: 12 }, (_, index) => ({
      id: `milestone-${index + 1}`,
      label: `Milestone ${index + 1} placeholder`,
      date: `2027-12-${String(index + 1).padStart(2, "0")}T09:00:00+05:30`,
      placeholder: true,
    }));
    for (const count of [0, 1, 12]) {
      expect(
        datesSchema.parse({
          placeholder: true,
          emptyText: "Placeholder: no dates.",
          milestones: dateItems.slice(0, count),
        }).milestones,
      ).toHaveLength(count);
    }

    for (const count of [0, 1, 12]) {
      const data = structuredClone(speakers);
      data.delegates = Array.from({ length: count }, (_, index) => ({
        ...speakers.delegates[0],
        id: `delegate-${index + 1}`,
      }));
      expect(speakersSchema.parse(data).delegates).toHaveLength(count);
    }

    const largeCommittee = structuredClone(committee);
    const organising = largeCommittee.groups.find(
      (group) => group.id === "organising",
    );
    if (!organising) throw new Error("Organising committee group is missing");
    organising.members = Array.from({ length: 60 }, (_, index) => ({
      ...committee.groups.find((group) => group.id === "organising")!
        .members[0],
      id: `organiser-${index + 1}`,
    }));
    expect(
      committeeSchema
        .parse(largeCommittee)
        .groups.find((group) => group.id === "organising")?.members,
    ).toHaveLength(60);

    const multipleImages = structuredClone(hospitality);
    multipleImages.items[0].images = Array.from({ length: 3 }, (_, index) => ({
      ...hospitality.items[0].images[0],
      alt: `Placeholder image ${index + 1}`,
    }));
    expect(
      hospitalitySchema.parse(multipleImages).items[0].images,
    ).toHaveLength(3);
  });
});
