import { describe, expect, it } from "vitest";
import {
  applyFilterChange,
  DEFAULT_FILTERS,
  filtersToSearchParams,
  hasActiveFilters,
  parseFilters,
} from "./filters";

describe("filters", () => {
  it("round-trips through the URL", () => {
    const filters = { status: "in_progress", stage: "review", q: "marta", page: 3 } as const;
    expect(parseFilters(filtersToSearchParams(filters))).toEqual(filters);
  });

  it("omits defaults from the URL", () => {
    expect(filtersToSearchParams(DEFAULT_FILTERS).toString()).toBe("");
  });

  it("drops invalid values", () => {
    const parsed = parseFilters(new URLSearchParams("status=bogus&stage=final&page=-2&q=%20%20"));
    expect(parsed).toEqual(DEFAULT_FILTERS);
    expect(parseFilters(new URLSearchParams("page=abc")).page).toBe(1);
  });

  it("resets to page 1 when a filter changes, but not when paging", () => {
    const onPage3 = { ...DEFAULT_FILTERS, page: 3 };
    expect(applyFilterChange(onPage3, { status: "selected" }).page).toBe(1);
    expect(applyFilterChange(onPage3, { q: "ana" }).page).toBe(1);
    expect(applyFilterChange(onPage3, { page: 4 }).page).toBe(4);
  });

  it("knows when filters are active", () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, page: 2 })).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, q: "x" })).toBe(true);
  });
});
