---
id: nexova.hr.context
title: Nexova product context
status: active
depends_on: [nexova.hr.00]
canonical_for:
  - company-identity
  - service-definitions
  - fees
  - delivery-slas
  - public-site-v1
  - landing-ia
  - landing-copy
  - seo-schema
  - talent-form-fields
  - validations
  - ship-checklist
last_reviewed: 2026-09-16
---

# Nexova — product context

First product context file for this repo. Use it when building the public site (or when you ask for it by name). Keep it cold-path: don’t auto-load other historical docs unless needed.

**Companion:** `../techContext.md` for stack layout, Tailwind/responsive architecture, and how to run locally.

Nexova is being built in phases. This file defines the company, the first public surface, and how to ship it without drifting. Later phases (automation, CRM, SLA tooling) should extend this context — not fight it.

---

## How to use this file

| You’re doing… | Read |
|---|---|
| Building the first public site + talent form | Company → First ship → Landing → Form → Ship checklist |
| Stack / responsive architecture only | `../techContext.md` + Responsive section below |
| Future sales/ops automation | Commercial appendix (not public-site copy) |
| Naming / open decisions | `00-index.md`, then this file |

### Suggested build order
1. Scaffold Next.js + React + Tailwind (`../techContext.md`)
2. Ship a **responsive** landing at `/` — mobile-first
3. Ship the talent form at `/application` (client validation)
4. Connect nav/CTA; show the company redirect note on the form page
5. Add Organization JSON-LD on the landing page
6. Smoke-test mobile / tablet / desktop, then run the ship checklist

**Out of scope for this first ship:** backend wiring, CRM, publishing full pricing/SLA on the marketing site.

---

## Company

Nexova is a human resources consulting and talent acquisition firm founded in **2011**.

