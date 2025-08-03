"use client";

import { useState } from "react";
import Hero from "~/client/components/Hero";
import TimelineBar from "~/client/components/TimelineBar";
import MainTextField from "~/client/components/main-text-field/MainTextField";
import WsCard from "~/client/components/ws-card/WsCard";
import { useJoinWsRoom } from "~/client/hooks/useJoinWsRoom";
import { cn } from "~/client/utils/cn";

export default function HomePage() {
  const { reConnectAndJoinWithPin } = useJoinWsRoom(true);
  const [messagesExpanded, setMessagesExpanded] = useState(false);

  return (
    <div className={cn("grid min-h-screen place-content-center", "font-sans")}>
      <main className="flex flex-col items-center gap-[21px]">
        <Hero />
        <TimelineBar />
        <MainTextField reConnectAndJoinWithPin={reConnectAndJoinWithPin} />
        <WsCard messagesExpanded={messagesExpanded} setMessagesExpanded={setMessagesExpanded} />
      </main>
    </div>
  );
}
