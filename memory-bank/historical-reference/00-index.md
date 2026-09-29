---
id: nexova.hr.00
title: Continuity index
status: active
last_reviewed: 2026-09-29
---

# Nexova — historical reference index

**Read policy:** cold path only. Prefer the owning context file for the surface you’re building — don’t bulk-load this folder.

## Primary documents
| Need | File |
|---|---|
| Company + first public site + form + ship checklist + commercial appendix | **`product-context.md`** |
| Candidate / vacancy matching engine (Programming Fundamentals) | **`programming-fundamentals-context.md`** |
| Backoffice shell + Talent Pipeline Tracker | **`talent-pipeline-context.md`** |

## Glossary
| Term | Meaning |
|---|---|
| Nexova | HR consulting & talent acquisition firm |
| Headhunting | Executive / mid-management search & selection |
| Support outsourcing | Client-branded support agents hired/trained/managed by Nexova |
| Corporate training | Soft skills & leadership programs (4/8/12 weeks) |
| Talent pool form | Candidate registration (not B2B sales) |
| Public site v1 | First fully responsive landing + talent form ship |
| Candidate | Engine entity: person in the talent database (`programming-fundamentals-context.md`) |
| Vacancy | Engine entity: open client position to fill |
| SelectionProcess | Engine entity: candidate progress through a vacancy pipeline |
| Match score | Explainable 0–100 fit score (`total` + `breakdown`) between candidate and vacancy |
| Candidate engine v0 | In-memory typed TS utils under `lib/candidate-engine/` for scoring / shortlist logic |
| Pipeline record | A candidate application in the shared 4Geeks tracker API (`talent-pipeline-context.md`); separate from engine `Candidate` |
| Status / Stage | Independent pipeline fields; UI shows labels only (e.g. `in_progress` → "In progress") |
| Stale | Received / In progress record not updated for 14+ days |
| Demo mode | Backoffice running on in-browser MSW data when no API URL is configured |

## Canonical facts (summary)
- Founded 2011 · HQ Valencia, ES · Miami, FL, US
- Public contact: contact@nexova.com · +34 960 123 456 · +1 305 555 0191
- First ship: Tailwind, Schema.org Organization, **fully responsive / mobile-first**
- Form = talent only; companies → contact@nexova.com
- Full public product truth: `product-context.md`
- Engine contracts (types, scoring, evals): `programming-fundamentals-context.md`

## Ownership
| Concept | Owning file |
|---|---|
| Product context + first-ship build guide | `product-context.md` |
| Candidate engine v0 + scoring + engine validations | `programming-fundamentals-context.md` |
| Backoffice shell, demo auth, pipeline API client, labels, pipeline evals | `talent-pipeline-context.md` |
| Stack / responsive / run architecture | `../techContext.md` (hot path) |
| Continuity / open decisions | this file |

## Closed decisions
- [x] Base website language: **English** (default)
- [x] Second language in v1: **Spanish** via header EN/ES toggle (`product-context.md` Language)
- [x] Programming Fundamentals / candidate engine v0 lives under `lib/candidate-engine/`; contracts in `programming-fundamentals-context.md`
- [x] Public talent-form fields and engine `Candidate` model are intentionally separate until a mapping phase
- [x] Backoffice lives on the same app/port at `/backoffice`; first tool is the Talent Pipeline Tracker (`talent-pipeline-context.md`)
- [x] Pipeline records (4Geeks API) and engine `Candidate` stay separate; backoffice does not import the engine until a matching phase
- [x] Pipeline list follows API order (no client-side sort); see `talent-pipeline-context.md`

## Open decisions (do not invent)
- [ ] Exact experience wording (“since 2011” vs “12 years” vs “over 10 years”)
- [ ] Whether “Latin American market” stays in Why Nexova copy
- [ ] Footer copyright year policy (copy currently shows © 2025)
- [ ] Confirm real LinkedIn/Instagram URLs vs schema placeholders
## Conflict rule
`00-index` → owning context file for the surface → changelog in that file.  
- Public site: ship checklist never overrides landing/form field names, copy, or domain values in `product-context.md`.  
- Engine: scoring, types, and evals never override this index’s continuity rules; details live in `programming-fundamentals-context.md`.
- Pipeline: the course brief is a guideline; `talent-pipeline-context.md` wins for implementation, but Elena’s acceptance criteria are never relaxed.
