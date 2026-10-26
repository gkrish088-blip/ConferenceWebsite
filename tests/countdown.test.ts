import { describe, expect, it } from "vitest";
import { formatConferenceDate, getCountdown } from "../src/lib/countdown";

const target = "2027-12-15T09:00:00+05:30";
const targetMs = Date.parse(target);
const eventEnd = "2027-12-17T18:00:00+05:30";

describe("countdown states", () => {
  it("counts down before the target", () => {
    expect(getCountdown(target, targetMs - 1000).state).toBe("before");
    expect(getCountdown(target, targetMs - 1000).seconds).toBe(1);
  });

  it("shows live at exactly zero", () => {
    expect(getCountdown(target, targetMs).state).toBe("live");
  });

  it("stays live after the start and before the end", () => {
    expect(getCountdown(target, targetMs + 1000, eventEnd).state).toBe("live");
  });

  it("shows ended after the configured event end", () => {
    expect(
      getCountdown(target, Date.parse(eventEnd) + 1000, eventEnd).state,
    ).toBe("ended");
  });

  it("formats display dates in Indian Standard Time", () => {
    expect(formatConferenceDate(target)).toBe("15 December 2027");
  });
});
