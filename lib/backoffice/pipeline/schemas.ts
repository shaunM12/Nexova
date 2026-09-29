import { z } from "zod";
import { isValidApiDate } from "./dates";

// ---- Forms ----

function requiredText(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be ${max} characters or fewer`);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || isHttpUrl(value), {
    message: "Enter a full URL starting with http:// or https://",
  });

export const RecordFormSchema = z.object({
  full_name: requiredText("Full name", 2, 120),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .pipe(z.email({ error: "Enter a valid email address" })),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required")
    .regex(/^[0-9+\-()\s]{7,20}$/, "Enter a valid phone number (7–20 digits, spaces, + - ( ))"),
  position: requiredText("Position", 2, 120),
  experience_years: z
    .number({ error: "Enter years of experience" })
    .min(0, "Experience can't be negative")
    .max(60, "Experience must be 60 years or fewer"),
  linkedin_url: optionalUrl,
  cv_url: optionalUrl,
});

export type RecordFormValues = z.infer<typeof RecordFormSchema>;

export const EMPTY_RECORD_FORM: RecordFormValues = {
  full_name: "",
  email: "",
  phone: "",
  position: "",
  experience_years: Number.NaN,
  linkedin_url: "",
  cv_url: "",
};

export const NoteFormSchema = z.object({
  content: z.string().trim().min(1, "Write a note before saving"),
});

export type NoteFormValues = z.infer<typeof NoteFormSchema>;

// ---- API payloads ----

export interface RecordCreate {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  experience_years: number;
  linkedin_url: string | null;
  cv_url: string | null;
}

export function toRecordCreate(values: RecordFormValues): RecordCreate {
  return {
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    position: values.position.trim(),
    experience_years: values.experience_years,
    linkedin_url: values.linkedin_url.trim() || null,
    cv_url: values.cv_url.trim() || null,
  };
}

export function toFormValues(record: PipelineRecord): RecordFormValues {
  return {
    full_name: record.full_name,
    email: record.email,
    phone: record.phone,
    position: record.position,
    experience_years: record.experience_years,
    linkedin_url: record.linkedin_url ?? "",
    cv_url: record.cv_url ?? "",
  };
}

// ---- API responses ----

const apiDate = z.string().refine(isValidApiDate, { message: "Invalid date" });
const nullableText = z
  .string()
  .nullish()
  .transform((value) => value ?? null);

/** status/stage stay plain strings so an unknown value renders "Unknown" instead of failing the page. */
export const RecordSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  email: z.string(),
  phone: z.string(),
  position: z.string(),
  linkedin_url: nullableText,
  cv_url: nullableText,
  status: z.string(),
  stage: z.string(),
  experience_years: z.number(),
  notes_count: z.number().int(),
  applied_at: apiDate,
  updated_at: apiDate,
});

export type PipelineRecord = z.infer<typeof RecordSchema>;

export const RecordListSchema = z.object({
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  data: z.array(RecordSchema),
});

export type RecordList = z.infer<typeof RecordListSchema>;

export const NoteSchema = z.object({
  id: z.string(),
  record_id: z.string(),
  content: z.string(),
  created_at: apiDate,
});

export type Note = z.infer<typeof NoteSchema>;

export const NoteListSchema = z.object({
  data: z.array(NoteSchema),
  meta: z.object({ total: z.number().int() }),
});

export type NoteList = z.infer<typeof NoteListSchema>;
