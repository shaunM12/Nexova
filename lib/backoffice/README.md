# Backoffice domain helpers

- `auth/` — demo credentials, session cookie, `resolveAuthRedirect` (pure, tested)
- `pipeline/` — config (live vs demo), API client, Zod schemas, labels, dates, stale rule, filters, query keys, TanStack hooks, MSW mocks
- `notify.ts` — the only toast entry point

No imports from `components/`, `app/`, `lib/public`, or `lib/candidate-engine`.
Keep public marketing helpers in `lib/public`.
