# Nexova

Public website for Nexova — human resources consulting and talent acquisition (Valencia · Miami).

Built with **Next.js** and **React**. The same app serves an internal **backoffice** under `/backoffice`, whose first tool is the **Talent Pipeline Tracker**. This repo also includes an in-memory **candidate matching engine** (TypeScript logic + tests) — not a page.

## Run locally

Requires **Node 20.19+** (24 recommended; run `nvm use` — the repo has an `.nvmrc`).

```bash
# If `nvm` isn't found, load it first: source ~/.nvm/nvm.sh
nvm use
npm install
npm run dev
```

That one command:
1. Starts Next.js on port **3456**
2. Opens the site in **Firefox** when ready

To work on the internal tool instead, run `npm run dev:backoffice` — same server, but Firefox opens at `/backoffice`. Both surfaces are one app, so there's no need to `cd` into folders.

See what’s running (and reserved future ports):

```bash
npm run ports
```

- Public landing: `http://127.0.0.1:3456/`
- Talent form: `http://127.0.0.1:3456/application`
- Backoffice (same app): `http://127.0.0.1:3456/backoffice`
- Reserved API: `4000` · reserved workers: `4001` (`config/ports.json`)

Optional: `npm run open` reopens Firefox. `npm run dev:server` starts the server only.

### Talent Pipeline Tracker (backoffice)

Internal tool for Nexova's People team to run the Executive Assistant search without a spreadsheet: list, filter and search candidates, move them through stages, keep interview notes, register referrals, and fix bad data. It catches duplicate emails, flags candidates with no update in 14+ days, and always shows loading, success, or error feedback.

**Demo video:** _coming soon_

1. Run `npm run dev:backoffice` (or open `http://127.0.0.1:3456/backoffice`) → you'll land on the sign-in page.
2. Sign in with the demo credentials shown there (`demo@nexova.dev` / `nexova-demo`). This is a demo gate, **not real authentication**.

**Data modes**

| Mode | How | What happens |
|---|---|---|
| Live (default) | No env var | Reads/writes the shared [4Geeks tracker API](https://playground.4geeks.com/tracker/api/v1/docs) |
| Demo | `NEXT_PUBLIC_PIPELINE_API_URL=demo` in `.env.local`, restart dev | Mock data served in your browser by MSW; "Demo data" badge; changes reset on refresh |

Tests always run against demo data and never reach the shared API.

The live API is shared with other people: prefix test records with `[TEST]`, use `@example.com` emails, never enter real personal data, and delete test records when done.

Contract, decisions, and checklist: `memory-bank/historical-reference/talent-pipeline-context.md`

### Tests and checks

```bash
npm test               # everything (engine + pipeline)
npm run fundamentals   # candidate engine only
npm run test:pipeline  # pipeline tracker only (Vitest + React Testing Library + MSW)
npm run typecheck
npm run lint
npm run build
```

### Candidate matching engine (logic only)

`lib/candidate-engine` is typed scoring / filter / rank utilities for an internal shortlist pipeline. **There is no UI for it yet** — it is not wired into the public site or the backoffice.

Contract and scoring rules: `memory-bank/historical-reference/programming-fundamentals-context.md`  
Module overview: `lib/candidate-engine/README.md`

> **Ports panel:** Cursor auto-fills this on remote/Codespaces projects. On a local Mac repo it often stays blank. Use `npm run ports` to pick among services as you add APIs/backoffice processes.

Production preview:

```bash
npm run build
npm start
```

## Stack

- Next.js App Router + React, TypeScript, Tailwind CSS
- Public site: client-side talent form validation (no backend yet)
- Backoffice: TanStack Query, Zod, React Hook Form, Sonner, MSW (demo mode + tests)
- Tests: Vitest (+ React Testing Library for the backoffice)

## Architecture

| Surface | Path | Status |
|---|---|---|
| Public website | `app/(public)` | Active |
| Backoffice — Talent Pipeline Tracker | `app/(backoffice)/backoffice` | Active (demo auth) |
| Candidate engine | `lib/candidate-engine` | Active (logic + Vitest; no UI) |

Details: `memory-bank/architecture.md`

## Project docs

- Architecture: `memory-bank/architecture.md`
- Tech context: `memory-bank/techContext.md`
- Product context: `memory-bank/historical-reference/product-context.md`
- Programming fundamentals (candidate engine): `memory-bank/historical-reference/programming-fundamentals-context.md`
- Talent Pipeline Tracker: `memory-bank/historical-reference/talent-pipeline-context.md`
