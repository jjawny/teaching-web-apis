"use client";

import Image from "next/image";
import { userCtx } from "~/client/modules/user-context/UserCtx";

const AVATAR_DIMENSIONS_PX = 25;

export function Avatar() {
  const { user, authStatus } = userCtx();

  // if (authStatus === "loading")
  // return <TODO: mini loader size={AVATAR_DIMENSIONS_PX} />;
  if (authStatus === "unauthenticated") return <></>;
  if (authStatus === "authenticated") {
    if (user?.image) {
      return (
        <Image
          priority
          // src={user?.image}
          src={"/my-pfp-temp-replace-w-google.jpg"}
          alt="Avatar"
          width={AVATAR_DIMENSIONS_PX}
          height={AVATAR_DIMENSIONS_PX}
          className="rounded-full"
        />
      );
    }
    // return <Avatar TODO: RANDOM INITIALS />;
    return null;
  }
}
