# Backoffice route group

Internal tools under `/backoffice`, gated by a demo session (`middleware.ts`).

- `backoffice/login` — demo sign-in (no shell)
- `backoffice/(app)/` — shared shell (header, tabs, providers, demo bootstrap)
- `backoffice/(app)/pipeline` — Talent Pipeline Tracker

Do not add marketing pages here. Use `components/backoffice` and `lib/backoffice` only.

Contract: `memory-bank/historical-reference/talent-pipeline-context.md`.
