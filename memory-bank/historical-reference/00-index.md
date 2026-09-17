---
id: nexova.hr.00
title: Continuity index
status: active
last_reviewed: 2026-09-16
---

# Nexova — historical reference index

**Read policy:** cold path only. Prefer the single product context file — don’t bulk-load this folder.

## Primary document
| Need | File |
|---|---|
| Company + first public site + form + ship checklist + commercial appendix | **`product-context.md`** |

## Glossary
| Term | Meaning |
|---|---|
| Nexova | HR consulting & talent acquisition firm |
| Headhunting | Executive / mid-management search & selection |
| Support outsourcing | Client-branded support agents hired/trained/managed by Nexova |
| Corporate training | Soft skills & leadership programs (4/8/12 weeks) |
| Talent pool form | Candidate registration (not B2B sales) |
| Public site v1 | First fully responsive landing + talent form ship |

## Canonical facts (summary)
- Founded 2011 · HQ Valencia, ES · Miami, FL, US
- Public contact: contact@nexova.com · +34 960 123 456 · +1 305 555 0191
- First ship: Tailwind, Schema.org Organization, **fully responsive / mobile-first**
- Form = talent only; companies → contact@nexova.com
- Full product truth: `product-context.md`

## Ownership
| Concept | Owning file |
|---|---|
| Product context + first-ship build guide | `product-context.md` |
| Stack / responsive / run architecture | `../techContext.md` (hot path) |
| Continuity / open decisions | this file |

## Closed decisions
- [x] Base website language: **English** (default)
- [x] Second language in v1: **Spanish** via header EN/ES toggle (`product-context.md` Language)

## Open decisions (do not invent)
- [ ] Exact experience wording (“since 2011” vs “12 years” vs “over 10 years”)
- [ ] Whether “Latin American market” stays in Why Nexova copy
- [ ] Footer copyright year policy (copy currently shows © 2025)
- [ ] Confirm real LinkedIn/Instagram URLs vs schema placeholders

## Conflict rule
`00-index` → `product-context.md` → changelog in that file.  
Ship checklist never overrides landing/form field names, copy, or domain values in `product-context.md`.
