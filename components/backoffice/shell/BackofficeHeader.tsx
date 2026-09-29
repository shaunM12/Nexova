"use client";

import { usePathname } from "next/navigation";
import { logout } from "@/lib/backoffice/auth/actions";
import { PIPELINE_MODE } from "@/lib/backoffice/pipeline/config";
import { GuardedLink } from "./GuardedLink";
import { DISCARD_CHANGES_MESSAGE, useUnsavedChangesContext } from "./UnsavedChanges";

const TABS = [{ href: "/backoffice/pipeline", label: "Pipeline" }] as const;

export function BackofficeHeader() {
  const pathname = usePathname();
  const { isDirty } = useUnsavedChangesContext();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="font-display text-lg font-bold text-ink">
            Nexova <span className="font-sans text-sm font-medium text-ink-muted">Backoffice</span>
          </span>
          {PIPELINE_MODE === "demo" && (
            <span
              className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800"
              title="Changes are kept in this browser tab and reset on refresh."
            >
              Demo data
            </span>
          )}
        </div>
        <form
          action={logout}
          onSubmit={(event) => {
            if (isDirty && !window.confirm(DISCARD_CHANGES_MESSAGE)) event.preventDefault();
          }}
        >
          <button
            type="submit"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-fog hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide"
          >
            Sign out
          </button>
        </form>
      </div>
      <nav aria-label="Backoffice tools" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="-mb-px flex gap-6">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <li key={tab.href}>
                <GuardedLink
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-block border-b-2 px-1 pb-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-tide ${
                    active ? "border-tide text-tide-dark" : "border-transparent text-ink-muted hover:text-ink"
                  }`}
                >
                  {tab.label}
                </GuardedLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
