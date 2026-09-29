export const STATUSES = ["received", "in_progress", "selected", "discarded"] as const;
export type Status = (typeof STATUSES)[number];

export const STAGES = [
  "pending",
  "review",
  "personal_interview",
  "technical_interview",
  "offer_presented",
] as const;
export type Stage = (typeof STAGES)[number];

export type Tone = "neutral" | "info" | "success" | "muted" | "warning";

export interface LabelInfo {
  label: string;
  tone: Tone;
}

export const STATUS_LABELS: Record<Status, LabelInfo> = {
  received: { label: "Received", tone: "neutral" },
  in_progress: { label: "In progress", tone: "info" },
  selected: { label: "Selected", tone: "success" },
  discarded: { label: "Discarded", tone: "muted" },
};

export const STAGE_LABELS: Record<Stage, LabelInfo> = {
  pending: { label: "Pending review", tone: "neutral" },
  review: { label: "Under review", tone: "info" },
  personal_interview: { label: "Personal interview", tone: "info" },
  technical_interview: { label: "Technical interview", tone: "info" },
  offer_presented: { label: "Offer presented", tone: "success" },
};

export const UNKNOWN_LABEL: LabelInfo = { label: "Unknown", tone: "neutral" };

export function isStatus(value: unknown): value is Status {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

export function isStage(value: unknown): value is Stage {
  return typeof value === "string" && (STAGES as readonly string[]).includes(value);
}

export function statusLabel(value: string): LabelInfo {
  if (isStatus(value)) return STATUS_LABELS[value];
  console.warn(`[pipeline] Unknown status value from API: "${value}"`);
  return UNKNOWN_LABEL;
}

export function stageLabel(value: string): LabelInfo {
  if (isStage(value)) return STAGE_LABELS[value];
  console.warn(`[pipeline] Unknown stage value from API: "${value}"`);
  return UNKNOWN_LABEL;
}
