import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  findRecordByEmail,
  getRecord,
  isRetryableError,
  listRecords,
  PipelineApiError,
} from "./api";
import { DEMO_API_BASE_URL, PIPELINE_API_BASE_URL, PIPELINE_MODE } from "./config";
import { DEFAULT_FILTERS } from "./filters";
import { server } from "./mocks/server";

const base = PIPELINE_API_BASE_URL;

it("runs tests against demo data, never the shared API", () => {
  expect(PIPELINE_MODE).toBe("demo");
  expect(PIPELINE_API_BASE_URL).toBe(DEMO_API_BASE_URL);
});

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

async function expectApiError(promise: Promise<unknown>, kind: string) {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(PipelineApiError);
  expect((error as PipelineApiError).kind).toBe(kind);
  return error as PipelineApiError;
}

describe("api client", () => {
  it("lists records with API-side filters", async () => {
    const result = await listRecords({ ...DEFAULT_FILTERS, status: "discarded" });
    expect(result.total).toBeGreaterThan(0);
    expect(result.data.every((record) => record.status === "discarded")).toBe(true);
  });

  it("maps 404 to not_found with a human message", async () => {
    const error = await expectApiError(getRecord("missing"), "not_found");
    expect(error.message).not.toMatch(/404|Record not found/);
  });

  it("maps 422 detail to field errors", async () => {
    server.use(
      http.get(`${base}/records/:id`, () =>
        HttpResponse.json(
          { detail: [{ loc: ["body", "email"], msg: "value is not a valid email address", type: "value_error" }] },
          { status: 422 },
        ),
      ),
    );
    const error = await expectApiError(getRecord("x"), "validation");
    expect(error.fieldErrors).toEqual({ email: "value is not a valid email address" });
  });

  it("maps 5xx, network failures, and malformed bodies", async () => {
    server.use(http.get(`${base}/records/a`, () => new HttpResponse(null, { status: 503 })));
    await expectApiError(getRecord("a"), "server");

    server.use(http.get(`${base}/records/b`, () => HttpResponse.error()));
    await expectApiError(getRecord("b"), "network");

    server.use(http.get(`${base}/records/c`, () => HttpResponse.json({ nope: true })));
    await expectApiError(getRecord("c"), "parse");
  });

  it("retries only transient errors", () => {
    expect(isRetryableError(new PipelineApiError("network"))).toBe(true);
    expect(isRetryableError(new PipelineApiError("server"))).toBe(true);
    expect(isRetryableError(new PipelineApiError("not_found"))).toBe(false);
    expect(isRetryableError(new PipelineApiError("validation"))).toBe(false);
  });

  it("finds duplicates by exact, case-insensitive email only", async () => {
    expect((await findRecordByEmail("LUCIA.FERNANDEZ@example.com"))?.full_name).toBe(
      "Lucía Fernández Ortega",
    );
    expect(await findRecordByEmail("lucia.fernandez@example")).toBeNull();
    expect(await findRecordByEmail("lucia.fernandez@example.com", "demo-lucia-fernandez-ortega")).toBeNull();
  });
});
