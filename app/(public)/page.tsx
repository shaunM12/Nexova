"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/public/LanguageProvider";
import { organizationSchema } from "@/lib/public/organizationSchema";

/** Tiny JPEG preview for faster perceived LCP while the hero loads. */
const HERO_BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBARXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAFKADAAQAAAABAAAACwAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IB2ElDQ19QUk9GSUxFAAEBAAAByAAAAAAEMAAAbW50clJHQiBYWVogB+AAAQABAAAAAAAAYWNzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJZGVzYwAAAPAAAAAkclhZWgAAARQAAAAUZ1hZWgAAASgAAAAUYlhZWgAAATwAAAAUd3RwdAAAAVAAAAAUclRSQwAAAWQAAAAoZ1RSQwAAAWQAAAAoYlRSQwAAAWQAAAAoY3BydAAAAYwAAAA8bWx1YwAAAAAAAAABAAAADGVuVVMAAAAIAAAAHABzAFIARwBCWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPWFlaIAAAAAAAAPbWAAEAAAAA0y1wYXJhAAAAAAAEAAAAAmZmAADypwAADVkAABPQAAAKWwAAAAAAAAAAbWx1YwAAAAAAAAABAAAADGVuVVMAAAAgAAAAHABHAG8AbwBnAGwAZQAgAEkAbgBjAC4AIAAyADAAMQA2/8AAEQgACwAUAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwUDAwMFBgUFBQUGCAYGBgYGCAoICAgICAgKCgoKCgoKCgwMDAwMDA4ODg4ODw8PDw8PDw8PD//bAEMBAgICBAQEBwQEBxALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/dAAQAAv/aAAwDAQACEQMRAD8A/Ua31HS77wTDrt+0MSW0I5iJcFIhtPHU8g9P5V+SMHxP8RXPj3xD4j0DTPO8OxeIzdyC6jeJ2hjCm3IBX+N1YjByOp9K++2YaV4Yk07TkS3tliwI0RQoBHbjivz9/Z/8deLfEnxd8WeCdf1KTUNDt7m+SK1mCuiLBOixhSRuG0E9D9a8XMlOC5kldK+//A1/A9vLacJvlk3Zu39a/wCZ0Wl+BPH2s6Za+IrXRtLH9sq166zXo3q87s2OUPGMEdOD0q9/wrX4kf8AQG0b/wADV/8Ajder3Fra2MrW9pCkUYJ+VVGOuKh3ew/IV8b9dp/yf19x9l/Z8+kj/9k=";

