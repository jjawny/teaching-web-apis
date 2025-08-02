"use client";

import ControlPanel from "~/client/components/ControlPanel";
import Credits from "~/client/components/Credits";
import Hero from "~/client/components/Hero";
import { SignOutButton } from "~/client/components/auth/SignOutButton";
import { userCtx } from "~/client/modules/user-context";
import { cn } from "~/client/utils/cn";

export default function Home() {
  const userStatus = userCtx((ctx) => ctx.userStatus);

  return (
    <div
      className={cn(
        "grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16",
        "p-8 pb-20 sm:p-20",
        "font-sans",
        "relative",
      )}
    >
      <main className="row-start-2 flex flex-col items-center gap-[21px] sm:items-start">
        <Hero />
        {userStatus === "authenticated" ? <ControlPanel /> : <p>Loading...</p>}
      </main>
      <SignOutButton className="absolute top-0 right-0 pt-4 pr-6" />
      <Credits className="absolute bottom-0 left-0 pb-4 pl-6" />
    </div>
  );
}
