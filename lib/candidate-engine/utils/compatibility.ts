import type { Candidate, Vacancy } from "../types";

export function isCandidateCompatibleWithVacancy(
  candidate: Candidate,
  vacancy: Vacancy,
): boolean {
  if (candidate.remoteOnly && !vacancy.isRemote) {
    return false;
  }
  return true;
}
