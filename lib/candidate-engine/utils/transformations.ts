import { SCORE_WEIGHTS } from "../constants/scoreWeights";
import type {
  Candidate,
  CandidateScore,
  CandidateStatus,
  RankedCandidate,
  ScoreBreakdown,
  SelectionProcess,
  SeniorityLevel,
  SkillCount,
  Vacancy,
} from "../types";
import {
  CANDIDATE_STATUSES,
  ENGLISH_LADDER,
  SENIORITY_LADDER,
} from "../types";
import { candidateHasSkill, countMatchingSkills, normalizeSkill } from "./skills";

function clampTotal(value: number): number {
  return Math.min(
    SCORE_WEIGHTS.totalMax,
    Math.max(SCORE_WEIGHTS.totalMin, value),
  );
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function scoreSkills(candidate: Candidate, vacancy: Vacancy): number {
  const requiredCount = vacancy.requiredSkills.length;
  let requiredTier = 0;

  if (requiredCount > 0) {
    const matched = countMatchingSkills(
      candidate.skills,
      vacancy.requiredSkills,
    );

    if (matched === requiredCount) {
      requiredTier = SCORE_WEIGHTS.skillsAllRequired;
    } else if (matched / requiredCount >= 0.5) {
      requiredTier = SCORE_WEIGHTS.skillsPartialRequired;
    }
  }

  let preferredBonus = 0;
  for (const preferred of vacancy.preferredSkills) {
    if (candidateHasSkill(candidate.skills, preferred)) {
      preferredBonus += SCORE_WEIGHTS.preferredSkillEach;
    }
  }
  preferredBonus = Math.min(preferredBonus, SCORE_WEIGHTS.preferredSkillMax);

  return requiredTier + preferredBonus;
}

function scoreExperience(candidate: Candidate, vacancy: Vacancy): number {
  const { yearsOfExperience } = candidate;
  const { minYearsExperience, maxYearsExperience } = vacancy;

  if (
    yearsOfExperience >= minYearsExperience &&
    yearsOfExperience <= maxYearsExperience
  ) {
    return SCORE_WEIGHTS.experienceInRange;
  }

  const distance =
    yearsOfExperience < minYearsExperience
      ? minYearsExperience - yearsOfExperience
      : yearsOfExperience - maxYearsExperience;

  if (distance > 0 && distance <= SCORE_WEIGHTS.experienceNearMaxDistance) {
    return SCORE_WEIGHTS.experienceNearRange;
  }

  return 0;
}

function scoreSeniority(candidate: Candidate, vacancy: Vacancy): number {
  if (candidate.seniority === vacancy.requiredSeniority) {
    return SCORE_WEIGHTS.seniorityExact;
  }

  const candidateIndex = SENIORITY_LADDER.indexOf(candidate.seniority);
  const requiredIndex = SENIORITY_LADDER.indexOf(vacancy.requiredSeniority);

  if (candidateIndex === -1 || requiredIndex === -1) {
    return 0;
  }

  if (Math.abs(candidateIndex - requiredIndex) === 1) {
    return SCORE_WEIGHTS.seniorityAdjacent;
  }

  return 0;
}

function scoreEnglish(candidate: Candidate, vacancy: Vacancy): number {
  const candidateIndex = ENGLISH_LADDER.indexOf(candidate.englishLevel);
  const requiredIndex = ENGLISH_LADDER.indexOf(vacancy.requiredEnglishLevel);

  if (candidateIndex === -1 || requiredIndex === -1) {
    return 0;
  }

  if (candidateIndex >= requiredIndex) {
    return SCORE_WEIGHTS.englishMeetsOrExceeds;
  }

  return 0;
}

function scoreSalary(candidate: Candidate, vacancy: Vacancy): number {
  const { expectedSalary } = candidate;
  const { salaryRangeMin, salaryRangeMax } = vacancy;

  if (expectedSalary >= salaryRangeMin && expectedSalary <= salaryRangeMax) {
    return SCORE_WEIGHTS.salaryInRange;
  }

  const nearCeiling = salaryRangeMax * SCORE_WEIGHTS.salaryNearAboveFactor;
  if (expectedSalary > salaryRangeMax && expectedSalary <= nearCeiling) {
    return SCORE_WEIGHTS.salaryNearAbove;
  }

  return 0;
}

export function calculateCandidateScore(
  candidate: Candidate,
  vacancy: Vacancy,
): CandidateScore {
  const breakdown: ScoreBreakdown = {
    skills: scoreSkills(candidate, vacancy),
    experience: scoreExperience(candidate, vacancy),
    seniority: scoreSeniority(candidate, vacancy),
    english: scoreEnglish(candidate, vacancy),
    salary: scoreSalary(candidate, vacancy),
  };

  const sum =
    breakdown.skills +
    breakdown.experience +
    breakdown.seniority +
    breakdown.english +
    breakdown.salary;

  return {
    total: clampTotal(sum),
    breakdown,
  };
}

export function rankCandidatesForVacancy(
  candidates: Candidate[],
  vacancy: Vacancy,
): RankedCandidate[] {
  const ranked: RankedCandidate[] = candidates.map((candidate) => ({
    candidate,
    score: calculateCandidateScore(candidate, vacancy),
  }));

  ranked.sort((a, b) => {
    if (b.score.total !== a.score.total) {
      return b.score.total - a.score.total;
    }
    return a.candidate.id.localeCompare(b.candidate.id);
  });

  return ranked;
}

export function groupCandidatesBySeniority(
  candidates: Candidate[],
): Record<SeniorityLevel, Candidate[]> {
  const groups = {} as Record<SeniorityLevel, Candidate[]>;

  for (const level of SENIORITY_LADDER) {
    groups[level] = [];
  }

  for (const candidate of candidates) {
    groups[candidate.seniority].push(candidate);
  }

  return groups;
}

export function countCandidatesByStatus(
  candidates: Candidate[],
): Record<CandidateStatus, number> {
  const counts = {} as Record<CandidateStatus, number>;

  for (const status of CANDIDATE_STATUSES) {
    counts[status] = 0;
  }

  for (const candidate of candidates) {
    counts[candidate.status] += 1;
  }

  return counts;
}

export function calculateAverageSalary(candidates: Candidate[]): number {
  if (candidates.length === 0) {
    return 0;
  }

  const sum = candidates.reduce(
    (total, candidate) => total + candidate.expectedSalary,
    0,
  );
  return roundToTwoDecimals(sum / candidates.length);
}

export function findTopSkills(
  candidates: Candidate[],
  topN: number,
): SkillCount[] {
  if (topN <= 0 || candidates.length === 0) {
    return [];
  }

  const counts = new Map<string, { skill: string; count: number }>();

  for (const candidate of candidates) {
    const seenInCandidate = new Set<string>();

    for (const rawSkill of candidate.skills) {
      const key = normalizeSkill(rawSkill);
      if (key === "" || seenInCandidate.has(key)) {
        continue;
      }
      seenInCandidate.add(key);

      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { skill: rawSkill.trim(), count: 1 });
      }
    }
  }

  return [...counts.values()]
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.skill.localeCompare(b.skill);
    })
    .slice(0, topN);
}

export function calculateVacancyFillRate(
  processes: SelectionProcess[],
): number {
  if (processes.length === 0) {
    return 0;
  }

  const hired = processes.filter((process) => process.stage === "Hired").length;
  return roundToTwoDecimals((hired / processes.length) * 100);
}
