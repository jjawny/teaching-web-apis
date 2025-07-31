import { QueryClient } from "@tanstack/react-query";

const GARBAGE_COLLECT_TIME_MS = 1000 * 60 * 60 * 24; // 24 hours

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { gcTime: GARBAGE_COLLECT_TIME_MS },
  },
});
