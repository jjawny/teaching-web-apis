"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { GOOGLE_LOGO_URL } from "~/client/components/constants";
import { cn } from "~/client/utils/cn";

export function SignInButton({ className }: { className?: string }) {
  const GoogleLogo = () => (
    <Image
      priority
      src={GOOGLE_LOGO_URL}
      alt="Sign in with Google"
      width={25}
      height={25}
      className="rounded-full"
    />
  );

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
        Sign in with Google
      </button>
    </div>
  );
}
