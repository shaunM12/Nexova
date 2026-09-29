---
id: nexova.hr.talent-pipeline
title: CONTEXT — Talent Pipeline Tracker
status: active
depends_on: [nexova.hr.00]
canonical_for:
  - backoffice-shell-v0
  - backoffice-demo-auth
  - pipeline-tracker-ui
  - pipeline-api-client
  - pipeline-labels
  - pipeline-demo-mode
  - pipeline-ship-checklist
last_reviewed: 2026-09-29
---

# CONTEXT — Talent Pipeline Tracker

First **backoffice** tool for Nexova: an internal candidate pipeline tracker that replaces the shared spreadsheet the People team uses for the Executive Assistant search. This file is the implementation guide and anti-drift contract for the phase. The course brief is a **guideline**; this is built as a real internal tool and portfolio piece, not to a rubric.

**Companions:** `../architecture.md` (public vs backoffice boundaries) · `../techContext.md` (repo stack) · `00-index.md` (glossary / continuity) · `programming-fundamentals-context.md` (engine; **not** integrated this phase).

**Branch:** `talent-pipeline-tracker`. Never commit unless explicitly asked.

---

## How to use this file

| You're doing… | Read |
|---|---|
| Scoping / saying no | Scope → Ship checklist → Anti-drift evals |
| Routing, login, middleware | Routes and shell → Demo auth |
| API client, types, schemas | API reference → Data modes → Validation |
| UI labels / badges | Labels |
| List, detail, forms | Screens and behavior |
| Loading, errors, toasts | Async, errors, and feedback |
| Adding packages / config | Stack and dependencies → Test setup |
| Before calling it done | Done checks → Ship checklist |

### Suggested build order
1. Tooling: Node/engines, deps, Vitest projects, MSW worker, `.env.example`, `typecheck` script
2. `lib/backoffice/pipeline/`: labels, dates, schemas, API client, query keys, filters
3. MSW handlers + seed data (shared by tests and demo mode)
4. Demo auth: `lib/backoffice/auth/`, login page, `middleware.ts`
5. Backoffice shell: `(app)/layout.tsx` with providers, demo bootstrap, tabs, sign-out, Toaster
6. Pipeline list: filters in URL, table/cards, pagination, skeletons, empty/error states
7. Candidate detail: status + stage controls (optimistic), inline edit, notes
8. New candidate form + duplicate email check + unsaved-changes guard
9. Tests per Test plan; Done checks green
10. README section; live-mode manual check — **last**

**Status (2026-09-29):** steps 1–9 done; README section done. Live-mode manual check remains (owner: Shaun). No deploy this milestone; a demo video replaces screenshots.

---

## Scope

### In scope (Elena's five needs, built properly)
1. **List** all candidates: name, position, status, stage at a glance
2. **Filter** by status and stage, **search** by name or email, no page reload
3. **Detail** view: change status or stage with a single interaction
4. **Notes**: add after calls/interviews; delete when no longer relevant
5. **Register** candidates (referrals) and **edit** data when it comes in wrong

Plus real-world additions locked in the design pass: demo login gate, duplicate email guard, stale flag, unsaved-changes guard, optimistic updates, demo mode, delete candidate (added after the live check). Deploying is optional and out of this milestone (see Follow-ups).

### Out of scope
- Real authentication / user accounts / roles
- Candidate engine scoring / matching (`lib/candidate-engine`) — roadmap only
- Public marketing site changes (`/`, `/application`, `components/public`, `lib/public`)
- Owning or changing the API (shared 4Geeks playground)
- Sorting controls, bulk actions, Spanish UI, Playwright E2E
- ESLint flat-config migration

### Conflict rule
If the course brief and this file disagree, **this file wins** for implementation. Elena's acceptance criteria (labels never raw values; notes only on detail; registration has all API-required fields) are never relaxed.

---

## Narrative (portfolio)

Nexova's People team is running the Executive Assistant search (Valencia HQ; executive support, calendar/travel management, professional English and Spanish) from a spreadsheet. They found duplicate entries and a candidate untouched for two weeks. This tool fixes exactly those failures: one source of truth, duplicate email blocking, a stale flag, and a UI that always tells the user what is happening. The backend exists and is shared; the job is a frontend that "never breaks silently or leaves the user without feedback."

---

## Routes and shell

One Next.js app, one port (**3456**). Public and backoffice are separated by **route groups and layouts**, not ports.

