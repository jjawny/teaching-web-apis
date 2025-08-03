import { toast } from "sonner";

/**
 * Useful for surfacing RQ errors in effects.
 */
export function showError(error?: Error | null) {
  if (error?.message) {
    toast.error(error.message);
  }
}
