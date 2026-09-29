"use client";

import { useEffect, useRef, useState } from "react";
import { SEARCH_DEBOUNCE_MS } from "@/lib/backoffice/pipeline/config";
import { hasActiveFilters, type PipelineFilters as Filters } from "@/lib/backoffice/pipeline/filters";
import {
  isStage,
  isStatus,
  STAGES,
  STAGE_LABELS,
  STATUSES,
  STATUS_LABELS,
} from "@/lib/backoffice/pipeline/labels";
import { fieldClass, secondaryButtonClass } from "./States";

interface Props {
  filters: Filters;
  onChange: (change: Partial<Filters>) => void;
}

export function PipelineFilters({ filters, onChange }: Props) {
  const [text, setText] = useState(filters.q);
  const lastSent = useRef(filters.q);

  // External changes (clear filters, back/forward) win over the local text.
  useEffect(() => {
    if (filters.q !== lastSent.current) {
      lastSent.current = filters.q;
      setText(filters.q);
    }
  }, [filters.q]);

  useEffect(() => {
    const value = text.trim();
    if (value === lastSent.current) return;
    const timer = setTimeout(() => {
      lastSent.current = value;
      onChange({ q: value });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, onChange]);

  return (
    <form
      role="search"
      aria-label="Filter candidates"
      onSubmit={(event) => event.preventDefault()}
      className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end"
    >
      <div className="sm:col-span-2 lg:col-span-1">
        <label htmlFor="pipeline-search" className="text-sm font-medium text-ink">
          Search
        </label>
        <input
          id="pipeline-search"
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Name or email"
          autoComplete="off"
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="pipeline-status" className="text-sm font-medium text-ink">
          Status
        </label>
        <select
          id="pipeline-status"
          value={filters.status ?? ""}
          onChange={(event) =>
            onChange({ status: isStatus(event.target.value) ? event.target.value : null })
          }
          className={fieldClass}
        >
          <option value="">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status].label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="pipeline-stage" className="text-sm font-medium text-ink">
          Stage
        </label>
        <select
          id="pipeline-stage"
          value={filters.stage ?? ""}
          onChange={(event) =>
            onChange({ stage: isStage(event.target.value) ? event.target.value : null })
          }
          className={fieldClass}
        >
          <option value="">All stages</option>
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {STAGE_LABELS[stage].label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2 lg:col-span-1">
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() => onChange({ status: null, stage: null, q: "" })}
            className={`w-full lg:w-auto ${secondaryButtonClass}`}
          >
            Clear filters
          </button>
        )}
      </div>
    </form>
  );
}