| | |
|---|---|
| HQ | Valencia, Spain |
| US office | Miami, Florida |
| Scale | ~120 people · ~USD 8M annual revenue |
| Focus clients | Mid-sized companies in technology, retail, and financial services |
| Marketing lead | Carmen Ruiz |
| Public email | **contact@nexova.com** |
| Valencia | +34 960 123 456 |
| Miami | +1 305 555 0191 |
| Social | [LinkedIn](https://linkedin.com/company/nexova) · [Instagram](https://instagram.com/nexova) |

The old site (~2019) is slow, hard to use, and doesn’t match how the firm positions itself now. Interest still lands in a generic inbox (`info@nexova.com`) with no structure. The first product slice replaces that with a modern, **fully responsive** public site and a real talent-pool form for candidates (companies keep emailing `contact@nexova.com`).

### Service lines (sold independently)
1. **Executive and mid-management headhunting** — direct search, competency evaluation, reference checks. Marketing average ~6–8 weeks to shortlist (detail in the commercial appendix).
2. **Customer support outsourcing** — hire, train, and manage agents who work under the client’s brand; supervision + monthly reporting; minimum **5 agents**; aimed at technology companies.
3. **Corporate training** — soft skills and leadership; 4 / 8 / 12 week programs; in-person, virtual, or hybrid; diagnostic, live sessions, certificate.

---

## First ship: public site v1

Goal: a credible digital front door.
- **Landing** (`/`) — who we are, what we offer, why teams work with us
- **Talent form** (`/application`) — structured candidate intake; client-side validation only for now

The site must feel like a real product on phone, tablet, and desktop — **mobile-first and fully responsive**, not a desktop mockup squeezed into a browser.

### App surface (Next.js + React)
| Route / module | Purpose |
|---|---|
| `/` (`app/(public)/page.tsx`) | Landing + Organization schema |
| `/application` (`app/(public)/application/page.tsx`) | Talent form page |
| `components/public/TalentForm.tsx` + `lib/public/talentValidation.ts` | Live + submit validation, success state, clear/reset |
| `README.md` | How to run locally (`npm run dev`) |

Public vs backoffice boundaries: `../architecture.md` and `../techContext.md`.

### Product bar
- Tailwind utilities only (custom CSS only when there’s no clean alternative)
- Fluid, responsive layout with sensible `sm:` / `md:` / `lg:` usage
- Accessible: semantic HTML, associated labels, ARIA when it helps, keyboard use, image `alt`
- SEO: Schema.org **Organization** JSON-LD on the landing page
- Form copy, options, and validation match this file exactly
- Solid performance (aim Lighthouse / PageSpeed **≥ 80**, preferably **> 90**)
- Easy local preview via `npm run dev`

### Language
- **Default language: English (`en`)** — all public copy, form labels, validation messages, and `html[lang]` start in English.
- **Spanish toggle (`es`)** — a persistent EN/ES control in the site header switches the full public surface (landing, application page, header, footer, form labels/options/errors, success states). Preference is stored in `localStorage` (`nexova-locale`).
- Canonical field names, option **values**, and English error copy in this file remain the source of truth; Spanish is a presentation layer over the same structure.
- Do not invent a third language without updating `00-index.md`.

---

## Responsive rules

1. Style for small screens first; layer breakpoints up
2. Fluid width (`w-full`, `max-w-*`) — avoid fixed layouts that break on phones
3. Stack services / Why Nexova on small screens; multi-column from `md:` / `lg:`
4. Keep header/nav usable on mobile
5. Full-width form controls on small screens; clear focus, error, and success states
6. Check ~375, ~768, and ≥1024 before you call it done

More architecture detail lives in `../techContext.md`.

---

## Landing page

### Section order

**Header** — Nexova name/logo · nav: Home | Services | Talent | Contact · works on small screens

**Hero**
- Headline: `We build exceptional teams for growing companies`
- Subheadline: `Human resources consulting and talent acquisition firm with over 10 years helping technology, retail, and financial services companies find and develop the best talent.`
- CTA: `Join our talent pool` → `/application`

**Services** (three columns on large screens; stack on mobile)
1. **Executive Headhunting** — executive and mid-management search · personalized process with replacement guarantee
2. **Customer Support Outsourcing** — specialized teams for technology companies · ongoing training and dedicated supervision
3. **Corporate Training** — soft skills and leadership · in-person and online programs tailored to each organization

**Why Nexova** (two columns on large screens; stack on mobile)
- 12 years of experience in the Latin American market *(open decision in `00-index.md`)*
- Regional presence: Spain and United States
- +500 successful selection processes completed
- Sector focus: technology, retail, and finance

**Contact** — contact@nexova.com · Valencia +34 960 123 456 · Miami +1 305 555 0191

**Footer** — © 2025 Nexova. All rights reserved. *(year open in `00-index.md`)* · LinkedIn | Instagram

### Organization schema (landing)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Nexova",
  "description": "Human resources consulting and talent acquisition",
  "url": "https://nexova.com",
  "foundingDate": "2011",
  "address": [
    {
      "@type": "PostalAddress",
      "addressCountry": "ES",
      "addressLocality": "Valencia",
      "addressRegion": "Comunidad Valenciana"
    },
    {
      "@type": "PostalAddress",
      "addressCountry": "US",
      "addressLocality": "Miami",
      "addressRegion": "Florida"
    }
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+34-960-123-456",
    "contactType": "customer service",
    "availableLanguage": ["Spanish", "English"]
  },
  "sameAs": [
    "https://linkedin.com/company/nexova",
    "https://instagram.com/nexova"
  ]
}
```

Use **Organization** (not LocalBusiness).

### Landing ready when
- Semantic structure (`header`, `main`, `nav`, `section`, `footer`)
- Hero, Services, Why Nexova, Contact, Footer in place
- CTA reaches the form; layout holds on mobile/tablet/desktop
- Images have `alt`; ARIA only where it helps
- Organization JSON-LD present

---

## Talent form

For people exploring roles — not companies buying services.

Show clearly:  
`Are you a company looking for talent? Write to us at contact@nexova.com`

Field names, options, and validation rules below are product canon. Don’t substitute a generic template form.

### Fields
| Field | Type | Validation | Required |
|---|---|---|---|
| Full name | text | At least two words | Yes |
| Email | email | Valid email (`@` + domain) | Yes |
| Phone | tel | `+[country code] [number]` e.g. +34 612 345 678 | Yes |
| Country of residence | select | Spain / United States / Other | Yes |
| Years of experience | number | 0–50 | Yes |
| Sector of interest | select | Technology / Retail / Financial Services / Consulting / Other | Yes |
| English level | select | Basic / Intermediate / Advanced / Native | Yes |
| Availability | radio | Immediate / 1 month / 2–3 months / Just exploring | Yes |
| LinkedIn (profile URL) | url | Valid URL if provided | No |
| Additional comments | textarea | Max 500 characters + visible counter | No |
| I accept the data policy | checkbox | Must be checked | Yes |

Don’t invent extra fields. Use the right input types, `<label for>`, `required` where needed, and `<fieldset>` / `<legend>` for grouped controls like availability.

### Error copy
- Full name: `Name must contain at least first and last name`
- Email: `Enter a valid email (example: name@company.com)`
- Phone: `Phone must include country code (example: +34 612 345 678)`
- Country: `Select your country of residence`
- Years of experience: `Years of experience must be between 0 and 50`
- Sector: `Select your sector of interest`
- English level: `Indicate your English level`
- Availability: `Select your availability`
- LinkedIn: `If you include LinkedIn, it must be a valid URL`
- Comments: `Comments cannot exceed 500 characters (X remaining)`
- Data policy: `You must accept the data processing policy to continue`

### Rules
1. Email has `@` and a real domain shape  
2. Phone starts with `+` and a country code  
3. Years between 0 and 50  
4. LinkedIn, if filled, starts with `http://` or `https://`  
5. Comments capped at 500 with a live counter  
6. Data policy must be accepted  

