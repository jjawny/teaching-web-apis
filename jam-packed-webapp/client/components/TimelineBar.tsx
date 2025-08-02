import { MessageCircleIcon, PointerIcon, RectangleVerticalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTimelineCtx } from "~/client/hooks/useTimelineCtx";
import { Tick } from "~/client/models/tick";

const BAR_WIDTH_PX = 370;
const ICON_SIZE_PX = 15;
const BAR_HEIGHT_PX = 20;
const TICK_WIDTH_PX = 5;
const TIMELINE_DURATION_MS = 5000; // ttsf (time-til-slide-off)

export default function TimelineBar({ isDebugging = false }: { isDebugging?: boolean }) {
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
    const left = BAR_WIDTH_PX * (1 - progress);
    return left + TICK_WIDTH_PX >= 0;
  });

  return (
    <div>
      {isDebugging && <TestStampingOnTimeline />}

      <div
        className="relative overflow-hidden rounded-xl border border-gray-300 bg-white"
        style={{ width: BAR_WIDTH_PX, height: BAR_HEIGHT_PX }}
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
  const left = BAR_WIDTH_PX * (1 - progress);

  if (tick.type === "basic") {
    return (
      <div
        className="absolute top-0 bottom-0 bg-stone-200"
        style={{
          left,
          width: TICK_WIDTH_PX,
        }}
      />
    );
  }

  return (
    <div
      className="absolute top-0 bottom-0 flex h-full items-center justify-center"
      style={{
        left,
        width: ICON_SIZE_PX,
      }}
    >
      {tick.type === "click" ? (
        <PointerIcon size={ICON_SIZE_PX} />
      ) : (
        <MessageCircleIcon size={ICON_SIZE_PX} />
      )}
    </div>
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
          <RectangleVerticalIcon size={ICON_SIZE_PX} />
        </button>
        <button
          onClick={() => addTick("click")}
          className="mb-4 rounded bg-black px-3 py-1 text-white"
        >
          <PointerIcon size={ICON_SIZE_PX} />
        </button>
        <button
          onClick={() => addTick("ws")}
          className="mb-4 rounded bg-black px-3 py-1 text-white"
        >
          <MessageCircleIcon size={ICON_SIZE_PX} />
        </button>
      </div>
    </>
  );
}
