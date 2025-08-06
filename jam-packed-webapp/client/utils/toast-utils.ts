import { toast } from "sonner";

/**
 * Useful for surfacing RQ errors in effects.
 */
export function toastError(error?: Error | null | string) {
  if (typeof error === "string") {
    toast.error(error);
  } else if (error?.message) {
    toast.error(error.message);
  }
}
