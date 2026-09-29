import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRecord, listNotes, listRecords } from "../api";
import type { PipelineFilters } from "../filters";
import { recordKeys } from "../queryKeys";

export function useRecords(filters: PipelineFilters) {
  return useQuery({
    queryKey: recordKeys.list(filters),
    queryFn: ({ signal }) => listRecords(filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useRecord(id: string) {
  return useQuery({
    queryKey: recordKeys.detail(id),
    queryFn: ({ signal }) => getRecord(id, signal),
  });
}

export function useNotes(id: string) {
  return useQuery({
    queryKey: recordKeys.notes(id),
    queryFn: ({ signal }) => listNotes(id, signal),
  });
}
