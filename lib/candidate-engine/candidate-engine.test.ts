import { describe, expect, it } from "vitest";
import {
  binarySearchCandidateBySalary,
  calculateAverageSalary,
  calculateCandidateScore,
  calculateVacancyFillRate,
  countCandidatesByStatus,
  filterCandidatesByAvailability,
  filterCandidatesBySeniority,
  filterCandidatesBySkills,
  findCandidateByEmail,
  findCandidateById,
  findTopSkills,
  groupCandidatesBySeniority,
  isCandidateCompatibleWithVacancy,
  isValidEmail,
  rankCandidatesForVacancy,
  sampleCandidates,
  sampleProcesses,
  sampleVacancy,
  sortCandidatesByExperience,
  sortCandidatesBySalary,
  validateCandidate,
  validateVacancy,
} from "./index";
import type { Candidate, Vacancy } from "./types";

function cloneCandidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    ...sampleCandidates[0],
    ...overrides,
  };
}

describe("isValidEmail", () => {
  it("accepts a basic valid email", () => {
    expect(isValidEmail("maria.gonzalez@email.com")).toBe(true);
  });

  it("rejects missing at, spaces, and bad domain dots", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("foo @bar.com")).toBe(false);
    expect(isValidEmail("@x.com")).toBe(false);
    expect(isValidEmail("a@.com")).toBe(false);
    expect(isValidEmail("a@b.")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
  });
});

describe("validateCandidate", () => {
  it("accepts sample candidates", () => {
    for (const candidate of sampleCandidates) {
      expect(validateCandidate(candidate).valid).toBe(true);
    }
  });

  it("returns stable error codes", () => {
    const result = validateCandidate(
      cloneCandidate({
        yearsOfExperience: 99,
        currentSalary: 0,
        expectedSalary: -1,
        skills: [],
        email: "bad",
        phone: "   ",
      }),
    );

    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code).sort()).toEqual(
      [
        "CURRENT_SALARY_INVALID",
        "EXPECTED_SALARY_INVALID",
        "INVALID_EMAIL",
        "PHONE_EMPTY",
        "SKILLS_EMPTY",
        "YEARS_OUT_OF_RANGE",
      ].sort(),
    );
  });
});

describe("validateVacancy", () => {
  it("accepts the sample vacancy", () => {
    expect(validateVacancy(sampleVacancy).valid).toBe(true);
  });

  it("flags empty skills and invalid ranges", () => {
    const bad: Vacancy = {
      ...sampleVacancy,
      requiredSkills: [],
      minYearsExperience: -1,
      maxYearsExperience: 2,
      salaryRangeMin: 0,
      salaryRangeMax: -5,
    };
    const result = validateVacancy(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "REQUIRED_SKILLS_EMPTY")).toBe(
      true,
    );
    expect(result.errors.some((e) => e.code === "MIN_YEARS_INVALID")).toBe(
      true,
    );
    expect(result.errors.some((e) => e.code === "SALARY_RANGE_INVALID")).toBe(
      true,
    );
  });
});

describe("collections", () => {
  it("filters by all required skills case-insensitively", () => {
    const result = filterCandidatesBySkills(sampleCandidates, [
      "typescript",
      "REACT",
    ]);
    expect(result.map((c) => c.id)).toEqual(["C-2024-0451"]);
  });

  it("does not mutate when sorting", () => {
    const original = sampleCandidates.map((c) => c.id);
    const sorted = sortCandidatesBySalary(sampleCandidates, "asc");
    expect(sampleCandidates.map((c) => c.id)).toEqual(original);
    expect(sorted.map((c) => c.expectedSalary)).toEqual([2800, 4200, 6500]);
  });

  it("filters seniority and availability", () => {
    expect(
      filterCandidatesBySeniority(sampleCandidates, "Senior").map((c) => c.id),
    ).toEqual(["C-2024-0453"]);
    expect(
      filterCandidatesByAvailability(sampleCandidates, [
        "Immediate",
        "2 weeks",
      ]).map((c) => c.id),
    ).toEqual(["C-2024-0452", "C-2024-0453"]);
  });

  it("sorts by experience descending", () => {
    expect(
      sortCandidatesByExperience(sampleCandidates, "desc").map(
        (c) => c.yearsOfExperience,
      ),
    ).toEqual([8, 5, 3]);
  });
});

