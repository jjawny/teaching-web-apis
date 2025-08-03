import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const GOOGLE_OAUTH_GUIDE =
  "See Google Cloud Console > APIs & Services > Credentials > Create an OAuth client";

export const env = createEnv({
  server: {
    AUTH_GOOGLE_CLIENT_ID: z.string().min(1, GOOGLE_OAUTH_GUIDE),
    AUTH_GOOGLE_CLIENT_SECRET: z.string().min(1, GOOGLE_OAUTH_GUIDE),
    NEXTAUTH_SECRET: z.string().min(1, "Generate using `npx auth secret`"),
    JAM_PACKED_WEBAPI_TOKEN_SECRET: z.string().min(1, "Generate using `openssl rand -base64 32`"),
  },
  runtimeEnv: {
    AUTH_GOOGLE_CLIENT_ID: process.env.AUTH_GOOGLE_CLIENT_ID,
    AUTH_GOOGLE_CLIENT_SECRET: process.env.AUTH_GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JAM_PACKED_WEBAPI_TOKEN_SECRET: process.env.JAM_PACKED_WEBAPI_TOKEN_SECRET,
  },
});
