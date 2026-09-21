# Candidate matching engine v0

In-memory TypeScript utilities for Nexova selection consultants: filter talent, validate records, score fits against a vacancy (with an explainable breakdown), rank shortlists, and aggregate simple ops reports.

**This is not a page.** Nothing here is imported by the public Next.js site in this phase.

## Layout

```text
lib/candidate-engine/
  types/           # Candidate, Vacancy, SelectionProcess, score/validation types
  constants/       # SCORE_WEIGHTS
  data/            # sampleCandidates, sampleVacancy, sampleProcesses
  utils/           # collections, search, validations, compatibility, transformations
  index.ts         # public exports
```

## Recommended shortlist pipeline

Compose pure helpers (do not bake filters into `rankCandidatesForVacancy`):

1. Prefer `status === "Active"`
2. Prefer `availability !== "Not available"`
3. `isCandidateCompatibleWithVacancy` (hard fail when `remoteOnly && !isRemote`)
4. `rankCandidatesForVacancy` → sort by `score.total` desc, then `id` asc

## Run tests

Requires Node **18+**.

```bash
source ~/.nvm/nvm.sh   # if needed
nvm use 24             # if needed
npm run fundamentals
```

## Contract

Scoring math, validation codes, and anti-drift checklist:

`memory-bank/historical-reference/programming-fundamentals-context.md`
