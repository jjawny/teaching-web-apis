import { useEffect, useRef } from "react";
import { useWsCtx } from "~/client/hooks/useWsCtx";
import { cn } from "~/client/utils/cn";
import SlidingCounter from "../SlidingCounter";

export default function EventsContainer({
  eventLog,
  eventLogExpanded,
}: {
  eventLog: any[];
  eventLogExpanded: boolean;
}) {
  const ulRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (ulRef.current && eventLog.length > 0) {
      const ul = ulRef.current;
      const BOTTOM_AREA_THRESHOLD_PX = 100;
      const isAtBottom =
        ul.scrollTop + ul.clientHeight >= ul.scrollHeight - BOTTOM_AREA_THRESHOLD_PX;

      // Shrinked: always scroll to collapsed
      // Expanded: Only scroll to bottom when near bottom
      if (!eventLogExpanded || isAtBottom) {
        // Delay the scroll when going from expanded -> collapsed
        //  to ensure the container has finished transitioning its height
        const delay_ms = !eventLogExpanded ? 300 : 0;

        setTimeout(() => {
          ul.scrollTo({
            top: ul.scrollHeight,
            behavior: "smooth",
          });
        }, delay_ms);
      }
    }
  }, [eventLog, eventLogExpanded]);

  return (
    <div className="relative min-h-[100px] flex-1 space-y-3 pt-8">
      <EventsContainerHeader eventsCount={eventLog.length} />
      <div
        className="bg-transparent transition-all duration-500 ease-in-out"
        style={{
          height: eventLogExpanded ? 120 : 48,
          overflow: "hidden",
        }}
      >
        <div className="relative h-full">
          <ul
            ref={ulRef}
            className="ml-2 list-none pr-2 font-mono text-[1.15rem] text-gray-700/80 transition-all duration-500 ease-in-out"
            style={{
              maxHeight: eventLogExpanded ? 120 : 48,
              overflowY: eventLogExpanded ? "auto" : "hidden",
              position: "relative",
              zIndex: 1,
              paddingTop: 10,
              paddingBottom: eventLogExpanded ? 30 : 0,
              opacity: 0.85,
            }}
          >
            {/* TODO: use an eventID as the key */}
            {eventLog.length === 0 && <li className="text-gray-400">No events yet</li>}
            {eventLog.map((evt, i) => (
              <Event key={i} evt={evt} i={i} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function EventsContainerHeader({ eventsCount }: { eventsCount: number }) {
  return (
    <h2 className="absolute top-0 z-[99999] font-mono text-2xl font-bold tracking-tight whitespace-nowrap text-black/90">
      <SlidingCounter className="pl-0!" count={eventsCount} />
      WebSocket message
      {eventsCount === 1 ? "" : "s"}
    </h2>
  );
}

function Event({ className, evt, i }: { className?: string; evt: any; i: number }) {
  const isConnected = useWsCtx((ctx) => ctx.isConnected);
  return (
    <li key={i} className="mb-1">
      <span className={cn("font-bold", isConnected ? "text-blue-500" : "text-stone-500")}>
        [{evt.event}]
      </span>{" "}
      {evt.details && (
        <span className={cn(isConnected ? "text-blue-300" : "text-stone-300")}>{evt.details}</span>
      )}
    </li>
  );
}
