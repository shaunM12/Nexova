# Nexova — tech context (hot path)

Architecture boundaries: `architecture.md`.  
Company copy / form field truth: `historical-reference/product-context.md`.

## Product posture
- **Public website (active):** marketing landing + talent registration.
- **Backoffice (planned):** authenticated internal tools under `/backoffice`.
- Public experience must be **fully responsive and mobile-first**.
- First ship keeps the talent form client-side only (no CRM wiring yet).

## Target architecture

```text
nexova/
  AGENTS.md
  memory-bank/
    architecture.md            # public vs backoffice map
    techContext.md             # this file
    historical-reference/
  app/
    layout.tsx                 # root: fonts + html/body only
    globals.css
    (public)/                  # PUBLIC WEBSITE
      layout.tsx               # marketing header/footer
      page.tsx                 # /
      application/page.tsx     # /application
    (backoffice)/              # reserved for /backoffice later
  components/
    public/                    # marketing UI
    backoffice/                # internal UI (later)
  lib/
    public/                    # public helpers / validation / schema
    backoffice/                # internal helpers (later)
```

### Routes (current)
| Route | Surface | Role |
|---|---|---|
| `/` | Public | Landing + Organization schema |
| `/application` | Public | Talent form |

### Routes (planned)
| Route | Surface | Role |
|---|---|---|
| `/backoffice` | Backoffice | Internal home (auth required) |
| `/backoffice/…` | Backoffice | Leads, ops, commercial tools |

### Styling
- **Tailwind CSS** via PostCSS.
- Public and backoffice may share design tokens later; do not share marketing chrome with admin UI.

## Responsive architecture (public — non-negotiable)
1. Mobile-first; `sm:` / `md:` / `lg:` enhancements
2. Fluid `w-full` / `max-w-*` layouts
3. Stack → multi-column at larger breakpoints
4. Touch-friendly targets; keyboard-accessible nav
5. `next/image` with descriptive `alt`
6. Verify ~375, ~768, ≥1024

## Accessibility & SEO (public)
- Landmarks + useful ARIA / live regions for form errors
- Organization JSON-LD: `lib/public/organizationSchema.ts`

## Form architecture (public)
- `components/public/TalentForm.tsx` + `lib/public/talentValidation.ts`
- Blur/input + submit validation; exact messages from product context
- No backend in this phase

## Language (public)
- Default: English (`en`); Spanish (`es`) via header toggle
- `lib/public/i18n.ts` dictionaries + `LanguageProvider` in public layout
- Form option **values** stay English; labels/errors follow locale

## Local run
```bash
npm install
npm run dev      # starts web on 3456 + opens Firefox
npm run ports    # labeled list of reserved/local services (UP/DOWN)
```

Port registry: `config/ports.json`  
- **3456** — Next web (public + future `/backoffice`)  
- **4000** — reserved API  
- **4001** — reserved workers  

Cursor’s Ports panel is often empty on local Mac workspaces; `npm run ports` is the multi-service picker.

## Later phases
1. Backoffice shell + auth (`architecture.md`)
2. Talent form → CRM / ATS intake API
3. SLA / commercial workflows (product-context commercial appendix)

## Related docs
| Need | File |
|---|---|
| System boundaries | `architecture.md` |
| Continuity / open decisions | `historical-reference/00-index.md` |
| Public product context | `historical-reference/product-context.md` |
