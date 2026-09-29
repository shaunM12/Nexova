"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { notify } from "@/lib/backoffice/notify";
import { errorMessage, isPipelineApiError } from "@/lib/backoffice/pipeline/api";
import { formatDate, parseApiDate } from "@/lib/backoffice/pipeline/dates";
import { useAddNote, useDeleteNote, useNotes } from "@/lib/backoffice/pipeline/hooks";
import { NoteFormSchema, type Note, type NoteFormValues } from "@/lib/backoffice/pipeline/schemas";
import { ErrorState, fieldClass, primaryButtonClass, secondaryButtonClass, SkeletonBlock } from "./States";

function NoteItem({ note, onDelete }: { note: Note; onDelete: (noteId: string) => void }) {
  const [confirming, setConfirming] = useState(false);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);
  const date = formatDate(parseApiDate(note.created_at));
  const titleId = `note-${note.id}-confirm`;

  useEffect(() => {
    if (confirming) cancelButton.current?.focus();
    else if (wasConfirming.current) deleteButton.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  return (
    <li className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="whitespace-pre-wrap break-words text-sm text-ink">{note.content}</p>
          <p className="mt-1 text-xs text-ink-muted">
            <time dateTime={note.created_at}>{date}</time>
          </p>
        </div>
        {!confirming && (
          <button
            ref={deleteButton}
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Delete note from ${date}`}
            className="shrink-0 rounded px-2 py-1 text-xs font-medium text-danger hover:bg-danger/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-danger"
          >
            Delete
          </button>
        )}
      </div>
      {confirming && (
        <div
          role="alertdialog"
          aria-labelledby={titleId}
          onKeyDown={(event) => {
            if (event.key === "Escape") setConfirming(false);
          }}
          className="mt-3 flex flex-col gap-2 rounded-md bg-danger/5 p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p id={titleId} className="text-sm font-medium text-ink">
            Delete this note? This can&apos;t be undone.
          </p>
          <div className="flex gap-2">
            <button
              ref={cancelButton}
              type="button"
              onClick={() => setConfirming(false)}
              aria-label="Cancel deleting note"
              className={secondaryButtonClass}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              aria-label={`Confirm delete note from ${date}`}
              className="rounded-md bg-danger px-3 py-1.5 text-sm font-semibold text-white hover:bg-danger/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
            >
              Delete note
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function AddNoteForm({ recordId }: { recordId: string }) {
  const addNote = useAddNote(recordId);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormValues>({ resolver: zodResolver(NoteFormSchema), defaultValues: { content: "" } });

  const submit = handleSubmit(async ({ content }) => {
    setFormError(null);
    try {
      await addNote.mutateAsync(content);
      reset();
      notify.success("Note added");
    } catch (error) {
      if (isPipelineApiError(error) && error.fieldErrors.content) {
        setError("content", { message: error.fieldErrors.content });
      } else {
        setFormError(errorMessage(error));
      }
    }
  });

  const error = errors.content?.message;
  return (
    <form onSubmit={submit} noValidate className="space-y-2">
      <label htmlFor="note-content" className="text-sm font-medium text-ink">
        Add a note
      </label>
      <textarea
        id="note-content"
        rows={3}
        placeholder="Call summary, interview feedback, next steps…"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "note-content-error" : undefined}
        className={fieldClass}
        {...register("content")}
      />
      {error && (
        <p id="note-content-error" className="text-sm text-danger">
          {error}
        </p>
      )}
      {formError && (
        <p role="alert" className="text-sm text-danger">
          {formError} Your note is still here — try again.
        </p>
      )}
      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? "Saving note…" : "Save note"}
        </button>
      </div>
    </form>
  );
}

export function NotesPanel({ recordId }: { recordId: string }) {
  const notes = useNotes(recordId);
  const deleteNote = useDeleteNote(recordId);

  const sorted = notes.data
    ? [...notes.data.data].sort(
        (a, b) => parseApiDate(b.created_at).getTime() - parseApiDate(a.created_at).getTime(),
      )
    : [];

  return (
    <section aria-labelledby="notes-heading" className="space-y-4 rounded-lg border border-slate-200 bg-fog/50 p-4 sm:p-6">
      <h2 id="notes-heading" className="text-lg font-semibold text-ink">
        Internal notes
        {notes.data && <span className="ml-2 text-sm font-normal text-ink-muted">({sorted.length})</span>}
      </h2>
      <AddNoteForm recordId={recordId} />
      {notes.isPending ? (
        <div role="status" className="space-y-2">
          <span className="sr-only">Loading notes…</span>
          <SkeletonBlock className="h-14 w-full" />
          <SkeletonBlock className="h-14 w-full" />
        </div>
      ) : notes.isError ? (
        <ErrorState
          title="Notes couldn't be loaded"
          message={errorMessage(notes.error)}
          onRetry={() => notes.refetch()}
          retrying={notes.isFetching}
        />
      ) : sorted.length === 0 ? (
        <p className="text-sm text-ink-muted">No notes yet. Add one after each call or interview.</p>
      ) : (
        <ul className="space-y-2" aria-label="Notes">
          {sorted.map((note) => (
            <NoteItem key={note.id} note={note} onDelete={(noteId) => deleteNote.mutate(noteId)} />
          ))}
        </ul>
      )}
    </section>
  );
}
