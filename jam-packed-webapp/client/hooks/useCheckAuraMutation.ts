import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientEnv } from "~/shared/modules/env";

interface ProcessJobVariables {
  roomId: string;
  username: string;
  token: string;
}

interface ProcessResponse {
  [key: string]: any;
}

/**
 * React Query mutation hook to process a job by calling the check-aura API.
 *
 * Automatically handles:
 * - Token fetching and validation
 * - API request with proper headers and authentication
 * - Error handling and user-friendly error messages
 * - Timeline tick tracking
 */
export function useCheckAuraMutation() {
  return useMutation<ProcessResponse, Error, ProcessJobVariables>({
    mutationFn: (variables) => processJobMutationFn(variables),
    retry: 3,
  });
}

// Unfortunately, RQ expects a thrown error for error prop, so throw
// and expose a user-friendly message for the UI, but log (warn) the full response.
async function processJobMutationFn(variables: ProcessJobVariables): Promise<ProcessResponse> {
  const { roomId, username, token } = variables;

  if (!token || !roomId) {
    const errorMessage = "No token or room ID available, cannot start job";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  const response = await fetch(
    `${clientEnv.NEXT_PUBLIC_JAM_PACKED_WEBAPI_URL}/api/check-aura?isSkipCache=true`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${variables.token}`,
      },
      body: JSON.stringify({ roomId, username }),
    },
  );

  if (!response.ok) {
    const data = await response.json();
    const errorMessage = data.error || "Unknown error";
    throw new Error(errorMessage);
  }

  return await response.json();
}
