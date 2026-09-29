import { describe, expect, it, vi } from "vitest";
import {
  STAGES,
  STAGE_LABELS,
  STATUSES,
  STATUS_LABELS,
  stageLabel,
  statusLabel,
} from "./labels";

describe("labels", () => {
  it("every status has a human label and a tone", () => {
    for (const status of STATUSES) {
      expect(STATUS_LABELS[status].label).toBeTruthy();
      expect(STATUS_LABELS[status].label).not.toContain("_");
      expect(STATUS_LABELS[status].tone).toBeTruthy();
    }
  });

  it("every stage has a human label and a tone", () => {
    for (const stage of STAGES) {
      expect(STAGE_LABELS[stage].label).toBeTruthy();
      expect(STAGE_LABELS[stage].label).not.toContain("_");
      expect(STAGE_LABELS[stage].tone).toBeTruthy();
    }
  });

  it("matches the locked label tables", () => {
    expect(STATUSES.map((s) => STATUS_LABELS[s].label)).toEqual([
      "Received",
      "In progress",
      "Selected",
      "Discarded",
    ]);
    expect(STAGES.map((s) => STAGE_LABELS[s].label)).toEqual([
      "Pending review",
      "Under review",
      "Personal interview",
      "Technical interview",
      "Offer presented",
    ]);
  });

  it("unknown values render 'Unknown', never the raw string", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(statusLabel("on_hold").label).toBe("Unknown");
    expect(stageLabel("final_round").label).toBe("Unknown");
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
