import { QueryClient } from "@tanstack/react-query";
import { isRetryableError } from "./api";

const MAX_QUERY_RETRIES = 2;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => failureCount < MAX_QUERY_RETRIES && isRetryableError(error),
      },
      mutations: { retry: false },
    },
  });
}
