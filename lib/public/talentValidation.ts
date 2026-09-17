export type TalentFormValues = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  experience: string;
  sector: string;
  englishLevel: string;
  availability: string;
  linkedin: string;
  comments: string;
  dataPolicy: boolean;
};

export type TalentFormErrors = Partial<
  Record<keyof TalentFormValues, string>
>;

export const initialTalentFormValues: TalentFormValues = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  experience: "",
  sector: "",
  englishLevel: "",
  availability: "",
  linkedin: "",
  comments: "",
  dataPolicy: false,
};

/** Canonical English error copy (product-context source of truth). */
export const errorMessages = {
  fullName: "Name must contain at least first and last name",
  email: "Enter a valid email (example: name@company.com)",
  phone: "Phone must include country code (example: +34 612 345 678)",
  country: "Select your country of residence",
  experience: "Years of experience must be between 0 and 50",
  sector: "Select your sector of interest",
  englishLevel: "Indicate your English level",
  availability: "Select your availability",
  linkedin: "If you include LinkedIn, it must be a valid URL",
  comments: (remaining: number) =>
    `Comments cannot exceed 500 characters (${remaining} remaining)`,
  dataPolicy: "You must accept the data processing policy to continue",
} as const;

export type ValidationMessages = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  experience: string;
  sector: string;
  englishLevel: string;
  availability: string;
  linkedin: string;
  comments: (remaining: number) => string;
  dataPolicy: string;
};

export const fieldOrder: (keyof TalentFormValues)[] = [
  "fullName",
  "email",
  "phone",
  "country",
  "experience",
  "sector",
  "englishLevel",
  "availability",
  "linkedin",
  "comments",
  "dataPolicy",
];

export function validateField(
  key: keyof TalentFormValues,
  values: TalentFormValues,
  messages: ValidationMessages = errorMessages,
): string {
  switch (key) {
    case "fullName": {
      const words = values.fullName.trim().split(/\s+/).filter(Boolean);
      return words.length < 2 ? messages.fullName : "";
    }
    case "email": {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(values.email.trim()) ? "" : messages.email;
    }
    case "phone": {
      const pattern = /^\+[1-9]\d{0,3}[\s-]?\d[\d\s-]{5,}$/;
      return pattern.test(values.phone.trim()) ? "" : messages.phone;
    }
    case "country":
      return values.country ? "" : messages.country;
    case "experience": {
      if (values.experience === "") return messages.experience;
      const n = Number(values.experience);
      return Number.isFinite(n) && n >= 0 && n <= 50
        ? ""
        : messages.experience;
    }
    case "sector":
      return values.sector ? "" : messages.sector;
    case "englishLevel":
      return values.englishLevel ? "" : messages.englishLevel;
    case "availability":
      return values.availability ? "" : messages.availability;
    case "linkedin": {
      const value = values.linkedin.trim();
      if (!value) return "";
      if (!/^https?:\/\/.+/i.test(value)) return messages.linkedin;
      try {
        // eslint-disable-next-line no-new
        new URL(value);
        return "";
      } catch {
        return messages.linkedin;
      }
    }
    case "comments": {
      const remaining = Math.max(0, 500 - values.comments.length);
      return values.comments.length > 500
        ? messages.comments(remaining)
        : "";
    }
    case "dataPolicy":
      return values.dataPolicy ? "" : messages.dataPolicy;
    default:
      return "";
  }
}

export function validateAll(
  values: TalentFormValues,
  messages: ValidationMessages = errorMessages,
): {
  ok: boolean;
  errors: TalentFormErrors;
  firstInvalid: keyof TalentFormValues | null;
} {
  const errors: TalentFormErrors = {};
  let firstInvalid: keyof TalentFormValues | null = null;

  for (const key of fieldOrder) {
    const message = validateField(key, values, messages);
    if (message) {
      errors[key] = message;
      if (!firstInvalid) firstInvalid = key;
    }
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    firstInvalid,
  };
}
