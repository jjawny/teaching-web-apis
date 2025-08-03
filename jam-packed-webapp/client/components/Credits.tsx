import { cn } from "~/client/utils/cn";

export default function Credits({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        className,
        "font-instrument-serif font-bold text-stone-400 filter-[url('#glow-outline')]",
      )}
    >
      @Jawny
    </div>
  );
}