| Route | Purpose |
|---|---|
| `/backoffice` | Redirects to `/backoffice/pipeline` |
| `/backoffice/login` | Demo login (no shell chrome) |
| `/backoffice/pipeline` | Candidate list (filters, search, pagination) |
| `/backoffice/pipeline/new` | Register candidate |
| `/backoffice/pipeline/[id]` | Candidate detail (status, stage, edit, notes) |
| `/`, `/application` | Public site — **untouched** |

**Shell:** `(app)/layout.tsx` renders the backoffice header (Nexova Backoffice, tab nav, sign-out, "Demo data" badge in demo mode) and providers. Only the **Pipeline** tab exists now; the nav is a list so future tools (incidents, inventory, knowledge base) add a tab, not a new shell. No marketing chrome in the backoffice.

---

## Demo auth

A demo gate, **not security**. The login page says so and shows the demo credentials.

- **Credentials:** constants in `lib/backoffice/auth/constants.ts` — `demo@nexova.dev` / `nexova-demo` (shown on the login page; not env vars).
- **Login:** a server action validates credentials and sets the session cookie server-side.
- **Cookie:** `httpOnly`, `sameSite=lax`, `secure` in production, `path=/backoffice`, `maxAge` 8 hours.
- **Middleware** (`middleware.ts` at repo root):
  - `matcher: ["/backoffice/:path*"]` — public routes never run it.
  - No session + not `/backoffice/login` → redirect to `/backoffice/login?next=<path>`.
  - Session + `/backoffice/login` → redirect to `/backoffice/pipeline`.
  - `next` accepted only if it starts with `/backoffice/` (no open redirect); otherwise `/backoffice/pipeline`.
- **Sign out:** header button clears the cookie → `/backoffice/login`.
- **Testable core:** `resolveAuthRedirect(pathname, hasSession, next?)` is a pure function in `lib/backoffice/auth/`; middleware only wires it.

---

## API reference

**Base URL (live):** `https://playground.4geeks.com/tracker/api/v1` · Docs: `https://playground.4geeks.com/tracker/api/v1/docs`

Shared by every course context: other people read and change the same records.

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/records?status&stage&search&page&limit` | — | 200 `{ total, page, limit, data: RecordOut[] }` |
| POST | `/records` | `RecordCreate` | 201 `RecordOut` |
| GET | `/records/{id}` | — | 200 `RecordOut` |
| PUT | `/records/{id}` | `RecordCreate` (full) | 200 `RecordOut` |
| PATCH | `/records/{id}` | `{ status?, stage? }` | 200 `RecordOut` |
| DELETE | `/records/{id}` | — | 204 |
| GET | `/records/{id}/notes` | — | 200 `{ data: Note[], meta: { total } }` |
| POST | `/records/{id}/notes` | `{ content }` (min length 1) | 201 `Note` |
| DELETE | `/records/{id}/notes/{note_id}` | — | 204 |

### Shapes
- **RecordCreate** — required: `full_name`, `email` (email), `phone`, `position`, `experience_years` (number). Optional/nullable: `linkedin_url`, `cv_url`. No `status`/`stage` on create; the server assigns initial values (expected `received` / `pending` — confirm during the first live-mode manual check). The UI always renders what the server returns.
- **RecordOut** — `id` (string), all RecordCreate fields, `status`, `stage`, `notes_count` (int), `applied_at`, `updated_at`. List responses may also include a `notes` array; **the list UI never renders notes**.
- **Note** — `id`, `record_id`, `content`, `created_at`.

### Errors
- **404** `{ "error": "Record not found" }`
- **422** `{ "detail": [{ "loc": [...], "msg": "...", "type": "..." }] }` — last `loc` segment is the field name.
- Unknown `status`/`stage` filter values are **not** rejected (200); the client drops invalid filter values from the URL before calling.

### Quirks
- Timestamps mix 3 and 6 fractional digits (`…:32.114Z`, `…:42.747578Z`). See Dates.
- No sort parameter; default order is **not** by `applied_at`. **Locked:** the list follows API order; no client-side sort (sorting one page would mislead across pages). A server-side sort parameter is a requirement for any future owned backend. Demo seed returns newest first.
- `limit` defaults to 20.

---

## Data modes

| Mode | When | Behavior |
|---|---|---|
| **Live (default)** | Variable unset → `LIVE_API_BASE_URL` (shared 4Geeks API); or set to another API URL | Real shared API |
| **Demo** | Variable set to `demo` | MSW intercepts in the browser; "Demo data" badge in header |

- **Tests are always demo:** the `pipeline` Vitest project sets `NEXT_PUBLIC_PIPELINE_API_URL=demo`, `onUnhandledRequest: "error"` fails any unmocked call, and `api.test.ts` asserts demo mode.

- Mode is decided once from config (`lib/backoffice/pipeline/config.ts`). It **never** switches because a request failed; live-mode failures show errors.
- **Demo base URL:** `https://demo.pipeline.nexova.invalid/api/v1` (`.invalid` never resolves, so if MSW isn't running requests fail loudly instead of hitting anything real).
- **Startup:** the `(app)` layout dynamically imports MSW **only in demo mode**, starts the worker, and shows a brief "Loading demo data…" screen until it's ready. No request fires before the worker is active.
- `onUnhandledRequest: "bypass"` — only pipeline API calls are mocked.
- `public/mockServiceWorker.js` is committed (generated by `npx msw init public`); `package.json` has `"msw": { "workerDirectory": ["public"] }`.
- **One set of handlers + seed data** (`lib/backoffice/pipeline/mocks/`) serves both tests and demo mode. Handlers implement filtering, search (name or email, case-insensitive), pagination, 404, and 422 like the real API.
- **Seed:** ~12 Executive Assistant candidates covering every status and every stage, several with notes, at least one stale (>14 days since `updated_at`, status Received or In progress), one fresh at 13 days, and both timestamp formats.
- Demo changes live in memory and **reset on refresh**. A deployment runs live by default; set the env var to `demo` for a demo-only deploy.

