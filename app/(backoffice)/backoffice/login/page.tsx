import type { Metadata } from "next";
import { LoginForm } from "@/components/backoffice/shell/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center px-4 py-12">
      <LoginForm next={typeof next === "string" ? next : ""} />
    </main>
  );
}
