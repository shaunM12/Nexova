import { describe, expect, it } from "vitest";
import { daysSince, formatDate, formatRelative, isValidApiDate, parseApiDate } from "./dates";

describe("dates", () => {
  it("parses 3-digit and 6-digit fractional timestamps to the same millisecond", () => {
    const millis = parseApiDate("2026-09-01T10:00:00.747Z");
    const micros = parseApiDate("2026-09-01T10:00:00.747578Z");
    expect(micros.getTime()).toBe(millis.getTime());
  });

  it("throws on invalid dates", () => {
    expect(() => parseApiDate("not a date")).toThrow();
    expect(isValidApiDate("not a date")).toBe(false);
    expect(isValidApiDate("2026-02-28T20:04:32.114Z")).toBe(true);
  });

  it("counts whole days with an injected now", () => {
    const now = new Date("2026-09-29T12:00:00.000Z");
    expect(daysSince(new Date("2026-09-29T00:00:00.000Z"), now)).toBe(0);
    expect(daysSince(new Date("2026-09-28T11:00:00.000Z"), now)).toBe(1);
    expect(daysSince(new Date("2026-09-15T12:00:00.000Z"), now)).toBe(14);
    expect(daysSince(new Date("2026-10-01T00:00:00.000Z"), now)).toBe(0);
  });

  it("formats dates in English", () => {
    const now = new Date("2026-09-29T12:00:00.000Z");
    expect(formatDate(new Date("2026-09-01T12:00:00.000Z"))).toBe("Sep 1, 2026");
    expect(formatRelative(new Date("2026-09-26T12:00:00.000Z"), now)).toBe("3 days ago");
    expect(formatRelative(new Date("2026-09-29T10:00:00.000Z"), now)).toBe("today");
  });
});