describe("search", () => {
  it("finds by id and email", () => {
    expect(findCandidateById(sampleCandidates, "C-2024-0452")?.fullName).toBe(
      "Juan Pérez",
    );
    expect(findCandidateById(sampleCandidates, "missing")).toBeNull();
    expect(
      findCandidateByEmail(sampleCandidates, "MARIA.GONZALEZ@EMAIL.COM")?.id,
    ).toBe("C-2024-0451");
  });

  it("binary-searches sorted salaries", () => {
    const sorted = sortCandidatesBySalary(sampleCandidates, "asc");
    expect(binarySearchCandidateBySalary(sorted, 4200)).toBe(1);
    expect(binarySearchCandidateBySalary(sorted, 9999)).toBe(-1);
    expect(binarySearchCandidateBySalary([], 1000)).toBe(-1);
  });
});

describe("compatibility", () => {
  it("rejects remote-only candidates for on-site vacancies", () => {
    const onSite: Vacancy = { ...sampleVacancy, isRemote: false };
    expect(
      isCandidateCompatibleWithVacancy(sampleCandidates[1], onSite),
    ).toBe(false);
    expect(
      isCandidateCompatibleWithVacancy(sampleCandidates[0], onSite),
    ).toBe(true);
  });
});

describe("scoring golden fixtures", () => {
  it("scores María González against the sample vacancy", () => {
    const score = calculateCandidateScore(sampleCandidates[0], sampleVacancy);
    expect(score.breakdown).toEqual({
      skills: 50,
      experience: 20,
      seniority: 7,
      english: 15,
      salary: 0,
    });
    expect(score.total).toBe(92);
  });

  it("scores Juan Pérez against the sample vacancy", () => {
    const score = calculateCandidateScore(sampleCandidates[1], sampleVacancy);
    expect(score.breakdown).toEqual({
      skills: 0,
      experience: 10,
      seniority: 0,
      english: 0,
      salary: 0,
    });
    expect(score.total).toBe(10);
  });

  it("scores Carolina Silva against the sample vacancy", () => {
    const score = calculateCandidateScore(sampleCandidates[2], sampleVacancy);
    expect(score.breakdown).toEqual({
      skills: 40,
      experience: 20,
      seniority: 15,
      english: 15,
      salary: 10,
    });
    expect(score.total).toBe(100);
  });

  it("ranks by total desc then id asc and does not auto-filter", () => {
    const ranked = rankCandidatesForVacancy(sampleCandidates, sampleVacancy);
    expect(ranked.map((row) => row.candidate.id)).toEqual([
      "C-2024-0453",
      "C-2024-0451",
      "C-2024-0452",
    ]);
    expect(ranked).toHaveLength(3);
  });

  it("gives 0 salary points below min and +5 up to 20% above max", () => {
    expect(
      calculateCandidateScore(
        cloneCandidate({ expectedSalary: 4999 }),
        sampleVacancy,
      ).breakdown.salary,
    ).toBe(0);

    expect(
      calculateCandidateScore(
        cloneCandidate({ expectedSalary: 8400 }),
        sampleVacancy,
      ).breakdown.salary,
    ).toBe(5);

    expect(
      calculateCandidateScore(
        cloneCandidate({ expectedSalary: 8400.01 }),
        sampleVacancy,
      ).breakdown.salary,
    ).toBe(0);
  });
});

describe("aggregations", () => {
  it("groups and counts with all enum keys", () => {
    const groups = groupCandidatesBySeniority([]);
    expect(Object.keys(groups).sort()).toEqual(
      ["Executive", "Junior", "Lead", "Semi-Senior", "Senior"].sort(),
    );
    expect(groups.Junior).toEqual([]);

    const counts = countCandidatesByStatus(sampleCandidates);
    expect(counts.Active).toBe(3);
    expect(counts.Hired).toBe(0);
  });

  it("averages salary and fill rate with empty → 0", () => {
    expect(calculateAverageSalary([])).toBe(0);
    expect(calculateVacancyFillRate([])).toBe(0);
    expect(calculateAverageSalary(sampleCandidates)).toBe(4500);
    // sampleProcesses: 1 Hired of 3 → 33.33%
    expect(calculateVacancyFillRate(sampleProcesses)).toBe(33.33);
  });

  it("finds top skills case-insensitively with first-seen labels", () => {
    const mixed: Candidate[] = [
      cloneCandidate({
        id: "A",
        skills: ["React", "TypeScript"],
      }),
      cloneCandidate({
        id: "B",
        skills: ["react", "CSS"],
      }),
    ];
    const top = findTopSkills(mixed, 2);
    expect(top[0]).toEqual({ skill: "React", count: 2 });
    expect(findTopSkills(mixed, 0)).toEqual([]);
  });
});
