# Nexova — tech context (hot path)

Architecture boundaries: `architecture.md`.  
Company copy / form field truth: `historical-reference/product-context.md`.

## Product posture
- **Public website (active):** marketing landing + talent registration.
- **Backoffice (active):** demo-gated internal tools under `/backoffice`; first tool is the Talent Pipeline Tracker.
- Public and backoffice experiences must be **fully responsive and mobile-first**.
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
    (backoffice)/backoffice/   # login + (app) shell + pipeline
  components/
    public/                    # marketing UI
    backoffice/                # shell/ + pipeline/
  lib/
    public/                    # public helpers / validation / schema
    candidate-engine/          # matching / scoring utils (no UI)
    backoffice/                # auth/, pipeline/, notify.ts
  middleware.ts                # /backoffice/* guard only
  public/mockServiceWorker.js  # MSW worker for demo mode (committed)
```

### Routes (current)
| Route | Surface | Role |
|---|---|---|
| `/` | Public | Landing + Organization schema |
| `/application` | Public | Talent form |
| `/backoffice` | Backoffice | Redirects to `/backoffice/pipeline` |
| `/backoffice/login` | Backoffice | Demo sign-in |
| `/backoffice/pipeline` | Backoffice | Candidate list (filters/search/page in URL) |
| `/backoffice/pipeline/new` | Backoffice | Register candidate |
| `/backoffice/pipeline/[id]` | Backoffice | Candidate detail (status, stage, edit, notes) |

### Routes (planned)
| Route | Surface | Role |
|---|---|---|
| `/backoffice/…` | Backoffice | Further tools as new tabs (incidents, inventory, knowledge base) |

### Talent Pipeline Tracker
- Contract: `historical-reference/talent-pipeline-context.md`
- Stack: TanStack Query 5, Zod 4, React Hook Form 7, Sonner, MSW 2 (demo + tests)
- Data mode: live 4Geeks API by default; `NEXT_PUBLIC_PIPELINE_API_URL=demo` (`.env.local`) for in-browser demo data; tests are forced to demo in `vitest.config.ts`
- Tests: `npm run test:pipeline` (Vitest jsdom + React Testing Library + MSW)

### Candidate engine (logic only)
- Path: `lib/candidate-engine/`
- Contract: `historical-reference/programming-fundamentals-context.md`
- Run checks: `npm run fundamentals` (Vitest `engine` project)
- Not imported by public or backoffice code in this phase

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
Node **20.19+** (`.nvmrc` = 24; run `nvm use`).

```bash
npm install
npm run dev            # starts web on 3456 + opens Firefox at /
npm run dev:backoffice # same server; Firefox opens at /backoffice
npm run ports          # labeled list of reserved/local services (UP/DOWN)
npm test               # engine + pipeline Vitest projects
npm run fundamentals   # engine project only
npm run test:pipeline  # pipeline project only
npm run typecheck      # tsc --noEmit
```

Done checks for backoffice work: `lint`, `typecheck`, `fundamentals`, `test:pipeline`, `build`.

Port registry: `config/ports.json`  
- **3456** — Next web (public + `/backoffice`)  
- **4000** — reserved API  
- **4001** — reserved workers  

Cursor’s Ports panel is often empty on local Mac workspaces; `npm run ports` is the multi-service picker.

## Later phases
1. Real backoffice auth; engine matching panel (`talent-pipeline-context.md` roadmap)
2. Talent form → CRM / ATS intake API
3. SLA / commercial workflows (product-context commercial appendix)

## Related docs
| Need | File |
|---|---|
| System boundaries | `architecture.md` |
| Continuity / open decisions | `historical-reference/00-index.md` |
| Public product context | `historical-reference/product-context.md` |
| Candidate engine contract | `historical-reference/programming-fundamentals-context.md` |
| Talent Pipeline Tracker contract | `historical-reference/talent-pipeline-context.md` |
