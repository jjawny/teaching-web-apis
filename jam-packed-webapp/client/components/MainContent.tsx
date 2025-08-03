"use client";

import { Loader2Icon } from "lucide-react";
import TimelineBar from "~/client/components/TimelineBar";
import { Button } from "~/client/components/ui/button";
import Pin from "~/client/components/ws-card/Pin";
import { useJoinWsRoom } from "~/client/hooks/useJoinWsRoom";
import { useWsCtx } from "~/client/hooks/useWsCtx";
import MainTextField from "./MainTextField";

export default function MainContent() {
  const { reConnectAndJoinWithPin } = useJoinWsRoom(true);

  const wsReadyState = useWsCtx((ctx) => ctx.wsReadyState);
  const isAttemptingToConnect = useWsCtx((ctx) => ctx.isAttemptingToConnect);
  const isJoiningRoom = useWsCtx((ctx) => ctx.isJoiningRoom);
  const hasJoinedRoom = useWsCtx((ctx) => ctx.hasJoinedRoom);
  const isPendingPinFromUser = useWsCtx((ctx) => ctx.isPendingRoomPinFromUser);
  const roomPinError = useWsCtx((ctx) => ctx.pinError);
  const roomPin = useWsCtx((ctx) => ctx.roomPin);
  const roomId = useWsCtx((ctx) => ctx.roomId);
  const setRoomPin = useWsCtx((ctx) => ctx.setRoomPin);

  const isConnected = wsReadyState === WebSocket.OPEN;
  const isConnecting = wsReadyState === WebSocket.CONNECTING;

  if (isConnecting || isJoiningRoom || isAttemptingToConnect) {
    return <Loader2Icon className="h-12 w-12 animate-spin text-cyan-300" strokeWidth={3} />;
  }

  if (isConnected && !hasJoinedRoom && isPendingPinFromUser) {
    return (
      <Pin
        value={roomPin ?? ""}
        pinHelperText={{ helper: "Create a new room", error: roomPinError }}
        onChange={(pin) => {
          setRoomPin(pin);
        }}
        onComplete={(pin) => {
          console.debug("PIN submitted:", pin);
          reConnectAndJoinWithPin(roomId ?? "", pin);
        }}
      />
    );
  }

  if (isConnected && hasJoinedRoom) {
    return (
      <div className="flex flex-col items-center gap-4">
        <TimelineBar />
        <MainTextField />
      </div>
    );
  }

  return (
    <Button onClick={() => reConnectAndJoinWithPin(roomId ?? "", roomPin ?? "")} className="mt-2">
      Reconnect
    </Button>
  );
}
