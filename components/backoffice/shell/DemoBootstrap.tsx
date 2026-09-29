"use client";

import { useEffect, useState } from "react";
import { PIPELINE_MODE } from "@/lib/backoffice/pipeline/config";

type BootState = "starting" | "ready" | "failed";

/** In demo mode, nothing renders (and no request fires) until the mock worker is active. */
export function DemoBootstrap({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BootState>(PIPELINE_MODE === "live" ? "ready" : "starting");

  useEffect(() => {
    if (PIPELINE_MODE === "live") return;
    let cancelled = false;
    import("@/lib/backoffice/pipeline/mocks/browser")
      .then(({ startDemoWorker }) => startDemoWorker())
      .then(() => {
        if (!cancelled) setState("ready");
      })
      .catch((error: unknown) => {
        console.error("[pipeline] Demo data failed to start", error);
        if (!cancelled) setState("failed");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "ready") return <>{children}</>;

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4" role="status" aria-live="polite">
      {state === "starting" ? (
        <p className="flex items-center gap-3 text-sm text-ink-muted">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-tide border-t-transparent"
            aria-hidden="true"
          />
          Loading demo data…
        </p>
      ) : (
        <div className="max-w-sm text-center">
          <p className="font-medium text-ink">Demo data couldn&apos;t start.</p>
          <p className="mt-1 text-sm text-ink-muted">
            Your browser may be blocking service workers. Reload the page to try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-tide px-4 py-2 text-sm font-semibold text-white hover:bg-tide-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide"
          >
            Reload
          </button>
        </div>
      )}
    </div>
  );
}
