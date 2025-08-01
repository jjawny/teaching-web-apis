import { create } from "zustand";

type WsCtx = {
  isConnected: boolean;
  setIsConnected: (isConnected: boolean) => void;
};

export const useWsCtx = create<WsCtx>((set, get) => ({
  isConnected: false,
  setIsConnected: (isConnected: boolean) => {
    set({ isConnected });
  },
}));