export default function HomePage() {
  const { t } = useLanguage();
  const [whyA, whyB, whyC, whyD] = t.home.whyItems;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      <main id="main">
        <section
          className="relative isolate min-h-[100svh] overflow-hidden md:min-h-[85vh]"
          aria-labelledby="hero-heading"
        >
          <div className="absolute inset-0 -z-10">
            <Image
              src="/images/hero.jpg"
              alt={t.home.heroAlt}
              fill
              priority
              quality={70}
              placeholder="blur"
              blurDataURL={HERO_BLUR_DATA_URL}
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"
            />
            {/* Soft bottom scrim only — keeps the photo visible */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/20 to-transparent"
              aria-hidden="true"
            />
          </div>

          <div className="page-shell flex min-h-[100svh] flex-col justify-end pb-12 pt-24 sm:pb-16 sm:pt-28 md:min-h-[85vh] md:pb-20 lg:pb-24">
            <p className="animate-fade-up break-words font-display text-4xl font-extrabold tracking-tight text-[#E6ECF2] [text-shadow:0_1px_2px_rgba(10,22,40,0.45)] sm:text-5xl md:text-6xl lg:text-7xl">
              Nexova
            </p>
            <h1
              id="hero-heading"
              className="mt-3 max-w-3xl animate-fade-up-delay text-balance font-display text-xl font-semibold leading-snug tracking-tight text-[#DCE4EC] [text-shadow:0_1px_2px_rgba(10,22,40,0.45)] sm:mt-4 sm:text-3xl md:text-4xl md:leading-tight"
            >
              {t.home.headline}
            </h1>
            <p className="mt-4 max-w-2xl animate-fade-up-delay-2 text-pretty text-base leading-relaxed text-[#C9D3DE] [text-shadow:0_1px_2px_rgba(10,22,40,0.4)] sm:mt-5 sm:text-lg">
              {t.home.supporting}
            </p>
            <div className="mt-7 w-full animate-fade-up-delay-2 sm:mt-8 sm:w-auto">
              <Link
                href="/application"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-tide px-6 py-3 text-base font-semibold text-white transition hover:bg-tide-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
              >
                {t.home.cta}
              </Link>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="section-y scroll-mt-20 border-b border-ink/10 bg-white sm:scroll-mt-24"
          aria-labelledby="services-heading"
        >
          <div className="page-shell">
            <h2
              id="services-heading"
              className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl"
            >
              {t.home.servicesHeading}
            </h2>
            <p className="mt-3 max-w-2xl text-base text-ink-muted sm:text-lg">
              {t.home.servicesIntro}
            </p>

            <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-10 sm:gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              <article className="border-t border-ink/10 pt-6 md:border-t-0 md:pt-0">
                <h3 className="font-display text-lg font-semibold text-ink sm:text-xl">
                  {t.home.headhuntingTitle}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-muted sm:mt-4 sm:text-base">
                  {t.home.headhuntingItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="border-t border-ink/10 pt-6 md:border-t-0 md:pt-0">
                <h3 className="font-display text-lg font-semibold text-ink sm:text-xl">
                  {t.home.supportTitle}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-muted sm:mt-4 sm:text-base">
                  {t.home.supportItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="border-t border-ink/10 pt-6 md:border-t-0 md:pt-0 md:col-span-2 lg:col-span-1">
                <h3 className="font-display text-lg font-semibold text-ink sm:text-xl">
                  {t.home.trainingTitle}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-muted sm:mt-4 sm:text-base">
                  {t.home.trainingItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section
          id="why-nexova"
          className="section-y scroll-mt-20 border-b border-ink/10 bg-fog sm:scroll-mt-24"
          aria-labelledby="why-heading"
        >
          <div className="page-shell">
            <h2
              id="why-heading"
              className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl"
            >
              {t.home.whyHeading}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 sm:gap-8 md:grid-cols-2">
              <ul className="space-y-4 text-base text-ink sm:text-lg">
                <li className="border-l-2 border-tide pl-4">{whyA}</li>
                <li className="border-l-2 border-tide pl-4">{whyB}</li>
              </ul>
              <ul className="space-y-4 text-base text-ink sm:text-lg">
                <li className="border-l-2 border-tide pl-4">{whyC}</li>
                <li className="border-l-2 border-tide pl-4">{whyD}</li>
              </ul>
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="section-y scroll-mt-20 bg-white sm:scroll-mt-24"
          aria-labelledby="contact-heading"
        >
          <div className="page-shell">
            <h2
              id="contact-heading"
              className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl"
            >
              {t.home.contactHeading}
            </h2>
            <address className="mt-6 grid max-w-xl grid-cols-1 gap-4 not-italic text-ink-muted sm:gap-3 md:grid-cols-2">
              <p className="md:col-span-2">
                {t.home.emailLabel}:{" "}
                <a
                  href="mailto:contact@nexova.com"
                  className="break-all font-medium text-tide underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide"
                >
                  contact@nexova.com
                </a>
              </p>
              <p>
                {t.home.valenciaLabel}:{" "}
                <a
                  href="tel:+34960123456"
                  className="inline-flex min-h-11 items-center hover:text-tide sm:min-h-0"
                >
                  +34 960 123 456
                </a>
              </p>
              <p>
                {t.home.miamiLabel}:{" "}
                <a
                  href="tel:+13055550191"
                  className="inline-flex min-h-11 items-center hover:text-tide sm:min-h-0"
                >
                  +1 305 555 0191
                </a>
              </p>
            </address>
          </div>
        </section>
      </main>
    </>
  );
}
