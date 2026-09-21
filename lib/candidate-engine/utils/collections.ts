import type {
  AvailabilityStatus,
  Candidate,
  SeniorityLevel,
} from "../types";
import { candidateHasSkill } from "./skills";

export function filterCandidatesBySkills(
  candidates: Candidate[],
  requiredSkills: string[],
): Candidate[] {
  if (requiredSkills.length === 0) {
    return [...candidates];
  }

  return candidates.filter((candidate) =>
    requiredSkills.every((skill) => candidateHasSkill(candidate.skills, skill)),
  );
}

export function filterCandidatesBySeniority(
  candidates: Candidate[],
  seniority: SeniorityLevel,
): Candidate[] {
  return candidates.filter((candidate) => candidate.seniority === seniority);
}

export function filterCandidatesByAvailability(
  candidates: Candidate[],
  availability: AvailabilityStatus[],
): Candidate[] {
  const allowed = new Set(availability);
  return candidates.filter((candidate) => allowed.has(candidate.availability));
}

export function sortCandidatesBySalary(
  candidates: Candidate[],
  order: "asc" | "desc",
): Candidate[] {
  const sorted = [...candidates];
  sorted.sort((a, b) => {
    const diff = a.expectedSalary - b.expectedSalary;
    return order === "asc" ? diff : -diff;
  });
  return sorted;
}

export function sortCandidatesByExperience(
  candidates: Candidate[],
  order: "asc" | "desc",
): Candidate[] {
  const sorted = [...candidates];
  sorted.sort((a, b) => {
    const diff = a.yearsOfExperience - b.yearsOfExperience;
    return order === "asc" ? diff : -diff;
  });
  return sorted;
}
