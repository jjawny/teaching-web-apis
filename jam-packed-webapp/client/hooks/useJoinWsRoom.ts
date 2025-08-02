import { useCallback, useEffect, useRef, useState } from "react";
import { WsMessageType } from "~/client/enums/ws-message-type";
import { userCtx } from "~/client/modules/user-context";
import { clientEnv } from "~/shared/modules/env";
import { useTimelineCtx } from "./useTimelineCtx";
import { useWsCtx } from "./useWsCtx";

export function useJoinWsRoom(roomId: string | null, token: string | null, maxRetries = 3) {
  const user = userCtx((ctx) => ctx.user);
  const setWsReadyState = useWsCtx((ctx) => ctx.setWsReadyState);
  const setWsError = useWsCtx((ctx) => ctx.setWsError);
  const addMessage = useWsCtx((ctx) => ctx.addMessage);
  const joinRoom = useWsCtx((ctx) => ctx.joinRoom);
  const leaveRoom = useWsCtx((ctx) => ctx.leaveRoom);
  const storedPin = useWsCtx((ctx) => ctx.pin);
  const addTick = useTimelineCtx((ctx) => ctx.addTick);
  const setPinError = useWsCtx((ctx) => ctx.setPinError);

  const [isPromptForPin, setIsPromptForPin] = useState<boolean>(false);
  const retryCount = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);
  const hasAttemptedInitialJoin = useRef(false);

  // Function to attempt joining a room (separate from connection)
  const attemptJoinRoom = useCallback(
    (pin?: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && roomId) {
        console.debug("Attempting to join room with PIN:", pin || "none");
        wsRef.current.send(
          JSON.stringify({
            action: "subscribe",
            roomId: roomId,
            roomName: "Johnny's room",
            pin: pin || "", // Send empty string if no pin
          }),
        );
      } else {
        console.warn("WebSocket not ready for room join attempt");
      }
    },
    [roomId],
  );

  const connect = useCallback(() => {
    console.debug("establishing websocket connection");

    // Don't close existing connection - just return if already connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.debug("WebSocket already connected");
      return;
    }

    // Close any existing connection that's not open
    if (wsRef.current) {
      wsRef.current.close();
    }

    const backendUrl = clientEnv.NEXT_PUBLIC_BACKEND_URL;
    const wsUrl = backendUrl.replace(/^http/, "ws") + `/ws?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = (e) => {
      setWsReadyState(ws.readyState);
      retryCount.current = 0;
      console.debug("WebSocket connected");

      // Only attempt initial join once per connection
      if (!hasAttemptedInitialJoin.current && roomId) {
        hasAttemptedInitialJoin.current = true;
        // Try to join with stored PIN if available, otherwise with no PIN
        const currentPin = storedPin || "";
        console.debug("Attempting to join room with PIN:", currentPin || "none");
        ws.send(
          JSON.stringify({
            action: "subscribe",
            roomId: roomId,
            roomName: "Johnny's room",
            pin: currentPin,
          }),
        );
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
      setWsReadyState(ws.readyState);
      setWsError("Experiencing connection issues");
    };

    const reconnect = () => {
      if (retryCount.current < maxRetries) {
        const delay = Math.min(1000 * 2 ** retryCount.current, 30000);
        retryCount.current += 1;
        console.log(`Reconnect attempt ${retryCount.current} in ${delay}ms`);
        setTimeout(() => {
          hasAttemptedInitialJoin.current = false; // Reset for retry
          connect();
        }, delay);
      } else {
        console.log("Do not retry WebSocket");
        leaveRoom();
        hasAttemptedInitialJoin.current = false;
      }
    };

    ws.onclose = (e) => {
      console.debug("WebSocket closed:", e.code, e.reason);
      setWsReadyState(ws.readyState);
      const clean = e.wasClean ?? false;
      const code = e.code;
      const nonRetryable = code === 1000 || code === 1001;
      const shouldRetry = !nonRetryable && !clean;

      if (shouldRetry) {
        reconnect();
      } else {
        console.log("Do not retry WebSocket");
        leaveRoom();
        hasAttemptedInitialJoin.current = false;
      }
    };

    ws.onmessage = (e) => {
      // TODO: Zod validation
      try {
        const data = JSON.parse(e.data);
        console.debug("Received WebSocket message:", data);

        setWsError(undefined); // all good?
        setPinError(undefined); // all good?

        // Handle room joining responses directly here
        if (data.type === WsMessageType.BAD_PIN) {
          console.warn("PIN required to join room");
          setIsPromptForPin(true);
          setPinError(data.details);
          return;
        }

        if (data.type === WsMessageType.INCORRECT_PIN) {
          console.warn("Invalid PIN provided");
          setIsPromptForPin(true);
          setPinError(data.details);
          return;
        }

        // Handle other room errors (max rooms, room full, etc.)
        // detect these not just failed to join room
        if (data.details && data.details.includes("Failed to join room")) {
          console.warn("Failed to join room:", data.type);
          setPinError(data.details);
          return;
        }

        // Here we can capture the message in our local state

        // Successfully joined room
        if (data.type === WsMessageType.USER_JOINED && data.userId === user?.id) {
          joinRoom(data.roomId, "Johnny's room", undefined);
          console.log("Successfully joined room");
          setIsPromptForPin(false);
          addMessage(data);
          addTick("ws");
          return;
        }

        // Only add messages for the current room
        if (data.roomId === roomId) {
          console.debug("Adding message for current room:", roomId);
          addMessage(data);
          addTick("ws");
        } else {
          console.debug("Ignoring message for different room:", data.roomId, "vs current:", roomId);
        }
      } catch (error) {
        console.warn("Failed to parse WebSocket message:", error);
        const errorMessage = error instanceof Error ? error.message : "Unexpected error";
        if (error instanceof Error) {
          setWsError(errorMessage);
        }
      }
    };
  }, [token, roomId, maxRetries]);

  // Function to rejoin with new PIN without creating new connection
  const rejoinWithPin = useCallback(
    (newPin: string) => {
      console.debug("Rejoining room with new PIN:", newPin);
      attemptJoinRoom(newPin);
    },
    [attemptJoinRoom],
  );

  // reconnect when roomid or token changes, but NOT when pin changes
  useEffect(() => {
    if (!roomId || !token) {
      return;
    }

    connect();

    return () => {
      if (wsRef.current) {
        console.debug("Cleanup: Closing WebSocket connection");
        wsRef.current.close(1000, "Component unmount");
        wsRef.current = null;
      }
      hasAttemptedInitialJoin.current = false;
    };
  }, [roomId, token]); // Removed connect and disconnect from dependencies

  return { isPromptForPin, rejoinWithPin };
}
