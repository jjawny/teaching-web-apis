"use client";

import Image from "next/image";
import { userCtx } from "~/client/modules/user-context";

const AVATAR_DIMENSIONS_PX = 25;

export function Avatar() {
  const user = userCtx((ctx) => ctx.user);
  const userStatus = userCtx((ctx) => ctx.userStatus);

  // if (authStatus === "loading")
  // return <TODO: mini loader size={AVATAR_DIMENSIONS_PX} />;
  if (userStatus === "unauthenticated") return <></>;
  if (userStatus === "authenticated") {
    if (user?.image) {
      return (
        <Image
          priority
          // src={user?.image}
          src={"/images/my-pfp-temp-replace-w-google.jpg"}
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
