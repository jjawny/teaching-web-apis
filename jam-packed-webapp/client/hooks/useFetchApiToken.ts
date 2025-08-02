import { useQuery } from "@tanstack/react-query";
import { CUSTOM_JWT_EXPIRY_MS } from "~/shared/constants";

const BUFFER_MS = 1 * 60 * 1000; // 1 minute

// Fetches the web API token from the backend
async function fetchWebApiToken(): Promise<string | null> {
  const res = await fetch("/api/get-webapi-token", {
    credentials: "include",
  });
  const data = await res.json();
  return data.jwt ?? null;
}

/**
 * React Query hook to fetch the web API token.
 *
 * Usage:
 *   const { data: token, isLoading, error } = useFetchApiToken();
 *
 *
 * All queries that require the token should call this hook to ensure
 * the token is refreshed (rename to useGetAndRefreshCustomApiToken?)
 * worst-case, we fetch the token right before the staletime ticks over
 * this means the token we are using is invalid for the buffer_ms (1 minute)
 * this is the worst-case because its the scenario where we use a token with the lowest remaining ttl
 * the bad path (401) only happens if during this window if we dont pass the middleware auth before 1 minute, the token
 * will expire and bounce back (401), this is highly unlikely as latency is ~a few ms (TODO: measure)
 * and TTRTR (time to reach the route) is TODO: measure
 *
 * in this case, the error/401 unauthorized will only happen if we dont pass the auth middleware during this 1 minute window
 *
 * for simplicty, show the error and let the user retry manually (highly unlikely and simple code)
 */
export function useGetAndRefreshCustomJwt(isAuthenticated = true) {
  return useQuery({
    enabled: isAuthenticated,
    queryKey: ["webapi-token"],
    queryFn: fetchWebApiToken,
    retry: 3,
    staleTime: CUSTOM_JWT_EXPIRY_MS - BUFFER_MS, // always refetch (cache miss) when about to expire
  });
}
