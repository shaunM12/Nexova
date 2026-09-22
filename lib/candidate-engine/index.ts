export type {
  AvailabilityStatus,
  Candidate,
  CandidateScore,
  CandidateStatus,
  EnglishLevel,
  ProcessStage,
  RankedCandidate,
  ScoreBreakdown,
  SelectionProcess,
  SeniorityLevel,
  SkillCount,
  Vacancy,
  VacancyStatus,
  ValidationError,
  ValidationResult,
} from "./types";

export {
  CANDIDATE_STATUSES,
  ENGLISH_LADDER,
  SENIORITY_LADDER,
} from "./types";

export { SCORE_WEIGHTS } from "./constants/scoreWeights";
export {
  sampleCandidates,
  sampleProcesses,
  sampleVacancy,
} from "./data/sample";

export {
  filterCandidatesByAvailability,
  filterCandidatesBySeniority,
  filterCandidatesBySkills,
  sortCandidatesByExperience,
  sortCandidatesBySalary,
} from "./utils/collections";

export { isCandidateCompatibleWithVacancy } from "./utils/compatibility";

export {
  binarySearchCandidateBySalary,
  findCandidateByEmail,
  findCandidateById,
} from "./utils/search";

export {
  calculateAverageSalary,
  calculateCandidateScore,
  calculateVacancyFillRate,
  countCandidatesByStatus,
  findTopSkills,
  groupCandidatesBySeniority,
  rankCandidatesForVacancy,
} from "./utils/transformations";

export {
  isValidEmail,
  validateCandidate,
  validateVacancy,
} from "./utils/validations";
