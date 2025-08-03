import { useQuery } from "@tanstack/react-query";
import { clientEnv } from "~/shared/modules/env";

export function useExtApiHealthCheckQuery() {
  return useQuery<boolean>({
    queryKey: ["health-check"],
    queryFn: queryFn,
    staleTime: 0, // always stale; no caching
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

async function queryFn(): Promise<boolean> {
  try {
    const res = await fetch(clientEnv.NEXT_PUBLIC_BACKEND_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    return res.ok;
  } catch (error) {
    console.warn("Error checking health API token:", error);
    return false;
  }
}
