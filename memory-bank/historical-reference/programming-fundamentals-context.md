---
id: nexova.hr.programming-fundamentals
title: CONTEXT — Programming Fundamentals
status: active
depends_on: [nexova.hr.00]
canonical_for:
  - candidate-engine-v0
  - candidate-vacancy-types
  - match-scoring
  - selection-aggregations
  - engine-validations
  - fundamentals-ship-checklist
last_reviewed: 2026-09-21
---

# CONTEXT — Programming Fundamentals

Internal **candidate matching engine v0** for Nexova — typed TypeScript domain logic for consultants who today score and shortlist by hand. This file is the implementation guide and anti-drift contract for the phase. It is **not** public-site product truth (that stays in `product-context.md`).

**Companions:** `../architecture.md` (public vs backoffice boundaries) · `../techContext.md` (repo stack) · `00-index.md` (glossary / continuity).

---

## How to use this file

| You’re doing… | Read |
|---|---|
| Modeling entities / enums | Business entities |
| Implementing utils | Folder ownership → Required functions → Locked scoring |
| Validations | Validation contracts |
| Keeping scope honest | Scope / out of scope → Ship checklist |
| Wiring tests | Eval command + Ship checklist |

### Suggested build order
1. Types + sample fixtures under `lib/candidate-engine/`
2. Validations (`validations.ts`)
3. Collections — filter / sort
4. Lookups (`findCandidateById` / `ByEmail`)
5. Aggregations + grouping
6. Compatibility helper + scoring (breakdown) + rank
7. Optional: binary search utility
8. Vitest suite; expose `npm run fundamentals`
9. Optional HTML harness (not required)

---

## Scope

### In scope
- TypeScript interfaces for Candidate, Vacancy, SelectionProcess
- Pure in-memory utilities: filter, sort, find, score, rank, aggregate, validate
- Remote hard-compatibility check (caller-composed before rank)
- Explainable match scores with named weights
- Vitest coverage via `npm run fundamentals`
- Sample data for fixtures / demos

### Out of scope
- Public marketing UI / Next.js route changes
- Backoffice UI, auth, CRM/ATS persistence, APIs
- AI / prompting / LLM scoring
- Fuzzy location matching / geocoding
- Skill synonym maps (`JS` ≡ `JavaScript`) — **future**
- Reconciling public talent-form fields with these interfaces (intentional gap)
- HTML manual test page (optional only)

### Intentional gap vs public talent form
The public `/application` form is owned by `product-context.md`. This engine model is internal/ops. **Do not** force-merge field names in this phase. A future mapping layer may connect intake → engine `Candidate`.

### Conflict rule
- Public copy / form fields → `product-context.md`
- Engine types, scoring, validations, evals → **this file**
- Continuity / glossary → `00-index.md`
- Folder boundaries → `../architecture.md`

---

## Narrative (portfolio)

Nexova (Valencia · Miami) runs executive headhunting, support outsourcing, and corporate training. Operations needs reusable, well-typed logic so selection consultants can filter talent, score fits against vacancies, and report on pipeline health — before any UI or database.

**Owner framing:** Operations (Javier Almeida) needs logic that is correct and maintainable; a UI can sit on top later.

This is pure programming: interfaces, collections, transformations, validations. No AI.

---

## Folder ownership

`lib/candidate-engine/` is the home for this phase. **Do not** import these modules into `app/(public)` in this phase.

```text
lib/candidate-engine/
  types/           # Candidate, Vacancy, SelectionProcess, unions, result types
  data/            # sampleCandidates, sampleVacancy, sample processes
  utils/
    collections.ts      # filter + sort
    search.ts           # find by id/email; optional binary search utility
    transformations.ts  # score, rank, group, aggregations
    validations.ts      # validateCandidate / Vacancy, isValidEmail
    compatibility.ts    # isCandidateCompatibleWithVacancy (or colocated)
  constants/            # SCORE_WEIGHTS (or next to transformations)
```

Optional HTML tester (if added later): static page **outside** `app/(public)`; serve with `npx http-server . -p 3000 -a 0.0.0.0`. Not required for done.

