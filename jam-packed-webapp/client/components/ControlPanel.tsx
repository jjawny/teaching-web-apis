"use client";

import { useEffect, useState } from "react";
import { useJoinWsRoom } from "~/client/hooks/useJoinWsRoom";
import MainTextField from "./main-text-field/MainTextField";
import TimelineBar from "./TimelineBar";
import WsCard from "./ws-card/WsCard";

export default function ControlPanel() {
  const [token, setToken] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  const { isPromptForPin, rejoinWithPin } = useJoinWsRoom(roomId, token); // No need to pass pin anymore
  const [messagesExpanded, setMessagesExpanded] = useState(false);

  // Fetch NextAuth JWT from API route on first mount
  useEffect(() => {
    // TODO: move this and setstte into other usequery hooks that require it
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

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center">
      <TimelineBar className="mb-4" />
      <MainTextField
        isPromptForPin={isPromptForPin}
        rejoinWithPin={rejoinWithPin}
        token={token}
        roomId={roomId}
      />

      <WsCard messagesExpanded={messagesExpanded} setMessagesExpanded={setMessagesExpanded} />
    </div>
  );
}
