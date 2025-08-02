import { useQuery } from "@tanstack/react-query";
import { clientEnv } from "~/shared/modules/env";

export function useHealthCheckQuery() {
  return useQuery<boolean>({
    queryKey: ["health-check"],
    queryFn: async () => {
      const res = await fetch(`${clientEnv.NEXT_PUBLIC_BACKEND_URL}/api/health`);
      return res.ok;
    },
    staleTime: 0, // always stale; no caching
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