---

## Labels

Raw API values **never** appear in the UI. `lib/backoffice/pipeline/labels.ts` exports label + tone per value; components map tones to Tailwind classes (Tailwind config unchanged — `lib/` holds no class strings).

| Status (API) | Label | Tone |
|---|---|---|
| `received` | Received | neutral |
| `in_progress` | In progress | info |
| `selected` | Selected | success |
| `discarded` | Discarded | muted |

| Stage (API) | Label | Order |
|---|---|---|
| `pending` | Pending review | 1 |
| `review` | Under review | 2 |
| `personal_interview` | Personal interview | 3 |
| `technical_interview` | Technical interview | 4 |
| `offer_presented` | Offer presented | 5 |

- Badges always carry **text** (never color alone).
- An unknown value from the API renders "Unknown" and logs a console warning; it never renders the raw string.
- Status and stage are **independent** (e.g. Discarded at Personal interview is valid).

---

## Screens and behavior

### Pipeline list (`/backoffice/pipeline`)
- **Layout:** table at `md` and up; stacked cards on mobile. Columns: name, position, status, stage, last updated (+ Stale badge).
- **Rows/cards are real links** to the detail page (keyboard + middle-click work).
- **Result count:** "Showing X–Y of Z candidates".
- **Filters in URL:** `status`, `stage`, `q` (search), `page` via `searchParams`; back/forward and shared links restore the view. Filtering is done **by the API**.
- **Search:** debounced ~300ms; sent as `search=`; no page reload.
- **Changing any filter resets to page 1.** "Clear filters" appears when any filter is active.
- **Pagination:** Previous / Next + "Page X of Y"; 20 per page; buttons disabled at the ends.
- **States:** skeleton rows while loading; empty state ("No candidates match these filters" + Clear filters); inline error with Retry. Existing data stays visible while a new page/filter loads (`placeholderData: keepPreviousData`).
- **"New candidate"** button → `/backoffice/pipeline/new`.

