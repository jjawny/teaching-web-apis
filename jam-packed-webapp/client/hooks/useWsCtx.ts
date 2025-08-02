import { create } from "zustand";
import { WsMessage } from "~/client/models/ws-message";

/**
 *  - Represents the state of the user's (client) connection to the WebSocket hub
 *  - ReadyState is set by WebSocket events (CONNECTING, OPEN, CLOSING, CLOSED)
 *  - Rooms are an application-level concept, where the hub can broadcasts a messages
 *    scoped to all users for a given room
 *  - The PIN is used to auto-rejoin a room
 *  - This store is primarily used by the `useJoinWsRoom` hook, which contains the business logic
 *  - Meanwhile, other components subscribe mostly to read values
 */
type WsCtx = {
  wsReadyState: WebSocket["readyState"];
  hasJoinedRoom: boolean;
  roomId?: string;
  roomName?: string;
  pin?: string; // for quick re-auto-joins TODO: in local storage
  messages: WsMessage[];
  error?: string;
  addMessage: (message: WsMessage) => void;
  setError: (error?: string) => void;
  setWsReadyState: (readyState: WebSocket["readyState"]) => void;
  setPin: (pin: string) => void;
  joinRoom: (roomId: string, roomName: string, pin?: string) => void;
  leaveRoom: () => void;
};

export const useWsCtx = create<WsCtx>((set, get) => ({
  wsReadyState: WebSocket.CLOSED,
  hasJoinedRoom: false,
  roomId: undefined,
  roomName: undefined,
  pin: undefined,
  error: undefined,
  messages: [],
  addMessage: (message: WsMessage) => {
    set((state) => ({ messages: [...(state.messages ?? []), message] }));
  },
  setWsReadyState: (readyState: WebSocket["readyState"]) => {
    set({ wsReadyState: readyState });
  },
  setError: (error?: string) => {
    set({ error: error });
  },
  setPin: (pin: string) => {
    set({ pin: pin });
  },
  joinRoom: (roomId, roomName, pin) => {
    console.debug("joining room", roomId);
    const isRejoining = get().roomId === roomId;

    set((state) => ({
      hasJoinedRoom: true,
      roomId,
      roomName,
      pin: pin !== undefined ? pin : state.pin, // Keep existing PIN if none provided
      error: undefined,
      messages: isRejoining ? state.messages : [],
    }));
  },
  leaveRoom: () => {
    console.debug("leaving room", get().roomId);
    set({
      hasJoinedRoom: false,
      roomId: undefined,
      roomName: undefined,
      pin: undefined,
      messages: [],
    });
  },
}));
