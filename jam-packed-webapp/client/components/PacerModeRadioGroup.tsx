"use client";

import { RadioGroupItem } from "@radix-ui/react-radio-group";
import { GaugeIcon, TimerIcon } from "lucide-react";
import { userCtx } from "~/client/modules/user-context";
import { PacerMode, PacerModeType } from "../enums/pacer-mode";
import { cn } from "../utils/cn";
import { Label } from "./ui/label";
import { RadioGroup } from "./ui/radio-group";

export default function PacerModeRadioGroup({
  className,
  mode,
  onModeChange,
}: {
  className?: string;
  mode: PacerModeType;
  onModeChange: (mode: PacerModeType) => void;
}) {
  const user = userCtx((ctx) => ctx.user);

  if (!user) return null;

  return (
    <RadioGroup
      value={mode}
      onValueChange={(val) => onModeChange(val as PacerModeType)}
      className="max-h-[36px] grid-cols-2 gap-1"
    >
      <PacerModeOption value={PacerMode.THROTTLE} icon={GaugeIcon} label={PacerMode.THROTTLE} />
      <PacerModeOption value={PacerMode.DEBOUNCE} icon={TimerIcon} label={PacerMode.DEBOUNCE} />
    </RadioGroup>
  );
}

function PacerModeOption({
  value,
  icon: Icon,
  label,
}: {
  value: PacerModeType;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
}) {
  return (
    <div
      className={cn(
        "border-input has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex min-w-fit cursor-pointer items-center gap-1 rounded-md border px-2 text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]",
        "has-data-[state=checked]:border-stone-300 has-data-[state=checked]:bg-stone-200",
        "transition-all duration-300 ease-in-out",
      )}
    >
      <RadioGroupItem value={value} id={`id-${value}`} className="sr-only" />
      <Icon className="opacity-60" size={20} aria-hidden="true" />
      <Label
        htmlFor={`id-${value}`}
        className="text-foreground cursor-pointer text-xs leading-none font-medium after:absolute after:inset-0"
      >
        {label.replace(/\b\w/g, (char) => char.toUpperCase())}
      </Label>
    </div>
  );
}
