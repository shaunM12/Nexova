export type EnglishLevel =
  | "A1"
  | "A2"
  | "B1"
  | "B2"
  | "C1"
  | "C2"
  | "Native";

export type SeniorityLevel =
  | "Junior"
  | "Semi-Senior"
  | "Senior"
  | "Lead"
  | "Executive";

export type AvailabilityStatus =
  | "Immediate"
  | "2 weeks"
  | "1 month"
  | "Not available";

export type CandidateStatus = "Active" | "In process" | "Hired" | "Inactive";

export type VacancyStatus = "Open" | "In progress" | "Closed" | "On hold";

export type ProcessStage =
  | "Screening"
  | "Interview"
  | "Technical test"
  | "Final interview"
  | "Offer"
  | "Rejected"
  | "Hired";

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  yearsOfExperience: number;
  skills: string[];
  englishLevel: EnglishLevel;
  seniority: SeniorityLevel;
  currentSalary: number;
  expectedSalary: number;
  availability: AvailabilityStatus;
  location: string;
  remoteOnly: boolean;
  status: CandidateStatus;
}

export interface Vacancy {
  id: string;
  title: string;
  companyName: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minYearsExperience: number;
  maxYearsExperience: number;
  requiredEnglishLevel: EnglishLevel;
  requiredSeniority: SeniorityLevel;
  salaryRangeMin: number;
  salaryRangeMax: number;
  isRemote: boolean;
  location: string;
  status: VacancyStatus;
}

export interface SelectionProcess {
  id: string;
  candidateId: string;
  vacancyId: string;
  stage: ProcessStage;
  score: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ScoreBreakdown {
  skills: number;
  experience: number;
  seniority: number;
  english: number;
  salary: number;
}

export interface CandidateScore {
  total: number;
  breakdown: ScoreBreakdown;
}

export interface RankedCandidate {
  candidate: Candidate;
  score: CandidateScore;
}

export interface SkillCount {
  skill: string;
  count: number;
}

export const SENIORITY_LADDER: readonly SeniorityLevel[] = [
  "Junior",
  "Semi-Senior",
  "Senior",
  "Lead",
  "Executive",
] as const;

export const ENGLISH_LADDER: readonly EnglishLevel[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "Native",
] as const;

export const CANDIDATE_STATUSES: readonly CandidateStatus[] = [
  "Active",
  "In process",
  "Hired",
  "Inactive",
] as const;
