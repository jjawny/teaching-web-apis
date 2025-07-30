import "next-auth";
import { NextRequest } from "next/server";

/**
 * Add additional properties to be recognised by the entire code-base
 */
declare module "next-auth" {
  // GOTCHA: Unable to import type 'NextAuthRequest' in middleware.ts
  //  Solution? Expose type from `node_modules/next-auth/src/lib/index.ts`
  //  See https://github.com/nextauthjs/next-auth/discussions/11365
  interface NextAuthRequest extends NextRequest {
    auth: Session | null;
  }
}
