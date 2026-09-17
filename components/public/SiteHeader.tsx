"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageToggle } from "@/components/public/LanguageToggle";
import { useLanguage } from "@/components/public/LanguageProvider";

export function SiteHeader() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/#services", label: t.nav.services },
    { href: "/application", label: t.nav.talent },
    { href: "/#contact", label: t.nav.contact },
  ] as const;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onResize() {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-fog/95 backdrop-blur-md supports-[backdrop-filter]:bg-fog/85">
      <div className="page-shell flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 sm:py-4">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center rounded-sm opacity-95 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide"
          aria-label={t.nav.homeAria}
        >
          <Image
            src="/images/logo.png"
            alt="Nexova"
            width={360}
            height={86}
            priority
            className="h-8 w-auto sm:h-9 md:h-10"
          />
        </Link>

        <div className="ml-auto flex items-center gap-2 md:ml-0 md:order-last">
          <LanguageToggle />
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-ink/15 bg-white px-3 text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide md:hidden"
            aria-controls="site-nav"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? t.nav.close : t.nav.menu}
          </button>
        </div>

        <nav
          id="site-nav"
          className={`${open ? "block" : "hidden"} w-full basis-full md:block md:w-auto md:flex-1 md:basis-auto`}
          aria-label={t.nav.primary}
        >
          <ul className="mt-2 flex flex-col gap-1 border-t border-ink/10 pt-3 md:mt-0 md:flex-row md:items-center md:justify-end md:gap-6 lg:gap-8 md:border-0 md:pt-0 md:pr-4">
            {links.map((link) => {
              const isCurrent =
                link.href === "/application" && pathname === "/application";
              const isHome = link.href === "/" && pathname === "/";

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isCurrent || isHome ? "page" : undefined}
                    className={`block min-h-11 rounded-md px-2 py-2.5 text-base font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide hover:text-tide md:min-h-0 md:px-0 md:py-0 ${
                      isCurrent || isHome ? "text-ink" : "text-ink-muted"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
