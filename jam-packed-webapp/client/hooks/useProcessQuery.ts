import { useMutation } from "@tanstack/react-query";
import { clientEnv } from "~/shared/modules/env";

interface ProcessResponse {
  jobId: string;
  [key: string]: any;
}

async function processJob(variables: { query: string }): Promise<ProcessResponse> {
  const { query } = variables;
  const res = await fetch(`${clientEnv.NEXT_PUBLIC_BACKEND_URL}/api/check-aura`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  if (!res.ok || !data.jobId) {
    throw new Error(data.error || "Unknown error");
  }
  return data;
}

export function useProcessQuery() {
  return useMutation({
    mutationFn: processJob,
  });
}
