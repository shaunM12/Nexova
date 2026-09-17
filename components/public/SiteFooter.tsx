"use client";

import { useLanguage } from "@/components/public/LanguageProvider";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-ink/10 bg-ink text-white">
      <div className="page-shell flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-10">
        <p className="text-sm text-white/80">{t.footer.rights}</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <li>
            <a
              href="https://linkedin.com/company/nexova"
              className="inline-flex min-h-11 items-center text-white/90 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              rel="noopener noreferrer"
              target="_blank"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href="https://instagram.com/nexova"
              className="inline-flex min-h-11 items-center text-white/90 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              rel="noopener noreferrer"
              target="_blank"
            >
              Instagram
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
