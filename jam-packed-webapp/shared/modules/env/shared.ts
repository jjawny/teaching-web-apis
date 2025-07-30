import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    NODE_ENV: z.enum(["development", "test", "production"]), // values confirmed in docs: https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#environment-variable-load-order
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },
});
