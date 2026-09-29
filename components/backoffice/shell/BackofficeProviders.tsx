"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { createQueryClient } from "@/lib/backoffice/pipeline/queryClient";
import { UnsavedChangesProvider } from "./UnsavedChanges";

export function BackofficeProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <UnsavedChangesProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </UnsavedChangesProvider>
    </QueryClientProvider>
  );
}