### Client validation (React)
- Validate on blur and/or input; check again on submit  
- Block submit when invalid; show the messages above  
- On success (no backend yet), show:

```text
Thank you for your interest in Nexova!
We have received your information. Our selection team will review it and contact you if your profile matches any of our current or future opportunities.
In the meantime, follow us on LinkedIn to stay updated on our vacancies and professional development content.
```

- Include both submit and clear/reset actions

### Form ready when
- Fields, options, and messages match this file
- Responsive layout with clear focus / error / success states
- Validation and clear button work on real devices/viewports

---

## Ship checklist (anti-drift)

Use before you treat v1 as done. This doesn’t invent new product facts — if something conflicts with the landing/form sections above, those sections win.

**Structure & SEO**
- [ ] Semantic HTML, sensible heading order
- [ ] Image `alt` text
- [ ] Labels tied to inputs
- [ ] Organization schema correct

**Responsive & craft**
- [ ] Works on mobile, tablet, desktop
- [ ] Mobile-first Tailwind; no fixed “static page” layout
- [ ] Documented local run command
- [ ] Tailwind-first styling; professional look
- [ ] Performance in a healthy range (≥ 80, aim > 90)

**Accessibility**
- [ ] Keyboard-friendly controls
- [ ] Useful ARIA where needed
- [ ] Readable contrast
- [ ] Predictable nav, including on small screens
- [ ] Errors usable with assistive tech

**Form**
- [ ] Every field above present with the right types
- [ ] Validation matches the rules and copy
- [ ] Bad data can’t submit
- [ ] Clear/reset works
- [ ] Focus / error / success states are obvious

**Product fit**
- [ ] Clearly an HR / talent firm — not a generic template site
- [ ] Experience and differentiators show up as specified
- [ ] Tone fits an established company going properly digital

---

## Commercial appendix (later automation — not default marketing copy)

Keep this for sales/ops workflows and future agents. Don’t dump full pricing tables onto the first landing page unless you decide to.

### Pricing
- **Headhunting:** 22% of gross annual salary · 30% start / 30% shortlist / 40% hire · 6-month replacement guarantee when departure is attributable to the search. Discounts under 22% need **Marcos Ibáñez**. New clients stay on 30/30/40; alternate schedules only after 2+ years and **Finance** approval.
- **Support outsourcing:** USD 1,800–2,400 per agent / month · 6-month minimum · early exit = one month fee · recruitment/turnover included.
- **Training:** from USD 3,500 (4 wk) / 6,200 (8 wk) / 8,900 (12 wk) for ≤15 people · larger groups custom.

### Hiring SLA
| Search type | Average | Shortlist |
|---|---|---|
| Executive (C-level, VP) | 8 weeks | 3 |
| Managerial (director, manager) | 6 weeks | 3–4 |
| Specialized technical | 5 weeks | 3 |

These are averages, not guarantees, unless a contract says otherwise. At week 4 of an executive search with no qualified candidate presented: escalate to **Javier Almeida** (Operations) and send the client an action plan. Highly restrictive geography (e.g. one city) is excluded from delivery-time expectations.

### Common objections
- “22% is high” → guarantee + reference checks; no discount without Marcos  
- “Pay everything at the end” → not for new clients  
- “Shortlist isn’t right” → one extra search round free with specific feedback  
- “Do you work my competitors?” → no simultaneous conflict-of-interest searches; be transparent about past competitor work  

---

## Changelog

### 2026-09-16
- Consolidated company, services, commercial, public-site, form, and quality notes into this single product context file
- Renamed from assignment-style “M1 implementation guide” framing to product/project voice
- Responsive / mobile-first expectations kept explicit for the first public ship
- Public site moved to Next.js; architecture split reserved for future `/backoffice`
