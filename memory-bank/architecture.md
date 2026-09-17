# Nexova system architecture

Hot-path map for how the product is split. Product copy and form field truth stay in `historical-reference/product-context.md`. Stack/run details stay in `techContext.md`.

## Surfaces

| Surface | Audience | Status | Local address |
|---|---|---|---|
| **Public website** | Candidates + company visitors | Active (v1) | `http://127.0.0.1:3456/` |
| **Backoffice UI** | Internal Nexova staff | Planned | `http://127.0.0.1:3456/backoffice` (same Next process) |
| **API** | App + integrations | Planned | `http://127.0.0.1:4000` (only if split out later) |
| **Workers** | Jobs / SLA automation | Planned | `http://127.0.0.1:4001` (reserved) |

Canonical port map: `config/ports.json` · list live status with `npm run ports`.

### Why public + backoffice share one port
Both are Next.js App Router surfaces (`(public)` vs `(backoffice)`). Keeping them on **3456** avoids juggling UIs across ports. Reserve **separate ports** only for true separate processes (standalone API, workers, DB UIs).

### Cursor Ports panel (local vs remote)
Cursor’s **Ports** view reliably auto-fills on **remote** setups (Codespaces / SSH) — that’s why older remote projects showed ports. On a **local Mac folder**, that panel often stays empty even when Node is listening. Use `npm run ports` as the source of truth for “which localhost is which.”

Keep these surfaces **separated in code** even while they share one Next.js process for now.

```text
┌─────────────────────────────────────────────────────────┐
│                     Next.js app                         │
│                                                         │
│  (public)          marketing + talent intake            │
│     /              landing                              │
│     /application   talent form (client validate only)   │
│                                                         │
│  (backoffice)      future — auth-gated internal tools   │
│     /backoffice    dashboard, leads, SLA, commercial    │
│                                                         │
│  shared later      APIs, DB, auth, integrations         │
└─────────────────────────────────────────────────────────┘
```

## Folder ownership

```text
app/
  layout.tsx                 # root only: html/body, fonts, global CSS
  (public)/                  # PUBLIC WEBSITE — no auth
    layout.tsx               # marketing chrome (header/footer)
    page.tsx                 # /
    application/page.tsx     # /application
  (backoffice)/              # reserved; add when building internal tools
    backoffice/
      layout.tsx             # (future) backoffice chrome + auth gate
      page.tsx               # (future) /backoffice

components/
  public/                    # marketing UI only
  backoffice/                # internal UI only (empty until that phase)

lib/
  public/                    # schema, talent validation, public helpers
  backoffice/                # auth helpers, CRM adapters, SLA logic (later)
```

### Rules
1. **Do not** import `components/backoffice/*` from `(public)` routes.
2. **Do not** put marketing header/footer on backoffice layouts.
3. Public talent form stays client-validated until a backend/API phase wires intake to CRM/ATS.
4. Backoffice gets its own layout, navigation, and auth — never reuse the public marketing shell as the admin chrome.
5. Shared primitives (buttons, inputs) can move to `components/ui/` later if both surfaces need them; don’t preemptively abstract.

## Phase map

| Phase | What ships | Touches |
|---|---|---|
| **Now** | Public site v1 (landing + talent form) | `app/(public)`, `components/public`, `lib/public` |
| **Next** | Backoffice shell + auth | `app/(backoffice)/backoffice`, `components/backoffice`, auth provider |
| **Later** | Lead inbox, search/SLA ops, commercial workflows | backoffice modules + APIs; commercial appendix in product context |

## Why one repo for now
- Faster early iteration (one `npm run dev`)
- Clear route-group boundary already mirrors future split
- Can extract `apps/web` + `apps/backoffice` later without rewriting product concepts

If/when the backoffice grows large (separate deploy, different team cadence), split into a monorepo `apps/` layout and keep this doc as the source of truth for boundaries.
