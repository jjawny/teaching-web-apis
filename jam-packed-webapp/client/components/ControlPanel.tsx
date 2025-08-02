"use client";

import { useEffect, useState } from "react";
import { useJoinWsRoom } from "~/client/hooks/useJoinWsRoom";
import { useWsCtx } from "../hooks/useWsCtx";
import TimelineBar from "./TimelineBar";
import WsCard from "./ws-card/WsCard";

export default function ControlPanel() {
  const [token, setToken] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [httpStatus, setHttpStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [httpError, setHttpError] = useState<string | null>(null);
  const [query, setQuery] = useState("madman");
  const wsError = useWsCtx((ctx) => ctx.error);

  const setPinInStore = useWsCtx((ctx) => ctx.setPin);
  const { isPromptForPin, rejoinWithPin } = useJoinWsRoom(roomId, token); // No need to pass pin anymore
  const [messagesExpanded, setMessagesExpanded] = useState(false);

  // Fetch NextAuth JWT from API route on first mount
  useEffect(() => {
    async function fetchWebApiToken() {
      const res = await fetch("/api/get-webapi-token", {
        credentials: "include",
      });
      const data = await res.json();
      setToken(data.jwt ?? null);
    }
    fetchWebApiToken();

    // set a random room ID to create a room (in other apps, we'd actually let the user choose this/control the rooms, for here we just subscribe to a random room)
    const newRoomId = crypto.randomUUID();
    setRoomId(newRoomId);
    // triggers custom hook to join the WebSocket room
  }, []);

  const handleStart = async () => {
    setProcessing(true);
    setHttpStatus("loading");
    setHttpError(null);
    try {
      const response = await fetch("http://localhost:8080/api/check-aura?isSkipCache=true", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId: roomId, username: query }),
      });
      // const data = await response.json();
      // if (data.jobId) {
      //   setJobId(data.jobId);
      //   setHttpStatus("success");
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
    <div className="mx-auto max-w-xl">
      <TimelineBar />
      <div className="mb-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded border px-2 py-1"
          placeholder="Your Username"
          disabled={processing}
        />
      </div>
      {isPromptForPin && (
        <input
          type="text"
          placeholder="Enter 4-digit PIN"
          className="mb-2 rounded border px-2 py-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const pinValue = e.currentTarget.value;
              console.log("PIN submitted:", pinValue);
              setPinInStore(pinValue);
              rejoinWithPin(pinValue);
            }
          }}
        />
      )}
      {wsError && (
        <div className="mb-2 text-red-500">
          <strong>ws Error:</strong> {wsError}
        </div>
      )}

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

      <WsCard messagesExpanded={messagesExpanded} setMessagesExpanded={setMessagesExpanded} />
    </div>
  );
}