---

## Business entities

### Candidate

```ts
interface Candidate {
  id: string; // e.g. "C-2024-0451"
  fullName: string;
  email: string;
  phone: string;
  yearsOfExperience: number;
  skills: string[];
  englishLevel: EnglishLevel;
  seniority: SeniorityLevel;
  currentSalary: number; // USD
  expectedSalary: number; // USD
  availability: AvailabilityStatus;
  location: string; // e.g. "Valencia, Spain"
  remoteOnly: boolean;
  status: CandidateStatus;
}

type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Native";
type SeniorityLevel =
  | "Junior"
  | "Semi-Senior"
  | "Senior"
  | "Lead"
  | "Executive";
type AvailabilityStatus = "Immediate" | "2 weeks" | "1 month" | "Not available";
type CandidateStatus = "Active" | "In process" | "Hired" | "Inactive";
```

**Validation rules**
- `yearsOfExperience` ∈ [0, 50]
- `currentSalary` > 0 and `expectedSalary` > 0
- `skills.length` ≥ 1
- `email` passes `isValidEmail`
- `phone` non-empty (trim)

### Vacancy

```ts
interface Vacancy {
  id: string; // e.g. "V-2024-0892"
  title: string;
  companyName: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minYearsExperience: number;
  maxYearsExperience: number;
  requiredEnglishLevel: EnglishLevel;
  requiredSeniority: SeniorityLevel;
  salaryRangeMin: number; // USD
  salaryRangeMax: number; // USD
  isRemote: boolean;
  location: string;
  status: VacancyStatus;
}

type VacancyStatus = "Open" | "In progress" | "Closed" | "On hold";
```

**Validation rules**
- `requiredSkills.length` ≥ 1
- `minYearsExperience` ≥ 0
- `maxYearsExperience` ≥ `minYearsExperience`
- `salaryRangeMax` ≥ `salaryRangeMin`
- both salary values > 0

### SelectionProcess

```ts
interface SelectionProcess {
  id: string; // e.g. "SP-2024-1523"
  candidateId: string;
  vacancyId: string;
  stage: ProcessStage;
  score: number; // 0–100
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

type ProcessStage =
  | "Screening"
  | "Interview"
  | "Technical test"
  | "Final interview"
  | "Offer"
  | "Rejected"
  | "Hired";
```

No `validateSelectionProcess` in this phase — type is used by fill-rate aggregation only.

---

## Locked ladders

**Seniority (low → high):**  
`Junior` → `Semi-Senior` → `Senior` → `Lead` → `Executive`  
Exact match → full points; index difference of 1 → adjacent points; else 0.

**English (low → high):**  
`A1` → `A2` → `B1` → `B2` → `C1` → `C2` → `Native`  
Candidate meets or exceeds required → full points; else 0.

---

## Skill matching

- Compare with **trim + case-insensitive**
- Do **not** mutate stored skill strings on entities
- **No synonym map** in this phase
- `findTopSkills`: count case-insensitively; display label = **first-seen** original spelling

---

## Validation contracts

```ts
interface ValidationError {
  field: string;
  code: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
```

`valid === true` iff `errors.length === 0`. Evals assert on **`code`** (stable); `message` is human default copy.

### Candidate error codes

| code | field | when |
|---|---|---|
| `YEARS_OUT_OF_RANGE` | `yearsOfExperience` | not in [0, 50] |
| `CURRENT_SALARY_INVALID` | `currentSalary` | ≤ 0 |
| `EXPECTED_SALARY_INVALID` | `expectedSalary` | ≤ 0 |
| `SKILLS_EMPTY` | `skills` | length &lt; 1 |
| `INVALID_EMAIL` | `email` | fails `isValidEmail` |
| `PHONE_EMPTY` | `phone` | empty after trim |

### Vacancy error codes

