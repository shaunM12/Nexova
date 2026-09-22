/** Named caps used by `calculateCandidateScore`. */
export const SCORE_WEIGHTS = {
  skillsAllRequired: 40,
  skillsPartialRequired: 20,
  preferredSkillEach: 10,
  preferredSkillMax: 20,
  experienceInRange: 20,
  experienceNearRange: 10,
  experienceNearMaxDistance: 2,
  seniorityExact: 15,
  seniorityAdjacent: 7,
  englishMeetsOrExceeds: 15,
  salaryInRange: 10,
  salaryNearAbove: 5,
  salaryNearAboveFactor: 1.2,
  totalMin: 0,
  totalMax: 100,
} as const;
