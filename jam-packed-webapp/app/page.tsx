"use client";

import Hero from "~/client/components/Hero";
import { SignInButton } from "~/client/components/SignInButton";
import { userCtx } from "~/client/modules/user-context/UserCtx";
import JobStatus from "~/lib/components/JobStatus";

export default function Home() {
  const { authStatus } = userCtx();

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-[21px] sm:items-start">
        <Hero />
        {authStatus === "authenticated" ? (
          <JobStatus />
        ) : authStatus === "loading" ? (
          <p>Loading...</p>
        ) : (
          <SignInButton />
        )}
      </main>
    </div>
  );
}
