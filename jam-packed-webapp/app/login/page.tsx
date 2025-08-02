import Credits from "~/client/components/Credits";
import Hero from "~/client/components/Hero";
import { SignInButton } from "~/client/components/auth/SignInButton";
import { cn } from "~/client/utils/cn";

export default function Login() {
  return (
    <div
      className={cn(
        "grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16",
        "p-8 pb-20 sm:p-20",
        "font-sans",
        "relative", // TODO: not needed after we move credits to layout.tsx
      )}
    >
      <main className="row-start-2 flex flex-col items-center gap-[21px] sm:items-start">
        <Hero />
        <SignInButton />
      </main>
      {/* TODO: move to layout */}
      <Credits className="absolute bottom-0 left-0 pb-4 pl-6" />
    </div>
  );
}
