import { delay, http, HttpResponse } from "msw";
import { PIPELINE_API_BASE_URL } from "../config";
import { isStage, isStatus } from "../labels";
import type { Note } from "../schemas";
import { db } from "./db";
import type { SeedRecord } from "./seed";

interface ValidationIssue {
  loc: (string | number)[];
  msg: string;
  type: string;
}

const REQUIRED_TEXT = ["full_name", "email", "phone", "position"] as const;

function validationError(detail: ValidationIssue[]) {
  return HttpResponse.json({ detail }, { status: 422 });
}

function notFound() {
  return HttpResponse.json({ error: "Record not found" }, { status: 404 });
}

function validateRecordBody(body: Record<string, unknown>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const field of REQUIRED_TEXT) {
    if (typeof body[field] !== "string" || !(body[field] as string).trim()) {
      issues.push({ loc: ["body", field], msg: "Field required", type: "missing" });
    }
  }
  if (typeof body.email === "string" && body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    issues.push({ loc: ["body", "email"], msg: "value is not a valid email address", type: "value_error" });
  }
  if (typeof body.experience_years !== "number") {
    issues.push({ loc: ["body", "experience_years"], msg: "Input should be a valid number", type: "float_type" });
  }
  return issues;
}

function nowIso(): string {
  return new Date().toISOString();
}

function recordFields(body: Record<string, unknown>) {
  return {
    full_name: String(body.full_name).trim(),
    email: String(body.email).trim(),
    phone: String(body.phone).trim(),
    position: String(body.position).trim(),
    experience_years: body.experience_years as number,
    linkedin_url: typeof body.linkedin_url === "string" && body.linkedin_url ? body.linkedin_url : null,
    cv_url: typeof body.cv_url === "string" && body.cv_url ? body.cv_url : null,
  };
}

function withCount(record: SeedRecord): SeedRecord {
  return { ...record, notes_count: record.notes.length };
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Mirrors the 4Geeks tracker API closely enough for demo mode and tests. */
export function createHandlers(options: { baseUrl?: string; latencyMs?: number } = {}) {
  const base = options.baseUrl ?? PIPELINE_API_BASE_URL;
  const latency = options.latencyMs ?? 0;
  const wait = () => (latency > 0 ? delay(latency) : Promise.resolve());

  return [
    http.get(`${base}/records`, async ({ request }) => {
      await wait();
      const url = new URL(request.url);
      const status = url.searchParams.get("status");
      const stage = url.searchParams.get("stage");
      const search = url.searchParams.get("search")?.trim().toLowerCase() ?? "";
      const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
      const limit = Math.max(1, Number(url.searchParams.get("limit") ?? 20) || 20);

      const matches = db.all().filter(
        (record) =>
          (!status || record.status === status) &&
          (!stage || record.stage === stage) &&
          (!search ||
            record.full_name.toLowerCase().includes(search) ||
            record.email.toLowerCase().includes(search)),
      );
      const data = matches.slice((page - 1) * limit, page * limit).map(withCount);
      return HttpResponse.json({ total: matches.length, page, limit, data });
    }),

    http.post(`${base}/records`, async ({ request }) => {
      await wait();
      const body = await readJson(request);
      const issues = validateRecordBody(body);
      if (issues.length) return validationError(issues);
      const timestamp = nowIso();
      const record: SeedRecord = {
        id: crypto.randomUUID(),
        ...recordFields(body),
        status: "received",
        stage: "pending",
        notes_count: 0,
        applied_at: timestamp,
        updated_at: timestamp,
        notes: [],
      };
      db.insert(record);
      return HttpResponse.json(record, { status: 201 });
    }),

    http.get(`${base}/records/:id`, async ({ params }) => {
      await wait();
      const record = db.find(String(params.id));
      return record ? HttpResponse.json(withCount(record)) : notFound();
    }),

    http.put(`${base}/records/:id`, async ({ params, request }) => {
      await wait();
      const record = db.find(String(params.id));
      if (!record) return notFound();
      const body = await readJson(request);
      const issues = validateRecordBody(body);
      if (issues.length) return validationError(issues);
      const updated: SeedRecord = { ...record, ...recordFields(body), updated_at: nowIso() };
      db.replace(updated);
      return HttpResponse.json(withCount(updated));
    }),

    http.patch(`${base}/records/:id`, async ({ params, request }) => {
      await wait();
      const record = db.find(String(params.id));
      if (!record) return notFound();
      const body = await readJson(request);
      const issues: ValidationIssue[] = [];
      if (body.status != null && !isStatus(body.status)) {
        issues.push({ loc: ["body", "status"], msg: "Invalid status", type: "enum" });
      }
      if (body.stage != null && !isStage(body.stage)) {
        issues.push({ loc: ["body", "stage"], msg: "Invalid stage", type: "enum" });
      }
      if (issues.length) return validationError(issues);
      const updated: SeedRecord = {
        ...record,
        status: (body.status as string | undefined) ?? record.status,
        stage: (body.stage as string | undefined) ?? record.stage,
        updated_at: nowIso(),
      };
      db.replace(updated);
      return HttpResponse.json(withCount(updated));
    }),

    http.delete(`${base}/records/:id`, async ({ params }) => {
      await wait();
      if (!db.find(String(params.id))) return notFound();
      db.remove(String(params.id));
      return new HttpResponse(null, { status: 204 });
    }),

    http.get(`${base}/records/:id/notes`, async ({ params }) => {
      await wait();
      const record = db.find(String(params.id));
      if (!record) return notFound();
      return HttpResponse.json({ data: record.notes, meta: { total: record.notes.length } });
    }),

    http.post(`${base}/records/:id/notes`, async ({ params, request }) => {
      await wait();
      const record = db.find(String(params.id));
      if (!record) return notFound();
      const body = await readJson(request);
      if (typeof body.content !== "string" || body.content.length < 1) {
        return validationError([
          { loc: ["body", "content"], msg: "String should have at least 1 character", type: "string_too_short" },
        ]);
      }
      const note: Note = {
        id: crypto.randomUUID(),
        record_id: record.id,
        content: body.content,
        created_at: nowIso(),
      };
      db.replace({ ...record, notes: [note, ...record.notes] });
      return HttpResponse.json(note, { status: 201 });
    }),

    http.delete(`${base}/records/:id/notes/:noteId`, async ({ params }) => {
      await wait();
      const record = db.find(String(params.id));
      if (!record) return notFound();
      if (!record.notes.some((note) => note.id === params.noteId)) {
        return HttpResponse.json({ error: "Note not found" }, { status: 404 });
      }
      db.replace({ ...record, notes: record.notes.filter((note) => note.id !== params.noteId) });
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}
