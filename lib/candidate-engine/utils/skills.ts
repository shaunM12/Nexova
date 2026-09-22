/** Normalize a skill for comparison (trim + case-insensitive). */
export function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

export function candidateHasSkill(
  candidateSkills: string[],
  requiredSkill: string,
): boolean {
  const target = normalizeSkill(requiredSkill);
  return candidateSkills.some((skill) => normalizeSkill(skill) === target);
}

export function countMatchingSkills(
  candidateSkills: string[],
  requiredSkills: string[],
): number {
  return requiredSkills.filter((required) =>
    candidateHasSkill(candidateSkills, required),
  ).length;
}
