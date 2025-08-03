"use client";

import { ModifierKey } from "~/client/enums/modifier-key";
import { useKeyboardShortcuts } from "~/client/hooks/useKeyboardShortcuts";
import { useWsCtx } from "~/client/hooks/useWsCtx";
import { userCtx } from "~/client/modules/user-context";

export default function Debug() {
  const getWsCtxDump = useWsCtx((state) => state.getDebugDump);
  const getUserCtxDump = userCtx((state) => state.getDebugDump);

  const logJson = () => {
    console.debug("WsCtx:", getWsCtxDump());
    console.debug("UserCtx:", getUserCtxDump());
  };

  useKeyboardShortcuts([{ keys: [ModifierKey.CONTROL, "1"], callback: logJson }]);

  return null;
}
