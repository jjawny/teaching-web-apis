import { useEffect, useRef } from "react";
import { useWsCtx } from "~/client/hooks/useWsCtx";
import { cn } from "~/client/utils/cn";
import SlidingCounter from "../SlidingCounter";

export default function WsCardMessagesContainer({
  messagesExpanded,
}: {
  messagesExpanded: boolean;
}) {
  const messages = useWsCtx((ctx) => ctx.messages);
  const hasJoinedRoom = useWsCtx((ctx) => ctx.hasJoinedRoom);
  const ulRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (ulRef.current && messages.length > 0) {
      const ul = ulRef.current;
      const BOTTOM_AREA_THRESHOLD_PX = 100;
      const isAtBottom =
        ul.scrollTop + ul.clientHeight >= ul.scrollHeight - BOTTOM_AREA_THRESHOLD_PX;

      // Shrinked: always scroll to collapsed
      // Expanded: Only scroll to bottom when near bottom
      if (!messagesExpanded || isAtBottom) {
        // Delay the scroll when going from expanded -> collapsed
        //  to ensure the container has finished transitioning its height
        const delay_ms = !messagesExpanded ? 300 : 0;

        setTimeout(() => {
          ul.scrollTo({
            top: ul.scrollHeight,
            behavior: "smooth",
          });
        }, delay_ms);
      }
    }
  }, [messages, messagesExpanded]);

  return (
    <div className="relative min-h-[100px] flex-1 space-y-3 pt-8">
      <ContainerHeader messagesCount={messages.length} />
      <div
        className="bg-transparent transition-all duration-500 ease-in-out"
        style={{
          height: messagesExpanded ? 120 : 48,
          overflow: "hidden",
        }}
      >
        <div className="relative h-full">
          <ul
            ref={ulRef}
            className="ml-2 list-none pr-2 font-mono text-[1.15rem] text-gray-700/80 transition-all duration-500 ease-in-out"
            style={{
              maxHeight: messagesExpanded ? 120 : 48,
              overflowY: messagesExpanded ? "auto" : "hidden",
              position: "relative",
              zIndex: 1,
              paddingTop: 10,
              paddingBottom: messagesExpanded ? 30 : 0,
              opacity: 0.85,
            }}
          >
            {/* TODO: use a new messageId as the key */}
            {messages.length === 0 && (
              <li className="text-gray-400">{hasJoinedRoom ? "No messages yet" : "Join a room"}</li>
            )}
            {messages.map((evt, i) => (
              <Message key={i} evt={evt} i={i} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ContainerHeader({ messagesCount }: { messagesCount: number }) {
  return (
    <h2 className="absolute top-0 z-[99999] font-mono text-2xl font-bold tracking-tight whitespace-nowrap text-black/90">
      <SlidingCounter className="pl-0!" count={messagesCount} />
      WebSocket message
      {messagesCount === 1 ? "" : "s"}
    </h2>
  );
}

function Message({ className, evt, i }: { className?: string; evt: any; i: number }) {
  const isConnected = useWsCtx((ctx) => ctx.hasJoinedRoom);
  return (
    <li key={i} className="mb-1">
      <span className={cn("font-bold", isConnected ? "text-blue-500" : "text-stone-500")}>
        [{evt.type}]
      </span>{" "}
      {evt.details && (
        <span className={cn(isConnected ? "text-blue-300" : "text-stone-300")}>{evt.details}</span>
      )}
    </li>
  );
}
