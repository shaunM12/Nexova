import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { notify } from "../../notify";
import {
  addNote,
  createRecord,
  deleteNote,
  deleteRecord,
  errorMessage,
  patchRecord,
  updateRecord,
} from "../api";
import { STAGE_LABELS, STATUS_LABELS, type Stage, type Status } from "../labels";
import { recordKeys } from "../queryKeys";
import type { NoteList, PipelineRecord, RecordCreate, RecordList } from "../schemas";

export function useCreateRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RecordCreate) => createRecord(body),
    onSuccess: (record) => {
      queryClient.setQueryData(recordKeys.detail(record.id), record);
      return queryClient.invalidateQueries({ queryKey: recordKeys.lists() });
    },
  });
}

export function useUpdateRecord(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RecordCreate) => updateRecord(id, body),
    onSuccess: (record) => {
      queryClient.setQueryData(recordKeys.detail(id), record);
      return queryClient.invalidateQueries({ queryKey: recordKeys.lists() });
    },
  });
}

/**
 * Not optimistic: nothing changes until the server confirms.
 * The detail query is still mounted here, so it is marked stale rather than removed; removing it
 * would refetch and flash "Candidate not found" before the redirect lands.
 */
export function useDeleteRecord(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteRecord(id),
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: recordKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: recordKeys.detail(id), refetchType: "none" });
      await queryClient.invalidateQueries({ queryKey: recordKeys.lists() });
      notify.success("Candidate deleted");
    },
    onError: (error) => notify.error(`Couldn't delete the candidate. ${errorMessage(error)}`),
  });
}

export type StatusStageChange = { status: Status } | { stage: Stage };

interface StatusStageContext {
  detail: PipelineRecord | undefined;
  lists: [QueryKey, RecordList | undefined][];
}

function describeChange(change: StatusStageChange): { field: string; label: string } {
  return "status" in change
    ? { field: "status", label: STATUS_LABELS[change.status].label }
    : { field: "stage", label: STAGE_LABELS[change.stage].label };
}

/** Optimistic: detail and list caches update immediately and roll back if the server rejects. */
export function useUpdateStatusStage(id: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation<PipelineRecord, Error, StatusStageChange, StatusStageContext>({
    mutationFn: (change) => patchRecord(id, change),
    onMutate: async (change) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: recordKeys.detail(id), exact: true }),
        queryClient.cancelQueries({ queryKey: recordKeys.lists() }),
      ]);
      const context: StatusStageContext = {
        detail: queryClient.getQueryData<PipelineRecord>(recordKeys.detail(id)),
        lists: queryClient.getQueriesData<RecordList>({ queryKey: recordKeys.lists() }),
      };
      const patch = { ...change, updated_at: new Date().toISOString() };
      queryClient.setQueryData<PipelineRecord>(recordKeys.detail(id), (old) =>
        old ? { ...old, ...patch } : old,
      );
      queryClient.setQueriesData<RecordList>({ queryKey: recordKeys.lists() }, (old) =>
        old
          ? { ...old, data: old.data.map((record) => (record.id === id ? { ...record, ...patch } : record)) }
          : old,
      );
      return context;
    },
    onError: (error, change, context) => {
      if (context) {
        queryClient.setQueryData(recordKeys.detail(id), context.detail);
        for (const [key, data] of context.lists) queryClient.setQueryData(key, data);
      }
      const { field } = describeChange(change);
      notify.error(`Couldn't update ${field}. Your change was undone. ${errorMessage(error)}`, {
        onRetry: () => mutation.mutate(change),
      });
    },
    onSuccess: (record, change) => {
      queryClient.setQueryData(recordKeys.detail(id), record);
      const { field, label } = describeChange(change);
      notify.success(`${field === "status" ? "Status" : "Stage"} changed to ${label}`);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: recordKeys.lists() }),
  });

  return mutation;
}

export function useAddNote(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => addNote(id, content),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: recordKeys.notes(id) }),
        queryClient.invalidateQueries({ queryKey: recordKeys.detail(id), exact: true }),
      ]),
  });
}

/** Optimistic: the note disappears immediately and comes back if the delete fails. */
export function useDeleteNote(id: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, string, { previous: NoteList | undefined }>({
    mutationFn: (noteId) => deleteNote(id, noteId),
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: recordKeys.notes(id) });
      const previous = queryClient.getQueryData<NoteList>(recordKeys.notes(id));
      queryClient.setQueryData<NoteList>(recordKeys.notes(id), (old) =>
        old
          ? {
              data: old.data.filter((note) => note.id !== noteId),
              meta: { total: Math.max(0, old.meta.total - 1) },
            }
          : old,
      );
      return { previous };
    },
    onError: (error, noteId, context) => {
      queryClient.setQueryData(recordKeys.notes(id), context?.previous);
      notify.error(`Couldn't delete the note. It has been restored. ${errorMessage(error)}`, {
        onRetry: () => mutation.mutate(noteId),
      });
    },
    onSuccess: () => notify.success("Note deleted"),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: recordKeys.notes(id) }),
        queryClient.invalidateQueries({ queryKey: recordKeys.detail(id), exact: true }),
      ]),
  });

  return mutation;
}
