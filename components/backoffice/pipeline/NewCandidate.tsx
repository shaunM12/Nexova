"use client";

import { useRouter } from "next/navigation";
import { notify } from "@/lib/backoffice/notify";
import { useCreateRecord } from "@/lib/backoffice/pipeline/hooks";
import { EMPTY_RECORD_FORM, toRecordCreate } from "@/lib/backoffice/pipeline/schemas";
import { GuardedLink } from "../shell/GuardedLink";
import { CandidateForm } from "./CandidateForm";

export function NewCandidate() {
  const router = useRouter();
  const create = useCreateRecord();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <GuardedLink
        href="/backoffice/pipeline"
        className="inline-flex items-center gap-1 text-sm font-medium text-tide-dark hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-tide"
      >
        <span aria-hidden="true">←</span> All candidates
      </GuardedLink>
      <div>
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">New candidate</h1>
        <p className="text-sm text-ink-muted">Register a referral or an application received outside the site.</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
        <CandidateForm
          idPrefix="new"
          defaultValues={EMPTY_RECORD_FORM}
          submitLabel="Add candidate"
          submittingLabel="Adding…"
          onSubmit={async (values) => {
            const record = await create.mutateAsync(toRecordCreate(values));
            notify.success(`${record.full_name} added`);
            router.push(`/backoffice/pipeline/${encodeURIComponent(record.id)}`);
          }}
        />
      </div>
    </div>
  );
}
