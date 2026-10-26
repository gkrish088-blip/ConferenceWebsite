import { describe, expect, it } from "vitest";
import { milestoneSchema } from "../src/content/schema";
import {
  getMilestoneStatuses,
  formatMilestoneDate,
  getRiverPath,
  getRiverPoints,
  getVerticalRiverPath,
} from "../src/lib/dates";

const now = Date.parse("2027-06-15T12:00:00+05:30");

describe("milestone states", () => {
  it("marks past, next and upcoming milestones", () => {
    const result = getMilestoneStatuses(
      [
        { date: "2027-03-01T00:00:00+05:30" },
        { date: "2027-06-15T23:59:00+05:30" },
        { date: "2027-08-01T00:00:00+05:30" },
      ],
      now,
    );
    expect(result.map((item) => item.status)).toEqual([
      "past",
      "next",
      "upcoming",
    ]);
    expect(result.filter((item) => item.status === "next")).toHaveLength(1);
  });

  it("marks an exact-time milestone next", () => {
    const result = getMilestoneStatuses(
      [{ date: new Date(now).toISOString() }],
      now,
    );
    expect(result[0].status).toBe("next");
  });

  it("does not invent a next milestone when all dates are past", () => {
    const result = getMilestoneStatuses(
      [
        { date: "2027-03-01T00:00:00+05:30" },
        { date: "2027-06-15T11:59:59+05:30" },
      ],
      now,
    );
    expect(result.every((item) => item.status === "past")).toBe(true);
    expect(result.some((item) => item.status === "next")).toBe(false);
  });

  it.each([1, 5, 12])(
    "supports %i milestones with exactly one next state",
    (count) => {
      const items = Array.from({ length: count }, (_, index) => ({
        date: new Date(now + index * 86_400_000).toISOString(),
      }));
      const result = getMilestoneStatuses(items, now);
      expect(result.filter((item) => item.status === "next")).toHaveLength(1);
      expect(getRiverPoints(count)).toHaveLength(count);
      expect(getVerticalRiverPath(count)).not.toContain("NaN");
    },
  );
});

describe("river geometry", () => {
  it("centres a single milestone and makes a horizontal path", () => {
    const points = getRiverPoints(1);
    expect(points[0].x).toBe(560);
    expect(getRiverPath(points)).toContain("C");
  });

  it("spaces a twelve milestone pipeline monotonically", () => {
    const points = getRiverPoints(12);
    expect(
      points.every(
        (point, index) => index === 0 || point.x > points[index - 1].x,
      ),
    ).toBe(true);
    expect(getRiverPath(points)).not.toContain("NaN");
  });

  it("insets end nodes by half a label width and spans the viewBox", () => {
    const points = getRiverPoints(5);
    const path = getRiverPath(points);
    expect(points[0].x).toBe(90);
    expect(points.at(-1)?.x).toBe(1030);
    expect(path.startsWith("M 0 ")).toBe(true);
    expect(path.endsWith(`1120 ${points.at(-1)?.y}`)).toBe(true);
  });

  it("supports one node and keeps a twelve-node river in bounds", () => {
    const single = getRiverPoints(1);
    const many = getRiverPoints(12);
    expect(single[0].x).toBe(560);
    expect(getRiverPath(single)).toMatch(/^M 0 .* C .* 1120 /);
    expect(
      many.every(({ x, y }) => x >= 90 && x <= 1030 && y >= 186 && y <= 234),
    ).toBe(true);
  });
});

describe("milestone display dates", () => {
  it("uses the full month name and hides time by default", () => {
    expect(formatMilestoneDate("2027-03-01T00:00:00+05:30")).toBe(
      "1 March 2027",
    );
  });

  it("includes IST time only when requested", () => {
    expect(formatMilestoneDate("2027-03-01T00:00:00+05:30", true)).toContain(
      "IST",
    );
  });

  it("defaults showTime to false and accepts an explicit time display", () => {
    const milestone = {
      id: "date-test",
      label: "Milestone placeholder",
      date: "2027-03-01T00:00:00+05:30",
      note: "",
      placeholder: true,
    };
    expect(milestoneSchema.parse(milestone).showTime).toBe(false);
    expect(
      milestoneSchema.parse({ ...milestone, showTime: true }).showTime,
    ).toBe(true);
  });
});
