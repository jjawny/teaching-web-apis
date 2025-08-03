"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useGetJamPackedWebApiToken } from "~/client/hooks/useGetJamPackedWebApiToken";
import { useTimelineCtx } from "~/client/hooks/useTimelineCtx";
import { useWsCtx } from "~/client/hooks/useWsCtx";
import { showError } from "~/client/utils/toast-utils";
import { clientEnv } from "~/shared/modules/env";

type HttpStatus = "idle" | "loading" | "success" | "error";

export default function MainTextField() {
  const [processing, setProcessing] = useState<boolean>(false);
  const [httpStatus, setHttpStatus] = useState<HttpStatus>("idle");
  const [httpError, setHttpError] = useState<string | null>(null);
  const [query, setQuery] = useState("madman");
  const roomId = useWsCtx((ctx) => ctx.roomId);
  const addTick = useTimelineCtx((ctx) => ctx.addTick);

  const { data: token, error: tokenError } = useGetJamPackedWebApiToken();

  useEffect(() => showError(tokenError), [tokenError]);

  const handleStart = useCallback(async () => {
    addTick("click");
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
      addTick("http");

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
