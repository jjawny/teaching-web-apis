"use client";

import { signIn } from "next-auth/react";
import { Button } from "~/client/components/ui/button";
import { cn } from "~/client/utils/cn";
import GoogleLogo from "./GoogleLogo";

export function SignInButton({ className }: { className?: string }) {
  return (
    <Button className={cn(className)} onClick={() => signIn("google")}>
      <GoogleLogo />
      Sign in with Google
    </Button>
  );
}
