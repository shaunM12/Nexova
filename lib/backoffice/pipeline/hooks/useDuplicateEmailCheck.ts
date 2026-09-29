import { useCallback, useRef, useState } from "react";
import { findRecordByEmail } from "../api";
import type { PipelineRecord } from "../schemas";

export type DuplicateCheckState =
  | { kind: "idle" }
  | { kind: "checking"; email: string }
  | { kind: "clear"; email: string }
  | { kind: "duplicate"; email: string; record: PipelineRecord }
  | { kind: "error"; email: string };

/** A failed check never blocks submission; only a confirmed duplicate does. */
export function useDuplicateEmailCheck(excludeId?: string) {
  const [state, setState] = useState<DuplicateCheckState>({ kind: "idle" });
  const latest = useRef(0);

  const check = useCallback(
    async (rawEmail: string): Promise<DuplicateCheckState> => {
      const email = rawEmail.trim().toLowerCase();
      if (!email) {
        const idle: DuplicateCheckState = { kind: "idle" };
        setState(idle);
        return idle;
      }
      const requestId = ++latest.current;
      setState({ kind: "checking", email });
      let result: DuplicateCheckState;
      try {
        const record = await findRecordByEmail(email, excludeId);
        result = record ? { kind: "duplicate", email, record } : { kind: "clear", email };
      } catch {
        result = { kind: "error", email };
      }
      if (requestId === latest.current) setState(result);
      return result;
    },
    [excludeId],
  );

  const reset = useCallback(() => setState({ kind: "idle" }), []);

  return { state, check, reset };
}
