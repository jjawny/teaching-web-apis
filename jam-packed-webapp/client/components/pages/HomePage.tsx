import Hero from "~/client/components/Hero";
import MainContent from "~/client/components/MainContent";
import WsCard from "~/client/components/ws-card/WsCard";
import { cn } from "~/client/utils/cn";

export default function HomePage() {
  return (
    <div className={cn("grid min-h-screen place-content-center", "font-sans")}>
      <main className="flex flex-col items-center gap-[21px]">
        <Hero />
        <MainContent />
        <WsCard />
      </main>
    </div>
  );
}