| code | field | when |
|---|---|---|
| `REQUIRED_SKILLS_EMPTY` | `requiredSkills` | length &lt; 1 |
| `MIN_YEARS_INVALID` | `minYearsExperience` | &lt; 0 |
| `MAX_YEARS_INVALID` | `maxYearsExperience` | &lt; minYearsExperience |
| `SALARY_RANGE_INVALID` | `salaryRangeMin` / `salaryRangeMax` | max &lt; min, or either ≤ 0 |

### `isValidEmail`
Basic (not RFC-complete):
- exactly one `@`
- non-empty local and domain parts
- domain contains `.`
- no whitespace
- `.` is not the first or last character of the domain

---

## Compatibility

```ts
isCandidateCompatibleWithVacancy(candidate: Candidate, vacancy: Vacancy): boolean
```

**Hard rule:** if `candidate.remoteOnly && !vacancy.isRemote` → `false`; otherwise `true` for this phase.

No location-string matching. Status / availability are **not** inside this helper.

### Recommended pipeline (composition)

1. Prefer `status === "Active"`
2. Prefer `availability !== "Not available"`
3. `isCandidateCompatibleWithVacancy`
4. `rankCandidatesForVacancy` (scores **all** inputs it receives — caller filters first)

`rankCandidatesForVacancy` must **not** auto-filter.

---

## Locked scoring

Export named weights (e.g. `SCORE_WEIGHTS`) documenting the caps below. Implementation reads from those constants.

```ts
interface ScoreBreakdown {
  skills: number;
  experience: number;
  seniority: number;
  english: number;
  salary: number;
}

interface CandidateScore {
  total: number; // clamp sum of breakdown to [0, 100]
  breakdown: ScoreBreakdown;
}

calculateCandidateScore(candidate: Candidate, vacancy: Vacancy): CandidateScore
```

### Skills (`breakdown.skills`)
1. **Required tier** (mutually exclusive):
   - all required skills → **40**
   - else if `matched / required.length >= 0.5` → **20**
   - else → **0**
2. **Preferred bonus:** +10 per preferred skill held, **max +20**
3. Skills contribution = required tier + preferred bonus (may exceed 40 before other categories)

Remote / location do **not** add score points.

### Experience (`breakdown.experience`) — max 20
- Inside `[minYearsExperience, maxYearsExperience]` → **20**
- Else `distance` = how far outside that range (continuous years)
- `distance > 0 && distance <= 2` → **10**
- else → **0**

### Seniority (`breakdown.seniority`) — max 15
- Exact → **15**
- One level above or below (ladder index ±1) → **7**
- else → **0**

### English (`breakdown.english`) — max 15
- Candidate level ≥ required (ladder) → **15**
- else → **0**

### Salary (`breakdown.salary`) — max 10
- `expectedSalary` in `[salaryRangeMin, salaryRangeMax]` → **10**
- else if `salaryRangeMax < expectedSalary <= salaryRangeMax * 1.20` → **5**
- else (including **below min**) → **0**

### Total
`total = clamp(sum(breakdown values), 0, 100)`.

---

## Required functions

All exported functions: explicit parameter and return types; pure (no module mutable state); filter/sort **must not mutate** inputs; prefer `const`.

### `lib/candidate-engine/utils/collections.ts`

| Function | Contract |
|---|---|
| `filterCandidatesBySkills(candidates, requiredSkills)` | Candidates who have **all** required skills (trim + case-insensitive). `[]` → `[]` |
| `filterCandidatesBySeniority(candidates, seniority)` | Exact seniority |
| `filterCandidatesByAvailability(candidates, availability[])` | Availability in the provided set |
| `sortCandidatesBySalary(candidates, "asc" \| "desc")` | By `expectedSalary`; new array |
| `sortCandidatesByExperience(candidates, "asc" \| "desc")` | By `yearsOfExperience`; new array |

### `lib/candidate-engine/utils/search.ts`

| Function | Contract |
|---|---|
| `findCandidateById(candidates, id)` | In-memory lookup; found → candidate, else `null`. Production note: Map/DB later |
| `findCandidateByEmail(candidates, email)` | Case-insensitive email; else `null` |
| `binarySearchCandidateBySalary(sortedCandidates, targetSalary)` | **Optional utility** — assumes ascending `expectedSalary`; index or `-1`. Not part of core match pipeline. Duplicate salaries → any valid index |

