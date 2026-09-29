import type { z } from "zod";
import { PAGE_SIZE, PIPELINE_API_BASE_URL, REQUEST_TIMEOUT_MS } from "./config";
import type { PipelineFilters } from "./filters";
import type { Stage, Status } from "./labels";
import {
  NoteListSchema,
  NoteSchema,
  RecordListSchema,
  RecordSchema,
  type Note,
  type NoteList,
  type PipelineRecord,
  type RecordCreate,
  type RecordList,
} from "./schemas";

export type PipelineApiErrorKind =
  | "network"
  | "timeout"
  | "not_found"
  | "validation"
  | "server"
  | "parse";

const MESSAGES: Record<PipelineApiErrorKind, string> = {
  network: "Can't reach the pipeline service. Check your connection and try again.",
  timeout: "The pipeline service took too long to respond. Please try again.",
  not_found: "We couldn't find that candidate. It may have been removed.",
  validation: "Some fields need attention.",
  server: "The pipeline service is having trouble. Please try again.",
  parse: "Unexpected response from the server. Please try again.",
};

export class PipelineApiError extends Error {
  readonly kind: PipelineApiErrorKind;
  readonly status?: number;
  readonly fieldErrors: Record<string, string>;

  constructor(
    kind: PipelineApiErrorKind,
    options: { status?: number; fieldErrors?: Record<string, string> } = {},
  ) {
    super(MESSAGES[kind]);
    this.name = "PipelineApiError";
    this.kind = kind;
    this.status = options.status;
    this.fieldErrors = options.fieldErrors ?? {};
  }
}

export function isPipelineApiError(error: unknown): error is PipelineApiError {
  return error instanceof PipelineApiError;
}

/** Human-readable message for any thrown value; raw details stay in the console. */
export function errorMessage(error: unknown): string {
  return isPipelineApiError(error) ? error.message : MESSAGES.server;
}

export function isRetryableError(error: unknown): boolean {
  return (
    isPipelineApiError(error) &&
    (error.kind === "network" || error.kind === "timeout" || error.kind === "server")
  );
}

interface ValidationDetail {
  loc?: unknown[];
  msg?: string;
}

function parseFieldErrors(body: unknown): Record<string, string> {
  const detail = (body as { detail?: unknown })?.detail;
  if (!Array.isArray(detail)) return {};
  const fieldErrors: Record<string, string> = {};
  for (const item of detail as ValidationDetail[]) {
    const field = item.loc?.at(-1);
    if (typeof field === "string" && item.msg && !fieldErrors[field]) {
      fieldErrors[field] = item.msg;
    }
  }
  return fieldErrors;
}

function withTimeout(signal?: AbortSignal): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new DOMException("Request timed out", "TimeoutError")),
    REQUEST_TIMEOUT_MS,
  );
  const onAbort = () => controller.abort(signal?.reason);
  signal?.addEventListener("abort", onAbort, { once: true });
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    },
  };
}

async function request<T>(
  path: string,
  schema: z.ZodType<T> | null,
  init: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const { signal, cleanup } = withTimeout(init.signal);
  let response: Response;
  try {
    response = await fetch(`${PIPELINE_API_BASE_URL}${path}`, {
      method: init.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal,
    });
  } catch (error) {
    if (init.signal?.aborted) throw error;
    const timedOut = signal.aborted && (signal.reason as Error | undefined)?.name === "TimeoutError";
    console.error(`[pipeline] ${init.method ?? "GET"} ${path} failed`, error);
    throw new PipelineApiError(timedOut ? "timeout" : "network");
  } finally {
    cleanup();
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    console.error(`[pipeline] ${init.method ?? "GET"} ${path} → ${response.status}`, body);
    if (response.status === 404) throw new PipelineApiError("not_found", { status: 404 });
    if (response.status === 422) {
      throw new PipelineApiError("validation", { status: 422, fieldErrors: parseFieldErrors(body) });
    }
    throw new PipelineApiError("server", { status: response.status });
  }

  if (schema === null || response.status === 204) return undefined as T;

  const body: unknown = await response.json().catch(() => undefined);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error(`[pipeline] ${init.method ?? "GET"} ${path} returned an unexpected shape`, parsed.error);
    throw new PipelineApiError("parse", { status: response.status });
  }
  return parsed.data;
}

const id = (value: string) => encodeURIComponent(value);

export function listRecords(filters: PipelineFilters, signal?: AbortSignal): Promise<RecordList> {
  const params = new URLSearchParams({ page: String(filters.page), limit: String(PAGE_SIZE) });
  if (filters.status) params.set("status", filters.status);
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.q) params.set("search", filters.q);
  return request(`/records?${params}`, RecordListSchema, { signal });
}

export function getRecord(recordId: string, signal?: AbortSignal): Promise<PipelineRecord> {
  return request(`/records/${id(recordId)}`, RecordSchema, { signal });
}

export function createRecord(body: RecordCreate): Promise<PipelineRecord> {
  return request("/records", RecordSchema, { method: "POST", body });
}

export function updateRecord(recordId: string, body: RecordCreate): Promise<PipelineRecord> {
  return request(`/records/${id(recordId)}`, RecordSchema, { method: "PUT", body });
}

export function patchRecord(
  recordId: string,
  body: { status?: Status; stage?: Stage },
): Promise<PipelineRecord> {
  return request(`/records/${id(recordId)}`, RecordSchema, { method: "PATCH", body });
}

export function deleteRecord(recordId: string): Promise<void> {
  return request(`/records/${id(recordId)}`, null, { method: "DELETE" });
}

export function listNotes(recordId: string, signal?: AbortSignal): Promise<NoteList> {
  return request(`/records/${id(recordId)}/notes`, NoteListSchema, { signal });
}

export function addNote(recordId: string, content: string): Promise<Note> {
  return request(`/records/${id(recordId)}/notes`, NoteSchema, {
    method: "POST",
    body: { content },
  });
}

export function deleteNote(recordId: string, noteId: string): Promise<void> {
  return request(`/records/${id(recordId)}/notes/${id(noteId)}`, null, { method: "DELETE" });
}

/** Search is fuzzy; the exact, case-insensitive email comparison decides. */
export async function findRecordByEmail(
  email: string,
  excludeId?: string,
  signal?: AbortSignal,
): Promise<PipelineRecord | null> {
  const target = email.trim().toLowerCase();
  if (!target) return null;
  const params = new URLSearchParams({ search: target, page: "1", limit: "100" });
  const result = await request(`/records?${params}`, RecordListSchema, { signal });
  return (
    result.data.find(
      (record) => record.email.trim().toLowerCase() === target && record.id !== excludeId,
    ) ?? null
  );
}
