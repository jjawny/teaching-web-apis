import NextAuth from "next-auth";
import { MiddlewareConfig, NextResponse } from "next/server";
import { authConfig } from "./shared/auth";

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(request) {
  const isAuthenticated = request.auth;

  if (!isAuthenticated) {
    return new NextResponse(JSON.stringify({ error: "User is not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const response = NextResponse.next();
  return response;
});

export const config: MiddlewareConfig = {
  matcher: ["/((?!api/auth|_next/static|_next/image|images|fonts|favicon.ico|$).*)"],
};