### `lib/candidate-engine/utils/transformations.ts`

| Function | Contract |
|---|---|
| `calculateCandidateScore(candidate, vacancy)` | `CandidateScore` per locked scoring |
| `rankCandidatesForVacancy(candidates, vacancy)` | `{ candidate, score: CandidateScore }[]` sorted by `score.total` **desc**, then `candidate.id` **asc**. Scores all inputs |
| `groupCandidatesBySeniority(candidates)` | `Record<SeniorityLevel, Candidate[]>` — **all** keys; missing → `[]` |
| `countCandidatesByStatus(candidates)` | `Record<CandidateStatus, number>` — **all** keys; missing → `0` |
| `calculateAverageSalary(candidates)` | Mean of `expectedSalary`; round 2 decimals; **`[]` → `0`** |
| `findTopSkills(candidates, topN)` | Top N `{ skill, count }` by frequency desc; first-seen labels; empty / `topN <= 0` → `[]` |
| `calculateVacancyFillRate(processes)` | % with stage `"Hired"`; 0–100, 2 decimals; **`[]` → `0`** |

### Compatibility (dedicated file or next to transformations)

| Function | Contract |
|---|---|
| `isCandidateCompatibleWithVacancy(candidate, vacancy)` | Remote hard rule above |

### `lib/candidate-engine/utils/validations.ts`

| Function | Contract |
|---|---|
| `validateCandidate(candidate)` | `ValidationResult` |
| `validateVacancy(vacancy)` | `ValidationResult` |
| `isValidEmail(email)` | boolean per locked rule |

**Do not** add unlisted max/min helpers or `validateSelectionProcess` in this phase.

---

## Sample data

Use these fixtures in tests and demos:

```ts
const sampleCandidates: Candidate[] = [
  {
    id: "C-2024-0451",
    fullName: "María González",
    email: "maria.gonzalez@email.com",
    phone: "+56912345678",
    yearsOfExperience: 5,
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    englishLevel: "B2",
    seniority: "Semi-Senior",
    currentSalary: 3500,
    expectedSalary: 4200,
    availability: "1 month",
    location: "Valencia, Spain",
    remoteOnly: false,
    status: "Active",
  },
  {
    id: "C-2024-0452",
    fullName: "Juan Pérez",
    email: "juan.perez@email.com",
    phone: "+56987654321",
    yearsOfExperience: 3,
    skills: ["JavaScript", "React", "CSS", "HTML"],
    englishLevel: "B1",
    seniority: "Junior",
    currentSalary: 2200,
    expectedSalary: 2800,
    availability: "Immediate",
    location: "Miami, Florida, United States",
    remoteOnly: true,
    status: "Active",
  },
  {
    id: "C-2024-0453",
    fullName: "Carolina Silva",
    email: "carolina.silva@email.com",
    phone: "+56911223344",
    yearsOfExperience: 8,
    skills: ["TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS"],
    englishLevel: "C1",
    seniority: "Senior",
    currentSalary: 5500,
    expectedSalary: 6500,
    availability: "2 weeks",
    location: "Valencia, Spain",
    remoteOnly: false,
    status: "Active",
  },
];

const sampleVacancy: Vacancy = {
  id: "V-2024-0892",
  title: "Senior Full-Stack Developer",
  companyName: "TechCorp Solutions",
  requiredSkills: ["TypeScript", "React", "Node.js"],
  preferredSkills: ["PostgreSQL", "Docker"],
  minYearsExperience: 4,
  maxYearsExperience: 8,
  requiredEnglishLevel: "B2",
  requiredSeniority: "Senior",
  salaryRangeMin: 5000,
  salaryRangeMax: 7000,
  isRemote: true,
  location: "Remote",
  status: "Open",
};
```

When implementing, compute and lock **golden** `CandidateScore` totals/breakdowns for these three × `sampleVacancy` inside tests (derived from this file’s formula — do not invent alternate math).

