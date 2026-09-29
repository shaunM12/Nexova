import type { PipelineFilters } from "./filters";

export const recordKeys = {
  all: ["records"] as const,
  lists: () => [...recordKeys.all, "list"] as const,
  list: (filters: PipelineFilters) => [...recordKeys.lists(), filters] as const,
  details: () => [...recordKeys.all, "detail"] as const,
  detail: (id: string) => [...recordKeys.details(), id] as const,
  notes: (id: string) => [...recordKeys.detail(id), "notes"] as const,
};
