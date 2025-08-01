import { ChevronDownIcon, ChevronUpIcon, CircleIcon, UnplugIcon } from "lucide-react";
import React from "react";
import { useWsCtx } from "~/client/hooks/useWsCtx";
import { cn } from "~/client/utils/cn";
import EventsContainer from "./WsCardEventsContainer";

const CONNECTED_BG =
  "bg-gradient-to-br from-cyan-100/50 via-cyan-200/80 to-cyan-100/20 backdrop-blur-xl";
const DISCONNECTED_BG =
  "bg-gradient-to-br from-stone-100/50 via-stone-200/80 to-stone-100/20 backdrop-blur-xl";

export default function WsCard({
  eventLog,
  eventLogExpanded,
  setEventLogExpanded,
}: {
  eventLog: any[];
  eventLogExpanded: boolean;
  setEventLogExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const isConnected = useWsCtx((ctx) => ctx.isConnected);

  return (
    <div className="mx-auto w-[500px] p-4">
      <div
        onClick={() => setEventLogExpanded((v) => !v)}
        className={cn(
          "relative", // for overlays
          "border",
          isConnected ? "border-cyan-300" : "border-stone-300",
          "cursor-pointer overflow-hidden rounded-[2.5rem] select-none",
          isConnected ? CONNECTED_BG : DISCONNECTED_BG,
        )}
      >
        <Overlays />
        <div className="relative flex items-center px-8 pt-5">
          <ListeningToEventsIcon className="mr-6" />
          <EventsContainer eventLog={eventLog} eventLogExpanded={eventLogExpanded} />
          <ToggleExpandIcon isExpanded={eventLogExpanded} />
        </div>
      </div>
    </div>
  );
}

function Overlays() {
  return (
    <>
      {/* Blurry/soft overlay on container background for a less sharp gradient */}
      <div className={cn("absolute inset-0 bg-white/15 backdrop-blur-xl")} />

      {/* Top blur fade overlay */}
      <div
        className={cn(
          "pointer-events-none absolute",
          "top-0 right-0 left-0 z-50 h-24",
          "backdrop-blur-xs",
        )}
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
        }}
      ></div>

      {/* Bottom blur fade overlay */}
      <div
        className={cn(
          "pointer-events-none absolute",
          "right-0 bottom-0 left-0 z-50 h-8",
          "backdrop-blur-xs",
        )}
        style={{
          maskImage: "linear-gradient(to top, black 0%, black 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, black 60%, transparent 100%)",
        }}
      ></div>
    </>
  );
}

function ListeningToEventsIcon({ className }: { className?: string }) {
  const isConnected = useWsCtx((ctx) => ctx.isConnected);

  return (
    <div className={cn(className, "z-50 flex-shrink-0")}>
      {isConnected ? (
        <CircleIcon className="h-6 w-6 animate-ping text-cyan-400/60" strokeWidth={3} />
      ) : (
        <UnplugIcon className="h-6 w-6 animate-pulse text-stone-400/60" strokeWidth={3} />
      )}
    </div>
  );
}

function ToggleExpandIcon({ isExpanded, className }: { isExpanded: boolean; className?: string }) {
  return (
    <div className={cn(className, "flex-shrink-0")}>
      {isExpanded ? (
        <ChevronUpIcon className="h-10 w-10 text-black/20" strokeWidth={2} />
      ) : (
        <ChevronDownIcon className="h-10 w-10 text-black/40" strokeWidth={2} />
      )}
    </div>
  );
}
