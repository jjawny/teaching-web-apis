import NextAuth from "next-auth";
import { authConfig } from "~/shared/auth";

export const {
  auth,
  handlers: { GET, POST },
} = NextAuth({
  ...authConfig,
  callbacks: {
    // async jwt({ token, account }) { return token; },
    async session({ session, token, user }) {
      // Make the user id accessible
      if (user?.id) {
        session.user.id = user.id;
      } else if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
