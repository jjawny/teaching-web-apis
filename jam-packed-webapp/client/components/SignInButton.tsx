"use client";

import { ClassValue } from "clsx";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { GOOGLE_LOGO_URL } from "~/client/components/constants";
import { cn } from "~/client/utils/cn";

export function SignInButton(props: { className?: ClassValue }) {
  const { className } = props;
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
        className="bg-stone-200"
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
