import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { db } from "@/lib/backoffice/pipeline/mocks/db";
import { server } from "@/lib/backoffice/pipeline/mocks/server";

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

/**
 * jsdom replaces AbortSignal, and Node's fetch rejects jsdom signals. Honor the signal here instead of
 * passing it through. Must wrap MSW's patched fetch (installed by `listen`), not the other way around.
 */
function withJsdomSignalSupport(fetchImpl: typeof fetch): typeof fetch {
  return (input, init = {}) => {
    const { signal, ...rest } = init;
    if (!signal) return fetchImpl(input, rest);
    if (signal.aborted) return Promise.reject(signal.reason);
    return new Promise((resolve, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      fetchImpl(input, rest).then(resolve, reject);
    });
  };
}

let mswFetch: typeof fetch;

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  mswFetch = globalThis.fetch;
  globalThis.fetch = withJsdomSignalSupport(mswFetch);
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  db.reset();
  vi.restoreAllMocks();
});

afterAll(() => {
  globalThis.fetch = mswFetch;
  server.close();
});
