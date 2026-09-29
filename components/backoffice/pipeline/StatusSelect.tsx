"use client";

import { isStatus, STATUSES, STATUS_LABELS, type Status } from "@/lib/backoffice/pipeline/labels";
import { fieldClass } from "./States";

interface Props {
  current: string;
  disabled?: boolean;
  onSelect: (status: Status) => void;
}

export function StatusSelect({ current, disabled = false, onSelect }: Props) {
  const known = isStatus(current);
  return (
    <div>
      <label htmlFor="status-select" className="text-sm font-medium text-ink">
        Status
      </label>
      <select
        id="status-select"
        value={known ? current : ""}
        disabled={disabled}
        onChange={(event) => {
          const value = event.target.value;
          if (isStatus(value) && value !== current) onSelect(value);
        }}
        className={`${fieldClass} sm:max-w-xs`}
      >
        {!known && (
          <option value="" disabled>
            Unknown
          </option>
        )}
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status].label}
          </option>
        ))}
      </select>
    </div>
  );
}
