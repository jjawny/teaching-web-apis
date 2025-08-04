import { useId } from "react";
import { cn } from "~/client/utils/cn";
import { Input } from "./input";

export default function ShrinkingInput({
  className,
  label,
  ...props
}: React.ComponentProps<"input"> & { label?: string }) {
  const id = useId();

  return (
    <div className="group relative">
      <label
        htmlFor={id}
        className={cn(
          "group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-has-[input:not(:placeholder-shown)]:pointer-events-none group-has-[input:not(:placeholder-shown)]:top-0 group-has-[input:not(:placeholder-shown)]:cursor-default group-has-[input:not(:placeholder-shown)]:text-xs group-has-[input:not(:placeholder-shown)]:font-medium",
          "origin-start absolute top-1/2 left-0 block -translate-y-1/2 cursor-text px-1 transition-all",
          "text-muted-foreground/70 text-sm",
        )}
      >
        <span className="bg-background inline-flex px-2">{label}</span>
      </label>
      <Input id={id} placeholder=" " className={className} {...props} />
    </div>
  );
}
