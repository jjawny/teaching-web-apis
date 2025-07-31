import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { create } from "zustand";

export type User = Session["user"];
export type SessionStatus = NonNullable<ReturnType<typeof useSession>["status"]>;

type UserCtx = {
  user?: User;
  authStatus: SessionStatus;
  setUser: (user?: User) => void;
  setAuthStatus: (userStatus: SessionStatus) => void;
};

/**
 * - Special Zustand store that centralizes the context for the current user
 * - Why not use NextAuth's session? the goal is to be more dev-friendly + encapsulate
 *   more properties into a 'user' object
 * - Reminder: this Zustand stores become singletons upon first access
 * - Why not use a React Context? We use a React Context Provider to init the store,
 *   and use a Zustand store to avoid frequent changes causing entire vDOM tree to re-render,
 *   the Provider will still re-render the entire tree on sign in/out
 * - Name still adheres to hook naming convention (starts with 'use')
 */
export const userCtx = create<UserCtx>((set, get) => ({
  user: undefined,
  authStatus: "unauthenticated",
  setUser: (user?: User) => {
    set({ user: user });
  },
  setAuthStatus: (userStatus: SessionStatus) => {
    set({ authStatus: userStatus });
  },
}));
