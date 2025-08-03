import { NextRequest } from "next/server";
import { auth } from "~/app/api/auth/[...nextauth]/route";
import { JAM_PACKED_WEB_API_JWT_EXPIRY_MS } from "~/shared/constants";
import { serverEnv } from "~/shared/modules/env";
var jwt = require("jsonwebtoken");

// #AUTH
// ISSUE:
// We need a secure way to connect the auth flow between this webapp and the main webapi
// What about NextAuth's JWTs?
//  NextAuth has 3 built-in tokens:
//    - NextAuth JWT (session) token
//      Used for session management within webapp
//      Not recommended to use outside of webapp, difficult/unreliable to extract
//    - Google OAuth (access and ID) tokens
//      Used for authenticating w Google + accessing Google APIs
//      Not recommended to use outside of Google services, short lifespan/ttl, not meant for custom APIs
// SOLUTION:
//  We issue a custom JWT token for the webapi if the user is authed in the webapp, transferring the necessary claims
//  This token is short-lived so if the user logs out or becomes compromised, it will expire quickly
//  This essentially turns our webapp into a BFF (Backend for Frontend) which handles our OAuth flow
//    before giving users access to the webapi
//  TODO: Enhancement is to store the JWT so we can revoke upon sign out etc

const JAM_PACKED_WEB_API_JWT_EXPIRY_S = Math.floor(JAM_PACKED_WEB_API_JWT_EXPIRY_MS / 1000);

export async function GET(req: NextRequest) {
  // Check RBAC here etc
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Issue a short-lived JWT for Web API access
  const claims = {
    userId: session.user?.id,
    username: session.user?.name,
    avatar: session.user?.image,
  };

  const webapiJwt = jwt.sign(claims, serverEnv.JAM_PACKED_WEBAPI_TOKEN_SECRET, {
    expiresIn: JAM_PACKED_WEB_API_JWT_EXPIRY_S,
  });

  return Response.json({ jwt: webapiJwt });
}
