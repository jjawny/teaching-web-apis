import LikeButton from "../SlidingCounter";

export default function EventsContainer({
  eventLog,
  eventLogExpanded,
}: {
  eventLog: any[];
  eventLogExpanded: boolean;
}) {
  return (
    <div className="relative min-h-[100px] flex-1 space-y-3 pt-8">
      <EventsContainerHeader eventsCount={eventLog.length} />
      <div
        className="bg-transparent transition-all duration-500 ease-in-out"
        style={{
          height: eventLogExpanded ? 120 : 48,
          overflow: "hidden",
        }}
      >
        <div className="relative h-full">
          <ul
            className="ml-2 list-none pr-2 font-mono text-[1.15rem] text-gray-700/80"
            style={{
              maxHeight: eventLogExpanded ? 120 : 48,
              overflowY: "auto",
              position: "relative",
              zIndex: 1,
              paddingTop: 10,
              paddingBottom: eventLogExpanded ? 30 : 0,
              opacity: 0.85,
            }}
          >
            {/* TODO: use an eventID as the key */}
            {eventLog.length === 0 && <li className="text-gray-400">No events yet</li>}
            {eventLog.map((evt, i) => (
              <Event key={i} evt={evt} i={i} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function EventsContainerHeader({ eventsCount }: { eventsCount: number }) {
  return (
    <h2 className="absolute top-0 z-[99999] font-mono text-2xl font-bold tracking-tight whitespace-nowrap text-black/90">
      <LikeButton count={eventsCount} />
      WebSocket message
      {eventsCount === 1 ? "" : "s"}
    </h2>
  );
}

function Event({ className, evt, i }: { className?: string; evt: any; i: number }) {
  return (
    <li key={i} className="mb-1">
      <span className="font-bold text-blue-500">[{evt.event}]</span>{" "}
      {evt.details && <span className="text-blue-300">{evt.details}</span>}
    </li>
  );
}
