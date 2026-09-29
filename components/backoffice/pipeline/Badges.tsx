import { stageLabel, statusLabel, type Tone } from "@/lib/backoffice/pipeline/labels";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-300",
  info: "bg-sky-50 text-sky-800 ring-sky-200",
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  muted: "bg-white text-slate-500 ring-slate-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-300",
};

function Badge({ label, tone, prefix }: { label: string; tone: Tone; prefix?: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_CLASSES[tone]}`}
    >
      {prefix && <span className="sr-only">{prefix}: </span>}
      {label}
    </span>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const { label, tone } = statusLabel(value);
  return <Badge label={label} tone={tone} prefix="Status" />;
}

export function StageBadge({ value }: { value: string }) {
  const { label, tone } = stageLabel(value);
  return <Badge label={label} tone={tone} prefix="Stage" />;
}

export function StaleBadge() {
  return <Badge label="Stale" tone="warning" />;
}
