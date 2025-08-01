import { ChevronDown, ChevronUp, Circle } from "lucide-react";
import React from "react";
import { cn } from "../utils/cn";

export default function WebSocketEvents({
  eventLog,
  eventLogExpanded,
  setEventLogExpanded,
}: {
  eventLog: any[];
  eventLogExpanded: boolean;
  setEventLogExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="mx-auto w-[500px] p-4">
      <div
        onClick={() => setEventLogExpanded((v) => !v)}
        className={cn(
          "relative",
          "border border-blue-100",
          "cursor-pointer overflow-hidden rounded-[2.5rem] select-none",
          "bg-gradient-to-br from-cyan-100/50 via-cyan-200/80 to-cyan-100/20 backdrop-blur-xl",
        )}
      >
        {/* Glassmorphic overlay  for the background to be more soft (less sharp gradient)*/}
        <div className="absolute inset-0 bg-white/15 backdrop-blur-xl" />

        {/* Top blur fade overlay */}
        <div
          className={cn(
            "pointer-events-none absolute top-0 right-0 left-0 z-50 h-24 backdrop-blur-xs",
          )}
          style={{
            maskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
          }}
        ></div>

        {/* Bottom blur fade overlay */}
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 z-50 h-8 backdrop-blur-xs"
          style={{
            maskImage: "linear-gradient(to top, black 0%, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, black 60%, transparent 100%)",
          }}
        ></div>

        {/* Content */}
        <div className="relative flex items-center px-8 pt-5">
          <ListeningToEventsPulse className="mr-6" />

          {/* Main content */}
          <div className="relative min-h-[100px] flex-1 space-y-3 pt-8">
            {/* Header */}
            <h2
              className="absolute top-0 z-[99999] font-mono text-2xl font-bold tracking-tight whitespace-nowrap text-black/90"
              // style={{ fontFamily: "inherit", letterSpacing: "-0.02em" }}
            >
              {eventLog.length} WebSocket message{eventLog.length === 1 ? "" : "s"}
            </h2>
            {/* Event log list */}
            <div
              className="rounded-2xl bg-transparent transition-all duration-500 ease-in-out"
              style={{
                height: eventLogExpanded ? 120 : 48,
                overflow: "hidden",
              }}
            >
              <div className="relative h-full">
                <ul
                  className="ml-2 list-none pr-2 font-mono text-[1.15rem] text-gray-700/80"
                  style={{
                    maxHeight: eventLogExpanded ? 120 : 48,
                    overflowY: "auto",
                    position: "relative",
                    zIndex: 1,
                    paddingTop: 10,
                    paddingBottom: 40,
                    opacity: 0.85,
                  }}
                >
                  {eventLog.length === 0 && <li className="text-gray-400">No events yet</li>}
                  {eventLog.map((evt, i) => (
                    <li key={i} className="mb-1">
                      <span className="font-bold text-blue-500">[{evt.event}]</span>{" "}
                      {evt.details && <span className="text-blue-300">{evt.details}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <ToggleExpandIcon isExpanded={eventLogExpanded} />
        </div>
      </div>
    </div>
  );
}

function ListeningToEventsPulse({ className }: { className?: string }) {
  return (
    <div className={cn(className, "flex-shrink-0")}>
      <Circle className="h-6 w-6 animate-ping text-cyan-400/60" strokeWidth={3} />
    </div>
  );
}

function ToggleExpandIcon({ isExpanded, className }: { isExpanded: boolean; className?: string }) {
  return (
    <div className={cn(className, "flex-shrink-0")}>
      {isExpanded ? (
        <ChevronUp className="h-10 w-10 text-black/20" strokeWidth={2} />
      ) : (
        <ChevronDown className="h-10 w-10 text-black/40" strokeWidth={2} />
      )}
    </div>
  );
}
