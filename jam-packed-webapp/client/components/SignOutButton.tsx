"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { GOOGLE_LOGO_URL } from "~/client/components/constants";
import { cn } from "../utils/cn";
import { AuthAvatar } from "./avatar/AuthAvatar";

export function SignOutButton({ className }: { className?: string }) {
  const GoogleLogo = () => (
    <Image
      priority
      src={GOOGLE_LOGO_URL}
      alt="Sign out of Google"
      width={25}
      height={25}
      className="rounded-full"
    />
  );

  return (
    <>
      <AuthAvatar />
      <button
        // size="small"
        // variant="outlined"
        // startIcon={<GoogleLogo />}
        className={cn(className, "bg-stone-300")}
        onClick={() => signOut()}
        // sx={{
        //   textTransform: "none",
        //   textWrap: "nowrap",
        //   minWidth: "fit-content",
        //   borderRadius: 10,
        // }}
      >
        Sign out
      </button>
    </>
  );
}
