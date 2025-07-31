import { useEffect, useRef, useState } from "react";

export function useJobWebSocket(roomId: string | null, token: string | null, pin: string | null) {
  const [message, setMessage] = useState<any>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [isPromptForPin, setIsPromptForPin] = useState<boolean>(false); // TODO: turn this into an event for invlaid pin or prompt pin etc

  useEffect(() => {
    if (!roomId || !token) return;
    console.log("joining websocket room w pin:", pin);

    const ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          action: "subscribe",
          roomId: roomId,
          roomName: "Johnny's room",
          pin: pin,
        }),
      );
    };
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false); // not application-level (connection/network issues etc)
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessage(data);

        // HANDLE CURRENT USER SUBSCRIBED
        // Current user joined the room
        const isCurrentUserJoined = data.event === "user_joined" && data.userId;
        if (isCurrentUserJoined) {
          setConnected(true);
          setIsPromptForPin(false);
        }

        // TODO: events enum and type/model for the data
        if (!connected && data.event === "prompt_pin") {
          setConnected(false);
          setIsPromptForPin(true);
        }

        //  if (!connected && data.event === "invalid_pin") {
        // }
      } catch (error) {
        setMessage(event.data);
      }
    };

    return () => {
      ws.close();
    };
  }, [roomId, token]);

  return { message, connected, isPromptForPin };
}
