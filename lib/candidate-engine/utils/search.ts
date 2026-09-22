import type { Candidate } from "../types";

export function findCandidateById(
  candidates: Candidate[],
  id: string,
): Candidate | null {
  const found = candidates.find((candidate) => candidate.id === id);
  return found ?? null;
}

export function findCandidateByEmail(
  candidates: Candidate[],
  email: string,
): Candidate | null {
  const target = email.trim().toLowerCase();
  const found = candidates.find(
    (candidate) => candidate.email.trim().toLowerCase() === target,
  );
  return found ?? null;
}

/** Optional in-memory utility. Assumes ascending `expectedSalary`. */
export function binarySearchCandidateBySalary(
  sortedCandidates: Candidate[],
  targetSalary: number,
): number {
  let low = 0;
  let high = sortedCandidates.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const value = sortedCandidates[mid].expectedSalary;

    if (value === targetSalary) {
      return mid;
    }

    if (value < targetSalary) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}
