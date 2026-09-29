import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { useSyncExternalStore, type ReactElement } from "react";
import { Toaster } from "sonner";
import { vi } from "vitest";
import { UnsavedChangesProvider } from "./shell/UnsavedChanges";

// ---- next/navigation stand-in with a real, subscribable URL ----

let currentPath = "/backoffice/pipeline";
let currentParams = new URLSearchParams();
const listeners = new Set<() => void>();

function setUrl(href: string) {
  const url = new URL(href, "http://localhost");
  currentPath = url.pathname;
  currentParams = new URLSearchParams(url.search);
  listeners.forEach((listener) => listener());
}

export const router = {
  push: vi.fn((href: string) => setUrl(href)),
  replace: vi.fn((href: string) => setUrl(href)),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

export function setTestUrl(href: string) {
  router.push.mockClear();
  router.replace.mockClear();
  setUrl(href);
}

export function currentSearch(): string {
  return currentParams.toString();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const navigationMock = {
  useRouter: () => router,
  usePathname: () => useSyncExternalStore(subscribe, () => currentPath, () => currentPath),
  useSearchParams: () => useSyncExternalStore(subscribe, () => currentParams, () => currentParams),
  redirect: vi.fn(),
  notFound: vi.fn(),
};

// ---- Providers ----

export function renderWithProviders(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 30_000 },
      mutations: { retry: false },
    },
  });
  const result = render(
    <QueryClientProvider client={client}>
      <UnsavedChangesProvider>
        {ui}
        <Toaster />
      </UnsavedChangesProvider>
    </QueryClientProvider>,
  );
  return { client, ...result };
}
