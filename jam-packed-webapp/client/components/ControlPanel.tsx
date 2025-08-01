"use client";

import { useEffect, useState } from "react";
import { useJobWebSocket } from "~/client/hooks/useJobWebSocket";
import WsCard from "./ws-card/WsCard";

export default function ControlPanel() {
  const [token, setToken] = useState<string | null>(null);

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
  }, []);

  const [roomId, setRoomId] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [eventLog, setEventLog] = useState<any[]>([]);
  const [httpStatus, setHttpStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [httpError, setHttpError] = useState<string | null>(null);
  const [query, setQuery] = useState("madman");
  const { message, isConnected, isPromptForPin } = useJobWebSocket(roomId, token, pin);
  const [eventLogExpanded, setEventLogExpanded] = useState(false);

  useEffect(() => {
    const lastStatus = eventLog.length ? eventLog[eventLog.length - 1]?.status : null;
    if (message && lastStatus !== message.event) {
      setEventLog((log) => [...log, { ...message, time: new Date().toLocaleTimeString() }]);
    }
  }, [message]);

  const handleJoinRoom = () => {
    const newRoomId = crypto.randomUUID();
    setRoomId(newRoomId);
    setEventLog([]);
    // triggers custom hook to join the WebSocket room
  };

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
    <div className="mx-auto max-w-xl p-4">
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
              // Handle PIN submission logic here
              console.log("PIN submitted:", e.currentTarget.value);
              setPin(e.currentTarget.value);
            }
          }}
        />
      )}
      <button
        onClick={handleJoinRoom}
        disabled={isConnected}
        className="mb-4 rounded border bg-blue-500 px-4 py-2 text-white"
        style={{
          opacity: isConnected ? 0.5 : 1,
        }}
      >
        Join room
      </button>
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

      {roomId && (
        <div className="mb-2">
          <strong>Room ID:</strong> {roomId}
        </div>
      )}
      <WsCard
        eventLog={eventLog}
        eventLogExpanded={eventLogExpanded}
        setEventLogExpanded={setEventLogExpanded}
      />
    </div>
  );
}
