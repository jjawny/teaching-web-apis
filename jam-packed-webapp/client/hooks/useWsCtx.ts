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
  // Statuses
  wsReadyState: WebSocket["readyState"]; // CONNECTING, OPEN, CLOSING, CLOSED
  isJoiningRoom: boolean;
  isPendingPinFromUser: boolean;
  hasJoinedRoom: boolean;
  isAttemptingToConnect: boolean;
  // Room
  roomId?: string;
  roomName?: string;
  roomPin?: string; // TODO: save and load from local storage for re-auto-joins
  // Messages
  messages: WsMessage[];
  // Errors
  pinError?: string;
  wsError?: string;
  // Actions
  setIsAttemptingToConnect: (isAttempting: boolean) => void;
  setRoomPin: (pin: string) => void;
  setRoomPinError: (pinError?: string) => void;
  setWsError: (wsError?: string) => void;
  setWsReadyState: (readyState: WebSocket["readyState"]) => void;
  setRoomId: (roomId: string) => void;
  setIsJoiningRoom: (isJoining: boolean) => void;
  setIsPendingPinFromUser: (isPending: boolean) => void;
  addMessage: (message: WsMessage) => void;
  joinedRoom: (roomId: string, roomName: string, pin?: string) => void;
  leftRoom: () => void;
  getDebugDump: () => object;
};

export const useWsCtx = create<WsCtx>((set, get) => ({
  wsReadyState: WebSocket.CLOSED,
  isJoiningRoom: false,
  isPendingPinFromUser: false,
  isAttemptingToConnect: false,
  hasJoinedRoom: false,
  // For this demo, simply create a random new room
  // In a real app, we'd let the user choose/control their rooms
  roomId: "123",
  roomName: "Johnny's room",
  roomPin: undefined,
  messages: [],
  pinError: undefined,
  wsError: undefined,
  setIsAttemptingToConnect: (isAttemptingToConnect) => set({ isAttemptingToConnect }),
  setRoomPin: (pin: string) => set({ roomPin: pin }),
  setRoomPinError: (error) => set({ pinError: error }),
  setWsReadyState: (readyState) => set({ wsReadyState: readyState }),
  setWsError: (error) => set({ wsError: error }),
  setRoomId: (roomId) => set({ roomId }),
  setIsJoiningRoom: (isJoining) => set({ isJoiningRoom: isJoining }),
  setIsPendingPinFromUser: (isPending) => set({ isPendingPinFromUser: isPending }),
  addMessage: (message) => set((state) => ({ messages: [...(state.messages ?? []), message] })),
  joinedRoom: (roomId, roomName, pin) => {
    console.debug("joining room", roomId);
    const isRejoining = get().roomId === roomId;

    set((state) => ({
      hasJoinedRoom: true,
      roomId,
      roomName,
      roomPin: pin !== undefined ? pin : state.roomPin, // Keep existing PIN if none provided
      wsError: undefined,
      messages: isRejoining ? state.messages : [],
    }));
  },
  leftRoom: () => {
    console.debug("leaving room", get().roomId);
    set({
      hasJoinedRoom: false,
      // roomId: undefined,
      // roomName: undefined,
      // roomPin: undefined,
      messages: [],
    });
  },
  getDebugDump: () => {
    const state = get();
    return Object.fromEntries(Object.entries(state).filter(([_, v]) => typeof v !== "function"));
  },
}));
