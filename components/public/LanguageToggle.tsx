"use client";

import { useLanguage } from "@/components/public/LanguageProvider";

export function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      className="inline-flex items-center rounded-md border border-ink/15 bg-white p-0.5"
      role="group"
      aria-label={t.language.label}
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        aria-label={t.language.switchToEn}
        className={`min-h-9 min-w-10 rounded px-2.5 text-xs font-semibold tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide ${
          locale === "en"
            ? "bg-tide text-white"
            : "text-ink-muted hover:text-ink"
        }`}
      >
        {t.language.en}
      </button>
      <button
        type="button"
        onClick={() => setLocale("es")}
        aria-pressed={locale === "es"}
        aria-label={t.language.switchToEs}
        className={`min-h-9 min-w-10 rounded px-2.5 text-xs font-semibold tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide ${
          locale === "es"
            ? "bg-tide text-white"
            : "text-ink-muted hover:text-ink"
        }`}
      >
        {t.language.es}
      </button>
    </div>
  );
}
