import { Tooltip, TooltipContent, TooltipTrigger } from "~/client/components/ui/tooltip";
import { cn } from "../utils/cn";

export default function ThickTooltip({
  className,
  children,
  tooltipContent,
  delay = 700,
}: {
  className?: string;
  children: React.ReactNode;
  tooltipContent: React.ReactNode;
  delay?: number;
}) {
  return (
    <Tooltip delayDuration={delay}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className={cn(className, "rounded-xl px-3 py-3")}>
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
}
