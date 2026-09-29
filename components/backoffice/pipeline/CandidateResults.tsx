"use client";

import { formatRelative, parseApiDate } from "@/lib/backoffice/pipeline/dates";
import type { PipelineRecord } from "@/lib/backoffice/pipeline/schemas";
import { isStale } from "@/lib/backoffice/pipeline/stale";
import { GuardedLink } from "../shell/GuardedLink";
import { StageBadge, StaleBadge, StatusBadge } from "./Badges";

function detailHref(id: string): string {
  return `/backoffice/pipeline/${encodeURIComponent(id)}`;
}

function LastUpdated({ record, now }: { record: PipelineRecord; now: Date }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span>{formatRelative(parseApiDate(record.updated_at), now)}</span>
      {isStale(record, now) && <StaleBadge />}
    </span>
  );
}

/** Table from md up, cards on mobile. Names/cards are real links. */
export function CandidateResults({ records }: { records: PipelineRecord[] }) {
  const now = new Date();

  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Candidates</caption>
          <thead className="bg-fog text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Name</th>
              <th scope="col" className="px-4 py-3 font-semibold">Position</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold">Stage</th>
              <th scope="col" className="px-4 py-3 font-semibold">Last updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-fog/60">
                <td className="px-4 py-3">
                  <GuardedLink
                    href={detailHref(record.id)}
                    className="font-medium text-ink underline-offset-2 hover:text-tide-dark hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-tide"
                  >
                    {record.full_name}
                  </GuardedLink>
                  <div className="text-xs text-ink-muted">{record.email}</div>
                </td>
                <td className="px-4 py-3 text-ink-muted">{record.position}</td>
                <td className="px-4 py-3"><StatusBadge value={record.status} /></td>
                <td className="px-4 py-3"><StageBadge value={record.stage} /></td>
                <td className="px-4 py-3 text-ink-muted"><LastUpdated record={record} now={now} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden" aria-label="Candidates">
        {records.map((record) => (
          <li key={record.id}>
            <GuardedLink
              href={detailHref(record.id)}
              className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-tide focus-visible:outline focus-visible:outline-2 focus-visible:outline-tide"
            >
              <span className="block font-medium text-ink">{record.full_name}</span>
              <span className="block text-sm text-ink-muted">{record.position}</span>
              <span className="mt-2 flex flex-wrap gap-2">
                <StatusBadge value={record.status} />
                <StageBadge value={record.stage} />
              </span>
              <span className="mt-2 block text-xs text-ink-muted">
                Updated <LastUpdated record={record} now={now} />
              </span>
            </GuardedLink>
          </li>
        ))}
      </ul>
    </>
  );
}
