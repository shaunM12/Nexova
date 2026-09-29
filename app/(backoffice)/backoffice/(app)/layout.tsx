import { BackofficeHeader } from "@/components/backoffice/shell/BackofficeHeader";
import { BackofficeProviders } from "@/components/backoffice/shell/BackofficeProviders";
import { DemoBootstrap } from "@/components/backoffice/shell/DemoBootstrap";

export default function BackofficeAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BackofficeProviders>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow"
      >
        Skip to main content
      </a>
      <BackofficeHeader />
      <main id="main" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <DemoBootstrap>{children}</DemoBootstrap>
      </main>
    </BackofficeProviders>
  );
}
