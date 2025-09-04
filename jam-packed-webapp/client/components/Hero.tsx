import { cn } from "~/client/utils/cn";
import Versus from "./Versus";

export default function Hero() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <h1 className="font-instrument-serif text-center text-3xl">It's You</h1>
        <Versus className={cn("animate-vibrate ![filter:drop-shadow(0_4px_0_black)] filter")} />
        <h1 className="font-instrument-serif text-center text-3xl">The World</h1>
      </div>
      <h2 className="font-instrument-serif text-center text-xl">
        Type your username to check your aura
      </h2>
    </div>
  );
}
