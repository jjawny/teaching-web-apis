import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { create } from "zustand";

export type User = Session["user"];
export type UserStatus = NonNullable<ReturnType<typeof useSession>["status"]>;

/**
 * BUNDLES/encapsulates/centralizes all context for the current user.
 * This minimizes the dependency on NextAuth (useSession called once in <UserCtxProvider>, rest of codebase uses `userCtx`).
 * This allows for easy refactoring/smaller blast radius of code changes if we switch auth packages (BetterAuth?).
 * Name still adheres to hook naming convention (starts with 'use').
 * Why not store the custom JWT here? this is short-lived and frequently refetched, just use RQ cache.
 */
type UserCtx = {
  user?: User;
  userStatus: UserStatus;
  setUser: (user?: User) => void;
  setUserStatus: (status: UserStatus) => void;
  getDebugDump: () => object;
};

export const userCtx = create<UserCtx>((set, get) => ({
  user: undefined,
  userStatus: "unauthenticated",
  setUser: (user?: User) => {
    set({ user: user });
  },
  setUserStatus: (status: UserStatus) => {
    set({ userStatus: status });
  },
  getDebugDump: () => {
    const state = get();
    return Object.fromEntries(Object.entries(state).filter(([_, v]) => typeof v !== "function"));
  },
}));
