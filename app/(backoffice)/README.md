# Backoffice route group (planned)

Reserved for authenticated internal tools under `/backoffice`.

Do not add marketing pages here. When this phase starts:

1. Create `backoffice/layout.tsx` (auth gate + internal nav)
2. Create `backoffice/page.tsx` → `/backoffice`
3. Use `components/backoffice` and `lib/backoffice` only

See `memory-bank/architecture.md`.
