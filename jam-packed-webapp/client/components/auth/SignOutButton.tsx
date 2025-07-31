"use client";

import { signOut } from "next-auth/react";
import { cn } from "../../utils/cn";
import { Avatar } from "./Avatar";

export function SignOutButton({ className }: { className?: string }) {
  return (
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
      <Avatar />
      Sign out
    </button>
  );
}
