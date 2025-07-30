import NextAuth from "next-auth";
import { authConfig } from "~/shared/auth";

// #AUTH
// Route for NextAuth authentication flow.
// Used as the callback URL in Google Cloud Console.
export const { auth, handlers: { GET, POST } } = NextAuth({
  ...authConfig,
  // Upon login, customize the JWT and session
  callbacks: {
    // async jwt({ token, account }) { return token; },
    async session({ session, token, user }) {
      if (user?.id) {
        session.user.id = user.id;
      } else if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
