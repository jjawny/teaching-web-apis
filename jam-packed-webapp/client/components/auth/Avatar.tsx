"use client";

import Image from "next/image";
import { userCtx } from "~/client/modules/user-context";
import {
  getContrastTextColor,
  getFontSize,
  getInitials,
  stringToHexColor,
} from "~/client/utils/avatar-utils";

const AVATAR_DIMENSIONS_PX = 30;

export function Avatar() {
  const user = userCtx((ctx) => ctx.user);
  const userStatus = userCtx((ctx) => ctx.userStatus);

  if (userStatus !== "authenticated") {
    return null;
  }

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

  return <InitialsAvatar name={user?.name ?? undefined} />;
}

function InitialsAvatar({ name }: { name?: string }) {
  const initials = getInitials(name);
  const fontSize = getFontSize(initials, AVATAR_DIMENSIONS_PX);
  const hexColor = stringToHexColor(initials);
  const textColor = getContrastTextColor(hexColor);

  return (
    <div
      className="flex items-center justify-center rounded-full font-sans select-none"
      style={{
        width: AVATAR_DIMENSIONS_PX,
        height: AVATAR_DIMENSIONS_PX,
        backgroundColor: hexColor,
        color: textColor,
        fontSize,
      }}
    >
      <span>{initials}</span>
    </div>
  );
}
