import { create } from "zustand";
import { Tick } from "~/client/models/tick";

/**
 * - Global access to easily add ticks to a timeline
 * - What about IDs? Ticks are immutable, so we can use a simpler counter
 *   (simple is better, and we can confirm this is a safe scenario)
 * - What about race conditions? Zustand's concurrency model is atomic:
 *   `set` calls are synchronous (because the event loop is single-threaded)
 *   so the latest ID is guaranteed as we always read the current state inside of
 *   `set` (closure), rather than declaring it outside the fn (may becomes stale)
 * - No mutexes or semaphores needed
 * - Issues would arise if captured `nextId` outside of `set` did some async work,
 *   then call `set` incrementing w the stale value variable, which might've changed
 *   during our async work (giving another fn call a chance to update during that time)
 */
type TimelineCtx = {
  ticks: Tick[];
  nextId: number;
  addTick: (type?: Tick["type"]) => void;
};

export const useTimelineCtx = create<TimelineCtx>((set, get) => ({
  ticks: [],
  nextId: 0,
  addTick: (type?: Tick["type"]) => {
    set((state) => {
      const tick: Tick = {
        id: state.nextId,
        timestamp: Date.now(),
        type: type ?? "basic",
      };
      return {
        ticks: [...state.ticks, tick],
        nextId: state.nextId + 1,
      };
    });
  },
}));
