import { describe, expect, it } from "vitest";
import { isStale } from "./stale";

const now = new Date("2026-09-29T12:00:00.000Z");
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();

describe("isStale", () => {
  it("13 days is not stale; 14 days is", () => {
    expect(isStale({ status: "in_progress", updated_at: daysAgo(13) }, now)).toBe(false);
    expect(isStale({ status: "in_progress", updated_at: daysAgo(14) }, now)).toBe(true);
    expect(isStale({ status: "received", updated_at: daysAgo(14) }, now)).toBe(true);
  });

  it("never flags Selected or Discarded", () => {
    expect(isStale({ status: "selected", updated_at: daysAgo(60) }, now)).toBe(false);
    expect(isStale({ status: "discarded", updated_at: daysAgo(60) }, now)).toBe(false);
  });

  it("works with 6-digit fractional timestamps", () => {
    const micro = daysAgo(14).replace("Z", "578Z");
    expect(isStale({ status: "received", updated_at: micro }, now)).toBe(true);
  });
});
