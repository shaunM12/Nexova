import type { Stage, Status } from "../labels";
import type { Note, PipelineRecord } from "../schemas";

const MS_PER_DAY = 86_400_000;

/** Seed dates are relative to "now" so the stale examples stay stale (and fresh ones fresh). */
function daysAgo(days: number, now: Date, microsecondPrecision = false): string {
  const iso = new Date(now.getTime() - days * MS_PER_DAY).toISOString();
  return microsecondPrecision ? iso.replace("Z", "578Z") : iso;
}

interface SeedCandidate {
  full_name: string;
  email: string;
  phone: string;
  experience_years: number;
  linkedin: boolean;
  cv: boolean;
  status: Status;
  stage: Stage;
  appliedDaysAgo: number;
  updatedDaysAgo: number;
  notes: { content: string; daysAgo: number }[];
}

const CANDIDATES: SeedCandidate[] = [
  {
    full_name: "Lucía Fernández Ortega",
    email: "lucia.fernandez@example.com",
    phone: "+34 612 345 678",
    experience_years: 6,
    linkedin: true,
    cv: true,
    status: "received",
    stage: "pending",
    appliedDaysAgo: 1,
    updatedDaysAgo: 1,
    notes: [],
  },
  {
    full_name: "Daniel Brooks",
    email: "daniel.brooks@example.com",
    phone: "+1 305 555 0142",
    experience_years: 4,
    linkedin: true,
    cv: false,
    status: "received",
    stage: "pending",
    appliedDaysAgo: 3,
    updatedDaysAgo: 3,
    notes: [],
  },
  {
    full_name: "Marta Sánchez Ruiz",
    email: "marta.sanchez@example.com",
    phone: "+34 623 456 789",
    experience_years: 8,
    linkedin: true,
    cv: true,
    status: "in_progress",
    stage: "review",
    appliedDaysAgo: 6,
    updatedDaysAgo: 2,
    notes: [{ content: "Strong calendar management background at a Big Four firm.", daysAgo: 2 }],
  },
  {
    full_name: "Javier Moreno Gil",
    email: "javier.moreno@example.com",
    phone: "+34 634 567 890",
    experience_years: 5,
    linkedin: false,
    cv: true,
    status: "in_progress",
    stage: "personal_interview",
    appliedDaysAgo: 10,
    updatedDaysAgo: 13,
    notes: [
      { content: "Phone screen done. Fluent English, good energy.", daysAgo: 13 },
      { content: "Schedule personal interview with Elena.", daysAgo: 13 },
    ],
  },
  {
    full_name: "Sofía Navarro Castillo",
    email: "sofia.navarro@example.com",
    phone: "+34 645 678 901",
    experience_years: 10,
    linkedin: true,
    cv: true,
    status: "in_progress",
    stage: "technical_interview",
    appliedDaysAgo: 18,
    updatedDaysAgo: 14,
    notes: [{ content: "Excellent personal interview. Move to practical exercise.", daysAgo: 14 }],
  },
  {
    full_name: "Emily Carter",
    email: "emily.carter@example.com",
    phone: "+1 786 555 0199",
    experience_years: 7,
    linkedin: true,
    cv: true,
    status: "selected",
    stage: "offer_presented",
    appliedDaysAgo: 24,
    updatedDaysAgo: 4,
    notes: [
      { content: "Offer sent. Awaiting reply by Friday.", daysAgo: 4 },
      { content: "References checked: all positive.", daysAgo: 6 },
    ],
  },
  {
    full_name: "Pablo Jiménez Soto",
    email: "pablo.jimenez@example.com",
    phone: "+34 656 789 012",
    experience_years: 3,
    linkedin: false,
    cv: false,
    status: "received",
    stage: "pending",
    appliedDaysAgo: 22,
    updatedDaysAgo: 22,
    notes: [],
  },
  {
    full_name: "Ana Belén Torres",
    email: "ana.torres@example.com",
    phone: "+34 667 890 123",
    experience_years: 2,
    linkedin: true,
    cv: true,
    status: "discarded",
    stage: "review",
    appliedDaysAgo: 28,
    updatedDaysAgo: 25,
    notes: [{ content: "No Spanish at professional level. Discarded.", daysAgo: 25 }],
  },
  {
    full_name: "Carlos Romero Vidal",
    email: "carlos.romero@example.com",
    phone: "+34 678 901 234",
    experience_years: 12,
    linkedin: true,
    cv: true,
    status: "discarded",
    stage: "personal_interview",
    appliedDaysAgo: 30,
    updatedDaysAgo: 20,
    notes: [{ content: "Salary expectations well above range.", daysAgo: 20 }],
  },
  {
    full_name: "Hannah Müller",
    email: "hannah.muller@example.com",
    phone: "+49 151 2345 6789",
    experience_years: 9,
    linkedin: true,
    cv: true,
    status: "in_progress",
    stage: "offer_presented",
    appliedDaysAgo: 33,
    updatedDaysAgo: 7,
    notes: [],
  },
  {
    full_name: "Irene Castro Molina",
    email: "irene.castro@example.com",
    phone: "+34 689 012 345",
    experience_years: 5,
    linkedin: false,
    cv: true,
    status: "selected",
    stage: "technical_interview",
    appliedDaysAgo: 36,
    updatedDaysAgo: 9,
    notes: [{ content: "Selected as backup candidate.", daysAgo: 9 }],
  },
  {
    full_name: "Miguel Ángel Rubio",
    email: "miguel.rubio@example.com",
    phone: "+34 690 123 456",
    experience_years: 4,
    linkedin: true,
    cv: false,
    status: "in_progress",
    stage: "review",
    appliedDaysAgo: 40,
    updatedDaysAgo: 31,
    notes: [],
  },
];

export interface SeedRecord extends PipelineRecord {
  notes: Note[];
}

function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Newest application first. Every status and stage is represented; both timestamp formats appear. */
export function buildSeed(now: Date = new Date()): SeedRecord[] {
  return CANDIDATES.map((candidate, index) => {
    const id = `demo-${slug(candidate.full_name)}`;
    const notes: Note[] = candidate.notes.map((note, noteIndex) => ({
      id: `${id}-note-${noteIndex + 1}`,
      record_id: id,
      content: note.content,
      created_at: daysAgo(note.daysAgo, now, noteIndex % 2 === 1),
    }));
    return {
      id,
      full_name: candidate.full_name,
      email: candidate.email,
      phone: candidate.phone,
      position: "Executive Assistant",
      linkedin_url: candidate.linkedin ? `https://www.linkedin.com/in/${slug(candidate.full_name)}` : null,
      cv_url: candidate.cv ? `https://example.com/cv/${slug(candidate.full_name)}.pdf` : null,
      status: candidate.status,
      stage: candidate.stage,
      experience_years: candidate.experience_years,
      notes_count: notes.length,
      applied_at: daysAgo(candidate.appliedDaysAgo, now),
      updated_at: daysAgo(candidate.updatedDaysAgo, now, index % 2 === 0),
      notes,
    };
  });
}
