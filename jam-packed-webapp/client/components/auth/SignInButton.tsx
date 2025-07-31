"use client";

import { signIn } from "next-auth/react";
import { cn } from "~/client/utils/cn";
import GoogleLogo from "./GoogleLogo";

export function SignInButton({ className }: { className?: string }) {
  return (
    <div className={cn("max-w-fit", className)}>
      <button
        // size="small"
        // variant="outlined"
        // startIcon={<GoogleLogo />}

        className={cn(className, "bg-stone-300")}
        onClick={() => signIn("google")}
        // sx={{
        //   textTransform: "none",
        //   textWrap: "nowrap",
        //   minWidth: "fit-content",
        //   borderRadius: 10,
        // }}
      >
        <GoogleLogo />
        Sign in with Google
      </button>
    </div>
  );
}
