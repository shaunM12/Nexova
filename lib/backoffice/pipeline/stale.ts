import { STALE_AFTER_DAYS } from "./config";
import { daysSince, parseApiDate } from "./dates";
import type { Status } from "./labels";

const STALE_ELIGIBLE: readonly Status[] = ["received", "in_progress"];

export function isStale(
  record: { status: string; updated_at: string },
  now: Date = new Date(),
): boolean {
  if (!(STALE_ELIGIBLE as readonly string[]).includes(record.status)) return false;
  return daysSince(parseApiDate(record.updated_at), now) >= STALE_AFTER_DAYS;
}
