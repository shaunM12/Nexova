"use client";

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState } from "react";

interface UnsavedChangesContextValue {
  isDirty: boolean;
  setDirty: (key: string, dirty: boolean) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue>({
  isDirty: false,
  setDirty: () => {},
});

export const DISCARD_CHANGES_MESSAGE = "Discard changes? Your unsaved edits will be lost.";

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const [dirtyKeys, setDirtyKeys] = useState<ReadonlySet<string>>(new Set());

  const setDirty = useCallback((key: string, dirty: boolean) => {
    setDirtyKeys((current) => {
      if (current.has(key) === dirty) return current;
      const next = new Set(current);
      if (dirty) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ isDirty: dirtyKeys.size > 0, setDirty }), [dirtyKeys, setDirty]);

  return <UnsavedChangesContext.Provider value={value}>{children}</UnsavedChangesContext.Provider>;
}

export function useUnsavedChangesContext() {
  return useContext(UnsavedChangesContext);
}

/** Registers a dirty form: guards backoffice links and prompts on refresh/close. Browser Back is not intercepted. */
export function useUnsavedChangesGuard(isDirty: boolean) {
  const key = useId();
  const { setDirty } = useUnsavedChangesContext();

  useEffect(() => {
    setDirty(key, isDirty);
    return () => setDirty(key, false);
  }, [key, isDirty, setDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);
}
