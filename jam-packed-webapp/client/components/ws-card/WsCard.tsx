"use client";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  CircleIcon,
  Wifi,
  WifiHigh,
  WifiIcon,
  WifiLow,
  WifiOffIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useWsCtx } from "~/client/hooks/useWsCtx";
import { cn } from "~/client/utils/cn";
import WsCardMessagesContainer from "./WsCardMessagesContainer";

const CONNECTED_BG =
  "bg-gradient-to-br from-cyan-100/50 via-cyan-200/80 to-cyan-100/20 backdrop-blur-xl";
const DISCONNECTED_BG =
  "bg-gradient-to-br from-stone-100/50 via-stone-200/80 to-stone-100/20 backdrop-blur-xl";
const TRANSITIONING_BG =
  "bg-gradient-to-br from-amber-100/50 via-amber-200/80 to-amber-100/20 backdrop-blur-xl";
const WS_ERROR_BG =
  "bg-gradient-to-br from-red-100/50 via-red-200/80 to-red-100/20 backdrop-blur-xl";

// Hook for cycling through wifi icons during transitioning states
function useTransitioningIcon() {
  const [iconIndex, setIconIndex] = useState(0);
  const icons = [Wifi, WifiLow, WifiHigh];

  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % icons.length);
    }, 500); // Changed to 200ms as 20ms would be too fast and barely visible

    return () => clearInterval(interval);
  }, []);

  return icons[iconIndex];
}

// Get background and border styles based on connection state
function getConnectionStyles(readyState: number, wsError?: string) {
  if (wsError) {
    return [WS_ERROR_BG, "border-red-300"];
  }

  switch (readyState) {
    case WebSocket.OPEN:
      return [CONNECTED_BG, "border-cyan-300"];
    case WebSocket.CONNECTING:
    case WebSocket.CLOSING:
      return [TRANSITIONING_BG, "border-amber-300"];
    case WebSocket.CLOSED:
    default:
      return [DISCONNECTED_BG, "border-stone-300"];
  }
}

export default function WsCard() {
  const [messagesExpanded, setMessagesExpanded] = useState(false);

  const readyStatus = useWsCtx((ctx) => ctx.wsReadyState);
  const wsError = useWsCtx((ctx) => ctx.wsError);

  const [backgroundStyle, borderStyle] = getConnectionStyles(readyStatus, wsError);

  return (
    <div className="mx-auto w-[500px]">
      <div
        onClick={() => setMessagesExpanded((v) => !v)}
        className={cn(
          "relative", // for overlays
          "border",
          "cursor-pointer overflow-hidden rounded-[2.5rem] select-none",
          backgroundStyle,
          borderStyle,
        )}
      >
        <Overlays />
        <div className="relative flex items-center px-8 pt-5">
          <ConnectionIcon className="mr-6" />
          <WsCardMessagesContainer messagesExpanded={messagesExpanded} />
          <ToggleExpandIcon isExpanded={messagesExpanded} />
        </div>
      </div>
      <RoomSubtext />
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

function ConnectionIcon({ className }: { className?: string }) {
  const readyState = useWsCtx((ctx) => ctx.wsReadyState);
  const hasJoinedRoom = useWsCtx((ctx) => ctx.hasJoinedRoom);
  const TransitioningIcon = useTransitioningIcon();

  const renderIcon = () => {
    switch (readyState) {
      case WebSocket.OPEN:
        if (hasJoinedRoom) {
          // Connected and joined room - CircleIcon with animate-ping
          return <CircleIcon className="h-6 w-6 animate-ping text-cyan-400/60" strokeWidth={3} />;
        } else {
          // Connected but not joined room - WifiIcon with animate-pulse
          return <WifiIcon className="h-6 w-6 animate-pulse text-cyan-400/60" strokeWidth={3} />;
        }
      case WebSocket.CONNECTING:
      case WebSocket.CLOSING:
        // Transitioning states - cycling wifi icons with animate-pulse
        return (
          <TransitioningIcon className="h-6 w-6 animate-pulse text-amber-400/60" strokeWidth={3} />
        );
      case WebSocket.CLOSED:
      default:
        // Closed state - WifiOffIcon
        return <WifiOffIcon className="h-6 w-6 text-stone-400/60" strokeWidth={3} />;
    }
  };

  return <div className={cn(className, "z-50 flex-shrink-0")}>{renderIcon()}</div>;
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

function RoomSubtext() {
  const hasJoinedRoom = useWsCtx((ctx) => ctx.hasJoinedRoom);
  const wsReadyState = useWsCtx((ctx) => ctx.wsReadyState);
  const roomName = useWsCtx((ctx) => ctx.roomName);
  const wsError = useWsCtx((ctx) => ctx.wsError);

  if (wsError) {
    return (
      <div className="pt-2 text-center text-red-500">
        <strong>Error:</strong> {wsError}
      </div>
    );
  }

  if (hasJoinedRoom && wsReadyState === WebSocket.OPEN) {
    return (
      <div className="pt-2 text-center text-stone-300">
        <strong>Joined:</strong> {roomName ?? "Unnamed Room"}
      </div>
    );
  }

  return null;
}
