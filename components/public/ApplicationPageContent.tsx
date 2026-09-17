"use client";

import { TalentForm } from "@/components/public/TalentForm";
import { useLanguage } from "@/components/public/LanguageProvider";

export function ApplicationPageContent() {
  const { t } = useLanguage();

  return (
    <main
      id="main"
      className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 md:max-w-4xl md:py-16 lg:px-8"
    >
      <h1 className="text-balance font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
        {t.application.title}
      </h1>
      <p className="mt-3 max-w-2xl text-pretty text-base text-ink-muted sm:text-lg">
        {t.application.intro}
      </p>

      <p
        className="mt-6 rounded-md border border-tide/30 bg-tide/5 px-4 py-3 text-sm leading-relaxed text-ink sm:text-base"
        role="note"
      >
        {t.application.companyNote}{" "}
        <a
          href="mailto:contact@nexova.com"
          className="break-all font-semibold text-tide underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide"
        >
          contact@nexova.com
        </a>
      </p>

      <TalentForm />
    </main>
  );
}