### Candidate detail (`/backoffice/pipeline/[id]`)
- **Header:** name, position, status + stage badges, "Applied {date}", "Last updated N days ago", Stale badge when flagged.
- **Stage stepper:** all five stages in order; any stage reachable in **one click**; current stage marked with `aria-current="step"`. Collapses to a labeled select on mobile.
- **Status dropdown:** one selection = one update. No confirm step.
- **Both are optimistic** (see Async). Controls disable only for the field currently saving.
- **Contact/profile:** email (mailto), phone (tel), experience, LinkedIn and CV links (open in new tab, `rel="noopener noreferrer"`) when present.
- **Inline edit:** "Edit details" swaps the profile to a form (same fields as create) with Save / Cancel. Save = **PUT with the full RecordCreate** (status/stage not part of this form). Cancel restores values.
- **Notes (only here):** newest first, each with created date. Add form (textarea, trimmed, non-empty) → refetch after success. Delete → accessible confirm → optimistic removal.
- **Danger zone (last section):** "Delete candidate" → inline confirm "Delete {name}? This removes the candidate and all notes. This can't be undone." → **not optimistic**; buttons disabled while deleting. Success: toast "Candidate deleted", `router.replace("/backoffice/pipeline")` (Back doesn't return to the deleted page), lists invalidated. Failure: error toast, stay on the page with the confirm still open.
- **Not found:** 404 renders a "Candidate not found" state with a link back to the pipeline.

### New candidate (`/backoffice/pipeline/new`)
- Fields: full name*, email*, phone*, position*, years of experience*, LinkedIn URL, CV URL.
- Required fields marked visibly and with `aria-required`; errors linked via `aria-describedby`; focus moves to the first invalid field on submit.
- On success: toast "Candidate added", navigate to the new candidate's detail page.

### Duplicate email guard (create + edit)
- On email **blur** and again on **submit**: `GET /records?search=<email>`, then **exact, case-insensitive** comparison on `email` (search is fuzzy; exact match decides). On edit, the candidate's own `id` is excluded.
- Match → field error "A candidate with this email already exists" + link to that record; submit blocked.
- Check itself fails → inline warning with "Retry check"; the user may still submit (never trapped by a failed check).

### Stale flag
- `STALE_AFTER_DAYS = 14` (named constant in `lib/backoffice/pipeline/`).
- Flagged when `daysSince(updated_at) >= 14` **and** status is Received or In progress. Selected/Discarded never flagged.
- Text badge "Stale" (not color alone) on list and detail.
- Boundary: 13 days → not stale; 14 days → stale.

### Unsaved changes guard
- Applies to the new-candidate form and inline edit.
- **Dirty** = form values differ from defaults (React Hook Form `isDirty`).
- `beforeunload` prompt when dirty (refresh/close tab).
- In-app backoffice links use a shared `GuardedLink` component that asks "Discard changes?" when dirty.
- Browser Back is **not** intercepted (documented limitation).

### Note delete confirm
- Small accessible dialog: focus moves to it, Escape cancels, focus returns to the delete button; buttons have `aria-label`s naming the note's date.

### Candidate delete confirm
- Same pattern as note delete (inline `alertdialog`, focus to Cancel, Escape cancels, focus returns to "Delete candidate"). No type-the-name step. Escape/Cancel are ignored while the request is in flight.

---

## Validation

Zod 4 schemas in `lib/backoffice/pipeline/schemas.ts` are the single source for form rules **and** API response parsing.

| Field | Rule |
|---|---|
| `full_name` | trimmed, 2–120 chars |
| `email` | trimmed, lowercased for comparison, valid email |
| `phone` | trimmed, 7–20 chars of digits, spaces, `+`, `-`, `(`, `)` |
| `position` | trimmed, 2–120 chars |
| `experience_years` | number, 0–60 (decimals allowed, matches API `number`) |
| `linkedin_url`, `cv_url` | optional; empty → `null`; otherwise valid `http(s)` URL |
| Note `content` | trimmed, min 1 char |

- Responses are parsed with `RecordOutSchema`, `RecordListSchema`, `NoteSchema`, `NoteListSchema`. A response that fails parsing is treated as an error ("Unexpected response from the server") and logged — never rendered half-broken.
- API 422 errors map to field errors via `loc`'s last segment; unmatched ones show as a form-level message.

---

## Dates

`lib/backoffice/pipeline/dates.ts` is the only place dates are parsed, compared, or formatted.

- `parseApiDate(value)` — accepts both 3- and 6-digit fractional seconds; throws on invalid.
- `daysSince(date, now)` — whole days; `now` injected for tests.
- `formatDate(date)` → "Sep 1, 2026"; `formatRelative(date, now)` → "3 days ago" (`Intl`, `en-US`).
- `isStale(record, now)` uses `daysSince` + `STALE_AFTER_DAYS`.
- Fixtures contain both timestamp formats.

---

## Async, errors, and feedback

**Rule:** every request has a visible loading state, a visible success or error outcome, and a way forward. Nothing fails silently.

### API client (`lib/backoffice/pipeline/api.ts`)
- Thin async/await functions per endpoint; `fetch` with a 10s timeout (`AbortSignal.timeout`).
- Throws a typed `PipelineApiError { kind: "network" | "timeout" | "not_found" | "validation" | "server" | "parse", status?, fieldErrors?, message }` with a **human-readable** message. Raw errors go to `console.error` only.

### TanStack Query v5
- `QueryClientProvider` lives in `(app)/layout.tsx` (client boundary).
- **Query keys** (`queryKeys.ts`): `["records", "list", filters]`, `["records", "detail", id]`, `["records", "detail", id, "notes"]`. Invalidating `["records"]` refreshes everything.
- Thin hooks in `lib/backoffice/pipeline/hooks/` (`useRecords`, `useRecord`, `useNotes`, `useCreateRecord`, `useUpdateRecord`, `useUpdateStatusStage`, `useAddNote`, `useDeleteNote`, `useDeleteRecord`).
- Queries: retry up to **2** on network/timeout/5xx; **never** on 404/422. `staleTime` 30s.
- Mutations: **never** auto-retry.

### Update strategy
| Action | Strategy |
|---|---|
| Status / stage change | **Optimistic**: update detail + list caches, rollback on error, error toast, invalidate on settle |
| Note delete | **Optimistic**: remove from notes cache, rollback on error |
| Create candidate | Wait for server, then navigate + invalidate `["records"]` |
| Edit details (PUT) | Wait for server, then invalidate |
| Add note | Wait for server, then invalidate notes + detail (`notes_count`) |
| Delete candidate | Wait for server; mark detail stale without refetch (still mounted), invalidate lists, then `router.replace` to the list |

### Error surfaces
| Situation | UI |
|---|---|
| List/detail/notes load fails | Inline message + **Retry** in place of the content |
| Record 404 | "Candidate not found" state + link to pipeline |
| 422 on submit | Field-level messages |
| Mutation fails | Error toast (with Retry where meaningful); optimistic changes rolled back |
| Render crash | Scoped error boundary (list, detail, notes separately) with "Try again" |

### Toasts (Sonner)
- Single `<Toaster />` in the backoffice layout; called only through `notify.success` / `notify.error` (`lib/backoffice/notify.ts`).
- Success ~4s; errors stay longer and offer Retry when applicable.
- **No double messaging:** if an error is shown inline (field errors, load errors), no toast for it.
- Messages use UI labels ("Status changed to In progress"), never raw values.

---

## Accessibility and responsive
- Mobile, tablet, desktop for every screen (table ↔ cards; stepper ↔ select).
- All controls keyboard-operable with visible focus; form labels associated; live region for async status where toasts aren't enough.
- Color is never the only signal (badges, stale flag, errors all have text).

---

## Folder ownership

```
middleware.ts                                  # /backoffice/* guard only
app/(backoffice)/backoffice/
  page.tsx                                     # redirect → /backoffice/pipeline
  login/page.tsx                               # demo login + server action
  (app)/
    layout.tsx                                 # shell, QueryClientProvider, demo bootstrap, Toaster
    pipeline/
      page.tsx                                 # list
      new/page.tsx                             # create
      [id]/page.tsx                            # detail
components/backoffice/
  shell/                                       # header, tabs, sign-out, demo badge, GuardedLink
  pipeline/                                    # table, cards, filters, pagination, badges, stepper,
                                               # status select, forms, notes, confirm dialog, states
lib/backoffice/
  notify.ts
  auth/                                        # constants, actions (server), redirect (pure)
  pipeline/
    config.ts                                  # mode, base URL, page size, thresholds
    api.ts  schemas.ts  labels.ts  dates.ts
    queryKeys.ts  queryClient.ts  filters.ts  stale.ts
    hooks/                                     # queries, mutations, useDuplicateEmailCheck
    mocks/                                     # seed, db (in-memory), handlers, browser, server
components/backoffice/test-utils.tsx           # next/navigation stand-in + provider render helper
public/mockServiceWorker.js
vitest.setup.pipeline.ts
```

- `lib/backoffice/**` imports nothing from `components/`, `app/`, `lib/public/`, or `lib/candidate-engine/`.
- Public code never imports backoffice code.

---

## Stack and dependencies

Major versions are locked here; npm picks the latest within each; `package-lock.json` records exact versions. Peer-dependency warnings are resolved, not ignored.

| Purpose | Package | Major |
|---|---|---|
| Data fetching | `@tanstack/react-query` | 5 |
| Validation | `zod` | 4 |
| Forms | `react-hook-form` | 7 |
| Form ↔ Zod | `@hookform/resolvers` | 5 (required for Zod 4) |
| API mocking | `msw` | 2 |
| Toasts | `sonner` | latest |
| Tests: rendering | `@testing-library/react` | 16 |
| Tests: required peer | `@testing-library/dom` | 10 |
| Tests: interactions | `@testing-library/user-event` | 14 |
| Tests: matchers | `@testing-library/jest-dom` | 6 |
| Tests: DOM | `jsdom` | latest |
| Tests: React transform | `@vitejs/plugin-react` | 5 (6 pulls Vite 8) |
| Tests: single Vite for Vitest + plugin | `vite` | 7 (explicit devDependency so only one Vite is installed) |
| Optional: cache inspector | `@tanstack/react-query-devtools` | 5 (dev only) |

- **Node:** `engines.node` `>=20.19`; `.nvmrc` = `24` (Vitest 3 → Vite 7 requires ^20.19 or >=22.12).
- **Env:** `.env.example` committed with one blank variable; overrides in `.env.local` (gitignored, optional). Never create a plain `.env` (it would be committed).

```bash
# Leave blank for live mode: the shared 4Geeks tracker API (the default).
# Set to "demo" for mock data served in the browser.
NEXT_PUBLIC_PIPELINE_API_URL=
# NEXT_PUBLIC_PIPELINE_API_URL=demo
```

- `NEXT_PUBLIC_*` is baked in at build time: restart dev / redeploy after changing. Never put secrets in it.

---

## Test setup

One `vitest.config.ts` with two projects:

| Project | Includes | Environment |
|---|---|---|
| `engine` | `lib/candidate-engine/**/*.test.ts` | node |
| `pipeline` | `lib/backoffice/**/*.test.{ts,tsx}`, `components/backoffice/**/*.test.tsx`, `middleware.test.ts` | jsdom + `vitest.setup.pipeline.ts` |

- `vitest.setup.pipeline.ts`: jest-dom matchers, MSW node server (`listen` / `resetHandlers` / `close`), reset seed data between tests.
- **Known jsdom quirk:** jsdom replaces `AbortSignal`, and Node's `fetch` rejects jsdom signals. The setup file wraps MSW's patched `fetch` to honor the signal without passing it through. Test-only; browser code is unaffected.
- Component tests mock `next/navigation` with `components/backoffice/test-utils.tsx` (a subscribable URL, so filter changes re-render like the real router).
- `@vitejs/plugin-react` and the `@/` alias in config.
- Scripts: `fundamentals` → engine project only; `test:pipeline` → pipeline project; `test` → both; `typecheck` → `tsc --noEmit`.
- The engine's existing 21 tests must keep passing unchanged.

### Test plan (required)
- **Labels:** every status and stage has a label and a tone; unknown value → "Unknown".
- **Dates:** both timestamp formats parse; `daysSince` with injected `now`.
- **Stale:** 13 days not flagged, 14 flagged; Selected/Discarded never flagged.
- **Filters:** URL ↔ filter state round-trip; invalid values dropped; filter change resets page.
- **Auth redirect:** unauthenticated → login with `next`; login while authenticated → pipeline; external/`//` `next` ignored; public paths never redirected.
- **Schemas:** required fields, URL empty → null, response parsing rejects malformed data.
- **List (RTL + MSW):** skeleton → rows with labels (no raw values); filter + search update URL and results; empty state; error + Retry.
- **Detail:** status/stage change is optimistic and rolls back on server error with an error toast; 404 state.
- **Notes:** add → appears; delete confirm (Escape cancels) → removed; failed delete restores it.
- **Delete candidate:** Cancel keeps the record and returns focus; confirm → toast, `router.replace` to the list, record gone; failed delete → error toast, no redirect, stays on the page.
- **Create/edit:** field errors; duplicate email blocked (case-insensitive) with link; failed check allows submit; 422 → field errors.

### Live-mode manual check (shared API)
Automated tests never hit the live API. For manual checks in live mode:
- Name every test record `[TEST] …` with an `@example.com` email; never enter real personal data.
- Checklist: create → edit → change status → change stage → add note → delete note → filter/search/paginate → delete the test record with the detail page's "Delete candidate" button (fallback: `DELETE /records/{id}` on the API docs page).
- Totals and pages can shift because others edit the same data; that's expected.

---

## Done checks

Every step must pass before moving on:

| Check | Command |
|---|---|
| Lint (errors block; `next lint` deprecation notices don't) | `npm run lint` |
| Types | `npm run typecheck` |
| Engine tests | `npm run fundamentals` |
| Pipeline tests | `npm run test:pipeline` |
| Production build | `npm run build` |

No `eslint-disable` without an explaining comment.

### Known advisories (accepted)

`npm audit` reports 4 advisories (1 high, 3 moderate). Neither issue is reachable in this project, and both fixes are major upgrades, so they are accepted and scheduled as follow-ups rather than forced in.

| Advisory | Where | Why it's not reachable | Planned fix |
|---|---|---|---|
| PostCSS (high): XSS via unescaped `</style>`; `.map` file disclosure via `sourceMappingURL` | Next.js's private copy (`node_modules/next/node_modules/postcss`); build-time only | Requires attacker-controlled CSS; the only CSS is our own `globals.css` + Tailwind output | Next.js 16 upgrade (no patched 15.x), paired with the ESLint migration |
| Vitest / `@vitest/mocker` (moderate): file read via malicious mock redirect | Test tooling only; never shipped | Requires hostile code inside our own test files | Vitest 4.1.11+ upgrade with a full test re-run |

Never run `npm audit fix --force` here: it would install Next 16 and Vitest 5 together.

---

## Engine integration roadmap (not this phase)

The pipeline API record lacks what the engine scores on (skills, seniority, English level, salary expectation, remote). A future matching phase would add:
- An adapter at `lib/backoffice/pipeline/matching/` mapping pipeline records + extra data → engine `Candidate`.
- A "Match" panel slot on the detail page.
- A decision on where missing fields come from (form extension vs separate store).
Until then: **no imports** from `lib/candidate-engine` in backoffice code.

---

## Anti-drift evals

Ask before merging each step; any "no" means stop and fix.
1. Could a user ever see a raw API value (`in_progress`, `personal_interview`, …)?
2. Does every request show loading, success/error, and a way forward?
3. Are notes rendered anywhere other than the detail page?
4. Does the create form require every API-required field?
5. Can status or stage be changed in one interaction from the detail page?
6. Do filters/search work without a page reload, and survive refresh via the URL?
7. Does anything under `/` or `/application` change, or import backoffice code?
8. Does demo mode ever activate because a live request failed?
9. Is any backoffice code importing `lib/candidate-engine`?
10. Did a feature from the follow-ups list sneak in?
11. Is every screen usable on mobile, tablet, and desktop?
12. Do all Done checks pass?

---

## Ship checklist (anti-drift)

### Scope gates
- [x] Public site untouched; middleware matcher is `/backoffice/:path*` only
- [x] No engine imports; no real auth
- [x] Follow-ups not implemented

### Elena's acceptance criteria
- [x] List shows name, position, status, stage (labels only)
- [x] Filter by status and stage; search by name or email; no reload
- [x] Detail: status and stage each change in one interaction
- [x] Notes: add and delete; visible only on detail
- [x] Register with all API-required fields; edit corrects data

### Real-world behavior
- [x] Demo login gate with safe `next` redirect and sign-out
- [x] Live by default; demo mode (MSW) when env is `demo`; "Demo data" badge; never auto-fallback; tests forced to demo
- [x] Filters/search/page in URL; debounced search; clear filters; pagination
- [x] Duplicate email guard on create and edit
- [x] Stale flag (14 days, Received/In progress only) + "Last updated N days ago"
- [x] Optimistic status/stage/note delete with rollback
- [x] Delete candidate: confirm, wait for server, redirect to list
- [x] Unsaved-changes guard (beforeunload + GuardedLink)
- [x] Error surfaces per table; toasts via `notify`; no double messaging
- [x] Skeletons, empty states, not-found state
- [x] Responsive + accessible (keyboard, labels, text-not-color)

### Tooling and quality
- [x] `engines` `>=20.19`, `.nvmrc` 24, `.env.example`, `mockServiceWorker.js` in repo (commit pending)
- [x] Vitest projects; engine 21 tests still pass
- [x] Test plan covered (67 pipeline tests)
- [x] All Done checks pass
- [x] README section (demo video link placeholder)
- [x] `npm run dev:backoffice` opens Firefox at `/backoffice`
- [x] Known advisories reviewed and documented
- [x] Live-mode manual check against the shared API (create starts as Received / Pending review)

---

## Closed decisions (this phase)

- [x] Backoffice at `/backoffice`, tabbed shell; pipeline at `/backoffice/pipeline` (+ `/new`, `/[id]`); single port 3456
- [x] Demo auth: server-set session cookie + middleware; credentials shown on login; "not real auth" note
- [x] Data: live 4Geeks API by default (env unset); MSW demo mode when env is `demo`; no auto-fallback; tests always demo (reversed the earlier demo-by-default lock at the user's request)
- [x] Create on its own page; edit inline on detail (PUT full record)
- [x] No engine integration; documented roadmap
- [x] Branch `talent-pipeline-tracker`
- [x] Optimistic for status/stage/note delete; refetch for create/edit/add note
- [x] Filters in URL, filtered by API; debounced search; clear filters; empty state
- [x] Previous/Next pagination, 20 per page, reset to page 1 on filter change
- [x] TanStack Query v5 + thin hooks
- [x] Stage stepper + status dropdown, independent fields
- [x] Zod 4 + React Hook Form; schemas also parse responses
- [x] Vitest + RTL + MSW (`npm run test:pipeline`); Playwright follow-up
- [x] Table ≥ md, cards on mobile; text badges; row links; result count; skeletons
- [x] Accessible note-delete confirm
- [x] Folder map as above
- [x] Duplicate email (case-insensitive) blocks create/edit; failed check never traps the user
- [x] Stale flag: 14 days, named constant, Received/In progress only
- [x] Unsaved guard: beforeunload + GuardedLink; Back not intercepted
- [x] Error surfaces + retry policy (queries ≤2, mutations 0)
- [x] Sonner via `notify` wrapper
- [x] No deploy this milestone; a demo video replaces screenshots (deploy notes kept for later)
- [x] English-only UI; candidate data shown as entered
- [x] Node `>=20.19` + `.nvmrc` 24
- [x] `lib/` returns label + tone; components own classes; Tailwind config unchanged
- [x] One Vitest config, `engine` + `pipeline` projects
- [x] MSW worker committed; start only in demo mode; wait before fetching; bypass unmatched; shared handlers/seed
- [x] Dependency majors locked; lockfile holds exact versions
- [x] Middleware scoped to `/backoffice`; pure `resolveAuthRedirect` tested
- [x] Single date helper; both timestamp formats in fixtures
- [x] Live-mode manual checks: `[TEST]` prefix, `@example.com`, clean up
- [x] `.env.example` with one blank variable; `.env.local` for real values
- [x] `next lint` deprecation non-blocking; `typecheck` script; Done checks gate every step
- [x] List order follows the API; no client-side sort; server-side sort required from any future owned backend
- [x] `npm audit` advisories accepted with documented reasons; major upgrades scheduled as follow-ups
- [x] `npm run dev:backoffice` added; `npm run dev` unchanged (one command per surface, no `cd`)
- [x] Delete candidate in scope: Danger zone at the bottom of detail, simple inline confirm (no type-the-name), not optimistic, `router.replace` to the list
- [x] Stay one app for now; split the backoffice into its own app only when one of: separate release cadence, different security boundary (VPN/SSO/own domain), separate teams, or build/dependency pain

## Open decisions (do not invent)

- None for this milestone.

---

## Follow-ups (explicitly not this phase)

Demo video link in README · deploy to Vercel in demo mode (optional) · Next.js 16 upgrade + ESLint flat-config migration (clears PostCSS advisory) · Vitest 4.1.11+ upgrade (clears mocker advisory) · Playwright E2E · engine matching panel · time-in-stage · configurable stale thresholds · reminders · "needs attention" filter · undo for note delete · draft autosave · Spanish UI · real auth + profiles + roles (own CONTEXT) · sortable columns (requires server-side sort) · bulk actions

---

## Changelog

| Date | Change |
|---|---|
| 2026-09-29 | Initial CONTEXT — Talent Pipeline Tracker; all design-pass and pitfall locks recorded; API verified against live OpenAPI spec |
| 2026-09-29 | Implemented on `talent-pipeline-tracker` (uncommitted): shell, demo auth, list/detail/create, demo mode, 63 pipeline tests; Done checks green. Pinned `@vitejs/plugin-react` 5 + `vite` 7; documented jsdom fetch/AbortSignal test shim. Remaining: screenshots, live-mode check, Vercel deploy |
| 2026-09-29 | Wrap-up locks: list follows API order (open decision closed); screenshots replaced by demo video; deploy moved to optional follow-up; `npm audit` advisories documented as accepted; `npm run dev:backoffice` added; one-app split criteria recorded. Remaining: live-mode manual check |
| 2026-09-29 | Live check in progress: create starts as Received / Pending review; duplicate guard, edit, status/stage, note add/delete OK. Added delete candidate (Danger zone, confirm, not optimistic, redirect); 66 pipeline tests |
| 2026-09-29 | Live is now the default data mode (env unset → shared API; `demo` → MSW). Tests forced to demo via Vitest `env` + a guard test; 67 pipeline tests |
| 2026-09-29 | Live-mode manual check complete: create, duplicate guard, edit, status/stage, notes, search/filter/pagination, delete candidate all OK against the shared API; test record deleted. Ship checklist fully checked |
