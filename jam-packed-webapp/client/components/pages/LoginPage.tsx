import Hero from "~/client/components/Hero";
import { SignInButton } from "~/client/components/auth/SignInButton";
import { cn } from "~/client/utils/cn";

export function LoginPage() {
  return (
    <div className={cn("grid min-h-screen place-content-center", "font-sans")}>
      <main className="flex flex-col items-center gap-[21px]">
        <Hero />
        <SignInButton />
      </main>
    </div>
  );
}
