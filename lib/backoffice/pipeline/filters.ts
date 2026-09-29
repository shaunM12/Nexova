import { isStage, isStatus, type Stage, type Status } from "./labels";

export interface PipelineFilters {
  status: Status | null;
  stage: Stage | null;
  q: string;
  page: number;
}

export const DEFAULT_FILTERS: PipelineFilters = { status: null, stage: null, q: "", page: 1 };

interface SearchParamsLike {
  get(name: string): string | null;
}

/** Invalid values are dropped: the API doesn't reject unknown filters, it silently ignores them. */
export function parseFilters(params: SearchParamsLike): PipelineFilters {
  const status = params.get("status");
  const stage = params.get("stage");
  const page = Number.parseInt(params.get("page") ?? "", 10);
  return {
    status: isStatus(status) ? status : null,
    stage: isStage(stage) ? stage : null,
    q: (params.get("q") ?? "").trim(),
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

export function filtersToSearchParams(filters: PipelineFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.q) params.set("q", filters.q);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

/** Any filter change returns to page 1 unless the change is the page itself. */
export function applyFilterChange(
  filters: PipelineFilters,
  change: Partial<PipelineFilters>,
): PipelineFilters {
  const next = { ...filters, ...change };
  if (change.page === undefined) next.page = 1;
  return next;
}

export function hasActiveFilters(filters: PipelineFilters): boolean {
  return filters.status !== null || filters.stage !== null || filters.q !== "";
}
