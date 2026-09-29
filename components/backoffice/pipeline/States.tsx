const buttonClass =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:bg-fog focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide disabled:opacity-60";

export function ErrorState({
  title,
  message,
  onRetry,
  retrying = false,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <div role="alert" className="rounded-lg border border-danger/30 bg-white p-4 text-sm sm:p-6">
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-1 text-ink-muted">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} disabled={retrying} className={`mt-3 ${buttonClass}`}>
          {retrying ? "Retrying…" : "Retry"}
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm sm:p-10">
      <p className="font-medium text-ink">{title}</p>
      {message && <p className="mt-1 text-ink-muted">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} aria-hidden="true" />;
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <span className="sr-only">Loading candidates…</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4">
          <SkeletonBlock className="h-4 w-1/3" />
          <SkeletonBlock className="hidden h-4 w-1/5 sm:block" />
          <SkeletonBlock className="h-5 w-20 rounded-full" />
          <SkeletonBlock className="hidden h-5 w-24 rounded-full md:block" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Loading candidate…</span>
      <SkeletonBlock className="h-8 w-2/3 sm:w-1/3" />
      <SkeletonBlock className="h-4 w-1/2 sm:w-1/4" />
      <SkeletonBlock className="h-24 w-full" />
      <SkeletonBlock className="h-40 w-full" />
    </div>
  );
}

export { buttonClass as secondaryButtonClass };

export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-md bg-tide px-4 py-2 text-sm font-semibold text-white hover:bg-tide-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide disabled:cursor-not-allowed disabled:opacity-60";

export const fieldClass =
  "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-tide focus:outline-none focus:ring-2 focus:ring-tide/30 aria-[invalid=true]:border-danger disabled:bg-fog";
