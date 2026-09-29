"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/backoffice/auth/actions";
import { DEMO_CREDENTIALS } from "@/lib/backoffice/auth/constants";
import { fieldClass, primaryButtonClass } from "../pipeline/States";

const INITIAL_STATE: LoginState = { error: null };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, INITIAL_STATE);

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <p className="font-display text-2xl font-bold text-ink">Nexova</p>
        <h1 className="mt-1 text-sm font-medium text-ink-muted">Backoffice sign in</h1>
      </div>
      <form action={formAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="next" value={next} />
        {state.error && (
          <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            {state.error}
          </p>
        )}
        <div>
          <label htmlFor="login-email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="text-sm font-medium text-ink">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={fieldClass}
          />
        </div>
        <button type="submit" disabled={pending} className={`w-full ${primaryButtonClass}`}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <aside className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Demo access — not real authentication</p>
        <p className="mt-1">
          This gate keeps the demo tidy; it does not protect data. Use:
        </p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs">
          <dt>Email</dt>
          <dd>{DEMO_CREDENTIALS.email}</dd>
          <dt>Password</dt>
          <dd>{DEMO_CREDENTIALS.password}</dd>
        </dl>
      </aside>
    </div>
  );
}
