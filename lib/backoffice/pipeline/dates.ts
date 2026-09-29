const MS_PER_DAY = 86_400_000;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const relativeFormatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

/** API timestamps mix 3 and 6 fractional digits; normalize to milliseconds before parsing. */
export function parseApiDate(value: string): Date {
  const normalized = value.replace(/(\.\d{3})\d+/, "$1");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid API date: "${value}"`);
  }
  return date;
}

export function isValidApiDate(value: string): boolean {
  try {
    parseApiDate(value);
    return true;
  } catch {
    return false;
  }
}

export function daysSince(date: Date, now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / MS_PER_DAY));
}

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatRelative(date: Date, now: Date = new Date()): string {
  return relativeFormatter.format(-daysSince(date, now), "day");
}
