"use client";

import { LanguageProvider, useLanguage } from "@/components/public/LanguageProvider";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";

function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow"
    >
      {t.skipToMain}
    </a>
  );
}

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <SkipLink />
      <SiteHeader />
      {children}
      <SiteFooter />
    </LanguageProvider>
  );
}
