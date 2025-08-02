import { Loader2Icon } from "lucide-react";

export function LoadingPage() {
  return (
    <div className="grid h-screen w-screen place-content-center">
      <h1 className="font-instrument-serif relative max-w-[500px] text-center text-6xl font-extrabold text-stone-400 select-none">
        <span className="opacity-10">The Most Bulletproof HTTP Request</span>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Loader2Icon className="h-20 w-20 animate-spin text-cyan-100" strokeWidth={3} />
        </div>
      </h1>
    </div>
  );
}
