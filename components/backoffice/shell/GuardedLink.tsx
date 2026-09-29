"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { DISCARD_CHANGES_MESSAGE, useUnsavedChangesContext } from "./UnsavedChanges";

/** Use for every in-app backoffice link so unsaved form changes are never lost silently. */
export function GuardedLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  const { isDirty } = useUnsavedChangesContext();

  return (
    <Link
      {...props}
      onClick={(event) => {
        if (isDirty && !window.confirm(DISCARD_CHANGES_MESSAGE)) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    />
  );
}
