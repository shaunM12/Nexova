export type PipelineMode = "live" | "demo";

export const LIVE_API_BASE_URL = "https://playground.4geeks.com/tracker/api/v1";

/** `.invalid` never resolves: if the demo worker isn't running, requests fail loudly. */
export const DEMO_API_BASE_URL = "https://demo.pipeline.nexova.invalid/api/v1";

/** Unset → shared live API; a URL → that API; `demo` → in-browser mock data. */
const configured = process.env.NEXT_PUBLIC_PIPELINE_API_URL?.trim() ?? "";

export const PIPELINE_MODE: PipelineMode = configured.toLowerCase() === "demo" ? "demo" : "live";

export const PIPELINE_API_BASE_URL = (
  PIPELINE_MODE === "demo" ? DEMO_API_BASE_URL : configured || LIVE_API_BASE_URL
).replace(/\/+$/, "");

export const PAGE_SIZE = 20;
export const STALE_AFTER_DAYS = 14;
export const REQUEST_TIMEOUT_MS = 10_000;
export const SEARCH_DEBOUNCE_MS = 300;
