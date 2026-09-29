import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Backoffice",
    template: "%s — Nexova Backoffice",
  },
  robots: { index: false, follow: false },
};

export default function BackofficeRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-dvh bg-fog">{children}</div>;
}
