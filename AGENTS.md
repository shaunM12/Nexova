# Nexova — agent protocol (v2 / scoped)

## Scope first
- Treat Goal / Scope / Out-of-scope in the user prompt as binding.
- Build in phases. Don’t assume backoffice or full automation exists until that phase says so.
- Prefer line-range reads; don’t bulk-load docs.

## Context read policy (token control)
| Path | When to read |
|---|---|
| `AGENTS.md` (this file) | Always applicable |
| `memory-bank/README.md` | First orientation only |
| `memory-bank/architecture.md` | When work spans public vs backoffice, routing, or folder ownership |
| `memory-bank/techContext.md` | Stack, Tailwind/responsive, run commands, current routes |
| `memory-bank/historical-reference/product-context.md` | Public site / talent form product truth |
| `memory-bank/historical-reference/programming-fundamentals-context.md` | Candidate engine v0 (types, scoring, validations, evals) |
| `memory-bank/historical-reference/00-index.md` | Continuity / open decisions / conflicts only |
| Other `historical-reference/` files | Only when the user asks or names them |

**Never** bulk-read `historical-reference/`.

## Continuity
1. `00-index.md` wins on glossary / open decisions.
2. `architecture.md` owns public vs backoffice boundaries.
3. `product-context.md` owns public company copy, form fields, ship checklist, commercial appendix.
4. `programming-fundamentals-context.md` owns candidate-engine types, scoring, engine validations, and fundamentals evals.
5. Ship checklist never overrides landing/form copy, fields, or domain values.
6. Do not merge public talent-form fields into engine `Candidate` unless a mapping phase says so.

## Surfaces
- **Public website** (`app/(public)`, `components/public`, `lib/public`) — active.
- **Backoffice** (`app/(backoffice)/backoffice`, `components/backoffice`, `lib/backoffice`) — planned; do not mix marketing chrome into admin UI.

## First public ship (defaults)
- Fully responsive, mobile-first landing + talent form (Next.js + React).
- Tailwind only; client-side form validation; no backend yet.
- Build from `product-context.md`; structure from `architecture.md` + `techContext.md`.

## Responsive mandate
Every public UI deliverable must work across mobile, tablet, and desktop.
