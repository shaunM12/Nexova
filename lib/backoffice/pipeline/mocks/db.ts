import { buildSeed, type SeedRecord } from "./seed";

/** In-memory store for demo mode and tests. Resets on page refresh (demo) or between tests. */
let records: SeedRecord[] = buildSeed();

export const db = {
  all: (): SeedRecord[] => records,
  find: (id: string): SeedRecord | undefined => records.find((record) => record.id === id),
  insert: (record: SeedRecord): void => {
    records = [record, ...records];
  },
  replace: (record: SeedRecord): void => {
    records = records.map((existing) => (existing.id === record.id ? record : existing));
  },
  remove: (id: string): void => {
    records = records.filter((record) => record.id !== id);
  },
  reset: (now?: Date): void => {
    records = buildSeed(now);
  },
};
