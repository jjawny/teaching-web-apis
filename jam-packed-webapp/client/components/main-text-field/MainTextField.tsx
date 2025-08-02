"use client";

import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import Pin from "~/client/components/ws-card/Pin";
import { useWsCtx } from "~/client/hooks/useWsCtx";
import { clientEnv } from "~/shared/modules/env";

export default function MainTextField({
  isPromptForPin,
  rejoinWithPin,
  token,
  roomId,
}: {
  isPromptForPin: boolean;
  rejoinWithPin: (pin: string) => void;
  token: string | null;
  roomId: string | null;
}) {
  const [processing, setProcessing] = useState<boolean>(false);
  const [httpStatus, setHttpStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [httpError, setHttpError] = useState<string | null>(null);
  const [query, setQuery] = useState("madman");
  const pinError = useWsCtx((ctx) => ctx.pinError);
  const pin = useWsCtx((ctx) => ctx.pin);
  const hasJoinedRoom = useWsCtx((ctx) => ctx.hasJoinedRoom);
  const setPin = useWsCtx((ctx) => ctx.setPin);

  // const { isPromptForPin, rejoinWithPin } = useJoinWsRoom(roomId, token); // No need to pass pin anymore

  const handleStart = async () => {
    setProcessing(true);
    setHttpStatus("loading");
    setHttpError(null);
    try {
      const response = await fetch(
        `${clientEnv.NEXT_PUBLIC_BACKEND_URL}/api/check-aura?isSkipCache=true`,
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
  };

  return (
    <div className="flex justify-center">
      {!hasJoinedRoom && isPromptForPin && (
        <Pin
          value={pin ?? ""}
          isPlayShakeAnimation={!!pinError}
          pinHelperText={{ helperText: "Create a new room", errorText: pinError }}
          onChange={(pin) => {
            setPin(pin);
          }}
          onComplete={(pin) => {
            console.debug("PIN submitted:", pin);
            rejoinWithPin(pin);
          }}
        />
      )}
      {!hasJoinedRoom && !isPromptForPin && (
        <Loader2Icon className="h-12 w-12 animate-spin text-blue-500" strokeWidth={3} />
      )}
      {hasJoinedRoom && (
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
      )}
    </div>
  );
}
