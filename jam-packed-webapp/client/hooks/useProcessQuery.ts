import { useMutation } from "@tanstack/react-query";

interface ProcessResponse {
  jobId: string;
  [key: string]: any;
}

async function processJob(variables: {
  query: string;
}): Promise<ProcessResponse> {
  const { query } = variables;
  const res = await fetch("http://localhost:8080/api/check-aura", {
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
