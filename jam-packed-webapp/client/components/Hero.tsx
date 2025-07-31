import Image from "next/image";
import Versus from "~/client/components/Versus";
import { cn } from "~/client/utils/cn";

export default function Hero() {
  return (
    <div>
      <div className="flex w-full items-center justify-center gap-2">
        <Image
          className="opacity-20"
          src="/images/unknown.svg"
          alt="Unknown User"
          width={100}
          height={20}
          priority
        />
        <Versus
          className={cn(
            "animate-vibrate ![filter:drop-shadow(0_4px_0_black)] filter",
            "-ml-[15px]",
          )}
        />
        <Image
          aria-hidden
          src="/images/ryangosling.png"
          alt="Ryan Gosling"
          width={100}
          height={20}
          priority
        />
      </div>
      <h1 className="font-libertinus-mono text-center font-bold">
        <span className="text-2xl">Do You Have More</span>
        <span className="text-3xl">
          {" "}
          Aura
          <br />
          Than
        </span>
        <span className="text-4xl"> Ryan Gosling?</span>
      </h1>
    </div>
  );
}
