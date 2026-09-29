"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { errorMessage } from "@/lib/backoffice/pipeline/api";
import {
  applyFilterChange,
  filtersToSearchParams,
  hasActiveFilters,
  parseFilters,
  type PipelineFilters as Filters,
} from "@/lib/backoffice/pipeline/filters";
import { useRecords } from "@/lib/backoffice/pipeline/hooks";
import { GuardedLink } from "../shell/GuardedLink";
import { CandidateResults } from "./CandidateResults";
import { Pagination } from "./Pagination";
import { PipelineFilters } from "./PipelineFilters";
import { EmptyState, ErrorState, ListSkeleton, primaryButtonClass, secondaryButtonClass } from "./States";

export function PipelineList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const query = useRecords(filters);

  const changeFilters = useCallback(
    (change: Partial<Filters>) => {
      const next = applyFilterChange(filters, change);
      const qs = filtersToSearchParams(next).toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      // Typing in search replaces history; deliberate filter/page changes are back-navigable.
      if ("q" in change && Object.keys(change).length === 1) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [filters, pathname, router],
  );

  const clearFilters = () => changeFilters({ status: null, stage: null, q: "" });
  const data = query.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const firstShown = data && data.data.length ? (data.page - 1) * data.limit + 1 : 0;
  const lastShown = data ? firstShown + data.data.length - 1 : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Candidates</h1>
          <p className="text-sm text-ink-muted">Track every application from first review to offer.</p>
        </div>
        <GuardedLink href="/backoffice/pipeline/new" className={primaryButtonClass}>
          New candidate
        </GuardedLink>
      </div>

      <PipelineFilters filters={filters} onChange={changeFilters} />

      {query.isPending ? (
        <ListSkeleton />
      ) : query.isError ? (
        <ErrorState
          title="Candidates couldn't be loaded"
          message={errorMessage(query.error)}
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      ) : data && data.total === 0 ? (
        <EmptyState
          title={hasActiveFilters(filters) ? "No candidates match these filters" : "No candidates yet"}
          message={
            hasActiveFilters(filters)
              ? "Try a different search or clear the filters."
              : "Candidates you register will appear here."
          }
          action={
            hasActiveFilters(filters) ? (
              <button type="button" onClick={clearFilters} className={secondaryButtonClass}>
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : data && data.data.length === 0 ? (
        <EmptyState
          title="This page is empty"
          message="The list changed since this page was opened."
          action={
            <button type="button" onClick={() => changeFilters({ page: 1 })} className={secondaryButtonClass}>
              Go to first page
            </button>
          }
        />
      ) : data ? (
        <div
          className={`space-y-4 transition-opacity ${query.isPlaceholderData ? "opacity-60" : ""}`}
          aria-busy={query.isPlaceholderData}
        >
          <p className="text-sm text-ink-muted" aria-live="polite">
            Showing {firstShown}–{lastShown} of {data.total} candidate{data.total === 1 ? "" : "s"}
          </p>
          <CandidateResults records={data.data} />
          <Pagination
            page={data.page}
            totalPages={totalPages}
            onPageChange={(page) => changeFilters({ page })}
          />
        </div>
      ) : null}
    </div>
  );
}
