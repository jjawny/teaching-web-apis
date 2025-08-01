"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "~/client/utils/cn";

const countVariants = {
  initial: { y: -10, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 10, opacity: 0 },
};

export default function SlidingCounter({
  className,
  count,
}: {
  className?: string;
  count: number;
}) {
  return (
    <span
      className={cn(
        className,
        "relative ms-1 inline-flex h-full items-center justify-center rounded-full px-3 before:absolute before:inset-0 before:w-px",
      )}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          variants={countVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
