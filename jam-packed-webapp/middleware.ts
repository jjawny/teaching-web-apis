import NextAuth from "next-auth";
import { MiddlewareConfig, NextResponse } from "next/server";
import { authConfig } from "./shared/auth";
import { HOME_ROUTE, LOGIN_ROUTE } from "./shared/constants";

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(request) {
  const isOnLoginPage = request.nextUrl.pathname.startsWith(LOGIN_ROUTE);
  const isAuthenticated = request.auth;

  if (!isAuthenticated && !isOnLoginPage) {
    return NextResponse.redirect(new URL(LOGIN_ROUTE, request.nextUrl.origin));
  }

  if (isAuthenticated && isOnLoginPage) {
    return NextResponse.redirect(new URL(HOME_ROUTE, request.nextUrl.origin));
  }

  const response = NextResponse.next();
  return response;
});

export const config: MiddlewareConfig = {
  matcher: ["/((?!api/auth|_next/static|_next/image|images|fonts|favicon.ico|$).*)"],
};
