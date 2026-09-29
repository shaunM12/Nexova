import { setupWorker } from "msw/browser";
import { createHandlers } from "./handlers";

const DEMO_LATENCY_MS = 350;

let started: Promise<unknown> | null = null;

/** Idempotent: React Strict Mode mounts effects twice in development. */
export function startDemoWorker(): Promise<unknown> {
  started ??= setupWorker(...createHandlers({ latencyMs: DEMO_LATENCY_MS })).start({
    onUnhandledRequest: "bypass",
    quiet: true,
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
  return started;
}
