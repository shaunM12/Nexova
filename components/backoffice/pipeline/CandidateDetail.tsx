"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { notify } from "@/lib/backoffice/notify";
import { errorMessage, isPipelineApiError } from "@/lib/backoffice/pipeline/api";
import { daysSince, formatDate, formatRelative, parseApiDate } from "@/lib/backoffice/pipeline/dates";
import {
  useDeleteRecord,
  useRecord,
  useUpdateRecord,
  useUpdateStatusStage,
} from "@/lib/backoffice/pipeline/hooks";
import { toFormValues, toRecordCreate, type PipelineRecord } from "@/lib/backoffice/pipeline/schemas";
import { isStale } from "@/lib/backoffice/pipeline/stale";
import { SectionErrorBoundary } from "../shell/ErrorBoundary";
import { GuardedLink } from "../shell/GuardedLink";
import { StageBadge, StaleBadge, StatusBadge } from "./Badges";
import { CandidateForm } from "./CandidateForm";
import { NotesPanel } from "./NotesPanel";
import { StageStepper } from "./StageStepper";
import { StatusSelect } from "./StatusSelect";
import { DetailSkeleton, EmptyState, ErrorState, secondaryButtonClass } from "./States";

function BackLink() {
  return (
    <GuardedLink
      href="/backoffice/pipeline"
      className="inline-flex items-center gap-1 text-sm font-medium text-tide-dark hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-tide"
    >
      <span aria-hidden="true">←</span> All candidates
    </GuardedLink>
  );
}

function PipelineControls({ record }: { record: PipelineRecord }) {
  const statusMutation = useUpdateStatusStage(record.id);
  const stageMutation = useUpdateStatusStage(record.id);

  return (
    <section aria-labelledby="pipeline-heading" className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
      <h2 id="pipeline-heading" className="text-lg font-semibold text-ink">
        Pipeline
      </h2>
      <StageStepper
        current={record.stage}
        disabled={stageMutation.isPending}
        onSelect={(stage) => stageMutation.mutate({ stage })}
      />
      <StatusSelect
        current={record.status}
        disabled={statusMutation.isPending}
        onSelect={(status) => statusMutation.mutate({ status })}
      />
    </section>
  );
}

function ProfileRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-ink">{children}</dd>
    </div>
  );
}

function ExternalLink({ href, children }: { href: string | null; children: React.ReactNode }) {
  if (!href) return <span className="text-ink-muted">Not provided</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-tide-dark underline">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function ProfileSection({ record }: { record: PipelineRecord }) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateRecord(record.id);

  return (
    <section aria-labelledby="profile-heading" className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="profile-heading" className="text-lg font-semibold text-ink">
          Candidate details
        </h2>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className={secondaryButtonClass}>
            Edit details
          </button>
        )}
      </div>
      {editing ? (
        <CandidateForm
          idPrefix="edit"
          defaultValues={toFormValues(record)}
          excludeId={record.id}
          submitLabel="Save changes"
          submittingLabel="Saving…"
          onCancel={() => setEditing(false)}
          onSubmit={async (values) => {
            await update.mutateAsync(toRecordCreate(values));
            notify.success("Candidate details saved");
            setEditing(false);
          }}
        />
      ) : (
        <dl className="grid gap-4 sm:grid-cols-2">
          <ProfileRow label="Email">
            <a href={`mailto:${record.email}`} className="text-tide-dark underline">
              {record.email}
            </a>
          </ProfileRow>
          <ProfileRow label="Phone">
            <a href={`tel:${record.phone.replace(/[^\d+]/g, "")}`} className="text-tide-dark underline">
              {record.phone}
            </a>
          </ProfileRow>
          <ProfileRow label="Position">{record.position}</ProfileRow>
          <ProfileRow label="Experience">
            {record.experience_years} {record.experience_years === 1 ? "year" : "years"}
          </ProfileRow>
          <ProfileRow label="LinkedIn">
            <ExternalLink href={record.linkedin_url}>View profile</ExternalLink>
          </ProfileRow>
          <ProfileRow label="CV">
            <ExternalLink href={record.cv_url}>Open CV</ExternalLink>
          </ProfileRow>
        </dl>
      )}
    </section>
  );
}

