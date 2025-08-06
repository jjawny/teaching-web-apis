import { MessageCircleIcon, PointerIcon, RectangleVerticalIcon, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTimelineCtx } from "~/client/hooks/useTimelineCtx";
import { Tick } from "~/client/models/tick";
import {
  TIMELINE_BAR_HEIGHT_PX,
  TIMELINE_BAR_WIDTH_PX,
  TIMELINE_DURATION_MS,
  TIMELINE_ICON_SIZE_PX,
  TIMELINE_TICK_WIDTH_PX,
} from "~/shared/constants";

export default function TimelineBar({
  isDebugging = false,
  className,
}: {
  isDebugging?: boolean;
  className?: string;
}) {
  const [now, setNow] = useState(Date.now());
  const ticks = useTimelineCtx((ctx) => ctx.ticks);
  const animationRef = useRef<number | null>(null);

  useEffect(function AnimateTimeline() {
    const update = () => {
      setNow(Date.now());
      animationRef.current = requestAnimationFrame(update);
    };
    animationRef.current = requestAnimationFrame(update);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Filter out old tickets (only when the entire tick is off-screen)
  const visibleEvents = ticks.filter((e) => {
    const elapsed = now - e.timestamp;
    const progress = elapsed / TIMELINE_DURATION_MS;
    const left = TIMELINE_BAR_WIDTH_PX * (1 - progress);
    return left + TIMELINE_TICK_WIDTH_PX >= 0;
  });

  return (
    <div className={className}>
      {isDebugging && <TestStampingOnTimeline />}

      <div
        className="relative overflow-hidden rounded-xl border border-gray-300 bg-white"
        style={{ width: TIMELINE_BAR_WIDTH_PX, height: TIMELINE_BAR_HEIGHT_PX }}
      >
        {visibleEvents.map((e) => (
          <TickStamp key={e.id} tick={e} now={now} />
        ))}
      </div>
    </div>
  );
}

function TickStamp({ tick, now }: { tick: Tick; now: number }) {
  const elapsed = now - tick.timestamp;
  const progress = elapsed / TIMELINE_DURATION_MS;
  const left = TIMELINE_BAR_WIDTH_PX * (1 - progress);

  if (tick.type !== "basic") {
    return (
      <div
        className="absolute top-0 bottom-0 flex h-full items-center justify-center"
        style={{
          left,
          width: TIMELINE_ICON_SIZE_PX,
        }}
      >
        {tick.type === "click" && <PointerIcon size={TIMELINE_ICON_SIZE_PX} />}
        {tick.type === "http" && <SendIcon size={TIMELINE_ICON_SIZE_PX} />}
        {tick.type === "ws" && <MessageCircleIcon size={TIMELINE_ICON_SIZE_PX} />}
      </div>
    );
  }

  return (
    <div
      className="absolute top-0 bottom-0 bg-stone-200"
      style={{
        left,
        width: TIMELINE_TICK_WIDTH_PX,
      }}
    />
  );
}

function TestStampingOnTimeline() {
  const addTick = useTimelineCtx((ctx) => ctx.addTick);

  return (
    <>
      <p>Test stamping on timeline</p>
      <div className="flex gap-1">
        <button
          onClick={() => addTick("basic")}
          className="mb-4 rounded bg-black px-3 py-1 text-white"
        >
          <RectangleVerticalIcon size={TIMELINE_ICON_SIZE_PX} />
        </button>
        <button
          onClick={() => addTick("click")}
          className="mb-4 rounded bg-black px-3 py-1 text-white"
        >
          <PointerIcon size={TIMELINE_ICON_SIZE_PX} />
        </button>
        <button
          onClick={() => addTick("ws")}
          className="mb-4 rounded bg-black px-3 py-1 text-white"
        >
          <MessageCircleIcon size={TIMELINE_ICON_SIZE_PX} />
        </button>
      </div>
    </>
  );
}
