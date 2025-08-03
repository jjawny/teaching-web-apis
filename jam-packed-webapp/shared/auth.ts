import { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { serverEnv } from "~/shared/modules/env";

// #AUTH
// This object represents our auth configuration; used in NextJS Route Handlers and Middleware
export const authConfig: NextAuthConfig = {
  // debug: false,
  session: { strategy: "jwt" },
  secret: serverEnv.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: serverEnv.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.AUTH_GOOGLE_CLIENT_SECRET,
      authorization: {
        // #AUTH
        // Solution to force a new refresh token w/o a database (stateless app)
        // Requires user to consent every "Sign in with Google"
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
} satisfies NextAuthConfig;
