import { toast } from "sonner";

const SUCCESS_MS = 4_000;
const ERROR_MS = 10_000;

/** The only way backoffice code shows toasts. Messages use UI labels, never raw API values. */
export const notify = {
  success(message: string): void {
    toast.success(message, { duration: SUCCESS_MS });
  },
  error(message: string, options: { onRetry?: () => void } = {}): void {
    toast.error(message, {
      duration: ERROR_MS,
      action: options.onRetry ? { label: "Retry", onClick: options.onRetry } : undefined,
    });
  },
};
