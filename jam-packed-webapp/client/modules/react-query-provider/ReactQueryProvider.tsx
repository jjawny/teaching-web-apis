"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { queryClient } from "./QueryClient";

export const ReactQueryProvider = (props: { children: ReactNode }) => {
  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
};
