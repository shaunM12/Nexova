import type {
  Candidate,
  Vacancy,
  ValidationError,
  ValidationResult,
} from "../types";

export function isValidEmail(email: string): boolean {
  if (email.includes(" ")) {
    return false;
  }

  const parts = email.split("@");
  if (parts.length !== 2) {
    return false;
  }

  const [local, domain] = parts;
  if (!local || !domain) {
    return false;
  }

  if (!domain.includes(".")) {
    return false;
  }

  if (domain.startsWith(".") || domain.endsWith(".")) {
    return false;
  }

  return true;
}

function buildResult(errors: ValidationError[]): ValidationResult {
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateCandidate(candidate: Candidate): ValidationResult {
  const errors: ValidationError[] = [];

  if (candidate.yearsOfExperience < 0 || candidate.yearsOfExperience > 50) {
    errors.push({
      field: "yearsOfExperience",
      code: "YEARS_OUT_OF_RANGE",
      message: "yearsOfExperience must be between 0 and 50",
    });
  }

  if (candidate.currentSalary <= 0) {
    errors.push({
      field: "currentSalary",
      code: "CURRENT_SALARY_INVALID",
      message: "currentSalary must be greater than 0",
    });
  }

  if (candidate.expectedSalary <= 0) {
    errors.push({
      field: "expectedSalary",
      code: "EXPECTED_SALARY_INVALID",
      message: "expectedSalary must be greater than 0",
    });
  }

  if (candidate.skills.length < 1) {
    errors.push({
      field: "skills",
      code: "SKILLS_EMPTY",
      message: "skills must contain at least 1 skill",
    });
  }

  if (!isValidEmail(candidate.email)) {
    errors.push({
      field: "email",
      code: "INVALID_EMAIL",
      message: "email must be a valid email format",
    });
  }

  if (candidate.phone.trim() === "") {
    errors.push({
      field: "phone",
      code: "PHONE_EMPTY",
      message: "phone must not be empty",
    });
  }

  return buildResult(errors);
}

export function validateVacancy(vacancy: Vacancy): ValidationResult {
  const errors: ValidationError[] = [];

  if (vacancy.requiredSkills.length < 1) {
    errors.push({
      field: "requiredSkills",
      code: "REQUIRED_SKILLS_EMPTY",
      message: "requiredSkills must contain at least 1 skill",
    });
  }

  if (vacancy.minYearsExperience < 0) {
    errors.push({
      field: "minYearsExperience",
      code: "MIN_YEARS_INVALID",
      message: "minYearsExperience must be greater than or equal to 0",
    });
  }

  if (vacancy.maxYearsExperience < vacancy.minYearsExperience) {
    errors.push({
      field: "maxYearsExperience",
      code: "MAX_YEARS_INVALID",
      message: "maxYearsExperience must be greater than or equal to minYearsExperience",
    });
  }

  const salaryInvalid =
    vacancy.salaryRangeMin <= 0 ||
    vacancy.salaryRangeMax <= 0 ||
    vacancy.salaryRangeMax < vacancy.salaryRangeMin;

  if (salaryInvalid) {
    errors.push({
      field: "salaryRangeMin",
      code: "SALARY_RANGE_INVALID",
      message:
        "salaryRangeMax must be greater than or equal to salaryRangeMin, and both must be greater than 0",
    });
  }

  return buildResult(errors);
}
