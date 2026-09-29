"use client";

import { isStage, STAGES, STAGE_LABELS, type Stage } from "@/lib/backoffice/pipeline/labels";
import { fieldClass } from "./States";

interface Props {
  current: string;
  disabled?: boolean;
  onSelect: (stage: Stage) => void;
}

/** Any stage is reachable in one click (stepper from md up, select on mobile). */
export function StageStepper({ current, disabled = false, onSelect }: Props) {
  const currentIndex = isStage(current) ? STAGES.indexOf(current) : -1;
  const select = (stage: Stage) => {
    if (stage !== current) onSelect(stage);
  };

  return (
    <div>
      <ol aria-label="Stage" className="hidden gap-2 md:grid md:grid-cols-5">
        {STAGES.map((stage, index) => {
          const isCurrent = index === currentIndex;
          const isDone = currentIndex > -1 && index < currentIndex;
          return (
            <li key={stage}>
              <button
                type="button"
                onClick={() => select(stage)}
                disabled={disabled}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex h-full w-full flex-col items-start gap-1 rounded-md border px-3 py-2 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide disabled:cursor-wait disabled:opacity-60 ${
                  isCurrent
                    ? "border-tide bg-tide text-white"
                    : isDone
                      ? "border-tide/40 bg-tide/5 text-tide-dark hover:bg-tide/10"
                      : "border-slate-200 bg-white text-ink-muted hover:border-tide hover:text-ink"
                }`}
              >
                <span className="text-xs font-semibold opacity-80">Step {index + 1}</span>
                <span className="font-medium">{STAGE_LABELS[stage].label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="md:hidden">
        <label htmlFor="stage-select" className="text-sm font-medium text-ink">
          Stage
        </label>
        <select
          id="stage-select"
          value={currentIndex > -1 ? current : ""}
          disabled={disabled}
          onChange={(event) => {
            if (isStage(event.target.value)) select(event.target.value);
          }}
          className={fieldClass}
        >
          {currentIndex === -1 && (
            <option value="" disabled>
              Unknown
            </option>
          )}
          {STAGES.map((stage, index) => (
            <option key={stage} value={stage}>
              {index + 1}. {STAGE_LABELS[stage].label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