---

## Code quality

- Descriptive names: **camelCase** functions/vars; **PascalCase** types/interfaces
- Pure functions; no globals for business data
- Comments only for non-obvious logic
- Handle empty arrays, not-found (`null` / `-1`), invalid inputs via validations
- `const` by default; `let` only when reassignment is required
- Consistent formatting

---

## Eval command

```bash
npm run fundamentals
```

Must run **Vitest** over M2 tests (validations, filters, scoring fixtures, edge cases). May also typecheck. Must exit non-zero on failure. Keep separate from Next.js `npm run build`.

---

## Optional frontend / testing harness

Not required for done. If added: simple Tailwind HTML page with controls for filter / search / sort / reports and visible results. Do not place under `app/(public)`.

---

## Ship checklist (anti-drift)

### Scope gates
- [x] No LLM / prompting code in this phase
- [x] No required Next.js public-route changes for core credit
- [x] Utils live under `lib/candidate-engine/` per folder map; not imported into public marketing UI
- [x] No skill synonym map
- [x] No location fuzzy matching
- [x] Optional HTML not required to pass
- [x] Binary search (if present) documented as optional utility, not core pipeline

### Types & organization
- [x] Interfaces / unions match this file
- [x] Explicit param + return types on exports
- [x] Functions in correct files by responsibility
- [x] `SCORE_WEIGHTS` (or equivalent) exported and used by scoring
- [x] `calculateCandidateScore` returns `{ total, breakdown }`

### Behavior
- [x] Filter/sort do not mutate inputs
- [x] Skill compare: trim + case-insensitive
- [x] Scoring matches locked formula (including salary below min → 0)
- [x] Rank: `total` desc, then `id` asc
- [x] Compatibility: `remoteOnly && !isRemote` → false
- [x] Rank does not auto-filter
- [x] Group/count always include all enum keys
- [x] Empty average / fill rate → `0`
- [x] Validation returns `{ field, code, message }`; codes match catalog
- [x] `isValidEmail` matches locked rule

### Quality
- [x] Pure functions; `const` by default
- [x] Edge cases covered in Vitest
- [x] `npm run fundamentals` passes

---

## Closed decisions (this phase)

- [x] Code under `lib/candidate-engine/` (types, utils, data, constants)
- [x] Skills: required tier + preferred bonus; clamp **total** to 0–100
- [x] Salary below range min → 0 salary points
- [x] Empty average / fill rate → `0`
- [x] HTML tester optional
- [x] Structured validation errors (codes stable)
- [x] Update `00-index.md` for this CONTEXT
- [x] ≥50% skills via `matched / length >= 0.5`
- [x] Experience distance continuous; `(0, 2]` → +10
- [x] Seniority / English ladders as above
- [x] Rank ties: score desc, id asc
- [x] Skills trim + case-insensitive; top-skills first-seen label
- [x] Salary +5 band: `(max, max * 1.20]`
- [x] Email rule as above
- [x] Group/count always all keys
- [x] `npm run fundamentals` = Vitest
- [x] Remote hard compatibility; caller filters before rank
- [x] Score breakdown return type + named weights
- [x] Binary search optional utility
- [x] Portfolio / prototype tone (not class rubric)
- [x] Intentional gap vs public talent form
- [x] Skill synonyms out of scope
- [x] Engine home is `lib/candidate-engine/` (not root `src/`)

## Open decisions (do not invent)

- [ ] Whether a thin `shortlistForVacancy` pipeline helper is added in a later pass

---

## Changelog

| Date | Change |
|---|---|
| 2026-09-21 | Initial CONTEXT — Programming Fundamentals (engine v0); portfolio-oriented locks from design pass |
| 2026-09-21 | Home path moved from root `src/` to `lib/candidate-engine/` (aligns with `lib/public`) |
| 2026-09-21 | Engine implemented; golden sample scores locked in Vitest (`npm run fundamentals`) |
| 2026-09-21 | Portfolio polish: architecture/techContext/README, engines field, engine README, sampleProcesses, ship checklist marked done |