function DangerZone({ record }: { record: PipelineRecord }) {
  const router = useRouter();
  const remove = useDeleteRecord(record.id);
  const [confirming, setConfirming] = useState(false);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  useEffect(() => {
    if (confirming) cancelButton.current?.focus();
    else if (wasConfirming.current) deleteButton.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  const cancel = () => {
    if (!remove.isPending) setConfirming(false);
  };

  return (
    <section aria-labelledby="danger-heading" className="space-y-3 rounded-lg border border-danger/30 bg-white p-4 sm:p-6">
      <h2 id="danger-heading" className="text-lg font-semibold text-ink">
        Danger zone
      </h2>
      {confirming ? (
        <div
          role="alertdialog"
          aria-labelledby="delete-candidate-title"
          aria-describedby="delete-candidate-description"
          onKeyDown={(event) => {
            if (event.key === "Escape") cancel();
          }}
          className="flex flex-col gap-3 rounded-md bg-danger/5 p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p id="delete-candidate-title" className="break-words text-sm font-semibold text-ink">
              Delete {record.full_name}?
            </p>
            <p id="delete-candidate-description" className="text-sm text-ink-muted">
              This removes the candidate and all notes. This can&apos;t be undone.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              ref={cancelButton}
              type="button"
              onClick={cancel}
              disabled={remove.isPending}
              className={secondaryButtonClass}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(undefined, { onSuccess: () => router.replace("/backoffice/pipeline") })
              }
              className="rounded-md bg-danger px-3 py-1.5 text-sm font-semibold text-white hover:bg-danger/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:cursor-not-allowed disabled:opacity-60"
            >
              {remove.isPending ? "Deleting…" : "Delete candidate"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-muted">Permanently remove this candidate and all of their notes.</p>
          <button
            ref={deleteButton}
            type="button"
            onClick={() => setConfirming(true)}
            className="shrink-0 rounded-md border border-danger/40 px-3 py-1.5 text-sm font-semibold text-danger hover:bg-danger/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
          >
            Delete candidate
          </button>
        </div>
      )}
    </section>
  );
}

export function CandidateDetail({ id }: { id: string }) {
  const query = useRecord(id);

  if (query.isPending) {
    return (
      <div className="space-y-4">
        <BackLink />
        <DetailSkeleton />
      </div>
    );
  }

  if (query.isError) {
    const notFound = isPipelineApiError(query.error) && query.error.kind === "not_found";
    return (
      <div className="space-y-4">
        <BackLink />
        {notFound ? (
          <EmptyState
            title="Candidate not found"
            message="This candidate may have been removed, or the link is incorrect."
            action={
              <GuardedLink href="/backoffice/pipeline" className={secondaryButtonClass}>
                Back to pipeline
              </GuardedLink>
            }
          />
        ) : (
          <ErrorState
            title="This candidate couldn't be loaded"
            message={errorMessage(query.error)}
            onRetry={() => query.refetch()}
            retrying={query.isFetching}
          />
        )}
      </div>
    );
  }

  const record = query.data;
  const now = new Date();
  const updated = parseApiDate(record.updated_at);

  return (
    <div className="space-y-6">
      <BackLink />
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{record.full_name}</h1>
        <p className="text-ink-muted">{record.position}</p>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge value={record.status} />
          <StageBadge value={record.stage} />
          {isStale(record, now) && <StaleBadge />}
        </div>
        <p className="text-sm text-ink-muted">
          Applied {formatDate(parseApiDate(record.applied_at))} · Last updated{" "}
          <time dateTime={record.updated_at} title={formatDate(updated)}>
            {formatRelative(updated, now)}
          </time>
          {isStale(record, now) && (
            <span className="text-amber-800"> — no updates in {daysSince(updated, now)} days</span>
          )}
        </p>
      </header>

      <SectionErrorBoundary title="Pipeline controls">
        <PipelineControls record={record} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Candidate details">
        <ProfileSection record={record} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Notes">
        <NotesPanel recordId={record.id} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Danger zone">
        <DangerZone record={record} />
      </SectionErrorBoundary>
    </div>
  );
}
