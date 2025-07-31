"use client";

import { useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { LoadingPage } from "~/client/components/LoadingPage";
import { useLoadingProgress } from "./helpers";
import { userCtx } from "./UserCtx";

/**
 * - Blocks the UI (children) from rendering until the user has loaded
 * - Why? this avoids any FOUC by waiting for the user to load into the UserCtx
 * - This also abstracts the NextAuth session dependency (rest of the app uses
 *   UserCtx and we can always switch auth packages w minimal code changes)
 */
export function UserCtxProvider(props: { children: ReactNode }) {
  const { setUser, setAuthStatus } = userCtx();
  const { data: session, status: userStatus } = useSession();

  const loadingBools = [userStatus === "loading"];
  const loadingPercentage = useLoadingProgress(loadingBools);

  useEffect(
    function sync() {
      console.debug("Syncing UserCtx");
      setUser(session?.user);
      setAuthStatus(userStatus);
    },
    [session?.user, userStatus, setUser, setAuthStatus],
  );

  if (loadingPercentage !== 100) {
    return <LoadingPage progress={loadingPercentage} />;
  }

  return <>{props.children}</>;
}
