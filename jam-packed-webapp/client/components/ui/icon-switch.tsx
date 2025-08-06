"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { ReactNode, useId } from "react";

import ThickTooltip from "~/client/components/ThickTooltip";
import { cn } from "~/client/utils/cn";
import { Switch } from "./switch";

export default function IconSwitch({
  className,
  isChecked,
  onCheckedChange,
  leftIcon = <MoonIcon size={16} aria-hidden="true" />,
  rightIcon = <SunIcon size={16} aria-hidden="true" />,
  tooltipContent,
  tooltipDelay,
}: {
  className?: string;
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  tooltipContent: ReactNode;
  tooltipDelay?: number;
}) {
  const id = useId();

  return (
    <div>
      <ThickTooltip tooltipContent={tooltipContent} delay={tooltipDelay}>
        <div className="relative inline-grid h-9 grid-cols-[1fr_1fr] items-center text-sm font-medium">
          <Switch
            id={id}
            checked={isChecked}
            onCheckedChange={onCheckedChange}
            className={cn(
              className,
              "peer data-[state=checked]:bg-input/50 data-[state=unchecked]:bg-input/50 absolute inset-0 h-[inherit] w-auto [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:ease-[cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-full [&_span]:data-[state=checked]:rtl:-translate-x-full",
            )}
          />
          <span className="peer-data-[state=checked]:text-muted-foreground/70 pointer-events-none relative ms-0.5 flex min-w-8 items-center justify-center text-center">
            {leftIcon}
          </span>
          <span className="peer-data-[state=unchecked]:text-muted-foreground/70 pointer-events-none relative me-0.5 flex min-w-8 items-center justify-center text-center">
            {rightIcon}
          </span>
        </div>
      </ThickTooltip>
    </div>
  );
}
