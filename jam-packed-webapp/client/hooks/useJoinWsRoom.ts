import { useCallback, useEffect, useRef } from "react";
import { WsMessageType } from "~/client/enums/ws-message-type";
import { userCtx } from "~/client/modules/user-context";
import { showError } from "~/client/utils/toast-utils";
import { clientEnv } from "~/shared/modules/env";
import { useGetJamPackedWebApiTokenQuery } from "./useGetJamPackedWebApiTokenQuery";
import { useJamPackedWebApiHealthCheckQuery } from "./useJamPackedWebApiHealthCheckQuery";
import { useTimelineCtx } from "./useTimelineCtx";
import { useWsCtx } from "./useWsCtx";

/**
 * TODO: gpt ascii for this and put it into the README, also this is outdated, redo it
 * A re/fetch for the health check triggers -> connecting -> triggers join room
 *                                              |-> fails and closes or just closes -> loop back and connect w exponential backoff
 * A rejoin will either trigger the join room if already connected (skips to final step) otherwise call connect again which will repeat scenario #1...
 *
 */
export function useJoinWsRoom(isReady = false, maxRetries = 3) {
  const setWsReadyState = useWsCtx((ctx) => ctx.setWsReadyState);
  const setWsError = useWsCtx((ctx) => ctx.setWsError);
  const joinedRoom = useWsCtx((ctx) => ctx.joinedRoom);
  const leftRoom = useWsCtx((ctx) => ctx.leftRoom);
  const addMessage = useWsCtx((ctx) => ctx.addMessage);
  const setRoomId = useWsCtx((ctx) => ctx.setRoomId);
  const setIsAttemptingToConnect = useWsCtx((ctx) => ctx.setIsAttemptingToConnect);
  const setRoomPin = useWsCtx((ctx) => ctx.setRoomPin);
  const setRoomPinError = useWsCtx((ctx) => ctx.setRoomPinError);
  const setIsJoiningRoom = useWsCtx((ctx) => ctx.setIsJoiningRoom);
  const setIsPendingPinUser = useWsCtx((ctx) => ctx.setIsPendingRoomPinFromUser);

  const addTick = useTimelineCtx((ctx) => ctx.addTick);
  const { refetch: refetchJamPackedWebApiToken, error: tokenError } =
    useGetJamPackedWebApiTokenQuery();
  const { data: isJamPackedWebApiHealthy, error: jamPackedWebApiError } =
    useJamPackedWebApiHealthCheckQuery();

  const retryCount = useRef(0);
  const hasAttemptedToConnect = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(async () => {
    const reconnect = () => {
      if (retryCount.current < maxRetries) {
        const delay = Math.min(1000 * 2 ** retryCount.current, 30000);
        retryCount.current += 1;
        console.log(`Reconnect attempt ${retryCount.current} in ${delay}ms`);
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        setIsAttemptingToConnect(false);
        console.log("Do not retry WebSocket");
        retryCount.current = 0;
      }
    };

    setIsAttemptingToConnect(true);

    console.debug("establishing websocket connection");

    // Don't close existing connection - just return if already connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.debug("WebSocket already connected");
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
      console.debug("WebSocket already connecting");
      return;
    }

    // Close any existing connection that's not open
    if (wsRef.current) {
      wsRef.current.close();
    }

    console.debug("Creating new websocket connection");

    const token = await refetchJamPackedWebApiToken();

    if (token.error) {
      console.warn("No token available, cannot connect to WebSocket");
      setWsError("Unable to connect: No valid token, reason:" + token.error);
      return;
    }

    if (!token.data) {
      console.warn("No token available, cannot connect to WebSocket");
      setWsError("Unable to connect: No valid token");
      return;
    }

    const backendUrl = clientEnv.NEXT_PUBLIC_JAM_PACKED_WEBAPI_URL;
    const wsUrl = backendUrl.replace(/^http/, "ws") + `/ws?token=${token.data}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = (e) => {
      setWsReadyState(ws.readyState);
      retryCount.current = 0;
      setIsAttemptingToConnect(false);

      console.debug("WebSocket connected");
      setWsError(undefined); // Clear any previous connection errors

      // Try to join with stored PIN if available, otherwise with no PIN

      const roomId = useWsCtx.getState().roomId;
      const roomPin = useWsCtx.getState().roomPin;

      if (roomId) {
        setIsJoiningRoom(true);
        setIsPendingPinUser(false);
        console.debug(`Attempting to join room ${roomId} with PIN:`, roomPin || "none");

        ws.send(
          JSON.stringify({
            action: "subscribe",
            roomId: roomId,
            roomName: "Johnny's room", // TODO: this should be in the message as a prop
            pin: roomPin,
          }),
        );
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
      setWsReadyState(ws.readyState);
      setWsError("Experiencing connection issues");
    };

    ws.onclose = (e) => {
      console.debug("WebSocket closed:", e.code, e.reason);
      setWsReadyState(ws.readyState);
      leftRoom();

      const clean = e.wasClean ?? false;
      const code = e.code;
      const nonRetryable = code === 1000 || code === 1001;
      const shouldRetry = !nonRetryable && !clean;

      if (shouldRetry) {
        reconnect();
      } else {
        console.log("Do not retry WebSocket");
        setIsAttemptingToConnect(false);
      }
    };

    ws.onmessage = (e) => {
      // TODO: Zod validation
      try {
        const data = JSON.parse(e.data);
        console.debug("Received WebSocket message:", data);

        setWsError(undefined); // all good?
        setRoomPinError(undefined); // all good?

        // Handle room joining responses directly here
        if (data.type === WsMessageType.BAD_PIN) {
          console.warn("PIN required to join room");
          setRoomPinError(data.details);
          setIsJoiningRoom(false);
          setIsPendingPinUser(true);
          return;
        }

        if (data.type === WsMessageType.INCORRECT_PIN) {
          console.warn("Invalid PIN provided");
          setRoomPinError(data.details);
          setIsJoiningRoom(false);
          setIsPendingPinUser(true);
          return;
        }

        // Handle other room errors (max rooms, room full, etc.)
        // detect these not just failed to join room
        if (data.details && data.details.includes("Failed to join room")) {
          console.warn("Failed to join room:", data.type);
          setRoomPinError(data.details);
          setIsJoiningRoom(false);
          setIsPendingPinUser(false);
          return;
        }

        // Here we can capture the message in our local state

        // Successfully joined room

        const currentUserId = userCtx.getState().user?.id;
        if (data.type === WsMessageType.USER_JOINED && data.userId === currentUserId) {
          joinedRoom(data.roomId, "Johnny's room", undefined);
          console.log("Successfully joined room");
          addMessage(data);
          addTick("ws");
          setIsJoiningRoom(false);
          setIsPendingPinUser(false);
          return;
        }

        // Only add messages for the current room
        const roomId = useWsCtx.getState().roomId;

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
  }, [
    maxRetries,
    isJamPackedWebApiHealthy,
    setIsPendingPinUser,
    setIsJoiningRoom,
    joinedRoom,
    addMessage,
    addTick,
    setWsError,
    setRoomPinError,
    setIsAttemptingToConnect,
  ]);

  // Function to attempt joining a room (separate from connection)
  const reConnectAndJoinWithPin = useCallback(
    async (newRoomId: string, newPin: string) => {
      console.debug("Rejoining room with new PIN:", newPin);
      setRoomId(newRoomId);
      setRoomPin(newPin); // future rejoins

      // already connected, send join message
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.debug(`Attempting to join room ${newRoomId} with PIN:`, newPin || "none");
        setIsJoiningRoom(true);
        setIsPendingPinUser(false);
        wsRef.current.send(
          JSON.stringify({
            action: "subscribe",
            roomId: newRoomId,
            roomName: "Johnny's room",
            pin: newPin,
          }),
        );
        // not connected, connect (will trigger a join in onopen)
      } else {
        console.warn(
          "WebSocket not ready for room join attempt, now trying to connect first which will retry join upon onopen",
        );
        connect();
      }
    },
    [setRoomId, setRoomPin, connect, setIsJoiningRoom, setIsPendingPinUser],
  );

  useEffect(() => showError(tokenError), [tokenError]);
  useEffect(() => showError(jamPackedWebApiError), [jamPackedWebApiError]);
  useEffect(() => {
    if (isReady && isJamPackedWebApiHealthy && !hasAttemptedToConnect.current) {
      hasAttemptedToConnect.current = true;
      connect();
    }
  }, [isReady, isJamPackedWebApiHealthy]);

  useEffect(function cleanUpOnUnmount() {
    return () => {
      if (wsRef.current) {
        console.debug("Cleanup: Closing WebSocket connection");
        wsRef.current.close(1000, "Component unmount");
        wsRef.current = null;
      }
    };
  }, []);

  return { reConnectAndJoinWithPin };
}
