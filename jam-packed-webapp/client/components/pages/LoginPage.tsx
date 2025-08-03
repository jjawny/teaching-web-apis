import Hero from "~/client/components/Hero";
import { SignInButton } from "~/client/components/auth/SignInButton";
import { cn } from "~/client/utils/cn";

export function LoginPage() {
  return (
    <div
      className={cn(
        "grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16",
        "p-8 pb-20 sm:p-20",
        "font-sans",
      )}
    >
      <main className="row-start-2 flex flex-col items-center gap-[21px] sm:items-start">
        <Hero />
        <SignInButton />
      </main>
    </div>
  );
}
