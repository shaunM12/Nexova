"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch, type Path } from "react-hook-form";
import { errorMessage, isPipelineApiError } from "@/lib/backoffice/pipeline/api";
import { useDuplicateEmailCheck } from "@/lib/backoffice/pipeline/hooks";
import { RecordFormSchema, type RecordFormValues } from "@/lib/backoffice/pipeline/schemas";
import { GuardedLink } from "../shell/GuardedLink";
import { useUnsavedChangesGuard } from "../shell/UnsavedChanges";
import { fieldClass, primaryButtonClass, secondaryButtonClass } from "./States";

const FIELDS: {
  name: Path<RecordFormValues>;
  label: string;
  type: string;
  required: boolean;
  autoComplete?: string;
  hint?: string;
}[] = [
  { name: "full_name", label: "Full name", type: "text", required: true, autoComplete: "name" },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", required: true, autoComplete: "tel" },
  { name: "position", label: "Position", type: "text", required: true },
  { name: "experience_years", label: "Years of experience", type: "number", required: true },
  { name: "linkedin_url", label: "LinkedIn URL", type: "url", required: false, hint: "Optional" },
  { name: "cv_url", label: "CV URL", type: "url", required: false, hint: "Optional" },
];

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  idPrefix: string;
  defaultValues: RecordFormValues;
  submitLabel: string;
  submittingLabel: string;
  excludeId?: string;
  onSubmit: (values: RecordFormValues) => Promise<void>;
  onCancel?: () => void;
}

export function CandidateForm({
  idPrefix,
  defaultValues,
  submitLabel,
  submittingLabel,
  excludeId,
  onSubmit,
  onCancel,
}: Props) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
  } = useForm<RecordFormValues>({
    resolver: zodResolver(RecordFormSchema),
    defaultValues,
    mode: "onTouched",
  });
  const duplicate = useDuplicateEmailCheck(excludeId);
  const email = (useWatch({ control, name: "email" }) ?? "").trim().toLowerCase();

  useUnsavedChangesGuard(isDirty && !isSubmitSuccessful);

  const checkEmail = (value: string) => {
    if (EMAIL_SHAPE.test(value.trim())) void duplicate.check(value);
    else duplicate.reset();
  };

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await duplicate.check(values.email);
    if (result.kind === "duplicate") {
      setError("email", { message: "A candidate with this email already exists" }, { shouldFocus: true });
      return;
    }
    try {
      await onSubmit(values);
    } catch (error) {
      if (isPipelineApiError(error) && error.kind === "validation") {
        const known = FIELDS.map((field) => field.name as string);
        let matched = false;
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          if (known.includes(field)) {
            setError(field as Path<RecordFormValues>, { message }, { shouldFocus: !matched });
            matched = true;
          }
        }
        if (!matched) setFormError(error.message);
        return;
      }
      setFormError(errorMessage(error));
    }
  });

  const dupState = duplicate.state;
  const dupForCurrent = "email" in dupState && dupState.email === email ? dupState : null;

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {formError && (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          {formError}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => {
          const id = `${idPrefix}-${field.name}`;
          const error = errors[field.name]?.message;
          const describedBy = [error && `${id}-error`, field.name === "email" && dupForCurrent && `${id}-check`]
            .filter(Boolean)
            .join(" ");
          const registration = register(field.name, field.type === "number" ? { valueAsNumber: true } : {});
          return (
            <div key={field.name}>
              <label htmlFor={id} className="text-sm font-medium text-ink">
                {field.label}
                {field.required ? (
                  <span className="text-danger" aria-hidden="true"> *</span>
                ) : (
                  <span className="font-normal text-ink-muted"> ({field.hint})</span>
                )}
              </label>
              <input
                id={id}
                type={field.type}
                autoComplete={field.autoComplete}
                inputMode={field.type === "number" ? "decimal" : undefined}
                step={field.type === "number" ? "any" : undefined}
                min={field.type === "number" ? 0 : undefined}
                aria-required={field.required}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy || undefined}
                className={fieldClass}
                {...registration}
                onBlur={(event) => {
                  void registration.onBlur(event);
                  if (field.name === "email") checkEmail(event.target.value);
                }}
              />
              {error && (
                <p id={`${id}-error`} className="mt-1 text-sm text-danger">
                  {error}
                </p>
              )}
              {field.name === "email" && dupForCurrent && (
                <div id={`${id}-check`} className="mt-1 text-sm" aria-live="polite">
                  {dupForCurrent.kind === "checking" && (
                    <span className="text-ink-muted">Checking for existing candidates…</span>
                  )}
                  {dupForCurrent.kind === "duplicate" && (
                    <span className="text-danger">
                      {!error && "A candidate with this email already exists. "}
                      <GuardedLink
                        href={`/backoffice/pipeline/${encodeURIComponent(dupForCurrent.record.id)}`}
                        className="font-medium underline"
                      >
                        View {dupForCurrent.record.full_name}
                      </GuardedLink>
                    </span>
                  )}
                  {dupForCurrent.kind === "error" && (
                    <span className="text-amber-800">
                      Couldn&apos;t check for duplicates. You can still save.{" "}
                      <button
                        type="button"
                        onClick={() => void duplicate.check(email)}
                        className="font-medium underline"
                      >
                        Retry check
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-ink-muted">
        <span className="text-danger" aria-hidden="true">*</span> Required
      </p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isSubmitting} className={secondaryButtonClass}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
