import { describe, expect, it } from "vitest";
import { RecordFormSchema, RecordListSchema, RecordSchema, toRecordCreate, type RecordFormValues } from "./schemas";

const valid: RecordFormValues = {
  full_name: "Lucía Fernández",
  email: "lucia@example.com",
  phone: "+34 612 345 678",
  position: "Executive Assistant",
  experience_years: 6,
  linkedin_url: "",
  cv_url: "",
};

const apiRecord = {
  id: "abc",
  full_name: "Lucía Fernández",
  email: "lucia@example.com",
  phone: "+34 612 345 678",
  position: "Executive Assistant",
  linkedin_url: null,
  cv_url: null,
  status: "received",
  stage: "pending",
  experience_years: 6,
  notes_count: 0,
  applied_at: "2026-02-28T20:04:32.114Z",
  updated_at: "2026-09-29T02:18:42.747578Z",
};

describe("RecordFormSchema", () => {
  it("accepts a valid candidate", () => {
    expect(RecordFormSchema.safeParse(valid).success).toBe(true);
  });

  it("requires every API-required field", () => {
    const result = RecordFormSchema.safeParse({
      ...valid,
      full_name: "",
      email: "",
      phone: "",
      position: "",
      experience_years: Number.NaN,
    });
    expect(result.success).toBe(false);
    const fields = result.error!.issues.map((issue) => issue.path[0]);
    expect(new Set(fields)).toEqual(
      new Set(["full_name", "email", "phone", "position", "experience_years"]),
    );
  });

  it("rejects malformed email, phone, and URLs", () => {
    const result = RecordFormSchema.safeParse({
      ...valid,
      email: "lucia@",
      phone: "abc",
      linkedin_url: "linkedin.com/in/lucia",
    });
    const fields = result.error!.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["email", "phone", "linkedin_url"]));
  });

  it("converts empty optional URLs to null for the API", () => {
    expect(toRecordCreate({ ...valid, full_name: "  Lucía  " })).toMatchObject({
      full_name: "Lucía",
      linkedin_url: null,
      cv_url: null,
    });
  });
});

describe("response schemas", () => {
  it("parses a real API record and strips the embedded notes array", () => {
    const parsed = RecordSchema.parse({ ...apiRecord, notes: [{ id: "n1" }] });
    expect(parsed).not.toHaveProperty("notes");
  });

  it("rejects malformed responses", () => {
    expect(RecordSchema.safeParse({ ...apiRecord, updated_at: "yesterday" }).success).toBe(false);
    expect(RecordListSchema.safeParse({ data: [] }).success).toBe(false);
  });
});
