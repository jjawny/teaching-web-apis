"use client";

import { Loader2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/client/components/ui/button";
import Pin from "~/client/components/ws-card/Pin";
import { useGetJamPackedWebApiToken } from "~/client/hooks/useGetJamPackedWebApiToken";
import { useWsCtx } from "~/client/hooks/useWsCtx";
import { clientEnv } from "~/shared/modules/env";

export default function MainTextField({
  reConnectAndJoinWithPin,
}: {
  reConnectAndJoinWithPin: (roomId: string, pin: string) => void;
}) {
  const [processing, setProcessing] = useState<boolean>(false);
  const [httpStatus, setHttpStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [httpError, setHttpError] = useState<string | null>(null);
  const [query, setQuery] = useState("madman");
  const roomPinError = useWsCtx((ctx) => ctx.pinError);
  const pin = useWsCtx((ctx) => ctx.roomPin);
  const hasJoinedRoom = useWsCtx((ctx) => ctx.hasJoinedRoom);
  const isAttemptingToConnect = useWsCtx((ctx) => ctx.isAttemptingToConnect);
  const isJoiningRoom = useWsCtx((ctx) => ctx.isJoiningRoom);
  const isPendingPinFromUser = useWsCtx((ctx) => ctx.isPendingPinFromUser);
  const setPin = useWsCtx((ctx) => ctx.setRoomPin);
  const wsReadyState = useWsCtx((ctx) => ctx.wsReadyState);
  const roomId = useWsCtx((ctx) => ctx.roomId);
  // this bool is separate from the one in the context, that one's loading state is covered by isConnecting etc
  const { data: token, error: tokenError } = useGetJamPackedWebApiToken();

  useEffect(() => {
    if (tokenError) {
      toast.error(tokenError.message);
    }
  }, [tokenError]);

  const handleStart = useCallback(async () => {
    if (!token || !roomId) {
      toast.error("No token or room ID available, cannot start job");
      return;
    }
    setProcessing(true);
    setHttpStatus("loading");
    setHttpError(null);
    try {
      const response = await fetch(
        `${clientEnv.NEXT_PUBLIC_JAM_PACKED_WEBAPI_URL}/api/check-aura?isSkipCache=true`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ roomId: roomId, username: query }),
        },
      );
      if (response.ok) {
        setHttpStatus("success");
      } else {
        setHttpStatus("error");
        const data = await response.json();
        setHttpError(data.error || "Unknown error");
      }
    } catch (e: any) {
      setHttpStatus("error");
      setHttpError(e.message || String(e));
    } finally {
      setProcessing(false);
    }
  }, [token]);

  const isConnected = wsReadyState === WebSocket.OPEN;
  const isConnecting = wsReadyState === WebSocket.CONNECTING;

  if (isConnecting || isJoiningRoom || isAttemptingToConnect) {
    return <Loader2Icon className="h-12 w-12 animate-spin text-cyan-300" strokeWidth={3} />;
  }

  if (isConnected && !hasJoinedRoom && isPendingPinFromUser) {
    return (
      <Pin
        value={pin ?? ""}
        pinHelperText={{ helper: "Create a new room", error: roomPinError }}
        onChange={(pin) => {
          setPin(pin);
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
      <>
        <div className="mb-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded border px-2 py-1"
            placeholder="Your Username"
            disabled={processing}
          />
        </div>
        <button
          onClick={handleStart}
          disabled={processing}
          className="mb-4 rounded border bg-blue-500 px-4 py-2 text-white"
        >
          {processing ? "Processing..." : "Start Job"}
        </button>
        <div className="mb-2">
          <strong>HTTP Status:</strong> {httpStatus}
          {httpError && <span className="ml-2 text-red-500">{httpError}</span>}
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <Button onClick={() => reConnectAndJoinWithPin(roomId ?? "", pin ?? "")} className="mt-2">
        Reconnect
      </Button>
    </div>
  );
}
