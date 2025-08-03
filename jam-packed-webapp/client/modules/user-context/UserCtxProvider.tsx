"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { LoadingPage } from "~/client/components/pages/LoadingPage";
import { ANON_ROUTES, LOGIN_ROUTE } from "~/shared/constants";
import { userCtx } from "./UserCtx";

/**
 * INITIALIZES the UserCtx store.
 * Also a backup redirect gate in-case Edge middleware fails to redirect; known NextJS issues showing a flash of the pre-rendered HTML from SSR.
 * To avoid this FOUC, before redirecting, always show a loading page.
 *
 * Notes for using RQ to fetch data for the UserCtx:
 *  - If we call any React Queries here, we run the risk of a full page (children) re-render and a flash of the loading page.
 *  - How? If another component fetches or triggers a global invalidation for the same query (queryKey).
 *  - To avoid this, this provider must pass a unique queryKey (e.g. ["profile", "for-provider"]) to ensure no other component
 *      can trigger re-renders for this provider.
 *  - We also need to override any defaults like refetchOnWindowFocus to ensure the query only runs once.
 */
export function UserCtxProvider(props: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const setUser = userCtx((ctx) => ctx.setUser);
  const setUserStatus = userCtx((ctx) => ctx.setUserStatus);
  const { data: session, status: sessionStatus } = useSession();
  const isOnAnonRoute = ANON_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(
    function init() {
      console.debug("Initializing UserCtx");
      setUser(session?.user);
      setUserStatus(sessionStatus);
    },
    [session?.user, sessionStatus, setUser, setUserStatus],
  );

  useEffect(
    function Redirect() {
      if (!isOnAnonRoute && sessionStatus === "unauthenticated") {
        console.warn("User is unauthenticated, redirecting to login");
        router.replace(LOGIN_ROUTE);
      }
    },
    [sessionStatus, isOnAnonRoute, router],
  );

  const isLoading = sessionStatus === "loading";
  const isPendingRedirect = !isOnAnonRoute && sessionStatus === "unauthenticated";
  if (isLoading || isPendingRedirect) {
    return <LoadingPage />;
  }
  return <>{props.children}</>;
}
