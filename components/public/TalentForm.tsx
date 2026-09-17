"use client";

import Link from "next/link";
import { FormEvent, useEffect, useId, useMemo, useState } from "react";
import { useLanguage } from "@/components/public/LanguageProvider";
import {
  initialTalentFormValues,
  TalentFormErrors,
  TalentFormValues,
  validateAll,
  validateField,
} from "@/lib/public/talentValidation";

const inputClass =
  "mt-2 block w-full max-w-full rounded-md border bg-white px-3 py-3 text-base text-ink shadow-sm transition focus:outline-none focus:ring-2";
const normalInputClass =
  "border-ink/20 focus:border-tide focus:ring-tide/30";
const errorInputClass =
  "border-danger focus:border-danger focus:ring-danger/30";
const fieldLabelClass = "block text-sm font-semibold text-ink";
const fieldErrorClass = "mt-1 text-sm text-danger";
const fieldGridClass =
  "grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-x-6 md:gap-y-6";

const availabilityValues = [
  "Immediate",
  "1 month",
  "2-3 months",
  "Just exploring",
] as const;

const countryValues = ["Spain", "United States", "Other"] as const;
const sectorValues = [
  "Technology",
  "Retail",
  "Financial Services",
  "Consulting",
  "Other",
] as const;
const levelValues = ["Basic", "Intermediate", "Advanced", "Native"] as const;

