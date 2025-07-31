import { cn } from "../utils/cn";

export default function Credits({ className }: { className?: string }) {
  return (
    <div className={cn(className, "font-instrument-serif font-bold filter-[url('#glow-outline')]")}>
      @Jawny
    </div>
  );
}