export function TalentForm() {
  const formId = useId();
  const { t, locale } = useLanguage();
  const messages = t.errors;

  const [values, setValues] = useState<TalentFormValues>(initialTalentFormValues);
  const [errors, setErrors] = useState<TalentFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TalentFormValues, boolean>>>({});
  const [submittedOk, setSubmittedOk] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const commentsRemaining = useMemo(
    () => Math.max(0, 500 - values.comments.length),
    [values.comments],
  );

  // Re-validate visible errors when language changes so messages stay in sync.
  useEffect(() => {
    setErrors((prev) => {
      const keys = Object.keys(prev) as (keyof TalentFormValues)[];
      if (keys.length === 0) return prev;
      const next: TalentFormErrors = {};
      for (const key of keys) {
        const message = validateField(key, values, messages);
        if (message) next[key] = message;
      }
      return next;
    });
    setStatusMessage((prev) => {
      if (!prev) return prev;
      if (
        prev === "Please correct the errors in the form." ||
        prev === "Por favor, corrige los errores del formulario."
      ) {
        return t.form.statusCorrectErrors;
      }
      if (
        prev === "Application submitted successfully." ||
        prev === "Solicitud enviada correctamente."
      ) {
        return t.form.statusSubmitted;
      }
      if (prev === "Form cleared." || prev === "Formulario limpiado.") {
        return t.form.statusCleared;
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh copy on locale only
  }, [locale]);

  function setValue<K extends keyof TalentFormValues>(key: K, value: TalentFormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (touched[key] || errors[key]) {
        const message = validateField(key, next, messages);
        setErrors((prevErrors) => {
          const updated = { ...prevErrors };
          if (message) updated[key] = message;
          else delete updated[key];
          return updated;
        });
      }
      return next;
    });
  }

  function handleBlur(key: keyof TalentFormValues) {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const message = validateField(key, values, messages);
    setErrors((prev) => {
      const updated = { ...prev };
      if (message) updated[key] = message;
      else delete updated[key];
      return updated;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateAll(values, messages);
    setErrors(result.errors);
    setTouched(
      Object.fromEntries(
        Object.keys(initialTalentFormValues).map((key) => [key, true]),
      ) as Record<keyof TalentFormValues, boolean>,
    );

    if (!result.ok) {
      setStatusMessage(t.form.statusCorrectErrors);
      if (result.firstInvalid) {
        const el = document.getElementById(`${formId}-${result.firstInvalid}`);
        el?.focus();
      }
      return;
    }

    setStatusMessage(t.form.statusSubmitted);
    setSubmittedOk(true);
  }

  function handleClear() {
    setValues(initialTalentFormValues);
    setErrors({});
    setTouched({});
    setSubmittedOk(false);
    setStatusMessage(t.form.statusCleared);
    document.getElementById(`${formId}-fullName`)?.focus();
  }

  if (submittedOk) {
    return (
      <div
        className="mt-8 rounded-md border border-tide/40 bg-white px-4 py-5 text-ink shadow-sm sm:px-5 sm:py-6"
        role="status"
        aria-live="polite"
        tabIndex={-1}
      >
        <h2 className="font-display text-xl font-semibold text-tide-dark">
          {t.form.successTitle}
        </h2>
        <p className="mt-3 text-ink-muted">{t.form.successBody}</p>
        <p className="mt-3 text-ink-muted">
          {t.form.successFollowBefore}{" "}
          <a
            href="https://linkedin.com/company/nexova"
            className="font-medium text-tide underline-offset-2 hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            LinkedIn
          </a>{" "}
          {t.form.successFollowAfter}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center font-medium text-tide underline-offset-2 hover:underline"
        >
          {t.form.backHome}
        </Link>
      </div>
    );
  }

  return (
    <form
      id="talent-form"
      className="mt-8 space-y-6"
      noValidate
      onSubmit={handleSubmit}
      aria-describedby={`${formId}-status`}
    >
      <p id={`${formId}-status`} className="sr-only" aria-live="polite">
        {statusMessage}
      </p>

      <div className={fieldGridClass}>
        <div>
          <label htmlFor={`${formId}-fullName`} className={fieldLabelClass}>
            {t.form.fullName}{" "}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          </label>
          <input
            type="text"
            id={`${formId}-fullName`}
            name="fullName"
            autoComplete="name"
            required
            value={values.fullName}
            onChange={(e) => setValue("fullName", e.target.value)}
            onBlur={() => handleBlur("fullName")}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={`${formId}-fullName-error`}
            className={`${inputClass} ${errors.fullName ? errorInputClass : normalInputClass}`}
          />
          <p
            id={`${formId}-fullName-error`}
            className={`${fieldErrorClass} ${errors.fullName ? "" : "hidden"}`}
            role="alert"
          >
            {errors.fullName}
          </p>
        </div>

        <div>
          <label htmlFor={`${formId}-email`} className={fieldLabelClass}>
            {t.form.email}{" "}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          </label>
          <input
            type="email"
            id={`${formId}-email`}
            name="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => setValue("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={`${formId}-email-error`}
            className={`${inputClass} ${errors.email ? errorInputClass : normalInputClass}`}
          />
          <p
            id={`${formId}-email-error`}
            className={`${fieldErrorClass} ${errors.email ? "" : "hidden"}`}
            role="alert"
          >
            {errors.email}
          </p>
        </div>

        <div>
          <label htmlFor={`${formId}-phone`} className={fieldLabelClass}>
            {t.form.phone}{" "}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          </label>
          <input
            type="tel"
            id={`${formId}-phone`}
            name="phone"
            autoComplete="tel"
            required
            placeholder="+34 612 345 678"
            value={values.phone}
            onChange={(e) => setValue("phone", e.target.value)}
            onBlur={() => handleBlur("phone")}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={`${formId}-phone-error`}
            className={`${inputClass} ${errors.phone ? errorInputClass : normalInputClass}`}
          />
          <p
            id={`${formId}-phone-error`}
            className={`${fieldErrorClass} ${errors.phone ? "" : "hidden"}`}
            role="alert"
          >
            {errors.phone}
          </p>
        </div>

        <div>
          <label htmlFor={`${formId}-country`} className={fieldLabelClass}>
            {t.form.country}{" "}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          </label>
          <select
            id={`${formId}-country`}
            name="country"
            required
            value={values.country}
            onChange={(e) => setValue("country", e.target.value)}
            onBlur={() => handleBlur("country")}
            aria-invalid={Boolean(errors.country)}
            aria-describedby={`${formId}-country-error`}
            className={`${inputClass} ${errors.country ? errorInputClass : normalInputClass}`}
          >
            <option value="">{t.form.selectCountry}</option>
            {countryValues.map((value) => (
              <option key={value} value={value}>
                {t.form.countries[value]}
              </option>
            ))}
          </select>
          <p
            id={`${formId}-country-error`}
            className={`${fieldErrorClass} ${errors.country ? "" : "hidden"}`}
            role="alert"
          >
            {errors.country}
          </p>
        </div>

        <div>
          <label htmlFor={`${formId}-experience`} className={fieldLabelClass}>
            {t.form.experience}{" "}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          </label>
          <input
            type="number"
            id={`${formId}-experience`}
            name="experience"
            required
            min={0}
            max={50}
            inputMode="numeric"
            value={values.experience}
            onChange={(e) => setValue("experience", e.target.value)}
            onBlur={() => handleBlur("experience")}
            aria-invalid={Boolean(errors.experience)}
            aria-describedby={`${formId}-experience-error`}
            className={`${inputClass} ${errors.experience ? errorInputClass : normalInputClass}`}
          />
          <p
            id={`${formId}-experience-error`}
            className={`${fieldErrorClass} ${errors.experience ? "" : "hidden"}`}
            role="alert"
          >
            {errors.experience}
          </p>
        </div>

        <div>
          <label htmlFor={`${formId}-sector`} className={fieldLabelClass}>
            {t.form.sector}{" "}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          </label>
          <select
            id={`${formId}-sector`}
            name="sector"
            required
            value={values.sector}
            onChange={(e) => setValue("sector", e.target.value)}
            onBlur={() => handleBlur("sector")}
            aria-invalid={Boolean(errors.sector)}
            aria-describedby={`${formId}-sector-error`}
            className={`${inputClass} ${errors.sector ? errorInputClass : normalInputClass}`}
          >
            <option value="">{t.form.selectSector}</option>
            {sectorValues.map((value) => (
              <option key={value} value={value}>
                {t.form.sectors[value]}
              </option>
            ))}
          </select>
          <p
            id={`${formId}-sector-error`}
            className={`${fieldErrorClass} ${errors.sector ? "" : "hidden"}`}
            role="alert"
          >
            {errors.sector}
          </p>
        </div>

        <div className="md:col-span-2">
          <label htmlFor={`${formId}-englishLevel`} className={fieldLabelClass}>
            {t.form.englishLevel}{" "}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          </label>
          <select
            id={`${formId}-englishLevel`}
            name="englishLevel"
            required
            value={values.englishLevel}
            onChange={(e) => setValue("englishLevel", e.target.value)}
            onBlur={() => handleBlur("englishLevel")}
            aria-invalid={Boolean(errors.englishLevel)}
            aria-describedby={`${formId}-englishLevel-error`}
            className={`${inputClass} ${errors.englishLevel ? errorInputClass : normalInputClass} md:max-w-md`}
          >
            <option value="">{t.form.selectLevel}</option>
            {levelValues.map((value) => (
              <option key={value} value={value}>
                {t.form.levels[value]}
              </option>
            ))}
          </select>
          <p
            id={`${formId}-englishLevel-error`}
            className={`${fieldErrorClass} ${errors.englishLevel ? "" : "hidden"}`}
            role="alert"
          >
            {errors.englishLevel}
          </p>
        </div>
      </div>

      <fieldset>
        <legend className={fieldLabelClass}>
          {t.form.availability}{" "}
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        </legend>
        <div
          className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
          role="radiogroup"
          aria-describedby={`${formId}-availability-error`}
        >
          {availabilityValues.map((option) => (
            <label
              key={option}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-ink/10 bg-white px-3 py-2 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"
            >
              <input
                type="radio"
                id={
                  option === availabilityValues[0]
                    ? `${formId}-availability`
                    : undefined
                }
                name="availability"
                value={option}
                required={option === availabilityValues[0]}
                checked={values.availability === option}
                onChange={() => {
                  setTouched((prev) => ({ ...prev, availability: true }));
                  setValue("availability", option);
                }}
                className="h-4 w-4 border-ink/30 text-tide focus:ring-tide"
              />
              <span className="text-sm sm:text-base">
                {t.form.availabilityOptions[option]}
              </span>
            </label>
          ))}
        </div>
        <p
          id={`${formId}-availability-error`}
          className={`${fieldErrorClass} ${errors.availability ? "" : "hidden"}`}
          role="alert"
        >
          {errors.availability}
        </p>
      </fieldset>

      <div>
        <label htmlFor={`${formId}-linkedin`} className="block text-sm font-semibold text-ink">
          {t.form.linkedin}
        </label>
        <input
          type="url"
          id={`${formId}-linkedin`}
          name="linkedin"
          placeholder="https://linkedin.com/in/your-profile"
          value={values.linkedin}
          onChange={(e) => setValue("linkedin", e.target.value)}
          onBlur={() => handleBlur("linkedin")}
          aria-invalid={Boolean(errors.linkedin)}
          aria-describedby={`${formId}-linkedin-error`}
          className={`${inputClass} ${errors.linkedin ? errorInputClass : normalInputClass}`}
        />
        <p
          id={`${formId}-linkedin-error`}
          className={`mt-1 text-sm text-danger ${errors.linkedin ? "" : "hidden"}`}
          role="alert"
        >
          {errors.linkedin}
        </p>
      </div>

      <div>
        <label htmlFor={`${formId}-comments`} className="block text-sm font-semibold text-ink">
          {t.form.comments}
        </label>
        <textarea
          id={`${formId}-comments`}
          name="comments"
          rows={4}
          maxLength={500}
          value={values.comments}
          onChange={(e) => setValue("comments", e.target.value)}
          onBlur={() => handleBlur("comments")}
          aria-invalid={Boolean(errors.comments)}
          aria-describedby={`${formId}-comments-counter ${formId}-comments-error`}
          className={`${inputClass} ${errors.comments ? errorInputClass : normalInputClass}`}
        />
        <div className="mt-1 flex flex-wrap items-start justify-between gap-2">
          <p
            id={`${formId}-comments-error`}
            className={`text-sm text-danger ${errors.comments ? "" : "hidden"}`}
            role="alert"
          >
            {errors.comments}
          </p>
          <p id={`${formId}-comments-counter`} className="ml-auto text-sm text-ink-muted">
            {t.form.charactersRemaining(commentsRemaining)}
          </p>
        </div>
      </div>

      <div>
        <label className="flex min-h-11 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            id={`${formId}-dataPolicy`}
            name="dataPolicy"
            required
            checked={values.dataPolicy}
            onChange={(e) => {
              setTouched((prev) => ({ ...prev, dataPolicy: true }));
              setValue("dataPolicy", e.target.checked);
            }}
            onBlur={() => handleBlur("dataPolicy")}
            aria-invalid={Boolean(errors.dataPolicy)}
            aria-describedby={`${formId}-dataPolicy-error`}
            className="mt-1 h-4 w-4 rounded border-ink/30 text-tide focus:ring-tide"
          />
          <span className="text-sm text-ink">
            {t.form.dataPolicy}{" "}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          </span>
        </label>
        <p
          id={`${formId}-dataPolicy-error`}
          className={`mt-1 text-sm text-danger ${errors.dataPolicy ? "" : "hidden"}`}
          role="alert"
        >
          {errors.dataPolicy}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-tide px-6 py-3 text-base font-semibold text-white transition hover:bg-tide-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide sm:w-auto"
        >
          {t.form.submit}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-ink/20 bg-white px-6 py-3 text-base font-semibold text-ink transition hover:bg-fog focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide sm:w-auto"
        >
          {t.form.clear}
        </button>
      </div>
    </form>
  );
}
